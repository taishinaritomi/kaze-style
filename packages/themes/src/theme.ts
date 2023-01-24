import { reset } from './theme/reset';

export const theme = {
  reset: () => reset,
};

/**
 * @deprecated
 * ```
 * import { theme } from '@kaze-style/themes'
 * theme.reset()
 * ```
 */
export const globalTheme = {
  reset: () => reset,
};
