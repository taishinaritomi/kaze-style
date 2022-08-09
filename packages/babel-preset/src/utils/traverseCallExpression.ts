import * as t from '@babel/types';
import type { Metadata } from '../transformPlugin';
import type { Any } from '../types/any';
import { evaluateExpression } from './evaluateExpression';
import { getPathOfNode } from './getPathOfNode';
import { resolveBinding } from './resolveBinding';
import { wrapNodeInIIFE } from './wrapNodeInIIFE';

export const traverseCallExpression = (
  expression: t.CallExpression,
  metadata: Metadata,
) => {
  const callee = expression.callee;
  let value: t.Node | undefined | null = undefined;

  let updatedMetadata: Metadata = { ...metadata }

  if (t.isExpression(callee)) {
    let functionNode;



    if (t.isFunction(callee)) {
      functionNode = callee;
    } else {
      if (t.isIdentifier(callee)) {
        const resolvedBinding = resolveBinding(callee.name, updatedMetadata);

        console.log(resolvedBinding?.node.type);

        if (resolvedBinding && resolvedBinding.constant) {
          functionNode = resolvedBinding.node;
        }
      } else if (t.isMemberExpression(callee) && t.isIdentifier(callee.property)) {

        callee.property = t.callExpression(callee.property, expression.arguments);

        return evaluateExpression(callee, updatedMetadata);
      }
    }

    if (functionNode && t.isFunction(functionNode)) {
      const { params } = functionNode;
      const evaluatedArguments = expression.arguments.map(
        (argument) => evaluateExpression(argument as t.Expression, updatedMetadata).value
      );

      const expressionPath = getPathOfNode(expression, updatedMetadata.parentPath);
      const [wrappingNodePath] = expressionPath.replaceWith(wrapNodeInIIFE(expression));

      const arrowFunctionExpressionPath = getPathOfNode(
        wrappingNodePath.node.callee,
        wrappingNodePath as Any
      );
      params
        .filter((param) => t.isIdentifier(param) || t.isObjectPattern(param))
        .forEach((param, index) => {
          const evaluatedArgument = evaluatedArguments[index];
          arrowFunctionExpressionPath.scope.push({
            id: param,
            init: evaluatedArgument,
            kind: 'const',
          });
        });
        updatedMetadata.ownPath = arrowFunctionExpressionPath;
    }

    ({ value, metadata: updatedMetadata } = evaluateExpression(callee, updatedMetadata));
  }

  return {
    value: value as t.Expression,
    metadata:updatedMetadata,
  };
};
