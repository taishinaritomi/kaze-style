import { types as t } from '@babel/core';
import type { Metadata } from '../transformPlugin';
import { evaluateExpression } from './evaluateExpression';

export const getKey = (node: t.Expression, metadata: Metadata): string => {
  if (t.isIdentifier(node)) {
    return node.name;
  }

  if (t.isStringLiteral(node)) {
    return node.value;
  }
  if (t.isTemplateLiteral(node)) {
    let key = '';
    for (let i = 0; i < node.quasis.length; i += 1) {
      key += node.quasis[i]?.value.raw || '';

      if (i < node.expressions.length) {
        const expression = node.expressions[i] as t.Expression;
        if (t.isTSType(expression)) {
          throw new Error(`${node.type} has a type instead of a value`);
        }
        const evaluatedExpression = evaluateExpression(expression, metadata);
        metadata = evaluatedExpression.metadata;
        key += getKey(evaluatedExpression.value, metadata);
      }
    }

    return key;
  }

  throw new Error(`${node.type} has no name.'`);
};
