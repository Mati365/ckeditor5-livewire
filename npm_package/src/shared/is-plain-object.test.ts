import { describe, expect, it } from 'vitest';

import { isPlainObject } from './is-plain-object';

describe('isPlainObject', () => {
  it('returns true for plain objects', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ a: 1, b: 2 })).toBe(true);
    expect(isPlainObject(Object.create(null))).toBe(true);
  });

  it('returns false for arrays', () => {
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject([1, 2, 3])).toBe(false);
  });

  it('returns false for null', () => {
    expect(isPlainObject(null)).toBe(false);
  });

  it('returns false for primitives', () => {
    expect(isPlainObject(42)).toBe(false);
    expect(isPlainObject('string')).toBe(false);
    expect(isPlainObject(true)).toBe(false);
    expect(isPlainObject(undefined)).toBe(false);
    expect(isPlainObject(Symbol('sym'))).toBe(false);
  });

  it('returns false for class instances', () => {
    class MyClass {}
    expect(isPlainObject(new MyClass())).toBe(false);
  });

  it('returns false for functions', () => {
    expect(isPlainObject(() => {})).toBe(false);
    expect(isPlainObject(() => {})).toBe(false);
  });
});
