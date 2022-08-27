import { hash } from '../hash';
import type { CSSKeyframes } from '../types/style';
import { compileObjectCSS } from './compileObjectCSS';

export const compileKeyFrameCSS = (keyframeObject: CSSKeyframes) => {
  const percentageRules: string[] = [];

  for (const percentage in keyframeObject) {
    const value = keyframeObject[percentage as keyof CSSKeyframes];
    percentageRules.push(`${percentage}{${compileObjectCSS(value || {})}}`);
  }
  const css = percentageRules.join('');
  const keyframeName = `k-${hash(css)}`;
  const keyframesRule = `@keyframes ${keyframeName} {${css}}`;

  return { keyframesRule, keyframeName };
};
