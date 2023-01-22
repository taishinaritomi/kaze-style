import { types as t, template } from '@babel/core';
import type { NodePath, PluginObj, PluginPass } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import type { ForBuild } from '@kaze-style/core';

type Transform = {
  from: string;
  to: string;
};

type State = {
  targetPaths?: Array<{
    callee: NodePath<t.Identifier>;
    definition: NodePath<t.Node>;
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
    .join(',')} , ClassName } from '${options.importSource}';
`);

export type TransformOptions = {
  styles: ForBuild[2];
};

export const transformPlugin = declare<
  TransformOptions,
  PluginObj<State & PluginPass>
>((_, { styles }) => {
  return {
    name: '@kaze-style/babel-plugin-transform',
    pre() {
      this.targetPaths = [];
    },
    visitor: {
      Program: {
        exit(path, state) {
          const _styles = styles.map(([classes, index]) => ({
            classes,
            index,
          }));
          if (state.targetPaths && state.targetPaths.length !== 0) {
            state.targetPaths.forEach(({ callee, definition, transform }) => {
              const callExpressionPath = definition.findParent((parentPath) =>
                parentPath.isCallExpression(),
              ) as NodePath<t.CallExpression>;
              const indexArgPath = callExpressionPath.node
                .arguments[3] as t.NumericLiteral;
              const classes = _styles.find(
                (style) => style.index === indexArgPath.value,
              )?.classes;
              const objectProperties: t.ObjectProperty[] = [];
              for (const key in classes) {
                if (classes.hasOwnProperty(key)) {
                  const className = classes[key];
                  if (typeof className === 'string') {
                    objectProperties.push(
                      t.objectProperty(
                        t.stringLiteral(key),
                        t.stringLiteral(className),
                      ),
                    );
                  } else {
                    objectProperties.push(
                      t.objectProperty(
                        t.stringLiteral(key),
                        t.newExpression(t.identifier('ClassName'), [
                          t.valueToNode(classes[key] || {}),
                        ]),
                      ),
                    );
                  }
                }
              }
              callExpressionPath.node.arguments = [
                t.objectExpression(objectProperties),
              ];
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
              if (definitionsPath !== undefined) {
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
});
