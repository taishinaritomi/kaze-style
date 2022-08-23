import { types as t } from '@babel/core';
import type { NodePath, PluginObj, PluginPass } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';

type State = {
  importDeclarationPaths?: NodePath<t.ImportDeclaration>[];
  calleePaths?: NodePath<t.Identifier>[];
  definitionPaths?: NodePath<t.ObjectExpression>[];
};

export type StyleData = {
  cssRulesList: string[][];
  classesList: Record<string, string>[];
};

export const transformPlugin = declare<
  StyleData,
  PluginObj<State & PluginPass>
>((_, options) => {
  const option = {
    import: {
      source: '@kaze-style/react',
      name: 'createStyle',
      transformName: '__style',
    },
  };
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
            const classesList = options.classesList;
            state.definitionPaths.forEach((_definitionPath, index) => {
              const definitionPath = _definitionPath as NodePath<t.Expression>;
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
                      name: option.import.name,
                    })
                  ) {
                    specifier.replaceWith(
                      t.identifier(option.import.transformName),
                    );
                  }
                }
              });
            });
          }

          if (state.calleePaths) {
            state.calleePaths.forEach((calleePath) => {
              calleePath.replaceWith(t.identifier(option.import.transformName));
            });
          }
        },
      },
      ImportDeclaration(path, state) {
        if (path.node.source.value === option.import.source) {
          state.importDeclarationPaths?.push(path);
        }
      },
      CallExpression(path, state) {
        const calleePath = path.get('callee');
        if (
          this.importDeclarationPaths &&
          calleePath.referencesImport(option.import.source, option.import.name)
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
});
