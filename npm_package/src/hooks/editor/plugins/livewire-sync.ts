import type { PluginConstructor } from 'ckeditor5';

import { debounce } from 'shared';

import type { EditorId } from '../typings';

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
      const config = this.editor.config.get('livewire') as {
        component: any;
        emit: {
          change?: boolean;
          blur?: boolean;
          focus?: boolean;
        };
        editorId: string;
        saveDebounceMs: number;
      } | undefined;

      if (!config) {
        return;
      }

      const { emit } = config;

      if (emit.change) {
        this.setupTypingContentPush();
      }

      if (emit.blur) {
        this.setupFocusableEventPush('blur');
      }

      if (emit.focus) {
        this.setupFocusableEventPush('focus');
      }
    }

    /**
     * Setups the content push event for the editor.
     */
    private setupTypingContentPush() {
      const config = this.editor.config.get('livewire') as {
        component: any;
        emit: {
          change?: boolean;
          blur?: boolean;
          focus?: boolean;
        };
        editorId: string;
        saveDebounceMs: number;
      } | undefined;

      if (!config) {
        return;
      }

      const { editorId, saveDebounceMs, component } = config;

      const pushContentChange = () => {
        component.emitGlobalEvent(
          'ckeditor5:change',
          {
            editorId,
            data: getEditorRootsValues(this.editor),
          },
        );
      };

      this.editor.model.document.on('change:data', debounce(saveDebounceMs, pushContentChange));
      pushContentChange();
    }

    /**
     * Setups the event push for the editor.
     */
    private setupFocusableEventPush(eventType: 'focus' | 'blur') {
      const config = this.editor.config.get('livewire');
      if (!config) {
        return;
      }

      const { editorId, component } = config;

      const pushEvent = () => {
        const { isFocused } = this.editor.ui.focusTracker;
        const currentType = isFocused ? 'focus' : 'blur';

        if (currentType !== eventType) {
          return;
        }

        component.emitGlobalEvent(
          `ckeditor5:${eventType}`,
          {
            editorId,
            data: getEditorRootsValues(this.editor),
          },
        );
      };

      this.editor.ui.focusTracker.on('change:isFocused', pushEvent);
    }
  };
}

declare module 'ckeditor5' {
  // eslint-disable-next-line ts/consistent-type-definitions
  interface EditorConfig {
    livewire?: {
      component: any;
      emit: {
        change?: boolean;
        blur?: boolean;
        focus?: boolean;
      };
      editorId: EditorId;
      saveDebounceMs: number;
    };
  }
}
