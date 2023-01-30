import type { Selectors } from '../types/common';

export const compileCss = (
  _selector: string,
  [atRules, nest]: Selectors,
  declaration: string,
): string => {
  const selector = !nest
    ? `${_selector}`
    : `${nest.replace(/&/g, `${_selector}`)}`;

  let css = `${selector}{${declaration}}`;

  if (atRules.length !== 0) {
    atRules.forEach((atRule) => (css = `${atRule}{${css}}`));
  }

  return css;
};
