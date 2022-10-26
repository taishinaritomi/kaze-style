import type { Selectors } from '../resolveStyle';

type CompileCss = {
  selector: string;
  selectors: Selectors;
  declaration: string;
};

export const compileCss = ({
  selector,
  selectors: { nested, atRules },
  declaration,
}: CompileCss): string => {
  let resolvedSelector = '';
  let rule = '';

  if (!nested) {
    resolvedSelector = `${selector}`;
  } else {
    resolvedSelector = `${nested.replace(/&/g, `${selector}`)}`;
  }

  rule = `${resolvedSelector}{${declaration}}`;

  if (atRules.length !== 0) {
    atRules.forEach((atRule) => (rule = `${atRule} {${rule}}`));
  }

  return rule;
};
