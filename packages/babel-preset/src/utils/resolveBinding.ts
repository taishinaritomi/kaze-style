import fs from 'fs';
import { dirname, join } from 'path';
import { types as t } from '@babel/core';
import { parse } from '@babel/parser';
import type { NodePath, Binding } from '@babel/traverse';
import traverse from '@babel/traverse';
import resolve from 'resolve';
import type { Metadata } from '../transformPlugin';
import { evaluateExpression } from './evaluateExpression';
import { getDefaultExport, getNamedExport } from './get-export';
import { getDestructuredObjectPatternKey } from './getDestructuredObjectPatternKey';
import { getModuleImportSource } from './getModuleImportSource';

export const resolveIdentifierComingFromDestructuring = ({
  name,
  node,
  resolveFor = 'key',
}: {
  name: string;
  node: t.Expression | undefined;
  resolveFor?: 'key' | 'value';
}): t.ObjectProperty | undefined => {
  let resolvedDestructuringIdentifier: t.ObjectProperty | undefined;

  if (t.isObjectPattern(node)) {
    const pattern = node as t.ObjectPattern;

    return pattern.properties.find((property) => {
      if (t.isObjectProperty(property)) {
        if (resolveFor === 'key') {
          return t.isIdentifier(property.key) && property.key.name === name;
        } else if (resolveFor === 'value') {
          return t.isIdentifier(property.value) && property.value.name === name;
        }
      }

      return false;
    }) as t.ObjectProperty | undefined;
  } else if (t.isVariableDeclarator(node)) {
    const declarator = node as t.VariableDeclarator;

    resolvedDestructuringIdentifier = resolveIdentifierComingFromDestructuring({
      name,
      node: declarator.id as t.Expression,
      resolveFor,
    });
  }

  return resolvedDestructuringIdentifier;
};
const resolveObjectPatternValueNode = (
  expression: t.Expression,
  metadata: Metadata,
  referenceName: string,
): t.Node | undefined => {
  let objectPatternValueNode: t.Node | undefined = undefined;

  if (t.isObjectExpression(expression)) {
    traverse(expression, {
      noScope: true,
      ObjectProperty: {
        exit(path) {
          if (t.isIdentifier(path.node.key, { name: referenceName })) {
            objectPatternValueNode = path.node.value;
            path.stop();
          }
        },
      },
    });
  } else if (
    t.isMemberExpression(expression) &&
    t.isMemberExpression(expression.object)
  ) {
    const { value: node, metadata: updatedMeta } = evaluateExpression(
      expression,
      metadata,
    );

    objectPatternValueNode = resolveObjectPatternValueNode(
      node,
      updatedMeta,
      referenceName,
    );
  } else if (
    t.isIdentifier(expression) ||
    (t.isMemberExpression(expression) && t.isIdentifier(expression.object))
  ) {
    const name = t.isIdentifier(expression)
      ? expression.name
      : (expression.object as t.Identifier).name;

    const resolvedBinding = resolveBinding(name, metadata);

    if (resolvedBinding) {
      const isResolvedToSameNode = resolvedBinding.path.node === expression;

      if (
        !isResolvedToSameNode &&
        resolvedBinding.constant &&
        t.isExpression(resolvedBinding.node)
      ) {
        objectPatternValueNode = resolveObjectPatternValueNode(
          resolvedBinding.node,
          metadata,
          referenceName,
        );
      }
    }
  }

  return objectPatternValueNode;
};

const resolveRequest = (
  request: string,
  extensions: string[],
  meta: Metadata,
) => {
  const { filename } = meta.state;
  if (!filename) {
    throw new Error(
      'Unable to resolve request due to a missing filename, this is probably a bug!',
    );
  }
  const id =
    request.charAt(0) === '.' ? join(dirname(filename), request) : request;

  return resolve.sync(id, {
    extensions,
  });
};

const getBinding = (
  referenceName: string,
  metadata: Metadata,
): Binding | undefined => {
  const { ownPath, parentPath } = metadata;

  const scopedBinding =
    ownPath?.scope.getOwnBinding(referenceName) ||
    parentPath?.scope.getBinding(referenceName);

  if (scopedBinding) {
    return scopedBinding;
  }

  if (parentPath?.isExportNamedDeclaration() && parentPath.node.source) {
    return {
      identifier: t.identifier(referenceName),
      scope: parentPath.scope,
      path: parentPath,
      kind: 'const',
      referenced: false,
      references: 0,
      referencePaths: [],
      constant: true,
      constantViolations: [],
    } as Binding;
  }

  return undefined;
};

