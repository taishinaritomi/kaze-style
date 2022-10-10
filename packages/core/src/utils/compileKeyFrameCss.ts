import { hash } from '../hash';
import type { CssKeyframesRules } from '../types/style';
import { compileObjectCss } from './compileObjectCss';

export const compileKeyFrameCss = (keyframeObject: CssKeyframesRules) => {
  const percentageRules: string[] = [];

  for (const percentage in keyframeObject) {
    const value = keyframeObject[percentage as keyof CssKeyframesRules];
    percentageRules.push(`${percentage}{${compileObjectCss(value || {})}}`);
  }
  const css = percentageRules.join('');
  const keyframeName = `_${hash(css)}`;
  const keyframesRule = `@keyframes ${keyframeName} {${css}}`;

  return { keyframesRule, keyframeName };
};
