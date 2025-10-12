import { describe, expect, it } from 'vitest';

import { AsyncRegistry } from '../../shared/async-registry';
import { ContextsRegistry } from './contexts-registry';

describe('contexts registry', () => {
  it('should be singleton of async registry', () => {
    expect(ContextsRegistry.the).toBeInstanceOf(AsyncRegistry);
  });
});
