import { ContextComponentHook } from './context';
import { EditorComponentHook } from './editor';
import { registerLivewireComponentHook } from './hook';

const COMPONENT_HOOKS = {
  'ckeditor5': EditorComponentHook,
  'ckeditor5-context': ContextComponentHook,
};

/**
 * Registers all available Livewire component hooks.
 */
export function registerLivewireComponentHooks() {
  for (const [name, Hook] of Object.entries(COMPONENT_HOOKS)) {
    registerLivewireComponentHook(name, Hook);
  }
}
