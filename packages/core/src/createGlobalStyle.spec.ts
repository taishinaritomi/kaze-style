import { describe, it, expect } from 'vitest';
import { createGlobalStyle } from './createGlobalStyle';

describe('createGlobalStyle', () => {
  it('base', () => {
    const { cssRules } = createGlobalStyle({
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
    expect(cssRules).toEqual([
      {
        order: 'global',
        value: '@media (max-width:1024px){html{color:green;}}',
      },
      {
        order: 'global',
        value: '@media (max-width:512px){html{color:blue;}}',
      },
      { order: 'global', value: 'html{color:red;}' },
    ]);
  });

  it('font-face', () => {
    const { cssRules } = createGlobalStyle({
      '@font-face': {
        fontFamily: 'Open Sans',
        src: 'url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2")',
      },
    });
    expect(cssRules).toEqual([
      {
        order: 'global',
        value:
          '@font-face{font-family:Open Sans;src:url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2");}',
      },
    ]);
  });

  it('mix', () => {
    const { cssRules } = createGlobalStyle({
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
    expect(cssRules).toEqual([
      {
        order: 'global',
        value:
          '@font-face{font-family:Open Sans;src:url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2");}',
      },
      {
        order: 'global',
        value: '@media (max-width:1024px){html{color:green;}}',
      },
      {
        order: 'global',
        value: '@media (max-width:512px){html{color:blue;}}',
      },
      { order: 'global', value: 'html{color:red;}' },
    ]);
  });
});
