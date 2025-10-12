import { describe, expect, it, vi } from 'vitest';

import { once } from './once';

describe('once', () => {
  it('should call the original function only once', () => {
    const mockFn = vi.fn().mockReturnValue('result');
    const onceFn = once(mockFn);

    onceFn();
    onceFn();
    onceFn();

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should return the same result on subsequent calls', () => {
    const mockFn = vi.fn().mockReturnValue('test-result');
    const onceFn = once(mockFn);

    const result1 = onceFn();
    const result2 = onceFn();
    const result3 = onceFn();

    expect(result1).toBe('test-result');
    expect(result2).toBe('test-result');
    expect(result3).toBe('test-result');
  });

  it('should pass arguments to the original function', () => {
    const mockFn = vi.fn();
    const onceFn = once(mockFn);

    onceFn('arg1', 'arg2', 'arg3');
    onceFn('different', 'args');

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
  });

  it('should preserve the context (this) when called', () => {
    const context = { value: 'test-context' };
    const mockFn = vi.fn(function (this: typeof context) {
      return this.value;
    });
    const onceFn = once(mockFn);

    const result1 = onceFn.call(context);
    const result2 = onceFn.call({ value: 'different-context' });

    expect(result1).toBe('test-context');
    expect(result2).toBe('test-context');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should work with functions that return undefined', () => {
    const mockFn = vi.fn().mockReturnValue(undefined);
    const onceFn = once(mockFn);

    const result1 = onceFn();
    const result2 = onceFn();

    expect(result1).toBeUndefined();
    expect(result2).toBeUndefined();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should work with async functions', async () => {
    const mockFn = vi.fn().mockResolvedValue('async-result');
    const onceFn = once(mockFn);

    const result1 = await onceFn();
    const result2 = await onceFn();

    expect(result1).toBe('async-result');
    expect(result2).toBe('async-result');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should maintain function signature for type safety', () => {
    const originalFn = (a: string, b: number): string => `${a}-${b}`;
    const onceFn = once(originalFn);

    const result = onceFn('test', 42);

    expect(result).toBe('test-42');
    expect(typeof result).toBe('string');
  });

  it('should work with functions that have no parameters', () => {
    let counter = 0;
    const mockFn = vi.fn(() => ++counter);
    const onceFn = once(mockFn);

    const result1 = onceFn();
    const result2 = onceFn();

    expect(result1).toBe(1);
    expect(result2).toBe(1);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should work with functions that return objects', () => {
    const returnValue = { id: 1, name: 'test' };
    const mockFn = vi.fn().mockReturnValue(returnValue);
    const onceFn = once(mockFn);

    const result1 = onceFn();
    const result2 = onceFn();

    expect(result1).toBe(returnValue);
    expect(result2).toBe(returnValue);
    expect(result1).toEqual({ id: 1, name: 'test' });
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
