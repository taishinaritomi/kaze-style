import { describe, it, expect } from 'vitest';
import { compileAtomicCss } from './compileAtomicCss';

describe('compileAtomicCss', () => {
  it('base', () => {
    const [cssRules, classNameRecord] = compileAtomicCss({
      color: 'red',
    });

    expect(classNameRecord).toEqual({ _1ylxx6h: '_1z0f5pm' });
    expect(cssRules).toEqual([['._1z0f5pm{color:red;}', 'normal']]);
  });

  it('animationName', () => {
    const [cssRules, classNameRecord] = compileAtomicCss({
      animationName: {
        from: {
          color: 'red',
        },
        to: {
          color: 'green',
        },
      },
    });

    expect(classNameRecord).toEqual({
      _1o9m7qn: '_1o9m7qn',
      _1mdtyre: '_sidbu5',
    });
    expect(cssRules).toEqual([
      ['@keyframes _1o9m7qn{from{color:red;}to{color:green;}}', 'keyframes'],
      ['._sidbu5{animation-name:_1o9m7qn;}', 'normal'],
    ]);
  });

  it('nesting selector', () => {
    const [cssRules, classNameRecord] = compileAtomicCss({
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
    });

    expect(classNameRecord).toEqual({
      _1ylxx6h: '_1z0f5pm',
      _1d9j653: '_9p2spk',
      _1ez8kfk: '_zr2gzt',
      _1d0vnc9: '_1b95o57',
      _wu9vmi: '_g9q18s',
      _1jmipnm: '_si7na1',
    });
    expect(cssRules).toEqual([
      ['._1z0f5pm{color:red;}', 'normal'],
      ['._9p2spk:hover:disabled{color:lightgreen;}', 'hover'],
      ['._zr2gzt:hover{color:green;}', 'hover'],
      ['._1b95o57:hover:active:disabled{color:lightblue;}', 'active'],
      ['._g9q18s:hover:active{color:darkgreen;}', 'active'],
      ['._si7na1:hover:active:enabled{color:darkblue;}', 'active'],
    ]);
  });

  it('nesting atRules', () => {
    const [cssRules, classNameRecord] = compileAtomicCss({
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
    });

    expect(classNameRecord).toEqual({
      _1ylxx6h: '_1z0f5pm',
      _4bchu7: '_1tj2yyp',
      _ieqs2k: '_w2n9ut',
      _1nzvkp4: '_1nqgndu',
      _18b94wd: '_12b8orp',
      _1a6q0d1: '_5mv0l4',
    });
    expect(cssRules).toEqual([
      ['._1z0f5pm{color:red;}', 'normal'],
      [
        '@media (min-width: 0){@media (prefers-color-scheme: light){._1tj2yyp{color:lightgreen;}}}',
        'media',
      ],
      ['@media (min-width: 0){._w2n9ut{color:green;}}', 'media'],
      [
        '@media (min-width: 0){@media (prefers-color-scheme: dark){@supports (display: grid){._1nqgndu{color:lightblue;}}}}',
        'media',
      ],
      [
        '@media (min-width: 0){@media (prefers-color-scheme: dark){._12b8orp{color:darkgreen;}}}',
        'media',
      ],
      [
        '@media (min-width: 0){@media (prefers-color-scheme: dark){@supports not (display: grid){._5mv0l4{color:darkblue;}}}}',
        'media',
      ],
    ]);
  });

  it('nesting mix', () => {
    const [cssRules, classNameRecord] = compileAtomicCss({
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
    });

    expect(classNameRecord).toEqual({
      _1ylxx6h: '_1z0f5pm',
      _2dy4o3: '_ndfhes',
      _1ez8kfk: '_zr2gzt',
      _1rx8eb2: '_1jw51ya',
      _ekhpz3: '_qdpplj',
      _cppp84: '_i5bypd',
    });
    expect(cssRules).toEqual([
      ['._1z0f5pm{color:red;}', 'normal'],
      [
        '@media (prefers-color-scheme: light){._ndfhes:hover{color:lightgreen;}}',
        'media',
      ],
      ['._zr2gzt:hover{color:green;}', 'hover'],
      [
        '@media (prefers-color-scheme: dark){._1jw51ya:hover:enabled{color:lightblue;}}',
        'media',
      ],
      [
        '@media (prefers-color-scheme: dark){._qdpplj:hover{color:darkgreen;}}',
        'media',
      ],
      [
        '@media (prefers-color-scheme: dark){._i5bypd:hover:disabled{color:darkblue;}}',
        'media',
      ],
    ]);
  });
});
