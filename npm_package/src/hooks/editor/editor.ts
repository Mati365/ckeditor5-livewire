import type { Editor } from 'ckeditor5';

import type { RootAttributesUpdater } from '../utils';
import type { EditorId, EditorLanguage, EditorPreset } from './typings';

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
  cleanupOrphanEditorElements,
  createEditorInContext,
  isSingleRootEditor,
  loadAllEditorTranslations,
  loadEditorConstructor,
  loadEditorPlugins,
  normalizeCustomTranslations,
  queryEditablesElements,
  queryEditablesSnapshotContent,
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
      content,
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

      // Let's query all elements, and create basic configuration.
      let initialData: string | Record<string, string> = {
        ...content,
        ...queryEditablesSnapshotContent(editorId),
      };

      if (isSingleRootEditor(editorType)) {
        initialData = initialData['main'] || '';
      }

      // Depending of the editor type, and parent lookup for nearest context or initialize it without it.
      const editor = await (async () => {
        let sourceElements: HTMLElement | Record<string, HTMLElement> = queryEditablesElements(editorId);

        // Handle special case when user specified `initialData` of several root elements, but editable components
        // are not yet present in the DOM. In other words - editor is initialized before attaching root elements.
        if (!(sourceElements instanceof HTMLElement) && !('main' in sourceElements)) {
          const requiredRoots = (
            editorType === 'decoupled'
              ? ['main']
              : Object.keys(initialData as Record<string, string>)
          );

          if (!checkIfAllRootsArePresent(sourceElements, requiredRoots)) {
            sourceElements = await waitForAllRootsToBePresent(editorId, requiredRoots);
            initialData = {
              ...content,
              ...queryEditablesSnapshotContent(editorId),
            };
          }
        }

        // If single root editor, unwrap the element from the object.
        if (isSingleRootEditor(editorType) && 'main' in sourceElements) {
          sourceElements = sourceElements['main'];
        }

        // Construct parsed config. First resolve DOM element references in the provided configuration.
        let resolvedConfig = resolveEditorConfigElementReferences(config);

        // Then resolve translation references in the provided configuration, using the mixed translations.
        resolvedConfig = resolveEditorConfigTranslations([...mixedTranslations].reverse(), language.ui, resolvedConfig);

        // Construct parsed config.
        const parsedConfig = {
          ...resolvedConfig,
          initialData,
          licenseKey,
          plugins: loadedPlugins,
          language,
          ...mixedTranslations.length && {
            translations: mixedTranslations,
          },
        };

        if (!context || !(sourceElements instanceof HTMLElement)) {
          return Constructor.create(sourceElements as any, parsedConfig);
        }

        const result = await createEditorInContext({
          context,
          element: sourceElements,
          creator: Constructor,
          config: parsedConfig,
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
 * Checks if all required root elements are present in the elements object.
 *
 * @param elements The elements object mapping root IDs to HTMLElements.
 * @param requiredRoots The list of required root IDs.
 * @returns True if all required roots are present, false otherwise.
 */
function checkIfAllRootsArePresent(elements: Record<string, HTMLElement>, requiredRoots: string[]): boolean {
  return requiredRoots.every(rootId => elements[rootId]);
}

/**
 * Waits for all required root elements to be present in the DOM.
 *
 * @param editorId The editor's ID.
 * @param requiredRoots The list of required root IDs.
 * @returns A promise that resolves to the record of root elements.
 */
async function waitForAllRootsToBePresent(
  editorId: EditorId,
  requiredRoots: string[],
): Promise<Record<string, HTMLElement>> {
  return waitFor(
    () => {
      const elements = queryEditablesElements(editorId) as unknown as Record<string, HTMLElement>;

      if (!checkIfAllRootsArePresent(elements, requiredRoots)) {
        throw new Error(
          'It looks like not all required root elements are present yet.\n'
          + '* If you want to wait for them, ensure they are registered before editor initialization.\n'
          + '* If you want lazy initialize roots, consider removing root values from the `initialData` config '
          + 'and assign initial data in editable components.\n'
          + `Missing roots: ${requiredRoots.filter(rootId => !elements[rootId]).join(', ')}.`,
        );
      }

      return elements;
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
   * The language of the editor UI and content.
   */
  language: EditorLanguage;

  /**
   * Root attributes to apply to the main editor root.
   */
  rootAttributes?: Record<string, unknown>;
};
