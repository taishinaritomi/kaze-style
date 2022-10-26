import type { Pseudos, PropertiesFallback, AtRule } from 'csstype';
import type { ClassName } from '../ClassName';
import type { AndArray, IncludeChar } from './utils';

export type CssValue = string | number | undefined;

type NestedChar =
  | ':'
  | '&'
  | ' '
  | '@'
  | ','
  | '>'
  | '~'
  | '+'
  | '['
  | '.'
  | '#';

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

type PseudosCssRules = {
  [_ in Pseudos]?: SupportStyle;
};

type StringCssRules = {
  [_ in IncludeChar<NestedChar>]?: SupportStyle;
};

export type KeyframesCssRules = {
  [_ in 'from' | 'to']?: SupportProperties;
} & {
  [_ in string]?: SupportProperties;
};

type CssAnimationNameProperty = {
  animationName?: KeyframesCssRules | string;
};

export type SupportProperties = Omit<
  PropertiesFallback<CssValue>,
  'animationName'
>;

export type SupportStyle = SupportProperties &
  PseudosCssRules &
  PredictTypeRules &
  StringCssRules &
  CssAnimationNameProperty;

export type KazeStyle<T extends string> = Record<T, SupportStyle>;

type SupportGlobalProperties = PropertiesFallback<AndArray<CssValue>>;

type GlobalPseudosCssRules = {
  [_ in Pseudos]?: SupportGlobalStyle;
};

type GlobalStringCssRules = {
  [P in IncludeChar<NestedChar>]?: P extends '@font-face'
    ? FontFaceStyle
    : SupportGlobalStyle;
};

export type SupportGlobalStyle = SupportGlobalProperties &
  GlobalPseudosCssRules &
  GlobalStringCssRules;

type FontFaceStyle = AtRule.FontFaceFallback<CssValue> &
  AtRule.FontFaceHyphenFallback<CssValue>;

type GlobalSelector = keyof HTMLElementTagNameMap | '*';

type PredictGlobalSelector =
  | Pseudos
  | GlobalSelector
  | `${GlobalSelector}${Pseudos}`;

export type KazeGlobalStyle = {
  '@font-face'?: FontFaceStyle;
} & {
  [_ in PredictGlobalSelector]?: SupportGlobalStyle;
} & Record<string, Record<string, AndArray<CssValue>> | SupportGlobalStyle>;

export type Classes<K extends string> = Record<K, string>;
export type ClassesObject<K extends string> = Record<K, ClassName['object']>;
