import { ContextsRegistry } from '../../src/hooks/context/contexts-registry';

/**
 * The default ID used for the test context.
 */
export const DEFAULT_TEST_CONTEXT_ID = 'test-context';

/**
 * Waits for the test context to be registered in the EditorsRegistry.
 */
export function waitForTestContext(id: string = DEFAULT_TEST_CONTEXT_ID) {
  return ContextsRegistry.the.waitFor(id);
}
