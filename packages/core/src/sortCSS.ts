import type { Element } from 'stylis';
import { MEDIA } from 'stylis';
import {
  RULESET,
  KEYFRAMES,
  COMMENT,
  serialize,
  stringify,
  compile,
} from 'stylis';

const styleBucketOrdering = [
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
  const childElements = compile(css)
    .filter((element) => element.type !== COMMENT)
    .map((element) => {
      return {
        ...element,
        bucketName: getStyleBucketNameFromElement(element),
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
