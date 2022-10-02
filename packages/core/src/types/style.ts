import type {
  Pseudos,
  PropertiesFallback,
  PropertiesHyphenFallback,
} from 'csstype';
import type { ClassName } from '../utils/ClassName';
import type { NestedObject, TrimPrefix } from './utils';

export type CSSValue = string | number;

type CSSPseudos = {
  [_ in Pseudos]?: SupportedAllStyle;
};

type PredictType =
  | '@media screen and (max-width: 0)'
  | '@media screen and (min-width: 0)'
  | '@media (prefers-color-scheme: dark)'
  | '@media (prefers-color-scheme: light)';

type PredictTypeRules = {
  [_ in PredictType]?: SupportedAllStyle;
};

export type CSSKeyframes = Record<
  'from' | 'to' | string,
  SupportedCSSProperties
>;

type CSSAnimationNameProperty = {
  animationName?: CSSKeyframes | string;
};

export const supportShorthandProperties = [
  'margin',
  'padding',
  'gap',
  'inset',
  'overflow',
  'outline',
  'borderRadius',
] as const;

export type SupportShorthandProperties = {
  [Properties in `$${typeof supportShorthandProperties[number]}`]?: PropertiesFallback<CSSValue>[TrimPrefix<
    Properties,
    '$'
  >];
};

export type SupportedCSSProperties = Omit<
  PropertiesFallback<CSSValue> &
    PropertiesHyphenFallback<CSSValue> &
    SupportShorthandProperties,
  'animationName' | 'animation-name'
>;

export type SupportedAllStyle = SupportedCSSProperties &
  CSSPseudos &
  PredictTypeRules &
  CSSAnimationNameProperty;

export type KazeStyle = NestedObject<
  NestedObject<NestedObject<NestedObject<NestedObject<SupportedAllStyle>>>>
>;

export type KazeGlobalStyle = PropertiesFallback<CSSValue> &
  PropertiesHyphenFallback<CSSValue>;

export type CssRules = string[];
export type Classes<K extends string> = Record<K, string>;
export type ClassesObject<K extends string> = Record<K, ClassName['object']>;
