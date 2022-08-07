import type { types as t } from '@babel/core';
import type { Metadata } from '../transformPlugin';
import type { Return } from './evaluateExpression';
import { evaluateExpression } from './evaluateExpression';
import { resolveBinding } from './resolveBinding';

export const traverseIdentifier = (
  expression: t.Identifier,
  metadata: Metadata,
): Return => {
  let value: t.Node = expression;
  let updatedMeta: Metadata = metadata;

  const resolvedBinding = resolveBinding(expression.name, updatedMeta);

  if (resolvedBinding && resolvedBinding.constant && resolvedBinding.node) {
    ({ value, metadata: updatedMeta } = evaluateExpression(
      resolvedBinding.node as t.Expression,
      resolvedBinding.metadata,
    ));
  }

  return {
    value,
    metadata: updatedMeta,
  };
};
