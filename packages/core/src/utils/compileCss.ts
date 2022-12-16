import type { Selectors } from '../types/common';

export const compileCss = (
  selector: string,
  [atRules, nest]: Selectors,
  declaration: string,
): string => {
  let resolvedSelector = '';
  let rule = '';

  if (!nest) {
    resolvedSelector = `${selector}`;
  } else {
    resolvedSelector = `${nest.replace(/&/g, `${selector}`)}`;
  }

  rule = `${resolvedSelector}{${declaration}}`;

  if (atRules.length !== 0) {
    atRules.forEach((atRule) => (rule = `${atRule}{${rule}}`));
  }

  return rule;
};
