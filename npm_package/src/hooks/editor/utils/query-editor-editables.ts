import type { EditorId, EditorType } from '../typings';

import { filterObjectValues, mapObjectValues } from '../../../shared';
import { isSingleRootEditor } from './is-single-root-editor';

/**
 * Gets the initial root elements for the editor based on its type.
 *
 * @param editorId The editor's ID.
 * @param type The type of the editor.
 * @returns The root element(s) for the editor.
 */
export function queryEditablesElements(editorId: EditorId, type: EditorType) {
  if (isSingleRootEditor(type) && type !== 'decoupled') {
    return document.getElementById(`${editorId}_editor`)!;
  }

  const editables = queryAllEditorEditables(editorId);

  return mapObjectValues(editables, ({ element }) => element);
}

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
      .filter(({ name, canonical }) => name === 'ckeditor5-editable' && canonical['editorId'] === editorId)
      .reduce<Record<string, EditableItem>>((acc, { canonical, el }) => ({
        ...acc,
        [canonical['rootName'] as string]: {
          element: el.querySelector('[data-cke-editable-content]')!,
          content: canonical['content'],
        },
      }), Object.create({}))
  );
}

/**
 * Gets the initial data for the roots of the editor. If the editor is a single editing-like editor,
 * it retrieves the initial value from the element's attribute. Otherwise, it returns an object mapping
 * editable names to their initial values.
 *
 * @param editorId The editor's ID.
 * @returns The initial values for the editor's roots.
 */
export function queryEditablesSnapshotContent(editorId: EditorId) {
  const editables = queryAllEditorEditables(editorId);
  const values = mapObjectValues(editables, ({ content }) => content);

  return filterObjectValues(values, value => typeof value === 'string') as Record<string, string>;
}

/**
 * Type representing an editable item within an editor.
 */
export type EditableItem = {
  element: HTMLElement;
  content: string | null;
};
