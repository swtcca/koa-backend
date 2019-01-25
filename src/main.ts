import "reflect-metadata";
import * as koa from 'koa';
import * as bodyParser from "koa-bodyparser";
import { createConnection } from "typeorm";
import { KJSRouter, } from './decorators';
import { swaggerConfig } from './utils/config';

const main = async () => {

  await createConnection();

  const app = new koa();

  app.use(bodyParser());

  const router = new KJSRouter(swaggerConfig);

  router.initApp(app);

  app.listen(3002, () => {
    console.log(`app is listening on port: 3002`);
  });
}

main();