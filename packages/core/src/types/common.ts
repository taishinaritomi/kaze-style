import type { ClassNameRecord, ClassNameType } from '../ClassName';
import type { CssRule } from '../styleOrder';

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

export type Classes<K extends string> = Record<K, ClassNameType>;
export type RecordClasses<K extends string> = Record<K, ClassNameRecord>;
export type StringClasses<K extends string> = Record<K, string>;

export type ClassNameOverride<
  T = unknown,
  K extends string = 'className',
> = Omit<T, K> & {
  [_ in K]?: ClassNameRecord | string;
};
export type Selectors = [atRules: string[], nest: string];

export type ForBuild = [
  filename: string,
  cssRules: CssRule[],
  styles: [classes: RecordClasses<string>, index: number][],
];
