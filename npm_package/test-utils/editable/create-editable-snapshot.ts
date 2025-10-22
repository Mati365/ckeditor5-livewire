import type { Snapshot } from '../../src/hooks/editable';

import { DEFAULT_TEST_EDITOR_ID } from '../editor';

/**
 * Creates a snapshot of the Livewire component's state relevant to the CKEditor5 editable hook.
 *
 * @param rootName - The name of the root element in the editor. Defaults to 'main'.
 * @param content - The initial content value for the editable. Defaults to null.
 * @returns A snapshot object for the editable component.
 */
export function createEditableSnapshot(
  rootName: string = 'main',
  content: string | null = null,
): Snapshot {
  return {
    rootName,
    editorId: DEFAULT_TEST_EDITOR_ID,
    content,
    saveDebounceMs: 100,
  };
}
