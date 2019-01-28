import { registerMethod } from './utils';

export const TAG_SUMMARY = Symbol('Summary');

const SUMMARIES: Map<Function, Map<string, string>> = new Map();

export function summary(summary: string): MethodDecorator {
  return function (target: any, key: string) {
    if (!SUMMARIES.has(target.constructor)) {
      SUMMARIES.set(target.constructor, new Map());
    }
    SUMMARIES.get(target.constructor).set(key, summary);
    registerMethod(target, key, function fnSummary(router) {
      router.summary = summary;
    });
    target[TAG_SUMMARY] = target.constructor[TAG_SUMMARY] = SUMMARIES.get(target.constructor);
  }
}
