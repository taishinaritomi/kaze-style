import type { Pseudos, PropertiesFallback } from 'csstype';
import type { CssValue, NestChar } from './common';
import type { IncludeStr } from './utils';

type SupportRules = Omit<PropertiesFallback<CssValue>, 'animationName'>;

type PredictProperties =
  | '@media (max-width: 0)'
  | '@media (min-width: 0)'
  | '@media (prefers-color-scheme: dark)'
  | '@media (prefers-color-scheme: light)'
  | '@layer utilities'
  | '@layer base'
  | '@supports ()'
  | '@supports not ()';

type PredictRules = {
  [_ in PredictProperties]?: SupportStyle;
};

type PseudosRules = {
  [_ in Pseudos]?: SupportStyle;
};

type StringRules = {
  [_ in IncludeStr<NestChar>]?: SupportStyle;
};

type AnimationNameRules = {
  animationName?: KeyframesRules | string;
};

export type KeyframesRules = {
  [_ in 'from' | 'to']?: SupportRules;
} & {
  [_ in string]?: SupportRules;
};

export type SupportStyle = SupportRules &
  PseudosRules &
  PredictRules &
  StringRules &
  AnimationNameRules;

export type KazeStyle<T extends string> = Record<T, SupportStyle>;
