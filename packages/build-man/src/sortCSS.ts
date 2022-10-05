import type { Element } from 'stylis';
import {
  RULESET,
  KEYFRAMES,
  MEDIA,
  serialize,
  stringify,
  compile,
} from 'stylis';
import {
  GLOBAL_STYLE_LAYER,
  NORMAL_STYLE_LAYER,
  styleBucketOrdering,
} from './constants';

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
  const otherElements: Element[] = [];
  const targetElements: (Element & {
    bucketName: typeof styleBucketOrdering[number];
    reference: string;
  })[] = [];
  const globalElements: Element[] = [];

  compile(css).forEach((element) => {
    if (element.value === `@layer ${NORMAL_STYLE_LAYER}`) {
      targetElements.push(
        ...(element.children as Element[]).map((element) => ({
          ...element,
          bucketName: getStyleBucketNameFromElement(element),
          reference: getElementReference(element),
        })),
      );
    } else if (element.value === `@layer ${GLOBAL_STYLE_LAYER}`) {
      globalElements.push(...(element.children as Element[]));
    } else {
      otherElements.push(element);
    }
  });

  const uniqueTargetElements = targetElements.reduce<
    Record<string, typeof targetElements[number]>
  >((acc, element) => {
    acc[element.reference] = element;
    return acc;
  }, {});

  const sortedTargetElements = Object.values(uniqueTargetElements).sort(
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
  return serialize(
    [...globalElements, ...otherElements, ...sortedTargetElements],
    stringify,
  );
};
