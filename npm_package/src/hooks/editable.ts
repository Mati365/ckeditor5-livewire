import type { MultiRootEditor } from 'ckeditor5';

import { debounce } from '../shared';
import { EditorsRegistry } from './editor/editors-registry';
import { isWireModelConnected } from './editor/utils';
import { ClassHook } from './hook';

/**
 * Editable hook for Livewire. It allows you to create editables for multi-root editors.
 */
export class EditableComponentHook extends ClassHook<Snapshot> {
  /**
   * The promise that resolves when the editable is mounted.
   */
  private editorPromise: Promise<MultiRootEditor | null> | null = null;

  /**
   * Pending content to apply when the editor loses focus.
   */
  private pendingContent: string | null = null;

  /**
   * Mounts the editable component.
   */
  override mounted() {
    const { editorId, rootName, content } = this.canonical;

    // If the editor is not registered yet, we will wait for it to be registered.
    this.editorPromise = EditorsRegistry.the.execute(editorId, (editor: MultiRootEditor) => {
      /* v8 ignore next 3 */
      if (this.isBeingDestroyed()) {
        return null;
      }

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
      }
      else {
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
      }

      // Add livewire sync.
      this.syncTypingContentPush(editor);
      this.setupPendingReceivedContentHandlers(editor);

      return editor;
    });
  }

  /**
   * Setups the content sync from the editor to Livewire on user input with debounce.
   */
  private syncTypingContentPush(editor: MultiRootEditor) {
    const { rootName, saveDebounceMs } = this.canonical;
    const input = this.element.querySelector<HTMLInputElement>('input');

    const sync = () => {
      const html = editor.getData({ rootName });

      if (input) {
        input.value = html;
      }

      this.$wire.set('content', html);
    };

    editor.model.document.on('change:data', debounce(saveDebounceMs, sync));
    sync();
  }

  /**
   * Sets up handlers that manage pending incoming content (clears pending
   * content on user edits and applies pending content on blur).
   */
  private setupPendingReceivedContentHandlers(editor: MultiRootEditor): void {
    const { ui, model } = editor;
    const { rootName } = this.canonical;

    model.document.on('change:data', () => {
      this.pendingContent = null;
    });

    ui.focusTracker.on('change:isFocused', () => {
      if (!ui.focusTracker.isFocused && this.pendingContent !== null) {
        editor.setData({
          [rootName]: this.pendingContent,
        });

        this.pendingContent = null;
      }
    });
  }

  /**
   * Applies canonical content to the editor while respecting focus/pending state.
   */
  private applyCanonicalContentToEditor(editor: MultiRootEditor): void {
    if (!isWireModelConnected(this.element)) {
      return;
    }

    const { content, rootName } = this.canonical;
    const { ui } = editor;

    const currentValue = editor.getData({ rootName });

    if (currentValue === (content ?? '')) {
      return;
    }

    if (ui.focusTracker.isFocused) {
      this.pendingContent = content ?? '';
      return;
    }

    editor.setData({ [rootName]: content ?? '' });
  }

  /**
   * Called when the component is updated by Livewire.
   */
  override async afterCommitSynced(): Promise<void> {
    const editor = (await this.editorPromise)!;

    this.applyCanonicalContentToEditor(editor);
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
