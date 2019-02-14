import { ISchema, toJoi, toSwagger } from './ischema';
import * as joi from 'joi';
import { registerMethod, registerMiddleware } from './utils';
import { IContext } from './interface';

export const TAG_PARAMETER = Symbol('Parameter');

const PARAMETERS: Map<Function, Map<string, Map<string, IParameter>>> = new Map();

export interface IParameter {
  in: ENUM_PARAM_IN;
  schema: joi.Schema | ISchema;
}

export enum ENUM_PARAM_IN {
  query,
  body,
  header,
  path
}

export function parameter(name: string, schema?: ISchema | joi.Schema, paramIn?: ENUM_PARAM_IN): MethodDecorator {
  return function (target: any, key: string) {
    if (!paramIn) {
      paramIn = ENUM_PARAM_IN.query;
    }
    if (!PARAMETERS.has(target.constructor)) {
      PARAMETERS.set(target.constructor, new Map());
    }
    if (!PARAMETERS.get(target.constructor).has(key)) {
      PARAMETERS.get(target.constructor).set(key, new Map());
    }
    registerMethod(target, key, function fnParameter(router) {
      if (!router.parameters) {
        router.parameters = [];
      }
      schema = toSwagger(schema);
      let description = '';
      if (schema['description']) {
        description = schema['description'];
        delete schema['description'];
      }
      router.parameters.push(Object.assign({
        name,
        in: ENUM_PARAM_IN[paramIn],
        description: description
      }, { required: paramIn == ENUM_PARAM_IN.path }, ENUM_PARAM_IN.body === paramIn ? { schema } : schema));
    });

    registerMiddleware(target, key, async function fnParameter(ctx: IContext, next) {
      let schemas = PARAMETERS.get(target.constructor).get(key);
      let tempSchema = { params: {}, body: {}, query: {} };
      for (let [name, schema] of schemas) {
        switch (schema.in) {
          case ENUM_PARAM_IN.query:
            tempSchema.query[name] = schema.schema;
            break;
          case ENUM_PARAM_IN.path:
            tempSchema.params[name] = schema.schema;
            break;
          case ENUM_PARAM_IN.body:
            tempSchema.body = schema.schema;
        }
      }
      const { error, value } = joi.validate({
        params: ctx.params,
        body: ctx.request.body,
        query: ctx.request.query
      }, tempSchema, { 
        allowUnknown: true,
        abortEarly: true,
      });
      if (error) {
        return ctx.throw(400, JSON.stringify({ code: 400, message: error.message }));
      }
      // 参数验证完成, 再覆盖$getParams方法
      ctx.$getParams = () => {
        return Object.assign(value.params, value.body, value.query);
      }
      return await next();
    });

    PARAMETERS.get(target.constructor).get(key).set(name, { in: paramIn, schema: toJoi(schema) });
    target[TAG_PARAMETER] = target.constructor[TAG_PARAMETER] = PARAMETERS.get(target.constructor);
  }
}
