import { resolveStyle } from './resolveStyle';
import type { Classes, ForBuild } from './types/common';
import type { KazeStyle } from './types/style';

enum SerializedKind {
  String = 0,
  Null = 1,
  Number = 2,
  Boolean = 3,
  Array = 4,
  ObjectExpression = 5,
  ObjectProperty = 6,
  Custom = 7,
}

export type SerializedValues = SerializedString | SerializedObjectProperty | SerializedObject | SerializedCustom;

interface SerializedObject {
  kind: SerializedKind.ObjectExpression;
  value: SerializedObjectProperty[];
}

interface SerializedString {
  kind: SerializedKind.String;
  value: string;
}

interface SerializedObjectProperty {
  kind: SerializedKind.ObjectProperty;
  key: string;
  value: SerializedValues;
}

interface SerializedCustom {
  kind: SerializedKind.Custom
  constructor: string;
  value: SerializedValues;
}

// Todo: this is temporary, we would create better utility functions for serializing.
//  but the idea is that people can hook into the transpilation process from typescript.
function serialise(input: Record<string, unknown>): SerializedObject {
  const result: SerializedObjectProperty[] = [];
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string') {
      result.push({
        kind: SerializedKind.ObjectProperty,
        key,
        value: {
          kind: SerializedKind.String,
          value,
        },
      });
    } else if (typeof value === 'object') {
      const nestedValue = serialise(value as Record<string, unknown>);
      result.push({
        kind: SerializedKind.ObjectProperty,
        key,
        value: {
          kind: SerializedKind.Custom,
          constructor: 'ClassName',
          value: nestedValue,
        },
      });
    }
  }
  return {
    kind: SerializedKind.ObjectExpression,
    value: result,
  };
}

export const __preStyle = <K extends string>(
  styles: KazeStyle<K>,
  forBuild: ForBuild<K>,
  filename: string,
  index: number,
): Classes<K> => {
  const [cssRules, classes, staticClasses] = resolveStyle(styles);
  if (forBuild[0] === filename) {
    forBuild[1].push(...cssRules);
    // forBuild[2].push([staticClasses, index]);
    forBuild[2].push({
      index,
      arguments: [serialise(staticClasses)],
    })
  }

  return classes;
};
