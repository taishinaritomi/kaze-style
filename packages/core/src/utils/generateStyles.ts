import type { CssValue, SupportProperties } from '../types/style';
import type { AndArray, ValueOf } from '../types/utils';

const positionMap = ['Top', 'Right', 'Bottom', 'Left'];

export function generateStyles<Styles extends SupportProperties>(
  property: 'border' | 'padding' | 'margin',
  suffix: '' | 'Color' | 'Style' | 'Width',
  ...values: AndArray<CssValue>[]
): Styles {
  const [
    firstValue,
    secondValue = firstValue,
    thirdValue = firstValue,
    fourthValue = secondValue,
  ] = values;
  const valuesWithDefaults = [firstValue, secondValue, thirdValue, fourthValue];

  const styles: Styles = {} as Styles;

  for (let i = 0; i < valuesWithDefaults.length; i += 1) {
    const value = valuesWithDefaults[i] as ValueOf<Styles>;
    if (value || value === 0) {
      const newKey = (property + positionMap[i] + suffix) as keyof Styles;
      styles[newKey] = value;
    }
  }

  return styles;
}
