import * as log4js from 'log4js';
import * as jwt from 'jsonwebtoken';
import { getConnection } from "typeorm";
import { IContext } from './../decorators/interface';
import { isDebug, log4jsConfig, AppKey } from "./config";

log4js.configure(log4jsConfig);

const logger = log4js.getLogger('cheese');

// 日志相关
export const logFunc = async (ctx, next) => {
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

// 验证token函数
export const AuthFunc = async (ctx: IContext, next) => {
  const token = (ctx.headers['Authorization'] || '').replace('Bearer ', '');
  try {
    // 1. token in headers
    // 2. token in cookies(for swagger)
    jwt.verify(token || ctx.cookies.get('token'), AppKey);
    await next();
  } catch (error) {
    ctx.status = 403;
    ctx.body = {
      code: 403,
      message: isDebug ? error.message : 'token验证失败'
    }
  }
}