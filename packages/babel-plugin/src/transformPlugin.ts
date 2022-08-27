import { types as t } from '@babel/core';
import type { NodePath, PluginObj, PluginPass } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import type { ResolvedStyle } from '@kaze-style/core';

type State = {
  importDeclarationPaths?: NodePath<t.ImportDeclaration>[];
  calleePaths?: NodePath<t.Identifier>[];
  definitionPaths?: NodePath<t.ObjectExpression>[];
};

type ImportOption = {
  source: string;
  name: string;
  transformName: string;
};

export type Options = {
  resolvedStyles: ResolvedStyle[];
  import: ImportOption;
};

export const transformPlugin = declare<Options, PluginObj<State & PluginPass>>(
  (_, options) => {
    return {
      name: '@kaze-style/babel-plugin-transform',
      pre() {
        this.importDeclarationPaths = [];
        this.calleePaths = [];
        this.definitionPaths = [];
      },
      visitor: {
        Program: {
          exit(_, state) {
            if (state.definitionPaths) {
              const classesList = options.resolvedStyles.map(
                (resolvedStyle) => resolvedStyle.classes,
              );
              state.definitionPaths.forEach((_definitionPath, index) => {
                const definitionPath =
                  _definitionPath as NodePath<t.Expression>;
                const callExpressionPath = definitionPath.findParent(
                  (parentPath) => parentPath.isCallExpression(),
                ) as NodePath<t.CallExpression>;
                callExpressionPath.node.arguments = [
                  t.valueToNode(classesList[index]),
                ];
              });
            }

            if (state.importDeclarationPaths) {
              state.importDeclarationPaths.forEach((importDeclarationPath) => {
                const specifiers = importDeclarationPath.get('specifiers');
                specifiers.forEach((specifier) => {
                  if (specifier.isImportSpecifier()) {
                    const importedPath = specifier.get('local');
                    if (
                      importedPath.isIdentifier({
                        name: options.import.name,
                      })
                    ) {
                      specifier.replaceWith(
                        t.identifier(options.import.transformName),
                      );
                    }
                  }
                });
              });
            }

            if (state.calleePaths) {
              state.calleePaths.forEach((calleePath) => {
                calleePath.replaceWith(
                  t.identifier(options.import.transformName),
                );
              });
            }
          },
        },
        ImportDeclaration(path, state) {
          if (path.node.source.value === options.import.source) {
            state.importDeclarationPaths?.push(path);
          }
        },
        CallExpression(path, state) {
          const calleePath = path.get('callee');
          if (
            this.importDeclarationPaths &&
            calleePath.referencesImport(
              options.import.source,
              options.import.name,
            )
          ) {
            const argumentPaths = path.get('arguments') as NodePath<t.Node>[];
            if (Array.isArray(argumentPaths) && argumentPaths.length === 1) {
              const definitionsPath = argumentPaths[0];
              if (definitionsPath?.isObjectExpression()) {
                state.definitionPaths?.push(definitionsPath);
                state.calleePaths?.push(calleePath as NodePath<t.Identifier>);
              }
            }
          }
        },
      },
    };
  },
);
