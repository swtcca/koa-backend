import { getConnection } from "typeorm";
import { isDebug, log4jsConfig } from "./config";
import * as log4js from 'log4js';
import { IContext } from "../decorators/interface";

log4js.configure(log4jsConfig);

const logger = log4js.getLogger('cheese');

// 日志相关
export const logFunc = async (ctx, next) => {
  console.log(ctx.request.url);
  ctx.$getParams = () => {
    return Object.assign(ctx.params, ctx.request.body, ctx.request.query);
  }
  await next();
}

// handleer劫持, 日志处理, 事务处理等
export const RequestInject = (url, handler) => {
  return async (ctx: IContext, ...args) => {
    try {
      let result;
      // 创建连接并开始一个事务
      await getConnection().transaction(async manager => {
        result = await handler(Object.assign(ctx, { manager }), ...args);
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
      logger.error(url, ctx.$getParams());
      logger.error(error.stack);
      ctx.status = 500;
      ctx.body = {
        code: error.statusCode || error.status || 500,
        message: isDebug ? error.message : '出错了'
      }
    }
  }
}