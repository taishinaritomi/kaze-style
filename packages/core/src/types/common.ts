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

export type Classes<K extends string> = Record<K, string>;
export type ClassesObject<K extends string> = Record<K, ClassName['object']>;

export type Selectors = {
  nested: string;
  atRules: string[];
};

export type ForBuild = {
  filename: string;
  globalStyles: {
    cssRules: CssRule[];
    index: number;
  }[];
  styles: {
    classesObject: ClassesObject<string>;
    cssRules: CssRule[];
    index: number;
  }[];
};
