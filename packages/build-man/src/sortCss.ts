import type { StyleOrder } from '@kaze-style/core';
import { styleOrder } from '@kaze-style/core';
import type { Element } from 'stylis';
import { RULESET, KEYFRAMES, serialize, stringify, compile } from 'stylis';

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

export const sortCss = (css: string): string => {
  const otherElements: Element[] = [];
  const targetElements: (Element & {
    bucketName: StyleOrder;
    reference: string;
  })[] = [];

  compile(css).forEach((element) => {
    if (element.value.startsWith('@layer kaze')) {
      targetElements.push(
        ...(element.children as Element[]).map((childElement) => {
          return {
            ...childElement,
            bucketName: element.value.substr(11) as StyleOrder,
            reference: getElementReference(childElement),
          };
        }),
      );
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
        styleOrder.indexOf(elementA.bucketName) -
        styleOrder.indexOf(elementB.bucketName)
      );
    },
  );
  return serialize([...otherElements, ...sortedTargetElements], stringify);
};
