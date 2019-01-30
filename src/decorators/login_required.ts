import {  registerMiddleware } from './utils';
import { AuthFunc } from './../utils/middlewares';

export function login_required(): MethodDecorator {
  return function (target: any, key: string) {
    registerMiddleware(target, key, AuthFunc);
  }
}
