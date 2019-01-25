import * as joi from 'joi';
import { definition } from "../decorators";

@definition('Admin', 'Admin Entity')
export default class AdminSchema {
  userName = joi.string().required().min(6).uppercase();
  userPass = joi.string();
  // render = () => {

  // }
}