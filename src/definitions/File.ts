import * as joi from 'joi';
import { definition } from "../decorators";
import BaseSchema from './BaseSchema';

@definition('File', 'File Entity')
export default class FileSchema extends BaseSchema {
  name = joi.string().description('文件名称')
  url = joi.string().description('文件路径')
}