export interface PartialBindingWithMetadata {
  node: t.Node;
  path: NodePath;
  constant: boolean;
  metadata: Metadata;
  source: 'import' | 'module';
}

export const resolveBinding = (
  referenceName: string,
  metadata: Metadata,
): PartialBindingWithMetadata | undefined => {
  const binding = getBinding(referenceName, metadata);

  if (!binding || binding.path.isObjectPattern()) {
    return undefined;
  }

  if (t.isVariableDeclarator(binding.path.node)) {
    let node = binding.path.node.init as t.Node;

    if (t.isObjectPattern(binding.path.node.id) && t.isExpression(node)) {
      node = resolveObjectPatternValueNode(
        node,
        metadata,
        getDestructuredObjectPatternKey(binding.path.node.id, referenceName),
      ) as t.Node;
    }

    return {
      metadata,
      node,
      path: binding.path,
      constant: binding.constant,
      source: 'module',
    };
  }

  if (
    binding.path.parentPath?.isImportDeclaration() ||
    binding.path.isExportNamedDeclaration()
  ) {
    if (!metadata.state.filename) {
      return;
    }

    const moduleImportSource = getModuleImportSource(binding.path);

    const extensions = ['.esm.js', '.js', '.jsx', '.ts', '.tsx'];
    let modulePath = resolveRequest(moduleImportSource, extensions, metadata);
    if (!extensions.some((extension) => modulePath.endsWith(extension))) {
      return;
    }

    if (modulePath.includes('@kaze-style/react/dist/index.js')) {
      modulePath = modulePath.replace('index.js', 'react.esm.js');
    }

    const moduleCode = metadata.state.cache.load(`read-file${modulePath}`, () =>
      fs.readFileSync(modulePath, 'utf-8'),
    );

    const ast = metadata.state.cache.load(`parse-module${modulePath}`, () =>
      parse(moduleCode, {
        sourceType: 'module',
        sourceFilename: modulePath,
        plugins: [],
      }),
    );

    let foundNode: t.Node | undefined = undefined;
    let foundParentPath: NodePath | undefined = undefined;

    if (binding.path.isImportDefaultSpecifier()) {
      ({ foundNode, foundParentPath } = metadata.state.cache.load(
        `find-default-export-module-node${modulePath}`,
        () => {
          const result = getDefaultExport(ast);
          return {
            foundNode: result?.node,
            foundParentPath: result?.path as NodePath<t.Node>,
          };
        },
      ));
    } else if (binding.path.isImportSpecifier()) {
      const { imported } = binding.path.node;
      const exportName = t.isIdentifier(imported)
        ? imported.name
        : imported.value;
      ({ foundNode, foundParentPath } = metadata.state.cache.load(
        `find-named-export-module-nodemodulePath=${modulePath}&exportName=${exportName}`,
        () => {
          const result = getNamedExport(ast, exportName);
          return {
            foundNode: result?.node,
            foundParentPath: result?.path as NodePath<t.Node>,
          };
        },
      ));
    } else if (binding.path.isImportNamespaceSpecifier()) {
      const { path } = binding;

      foundNode = path.node;
      foundParentPath = path.parentPath;
    } else if (binding.path.isExportNamedDeclaration()) {
      const exportedSpecifier = binding.path
        .get('specifiers')
        .find(({ node }) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          return t.isIdentifier(node.exported, { name: referenceName });
        });

      const exportName =
        exportedSpecifier && t.isExportSpecifier(exportedSpecifier.node)
          ? exportedSpecifier.node.local.name
          : referenceName;
      const isDefaultExport = exportName === 'default';
      ({ foundNode, foundParentPath } = metadata.state.cache.load(
        `${
          isDefaultExport
            ? 'find-default-export-module-node'
            : 'find-named-export-module-node'
        }${
          isDefaultExport
            ? modulePath
            : `modulePath=${modulePath}&exportName=${exportName}`
        }`,
        () => {
          const result = isDefaultExport
            ? getDefaultExport(ast)
            : getNamedExport(ast, exportName);
          return {
            foundNode: result?.node,
            foundParentPath: result?.path as NodePath<t.Node>,
          };
        },
      ));
    }
    if (!foundNode || !foundParentPath) {
      return undefined;
    }

    return {
      constant: binding.constant,
      node: foundNode,
      path: foundParentPath,
      source: 'import',
      metadata: {
        ...metadata,
        parentPath: foundParentPath,
        state: {
          ...metadata.state,
          filename: modulePath,
        },
      },
    };
  }

  return {
    node: binding.path.node as t.Node,
    path: binding.path,
    constant: binding.constant,
    source: 'module',
    metadata,
  };
};
