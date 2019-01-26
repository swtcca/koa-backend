import "reflect-metadata";
import * as koa from 'koa';
import * as path from 'path';
import * as koaBody from 'koa-body';
import { createConnection } from "typeorm";
import { KJSRouter, } from './decorators';
import { swaggerConfig } from './utils/config';

const main = async () => {

  await createConnection();

  const app = new koa();

  app.use(koaBody({
    multipart: true, // 支持文件上传
    encoding: 'gzip',
    formidable: {
      uploadDir: path.join(__dirname, 'upload/'), // 设置文件上传目录
      keepExtensions: true,    // 保持文件的后缀
      maxFieldsSize: 2 * 1024 * 1024, // 文件上传大小
      onFileBegin: (name, file) => { // 文件上传前的设置
        console.log(`name: ${name}`);
        console.log(file);
      },
    }
  }));

  const router = new KJSRouter(swaggerConfig);

  router.initApp(app);

  app.listen(3002, () => {
    console.log(`app is listening on port: 3002`);
  });
}

main();