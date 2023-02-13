import type { ClassName } from '../ClassName';
import type { CssRule } from '../styleOrder';
import type { FirstChar } from './utils';

export type Classes<T extends string> = {
  [P in T]: FirstChar<P> extends '$' ? ClassName['Type'] : string;
};

export type StaticClasses<T extends string> = Record<
  T,
  ClassName['String'] | ClassName['Static']
>;

export type ClassNameOverride<T, K extends string = '$className'> = Omit<
  T,
  K
> & {
  [_ in K]?: ClassName['Type'] | ClassName['Static'];
};

export type ClassOverride<T, K extends string = '$class'> = ClassNameOverride<
  T,
  K
>;

export type Selectors = [selector: string, atRules: string[], groups: string];

export type ForBuild<T extends string = string> = [
  filename: string,
  cssRules: CssRule[],
  styles: [classes: StaticClasses<T>, index: number][],
];
