import type { StyleOrder } from '../styleOrder';
import { styleOrder } from '../styleOrder';

type StyleElement = HTMLStyleElement & { rules: string[] };

const styleElements = {} as Record<StyleOrder, StyleElement>;

export const getStyleElements = () => {
  if (styleElements[styleOrder[0]] === undefined) {
    styleOrder.forEach((order) => {
      const style = document.createElement('style') as StyleElement;
      style.rules = [];
      style.id = `kaze-${order}`;
      document.head.appendChild(style);
      Object.assign(styleElements, { [order]: style });
    });
  }
  return styleElements;
};
