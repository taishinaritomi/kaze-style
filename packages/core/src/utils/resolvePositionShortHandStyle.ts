import type { CssValue, SupportProperties } from '../types/style';
import type { AndArray } from '../types/utils';
import { styleValueToArray } from './styleValueToArray';

type Args = {
  styleValue: AndArray<CssValue>;
  property?: string;
  suffix?: string;
  positionMap?: typeof defaultPositionMap;
};

const defaultPositionMap = ['Top', 'Right', 'Bottom', 'Left'];

export const resolvePositionShortHandStyle = ({
  styleValue,
  property = '',
  suffix = '',
  positionMap = defaultPositionMap,
}: Args) => {
  const values = styleValueToArray(styleValue);
  const [first, second = first, third = first, fourth = second] = values;
  const defaultValues = [first, second, third, fourth];
  const styles = {} as Record<string, string | undefined>;
  positionMap.forEach((position, i) => {
    const newProperty = (property +
      position +
      suffix) as keyof SupportProperties;
    if (defaultValues[i]) {
      styles[newProperty] = defaultValues[i];
    }
  });
  return styles;
};
