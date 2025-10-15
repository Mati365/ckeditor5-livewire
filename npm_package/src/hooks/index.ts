import { ContextComponentHook } from './context';
import { EditableComponentHook } from './editable';
import { EditorComponentHook } from './editor';
import { registerLivewireComponentHook } from './hook';
import { UIPartComponentHook } from './ui-part';

const COMPONENT_HOOKS = {
  'ckeditor5': EditorComponentHook,
  'ckeditor5-context': ContextComponentHook,
  'ckeditor5-ui-part': UIPartComponentHook,
  'ckeditor5-editable': EditableComponentHook,
};

/**
 * Registers all available Livewire component hooks.
 */
export function registerLivewireComponentHooks() {
  for (const [name, Hook] of Object.entries(COMPONENT_HOOKS)) {
    registerLivewireComponentHook(name, Hook);
  }
}
