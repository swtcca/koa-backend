import * as koa from 'koa';
import * as joi from 'joi';
import { KJSRouter, } from './decorators';
import { swaggerConfig } from './utils/config';
import { UserSchema, AdminSchema } from "./definitions";
import { UserController } from './controllers/ctrl.user';
import { AdminController } from './controllers/ctrl.admin';

import { toSchema, toSwagger, toJoi } from "./decorators/ischema";

const router = new KJSRouter(swaggerConfig);

router.loadDefinition(UserSchema);
router.loadDefinition(AdminSchema);
router.loadController(UserController);
router.loadController(AdminController);

// 获取swagger配置
router.setSwaggerFile('swagger.json');
// 拉起swagger的路径
router.loadSwaggerUI('/docs');

const app = new koa();

app.use(router.getRouter().routes());

app.use(router.getRouter().allowedMethods());

console.log(toSwagger(joi.object().keys({
  test: joi.string().min(2).description('userId').required()
})));

console.log(toJoi(toSchema(UserSchema)));

app.listen(3002, () => {
  console.log(`app is listening on port: 3002`);
});