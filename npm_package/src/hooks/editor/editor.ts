import type { Editor } from 'ckeditor5';

import type { EditorPreset } from './typings';
import type { EditorCreator } from './utils';

import { ContextsRegistry, getNearestContextParentPromise } from '../../hooks/context';
import { isEmptyObject } from '../../shared';
import { ClassHook } from '../hook';
import { EditorsRegistry } from './editors-registry';
import {
  createLivewireSyncPlugin,
  createSyncEditorWithInputPlugin,
} from './plugins';
import {
  createEditorInContext,
  isSingleEditingLikeEditor,
  loadAllEditorTranslations,
  loadEditorConstructor,
  loadEditorPlugins,
  normalizeCustomTranslations,
  queryEditablesElements,
  queryEditablesSnapshotContent,
  resolveEditorConfigElementReferences,
  setEditorEditableHeight,
  unwrapEditorContext,
  unwrapEditorWatchdog,
  wrapWithWatchdog,
} from './utils';

/**
 * The Livewire hook that manages the lifecycle of CKEditor5 instances.
 */
export class EditorComponentHook extends ClassHook<Snapshot> {
  /**
   * The promise that resolves to the editor instance.
   */
  private editorPromise: Promise<Editor> | null = null;

  /**
   * @inheritdoc
   */
  override async mounted(): Promise<void> {
    const { editorId } = this.ephemeral;

    this.editorPromise = this.createEditor();

    const editor = await this.editorPromise;

    // Do not even try to broadcast about the registration of the editor
    // if hook was immediately destroyed.
    if (!this.isBeingDestroyed()) {
      EditorsRegistry.the.register(editorId, editor);

      editor.once('destroy', () => {
        if (EditorsRegistry.the.hasItem(editorId)) {
          EditorsRegistry.the.unregister(editorId);
        }
      });
    }
  }

  /**
   * Destroys the editor instance when the component is destroyed.
   * This is important to prevent memory leaks and ensure that the editor is properly cleaned up.
   */
  override async destroyed() {
    // Let's hide the element during destruction to prevent flickering.
    this.element.style.display = 'none';

    // Let's wait for the mounted promise to resolve before proceeding with destruction.
    try {
      const editor = (await this.editorPromise)!;
      const editorContext = unwrapEditorContext(editor);
      const watchdog = unwrapEditorWatchdog(editor);

      if (editorContext) {
        // If context is present, make sure it's not in unmounting phase, as it'll kill the editors.
        // If it's being destroyed, don't do anything, as the context will take care of it.
        if (editorContext.state !== 'unavailable') {
          await editorContext.context.remove(editorContext.editorContextId);
        }
      }
      else if (watchdog) {
        await watchdog.destroy();
      }
      else {
        await editor.destroy();
      }
    }
    finally {
      this.editorPromise = null;
    }
  }

  /**
   * Creates the CKEditor instance.
   */
  private async createEditor() {
    const {
      preset,
      editorId,
      contextId,
      editableHeight,
      emit,
      saveDebounceMs,
      language,
      watchdog,
      content,
    } = this.ephemeral;

    const {
      customTranslations,
      editorType,
      licenseKey,
      config: { plugins, ...config },
    } = preset;

    // Wrap editor creator with watchdog if needed.
    let Constructor: EditorCreator = await loadEditorConstructor(editorType);
    const context = await (
      contextId
        ? ContextsRegistry.the.waitFor(contextId)
        : getNearestContextParentPromise(this.element)
    );

    // Do not use editor specific watchdog if context is attached, as the context is by default protected.
    if (watchdog && !context) {
      const wrapped = await wrapWithWatchdog(Constructor);

      ({ Constructor } = wrapped);
      wrapped.watchdog.on('restart', () => {
        const newInstance = wrapped.watchdog.editor!;

        this.editorPromise = Promise.resolve(newInstance);

        EditorsRegistry.the.register(editorId, newInstance);
      });
    }

    const { loadedPlugins, hasPremium } = await loadEditorPlugins(plugins);

    // Add integration specific plugins.
    loadedPlugins.push(await createLivewireSyncPlugin());

    if (isSingleEditingLikeEditor(editorType)) {
      loadedPlugins.push(await createSyncEditorWithInputPlugin());
    }

    // Mix custom translations with loaded translations.
    const loadedTranslations = await loadAllEditorTranslations(language, hasPremium);
    const mixedTranslations = [
      ...loadedTranslations,
      normalizeCustomTranslations(customTranslations || {}),
    ]
      .filter(translations => !isEmptyObject(translations));

    // Let's query all elements, and create basic configuration.
    let initialData: string | Record<string, string> = {
      ...content,
      ...queryEditablesSnapshotContent(editorId, editorType),
    };

    if (isSingleEditingLikeEditor(editorType)) {
      initialData = initialData['main'] || '';
    }

    const parsedConfig = {
      ...resolveEditorConfigElementReferences(config),
      initialData,
      licenseKey,
      plugins: loadedPlugins,
      language,
      livewire: {
        saveDebounceMs,
        component: this,
        emit,
        editorId,
      },
      ...mixedTranslations.length && {
        translations: mixedTranslations,
      },
    };

    // Depending of the editor type, and parent lookup for nearest context or initialize it without it.
    const editor = await (async () => {
      const sourceElementOrData = queryEditablesElements(editorId, editorType);

      if (!context || !(sourceElementOrData instanceof HTMLElement)) {
        return Constructor.create(sourceElementOrData as any, parsedConfig);
      }

      const result = await createEditorInContext({
        context,
        element: sourceElementOrData,
        creator: Constructor,
        config: parsedConfig,
      });

      return result.editor;
    })();

    if (isSingleEditingLikeEditor(editorType) && editableHeight) {
      setEditorEditableHeight(editor, editableHeight);
    }

    return editor;
  };
}

/**
 * A snapshot of the Livewire component's state relevant to the CKEditor5 hook.
 */
type Snapshot = {
  /**
   * The unique identifier for the CKEditor5 instance.
   */
  editorId: string;

  /**
   * Whether to use a watchdog for the CKEditor5 instance.
   */
  watchdog: boolean;

  /**
   * The identifier of the CKEditor context.
   */
  contextId: string | null;

  /**
   * The debounce time in milliseconds for saving content changes.
   */
  saveDebounceMs: number;

  /**
   * The preset configuration for the CKEditor5 instance.
   */
  preset: EditorPreset;

  /**
   * The content of the editor, mapped by ID of root elements.
   */
  content: Record<string, string>;

  /**
   * The height of the editable area, if specified.
   */
  editableHeight: number | null;

  /**
   * The language of the editor UI and content.
   */
  language: {
    ui: string;
    content: string;
  };

  /**
   * The global events of the editor to forward to Livewire.
   */
  emit: {
    change: boolean;
    focus: boolean;
    blur: boolean;
  };
};
