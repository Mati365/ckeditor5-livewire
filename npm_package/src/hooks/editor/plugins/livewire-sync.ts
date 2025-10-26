import type { PluginConstructor } from 'ckeditor5';

import type { EditorComponentHook } from '../editor';

import { debounce, shallowEqual } from '../../../shared';
import { getEditorRootsValues } from '../utils';

/**
 * Creates a LivewireSync plugin class.
 */
export async function createLivewireSyncPlugin(
  {
    saveDebounceMs,
    component,
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
      this.setupTypingContentPush();
      this.setupFocusableEventPush();
    }

    /**
     * Setups the content push event for the editor.
     */
    private setupTypingContentPush() {
      const { model } = this.editor;
      const { $wire } = component;

      const syncContentChange = () => {
        const values = this.getEditorRootsValues();

        // Prevent looping when editor changed content from Livewire.
        if (!shallowEqual(values, component.canonical.content)) {
          $wire.set('content', values);
        }
      };

      model.document.on('change:data', debounce(saveDebounceMs, syncContentChange));
      this.editor.once('ready', syncContentChange);
    }

    /**
     * Setups the event push for the editor.
     */
    private setupFocusableEventPush() {
      const { ui } = this.editor;
      const { $wire } = component;

      const pushEvent = () => {
        const values = this.getEditorRootsValues();

        $wire.set('focused', ui.focusTracker.isFocused);

        // Only push content if it has changed compared to canonical
        if (!shallowEqual(values, component.canonical.content)) {
          $wire.set('content', values);
        }
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
  saveDebounceMs: number;
  component: EditorComponentHook;
};
