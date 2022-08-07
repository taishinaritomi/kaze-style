import { hash } from '../hash';

type Args = {
  property?: string;
  pseudo?: string;
  media?: string;
  styleValue?: string | number;
};

export const hashClassName = ({
  property = '',
  pseudo = '',
  styleValue = '',
  media = '',
}: Args): string => {
  return `k-${hash(property + pseudo + media)}-${hash(`${styleValue}`)}`;
};
