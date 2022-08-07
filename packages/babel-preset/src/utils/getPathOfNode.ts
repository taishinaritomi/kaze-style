import type { NodePath } from '@babel/core';
import { types as t } from '@babel/core';
import traverse from '@babel/traverse';
import type { Any } from '../types/any';

export const getPathOfNode = <TNode>(
  node: TNode,
  parentPath: NodePath<Any>,
): NodePath<TNode> => {
  let foundPath: NodePath | null = null;

  traverse(
    t.expressionStatement(node as Any),
    {
      enter(path) {
        foundPath = path;
        path.stop();
      },
    },
    parentPath.scope,
    undefined,
    parentPath,
  );

  if (!foundPath) {
    throw parentPath.buildCodeFrameError('No path for a child node was found.');
  }

  return foundPath;
};
