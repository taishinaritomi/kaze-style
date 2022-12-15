import { describe, it, expect } from 'vitest';
import { styleOrder } from './styleOrder';

describe('styleOrder', () => {
  it('unique', () => {
    expect(styleOrder.length).toEqual(new Set(styleOrder).size);
  });
});
