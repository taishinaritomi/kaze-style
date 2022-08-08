import { types as t } from '@babel/core';
import type { NodePath, PluginPass, PluginObj } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import { createStyle } from '@kaze-style/core';
import { Cache } from './cache';
import type { Any } from './types/any';
import { astify } from './utils/astify';
import { evaluateExpression } from './utils/evaluateExpression';
import { getPathOfNode } from './utils/getPathOfNode';

type Option = {
  import: {
    source: string;
    name: string;
    transformName: string;
  };
};

type State = PluginPass & {
  importDeclarationPaths?: NodePath<t.ImportDeclaration>[];
  calleePaths?: NodePath<t.Identifier>[];
  definitionPaths?: NodePath<t.ObjectExpression>[];
  option?: Option;
  cssRules?: string[];
  cache?: Cache<Any>;
};

export type Metadata<T = Any> = {
  definitionPath: NodePath<T>;
  parentPath?: NodePath<T>;
  state: Required<State>;
  ownPath?: NodePath<Any>;
};

export const transformPlugin = declare<
  Record<string, unknown>,
  PluginObj<State>
>(() => {
  return {
    name: '@kaze-style/babel-plugin-transform',
    pre() {
      this.importDeclarationPaths = [];
      this.calleePaths = [];
      this.cssRules = [];
      this.definitionPaths = [];
      this.cache = new Cache();
      this.option = {
        import: {
          source: '@kaze-style/react',
          name: 'createStyle',
          transformName: '__style',
        },
      };
    },
    post() {
      (this.file.metadata as { cssRules: string[] }).cssRules = this.cssRules!;
    },
    visitor: {
      Program: {
        exit(path, state) {
          if (state.definitionPaths) {
            state.definitionPaths.forEach((_definitionPath) => {
              const definitionPath = _definitionPath as NodePath<t.Expression>;
              const callExpressionPath = definitionPath.findParent(
                (parentPath) => parentPath.isCallExpression(),
              ) as NodePath<t.CallExpression>;
              const { value } = evaluateExpression(definitionPath.node, {
                definitionPath,
                parentPath: path,
                state: state as Required<State>,
              });
              const evaluatePath = getPathOfNode(value, definitionPath);
              if (t.isObjectExpression(value)) {
                const evaluated = evaluatePath.evaluate();
                if (evaluated.value) {
                  const { classes, cssRules } = createStyle(evaluated.value);
                  callExpressionPath.node.arguments = [astify(classes)];
                  state.cssRules!.push(...cssRules);
                }
              }
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
                      name: state.option!.import.name,
                    })
                  ) {
                    specifier.replaceWith(
                      t.identifier(state.option!.import.transformName),
                    );
                  }
                }
              });
            });
          }

          if (state.calleePaths) {
            state.calleePaths.forEach((calleePath) => {
              calleePath.replaceWith(
                t.identifier(state.option!.import.transformName),
              );
            });
          }
        },
      },
      ImportDeclaration(path, state) {
        if (path.node.source.value === state.option!.import.source) {
          state.importDeclarationPaths?.push(path);
        }
      },
      CallExpression(path, state) {
        const calleePath = path.get('callee');
        if (
          this.importDeclarationPaths &&
          calleePath.referencesImport(
            state.option!.import.source,
            state.option!.import.name,
          )
        ) {
          const argumentPaths = path.get('arguments') as NodePath<t.Node>[];
          if (Array.isArray(argumentPaths) && argumentPaths.length === 1) {
            const definitionsPath = argumentPaths[0];
            if (definitionsPath?.isObjectExpression()) {
              state.definitionPaths!.push(definitionsPath);
              state.calleePaths!.push(calleePath as NodePath<t.Identifier>);
            }
          }
        }
      },
    },
  };
});
