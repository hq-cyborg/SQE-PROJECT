import calculate from '../../src/utils/calculate.js';

describe('calculate utility functions', () => {
  test('adds two numbers correctly', () => {
    expect(calculate.add(10, 5)).toBe(15);
    expect(calculate.add(10.25, 5.75)).toBe(16);
  });

  test('subtracts two numbers correctly', () => {
    expect(calculate.sub(10, 5)).toBe(5);
    expect(calculate.sub(20.5, 0.5)).toBe(20);
  });

  test('multiplies two numbers correctly', () => {
    expect(calculate.multiply(3, 4)).toBe(12);
    expect(calculate.multiply(2.5, 2)).toBe(5);
  });

  test('divides two numbers correctly', () => {
    expect(calculate.divide(10, 2)).toBe(5);
    expect(calculate.divide(7.5, 2.5)).toBe(3);
  });

  test('handles numeric strings as input', () => {
    expect(calculate.add("10", "5")).toBe(15);
    expect(calculate.multiply("2", "3")).toBe(6);
  });

  test('division by zero returns Infinity', () => {
    expect(calculate.divide(10, 0)).toBe(Infinity);
  });
});
