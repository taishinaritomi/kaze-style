import type {
  CSSValue,
  SolveShorthandProperties,
  SupportedCSSProperties,
} from '../types/style';
import type { AndArray } from '../types/utils';
import { generateStyles } from './generateStyles';

type OverflowStyle = Pick<SupportedCSSProperties, 'overflowX' | 'overflowY'>;

export const resolveShortHandStyle = (
  _property: keyof SolveShorthandProperties,
  styleValue: AndArray<CSSValue>,
): SupportedCSSProperties => {
  const values = Array.isArray(styleValue)
    ? (styleValue as CSSValue[]).map((v) => v.toString())
    : styleValue
        .toString()
        .split(' ')
        .filter((v) => v !== '');

  const property = _property.replace('$', '');

  if (property === 'margin' || property === 'padding') {
    const style = generateStyles(property, '', ...values);
    return style;
  } else if (property === 'gap') {
    const [firstValue, secondValue = firstValue] = values;
    return {
      columnGap: firstValue,
      rowGap: secondValue,
    };
  } else if (property === 'inset') {
    const [
      firstValue,
      secondValue = firstValue,
      thirdValue = firstValue,
      fourthValue = secondValue,
    ] = values;
    return {
      top: firstValue,
      right: secondValue,
      bottom: thirdValue,
      left: fourthValue,
    };
  } else if (property === 'borderRadius') {
    const [
      firstValue,
      secondValue = firstValue,
      thirdValue = firstValue,
      fourthValue = secondValue,
    ] = values;
    return {
      borderTopLeftRadius: firstValue,
      borderTopRightRadius: secondValue,
      borderBottomRightRadius: thirdValue,
      borderBottomLeftRadius: fourthValue,
    };
  } else if (property === 'overflow') {
    const [firstValue, secondValue = firstValue] = values;
    return {
      overflowX: firstValue,
      overflowY: secondValue,
    } as OverflowStyle;
  } else if (property === 'outline') {
    const [firstValue, secondValue, thirdValue] = values;
    return {
      outlineWidth: firstValue,
      ...(secondValue && { outlineColor: secondValue }),
      ...(thirdValue && { outlineStyle: thirdValue }),
    };
  } else {
    return {};
  }
};
