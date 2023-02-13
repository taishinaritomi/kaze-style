import { describe, it, expect } from 'vitest';
import { compileNotAtomicCss } from './compileNotAtomicCss';

describe('compileNotAtomicCss', () => {
  it('base', () => {
    const [cssRules] = compileNotAtomicCss(
      {
        color: 'red',
      },
      'global',
      'html',
    );

    expect(cssRules).toEqual([['html{color:red;}', 'global']]);
  });

  it('animationName', () => {
    const [cssRules] = compileNotAtomicCss(
      {
        animationName: {
          from: {
            color: 'red',
          },
          to: {
            color: 'green',
          },
        },
      },
      'global',
      'html',
    );

    expect(cssRules).toEqual([
      ['html{animation-name:_1o9m7qn;}', 'global'],
      ['@keyframes _1o9m7qn{from{color:red;}to{color:green;}}', 'keyframes'],
    ]);
  });

  it('nesting selector', () => {
    const [cssRules] = compileNotAtomicCss(
      {
        color: 'red',
        ':hover': {
          ':disabled': {
            color: 'lightgreen',
          },
          color: 'green',
          ':active': {
            ':disabled': {
              color: 'lightblue',
            },
            color: 'darkgreen',
            ':enabled': {
              color: 'darkblue',
            },
          },
        },
      },
      'global',
      'html',
    );

    expect(cssRules).toEqual([
      ['html{color:red;}', 'global'],
      ['html:hover{color:green;}', 'global'],
      ['html:hover:disabled{color:lightgreen;}', 'global'],
      ['html:hover:active{color:darkgreen;}', 'global'],
      ['html:hover:active:disabled{color:lightblue;}', 'global'],
      ['html:hover:active:enabled{color:darkblue;}', 'global'],
    ]);
  });

  it('nesting atRules', () => {
    const [cssRules] = compileNotAtomicCss(
      {
        color: 'red',
        '@media (min-width: 0)': {
          '@media (prefers-color-scheme: light)': {
            color: 'lightgreen',
          },
          color: 'green',
          '@media (prefers-color-scheme: dark)': {
            '@supports (display: grid)': {
              color: 'lightblue',
            },
            color: 'darkgreen',
            '@supports not (display: grid)': {
              color: 'darkblue',
            },
          },
        },
      },
      'global',
      'html',
    );

    expect(cssRules).toEqual([
      ['html{color:red;}', 'global'],
      ['@media (min-width: 0){html{color:green;}}', 'global'],
      [
        '@media (min-width: 0){@media (prefers-color-scheme: light){html{color:lightgreen;}}}',
        'global',
      ],
      [
        '@media (min-width: 0){@media (prefers-color-scheme: dark){html{color:darkgreen;}}}',
        'global',
      ],
      [
        '@media (min-width: 0){@media (prefers-color-scheme: dark){@supports (display: grid){html{color:lightblue;}}}}',
        'global',
      ],
      [
        '@media (min-width: 0){@media (prefers-color-scheme: dark){@supports not (display: grid){html{color:darkblue;}}}}',
        'global',
      ],
    ]);
  });

  it('nesting mix', () => {
    const [cssRules] = compileNotAtomicCss(
      {
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
      'global',
      'html',
    );

    expect(cssRules).toEqual([
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
