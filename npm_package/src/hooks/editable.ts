import type { DecoupledEditor, Editor, MultiRootEditor } from 'ckeditor5';

import type { RootAttributesUpdater } from './utils';

import { debounce } from '../shared';
import { EditorsRegistry } from './editor/editors-registry';
import { isMultirootEditorInstance } from './editor/utils';
import { ClassHook } from './hook';
import { createRootAttributesUpdater, isWireModelConnected } from './utils';

/**
 * Editable hook for Livewire. It allows you to create editables for multi-root editors.
 */
export class EditableComponentHook extends ClassHook<Snapshot> {
  /**
   * The root attributes updater for the editable's root.
   */
  private rootAttributesUpdater: RootAttributesUpdater | null = null;

  /**
   * Pending content to apply when the editor loses focus.
   */
  private pendingContent: string | null = null;

  /**
   * Mounts the editable component.
   */
  override mounted() {
    const { editorId, rootName, content } = this.canonical;

    const unmountEffect = EditorsRegistry.the.mountEffect(editorId, (editor: MultiRootEditor | DecoupledEditor) => {
      /* v8 ignore next if -- @preserve */
      if (this.isBeingDestroyed()) {
        return;
      }

      const root = editor.model.document.getRoot(rootName);

      if (root?.isAttached()) {
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

      /* v8 ignore next else -- @preserve */
      if (!root && isMultirootEditorInstance(editor)) {
        const { ui, editing } = editor;

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
      const cleanupSync = this.syncTypingContentPush(editor);
      const cleanupPending = this.setupPendingReceivedContentHandlers(editor);

      this.applyRootAttributes(editor);

      return () => {
        cleanupSync();
        cleanupPending();

        // Remove root attributes we may have set on this root.
        this.rootAttributesUpdater?.(null);

        // Unmount root from the editor if editor is still registered.
        /* v8 ignore next else -- @preserve */
        if (editor.state !== 'destroyed') {
          const root = editor.model.document.getRoot(rootName);

          /* v8 ignore next if -- @preserve */
          if (root && isMultirootEditorInstance(editor)) {
            // Detaching editables seem to be buggy when something removed DOM element of the editable (e.g. Livewire re-render) before
            // the editable is unmounted. To prevent errors in such cases, we will try to detach the editable if it exists, but ignore errors.
            try {
              /* v8 ignore else -- @preserve */
              if (editor.ui.view.editables[rootName]) {
                editor.detachEditable(root);
              }
            }
            catch (err) {
              // Ignore errors when detaching editable.
              /* v8 ignore next -- @preserve */
              console.error('Unable unmount editable from root:', err);
            }

            if (root.isAttached()) {
              editor.detachRoot(rootName, false);
            }
          }
        }
      };
    });

    this.onBeforeDestroy(unmountEffect);
  }

  /**
   * Called when the component is updated by Livewire.
   */
  override async afterCommitSynced(): Promise<void> {
    const { editorId } = this.canonical;
    const editor = await EditorsRegistry.the.waitFor(editorId);

    this.applyCanonicalContentToEditor(editor);
    this.applyRootAttributes(editor);
  }

  /**
   * Destroys the editable component. Unmounts root from the editor.
   */
  override destroyed() {
    // Let's hide the element during destruction to prevent flickering.
    // Root detachment and attribute cleanup are handled by the mountEffect cleanup function.
    this.element.style.display = 'none';
  }

  /**
   * Setups the content sync from the editor to Livewire on user input with debounce.
   * Returns a cleanup function that unregisters all event listeners.
   */
  private syncTypingContentPush(editor: MultiRootEditor | DecoupledEditor): () => void {
    const { rootName, saveDebounceMs } = this.canonical;

    const input = this.element.querySelector<HTMLInputElement>('input');
    let isDestroyed = false;

    const sync = () => {
      if (isDestroyed) {
        return;
      }

      const root = editor.model.document.getRoot(rootName);

      if (!root?.isAttached()) {
        return;
      }

      const html = editor.getData({ rootName });

      if (input) {
        input.value = html;
      }

      this.$wire.set('content', html);
    };

    const debouncedSync = debounce(saveDebounceMs, sync);
    const onChangeData = () => {
      if (editor.ui.focusTracker.isFocused) {
        debouncedSync();
      }
      else {
        sync();
      }
    };

    editor.model.document.on('change:data', onChangeData);
    sync();

    return () => {
      isDestroyed = true;
      editor.model.document.off('change:data', onChangeData);
    };
  }

  /**
   * Sets up handlers that manage pending incoming content (clears pending
   * content on user edits and applies pending content on blur).
   * Returns a cleanup function that unregisters all event listeners.
   */
  private setupPendingReceivedContentHandlers(editor: Editor): () => void {
    const { ui, model } = editor;
    const { focusTracker } = ui;
    const { rootName } = this.canonical;

    const onDataChange = () => {
      this.pendingContent = null;
    };

    const onFocusChange = () => {
      if (!focusTracker.isFocused && this.pendingContent !== null) {
        editor.setData({
          [rootName]: this.pendingContent,
        });

        this.pendingContent = null;
      }
    };

    model.document.on('change:data', onDataChange);
    focusTracker.on('change:isFocused', onFocusChange);

    return () => {
      model.document.off('change:data', onDataChange);
      focusTracker.off('change:isFocused', onFocusChange);
    };
  }

  /**
   * Applies canonical content to the editor while respecting focus/pending state.
   */
  private applyCanonicalContentToEditor(editor: Editor): void {
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

    editor.setData({
      [rootName]: content ?? '',
    });
  }

  /**
   * Applies root attributes from the Livewire snapshot to the editor root.
   */
  private applyRootAttributes(editor: Editor): void {
    const { rootName, rootAttributes } = this.canonical;

    this.rootAttributesUpdater ??= createRootAttributesUpdater(editor, rootName);
    this.rootAttributesUpdater(rootAttributes);
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

  /**
   * Root attributes to apply to the editable root.
   */
  rootAttributes?: Record<string, unknown>;
};
