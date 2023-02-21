import type { Injector, Node } from '@kaze-style/core';

export const LAYER_PREFIX = 'kaze-';
export const BUILD_ARGUMENT_NAME = '__BUILD_ARGUMENT_NAME';
export const COLLECTOR_NAME = '__COLLECTOR_NAME';

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
];

export const DEFAULT_IMPORTS = [
  {
    source: '@kaze-style/core',
    specifier: '__className',
  },
];

export const GET_DEFAULT_INJECT_ARGUMENT = (filename: string): Node => ({
  type: 'Object',
  properties: [
    {
      key: 'filename',
      value: {
        type: 'String',
        value: filename,
      },
    },
    {
      key: 'injector',
      value: {
        type: 'Identifier',
        name: BUILD_ARGUMENT_NAME,
      },
    },
  ],
});

export type Transforms = Array<{
  source: string;
  from: string;
  to: string;
}>;

export type Imports = Array<{
  source: string;
  specifier: string;
}>;

export type CommonTransformOptions = {
  transforms: Transforms;
  imports: Imports;
};

export type TransformOptions = {
  injectArguments: Injector['injectArguments'];
} & CommonTransformOptions;

export type PreTransformOptions = {
  injectArgument: Node;
  collectorExportName: string;
} & CommonTransformOptions;
