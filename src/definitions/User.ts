import * as joi from 'joi';
import { definition } from "../decorators";
import BaseSchema from './BaseSchema';
import FileSchema from './File';

@definition('User', 'User Entity')
export default class UserSchema extends BaseSchema {
  name = joi.string().description('用户姓名')
  userIcon = {desc: '头像', $ref: FileSchema}
}