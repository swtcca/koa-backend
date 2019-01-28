import { registerGlobal } from './utils';
import { toSchema } from './ischema';

export const TAG_DEFINITION_NAME = Symbol('DefinitionName');
export const TAG_DEFINITION_DESCRIPTION = Symbol('DefinitionDescription');

export function definition(name?: string, description?: string): ClassDecorator {
  return function (Definition: Function) {
    if (!name) {
      name = Definition.name;
    }
    registerGlobal(Definition, function definition(swagger) {
      swagger.definitions[name] = toSchema(Definition);
    });
    Definition[TAG_DEFINITION_NAME] = name;
    Definition[TAG_DEFINITION_DESCRIPTION] = description || name;
  }
}
