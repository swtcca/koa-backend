import {  registerMiddleware } from './utils';
import { IContext } from './interface';

export function login_required(): MethodDecorator {
  return function (target: any, key: string) {
    registerMiddleware(target, key, async function fnParameter(ctx: IContext, next) {
      const headers = ctx.request.headers;
      console.log(headers);
      return await next();
    });
  }
}
