import { describe, it, expect } from 'vitest';
import { ClassName } from './ClassName';
import { createStyle } from './createStyle';

describe('createStyle', () => {
  it('base', () => {
    const { classes, classesObject, cssRuleObjects } = createStyle({
      base: {
        color: 'red',
      },
    });

    expect(classes).toEqual({ base: new ClassName({ _1ylxx6h: '_18ffsfk' }) });
    expect(classesObject).toEqual({ base: { _1ylxx6h: '_18ffsfk' } });
    expect(cssRuleObjects).toEqual([
      { order: 'normal', cssRule: '._18ffsfk{color:red;}' },
    ]);
  });

  it('pseudo', () => {
    const { classes, classesObject, cssRuleObjects } = createStyle({
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
    expect(cssRuleObjects).toEqual([
      { order: 'hover', cssRule: '._5d93c1:hover{color:red;}' },
      { order: 'normal', cssRule: '._1ujbck9::after{color:green;}' },
    ]);
  });
});
