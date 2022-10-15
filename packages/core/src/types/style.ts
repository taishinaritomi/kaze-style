import type { Pseudos, PropertiesFallback, AtRule } from 'csstype';
import type { ClassName } from '../ClassName';
import type { AndArray, IncludeChar, TrimPrefix } from './utils';

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
  [_ in PredictType]?: SupportStyle;
};

type CssPseudosRules = {
  [_ in Pseudos]?: SupportStyle;
};

type CssStringRules = {
  [_ in IncludeChar<
    ':' | '&' | ' ' | '@' | ',' | '>' | '~' | '+' | '['
  >]?: SupportStyle;
};

export type CssKeyframesRules = {
  [_ in 'from' | 'to']?: SupportProperties;
} & {
  [_ in string]?: SupportProperties;
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

export type SupportProperties = Omit<
  PropertiesFallback<CssValue> & SupportShorthandProperties,
  'animationName'
>;

export type SupportStyle = SupportProperties &
  CssPseudosRules &
  PredictTypeRules &
  CssStringRules &
  CssAnimationNameProperty;

export type KazeStyle<T extends string> = Record<T, SupportStyle>;

export type SupportGlobalStyle = PropertiesFallback<CssValue>;

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
  [_ in PredictGlobalSelector]?: SupportGlobalStyle;
} & Record<string, SupportGlobalStyle> &
  Record<string, Record<string, AndArray<CssValue>>>;

export type Classes<K extends string> = Record<K, string>;
export type ClassesObject<K extends string> = Record<K, ClassName['object']>;
