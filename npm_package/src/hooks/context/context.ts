import type { Context, ContextWatchdog } from 'ckeditor5';

import { ClassHook } from 'hooks/hook';
import { isEmptyObject } from 'shared';

import type { ContextConfig } from './typings';

import {
  loadAllEditorTranslations,
  loadEditorPlugins,
  normalizeCustomTranslations,
} from '../editor/utils';
import { ContextsRegistry } from './contexts-registry';

/**
 * The Livewire hook that mounts CKEditor context instances.
 */
export class ContextComponentHook extends ClassHook<Snapshot> {
  /**
   * The promise that resolves to the context instance.
   */
  private contextPromise: Promise<ContextWatchdog<Context>> | null = null;

  /**
   * Mounts the context component.
   */
  override async mounted() {
    const { id, language } = this.ephemeral;
    const { customTranslations, watchdogConfig, config: { plugins, ...config } } = this.ephemeral.config;

    const { loadedPlugins, hasPremium } = await loadEditorPlugins(plugins ?? []);

    // Mix custom translations with loaded translations.
    const loadedTranslations = await loadAllEditorTranslations(language, hasPremium);
    const mixedTranslations = [
      ...loadedTranslations,
      normalizeCustomTranslations(customTranslations?.dictionary || {}),
    ]
      .filter(translations => !isEmptyObject(translations));

    // Initialize context.
    this.contextPromise = (async () => {
      const { ContextWatchdog, Context } = await import('ckeditor5');
      const instance = new ContextWatchdog(Context, {
        crashNumberLimit: 10,
        ...watchdogConfig,
      });

      await instance.create({
        ...config,
        language,
        plugins: loadedPlugins,
        ...mixedTranslations.length && {
          translations: mixedTranslations,
        },
      });

      instance.on('itemError', (...args) => {
        console.error('Context item error:', ...args);
      });

      return instance;
    })();

    const context = await this.contextPromise;

    if (!this.isBeingDestroyed()) {
      ContextsRegistry.the.register(id, context);
    }
  }

  /**
   * Destroys the context component. Unmounts root from the editor.
   */
  override async destroyed() {
    const { id } = this.ephemeral;

    // Let's hide the element during destruction to prevent flickering.
    this.element.style.display = 'none';

    // Let's wait for the mounted promise to resolve before proceeding with destruction.
    try {
      const context = await this.contextPromise;

      await context?.destroy();
    }
    finally {
      this.contextPromise = null;

      if (ContextsRegistry.the.hasItem(id)) {
        ContextsRegistry.the.unregister(id);
      }
    }
  }
}

/**
 * Type guard to check if an element is a context hook HTMLElement.
 */
function isContextHookHTMLElement(el: HTMLElement): el is HTMLElement & { instance: ContextComponentHook; } {
  return el.hasAttribute('cke-context');
}

/**
 * Gets the nearest context hook parent element.
 */
function getNearestContextParent(el: HTMLElement) {
  let parent: HTMLElement | null = el;

  while (parent) {
    if (isContextHookHTMLElement(parent)) {
      return parent;
    }

    parent = parent.parentElement;
  }

  return null;
}

/**
 * Gets the nearest context parent element as a promise.
 */
export async function getNearestContextParentPromise(el: HTMLElement): Promise<ContextWatchdog<Context> | null> {
  const parent = getNearestContextParent(el);

  if (!parent) {
    return null;
  }

  return ContextsRegistry.the.waitFor(parent.id);
}

/**
 * The snapshot type stored in the Livewire Context hook.
 */
type Snapshot = {
  id: string;
  config: ContextConfig;
  language: {
    ui: string;
    content: string;
  };
};
