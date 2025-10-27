import type { MultiRootEditor } from 'ckeditor5';

import { debounce } from '../shared';
import { EditorsRegistry } from './editor/editors-registry';
import { ClassHook } from './hook';

/**
 * Editable hook for Livewire. It allows you to create editables for multi-root editors.
 */
export class EditableComponentHook extends ClassHook<Snapshot> {
  /**
   * The promise that resolves when the editable is mounted.
   */
  private editorPromise: Promise<MultiRootEditor> | null = null;

  /**
   * Mounts the editable component.
   */
  override mounted() {
    const { editorId, rootName, content, saveDebounceMs } = this.canonical;
    const input = this.element.querySelector<HTMLInputElement>('input');

    // If the editor is not registered yet, we will wait for it to be registered.
    this.editorPromise = EditorsRegistry.the.execute(editorId, (editor: MultiRootEditor) => {
      const { ui, editing, model } = editor;

      if (model.document.getRoot(rootName)) {
        // If the newly added root already exists, but the newly added editable has content,
        // we need to update the root data with the editable content.
        if (content !== null) {
          const data = editor.getData({ rootName });

          if (data && data !== content) {
            editor.setData({
              [rootName]: content,
            });
          }
        }

        return editor;
      }

      editor.addRoot(rootName, {
        isUndoable: false,
        ...content !== null && {
          data: content,
        },
      });

      const contentElement = this.element.querySelector('[data-cke-editable-content]') as HTMLElement | null;
      const editable = ui.view.createEditable(rootName, contentElement!);

      ui.addEditable(editable);
      editing.view.forceRender();

      // Sync data with socket and input element.
      const sync = () => {
        const html = editor.getData({ rootName });

        if (input) {
          input.value = html;
        }

        this.$wire.set('content', html);
      };

      editor.model.document.on('change:data', debounce(saveDebounceMs, sync));
      sync();

      return editor;
    });
  }

  /**
   * Called when the component is updated by Livewire.
   */
  override async afterCommitSynced(): Promise<void> {
    const editor = (await this.editorPromise)!;
    const { content, rootName } = this.canonical;
    const value = editor.getData({ rootName });

    if (value !== content) {
      editor.setData({
        [rootName]: content ?? '',
      });
    }
  }

  /**
   * Destroys the editable component. Unmounts root from the editor.
   */
  override async destroyed() {
    const { rootName } = this.canonical;

    // Let's hide the element during destruction to prevent flickering.
    this.element.style.display = 'none';

    // Let's wait for the mounted promise to resolve before proceeding with destruction.
    const editor = await this.editorPromise;
    this.editorPromise = null;

    // Unmount root from the editor if editor is still registered.
    if (editor && editor.state !== 'destroyed') {
      const root = editor.model.document.getRoot(rootName);

      if (root && 'detachEditable' in editor) {
        editor.detachEditable(root);
        editor.detachRoot(rootName, false);
      }
    }
  }
}

/**
 * A snapshot of the Livewire component's state relevant to the CKEditor5 editable hook.
 */
export type Snapshot = {
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
  content: string | null;

  /**
   * The debounce time in milliseconds for saving changes.
   */
  saveDebounceMs: number;
};
