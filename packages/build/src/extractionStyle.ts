import type { Injector } from '@kaze-style/core';
import evalCode from 'eval';
import { BUILD_ARGUMENT_NAME } from './constants';

type Options = {
  filename: string;
  buildArgumentName?: string;
};

export const extractionStyle = (
  code: string,
  { filename, buildArgumentName = BUILD_ARGUMENT_NAME }: Options,
) => {
  const injector: Injector = {
    filename,
    injectArguments: [],
    cssRules: [],
  };
  // remove start
  const window = {};
  const cjsGlobal = {};

  if (typeof __dirname !== 'undefined') {
    Object.assign(cjsGlobal, { __dirname });
  }
  if (typeof __filename !== 'undefined') {
    Object.assign(cjsGlobal, { __filename });
  }
  // remove end
  try {
    evalCode(
      code,
      filename,
      {
        // ["__BUILD_ARGUMENT_NAME"]: injector,
        [buildArgumentName]: injector,
        // remove start
        window,
        $RefreshReg$: () => undefined,
        ...cjsGlobal,
        // remove end
      },
      true,
    );
  } catch (error) {
    throw error;
  }
  return injector;
};
