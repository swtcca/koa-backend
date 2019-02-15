import "reflect-metadata";
import * as koa from 'koa';
import * as koaBody from 'koa-body';
import { KJSRouter, } from './decorators';
import { createConnection } from "typeorm";
import { logFunc } from "./utils/middlewares";
import { swaggerConfig, bodyParserConfig, AppConfig } from './utils/config';

const main = async () => {

  // typeorm连接初始化
  await createConnection();

  const app = new koa();

  // bodyparser
  // 解析post参数
  // 处理文件上传
  app.use(koaBody(bodyParserConfig));

  // 每次请求打印请求记录
  // 为ctx添加$getParams方法
  app.use(logFunc);

  // 路由处理
  // 自动扫描路由
  // 扫描deinition
  const router = new KJSRouter(swaggerConfig);

  router.initApp(app);

  app.listen(AppConfig.port, () => {
    console.log(`app is listening on port: ${AppConfig.port}`);
  });
}

main();