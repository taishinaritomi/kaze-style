import { hash } from '../hash';
import type { CSSKeyframesRules } from '../types/style';
import { compileObjectCSS } from './compileObjectCSS';

export const compileKeyFrameCSS = (keyframeObject: CSSKeyframesRules) => {
  const percentageRules: string[] = [];

  for (const percentage in keyframeObject) {
    const value = keyframeObject[percentage as keyof CSSKeyframesRules];
    percentageRules.push(`${percentage}{${compileObjectCSS(value || {})}}`);
  }
  const css = percentageRules.join('');
  const keyframeName = `_${hash(css)}`;
  const keyframesRule = `@keyframes ${keyframeName} {${css}}`;

  return { keyframesRule, keyframeName };
};
