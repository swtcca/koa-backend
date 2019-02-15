import {
  tag,
  get,
  post,
  summary,
  parameter,
  controller,
  ENUM_PARAM_IN,
  login_required,
  response,
} from "../decorators";
import * as joi from 'joi';
import { Like } from "typeorm";
import * as omit from 'omit.js';
import * as jwt from "jsonwebtoken";
import { User } from '../entity/User';
import { AppConfig } from '../utils/config';
import UserSchema from "../definitions/User";
import { IContext } from '../decorators/interface';

@controller('/user')
export default class TestController {

  /**
   * 用户登录
   */
  @post('/login')
  @parameter(
    'body', 
    joi.object().keys({
      name: joi.string().required().description('用户名'),
      password: joi.string().required().description('密码'),
    }), ENUM_PARAM_IN.body
  )
  @tag('用户管理')
  @summary('用户登录')
  @response(200, {
    user: { $ref: UserSchema, desc: '用户信息' },
    token: joi.string().description('token, 需要每次在请求头或者cookie中带上'),
  })
  async login(ctx: IContext) {
    const { name, password }: User = ctx.$getParams();
    const user: User = await User.findOne({ name });
    if (!user || user.password !== password) {
      throw new Error('用户名密码不匹配');
    }
    const token = jwt.sign({
      data: user.id
    }, AppConfig.appKey, { expiresIn: 60 * 60 });
    ctx.cookies.set('token', token);
    return {
      token,
      user: omit(user, ['password'])
    };
  }

  /**
   * 新增用户
   */
  @post('/add')
  @tag('用户管理')
  @parameter(
    'body', 
    joi.object().keys({
      name: joi.string().required().description('用户名'),
      password: joi.string().required().description('密码'),
    }), ENUM_PARAM_IN.body
  )
  @summary('添加管理员')
  @login_required()
  @response(200, { $ref: UserSchema })
  async addUser(ctx: IContext) {
    const userInfo: User = ctx.$getParams();
    const lastUser = await User.findOne({ name: userInfo.name });
    if (lastUser) {
      throw new Error('用户已存在');
    }
    const user = new User(userInfo);
    await ctx.manager.save(user);
    return omit(user, ['password']);
  }

  @get('s')
  @tag('用户管理')
  @summary('分页查询用户')
  @parameter('search', joi.string().description('搜索关键字').default(''))
  @parameter('order_by', joi.string().description('排序字段').default('createdAt'))
  @parameter('size', joi.number().integer().min(0).max(100).description('每页多少条').default(15))
  @parameter('page', joi.number().integer().min(0).description('分页页数, 从0开始, 默认0').default(0))
  @parameter('order_func', joi.string().valid(['ASC', 'DESC']).description('排序方法').default('ASC'))
  @response(200, {
    total: joi.number().integer().description('总条数'),
    page: joi.number().integer().description('当前页码'),
    size: joi.number().integer().description('每页条数'),
    users: { type: 'array', $ref: UserSchema, desc: '用户列表' },
  })
  @login_required()
  async queryUsers(ctx: IContext) {
    const {
      page,
      size,
      order_by,
      order_func,
      search
    } = ctx.$getParams();
    const users = await User.find({
      select: ['id', 'name', 'createdAt'],
      skip: page * size,
      take: size,
      order: {
        [order_by]: order_func
      },
      where: {
        name: Like(`%${search}%`)
      },
      relations: ['userIcon']
    });

    const total = await User.count();
    return {
      users,
      total,
      page,
      size
    };
  }
}