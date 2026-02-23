import type { PluginConstructor } from 'ckeditor5';

import type { EditorComponentHook } from '../editor';

import { debounce, shallowEqual } from '../../../shared';
import { getEditorRootsValues, isWireModelConnected } from '../utils';

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
      this.setupAfterCommitHandler();
      this.setupSetEditorContentHandler();
      this.setupReadyDispatch();
    }

    /**
     * Setups handler that updates the editor content after Livewire changes attributes
     * on the component and commits the changes, but only if the editor is not focused to prevent
     * disrupting the user while editing.
     */
    private setupAfterCommitHandler() {
      const { editor } = this;
      const { model, ui: { focusTracker } } = editor;

      let pendingContent: Record<string, string> | null = null;

      editor.on('afterCommitSynced', () => {
        if (!isWireModelConnected(component.element)) {
          return;
        }

        const { content } = component.canonical;
        const values = this.getEditorRootsValues();

        // If editor is focused, save the content to apply later when it blurs.
        if (focusTracker.isFocused) {
          if (!shallowEqual(content, values)) {
            pendingContent = content;
          }

          return;
        }

        if (!shallowEqual(content, values)) {
          editor.setData(content);
        }
      });

      // Track user changes while focused.
      model.document.on('change:data', () => {
        pendingContent = null;
      });

      // Apply pending content on blur if user didn't make changes.
      focusTracker.on('change:isFocused', () => {
        if (!focusTracker.isFocused && pendingContent !== null) {
          editor.setData(pendingContent);
          pendingContent = null;
        }
      });
    }

    /**
     * Dispatches a Livewire event when the editor becomes ready.
     *
     * This allows the Livewire component or parent to react as soon as the
     * instance is fully initialized. The payload contains the editorId so the
     * listener can ignore events coming from other editors on the page.
     */
    private setupReadyDispatch() {
      const { $wire } = component;

      // `ready` is fired by CKEditor5 once initialization finishes. We only
      // need to fire the Livewire event once, hence `once`.
      this.editor.once('ready', () => {
        $wire.dispatch('editor-ready', {
          editorId: component.canonical.editorId,
        });
      });
    }

    /**
     * Setups the content sync from Livewire to the editor when Livewire emits an event.
     */
    private setupSetEditorContentHandler() {
      Livewire.on('set-editor-content', ({ editorId, content }: SetContentPayload) => {
        if (editorId !== component.canonical.editorId) {
          return;
        }

        const currentValues = this.getEditorRootsValues();

        if (!shallowEqual(currentValues, content)) {
          this.editor.setData(content);
        }
      });
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
        if (!shallowEqual(values, component.canonical.content ?? {})) {
          $wire.set('content', values);
          $wire.dispatch('editor-content-changed', {
            editorId: component.canonical.editorId,
            content: values,
          });
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
        if (!shallowEqual(values, component.canonical.content ?? {})) {
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
 * Payload for setting editor content.
 */
type SetContentPayload = {
  editorId: string;
  content: Record<string, string>;
};

/**
 * The attributes required to create the LivewireSync plugin.
 */
type Attrs = {
  saveDebounceMs: number;
  component: EditorComponentHook;
};
