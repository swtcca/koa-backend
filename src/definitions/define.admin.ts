import * as joi from 'joi';
import { definition } from "../decorators";

@definition('User', 'User Entity')
export default class UserSchema {
  userName = joi.string().description('username').required();
  userPass = joi.string().description('password');
}