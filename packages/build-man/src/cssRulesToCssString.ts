import { GLOBAL_STYLE_LAYER, NORMAL_STYLE_LAYER } from './constants';

type Args = {
  cssRules: string[];
  globalCssRules: string[];
};

export const cssRulesToCssString = ({ cssRules, globalCssRules }: Args) => {
  return `
    @layer ${GLOBAL_STYLE_LAYER} ,${NORMAL_STYLE_LAYER};
    @layer ${GLOBAL_STYLE_LAYER} {${globalCssRules.join('')}};
    @layer ${NORMAL_STYLE_LAYER} {${cssRules.join('')}};
  `;
};
