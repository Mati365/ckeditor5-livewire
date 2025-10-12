import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not call the callback immediately', () => {
    const callback = vi.fn();
    const debounced = debounce(100, callback);

    debounced();

    expect(callback).not.toHaveBeenCalled();
  });

  it('should call the callback after the specified delay', () => {
    const callback = vi.fn();
    const debounced = debounce(100, callback);

    debounced();

    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should call the callback only once for multiple calls within the delay period', () => {
    const callback = vi.fn();
    const debounced = debounce(100, callback);

    debounced();
    debounced();
    debounced();

    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should reset the timeout on subsequent calls', () => {
    const callback = vi.fn();
    const debounced = debounce(100, callback);

    debounced();
    vi.advanceTimersByTime(50);
    debounced();
    vi.advanceTimersByTime(50);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should pass the arguments to the callback', () => {
    const callback = vi.fn();
    const debounced = debounce(100, callback);
    const args = [1, 'test', { a: 2 }];

    debounced(...args);

    vi.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledWith(...args);
  });
});
