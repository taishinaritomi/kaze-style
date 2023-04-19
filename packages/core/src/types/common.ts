import type { ClassName } from '../ClassName';
import type { StyleOrder } from '../styleOrder';
import type { Ast } from './ast';
import type { FirstChar } from './utils';

export type CssRule = [value: string, order: StyleOrder];

export type Classes<T extends string> = {
  [P in T]: FirstChar<P> extends '$' ? ClassName['Type'] : string;
};

export type StaticClasses<T extends string> = Record<
  T,
  ClassName['String'] | ClassName['Static']
>;

export type ClassNameOverride<T, K extends string = 'className'> = Omit<
  T,
  K
> & {
  [_ in K]?: ClassName['Type'] | ClassName['Static'] | string;
};

export type ClassOverride<T, K extends string = 'class'> = ClassNameOverride<
  T,
  K
>;

export type Selectors = [selector: string, atRules: string[], groups: string];

export type BuildInfo = {
  filename: string;
  injector: Injector;
};

export type Injector = {
  filename: string;
  cssRules: CssRule[];
  args: Array<{ value: Ast.Node[]; index: number }>;
};
