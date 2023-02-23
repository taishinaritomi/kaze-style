import type { Injector } from '@kaze-style/core';
import evalCode from 'eval';
import { BUILD_INJECTOR_NAME } from './constants';

type Options = {
  filename: string;
  buildInjectorName?: string;
};

export const extractionStyle = (
  code: string,
  { filename, buildInjectorName = BUILD_INJECTOR_NAME }: Options,
) => {
  const injector: Injector = { filename, args: [], cssRules: [] };
  // remove start
  // const window = {};
  // const cjsGlobal = {};

  // if (typeof __dirname !== 'undefined') {
  //   Object.assign(cjsGlobal, { __dirname });
  // }
  // if (typeof __filename !== 'undefined') {
  //   Object.assign(cjsGlobal, { __filename });
  // }
  // remove end
  try {
    evalCode(
      code,
      filename,
      {
        [buildInjectorName]: injector,
        // remove start
        // window,
        // $RefreshReg$: () => undefined,
        // ...cjsGlobal,
        // remove end
      },
      true,
    );
  } catch (error) {
    throw error;
  }
  return { injectArgs: injector.args, cssRules: injector.cssRules };
};
