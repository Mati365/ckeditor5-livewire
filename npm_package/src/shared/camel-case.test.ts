import { describe, expect, it } from 'vitest';

import { camelCase } from './camel-case';

describe('camelCase', () => {
  it('converts kebab-case to camelCase', () => {
    expect(camelCase('foo-bar-baz')).toBe('fooBarBaz');
  });

  it('converts snake_case to camelCase', () => {
    expect(camelCase('foo_bar_baz')).toBe('fooBarBaz');
  });

  it('converts space separated to camelCase', () => {
    expect(camelCase('foo bar baz')).toBe('fooBarBaz');
  });

  it('returns already camelCase string unchanged', () => {
    expect(camelCase('fooBarBaz')).toBe('fooBarBaz');
  });

  it('handles single word', () => {
    expect(camelCase('foo')).toBe('foo');
  });

  it('handles empty string', () => {
    expect(camelCase('')).toBe('');
  });

  it('handles leading/trailing separators', () => {
    expect(camelCase('-foo-bar-')).toBe('fooBar');
    expect(camelCase('_foo_bar_')).toBe('fooBar');
    expect(camelCase(' foo bar ')).toBe('fooBar');
  });
});
