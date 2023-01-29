import type { StyleOrder } from '../styleOrder';
import { styleOrder } from '../styleOrder';

type StyleElement = HTMLStyleElement & { r: string[] };

const styleElements = {} as Record<StyleOrder, StyleElement>;

export const getStyleElements = () => {
  if (styleElements[styleOrder[0]] === undefined) {
    styleOrder.forEach((order) => {
      const styleElement = document.createElement('style') as StyleElement;
      styleElement.r = [];
      styleElement.id = `kaze-${order}`;
      document.head.appendChild(styleElement);
      Object.assign(styleElements, { [order]: styleElement });
    });
  }
  return styleElements;
};
