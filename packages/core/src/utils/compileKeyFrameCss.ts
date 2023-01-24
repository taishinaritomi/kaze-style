import { compileNotAtomicCss } from '../compileNotAtomicCss';
import { hash } from '../hash';
import type { KeyframesRules } from '../types/style';

export const compileKeyFrameCss = (
  keyframeObject: KeyframesRules,
): [keyframeName: string, keyframesRule: string] => {
  const percentageRules: string[] = [];

  for (const percentage in keyframeObject) {
    const styleValue = keyframeObject[percentage];
    const [cssRules] = compileNotAtomicCss(
      styleValue || {},
      'normal',
      percentage,
    );
    const percentageRule = cssRules.map(([cssRule]) => cssRule).join('');
    percentageRules.push(percentageRule);
  }
  const css = percentageRules.join('');
  const keyframesName = `_${hash(css)}`;
  const keyframesRule = `@keyframes ${keyframesName}{${css}}`;

  return [keyframesName, keyframesRule];
};
