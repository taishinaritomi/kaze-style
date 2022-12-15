import { hash } from '../hash';
import type { KeyframesRules } from '../types/style';
import { compileObjectCss } from './compileObjectCss';

export const compileKeyFrameCss = (
  keyframeObject: KeyframesRules,
): [keyframeName: string, keyframesRule: string] => {
  const percentageRules: string[] = [];

  for (const percentage in keyframeObject) {
    const value = keyframeObject[percentage];
    percentageRules.push(
      `${compileObjectCss(value || {}, percentage).join('')}`,
    );
  }
  const css = percentageRules.join('');
  const keyframesName = `_${hash(css)}`;
  const keyframesRule = `@keyframes ${keyframesName}{${css}}`;

  return [keyframesName, keyframesRule];
};
