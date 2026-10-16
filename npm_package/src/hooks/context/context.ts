import type { Context } from 'ckeditor5';

import type { EditorLanguage } from '../editor';
import type { ContextConfig } from './typings';

import { ClassHook } from '../../hooks/hook';
import { isEmptyObject, makeDestroyIdempotent } from '../../shared';
import {
  loadAllEditorTranslations,
  loadEditorPlugins,
  normalizeCustomTranslations,
  resolveEditorConfigElementReferences,
  resolveEditorConfigTranslations,
} from '../editor/utils';
import { ContextsRegistry } from './contexts-registry';

/**
 * The Livewire hook that mounts CKEditor context instances.
 */
export class ContextComponentHook extends ClassHook<Snapshot> {
  /**
   * The promise that resolves to the context instance.
   */
  private contextPromise: Promise<Context> | null = null;

  /**
   * Unregisters the error callback of the current context instance.
   */
  private offEditorError: VoidFunction | null = null;

  /**
   * Mounts the context component.
   */
  override async mounted() {
    const { contextId } = this.canonical;

    ContextsRegistry.the.resetErrors(contextId);

    // Assigned synchronously, so `destroyed()` always has something to destroy,
    // even if the hook is destroyed while plugins or translations are still loading.
    const contextPromise = this.createContext();

    this.contextPromise = contextPromise;

    try {
      const context = await contextPromise;
      const { onEditorError } = await import('ckeditor5');

      // Destroyed in the meantime. `destroyed()` awaits `contextPromise` and destroys the context.
      if (this.isBeingDestroyed()) {
        return;
      }

      // Nothing restarts the context after a crash anymore. Its state may be inconsistent, so lock
      // its editors in read-only mode. Errors attributed to editors are handled by editor hooks.
      this.offEditorError = onEditorError(({ error, source }) => {
        if (source !== context) {
          return;
        }

        console.error(`CKEditor5 context with ID "${contextId}" failed.`, error);

        for (const editor of context.editors) {
          editor.enableReadOnlyMode('error-handling');
        }
      });

      ContextsRegistry.the.register(contextId, context);
    }
    catch (error: any) {
      // Without this, editors waiting for this context would hang forever.
      console.error(`Error initializing CKEditor5 context with ID "${contextId}":`, error);
      ContextsRegistry.the.error(contextId, error);
    }
  }

  /**
   * Destroys the context component. Destroying the context destroys all its editors too.
   */
  override async destroyed() {
    const { contextId } = this.canonical;

    // Let's hide the element during destruction to prevent flickering.
    this.element.style.display = 'none';

    this.offEditorError?.();
    this.offEditorError = null;

    const { contextPromise } = this;

    this.contextPromise = null;

    /* v8 ignore next 3 -- @preserve */
    if (!contextPromise) {
      return;
    }

    // Creation errors are already reported in `mounted()`.
    const context = await contextPromise.catch(() => null);

    if (!context) {
      return;
    }

    // Unregister before destroying, so newly mounted editors don't pick up a context that is going down.
    // Don't touch the registry if another hook with the same ID has already registered its own context.
    if (ContextsRegistry.the.getItem(contextId) === context) {
      ContextsRegistry.the.unregister(contextId);
    }

    try {
      await context.destroy();
    }
    catch (error) {
      console.error(`Failed to destroy CKEditor5 context with ID "${contextId}".`, error);
    }
  }

  /**
   * Loads plugins and translations and creates the context instance.
   */
  private async createContext(): Promise<Context> {
    const { language, context: contextConfig } = this.canonical;
    const { customTranslations, config: { plugins, ...config } } = contextConfig;

    const { loadedPlugins, hasPremium } = await loadEditorPlugins(plugins ?? []);

    // Mix custom translations with loaded translations.
    const loadedTranslations = await loadAllEditorTranslations(language, hasPremium);
    const mixedTranslations = [
      ...loadedTranslations,
      normalizeCustomTranslations(customTranslations || {}),
    ]
      .filter(translations => !isEmptyObject(translations));

    // Construct parsed config. First resolve DOM element references in the provided configuration.
    let resolvedConfig = resolveEditorConfigElementReferences(config);

    // Then resolve translation references in the provided configuration, using the mixed translations.
    resolvedConfig = resolveEditorConfigTranslations([...mixedTranslations].reverse(), language.ui, resolvedConfig);

    const { Context } = await import('ckeditor5');

    const context = await Context.create({
      ...resolvedConfig,
      language,
      plugins: loadedPlugins,
      ...mixedTranslations.length && {
        translations: mixedTranslations,
      },
    });

    // The context may be destroyed both by this hook and by `ContextsRegistry#destroyAll()`.
    return makeDestroyIdempotent(context);
  }
}

/**
 * The snapshot type stored in the Livewire Context hook.
 */
type Snapshot = {
  /**
   * The unique identifier for the context instance.
   */
  contextId: string;

  /**
   * The context configuration for the context instance.
   */
  context: ContextConfig;

  /**
   * The language of the context UI and content.
   */
  language: EditorLanguage;
};
