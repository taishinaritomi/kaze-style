import { describe, it, expect } from 'vitest';
import { ClassName } from './ClassName';
import { resolveStyle } from './resolveStyle';

describe('resolveStyle', () => {
  it('base', () => {
    const [cssRules, classes] = resolveStyle({
      $base: {
        color: 'red',
      },
    });

    expect(classes).toEqual({ $base: new ClassName({ _1ylxx6h: '_1z0f5pm' }) });
    expect(cssRules).toEqual([['._1z0f5pm{color:red;}', 'normal']]);
  });

  it('pseudo', () => {
    const [cssRules, classes] = resolveStyle({
      $base: {
        ':hover': {
          color: 'red',
        },
        '::after': {
          color: 'green',
        },
      },
    });

    expect(classes).toEqual({
      $base: new ClassName({ _1ez8kfk: '_9vjnpm', _as4l2f: '_4fbj8n' }),
    });
    expect(cssRules).toEqual([
      ['._9vjnpm:hover{color:red;}', 'hover'],
      ['._4fbj8n::after{color:green;}', 'normal'],
    ]);
  });

  it('nest pseudo', () => {
    const [cssRules, classes] = resolveStyle({
      $base: {
        ':hover': {
          '::after': {
            color: 'green',
          },
          color: 'red',
        },
      },
    });

    expect(classes).toEqual({
      $base: new ClassName({ _143egyq: '_if3xdm', _1ez8kfk: '_9vjnpm' }),
    });
    expect(cssRules).toEqual([
      ['._if3xdm:hover::after{color:green;}', 'hover'],
      ['._9vjnpm:hover{color:red;}', 'hover'],
    ]);
  });

  it('atRules', () => {
    const [cssRules, classes] = resolveStyle({
      $base: {
        '@media (max-width: 512px)': {
          color: 'red',
        },
      },
    });

    expect(classes).toEqual({ $base: new ClassName({ _8147ym: '_1533v1y' }) });
    expect(cssRules).toEqual([
      ['@media (max-width: 512px){._1533v1y{color:red;}}', 'media'],
    ]);
  });

  it('nest atRules', () => {
    const [cssRules, classes] = resolveStyle({
      $base: {
        '@media (max-width: 512px)': {
          color: 'red',
          '@supports not (display: grid)': {
            display: 'flex',
          },
        },
      },
    });

    expect(cssRules).toEqual([
      ['@media (max-width: 512px){._1533v1y{color:red;}}', 'media'],
      [
        '@media (max-width: 512px){@supports not (display: grid){._1ixciq6{display:flex;}}}',
        'media',
      ],
    ]);
    expect(classes).toEqual({
      $base: new ClassName({ _8147ym: '_1533v1y', _tzry81: '_1ixciq6' }),
    });
  });

  it('keyframes', () => {
    const [cssRules, classes] = resolveStyle({
      $base: {
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

    expect(classes).toEqual({
      $base: new ClassName({ _6qto8h: '_6qto8h', _1mdtyre: '_1nz0ua8' }),
    });
    expect(cssRules).toEqual([
      ['@keyframes _6qto8h{from{color:green;}to{color:red;}}', 'keyframes'],
      ['._1nz0ua8{animation-name:_6qto8h;}', 'normal'],
    ]);
  });
});
