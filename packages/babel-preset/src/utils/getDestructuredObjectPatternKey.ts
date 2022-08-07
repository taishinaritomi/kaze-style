import { types as t } from '@babel/core';

export const getDestructuredObjectPatternKey = (
  node: t.ObjectPattern,
  referenceName: string,
): string => {
  let result = referenceName;

  for (const property of node.properties) {
    if (t.isObjectProperty(property)) {
      const keyName = t.isIdentifier(property.key) ? property.key.name : '';
      const keyValue = t.isIdentifier(property.value)
        ? property.value.name
        : '';

      if (keyName !== keyValue && keyValue === referenceName) {
        result = keyName;
        break;
      }
    }
  }

  return result;
};
