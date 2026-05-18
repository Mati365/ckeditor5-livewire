import type { EditorConfig } from 'ckeditor5';

import type { EditorRelaxedConstructor } from '../types/editor-relaxed-constructor.type';
import type { EditableItem } from './query-all-editor-editables';

/**
 * Assigns DOM elements and initial data to the editor configuration in a way that is compatible
 * with the specific editor type.
 *
 * Roots with `element: null` (pending roots not yet in the DOM) contribute only `initialData`
 * and are skipped for element assignment.
 *
 * @param Editor Constructor of the editor used to determine the location of element config entry.
 * @param editables Map of editable items (element + content) keyed by root name.
 * @param config Config of the editor.
 * @returns The updated configuration object.
 */
export function assignEditorRootsToConfig<C extends EditorConfig>(
  Editor: EditorRelaxedConstructor,
  editables: Record<string, EditableItem>,
  config: C,
): C {
  const isClassicEditor = !Editor.editorName || Editor.editorName === 'ClassicEditor';
  const allRootsKeys = new Set([
    ...Object.keys(editables),
    ...Object.keys(config.roots ?? {}),
  ]);

  /* v8 ignore start -- @preserve */
  const rootsConfig = Array.from(allRootsKeys).reduce((acc, rootKey) => ({
    ...acc,
    [rootKey]: {
      ...config.roots?.[rootKey],
      ...rootKey === 'main' ? config.root : {},
      ...rootKey in editables
        ? {
            ...editables[rootKey]!.content !== null && {
              initialData: editables[rootKey]!.content,
            },
            ...!isClassicEditor && editables[rootKey]!.element !== null && {
              element: editables[rootKey]!.element,
            },
          }
        : {},
    },
  }), Object.create(config.roots || {}));
  /* v8 ignore stop */

  const mappedConfig: C = {
    ...config,
    roots: rootsConfig,
    ...isClassicEditor && editables['main']?.element && {
      attachTo: editables['main'].element,
    },
  };

  delete mappedConfig.root;

  return mappedConfig;
}
