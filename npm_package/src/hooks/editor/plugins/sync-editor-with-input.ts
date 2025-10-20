import type { PluginConstructor } from 'ckeditor5';

import { debounce } from '../../../shared';

/**
 * Creates a SyncEditorWithInput plugin class.
 */
export async function createSyncEditorWithInputPlugin(): Promise<PluginConstructor> {
  const { Plugin } = await import('ckeditor5');

  return class SyncEditorWithInput extends Plugin {
    /**
     * The input element to synchronize with.
     */
    private input: HTMLInputElement | null = null;

    /**
     * The debounce time in milliseconds for saving content changes.
     */
    private saveDebounceMs: number;

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
    public init(): void {
      const editorElement = (this.editor as any).sourceElement as
        | HTMLElement
        | undefined;

      if (!editorElement) {
        return;
      }

      // Try to find the associated input field.
      const editorId = editorElement.id.replace(/_editor$/, '');

      this.input = document.getElementById(`${editorId}_input`) as HTMLInputElement | null;

      if (!this.input) {
        return;
      }

      // Get debounce time from editor config if available.
      this.saveDebounceMs = this.editor.config.get('livewire.saveDebounceMs') ?? 0;
      this.form = this.input.closest('form');

      // Setup handlers.
      this.editor.model.document.on(
        'change:data',
        debounce(this.saveDebounceMs, () => this.sync()),
      );

      if (this.form) {
        this.form.addEventListener('submit', this.sync);
      }

      this.sync();
    }

    /**
     * Synchronizes the editor's content with the input field.
     */
    private sync = (): void => {
      if (!this.input) {
        return;
      }

      const newValue = this.editor.getData();

      this.input.value = newValue;
      this.input.dispatchEvent(new Event('input', { bubbles: true }));
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
