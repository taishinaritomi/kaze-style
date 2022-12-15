import type { Selectors } from '../types/common';

export const compileCss = (
  selector: string,
  [atRules, nested]: Selectors,
  declaration: string,
): string => {
  let resolvedSelector = '';
  let rule = '';

  if (!nested) {
    resolvedSelector = `${selector}`;
  } else {
    resolvedSelector = `${nested.replace(/&/g, `${selector}`)}`;
  }

  rule = `${resolvedSelector}{${declaration}}`;

  if (atRules.length !== 0) {
    atRules.forEach((atRule) => (rule = `${atRule}{${rule}}`));
  }

  return rule;
};
