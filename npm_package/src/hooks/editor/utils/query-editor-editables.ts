import type { EditorId, EditorType } from '../typings';

import { mapObjectValues } from '../../../shared';
import { isSingleEditingLikeEditor } from './is-single-editing-like-editor';

/**
 * Queries all editable elements within a specific editor instance.
 *
 * @param editorId The ID of the editor to query.
 * @returns An object mapping editable names to their corresponding elements and initial values.
 */
export function queryAllEditorEditables(editorId: EditorId): Record<string, EditableItem> {
  return (
    window.Livewire
      .all()
      .filter(component => component.ephemeral['editorId'] === editorId)
      .reduce<Record<string, EditableItem>>((acc, element) => ({
        ...acc,
        [element.ephemeral['rootName'] as string]: {
          element: element.el.querySelector('[data-cke-editable-content]')!,
          content: element.ephemeral['content'] as string,
        },
      }), Object.create({}))
  );
}

/**
 * Gets the initial root elements for the editor based on its type.
 *
 * @param editorId The editor's ID.
 * @param type The type of the editor.
 * @returns The root element(s) for the editor.
 */
export function queryEditablesElements(editorId: EditorId, type: EditorType) {
  // While the `decoupled` editor is a single editing-like editor, it has a different structure
  // and requires special handling to get the main editable.
  if (type === 'decoupled') {
    const { element } = queryDecoupledMainEditableOrThrow(editorId);

    return element;
  }

  if (isSingleEditingLikeEditor(type)) {
    return document.getElementById(`${editorId}_editor`)!;
  }

  const editables = queryAllEditorEditables(editorId);

  return mapObjectValues(editables, ({ element }) => element);
}

/**
 * Gets the initial data for the roots of the editor. If the editor is a single editing-like editor,
 * it retrieves the initial value from the element's attribute. Otherwise, it returns an object mapping
 * editable names to their initial values.
 *
 * @param editorId The editor's ID.
 * @param type The type of the editor.
 * @returns The initial values for the editor's roots.
 */
export function queryEditablesSnapshotContent(editorId: EditorId, type: EditorType) {
  // While the `decoupled` editor is a single editing-like editor, it has a different structure
  // and requires special handling to get the main editable.
  if (type === 'decoupled') {
    const { content } = queryDecoupledMainEditableOrThrow(editorId);

    // If initial value is not set, then pick it from the editor element.
    if (typeof content === 'string') {
      return {
        main: content,
      };
    }
  }

  const editables = queryAllEditorEditables(editorId);

  return mapObjectValues(editables, ({ content }) => content);
}

/**
 * Queries the main editable for a decoupled editor and throws an error if not found.
 *
 * @param editorId The ID of the editor to query.
 */
function queryDecoupledMainEditableOrThrow(editorId: EditorId) {
  const mainEditable = queryAllEditorEditables(editorId)['main'];

  if (!mainEditable) {
    throw new Error(`No "main" editable found for editor with ID "${editorId}".`);
  }

  return mainEditable;
}

/**
 * Type representing an editable item within an editor.
 */
export type EditableItem = {
  element: HTMLElement;
  content: string;
};
