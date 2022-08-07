import type { Binding } from '@babel/traverse';

export const getModuleImportSource = (path: Binding['path']): string => {
  if (path.parentPath?.isImportDeclaration()) {
    return path.parentPath.node.source.value;
  }
  if (path.isExportNamedDeclaration()) {
    return path.node.source?.value || '';
  }
  return '';
};
