import {
  get,
  tag,
  post,
  summary,
  parameter,
  controller,
  ENUM_PARAM_IN
} from "../decorators";
import * as joi from 'joi';
import { User } from '../entity/User';

@controller('/example')
export default class ExampleController {

  /**
   * 模拟错误响应
   */
  @post('/error')
  @parameter('bodyParams', joi.object().keys({
    a: joi.number().required(),
    b: joi.string()
  }), ENUM_PARAM_IN.body)
  @tag('例子')
  @summary('错误实例')
  async fakeError() {
    throw new Error('闹着玩');
  }

  @get('/detail/{userId}')
  @parameter('userId', joi.string().description('userId').required(), ENUM_PARAM_IN.path)
  // @parameter('bina', joi.string().description('bina').required(), ENUM_PARAM_IN.query)
  // @response(200, { $ref: UserSchema })
  @tag('例子')
  @summary('参数实例')
  async getUser(ctx) {
    return ctx.$getParams();
  }

  @get('s')
  @tag('例子')
  // @response(200, { type: 'array', items: { $ref: UserSchema } })
  @summary('返回列表')
  async getUsers(ctx) {
    // const cas = await User.findAndCount();
    // return {
    //   count: cas[1],
    //   rows: cas[0]
    // };
    const users = await ctx.manager.find(User, { select: ['name', 'id', 'createdAt'] });
    return users;
  }

}