import type { ForBuildStyle } from '@kaze-style/core';

export type PreTransformOptions = {
  filename: string;
  forBuildName: string;
};

export type TransformOptions = {
  styles: ForBuildStyle<string>[];
};
