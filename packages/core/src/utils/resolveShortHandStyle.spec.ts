import { describe, it, expect } from 'vitest';
import { resolveShortHandStyle } from './resolveShortHandStyle';

describe('resolveShortHandStyle', () => {
  it('margin 1', () => {
    const style = resolveShortHandStyle({
      property: '$margin',
      styleValue: ['10px'],
    });

    expect(style).toEqual({
      marginTop: '10px',
      marginRight: '10px',
      marginBottom: '10px',
      marginLeft: '10px',
    });
  });

  it('margin 2', () => {
    const style = resolveShortHandStyle({
      property: '$margin',
      styleValue: ['10px', '20px'],
    });

    expect(style).toEqual({
      marginTop: '10px',
      marginRight: '20px',
      marginBottom: '10px',
      marginLeft: '20px',
    });
  });

  it('margin 3', () => {
    const style = resolveShortHandStyle({
      property: '$margin',
      styleValue: ['10px', '20px', '30px'],
    });

    expect(style).toEqual({
      marginTop: '10px',
      marginRight: '20px',
      marginBottom: '30px',
      marginLeft: '20px',
    });
  });

  it('margin 4', () => {
    const style = resolveShortHandStyle({
      property: '$margin',
      styleValue: ['10px', '20px', '30px', '40px'],
    });

    expect(style).toEqual({
      marginTop: '10px',
      marginRight: '20px',
      marginBottom: '30px',
      marginLeft: '40px',
    });
  });

  it('inset 1', () => {
    const style = resolveShortHandStyle({
      property: '$inset',
      styleValue: ['10px'],
    });

    expect(style).toEqual({
      top: '10px',
      right: '10px',
      bottom: '10px',
      left: '10px',
    });
  });

  it('inset 2', () => {
    const style = resolveShortHandStyle({
      property: '$inset',
      styleValue: ['10px', '20px'],
    });

    expect(style).toEqual({
      top: '10px',
      right: '20px',
      bottom: '10px',
      left: '20px',
    });
  });

  it('inset 3', () => {
    const style = resolveShortHandStyle({
      property: '$inset',
      styleValue: ['10px', '20px', '30px'],
    });

    expect(style).toEqual({
      top: '10px',
      right: '20px',
      bottom: '30px',
      left: '20px',
    });
  });

  it('inset 4', () => {
    const style = resolveShortHandStyle({
      property: '$inset',
      styleValue: ['10px', '20px', '30px', '40px'],
    });

    expect(style).toEqual({
      top: '10px',
      right: '20px',
      bottom: '30px',
      left: '40px',
    });
  });

  it('gap 1', () => {
    const style = resolveShortHandStyle({
      property: '$gap',
      styleValue: ['10px'],
    });

    expect(style).toEqual({
      columnGap: '10px',
      rowGap: '10px',
    });
  });

  it('gap 2', () => {
    const style = resolveShortHandStyle({
      property: '$gap',
      styleValue: ['10px', '20px'],
    });

    expect(style).toEqual({
      columnGap: '10px',
      rowGap: '20px',
    });
  });

  it('overflow 1', () => {
    const style = resolveShortHandStyle({
      property: '$overflow',
      styleValue: ['10px'],
    });

    expect(style).toEqual({
      overflowX: '10px',
      overflowY: '10px',
    });
  });

  it('overflow 2', () => {
    const style = resolveShortHandStyle({
      property: '$overflow',
      styleValue: ['10px', '20px'],
    });

    expect(style).toEqual({
      overflowX: '10px',
      overflowY: '20px',
    });
  });
});
