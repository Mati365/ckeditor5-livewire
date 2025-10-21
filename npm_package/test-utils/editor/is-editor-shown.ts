/**
 * Ensures that the editor is shown in the DOM.
 */
export function isEditorShown() {
  return document.querySelector('.ck-editor__editable')?.classList.contains('ck-hidden') === false;
}
