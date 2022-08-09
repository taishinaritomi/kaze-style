import { types as t } from '@babel/core';
import type { Metadata } from '../transformPlugin';
import { extractObjectExpression } from './extractObjectExpression';
import { getPathOfNode } from './getPathOfNode';
// import { traverseCallExpression } from './traverseCallExpression';
import { traverseIdentifier } from './traverseIdentifier';

export type Return = {
  value: t.Expression;
  metadata: Metadata;
};

export const evaluateExpression = (
  expression: t.Expression,
  metadata: Metadata,
): Return => {
  const targetExpression = t.isTSAsExpression(expression)
    ? expression.expression
    : expression;

  if (t.isIdentifier(targetExpression)) {
    return traverseIdentifier(targetExpression, metadata);
  } else if (t.isObjectExpression(targetExpression)) {
    return extractObjectExpression(targetExpression, metadata);
  }

  // else if (t.isCallExpression(targetExpression)) {
  //   return traverseCallExpression(targetExpression, metadata);
  // }

  const path = getPathOfNode(expression, metadata.definitionPath);
  const evaluated = path.evaluate();
  if (evaluated.confident) {
    return {
      value: t.valueToNode(evaluated.value),
      metadata,
    };
  }

  return {
    value: expression,
    metadata,
  };
};
