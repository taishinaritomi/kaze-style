import type {
  Pseudos,
  PropertiesFallback,
  PropertiesHyphenFallback,
  AtRule,
} from 'csstype';
import type { ClassName } from '../ClassName';
import type { AndArray, NestedObject, TrimPrefix } from './utils';

export type CSSValue = string | number;

type PredictType =
  | '@media screen and (max-width: 0)'
  | '@media screen and (min-width: 0)'
  | '@media (prefers-color-scheme: dark)'
  | '@media (prefers-color-scheme: light)'
  | '@layer utilities'
  | '@layer base'
  | '@supports ()'
  | '@supports not ()';

type PredictTypeRules = {
  [_ in PredictType]?: SupportedAllStyle;
};

type CSSPseudosRules = {
  [_ in Pseudos]?: SupportedAllStyle;
};

export type CSSKeyframesRules = {
  [_ in 'from' | 'to' | string]?: SupportedCSSProperties;
};

type CSSAnimationNameProperty = {
  animationName?: CSSKeyframesRules | string;
};

const supportShorthandProperties = [
  'margin',
  'padding',
  'gap',
  'inset',
  'overflow',
  'outline',
  'borderRadius',
] as const;

export type SupportShorthandProperties = {
  [Properties in `$${typeof supportShorthandProperties[number]}`]?: PropertiesFallback<CSSValue>[TrimPrefix<
    Properties,
    '$'
  >];
};

export type SupportedCSSProperties = Omit<
  PropertiesFallback<CSSValue> &
    PropertiesHyphenFallback<CSSValue> &
    SupportShorthandProperties,
  'animationName' | 'animation-name'
>;

type SupportedAllStyle = SupportedCSSProperties &
  CSSPseudosRules &
  PredictTypeRules &
  CSSAnimationNameProperty;

export type KazeStyle = NestedObject<
  NestedObject<NestedObject<NestedObject<NestedObject<SupportedAllStyle>>>>
>;

type SupportedGlobalStyle = PropertiesFallback<CSSValue> &
  PropertiesHyphenFallback<CSSValue>;

type FontFaceStyle = AtRule.FontFaceFallback<CSSValue> &
  AtRule.FontFaceHyphenFallback<CSSValue>;

type PredictGlobalSelector =
  | 'body'
  | 'html'
  | '*'
  | '::before,::after'
  | '*,::before,::after';

export type KazeGlobalStyle = {
  '@font-face'?: FontFaceStyle;
} & {
  [_ in PredictGlobalSelector]?: SupportedGlobalStyle;
} & Record<string, SupportedGlobalStyle> &
  Record<string, Record<string, AndArray<CSSValue>>>;

export type CssRules = string[];
export type Classes<K extends string> = Record<K, string>;
export type ClassesObject<K extends string> = Record<K, ClassName['object']>;
