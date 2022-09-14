import type {
  AtRules,
  Pseudos,
  PropertiesFallback,
  StandardShorthandProperties,
} from 'csstype';
import type { NestedObject } from './utils';

export type CSSValue = string | number;

type CSSPseudos = {
  [_ in Pseudos]?: SupportedAllStyle;
};

type CSSAtRules = {
  [_ in AtRules]?: SupportedAllStyle;
};

export type CSSKeyframes = Record<
  'from' | 'to' | string,
  SupportedCSSProperties
>;

type CSSAnimationNameProperty = {
  animationName?: CSSKeyframes | string;
};

export const supportedShorthandProperties = [
  'margin',
  'padding',
  'gap',
  'inset',
  'overflow',
  'borderRadius',
] as const;

export type SupportedShorthandProperties =
  typeof supportedShorthandProperties[number];

export type SupportedCSSProperties = Omit<
  PropertiesFallback<CSSValue>,
  | 'animationName'
  | keyof Omit<StandardShorthandProperties, SupportedShorthandProperties>
>;

export type SupportedAllStyle = SupportedCSSProperties &
  CSSPseudos &
  CSSAtRules &
  CSSAnimationNameProperty;

export type KazeStyle = NestedObject<
  NestedObject<NestedObject<NestedObject<NestedObject<SupportedAllStyle>>>>
>;

export type ResolvedStyle = {
  cssRules: string[];
  classes: Record<string, string>;
  index: number;
};
