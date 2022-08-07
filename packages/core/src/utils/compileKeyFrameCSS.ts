import { hash } from '../hash';
import type { CSSKeyframes } from '../types/Style';
import { compileObjectCSS } from './compileObjectCSS';
import { serializeCSS } from './serializeCSS';

export const compileKeyFrameCSS = (keyframeObject: CSSKeyframes) => {
  const percentageRules: string[] = [];

  for (const percentage in keyframeObject) {
    const value = keyframeObject[percentage as keyof CSSKeyframes];
    percentageRules.push(`${percentage}{${compileObjectCSS(value || {})}}`);
  }
  const css = percentageRules.join();
  const keyframeName = `k-${hash(css)}`;
  const keyframesRules = serializeCSS(`@keyframes ${keyframeName} {${css}}`);

  return { keyframesRules, keyframeName };
};
