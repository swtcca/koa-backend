import * as joi from 'joi';
import * as decorators from "../decorators";

@decorators.controller('/admin')
export class AdminController {

  @decorators.post('/login')
  @decorators.parameter('name', joi.string().description('name'))
  @decorators.parameter('list', joi.object().keys({
    a: joi.number().required(),
    b: joi.string()
  }), decorators.ENUM_PARAM_IN.body)
  @decorators.summary('AdminController.index')
  // @decorators.response(200, { $ref: AdminSchema })
  // @decorators.response(202, joi.string().description('aaa'))
  @decorators.tag('Admin')
  index() {
    return 'hello';
  }
}