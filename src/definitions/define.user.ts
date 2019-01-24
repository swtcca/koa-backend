import * as joi from 'joi';
import { definition } from "../decorators";

@definition('Admin', 'Admin Entity')
export class AdminSchema {
  userName = joi.string().required().min(6).uppercase();
  userPass = joi.string();
  // render = () => {

  // }
}
export default AdminSchema;