import type { Snapshot } from '../../src/hooks/editor';

import { createEditorPreset } from './create-editor-preset';
import { DEFAULT_TEST_EDITOR_ID } from './wait-for-test-editor';

/**
 * Creates a default snapshot for testing purposes.
 */
export function createEditorSnapshot(): Snapshot {
  return {
    editorId: DEFAULT_TEST_EDITOR_ID,
    content: {
      main: '<p>Initial content</p>',
    },
    preset: createEditorPreset(),
    contextId: null,
    editableHeight: null,
    language: {
      ui: 'en',
      content: 'en',
    },
    saveDebounceMs: 500,
    watchdog: false,
  };
}
