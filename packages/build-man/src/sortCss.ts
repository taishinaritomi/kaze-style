import type { StyleOrder } from '@kaze-style/core';
import { styleOrder } from '@kaze-style/core';
import type { Element } from 'stylis';
import { serialize, stringify, compile } from 'stylis';
import { layerPrefix } from './utils/constants';
import { createElementKey } from './utils/createElementKey';

type TargetElement = Element & {
  bucketName: StyleOrder;
  key: string;
};

export const sortCss = (css: string): string => {
  const otherElements: Element[] = [];
  const targetElements: TargetElement[] = [];

  compile(css).forEach((element) => {
    if (element.value.startsWith(`@layer ${layerPrefix}`)) {
      targetElements.push(
        ...(element.children as Element[]).map((childElement) => {
          return {
            ...childElement,
            bucketName: element.value.substring(
              `@layer ${layerPrefix}`.length,
            ) as StyleOrder,
            key: createElementKey(childElement),
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
    acc[element.key] = element;
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
