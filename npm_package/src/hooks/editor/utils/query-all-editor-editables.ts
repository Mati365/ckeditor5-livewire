import type { EditorId } from '../typings';

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
          element: element.el,
          content: element.ephemeral['content'] as string,
        },
      }), Object.create({}))
  );
}

/**
 * Type representing an editable item within an editor.
 */
export type EditableItem = {
  element: HTMLElement;
  content: string;
};
