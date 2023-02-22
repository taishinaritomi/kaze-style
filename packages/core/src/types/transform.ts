import type { Injector } from "./common";

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
