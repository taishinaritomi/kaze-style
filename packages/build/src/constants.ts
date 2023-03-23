export const LAYER_PREFIX = 'kaze-';
export const BUILD_INJECTOR_NAME = '__BUILD_INJECTOR_NAME';

export const DEFAULT_TRANSFORMS = [
  {
    from: 'style',
    to: '__style',
    source: '@kaze-style/core',
  },
  {
    from: 'globalStyle',
    to: '__globalStyle',
    source: '@kaze-style/core',
  },
  {
    from: 'createStyle',
    to: '__style',
    source: '@kaze-style/core',
  },
  {
    from: 'createGlobalStyle',
    to: '__globalStyle',
    source: '@kaze-style/core',
  },
];
