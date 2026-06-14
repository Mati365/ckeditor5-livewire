import type { EditorId } from '../typings';

/**
 * Queries all editable elements within a specific editor instance. It picks
 * initial values from Livewire component canonicals or from the root editor
 * component's content, whichever is available.
 *
 * Roots present in the editor component's content but without a matching
 * `ckeditor5-editable` component yet are included with `element: null` — these
 * are "pending" roots that haven't been attached to the DOM yet.
 *
 * @param editorId The ID of the editor to query.
 * @returns An object mapping root names to their corresponding elements and content.
 */
export function queryAllEditorEditables(editorId: EditorId): Record<string, EditableItem> {
  const acc = window.Livewire
    .all()
    .filter(({ name, canonical }) => name === 'ckeditor5-editable' && canonical['editorId'] === editorId)
    .reduce<Record<string, EditableItem>>((acc, { canonical, el }) => {
      const rootName = canonical['rootName'] as string;
      const modelElement = (canonical['modelElement'] || null) as string | null;

      acc[rootName] = {
        element: el.querySelector<HTMLElement>('[data-cke-editable-content]'),
        content: canonical['content'],
        modelElement,
      };

      return acc;
    }, Object.create(null));

  const rootHook = window.Livewire
    .all()
    .find(({ name, canonical }) => name === 'ckeditor5' && canonical['editorId'] === editorId);

  /* v8 ignore next -- @preserve */
  if (!rootHook) {
    return acc;
  }

  // v8 ignore next -- @preserve
  const editorContent: Record<string, string> = (rootHook.canonical.content as Record<string, string>) ?? {};
  const rootEditorModelElement = (rootHook.canonical.modelElement || null) as string || null;
  const classicMainElement = document.querySelector<HTMLElement>(`#${editorId}_editor`);

  if ('main' in acc) {
    acc['main'].modelElement ??= rootEditorModelElement;
  }
  else if (classicMainElement) {
    acc['main'] = {
      element: classicMainElement,
      content: editorContent['main'] ?? '',
      modelElement: rootEditorModelElement,
    };
  }

  for (const [rootName, rootContent] of Object.entries(editorContent)) {
    if (acc[rootName]) {
      // Editable component is already present — fill content from editor level if the editable didn't provide its own.
      acc[rootName] = {
        ...acc[rootName],
        content: acc[rootName].content ?? rootContent,
        modelElement: acc[rootName].modelElement ?? rootEditorModelElement,
      };
    }
    else {
      // Root has server-provided content but its editable component hasn't been attached to the DOM yet.
      acc[rootName] = {
        element: null,
        content: rootContent,
        modelElement: rootEditorModelElement,
      };
    }
  }

  return acc;
}

/**
 * Type representing an editable item within an editor.
 * `element` is null when the root's DOM element hasn't appeared yet (pending root).
 */
export type EditableItem = {
  element: HTMLElement | null;
  content: string | null;
  modelElement: string | null;
};
