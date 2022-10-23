import { hash } from '../hash';
import type { Selectors } from '../resolveStyle';

type Args = {
  selectors: Selectors;
  property: string;
};

export const hashSelector = ({
  selectors: { pseudo, media, layer, support },
  property,
}: Args): string => {
  return `_${hash(`${property}${pseudo}${media}${layer}${support}`)}`;
};
