import { describe, it, expect } from 'vitest';
import { ClassName } from './ClassName';
import { createStyle } from './createStyle';

describe('createStyle', () => {
  it('base', () => {
    const { classes, classesObject, cssRules } = createStyle({
      base: {
        color: 'red',
      },
    });

    expect(classes).toEqual({ base: new ClassName({ _1ylxx6h: '_18ffsfk' }) });
    expect(classesObject).toEqual({ base: { _1ylxx6h: '_18ffsfk' } });
    expect(cssRules).toEqual([
      { order: 'normal', value: '._18ffsfk{color:red;}' },
    ]);
  });

  it('pseudo', () => {
    const { classes, classesObject, cssRules } = createStyle({
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
      base: new ClassName({ _1qpompn: '_5d93c1', _1hal8q2: '_1ujbck9' }),
    });
    expect(classesObject).toEqual({
      base: { _1qpompn: '_5d93c1', _1hal8q2: '_1ujbck9' },
    });
    expect(cssRules).toEqual([
      { order: 'hover', value: '._5d93c1:hover{color:red;}' },
      { order: 'normal', value: '._1ujbck9::after{color:green;}' },
    ]);
  });

  it('nested pseudo', () => {
    const { classes, classesObject, cssRules } = createStyle({
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
      base: new ClassName({ _6cx5yh: '_l244st', _1qpompn: '_5d93c1' }),
    });
    expect(classesObject).toEqual({
      base: { _6cx5yh: '_l244st', _1qpompn: '_5d93c1' },
    });
    expect(cssRules).toEqual([
      { order: 'hover', value: '._l244st:hover::after{color:green;}' },
      { order: 'hover', value: '._5d93c1:hover{color:red;}' },
    ]);
  });

  it('atRules', () => {
    const { classes, classesObject, cssRules } = createStyle({
      base: {
        '@media (max-width: 512px)': {
          color: 'red',
        },
      },
    });

    expect(classes).toEqual({ base: new ClassName({ _16lwaja: '_1usel6w' }) });
    expect(classesObject).toEqual({ base: { _16lwaja: '_1usel6w' } });
    expect(cssRules).toEqual([
      {
        order: 'media',
        value: '@media (max-width: 512px){._1usel6w{color:red;}}',
      },
    ]);
  });

  it('nested atRules', () => {
    const { classes, classesObject, cssRules } = createStyle({
      base: {
        '@media (max-width: 512px)': {
          color: 'red',
          '@supports not (display: grid)': {
            display: 'flex',
          },
        },
      },
    });

    expect(classes).toEqual({
      base: new ClassName({ _16lwaja: '_1usel6w', _1b0ehn0: '_16aqfzc' }),
    });
    expect(classesObject).toEqual({
      base: { _16lwaja: '_1usel6w', _1b0ehn0: '_16aqfzc' },
    });
    expect(cssRules).toEqual([
      {
        order: 'media',
        value: '@media (max-width: 512px){._1usel6w{color:red;}}',
      },
      {
        order: 'media',
        value:
          '@media (max-width: 512px){@supports not (display: grid){._16aqfzc{display:flex;}}}',
      },
    ]);
  });

  it('keyframes', () => {
    const { classes, classesObject, cssRules } = createStyle({
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
    expect(classesObject).toEqual({
      base: { _6qto8h: '_6qto8h', _1mdtyre: '_ep4wyi' },
    });
    expect(cssRules).toEqual([
      {
        order: 'keyframes',
        value: '@keyframes _6qto8h{from{color:green;}to{color:red;}}',
      },
      {
        order: 'normal',
        value: '._ep4wyi{animation-name:_6qto8h;}',
      },
    ]);
  });
});
