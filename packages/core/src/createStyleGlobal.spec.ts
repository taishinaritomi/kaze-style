import { describe, it, expect } from 'vitest';
import { createGlobalStyle } from './createGlobalStyle';

describe('createStyle', () => {
  it('base', () => {
    const { cssRuleObjects } = createGlobalStyle({
      html: {
        color: 'red',
        '@media (max-width:1024px)': {
          color: 'green',
        },
      },
    });
    expect(cssRuleObjects).toEqual([
      {
        order: 'global',
        rule: '@media (max-width:1024px){html{color:green;}}',
      },
      { order: 'global', rule: 'html{color:red;}' },
    ]);
  });
});
