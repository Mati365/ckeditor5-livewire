import { describe, expect, it } from 'vitest';

import { AsyncRegistry } from '../../shared/async-registry';
import { EditorsRegistry } from './editors-registry';

describe('editors registry', () => {
  it('should be singleton of async registry', () => {
    expect(EditorsRegistry.the).toBeInstanceOf(AsyncRegistry);
  });
});
