import * as joi from 'joi';
import { registerMethod } from './utils';
import { ISchema, toJoi, toSwagger, MixedSchema } from './ischema';

export const TAG_RESPONSE = Symbol('Response');

const RESPONSES: Map<Function, Map<string, Map<number, ISchema | joi.Schema>>> = new Map();

export const DEFAULT_RESPONSE: joi.Schema = joi.string().default('');

export function response(code: number, schema?: ISchema | joi.Schema | MixedSchema): MethodDecorator {
  return function (target: any, key: string) {
    if (!schema) {
      schema = DEFAULT_RESPONSE;
    }
    if (!RESPONSES.has(target.constructor)) {
      RESPONSES.set(target.constructor, new Map());
    }
    if (!RESPONSES.get(target.constructor).has(key)) {
      RESPONSES.get(target.constructor).set(key, new Map());
    }
    registerMethod(target, key, function fnResponse(router) {
      if (!router.responses) {
        router.responses = {};
      }
      schema = toSwagger(schema);
      let description = '';
      if (schema['description']) {
        description = schema['description'];
        delete schema['description'];
      }
      router.responses[code] = Object.assign({ description: description }, { schema });
    });

    // 不需要返回响应的时候格式化数据
    // registerMiddleware(target, key, async function fnResponse(ctx, next) {
    //   await next();
    //   // if has been handle the error;
    //   if (RESPONSES.get(target.constructor).get(key).has(ctx.status)) {
    //     const aleadyHandled = ctx.body && ctx.body.code && ctx.body.code === 500 && ctx.body.message;
    //     if (aleadyHandled) {
    //       return;
    //     }
    //     let { error, value } = joi.validate(ctx.body, RESPONSES.get(target.constructor).get(key).get(ctx.status));
    //     if (error) {
    //       ctx.body = { code: 500, message: error.message };
    //       ctx.status = 500;
    //       return;
    //     }
    //     ctx.body = value;
    //   }
    // });

    RESPONSES.get(target.constructor).get(key).set(code, toJoi(schema));
    target[TAG_RESPONSE] = target.constructor[TAG_RESPONSE] = RESPONSES.get(target.constructor);
  }
}
