import type { Editor } from 'ckeditor5';

/**
 * Sets the height of the editable area in the CKEditor instance.
 *
 * @param instance - The CKEditor instance to modify.
 * @param height - The height in pixels to set for the editable area.
 */
export function setEditorEditableHeight(instance: Editor, height: number): void {
  const { editing } = instance;

  editing.view.change((writer) => {
    writer.setStyle('height', `${height}px`, editing.view.document.getRoot()!);
  });
}
