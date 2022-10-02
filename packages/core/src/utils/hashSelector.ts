import { hash } from '../hash';

type Args = {
  property?: string;
  pseudo?: string;
  media?: string;
  layer?: string;
  support?: string;
};

export const hashSelector = ({
  property = '',
  pseudo = '',
  media = '',
  layer = '',
  support = '',
}: Args): string => {
  return `_${hash(`${property}${pseudo}${media}${layer}${support}`)}`;
};
