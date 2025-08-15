import { sumar } from '../src/utils/math';

describe('sumar', () => {
  it('suma una lista de números', () => {
    expect(sumar([1, 2, 3])).toBe(6);
    expect(sumar([0, 0])).toBe(0);
  });

  it('suma negativos', () => {
    expect(sumar([-1, -2, 3])).toBe(0);
  });
});
