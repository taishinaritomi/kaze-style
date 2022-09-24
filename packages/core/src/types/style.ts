import type {
  AtRules,
  Pseudos,
  PropertiesFallback,
  StandardShorthandProperties,
} from 'csstype';
import type { ClassName } from '../utils/ClassName';
import type { NestedObject } from './utils';

export type CSSValue = string | number;

type CSSPseudos = {
  [_ in Pseudos]?: SupportedAllStyle;
};

type CSSAtRules = {
  [_ in AtRules]?: SupportedAllStyle;
};

export type CSSKeyframes = Record<
  'from' | 'to' | string,
  SupportedCSSProperties
>;

type CSSAnimationNameProperty = {
  animationName?: CSSKeyframes | string;
};

export const supportedShorthandProperties = [
  'margin',
  'padding',
  'gap',
  'inset',
  'overflow',
  'outline',
  'borderRadius',
] as const;

export type SupportedShorthandProperties =
  typeof supportedShorthandProperties[number];

export type SupportedCSSProperties = Omit<
  PropertiesFallback<CSSValue>,
  | 'animationName'
  | keyof Omit<StandardShorthandProperties, SupportedShorthandProperties>
>;

export type SupportedAllStyle = SupportedCSSProperties &
  CSSPseudos &
  CSSAtRules &
  CSSAnimationNameProperty;

export type KazeStyle = NestedObject<
  NestedObject<NestedObject<NestedObject<NestedObject<SupportedAllStyle>>>>
>;

export type KazeGlobalStyle = PropertiesFallback<CSSValue>;

export type CssRules = string[];
export type Classes<K extends string> = Record<K, string>;
export type ClassesObject<K extends string> = Record<K, ClassName['object']>;
