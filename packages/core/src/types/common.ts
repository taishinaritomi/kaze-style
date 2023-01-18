import type { ClassNameObject, ClassNameType } from '../ClassName';
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
export type ObjectClasses<K extends string> = Record<K, ClassNameObject>;
export type StringClasses<K extends string> = Record<K, string>;

export type ClassNameOverride<
  T = unknown,
  K extends string = 'className',
> = Omit<T, K> & {
  [_ in K]?: ClassNameObject | string;
};
export type Selectors = [atRules: string[], nest: string];

export type ForBuild = [
  filename: string,
  cssRules: CssRule[],
  styles: [classes: ObjectClasses<string>, index: number][],
];
