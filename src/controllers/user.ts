import { 
  tag, 
  post, 
  summary, 
  parameter, 
  controller, 
  ENUM_PARAM_IN, 
  login_required, 
} from "../decorators";
import * as joi from 'joi';
import * as jwt from "jsonwebtoken";
import { User } from '../entity/User';
import { IContext } from '../decorators/interface';
import { AppKey } from '../utils/config';

@controller('/user')
export default class TestController {

  /**
   * 用户登录
   */
  @post('/login')
  @parameter('category', joi.object().keys({
    name: joi.string().required(),
    password: joi.string().required(),
  }), ENUM_PARAM_IN.body)
  @tag('用户管理')
  @summary('用户登录')
  async testAdd(ctx: IContext) {
    const { name, password }: User = ctx.$getParams();
    const user: User = await User.findOne({ name });
    if (!user || user.password !== password) {
      throw new Error('用户名密码不匹配');
    }
    const token = jwt.sign({
      data: user.id
    }, AppKey, { expiresIn: 60 * 60 });
    ctx.cookies.set('token', token);
    return {
      token,
      user
    };
  }

  /**
   * 新增用户
   */
  @post('/add')
  @tag('用户管理')
  @parameter('category', joi.object().keys({
    name: joi.string().required(),
    password: joi.string().required(),
  }), ENUM_PARAM_IN.body)
  @summary('添加管理员')
  @login_required()
  async testQuery(ctx: IContext) {
    const userInfo: User = ctx.$getParams();
    const lastUser = await User.findOne({ name: userInfo.name });
    if (lastUser) {
      throw new Error('用户已存在');
    }
    const user = new User(userInfo);
    await ctx.manager.save(user);
    return user;
  }

}