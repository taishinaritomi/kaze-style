import type { Pseudos, PropertiesFallback } from 'csstype';
import type { CssValue, NestedChar } from './common';
import type { IncludeChar } from './utils';

type SupportProperties = Omit<PropertiesFallback<CssValue>, 'animationName'>;

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

type CssAnimationNameProperty = {
  animationName?: KeyframesCssRules | string;
};

export type KeyframesCssRules = {
  [_ in 'from' | 'to']?: SupportProperties;
} & {
  [_ in string]?: SupportProperties;
};

export type SupportStyle = SupportProperties &
  PseudosCssRules &
  PredictTypeRules &
  StringCssRules &
  CssAnimationNameProperty;

export type KazeStyle<T extends string> = Record<T, SupportStyle>;
