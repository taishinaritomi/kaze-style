import { types as t } from '@babel/core';
import type { PluginObj, PluginPass } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import type { Ast } from '@kaze-style/core';
import { nodeToExpr } from './astNode';
import type { InputTransform } from './commonConfig';

type InputConfig = {
  transforms: InputTransform[];
  buildInfo: Ast.Node;
};

type Transform = {
  from: string;
  importSource: string;
  identNames: string[];
  namespaces: string[];
};

type State = {
  isUseNameSpace?: boolean;
  transforms?: Transform[];
  buildInfo?: t.Expression;
  callExprs?: t.CallExpression[];
};

export const setupStylePlugin = declare<
  InputConfig,
  PluginObj<PluginPass & State>
>((_, config) => {
  return {
    name: '@kaze-style/babel-plugin-setupStyle',
    pre() {
      this.transforms = config.transforms.map((transform) => ({
        from: transform.from,
        importSource: transform.source,
        identNames: [],
        namespaces: [],
      }));
      this.isUseNameSpace = false;
      this.callExprs = [];
      this.buildInfo = nodeToExpr(config.buildInfo);
    },
    visitor: {
      Program: {
        enter(path, state) {
          path.node.body.forEach((statement) => {
            if (t.isImportDeclaration(statement)) {
              state.transforms?.forEach((transform) => {
                if (transform.importSource === statement.source.value) {
                  statement.specifiers.forEach((specifier) => {
                    if (t.isImportSpecifier(specifier)) {
                      if (t.isIdentifier(specifier.imported)) {
                        if (transform.from === specifier.imported.name) {
                          transform.identNames.push(specifier.local.name);
                        }
                      }
                    } else if (t.isImportNamespaceSpecifier(specifier)) {
                      state.isUseNameSpace = true;
                      transform.namespaces.push(specifier.local.name);
                    }
                  });
                }
              });
            }
          });
        },
        exit(_path, state) {
          let index = 0;
          state.callExprs?.forEach((callExpr) => {
            state.transforms?.forEach((transform) => {
              let isTarget = false;
              const callee = callExpr.callee;
              if (t.isIdentifier(callee)) {
                transform.identNames.forEach((identName) => {
                  if (identName === callee.name) {
                    isTarget = true;
                  }
                });
              } else if (t.isMemberExpression(callee)) {
                const obj = callee.object;
                if (t.isIdentifier(obj)) {
                  transform.namespaces.forEach((namespace) => {
                    if (namespace === obj.name) {
                      const prop = callee.property;
                      if (t.isIdentifier(prop)) {
                        transform.identNames.forEach((identName) => {
                          if (prop.name === identName) {
                            isTarget = true;
                          }
                        });
                      }
                    }
                  });
                }
              }
              if (isTarget) {
                if (state.buildInfo) {
                  callExpr.arguments.push(state.buildInfo);
                  callExpr.arguments.push(t.valueToNode(index));
                  index += 1;
                  this.file.metadata = { isTransformed: true };
                }
              }
            });
          });
        },
      },
      MemberExpression(path, state) {
        if (state.isUseNameSpace) {
          const obj = path.node.object;
          if (t.isIdentifier(obj)) {
            state.transforms?.forEach((transform) => {
              transform.namespaces.forEach((namespace) => {
                if (namespace === obj.name) {
                  const prop = path.node.property;
                  if (t.isIdentifier(prop)) {
                    if (prop.name === transform.from) {
                      transform.identNames.push(prop.name);
                    }
                  }
                }
              });
            });
          }
        }
      },
      CallExpression(path, state) {
        state.callExprs?.push(path.node);
      },
    },
  };
});
