import type { Editor, EditorWatchdog } from 'ckeditor5';

const EDITOR_WATCHDOG_SYMBOL = Symbol.for('elixir-editor-watchdog');

/**
 * Wraps an Editor creator with a watchdog for automatic recovery.
 *
 * @param Editor - The Editor creator to wrap.
 * @returns The Editor creator wrapped with a watchdog.
 */
export async function wrapWithWatchdog(Editor: EditorCreator) {
  const { EditorWatchdog } = await import('ckeditor5');
  const watchdog = new EditorWatchdog(Editor);

  watchdog.setCreator(async (...args: Parameters<typeof Editor['create']>) => {
    const editor = await Editor.create(...args);

    (editor as any)[EDITOR_WATCHDOG_SYMBOL] = watchdog;

    return editor;
  });

  return {
    watchdog,
    Constructor: {
      create: async (...args: Parameters<typeof Editor['create']>) => {
        await watchdog.create(...args);

        return watchdog.editor!;
      },
    },
  };
}

/**
 * Unwraps the EditorWatchdog from the editor instance.
 */
export function unwrapEditorWatchdog(editor: Editor): EditorWatchdog | null {
  if (EDITOR_WATCHDOG_SYMBOL in editor) {
    return (editor as any)[EDITOR_WATCHDOG_SYMBOL] as EditorWatchdog;
  }

  return null;
}

/**
 * Type representing an Editor creator with a create method.
 */
export type EditorCreator = {
  create: (...args: any) => Promise<Editor>;
};
