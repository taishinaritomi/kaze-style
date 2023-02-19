import { ClassName } from './ClassName';

export const __className = (
  _static: ClassName['Static'],
  other: ClassName['Other'] = [],
) => {
  return new ClassName(_static, other);
};
