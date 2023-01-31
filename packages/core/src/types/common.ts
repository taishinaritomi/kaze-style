import type { ClassNameRecord, ClassNameType } from '../ClassName';
import type { CssRule } from '../styleOrder';
import type { FirstChar } from './utils';

export type Classes<T extends string> = {
  [P in T]: FirstChar<P> extends '$' ? ClassNameType : string;
};

export type StaticClasses<T extends string> = Record<
  T,
  string | ClassNameRecord
>;

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
