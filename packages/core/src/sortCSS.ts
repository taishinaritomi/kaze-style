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
  STYLE_END_COMMENT,
  STYLE_START_COMMENT,
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
  let targetFlag = false;
  let globalFlag = false;

  const otherElements: Element[] = [];
  const targetElements: (Element & {
    bucketName: typeof styleBucketOrdering[number];
    reference: string;
  })[] = [];
  const globalElements: Element[] = [];

  compile(css).forEach((element) => {
    if (element.type === COMMENT) {
      if (element.value === GLOBAL_STYLE_START_COMMENT) {
        globalFlag = true;
      } else if (element.value === GLOBAL_STYLE_END_COMMENT) {
        globalFlag = false;
      }
      if (element.value === STYLE_START_COMMENT) {
        targetFlag = true;
      } else if (element.value === STYLE_END_COMMENT) {
        targetFlag = false;
      }
    } else if (targetFlag) {
      targetElements.push({
        ...element,
        bucketName: getStyleBucketNameFromElement(element),
        reference: getElementReference(element),
      });
    } else if (globalFlag) {
      globalElements.push(element);
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
