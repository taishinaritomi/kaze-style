import type { CssRuleObject } from '../styleOrder';

export const cssRuleObjectsUniquify = (cssRuleObjects: CssRuleObject[]) => {
  return Array.from(
    new Map(
      cssRuleObjects.map((cssRuleObject) => [
        cssRuleObject.rule,
        cssRuleObject,
      ]),
    ).values(),
  );
};
