import { hyphenateProperty } from './hyphenateProperty';

describe('hyphenateProperty', () => {
  it('asdf', () => {
    expect(hyphenateProperty('asdf')).toBe('asdf');
    expect(hyphenateProperty('asdfAsdf')).toBe('asdf-asdf');
  });
});
