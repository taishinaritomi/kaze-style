import type { Pseudos, PropertiesFallback, AtRule } from 'csstype';
import type { CssValue, NestChar } from './common';
import type { AndArray, IncludeStr } from './utils';

type SupportGlobalRules = PropertiesFallback<AndArray<CssValue>>;
type FontFaceRules = AtRule.FontFaceFallback<CssValue>;

type GlobalPseudosRules = {
  [_ in Pseudos]?: SupportGlobalStyle;
};

type GlobalStringRules = {
  [_ in IncludeStr<NestChar>]?: SupportGlobalStyle;
};

type GlobalSelector = keyof HTMLElementTagNameMap | '*';

type PredictGlobalSelector =
  | Pseudos
  | GlobalSelector
  | `${GlobalSelector}${Pseudos}`;

export type SupportGlobalStyle = SupportGlobalRules &
  GlobalPseudosRules &
  GlobalStringRules;

export type KazeGlobalStyle<T extends string> = {
  '@font-face'?: FontFaceRules;
} & {
  [K in T]: K extends '@font-face' ? unknown : SupportGlobalStyle;
} & {
  [_ in PredictGlobalSelector]?: SupportGlobalStyle;
};
