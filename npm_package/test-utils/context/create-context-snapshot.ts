import type { ContextConfig } from '../../src/hooks/context/typings';
import type { EditorLanguage } from '../../src/hooks/editor';

import { DEFAULT_TEST_CONTEXT_ID } from './wait-for-test-context';

/**
 * A snapshot of the Livewire component's state relevant to the CKEditor5 context hook.
 */
type Snapshot = {
  /**
   * The unique identifier for the context instance.
   */
  contextId: string;

  /**
   * The context configuration for the context instance.
   */
  context: ContextConfig;

  /**
   * The language of the context UI and content.
   */
  language: EditorLanguage;
};

/**
 * Creates a snapshot of the Livewire component's state relevant to the CKEditor5 context hook.
 *
 * @param contextId - The unique identifier for the context instance. Defaults to DEFAULT_TEST_CONTEXT_ID.
 * @param config - Optional partial context configuration to override defaults.
 * @param language - Optional language settings for UI and content. Defaults to English.
 * @param language.ui - The UI language code.
 * @param language.content - The content language code.
 * @returns A snapshot object for the context component.
 */
export function createContextSnapshot(
  contextId: string = DEFAULT_TEST_CONTEXT_ID,
  config: Partial<ContextConfig> = {},
  language: EditorLanguage = { ui: 'en', content: 'en' },
): Snapshot {
  return {
    contextId,
    language,
    context: {
      customTranslations: null,
      watchdogConfig: null,
      config: {
        plugins: [],
      },
      ...config,
    },
  };
}
