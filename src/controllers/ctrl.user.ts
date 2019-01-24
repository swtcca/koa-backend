import * as joi from 'joi';
import { ParameterizedContext } from "koa";
import * as decorators from "../decorators";
import { UserSchema } from "../definitions";

@decorators.controller('/user')
export class UserController {

  @decorators.del('/{userId}')
  @decorators.parameter('userId', joi.string().min(2).description('userId'), decorators.ENUM_PARAM_IN.path)
  index() {

  }

  @decorators.get('/{userId}')
  @decorators.parameter('userId', joi.number().min(2).description('userId').required(), decorators.ENUM_PARAM_IN.path)
  @decorators.response(200, { $ref: UserSchema })
  async getUser(ctx: ParameterizedContext) {
    ctx.body = { userName: ctx.params.userId.toString(), userPass: Date.now().toString() };
    // ctx.throw(500, 'server error');
  }

  @decorators.post('/')
  doPost() {
  }

  @decorators.get('s')
  @decorators.response(200, { type: 'array', items: { $ref: UserSchema } })
  getUsers() {
  }
}