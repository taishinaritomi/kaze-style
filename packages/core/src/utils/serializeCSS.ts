import type { Middleware } from 'stylis';
import {
  compile,
  middleware,
  prefixer,
  rulesheet,
  serialize,
  stringify,
} from 'stylis';

type Option = {
  prefix?: boolean;
};

const option: Option = {
  prefix: true,
};

export const serializeCSS = (
  css: string,
  { prefix }: Option = option,
): string[] => {
  const rules: string[] = [];

  const collection: Middleware[] = [
    stringify,
    rulesheet((rule) => rules.push(rule)),
  ];
  prefix && collection.unshift(prefixer);

  serialize(compile(css), middleware(collection));
  return rules;
};
