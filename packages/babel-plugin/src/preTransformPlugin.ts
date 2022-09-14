import { types as t, template } from '@babel/core';
import type { NodePath, PluginObj, PluginPass } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';

type State = {
  importDeclarationPaths?: NodePath<t.ImportDeclaration>[];
  calleePaths?: NodePath<t.Identifier>[];
  definitionPaths?: NodePath<t.ObjectExpression>[];
};

const options = {
  importSource: '@kaze-style/react',
  buildStyles: '__buildStyles',
  importName: 'createStyle',
  transformName: '__preStyle',
};

const buildPreStyleImport = template(`
  import { ${options.transformName} } from '${options.importSource}';
`);

export const preTransformPlugin = declare<never, PluginObj<State & PluginPass>>(
  () => {
    return {
      name: '@kaze-style/babel-plugin-preTransform',
      pre() {
        this.importDeclarationPaths = [];
        this.calleePaths = [];
        this.definitionPaths = [];
      },
      visitor: {
        Program: {
          exit(path, state) {
            if (state.definitionPaths && state.definitionPaths.length !== 0) {
              state.definitionPaths.forEach((_definitionPath, index) => {
                const definitionPath =
                  _definitionPath as NodePath<t.Expression>;
                const callExpressionPath = definitionPath.findParent(
                  (parentPath) => parentPath.isCallExpression(),
                ) as NodePath<t.CallExpression>;
                if (callExpressionPath.node.arguments[0]) {
                  callExpressionPath.node.arguments = [
                    callExpressionPath.node.arguments[0],
                    t.identifier(options.buildStyles),
                    t.stringLiteral(this.filename || ''),
                    t.numericLiteral(index),
                  ];
                }
              });
              this.file.metadata = { transformed: true };
            }

            if (state.calleePaths && state.calleePaths.length !== 0) {
              path.unshiftContainer('body', buildPreStyleImport());
              state.calleePaths.forEach((calleePath) => {
                calleePath.replaceWith(t.identifier(options.transformName));
              });
            }
          },
        },
        ImportDeclaration(path, state) {
          if (path.node.source.value === options.importSource) {
            state.importDeclarationPaths?.push(path);
          }
        },
        CallExpression(path, state) {
          const calleePath = path.get('callee');
          if (
            state.importDeclarationPaths &&
            state.importDeclarationPaths.length !== 0 &&
            calleePath.referencesImport(
              options.importSource,
              options.importName,
            )
          ) {
            const argumentPaths = path.get('arguments') as NodePath<t.Node>[];
            if (Array.isArray(argumentPaths)) {
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
