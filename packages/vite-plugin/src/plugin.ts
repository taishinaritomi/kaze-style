import type { CssRule } from '@kaze-style/core';
import { sortCssRules, uniqueCssRules } from '@kaze-style/core';
import type { Plugin } from 'vite';
import { resolveTransform } from './utils/resolveTransform';

export const plugin = (): Plugin => {
  const cssRules: CssRule[] = [];
  let mode = '';
  return {
    name: 'kaze-transform',
    enforce: 'pre',
    resolveId(source) {
      const [validId] = source.split('?');
      if (/kaze.css$/.test(validId || '')) {
        return validId;
      }
      return;
    },
    configResolved(config) {
      mode = config.mode;
    },
    load(id: string) {
      const [validId] = id.split('?');
      if (/kaze.css$/.test(validId || '')) {
        const _cssRules = sortCssRules(uniqueCssRules(cssRules));
        return _cssRules.map((cssRule) => cssRule.value).join('');
      }
      return;
    },

    async transform(code, id) {
      console.log(mode);
      if (mode === 'development') {
        return null;
      }

      const [validId] = id.split('?');
      if (!/.(tsx|ts|js|jsx)$/.test(validId || '')) {
        return null;
      }

      const { code: transformedCode, cssRules: _cssRules } =
        await resolveTransform({
          code,
          filename: validId || '',
        });
      let rootRelativeId = '';
      if (_cssRules.length !== 0) {
        rootRelativeId = `import "${validId}.kaze.css";`;
        cssRules.push(..._cssRules);
      }

      return {
        code: `${rootRelativeId}\n${transformedCode}`,
        map: { mappings: '' },
      };
    },
  };
};
