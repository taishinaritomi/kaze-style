import { types as t, template } from '@babel/core';
import type { NodePath, PluginObj, PluginPass } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';

type Transform = {
  from: string;
  to: string;
};

type State = {
  targetPaths?: Array<{
    callee: NodePath<t.Identifier>;
    definition: NodePath<t.ObjectExpression>;
    transform: Transform;
  }>;
};

const options = {
  importSource: '@kaze-style/react',
  forBuild: '__forBuildByKazeStyle',
  transforms: [
    {
      from: 'createStyle',
      to: '__preStyle',
    },
    {
      from: 'createGlobalStyle',
      to: '__preGlobalStyle',
    },
  ],
};

const buildPreStyleImport = template(`
  import { ${options.transforms
    .map((transform) => transform.to)
    .join(',')} } from '${options.importSource}';
`);

export const preTransformPlugin = declare<never, PluginObj<State & PluginPass>>(
  () => {
    return {
      name: '@kaze-style/babel-plugin-preTransform',
      pre() {
        this.targetPaths = [];
      },
      visitor: {
        Program: {
          exit(path, state) {
            if (state.targetPaths && state.targetPaths.length !== 0) {
              state.targetPaths.forEach(
                ({ callee, definition, transform }, index) => {
                  const definitionPath = definition as NodePath<t.Expression>;
                  const callExpressionPath = definitionPath.findParent(
                    (parentPath) => parentPath.isCallExpression(),
                  ) as NodePath<t.CallExpression>;
                  if (callExpressionPath.node.arguments[0]) {
                    callExpressionPath.node.arguments = [
                      callExpressionPath.node.arguments[0],
                      t.identifier(options.forBuild),
                      t.stringLiteral(this.filename || ''),
                      t.numericLiteral(index),
                    ];
                  }
                  callee.replaceWith(t.identifier(transform.to));
                },
              );
              path.unshiftContainer('body', buildPreStyleImport());
              this.file.metadata = { transformed: true };
            }
          },
        },
        CallExpression(path, state) {
          const calleePath = path.get('callee');
          options.transforms.forEach((transform) => {
            if (
              calleePath.referencesImport(options.importSource, transform.from)
            ) {
              const argumentPaths = path.get('arguments') as NodePath<t.Node>[];
              if (Array.isArray(argumentPaths)) {
                const definitionsPath = argumentPaths[0];
                if (definitionsPath?.isObjectExpression()) {
                  state.targetPaths?.push({
                    callee: calleePath as NodePath<t.Identifier>,
                    definition: definitionsPath,
                    transform: transform,
                  });
                }
              }
            }
          });
        },
      },
    };
  },
);
