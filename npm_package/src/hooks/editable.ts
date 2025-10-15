import type { DecoupledEditor, MultiRootEditor } from 'ckeditor5';

import { debounce } from 'shared';

import { EditorsRegistry } from './editor/editors-registry';
import { ClassHook } from './hook';

/**
 * Editable hook for Livewire. It allows you to create editables for multi-root editors.
 */
export class EditableComponentHook extends ClassHook<Snapshot> {
  /**
   * The promise that resolves when the editable is mounted.
   */
  private mountedPromise: Promise<void> | null = null;

  /**
   * Mounts the editable component.
   */
  override async mounted() {
    const { editableId, editorId, rootName, initialValue } = this.ephemeral;
    const input = this.element.querySelector<HTMLInputElement>(`#${editableId}_input`);

    // If the editor is not registered yet, we will wait for it to be registered.
    this.mountedPromise = EditorsRegistry.the.execute(editorId, (editor: MultiRootEditor) => {
      const { ui, editing, model } = editor;

      if (model.document.getRoot(rootName)) {
        return;
      }

      editor.addRoot(rootName, {
        isUndoable: false,
        data: initialValue,
      });

      const contentElement = this.element.querySelector('[data-cke-editable-content]') as HTMLElement | null;
      const editable = ui.view.createEditable(rootName, contentElement!);

      ui.addEditable(editable);
      editing.view.forceRender();

      if (input) {
        syncEditorRootToInput(input, editor, rootName);
      }
    });
  }

  /**
   * Destroys the editable component. Unmounts root from the editor.
   */
  override async destroyed() {
    const { editorId, rootName } = this.ephemeral;

    // Let's hide the element during destruction to prevent flickering.
    this.element.style.display = 'none';

    // Let's wait for the mounted promise to resolve before proceeding with destruction.
    await this.mountedPromise;
    this.mountedPromise = null;

    // Unmount root from the editor.
    await EditorsRegistry.the.execute(editorId, (editor: MultiRootEditor | DecoupledEditor) => {
      const root = editor.model.document.getRoot(rootName);

      if (root && 'detachEditable' in editor) {
        editor.detachEditable(root);
        editor.detachRoot(rootName, false);
      }
    });
  }
}

/**
 * Synchronizes the editor's root data to the corresponding input element.
 * This is used to keep the input value in sync with the editor's content.
 *
 * @param input - The input element to synchronize with the editor.
 * @param editor - The CKEditor instance.
 * @param rootName - The name of the root to synchronize.
 */
function syncEditorRootToInput(input: HTMLInputElement, editor: MultiRootEditor, rootName: string) {
  const sync = () => {
    input.value = editor.getData({ rootName });
  };

  editor.model.document.on('change:data', debounce(100, sync));
  sync();
}

/**
 * A snapshot of the Livewire component's state relevant to the CKEditor5 editable hook.
 */
type Snapshot = {
  /**
   * The unique identifier for the editable element.
   */
  editableId: string;

  /**
   * The ID of the editor instance this editable belongs to.
   */
  editorId: string;

  /**
   * The name of the root element in the editor.
   */
  rootName: string;

  /**
   * The initial content value for the editable.
   */
  initialValue: string;
};
