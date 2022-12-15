import type { ClassName } from '../ClassName';
import type { CssRule } from '../styleOrder';

export type CssValue = string | number | undefined;

export type NestedChar =
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
export type PureClasses<K extends string> = Record<K, ClassName['o']>;

export type Selectors = [atRules: string[], nested: string];

export type ForBuild = [
  filename: string,
  cssRules: CssRule[],
  styles: [classes: PureClasses<string>, index: number][],
];
