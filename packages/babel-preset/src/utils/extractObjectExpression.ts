import { types as t } from '@babel/core';
import type { Metadata } from '../transformPlugin';
import { evaluateExpression } from './evaluateExpression';
import { getKey } from './getKey';
import { getPathOfNode } from './getPathOfNode';

export const extractObjectExpression = (
  expression: t.ObjectExpression,
  metadata: Metadata,
) => {
  const result = {};
  expression.properties.forEach((prop) => {
    if (t.isObjectProperty(prop)) {
      const key = getKey(
        prop.computed
          ? evaluateExpression(prop.key as t.Expression, metadata).value
          : (prop.key as t.Expression),
        metadata,
      );
      const { value: updatedValue, metadata: updatedMetadata } =
        evaluateExpression(prop.value as t.Expression, metadata);
      if (t.isStringLiteral(updatedValue)) {
        Object.assign(result, { [key]: updatedValue.value });
      } else if (t.isNumericLiteral(updatedValue)) {
        Object.assign(result, { [key]: updatedValue.value });
      } else if (
        t.isObjectExpression(updatedValue) ||
        t.isLogicalExpression(updatedValue)
      ) {
        const { value } = evaluateExpression(updatedValue, updatedMetadata);
        const evaluatePath = getPathOfNode(value, metadata.definitionPath);
        if (t.isObjectExpression(value)) {
          const evaluated = evaluatePath.evaluate();
          Object.assign(result, { [key]: evaluated.value });
        }
        return;
      }
    }
  });
  return {
    value: t.valueToNode(result),
    metadata,
  };
};
