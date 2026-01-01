import type { ClassicEditor, PluginConstructor } from 'ckeditor5';

import { debounce } from '../../../shared';

/**
 * Creates a SyncEditorWithInput plugin class.
 */
export async function createSyncEditorWithInputPlugin(saveDebounceMs: number): Promise<PluginConstructor> {
  const { Plugin } = await import('ckeditor5');

  return class SyncEditorWithInput extends Plugin {
    /**
     * The input element to synchronize with.
     */
    private input: HTMLInputElement | null = null;

    /**
     * The form element reference for cleanup.
     */
    private form: HTMLFormElement | null = null;

    /**
     * The name of the plugin.
     */
    static get pluginName() {
      return 'SyncEditorWithInput' as const;
    }

    /**
     * Initializes the plugin.
     */
    public afterInit(): void {
      const { editor } = this;
      const editorElement = (editor as ClassicEditor).sourceElement as HTMLElement;

      // Try to find the associated input field.
      const editorId = editorElement.id.replace(/_editor$/, '');

      this.input = document.getElementById(`${editorId}_input`) as HTMLInputElement | null;

      if (!this.input) {
        return;
      }

      // Setup handlers.
      editor.model.document.on('change:data', debounce(saveDebounceMs, () => this.sync()));
      editor.once('ready', this.sync);

      // Setup form integration.
      this.form = this.input.closest('form');
      this.form?.addEventListener('submit', this.sync);
    }

    /**
     * Synchronizes the editor's content with the input field.
     */
    private sync = (): void => {
      if (this.input) {
        const newValue = this.editor.getData();

        this.input.value = newValue;
        this.input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };

    /**
     * Destroys the plugin.
     */
    public override destroy(): void {
      if (this.form) {
        this.form.removeEventListener('submit', this.sync);
      }

      this.input = null;
      this.form = null;
    }
  };
}
