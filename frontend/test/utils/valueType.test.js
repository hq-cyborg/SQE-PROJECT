import { describe, test, expect } from 'vitest';
import {
  isObject,
  isFunction,
  isString,
  isBoolean,
  isNumber,
  isUndef
} from '../../src/utils/valueType.js';

describe('Type check utilities', () => {
  test('isObject returns true for objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject([])).toBe(true); // arrays are objects
    expect(isObject(null)).toBe(false);
  });

  test('isFunction returns true for functions', () => {
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction(function() {})).toBe(true);
    expect(isFunction({})).toBe(false);
  });

  test('isString returns true for strings', () => {
    expect(isString('hello')).toBe(true);
    expect(isString(String('test'))).toBe(true);
    expect(isString(123)).toBe(false);
  });

  test('isBoolean returns true for booleans', () => {
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean(false)).toBe(true);
    expect(isBoolean(0)).toBe(false);
  });

  test('isNumber returns true for numbers', () => {
    expect(isNumber(42)).toBe(true);
    expect(isNumber(0)).toBe(true);
    expect(isNumber(NaN)).toBe(true); // typeof NaN is number
    expect(isNumber('42')).toBe(false);
  });

  test('isUndef returns true for undefined', () => {
    expect(isUndef(undefined)).toBe(true);
    expect(isUndef(null)).toBe(false);
    expect(isUndef(0)).toBe(false);
  });
});
