import type { ClassName } from '../ClassName';
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

export type Classes<K extends string> = Record<K, ClassName>;
export type PureClasses<K extends string> = Record<K, ClassName['object']>;

export type Selectors = [atRules: string[], nest: string];

export type ForBuild = [
  filename: string,
  cssRules: CssRule[],
  styles: [classes: PureClasses<string>, index: number][],
];
