import { log4jsConfig, isDebug } from './../utils/config';
import { TAG_CONTROLLER } from "./controller";
import { TAG_METHOD } from "./method";
import { TAG_MIDDLE_METHOD, TAG_GLOBAL_METHOD, TAG_MIDDLE_WARE } from "./utils";
import { TAG_DEFINITION_NAME } from "./definition";
import * as fs from 'fs';
import * as path from 'path';
import * as _ from "lodash";
import * as Router from "koa-router";
import * as log4js from 'log4js';
import { Context } from 'koa';
import { getConnection } from "typeorm";
import { EntityManager } from "typeorm";

const koaSwagger = require("koa2-swagger-ui");

export * from "./controller";

export * from "./definition";

export * from "./description";

export * from "./ischema";

export * from "./method";

export * from "./parameter";

export * from "./response";

export * from "./summary";

export * from "./tag";

export interface ISwagger {
  swagger: string;
  info: {
    description?: string;
    version: string;
    title: string;
    termsOfService?: string;
    concat?: {
      email: string;
    };
    license?: {
      name: string;
      url: string;
    }
  };
  host?: string;
  basePath?: string;
  tags?: {
    name: string;
    description?: string;
    externalDocs?: {
      description: string;
      url: string;
    }
  }[];
  schemes: string[];
  paths: {};
  definitions: {};
}

export interface IPath {
  tags: string[];
  summary: string;
  description: string;
  operationId: string;
  consumes: string[];
  produces: string[];
  parameters?: any[];
  responses: any;
  security: any[];
}

export const DEFAULT_SWAGGER: ISwagger = {
  swagger: "2.0",
  info: {
    version: "1.0.0",
    title: "Koa-Joi-Swagger-TS server"
  },
  host: "localhost:3002",
  basePath: "/v1/api",
  schemes: ["http"],
  paths: {},
  definitions: {}
};

export const DEFAULT_PATH: IPath = {
  tags: [],
  summary: "",
  description: "",
  operationId: undefined,
  consumes: ["application/json"],
  produces: ["application/json"],
  responses: { "200": { description: "Success" } },
  security: []
};

interface IGetParams {
  (): any;
}

interface ICustomContextProps {
  $getParams: IGetParams,
  manager: EntityManager
}

export type IContext = ICustomContextProps & IGetParams & Context

log4js.configure(log4jsConfig);

const logger = log4js.getLogger('cheese');

export class KJSRouter {

  swagger: ISwagger;

  router: Router = new Router();

  swaggerFileName: string;

  constructor(swagger: ISwagger = DEFAULT_SWAGGER) {
    this.swagger = swagger;
  }

  loadController(Controller) {
    if (Controller[TAG_CONTROLLER]) {
      const allMethods = Controller[TAG_METHOD] || new Map();
      const paths = [...allMethods.keys()];
      const middleMethods = Controller[TAG_MIDDLE_METHOD] || new Map();
      const middleWares = Controller[TAG_MIDDLE_WARE] || new Map();
      paths.forEach((path) => {
        const temp = {};
        const fullPath = (Controller[TAG_CONTROLLER] + path).replace(this.swagger.basePath, "");
        const methods = allMethods.get(path);
        for (let [k, v] of methods) {
          let router = _.cloneDeep(DEFAULT_PATH);
          const methods = middleMethods.get(v.key);
          const wares = middleWares.has(v.key) ? [...middleWares.get(v.key)] : [];
          if (methods) {
            for (let i = 0, len = methods.length; i < len; i++) {
              methods[i](router, this.swagger);
            }
          }
          temp[k] = router;
          if (this.router[k]) {
            const accessUrl = (Controller[TAG_CONTROLLER] + path).replace(/{(\w+)}/g, ":$1");
            this.router[k](accessUrl, ...(wares.concat(async (ctx: IContext, ...args) => {
              try {
                let result;
                // 创建连接并开始一个事务
                await getConnection().transaction(async manager => {
                  result = await v.handle(Object.assign(ctx, { manager }), ...args);
                });
                // 如果无返回值, 
                if (result !== undefined) {
                  ctx.body = result;
                }
                // 并且返回body为空, 报错
                if (ctx.body === undefined) {
                  ctx.throw(500, '无返回值');
                }
              } catch (error) {
                console.log(error);
                logger.error(accessUrl, ctx.$getParams());
                logger.error(error.stack);
                ctx.status = 500;
                ctx.body = {
                  code: error.statusCode || error.status || 500,
                  message: isDebug ? error.message : '出错了'
                }
              }
            })));
          }
        }
        this.swagger.paths[fullPath] = temp;
      });
    }
  }

  loadDefinition(Definition) {
    if (Definition[TAG_DEFINITION_NAME]) {
      const globalMethods = Definition[TAG_GLOBAL_METHOD] || [];
      globalMethods.forEach((deal) => {
        deal(this.swagger);
      })
    }
  }

  setSwaggerFile(fileName: string) {
    this.swaggerFileName = this.swagger.basePath + "/" + fileName;
    this.router.get(this.swaggerFileName, (ctx, next) => {
      ctx.body = JSON.stringify(this.swagger)
    });
  }

  loadSwaggerUI(url: string) {
    this.router.get(url, koaSwagger({
      routePrefix: false,
      swaggerOptions: {
        url: this.swagger.schemes[0] + "://" + this.swagger.host + this.swaggerFileName,
      }
    }));
  }

  getRouter() {
    return this.router;
  }

  /**
   *根据目录递归查找目录下面的文件
   * @param path string 
   * @return fileList array[string]
   */
  getFiles = (path) => {
    let fileList = [];
    const findPathFunc = (basePath) => {
      const files = fs.readdirSync(basePath);
      files.forEach((file) => {
        const filePath = `${basePath}/${file}`;
        // js 文件
        if (fs.statSync(filePath).isFile()) {
          if (file.endsWith('.ts')) {
            fileList.push(filePath);
          }
        } else {
          findPathFunc(filePath);
        }
      })
    };
    findPathFunc(path);
    return fileList;
  }

  /**
   * 加载controller
   * @param path [string] 路径
   */
  loadControllers = async path => {
    for (const file of this.getFiles(path)) {
      const controller = await import(file);
      if (!controller || !controller.default) {
        return;
      }
      this.loadController(controller.default);
    }
  }

  /**
   * 加载schema配置
   * @param path [string] 路径
   */
  loadDefinitions = async path => {
    for (const file of this.getFiles(path)) {
      const definition = await import(file);
      if (!definition || !definition.default) {
        return;
      }
      this.loadDefinition(definition.default);
    }
  }

  /**
   *初始化app
   */
  initApp(app) {
    // 获取swagger配置
    this.setSwaggerFile('swagger.json');
    // 拉起swagger的路径
    this.loadSwaggerUI('/docs');

    this.loadControllers(
      path.resolve(__dirname, '../controllers')
    );
    this.loadDefinitions(
      path.resolve(__dirname, '../definitions')
    );

    app.use(this.getRouter().routes());
    app.use(this.getRouter().allowedMethods());
  }

}
