import type { Selectors } from '../types/common';

export const compileCss = (
  _baseSelector: string,
  [selector, atRules]: Selectors,
  declaration: string,
): string => {
  const baseSelector = selector
    ? `${selector.replace(/&/g, `${_baseSelector}`)}`
    : `${_baseSelector}`;

  let css = `${baseSelector}{${declaration}}`;

  if (atRules.length !== 0) {
    atRules.forEach((atRule) => (css = `${atRule}{${css}}`));
  }

  return css;
};
