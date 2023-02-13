import { describe, it, expect } from 'vitest';
import { resolveGlobalStyle } from './resolveGlobalStyle';

describe('resolveGlobalStyle', () => {
  it('base', () => {
    const [cssRules] = resolveGlobalStyle({
      '@font-face': {
        fontFamily: 'Open Sans',
        src: 'url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2")',
      },
      html: {
        color: 'red',
        ':hover': {
          '@media (prefers-color-scheme: light)': {
            color: 'lightgreen',
          },
          color: 'green',
          '@media (prefers-color-scheme: dark)': {
            ':enabled': {
              color: 'lightblue',
            },
            color: 'darkgreen',
            ':disabled': {
              color: 'darkblue',
            },
          },
        },
      },
    });
    expect(cssRules).toEqual([
      [
        '@font-face{font-family:Open Sans;src:url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2");}',
        'global',
      ],
      ['html{color:red;}', 'global'],
      ['html:hover{color:green;}', 'global'],
      [
        '@media (prefers-color-scheme: light){html:hover{color:lightgreen;}}',
        'global',
      ],
      [
        '@media (prefers-color-scheme: dark){html:hover{color:darkgreen;}}',
        'global',
      ],
      [
        '@media (prefers-color-scheme: dark){html:hover:enabled{color:lightblue;}}',
        'global',
      ],
      [
        '@media (prefers-color-scheme: dark){html:hover:disabled{color:darkblue;}}',
        'global',
      ],
    ]);
  });
});
