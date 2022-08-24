import type {
  AtRules,
  Pseudos,
  PropertiesFallback,
  StandardShorthandProperties,
} from 'csstype';

type CSSPseudos = {
  [_ in Pseudos]?: SupportedCSSProperties;
};

type CSSAtRules = {
  [_ in AtRules]?: SupportedCSSProperties;
};

type CSSNestProperties = {
  [_: string]: SupportedCSSProperties;
};

export type CSSKeyframes = Record<
  'from' | 'to' | string,
  SupportedCSSProperties
>;

type CSSAnimationNameProperty = {
  animationName?: CSSKeyframes | string;
};

type SupportedCSSProperties = Omit<
  PropertiesFallback<string | 0>,
  'animationName' | keyof StandardShorthandProperties
> &
  CSSPseudos &
  CSSAtRules &
  CSSAnimationNameProperty;

export type KazeStyle = SupportedCSSProperties | CSSNestProperties;

export type ResolvedStyle = {
  cssRules: string[];
  classes: Record<string, string>;
};
