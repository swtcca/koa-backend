import { IContext } from './../decorators/index';
import { ENUM_PARAM_IN } from './../decorators/parameter';
import { File } from '../entity/File';
import { User } from '../entity/User';
import * as joi from 'joi';
import { get } from 'lodash';
import * as decorators from "../decorators";

@decorators.controller('/test')
export default class TestController {

  /**
   * 测试新增
   */
  @decorators.post('/add')
  @decorators.parameter('category', joi.object().keys({
    name: joi.string().required(),
    password: joi.string().required(),
  }), decorators.ENUM_PARAM_IN.body)
  @decorators.tag('测试')
  @decorators.summary('测试新增')
  async testAdd(ctx: IContext) {
    const { name, password }: User = ctx.$getParams();
    const user = new User();
    user.name = name;
    user.password = password;
    await ctx.manager.save(user);
    return user;
  }

  /**
   * 查询
   */
  @decorators.get('/query')
  @decorators.tag('测试')
  @decorators.summary('测试查询')
  async testQuery(ctx) {
    return await ctx.manager.count(User);
  }

  /**
   * 文件上传
   */
  @decorators.post('/upload')
  @decorators.tag('测试')
  @decorators.summary('文件上传')
  @decorators.parameter('file', joi.any().meta({ swaggerType: 'file' }).description('json file'))
  async fileUpload(ctx) {
    const file = get(ctx, 'request.files.file');
    if(file && file.name){
      const fileObject = new File();
      fileObject.name = file.name;
      await ctx.manager.save(fileObject);
    }
    return file;
  }

}