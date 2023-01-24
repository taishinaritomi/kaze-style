import { describe, it, expect } from 'vitest';
import { ClassName } from './ClassName';
import { mergeStyle } from './mergeStyle';
import { resolveStyle } from './resolveStyle';

describe('mergeStyle', () => {
  it('base', () => {
    const [, classes] = resolveStyle({
      $base: {
        color: 'red',
        '@media (max-width:1024px)': {
          color: 'green',
        },
      },
      $action: {
        '@media (max-width:1024px)': {
          color: 'red',
        },
      },
    });

    expect(mergeStyle(classes.$base, classes.$action)).toEqual(
      new ClassName({ _1ylxx6h: '_18ffsfk', _1l79nxf: '_1rl8wha' }),
    );
  });
});
