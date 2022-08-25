import type {
  AtRules,
  Pseudos,
  PropertiesFallback,
  StandardShorthandProperties,
} from 'csstype';

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

type CSSNestProperties = {
  [_: string]: SupportedAllStyle;
};

export type KazeStyle = SupportedAllStyle | CSSNestProperties;

export type ResolvedStyle = {
  cssRules: string[];
  classes: Record<string, string>;
};
