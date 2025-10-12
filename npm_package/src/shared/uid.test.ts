import { describe, expect, it } from 'vitest';

import { uid } from './uid';

describe('uid', () => {
  it('should return a string', () => {
    const id = uid();
    expect(typeof id).toBe('string');
  });

  it('should return a non-empty string', () => {
    const id = uid();
    expect(id.length).toBeGreaterThan(0);
  });

  it('should return different values on subsequent calls', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => uid()));
    expect(ids.size).toBe(1000);
  });

  it('should only contain alphanumeric characters', () => {
    const id = uid();
    expect(/^[a-z0-9]+$/i.test(id)).toBe(true);
  });
});
