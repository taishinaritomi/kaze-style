import type { Pseudos, PropertiesFallback, AtRule } from 'csstype';
import type { ClassName } from '../ClassName';
import type { AndArray, IncludeChar } from './utils';

export type CssValue = string | number;

type PredictType =
  | '@media (max-width: 0)'
  | '@media (min-width: 0)'
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
    ':' | '&' | ' ' | '@' | ',' | '>' | '~' | '+' | '[' | '.' | '#'
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

export type SupportProperties = Omit<
  PropertiesFallback<CssValue>,
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

type GlobalSelector = keyof HTMLElementTagNameMap | '*';

type PredictGlobalSelector =
  | Pseudos
  | GlobalSelector
  | `${GlobalSelector}${Pseudos}`

export type KazeGlobalStyle = {
  '@font-face'?: FontFaceStyle;
} & {
  [_ in PredictGlobalSelector]?: SupportGlobalStyle;
} & Record<string, SupportGlobalStyle> &
  Record<string, Record<string, AndArray<CssValue>>>;

export type Classes<K extends string> = Record<K, string>;
export type ClassesObject<K extends string> = Record<K, ClassName['object']>;
