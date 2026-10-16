import type { Destructible } from './async-registry';

import { once } from './once';

/**
 * Makes `destroy()` of the instance idempotent: the first call destroys the instance,
 * subsequent calls return the same promise.
 *
 * Neither `Editor#destroy()` nor `Context#destroy()` guard against being called twice, and it happens
 * when a context and its editors are being disconnected in the same DOM update. Depending on the order of
 * elements, the editor component and the context (which destroys all its editors) both destroy the editor.
 *
 * @param instance The instance to patch.
 * @returns The same instance.
 */
export function makeDestroyIdempotent<T extends Destructible>(instance: T): T {
  instance.destroy = once(instance.destroy.bind(instance));

  return instance;
}
