import { describe, expect, it } from 'vitest';

import { deepCamelCaseKeys } from './deep-camel-case-keys';

describe('deepCamelCaseKeys', () => {
  it('converts keys of a flat object', () => {
    expect(deepCamelCaseKeys({ 'foo_bar': 1, 'baz-qux': 2 })).toEqual({ fooBar: 1, bazQux: 2 });
  });

  it('converts keys deeply in nested objects', () => {
    const input = { foo_bar: { nested_key: 1 }, arr: [{ snake_case: 2 }] };
    const expected = { fooBar: { nestedKey: 1 }, arr: [{ snakeCase: 2 }] };
    expect(deepCamelCaseKeys(input)).toEqual(expected);
  });

  it('converts keys in arrays of objects', () => {
    const input = [{ foo_bar: 1 }, { baz_qux: 2 }];
    const expected = [{ fooBar: 1 }, { bazQux: 2 }];
    expect(deepCamelCaseKeys(input)).toEqual(expected);
  });

  it('leaves primitives untouched', () => {
    expect(deepCamelCaseKeys(42)).toBe(42);
    expect(deepCamelCaseKeys('string')).toBe('string');
    expect(deepCamelCaseKeys(null)).toBe(null);
    expect(deepCamelCaseKeys(undefined)).toBe(undefined);
  });

  it('leaves class instances untouched', () => {
    class MyClass { a = 1; }
    const instance = new MyClass();
    expect(deepCamelCaseKeys(instance)).toBe(instance);
  });
});
