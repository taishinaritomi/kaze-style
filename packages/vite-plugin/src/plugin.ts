import { cssRulesToString, stringToCssRules } from '@kaze-style/build';
import type { CssRule } from '@kaze-style/core';
import type { Plugin } from 'vite';
import { resolveTransform } from './utils/resolveTransform';

type KazeConfig = {
  swc?: boolean;
  cssLayer?: boolean;
};

export const plugin = (_kazeConfig: KazeConfig = {}): Plugin => {
  const kazeConfig = Object.assign(
    { swc: false, cssLayer: false },
    _kazeConfig,
  );
  const cssRulesMap = new Map<string, CssRule[]>();
  let mode = '';
  return {
    name: 'kaze-transform',
    enforce: 'pre',
    resolveId(source) {
      const [validId] = source.split('?');
      if (validId && /kaze.css$/.test(validId || '')) return validId;
      return;
    },
    configResolved(config) {
      mode = config.mode;
    },
    generateBundle(_, outputBundles) {
      if (mode === 'development') return;
      Object.entries(outputBundles).forEach(([pathname, outputBundle]) => {
        if (pathname.includes('.css') && outputBundle.type === 'asset') {
          const [cssRules, otherCss] = stringToCssRules(
            outputBundle.source.toString(),
          );
          const css = `${cssRulesToString(cssRules, {
            layer: kazeConfig.cssLayer,
            layerBundle: true,
          })}${otherCss}`;
          this.emitFile({ type: 'asset', fileName: pathname, source: css });
        }
      });
    },
    load(id: string) {
      const [validId] = id.split('?');
      if (validId && /kaze.css$/.test(validId || '')) {
        const cssRules = cssRulesMap.get(validId) || [];
        return cssRulesToString(cssRules, { layer: true });
      }
      return;
    },

    async transform(code, id) {
      if (mode === 'development') return;

      const [validId] = id.split('?');
      if (!/.(tsx|ts|js|jsx)$/.test(validId || '')) return;
      // if (!/style\.(js|ts)$/.test(validId || ''))

      const [transformedCode, _cssRules] = await resolveTransform(code, {
        filename: validId || '',
        compiler: kazeConfig.swc ? 'swc' : 'babel',
      });
      let filePrefix = '';
      if (_cssRules.length !== 0) {
        const filePath = `${validId}.kaze.css`;
        filePrefix = `import "${filePath}";\n`;
        cssRulesMap.set(filePath, _cssRules);
      }

      return {
        code: `${filePrefix}${transformedCode}`,
        map: { mappings: '' },
      };
    },
  };
};
