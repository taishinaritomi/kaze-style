import type { Ast } from '../types/ast';
import type { StaticClasses } from '../types/common';
import { valueToNode } from './valueToNode';

export const classesSerialize = (
  staticClasses: StaticClasses<string>,
): Ast.ObjectExpression => {
  const objectExpression: Ast.ObjectExpression = {
    type: 'Object',
    properties: [],
  };
  for (const key in staticClasses) {
    const className = staticClasses[key];
    if (typeof className === 'string') {
      objectExpression.properties.push({
        key,
        value: valueToNode(className),
      });
    } else if (typeof className === 'object') {
      objectExpression.properties.push({
        key,
        value: {
          type: 'Call',
          name: '__className',
          arguments: [valueToNode(className)],
        },
      });
    }
  }
  return objectExpression;
};
