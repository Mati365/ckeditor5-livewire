import type { PluginConstructor } from 'ckeditor5';

import { debounce } from '../../../shared';
import { getEditorRootsValues } from '../utils';

/**
 * Creates a LivewireSync plugin class.
 */
export async function createLivewireSyncPlugin(): Promise<PluginConstructor> {
  const { Plugin } = await import('ckeditor5');

  return class LivewireSync extends Plugin {
    /**
     * The name of the plugin.
     */
    static get pluginName() {
      return 'LivewireSync' as const;
    }

    /**
     * Initializes the plugin.
     */
    public init(): void {
      const config = this.editor.config.get('livewire')!;
      const { emit } = config;

      if (emit.change) {
        this.setupTypingContentPush();
      }

      if (emit.focus) {
        this.setupFocusableEventPush();
      }
    }

    /**
     * Setups the content push event for the editor.
     */
    private setupTypingContentPush() {
      const { config, model } = this.editor;
      const { saveDebounceMs, component: { $wire } } = config.get('livewire')!;

      const syncContentChange = () => {
        $wire.set('content', this.getEditorRootsValues());
      };

      model.document.on('change:data', debounce(saveDebounceMs, syncContentChange));
      syncContentChange();
    }

    /**
     * Setups the event push for the editor.
     */
    private setupFocusableEventPush() {
      const { config, ui } = this.editor;
      const { component: { $wire } } = config.get('livewire')!;

      const pushEvent = () => {
        $wire.set('focused', ui.focusTracker.isFocused);
        $wire.set('content', this.getEditorRootsValues());
      };

      ui.focusTracker.on('change:isFocused', pushEvent);
    }

    /**
     * Gets the current values of all editor roots.
     */
    private getEditorRootsValues(): Record<string, string> {
      return getEditorRootsValues(this.editor);
    }
  };
}
