import type { Editor } from 'ckeditor5';

import type { EditorId } from '../../src/hooks/editor/typings';

import { EditorsRegistry } from '../../src/hooks/editor/editors-registry';

/**
 * The default ID used for the test editor.
 */
export const DEFAULT_TEST_EDITOR_ID: EditorId = 'test-editor';

/**
 * Waits for the test editor to be registered in the EditorsRegistry.
 */
export function waitForTestEditor<E extends Editor>(id: EditorId = DEFAULT_TEST_EDITOR_ID): Promise<E> {
  return EditorsRegistry.the.waitFor<E>(id);
}
