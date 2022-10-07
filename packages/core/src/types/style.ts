import type {
  Pseudos,
  PropertiesFallback,
  PropertiesHyphenFallback,
  AtRule,
} from 'csstype';
import type { ClassName } from '../ClassName';
import type { AndArray, NestedObject, TrimPrefix } from './utils';

export type CssValue = string | number;

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

type CssPseudosRules = {
  [_ in Pseudos]?: SupportedAllStyle;
};

export type CssKeyframesRules = {
  [_ in 'from' | 'to' | string]?: SupportedCssProperties;
};

type CssAnimationNameProperty = {
  animationName?: CssKeyframesRules | string;
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
  [Properties in `$${typeof supportShorthandProperties[number]}`]?: PropertiesFallback<CssValue>[TrimPrefix<
    Properties,
    '$'
  >];
};

export type SupportedCssProperties = Omit<
  PropertiesFallback<CssValue> &
    PropertiesHyphenFallback<CssValue> &
    SupportShorthandProperties,
  'animationName' | 'animation-name'
>;

type SupportedAllStyle = SupportedCssProperties &
  CssPseudosRules &
  PredictTypeRules &
  CssAnimationNameProperty;

export type KazeStyle = NestedObject<
  NestedObject<NestedObject<NestedObject<NestedObject<SupportedAllStyle>>>>
>;

type SupportedGlobalStyle = PropertiesFallback<CssValue> &
  PropertiesHyphenFallback<CssValue>;

type FontFaceStyle = AtRule.FontFaceFallback<CssValue> &
  AtRule.FontFaceHyphenFallback<CssValue>;

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
  Record<string, Record<string, AndArray<CssValue>>>;

export type CssRules = string[];
export type Classes<K extends string> = Record<K, string>;
export type ClassesObject<K extends string> = Record<K, ClassName['object']>;
