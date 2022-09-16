import type { Element } from 'stylis';
import {
  RULESET,
  KEYFRAMES,
  MEDIA,
  COMMENT,
  serialize,
  stringify,
  compile,
} from 'stylis';
import {
  GLOBAL_STYLE_END_COMMENT,
  GLOBAL_STYLE_START_COMMENT,
} from './utils/constants';

const styleBucketOrdering = [
  'global',
  'normal',
  'link',
  'visited',
  'focus-within',
  'focus',
  'focus-visible',
  'hover',
  'active',
  'keyframes',
  'at-rules',
  'media',
] as const;

function getStyleBucketNameFromElement(
  element: Element,
): typeof styleBucketOrdering[number] {
  if (element.type === KEYFRAMES) {
    return 'keyframes';
  } else if (element.type.includes(MEDIA)) {
    return 'media';
  }
  return 'normal';
}

function getElementReference(element: Element, suffix = ''): string {
  if (element.type === RULESET || element.type === KEYFRAMES) {
    return element.value + suffix;
  }

  if (Array.isArray(element.children)) {
    return (
      element.value +
      '[' +
      element.children
        .map((child) => getElementReference(child, suffix))
        .join(',') +
      ']'
    );
  }
  return '';
}

export const sortCSS = (css: string): string => {
  let globalFlag = false;
  const childElements = compile(css)
    // .filter((element) => element.type !== COMMENT)
    .map((element) => {
      if (element.type === COMMENT) {
        if (element.value === GLOBAL_STYLE_START_COMMENT) {
          globalFlag = true;
        } else if (element.value === GLOBAL_STYLE_END_COMMENT) {
          globalFlag = false;
        }
      }
      return {
        ...element,
        bucketName: globalFlag
          ? 'global'
          : getStyleBucketNameFromElement(element),
        reference: getElementReference(element),
      };
    });

  const uniqueElements = childElements.reduce<
    Record<string, typeof childElements[number]>
  >((acc, element) => {
    acc[element.reference] = element;
    return acc;
  }, {});

  const sortedElements = Object.values(uniqueElements).sort(
    (elementA, elementB) => {
      if (elementA.bucketName === elementB.bucketName) {
        return 0;
      }
      return (
        styleBucketOrdering.indexOf(elementA.bucketName) -
        styleBucketOrdering.indexOf(elementB.bucketName)
      );
    },
  );
  return serialize(sortedElements, stringify);
};
