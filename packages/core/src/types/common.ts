import type { ClassNameRecord, ClassNameType } from '../ClassName';
import type { CssRule } from '../styleOrder';
import type { StartString } from './utils';

export type CssValue = string | number | undefined;

export type NestChar =
  | ':'
  | '&'
  | ' '
  | '@'
  | ','
  | '>'
  | '~'
  | '+'
  | '['
  | '.'
  | '#';

export type Classes<T extends string> = {
  [P in T]: StartString<P> extends '$' ? ClassNameType : string;
};

export type StaticClasses<T extends string> = Record<
  T,
  string | ClassNameRecord
>;

export type StringClasses<K extends string> = Record<K, string>;

export type ClassNameOverride<
  T = unknown,
  K extends string = 'className',
> = Omit<T, K> & {
  [_ in K]?: ClassNameRecord | string;
};
export type Selectors = [atRules: string[], nest: string];

export type ForBuild<T extends string = string> = [
  filename: string,
  cssRules: CssRule[],
  styles: [classes: StaticClasses<T>, index: number][],
];
