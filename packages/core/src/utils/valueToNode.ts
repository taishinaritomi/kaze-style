import type { Ast } from '../types/ast';

export type Value =
  | string
  | number
  | boolean
  | null
  | Array<Value>
  | { [_ in keyof unknown]: Value };

export const valueToNode = (value: Value): Ast.Node => {
  if (typeof value === 'string') return { type: 'String', value: value };
  else if (typeof value === 'number') return { type: 'Number', value: value };
  else if (typeof value === 'boolean') return { type: 'Boolean', value: value };
  else if (value === null) return { type: 'Null' };
  else if (Array.isArray(value))
    return {
      type: 'Array',
      elements: value.map((value) => valueToNode(value)),
    };
  else
    return {
      type: 'Object',
      properties: Object.entries(value).map(([key, value]) => ({
        key,
        value: valueToNode(value as Value),
      })),
    };
};
