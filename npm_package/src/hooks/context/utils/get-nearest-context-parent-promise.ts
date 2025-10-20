import type { Context, ContextWatchdog } from 'ckeditor5';

import { ContextsRegistry } from '../contexts-registry';

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
 * Type guard to check if an element is a context hook HTMLElement.
 */
function isContextHookHTMLElement(el: HTMLElement): boolean {
  return el.hasAttribute('cke-context');
}
