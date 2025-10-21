import type { PluginConstructor } from 'ckeditor5';

import type { Wire } from '../../../livewire';

import { debounce } from '../../../shared';
import { getEditorRootsValues } from '../utils';

/**
 * Creates a LivewireSync plugin class.
 */
export async function createLivewireSyncPlugin(
  {
    emit,
    saveDebounceMs,
    $wire,
  }: Attrs,
): Promise<PluginConstructor> {
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
      const { model } = this.editor;

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
      const { ui } = this.editor;

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

/**
 * The attributes required to create the LivewireSync plugin.
 */
type Attrs = {
  emit: { change?: boolean; focus?: boolean; };
  saveDebounceMs: number;
  $wire: Wire;
};
