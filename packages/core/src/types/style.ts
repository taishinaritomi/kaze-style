import type {
  PropertiesFallback,
  AtRule,
  Pseudos,
  HtmlAttributes,
  SvgAttributes,
} from 'csstype';
import type { IncludeString } from './utils';

export type CssValue = string | number | undefined;

type Properties = PropertiesFallback<CssValue>;

type SelectorChar =
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

type PredictProperties =
  | '@media (max-width: 0)'
  | '@media (min-width: 0)'
  | '@media (prefers-color-scheme: dark)'
  | '@media (prefers-color-scheme: light)'
  | '@layer utilities'
  | '@layer base'
  | '@supports ()'
  | '@supports not ()';

type SupportRules = Omit<Properties, 'animationName'> & {
  animationName?:
    | string
    | KeyframesRules
    | Exclude<Properties['animationName'], string>;
};

type FontFaceRules = AtRule.FontFaceFallback<CssValue>;

export type KeyframesRules = {
  [_ in 'from' | 'to']?: SupportRules;
} & {
  [_ in string]?: SupportRules;
};

export type SupportStyle = SupportRules & {
  [_ in
    | PredictProperties
    | (Pseudos | `&${Pseudos}`)
    | (HtmlAttributes | SvgAttributes)
    | `&${HtmlAttributes | SvgAttributes}`]?: SupportStyle;
} & {
  [_ in IncludeString<SelectorChar>]?: SupportStyle;
};

export type KazeStyle<T extends string> = Record<T, SupportStyle>;

export type KazeGlobalStyle<T extends string> = {
  '@font-face'?: FontFaceRules;
} & {
  [K in T]: K extends '@font-face' ? FontFaceRules : SupportStyle;
} & {
  [_ in
    | (keyof HTMLElementTagNameMap | '*')
    | `${keyof HTMLElementTagNameMap | '*'}${Pseudos}`]?: SupportStyle;
};
