import { types as t, template } from '@babel/core';
import type { NodePath, PluginObj, PluginPass } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import type { ResolvedStyle } from '@kaze-style/core';

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
  transforms: [
    {
      from: '__preStyle',
      to: '__style',
    },
    {
      from: '__preGlobalStyle',
      to: '__globalStyle',
    },
  ],
};

const buildStyleImport = template(`
  import { ${options.transforms
    .map((transform) => transform.to)
    .join(',')} } from '${options.importSource}';
`);

export type Options = {
  resolvedStyles: ResolvedStyle[];
};

export const transformPlugin = declare<Options, PluginObj<State & PluginPass>>(
  (_, { resolvedStyles }) => {
    return {
      name: '@kaze-style/babel-plugin-transform',
      pre() {
        this.targetPaths = [];
      },
      visitor: {
        Program: {
          exit(path, state) {
            if (state.targetPaths && state.targetPaths.length !== 0) {
              state.targetPaths.forEach(({ callee, definition, transform }) => {
                const definitionPath = definition as NodePath<t.Expression>;
                const callExpressionPath = definitionPath.findParent(
                  (parentPath) => parentPath.isCallExpression(),
                ) as NodePath<t.CallExpression>;
                const indexArgPath = callExpressionPath.node
                  .arguments[3] as t.NumericLiteral;
                if (transform.from === '__preStyle') {
                  const classes = resolvedStyles.find(
                    (resolvedStyle) =>
                      resolvedStyle.index === indexArgPath.value,
                  )?.classes;
                  callExpressionPath.node.arguments = [t.valueToNode(classes || {})];
                }
                if (transform.from === '__preGlobalStyle') {
                  callExpressionPath.node.arguments = [t.valueToNode({})];
                }
                callee.replaceWith(t.identifier(transform.to));
              });

              path.unshiftContainer('body', buildStyleImport());
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
              if (Array.isArray(argumentPaths) && argumentPaths.length === 4) {
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
