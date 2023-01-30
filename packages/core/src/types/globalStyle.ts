import type { Pseudos, PropertiesFallback, AtRule } from 'csstype';
import type { CssValue, NestChar } from './common';
import type { AndArray, IncludeString } from './utils';

type SupportGlobalRules = Omit<
  PropertiesFallback<AndArray<CssValue>>,
  'animationName'
>;
type FontFaceRules = AtRule.FontFaceFallback<CssValue>;

type GlobalPseudosRules = {
  [_ in Pseudos]?: SupportGlobalStyle;
};

type GlobalStringRules = {
  [_ in IncludeString<NestChar>]?: SupportGlobalStyle;
};

type GlobalSelector = keyof HTMLElementTagNameMap | '*';

type PredictGlobalSelector =
  | Pseudos
  | GlobalSelector
  | `${GlobalSelector}${Pseudos}`;

type AnimationNameRules = {
  animationName?: KeyframesRules | string;
};

export type KeyframesRules = {
  [_ in 'from' | 'to']?: SupportGlobalRules;
} & {
  [_ in string]?: SupportGlobalRules;
};

export type SupportGlobalStyle = SupportGlobalRules &
  GlobalPseudosRules &
  GlobalStringRules &
  AnimationNameRules;

export type KazeGlobalStyle<T extends string> = {
  '@font-face'?: FontFaceRules;
} & {
  [K in T]: K extends '@font-face' ? unknown : SupportGlobalStyle;
} & {
  [_ in PredictGlobalSelector]?: SupportGlobalStyle;
};
