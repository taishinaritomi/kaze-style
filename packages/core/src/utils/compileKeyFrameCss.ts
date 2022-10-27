import { hash } from '../hash';
import type { KeyframesCssRules } from '../types/style';
import { compileObjectCss } from './compileObjectCss';

export const compileKeyFrameCss = (keyframeObject: KeyframesCssRules) => {
  const percentageRules: string[] = [];

  for (const percentage in keyframeObject) {
    const value = keyframeObject[percentage as keyof KeyframesCssRules];
    percentageRules.push(
      `${compileObjectCss({
        selector: percentage,
        style: value || {},
      })}`,
    );
  }
  const css = percentageRules.join('');
  const keyframeName = `_${hash(css)}`;
  const keyframesRule = `@keyframes ${keyframeName} {${css}}`;

  return { keyframesRule, keyframeName };
};
