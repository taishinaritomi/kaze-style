import { types as t } from '@babel/core';
import type { PluginObj, PluginPass } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import type { AstNode } from '@kaze-style/core';
import { nodeToExpr } from './astNode';
import type { InputTransform } from './commonConfig';

type InputConfig = {
  transforms: InputTransform[];
  injectArgs: InputArgument[];
  imports: InputImport[];
};

type InputArgument = {
  value: AstNode[];
  index: number;
};

type InputImport = {
  source: string;
  specifier: string;
};

type Transform = {
  to: string;
  from: string;
  importSource: string;
  identNames: string[];
  namespaces: string[];
};

type ArgumentExpression = {
  value: t.Expression[];
  index: number;
};

type State = {
  isUseNameSpace?: boolean;
  transforms?: Transform[];
  injectArgs?: ArgumentExpression[];
  callExprs?: t.CallExpression[];
};

export const transformPlugin = declare<
  InputConfig,
  PluginObj<PluginPass & State>
>((_, config) => {
  return {
    name: '@kaze-style/babel-plugin-transform',
    pre() {
      this.transforms = config.transforms.map((transform) => ({
        to: transform.to,
        from: transform.from,
        importSource: transform.source,
        identNames: [],
        namespaces: [],
      }));
      this.isUseNameSpace = false;
      this.callExprs = [];
      this.injectArgs = config.injectArgs.map((injectArg) => ({
        value: injectArg.value.map((value) => nodeToExpr(value)),
        index: injectArg.index,
      }));
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
                          specifier.imported.name = transform.to;
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
                if (state.injectArgs) {
                  const lastArg = callExpr.arguments.at(-1);
                  if (t.isNumericLiteral(lastArg)) {
                    let is_transform = false;
                    for (const injectArg of state.injectArgs || []) {
                      if (lastArg.value === injectArg.index) {
                        callExpr.arguments = injectArg.value;
                        is_transform = true;
                        break;
                      }
                    }
                    if (is_transform === false) {
                      callExpr.arguments = [];
                    }
                  } else {
                    callExpr.arguments = [];
                  }
                } else {
                  callExpr.arguments = [];
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
                      prop.name = transform.to;
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
