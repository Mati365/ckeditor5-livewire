import type { Editor } from 'ckeditor5';

import type { RootAttributesUpdater } from '../utils';
import type { EditorId, EditorLanguage, EditorPreset } from './typings';
import type { EditableItem } from './utils';

import { ContextsRegistry } from '../../hooks/context';
import { isEmptyObject, waitFor } from '../../shared';
import { ClassHook } from '../hook';
import { createRootAttributesUpdater } from '../utils';
import { EditorsRegistry } from './editors-registry';
import {
  createLivewireSyncPlugin,
  createSyncEditorWithInputPlugin,
} from './plugins';
import {
  assignEditorRootsToConfig,
  cleanupOrphanEditorElements,
  createEditorInContext,
  isSingleRootEditor,
  loadAllEditorTranslations,
  loadEditorConstructor,
  loadEditorPlugins,
  normalizeCustomTranslations,
  queryAllEditorEditables,
  resolveEditorConfigElementReferences,
  resolveEditorConfigTranslations,
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
   * Root attributes updater for the main editor root.
   */
  private rootAttributesUpdater: RootAttributesUpdater | null = null;

  /**
   * @inheritdoc
   */
  override async mounted(): Promise<void> {
    const { editorId } = this.canonical;

    EditorsRegistry.the.resetErrors(editorId);

    try {
      const editor = await this.createEditor();
      const editorContext = unwrapEditorContext(editor);
      const watchdog = unwrapEditorWatchdog(editor);

      // Do not even try to broadcast about the registration of the editor if hook was immediately destroyed.
      /* v8 ignore next 3 */
      if (this.isBeingDestroyed()) {
        return;
      }

      // Run some stuff that have to be reinitialized every-time editor is being restarted.
      const unmountDestroyWatcher = EditorsRegistry.the.mountEffect(editorId, (editor) => {
        // Enforce deregistration of the editor when it's being destroyed by watchdog.
        editor.once('destroy', () => {
          // Let's handle case when watchdog (or context watchdog) destroyed editor "externally"
          // user might also manually kill the editor using `.destroy()` method.
          // Keep pending callbacks though. Someone might register new callbacks just before calling `.destroy()`.
          EditorsRegistry.the.unregister(editorId, false);
        }, { priority: 'highest' });
      });

      this.onBeforeDestroy(async () => {
        // If for some reason editor not fired `destroy`, enforce deregistration.
        EditorsRegistry.the.unregister(editorId);
        unmountDestroyWatcher();

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
      });

      EditorsRegistry.the.register(editorId, editor);
    }
    catch (error: any) {
      console.error(`Error initializing CKEditor5 instance with ID "${editorId}":`, error);
      EditorsRegistry.the.error(editorId, error);
    }
  }

  /**
   * Destroys the editor instance when the component is destroyed.
   * This is important to prevent memory leaks and ensure that the editor is properly cleaned up.
   */
  override async destroyed() {
    // Let's hide the element during destruction to prevent flickering.
    this.element.style.display = 'none';
  }

  /**
   * Updates the editor content when the component is updated after commit changes.
   */
  override async afterCommitSynced(): Promise<void> {
    const editor = await EditorsRegistry.the.waitFor(this.canonical.editorId);

    /* v8 ignore if -- @preserve */
    if (editor) {
      editor.fire('afterCommitSynced');
      this.applyRootAttributes(editor);
    }
  }

  /**
   * Applies root attributes from the Livewire snapshot to the editor.
   *
   * Note: we only apply attributes to the `main` root in the editor.
   */
  private applyRootAttributes(editor: Editor): void {
    const { rootAttributes } = this.canonical;

    this.rootAttributesUpdater ??= createRootAttributesUpdater(editor, 'main');
    this.rootAttributesUpdater(rootAttributes);
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
      saveDebounceMs,
      language,
      watchdog: useWatchdog,
    } = this.canonical;

    const {
      customTranslations,
      editorType,
      licenseKey,
      watchdogConfig,
      config: { plugins, ...config },
    } = preset;

    const Constructor = await loadEditorConstructor(editorType);
    const context = await (
      contextId
        ? ContextsRegistry.the.waitFor(contextId)
        : null
    );

    /**
     * Builds the full editor configuration and creates the editor instance.
     */
    const buildAndCreateEditor = async () => {
      const { loadedPlugins, hasPremium } = await loadEditorPlugins(plugins);

      // Add integration specific plugins.
      loadedPlugins.push(
        await createLivewireSyncPlugin(
          {
            saveDebounceMs,
            component: this,
          },
        ),
      );

      if (isSingleRootEditor(editorType)) {
        loadedPlugins.push(
          await createSyncEditorWithInputPlugin(saveDebounceMs),
        );
      }

      // Mix custom translations with loaded translations.
      const loadedTranslations = await loadAllEditorTranslations(language, hasPremium);
      const mixedTranslations = [
        ...loadedTranslations,
        normalizeCustomTranslations(customTranslations || {}),
      ]
        .filter(translations => !isEmptyObject(translations));

      // Query all editable elements along with their content in one pass.
      // Roots present in the editor container's data-cke-content but not yet in the DOM
      // are included with element: null so we know which roots to wait for.
      let editables = queryAllEditorEditables(editorId);
      const requiredRoots = Object.keys(editables);

      if (isSingleRootEditor(editorType)) {
        requiredRoots.push('main');
      }

      if (!checkIfAllRootsArePresent(editables, requiredRoots)) {
        editables = await waitForAllRootsToBePresent(editorId, requiredRoots);
      }

      // Do some postprocessing on received configuration.
      let resolvedConfig = {
        ...config,
        licenseKey,
        plugins: loadedPlugins,
        language,
        ...mixedTranslations.length && {
          translations: mixedTranslations,
        },
      };

      resolvedConfig = resolveEditorConfigElementReferences(resolvedConfig);
      resolvedConfig = resolveEditorConfigTranslations([...mixedTranslations].reverse(), language.ui, resolvedConfig);
      resolvedConfig = assignEditorRootsToConfig(Constructor, editables, resolvedConfig);

      // Depending of the editor type, and parent lookup for nearest context or initialize it without it.
      const editor = await (async () => {
        if (!context) {
          return Constructor.create(resolvedConfig);
        }

        const result = await createEditorInContext({
          context,
          creator: Constructor,
          config: resolvedConfig,
        });

        return result.editor;
      })();

      if (isSingleRootEditor(editorType) && editableHeight) {
        setEditorEditableHeight(editor, editableHeight);
      }

      this.applyRootAttributes(editor);

      return editor;
    };

    // Do not use editor specific watchdog if context is attached, as the context is by default protected.
    if (useWatchdog && !context) {
      const watchdog = await wrapWithWatchdog(buildAndCreateEditor, watchdogConfig);

      // Cleanup editor registry before restart of the editor (restart might fail too).
      watchdog.on('error', (_, { causesRestart }) => {
        if (causesRestart) {
          const prevEditor = EditorsRegistry.the.getItem(editorId);

          /* v8 ignore next 3 */
          if (prevEditor) {
            cleanupOrphanEditorElements(prevEditor);
            EditorsRegistry.the.unregister(editorId);
          }
        }
      });

      // Register new instance after editor restarted.
      watchdog.on('restart', () => {
        EditorsRegistry.the.register(editorId, watchdog.editor!);
      });

      await watchdog.create({});

      return watchdog.editor!;
    }

    return buildAndCreateEditor();
  };
}

