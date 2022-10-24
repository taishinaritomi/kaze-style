import type {
  CssValue,
  SupportShorthandProperties,
  SupportProperties,
} from '../types/style';
import type { AndArray } from '../types/utils';
import { normalizeShorthandProperty } from './normalizeShorthandProperty';
import { resolvePositionShortHandStyle } from './resolvePositionShortHandStyle';
import { styleValueToArray } from './styleValueToArray';

type Args = {
  property: keyof SupportShorthandProperties;
  styleValue: AndArray<CssValue>;
};

export const resolveShortHandStyle = ({
  property: _property,
  styleValue,
}: Args): SupportProperties => {
  const values = styleValueToArray(styleValue);
  const property = normalizeShorthandProperty(_property);

  if (property === 'margin' || property === 'padding') {
    return resolvePositionShortHandStyle({ styleValue, property });
  } else if (property === 'borderRadius') {
    return resolvePositionShortHandStyle({
      styleValue,
      property,
      positionMap: ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'],
    });
  } else if (property === 'inset') {
    return resolvePositionShortHandStyle({
      styleValue,
      positionMap: ['top', 'right', 'bottom', 'left'],
    });
  } else if (property === 'gap') {
    return resolvePositionShortHandStyle({
      styleValue,
      suffix: 'Gap',
      positionMap: ['column', 'row'],
    });
  } else if (property === 'overflow') {
    return resolvePositionShortHandStyle({
      styleValue,
      property,
      positionMap: ['X', 'Y'],
    });
  } else if (property === 'outline') {
    const [firstValue, secondValue, thirdValue] = values;
    return {
      outlineWidth: firstValue,
      outlineColor: secondValue,
      outlineStyle: thirdValue,
    };
  } else {
    return {};
  }
};
