import type { Editor } from 'ckeditor5';

import { ContextsRegistry, getNearestContextParentPromise } from 'hooks/context';
import { debounce, isEmptyObject, mapObjectValues } from 'shared';

import type { EditorId, EditorPreset, EditorType } from './typings';
import type { EditorCreator } from './utils';

import { ClassHook } from '../hook';
import { EditorsRegistry } from './editors-registry';
import {
  createEditorInContext,
  isSingleEditingLikeEditor,
  loadAllEditorTranslations,
  loadEditorConstructor,
  loadEditorPlugins,
  normalizeCustomTranslations,
  queryAllEditorEditables,
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
    const { preset, editorId, contextId, editableHeight, events, saveDebounceMs, language, watchdog } = this.ephemeral;
    const { customTranslations, editorType, licenseKey, config: { plugins, ...config } } = preset;

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

    // Mix custom translations with loaded translations.
    const loadedTranslations = await loadAllEditorTranslations(language, hasPremium);
    const mixedTranslations = [
      ...loadedTranslations,
      normalizeCustomTranslations(customTranslations?.dictionary || {}),
    ]
      .filter(translations => !isEmptyObject(translations));

    // Let's query all elements, and create basic configuration.
    const sourceElementOrData = getInitialRootsContentElements(editorId, editorType);
    const parsedConfig = {
      ...resolveEditorConfigElementReferences(config),
      initialData: getInitialRootsValues(editorId, editorType),
      licenseKey,
      plugins: loadedPlugins,
      language,
      ...mixedTranslations.length && {
        translations: mixedTranslations,
      },
    };

    // Depending of the editor type, and parent lookup for nearest context or initialize it without it.
    const editor = await (async () => {
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

    if (events.change) {
      this.setupTypingContentPush(editorId, editor, saveDebounceMs);
    }

    if (events.blur) {
      this.setupEventPush(editorId, editor, 'blur');
    }

    if (events.focus) {
      this.setupEventPush(editorId, editor, 'focus');
    }

    if (isSingleEditingLikeEditor(editorType)) {
      const input = document.getElementById(`${editorId}_input`) as HTMLInputElement | null;

      if (input) {
        syncEditorToInput(input, editor, saveDebounceMs);
      }

      if (editableHeight) {
        setEditorEditableHeight(editor, editableHeight);
      }
    }

    return editor;
  };

  /**
   * Setups the content push event for the editor.
   */
  private setupTypingContentPush(editorId: EditorId, editor: Editor, saveDebounceMs: number) {
    const pushContentChange = () => {
      this.pushEvent(
        'ckeditor5:change',
        {
          editorId,
          data: getEditorRootsValues(editor),
        },
      );
    };

    editor.model.document.on('change:data', debounce(saveDebounceMs, pushContentChange));
    pushContentChange();
  }

  /**
   * Setups the event push for the editor.
   */
  private setupEventPush(editorId: EditorId, editor: Editor, eventType: 'focus' | 'blur') {
    const pushEvent = () => {
      const { isFocused } = editor.ui.focusTracker;
      const currentType = isFocused ? 'focus' : 'blur';

      if (currentType !== eventType) {
        return;
      }

      this.pushEvent(
        `ckeditor5:${eventType}`,
        {
          editorId,
          data: getEditorRootsValues(editor),
        },
      );
    };

    editor.ui.focusTracker.on('change:isFocused', pushEvent);
  }
}

/**
 * Gets the values of the editor's roots.
 *
 * @param editor The CKEditor instance.
 * @returns An object mapping root names to their content.
 */
function getEditorRootsValues(editor: Editor) {
  const roots = editor.model.document.getRootNames();

  return roots.reduce<Record<string, string>>((acc, rootName) => {
    acc[rootName] = editor.getData({ rootName });
    return acc;
  }, Object.create({}));
}

/**
 * Synchronizes the editor's content with a hidden input field.
 *
 * @param input The input element to synchronize with the editor.
 * @param editor The CKEditor instance.
 */
function syncEditorToInput(input: HTMLInputElement, editor: Editor, saveDebounceMs: number) {
  const sync = () => {
    const newValue = editor.getData();

    input.value = newValue;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  editor.model.document.on('change:data', debounce(saveDebounceMs, sync));
  getParentFormElement(input)?.addEventListener('submit', sync);

  sync();
}

/**
 * Gets the parent form element of the given HTML element.
 *
 * @param element The HTML element to find the parent form for.
 * @returns The parent form element or null if not found.
 */
function getParentFormElement(element: HTMLElement) {
  return element.closest('form') as HTMLFormElement | null;
}

/**
 * Gets the initial root elements for the editor based on its type.
 *
 * @param editorId The editor's ID.
 * @param type The type of the editor.
 * @returns The root element(s) for the editor.
 */
function getInitialRootsContentElements(editorId: EditorId, type: EditorType) {
  // While the `decoupled` editor is a single editing-like editor, it has a different structure
  // and requires special handling to get the main editable.
  if (type === 'decoupled') {
    const { content } = queryDecoupledMainEditableOrThrow(editorId);

    return content;
  }

  if (isSingleEditingLikeEditor(type)) {
    return document.getElementById(`${editorId}_editor`)!;
  }

  const editables = queryAllEditorEditables(editorId);

  return mapObjectValues(editables, ({ content }) => content);
}

/**
 * Gets the initial data for the roots of the editor. If the editor is a single editing-like editor,
 * it retrieves the initial value from the element's attribute. Otherwise, it returns an object mapping
 * editable names to their initial values.
 *
 * @param editorId The editor's ID.
 * @param type The type of the editor.
 * @returns The initial values for the editor's roots.
 */
function getInitialRootsValues(editorId: EditorId, type: EditorType) {
  // While the `decoupled` editor is a single editing-like editor, it has a different structure
  // and requires special handling to get the main editable.
  if (type === 'decoupled') {
    const { initialValue } = queryDecoupledMainEditableOrThrow(editorId);

    // If initial value is not set, then pick it from the editor element.
    if (initialValue) {
      return initialValue;
    }
  }

  // Let's check initial value assigned to the editor element.
  if (isSingleEditingLikeEditor(type)) {
    const initialValue = document.getElementById(editorId)?.getAttribute('cke-initial-value') || '';

    return initialValue;
  }

  const editables = queryAllEditorEditables(editorId);

  return mapObjectValues(editables, ({ initialValue }) => initialValue);
}

/**
 * Queries the main editable for a decoupled editor and throws an error if not found.
 *
 * @param editorId The ID of the editor to query.
 */
function queryDecoupledMainEditableOrThrow(editorId: EditorId) {
  const mainEditable = queryAllEditorEditables(editorId)['main'];

  if (!mainEditable) {
    throw new Error(`No "main" editable found for editor with ID "${editorId}".`);
  }

  return mainEditable;
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
   * The events of the editor to forward to Livewire.
   */
  events: {
    change: boolean;
    focus: boolean;
    blur: boolean;
  };
};
