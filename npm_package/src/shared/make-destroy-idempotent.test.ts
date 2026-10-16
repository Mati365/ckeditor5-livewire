import { describe, expect, it, vi } from 'vitest';

import { makeDestroyIdempotent } from './make-destroy-idempotent';

describe('makeDestroyIdempotent', () => {
  it('should return the same instance', () => {
    const instance = { destroy: async () => {} };

    expect(makeDestroyIdempotent(instance)).toBe(instance);
  });

  it('should call the original `destroy()` only once', async () => {
    const originalDestroy = vi.fn(async () => {});
    const instance = makeDestroyIdempotent({ destroy: originalDestroy });

    await Promise.all([instance.destroy(), instance.destroy()]);
    await instance.destroy();

    expect(originalDestroy).toHaveBeenCalledTimes(1);
  });

  it('should return the same promise to every caller', () => {
    const instance = makeDestroyIdempotent({ destroy: async () => {} });

    expect(instance.destroy()).toBe(instance.destroy());
  });

  it('should call the original `destroy()` with the instance as `this`', async () => {
    const instance = makeDestroyIdempotent({
      destroyed: false,
      async destroy() {
        this.destroyed = true;
      },
    });

    await instance.destroy();

    expect(instance.destroyed).toBe(true);
  });
});
