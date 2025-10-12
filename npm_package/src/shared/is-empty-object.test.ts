import { describe, expect, it } from 'vitest';

import { isEmptyObject } from './is-empty-object';

describe('isEmptyObject', () => {
  it('should return true for empty object', () => {
    const result = isEmptyObject({});
    expect(result).toBe(true);
  });

  it('should return false for object with properties', () => {
    const result = isEmptyObject({ key: 'value' });
    expect(result).toBe(false);
  });

  it('should return false for object with multiple properties', () => {
    const result = isEmptyObject({
      name: 'test',
      age: 25,
      active: true,
    });

    expect(result).toBe(false);
  });

  it('should return false for object with undefined values', () => {
    const result = isEmptyObject({ key: undefined });
    expect(result).toBe(false);
  });

  it('should return false for object with null values', () => {
    const result = isEmptyObject({ key: null });
    expect(result).toBe(false);
  });

  it('should return false for object with empty string values', () => {
    const result = isEmptyObject({ key: '' });
    expect(result).toBe(false);
  });

  it('should return false for object with numeric keys', () => {
    const result = isEmptyObject({ 0: 'value' });
    expect(result).toBe(false);
  });

  it('should return false for arrays', () => {
    const result = isEmptyObject([] as any);
    expect(result).toBe(false);
  });

  it('should return false for arrays with elements', () => {
    const result = isEmptyObject([1, 2, 3] as any);
    expect(result).toBe(false);
  });

  it('should return false for Date objects', () => {
    const result = isEmptyObject(new Date() as any);
    expect(result).toBe(false);
  });

  it('should return false for custom class instances', () => {
    class TestClass {}
    const result = isEmptyObject(new TestClass() as any);
    expect(result).toBe(false);
  });

  it('should return false for objects created with Object.create', () => {
    const result = isEmptyObject(Object.create(null));
    expect(result).toBe(false);
  });

  it('should return true for objects with inherited properties only', () => {
    const proto = { inheritedProp: 'value' };
    const obj = Object.create(proto);
    const result = isEmptyObject(obj);
    expect(result).toBe(true);
  });
});
