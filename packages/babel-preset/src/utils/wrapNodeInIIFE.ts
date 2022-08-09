import * as t from '@babel/types';

export const wrapNodeInIIFE = (node: t.BlockStatement | t.Expression): t.CallExpression =>
  t.callExpression(t.arrowFunctionExpression([], node), []);
