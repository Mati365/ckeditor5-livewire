import { describe, expect, it } from 'vitest';

import { mapObjectValues } from './map-object-values';

describe('mapObjectValues', () => {
  it('should map object values using the provided mapper function', () => {
    const input = { a: 1, b: 2, c: 3 };
    const mapper = (value: number) => value * 2;
    const result = mapObjectValues(input, mapper);

    expect(result).toEqual({ a: 2, b: 4, c: 6 });
  });

  it('should pass the key to the mapper function', () => {
    const input = { x: 'foo', y: 'bar' };
    const mapper = (value: string, key: string) => `${key}:${value}`;
    const result = mapObjectValues(input, mapper);

    expect(result).toEqual({ x: 'x:foo', y: 'y:bar' });
  });

  it('should return an empty object if the input is empty', () => {
    const input: Record<string, number> = {};
    const mapper = (value: number) => value * 2;
    const result = mapObjectValues(input, mapper);

    expect(result).toEqual({});
  });
});
