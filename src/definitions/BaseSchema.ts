import * as joi from 'joi';
import { definition } from "../decorators";

@definition('Base', 'Base Entity')
export default class BaseSchema {
  id = joi.number().integer().description('主键')
  createdAt = joi.date().description('创建时间')
  updatedAt = joi.date().description('更新时间')
}