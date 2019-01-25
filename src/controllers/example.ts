import * as joi from 'joi';
import * as decorators from "../decorators";
import UserSchema from "../definitions/define.user";
import {Category} from '../entity/Category';

@decorators.controller('/example')
export default class ExampleController {

  @decorators.post('/error')
  @decorators.parameter('bodyParams', joi.object().keys({
    a: joi.number().required(),
    b: joi.string()
  }), decorators.ENUM_PARAM_IN.body)
  @decorators.tag('例子')
  @decorators.summary('错误实例')
  async fakeError() {
    throw new Error('闹着玩');
  }

  @decorators.get('/{userId}')
  @decorators.parameter('userId', joi.string().description('userId').required(), decorators.ENUM_PARAM_IN.path)
  @decorators.parameter('bina', joi.string().description('bina').required(), decorators.ENUM_PARAM_IN.query)
  @decorators.response(200, { $ref: UserSchema })
  @decorators.tag('例子')
  @decorators.summary('参数实例')
  async getUser(ctx) {
    return ctx.$getParams();
  }

  @decorators.get('s')
  @decorators.tag('例子')
  // @decorators.response(200, { type: 'array', items: { $ref: UserSchema } })
  @decorators.summary('返回列表')
  async getUsers() {
    const cas = await Category.findAndCount();
    return {
      count: cas[1],
      rows: cas[0]
    };
  }
  

  @decorators.post('/login')
  @decorators.parameter('list', joi.object().keys({
    a: joi.number().required(),
    b: joi.string()
  }), decorators.ENUM_PARAM_IN.body)
  @decorators.tag('例子')
  @decorators.summary('post请求体')
  index(ctx) {
    ctx.body = ctx.$getParams();
  }
}