/**
 * Checks if all required root elements are present (i.e. have a non-null element) in the editables map.
 *
 * @param editables The editables map keyed by root name.
 * @param requiredRoots The list of required root names.
 * @returns True if all required roots have a DOM element attached, false otherwise.
 */
function checkIfAllRootsArePresent(editables: Record<string, EditableItem>, requiredRoots: string[]): boolean {
  return requiredRoots.every(rootId => editables[rootId]?.element);
}

/**
 * Waits for all required root elements to be present in the DOM.
 *
 * @param editorId The editor's ID.
 * @param requiredRoots The list of required root names.
 * @returns A promise that resolves to the updated editables map once all elements are attached.
 */
async function waitForAllRootsToBePresent(
  editorId: EditorId,
  requiredRoots: string[],
): Promise<Record<string, EditableItem>> {
  return waitFor(
    () => {
      const editables = queryAllEditorEditables(editorId);

      if (!checkIfAllRootsArePresent(editables, requiredRoots)) {
        throw new Error(
          'It looks like not all required root elements are present yet.\n'
          + '* If you want to wait for them, ensure they are registered before editor initialization.\n'
          + '* If you want lazy initialize roots, consider removing root values from the `initialData` config '
          + 'and assign initial data in editable components.\n'
          + `Missing roots: ${requiredRoots.filter(rootId => !editables[rootId]?.element).join(', ')}.`,
        );
      }

      return editables;
    },
    { timeOutAfter: 2000, retryAfter: 100 },
  );
}

/**
 * A snapshot of the Livewire component's state relevant to the CKEditor5 hook.
 */
export type Snapshot = {
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
   * Root element name.
   */
  modelElement: string | null;

  /**
   * The language of the editor UI and content.
   */
  language: EditorLanguage;

  /**
   * Root attributes to apply to the main editor root.
   */
  rootAttributes?: Record<string, unknown>;
};
