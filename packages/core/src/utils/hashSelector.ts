import { hash } from '../hash';

type Args = {
  property?: string;
  pseudo?: string;
  media?: string;
};

export const hashSelector = ({
  property = '',
  pseudo = '',
  media = '',
}: Args): string => {
  return `_${hash(`${property}${pseudo}${media}`)}`;
};
