import type { Pseudos, PropertiesFallback, AtRule } from 'csstype';
import type { CssValue, NestedChar } from './common';
import type { AndArray, IncludeChar, ObjKey } from './utils';

type SupportGlobalProperties = PropertiesFallback<AndArray<CssValue>>;
type FontFaceProperties = AtRule.FontFaceFallback<CssValue>;

type GlobalPseudosCssRules = {
  [_ in Pseudos]?: SupportGlobalStyle;
};

type GlobalStringCssRules = {
  [_ in IncludeChar<NestedChar>]?: SupportGlobalStyle;
};

type GlobalSelector = keyof HTMLElementTagNameMap | '*';

type PredictGlobalSelector =
  | Pseudos
  | GlobalSelector
  | `${GlobalSelector}${Pseudos}`;

export type SupportGlobalStyle = SupportGlobalProperties &
  GlobalPseudosCssRules &
  GlobalStringCssRules;

export type KazeGlobalStyle<T extends ObjKey> = {
  '@font-face'?: FontFaceProperties;
} & {
  [K in T]: K extends '@font-face' ? unknown : SupportGlobalStyle;
} & {
  [_ in PredictGlobalSelector]?: SupportGlobalStyle;
};
