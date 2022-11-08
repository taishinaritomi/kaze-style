import { describe, it, expect } from 'vitest';
import { createGlobalStyle } from './createGlobalStyle';

describe('createGlobalStyle', () => {
  it('base', () => {
    const { cssRuleObjects } = createGlobalStyle({
      html: {
        color: 'red',
        '@media (max-width:1024px)': {
          color: 'green',
        },
        '@media (max-width:512px)': {
          color: 'blue',
        },
      },
    });
    expect(cssRuleObjects).toEqual([
      {
        order: 'global',
        rule: '@media (max-width:1024px){html{color:green;}}',
      },
      {
        order: 'global',
        rule: '@media (max-width:512px){html{color:blue;}}',
      },
      { order: 'global', rule: 'html{color:red;}' },
    ]);
  });

  it('font-face', () => {
    const { cssRuleObjects } = createGlobalStyle({
      '@font-face': {
        fontFamily: 'Open Sans',
        src: 'url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2")',
      },
    });
    expect(cssRuleObjects).toEqual([
      {
        order: 'global',
        rule: '@font-face{font-family:Open Sans;src:url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2");}',
      },
    ]);
  });

  it('mix', () => {
    const { cssRuleObjects } = createGlobalStyle({
      '@font-face': {
        fontFamily: 'Open Sans',
        src: 'url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2")',
      },
      html: {
        color: 'red',
        '@media (max-width:1024px)': {
          color: 'green',
        },
        '@media (max-width:512px)': {
          color: 'blue',
        },
      },
    });
    expect(cssRuleObjects).toEqual([
      {
        order: 'global',
        rule: '@font-face{font-family:Open Sans;src:url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2");}',
      },
      {
        order: 'global',
        rule: '@media (max-width:1024px){html{color:green;}}',
      },
      {
        order: 'global',
        rule: '@media (max-width:512px){html{color:blue;}}',
      },
      { order: 'global', rule: 'html{color:red;}' },
    ]);
  });
});
