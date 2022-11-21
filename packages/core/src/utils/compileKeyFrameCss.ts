import { hash } from '../hash';
import type { KeyframesRules } from '../types/style';
import { compileObjectCss } from './compileObjectCss';

export const compileKeyFrameCss = (keyframeObject: KeyframesRules) => {
  const percentageRules: string[] = [];

  for (const percentage in keyframeObject) {
    const value = keyframeObject[percentage];
    percentageRules.push(
      `${compileObjectCss({
        selector: percentage,
        style: value || {},
      }).join('')}`,
    );
  }
  const css = percentageRules.join('');
  const keyframeName = `_${hash(css)}`;
  const keyframesRule = `@keyframes ${keyframeName}{${css}}`;

  return { keyframesRule, keyframeName };
};
