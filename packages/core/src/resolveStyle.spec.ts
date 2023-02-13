import { describe, it, expect } from 'vitest';
import { resolveStyle } from './resolveStyle';

describe('resolveStyle', () => {
  it('base', () => {
    const [cssRules, classes] = resolveStyle({
      $base: {
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
        animationName: {
          from: {
            color: 'green',
          },
          to: {
            color: 'red',
          },
        },
      },
    });

    expect(classes.$base.static()).toEqual({
      _1ez8kfk: '_zr2gzt',
      _1mdtyre: '_1nz0ua8',
      _1rx8eb2: '_1jw51ya',
      _1ylxx6h: '_1z0f5pm',
      _2dy4o3: '_ndfhes',
      _6qto8h: '_6qto8h',
      _cppp84: '_i5bypd',
      _ekhpz3: '_qdpplj',
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
      ['@keyframes _6qto8h{from{color:green;}to{color:red;}}', 'keyframes'],
      ['._1nz0ua8{animation-name:_6qto8h;}', 'normal'],
    ]);
  });
});
