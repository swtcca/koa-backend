import * as joi from 'joi';
import { get } from 'lodash';
import { File } from '../entity/File';
import {controller, post, tag, summary, parameter} from "../decorators";

@controller('/public')
export default class PublicController {

  /**
   * 文件上传
   */
  @post('/upload')
  @tag('文件上传')
  @summary('文件上传')
  @parameter('file', joi.any().meta({ swaggerType: 'file' }).description('文件'))
  async fileUpload(ctx) {
    const file = get(ctx, 'request.files.file');
    if (!file) throw new Error('文件为空');
    const fileObject = new File();
    fileObject.name = file.name;
    fileObject.url = '1234455667';
    await ctx.manager.save(fileObject);
    return fileObject;
  }

}