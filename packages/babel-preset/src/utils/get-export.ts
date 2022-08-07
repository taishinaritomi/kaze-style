import traverse from '@babel/traverse';
import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';

export type Result<T> = {
  node: t.Node;
  path: NodePath<T>;
};

export const getDefaultExport = (
  ast: t.File,
): Result<t.ExportDefaultDeclaration> | undefined => {
  let result;

  traverse(ast, {
    ExportDefaultDeclaration(path) {
      result = { path, node: path.node.declaration };
      path.stop();
    },
    ExportNamedDeclaration(path) {
      path.get('specifiers')?.forEach(({ node }) => {
        if (
          t.isExportSpecifier(node) &&
          t.isIdentifier(node.exported, { name: 'default' })
        ) {
          result = { path, node: node.local };
          path.stop();
        }
      });
    },
  });

  return result;
};

export const getNamedExport = (
  ast: t.File,
  exportName: string,
): Result<t.ExportNamedDeclaration> | undefined => {
  let result;

  traverse(ast, {
    ExportNamedDeclaration(path) {
      const { node } = path;
      const declarations = t.isVariableDeclaration(node.declaration)
        ? node.declaration.declarations
        : node.specifiers;

      (declarations as (t.VariableDeclarator | t.ExportSpecifier)[]).find(
        (declaration) => {
          const identifier = t.isVariableDeclarator(declaration)
            ? declaration.id
            : declaration.exported;

          if (t.isIdentifier(identifier, { name: exportName })) {
            result = {
              path,
              node: t.isVariableDeclarator(declaration)
                ? declaration.init
                : identifier,
            };

            path.stop();
            return true;
          }

          return false;
        },
      );
    },
  });

  return result;
};
