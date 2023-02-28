import type { types as t } from '@babel/core';
import type { Node } from '@kaze-style/core';

export const nodeToExpr = (node: Node): t.Expression => {
  if (node.type === 'String') {
    return { type: 'StringLiteral', value: node.value };
  } else if (node.type === 'Number') {
    return { type: 'NumericLiteral', value: node.value };
  } else if (node.type === 'Boolean') {
    return { type: 'BooleanLiteral', value: node.value };
  } else if (node.type === 'Null') {
    return { type: 'NullLiteral' };
  } else if (node.type === 'Identifier') {
    return {
      type: 'Identifier',
      name: node.name,
    };
  } else if (node.type === 'Call') {
    return {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: node.name,
      },
      arguments: node.arguments.map((value) => nodeToExpr(value)),
    };
  } else if (node.type === 'Array') {
    return {
      type: 'ArrayExpression',
      elements: node.value.map((value) => nodeToExpr(value)),
    };
  } else {
    return {
      type: 'ObjectExpression',
      properties: node.properties.map(({ key, value }) => ({
        type: 'ObjectProperty',
        key: {
          type: 'StringLiteral',
          value: key,
        },
        value: nodeToExpr(value),
        computed: false,
        shorthand: false,
      })),
    };
  }
};
