import { describe, it, expect } from 'vitest';
import { ClassName } from './ClassName';
import { createStyle } from './createStyle';

describe('createStyle', () => {
  it('base', () => {
    const [cssRules, classes] = createStyle({
      base: {
        color: 'red',
      },
    });

    expect(classes).toEqual({ base: new ClassName({ _1ylxx6h: '_18ffsfk' }) });
    expect(cssRules).toEqual([['._18ffsfk{color:red;}', 'n']]);
  });

  it('pseudo', () => {
    const [cssRules, classes] = createStyle({
      base: {
        ':hover': {
          color: 'red',
        },
        '::after': {
          color: 'green',
        },
      },
    });

    expect(classes).toEqual({
      base: new ClassName({ _1ez8kfk: '_1qka0wa', _as4l2f: '_5p99rv' }),
    });
    expect(cssRules).toEqual([
      ['._1qka0wa:hover{color:red;}', 'h'],
      ['._5p99rv::after{color:green;}', 'n'],
    ]);
  });

  it('nested pseudo', () => {
    const [cssRules, classes] = createStyle({
      base: {
        ':hover': {
          '::after': {
            color: 'green',
          },
          color: 'red',
        },
      },
    });

    expect(classes).toEqual({
      base: new ClassName({ _143egyq: '_1em4tpo', _1ez8kfk: '_1qka0wa' }),
    });
    expect(cssRules).toEqual([
      ['._1em4tpo:hover::after{color:green;}', 'h'],
      ['._1qka0wa:hover{color:red;}', 'h'],
    ]);
  });

  it('atRules', () => {
    const [cssRules, classes] = createStyle({
      base: {
        '@media (max-width: 512px)': {
          color: 'red',
        },
      },
    });

    expect(classes).toEqual({ base: new ClassName({ _8147ym: '_15v7uk7' }) });
    expect(cssRules).toEqual([
      ['@media (max-width: 512px){._15v7uk7{color:red;}}', 'm'],
    ]);
  });

  it('nested atRules', () => {
    const [cssRules, classes] = createStyle({
      base: {
        '@media (max-width: 512px)': {
          color: 'red',
          '@supports not (display: grid)': {
            display: 'flex',
          },
        },
      },
    });

    expect(cssRules).toEqual([
      ['@media (max-width: 512px){._15v7uk7{color:red;}}', 'm'],
      [
        '@media (max-width: 512px){@supports not (display: grid){._syblt6{display:flex;}}}',
        'm',
      ],
    ]);
    expect(classes).toEqual({
      base: new ClassName({ _8147ym: '_15v7uk7', _tzry81: '_syblt6' }),
    });
  });

  it('keyframes', () => {
    const [cssRules, classes] = createStyle({
      base: {
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
      base: new ClassName({ _6qto8h: '_6qto8h', _1mdtyre: '_ep4wyi' }),
    });
    expect(cssRules).toEqual([
      ['@keyframes _6qto8h{from{color:green;}to{color:red;}}', 'k'],
      ['._ep4wyi{animation-name:_6qto8h;}', 'n'],
    ]);
  });
});
