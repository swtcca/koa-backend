import { TAG_DEFINITION_NAME, TAG_DEFINITION_DESCRIPTION } from './definition';

import * as joi from 'joi';

import parse from '../utils/JoiToSwagger';

export interface ISchema {
  type?: string;
  items?: ISchema;
  $ref?: Function;
  desc?: string;
}

export interface MixedSchema {
  [key: string]: joi.Schema | ISchema
}

export function toSwagger(iSchema: ISchema | joi.Schema | MixedSchema): any {
  if (iSchema['isJoi']) {
    return parse(iSchema).swagger;
  }
  if(iSchema['$ref']){
    return iSchemaToSwagger(iSchema);
  }
  let rules = {};
  Object.assign(rules, iSchema);
  for(let key in rules){
    if(!rules[key]['isJoi']){
      rules[key] = toJoi(rules[key]);
    }
  }
  return parse(joi.object().keys(rules)).swagger;
}

export function iSchemaToSwagger(iSchema: ISchema | joi.Schema): any{
  let items = undefined;
  let $ref: any = iSchema['$ref'];
  let description = undefined;
  if (iSchema['items']) {
    items = toSwagger(iSchema['items']);
    $ref = items['$ref'];
  }
  if ($ref && $ref[TAG_DEFINITION_NAME]) {
    description = $ref[TAG_DEFINITION_DESCRIPTION];
    $ref = '#/definitions/' + $ref[TAG_DEFINITION_NAME];
  }
  return { items, type: iSchema['type'] || 'object', $ref, description }
}

export function toSchema(Definition) {
  return parse(classToJoi(Definition)).swagger;
}

export function classToJoi(def) {
  let rules = {};
  rules = Object.assign(rules, new def());
  for(let key in rules){
    if(!rules[key]['isJoi']){
      rules[key] = toJoi(rules[key]);
    }
  }
  return joi.object().keys(rules);
}

export function iSchemaToJoi(iSchema: ISchema | joi.Schema) : joi.Schema{
  let type = iSchema['type'] || 'object';
  let schema = null;
  let Ref: any = iSchema['$ref'] || (iSchema['items'] && iSchema['items'].$ref);
  let rules = {};
  if (Ref) {
    let ref = new Ref();
    rules = Object.assign({}, ref);
  }
  for(let key in rules){
    if(!rules[key]['isJoi']){
      rules[key] = toJoi(rules[key]);
    }
  }
  if (joi[type]) {
    schema = joi[type]();
  }
  if (Ref && Ref[TAG_DEFINITION_DESCRIPTION]) {
    schema = schema.description(iSchema['desc'] || Ref[TAG_DEFINITION_DESCRIPTION]);
  }
  switch (type) {
    case 'object':
      return schema.keys(rules);
    case 'array':
      return schema.items(rules);
  }
}

export function toJoi(iSchema: ISchema | joi.Schema): joi.Schema | ISchema {
  if (iSchema['isJoi']) {
    return iSchema;
  }
  if(iSchema['$ref']){
    return iSchemaToJoi(iSchema);
  }
  if(Object.prototype.toString.call(iSchema) === '[object Function]'){
    return classToJoi(iSchema);
  }
}