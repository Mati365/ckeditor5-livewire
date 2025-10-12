import { ClassicEditor, EditorWatchdog } from 'ckeditor5';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { unwrapEditorWatchdog, wrapWithWatchdog } from './wrap-with-watchdog';

describe('wrap with watchdog', () => {
  let element: HTMLElement;

  beforeEach(async () => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('returns editor instance after calling Constructor.create', async () => {
    const { Constructor } = await wrapWithWatchdog(ClassicEditor);
    const editor = await Constructor.create(element, {
      licenseKey: 'GPL',
    });

    expect(editor).toBeInstanceOf(ClassicEditor);

    await editor.destroy();
  });

  it('returns instance of watchdog', async () => {
    const { watchdog } = await wrapWithWatchdog(ClassicEditor);

    expect(watchdog).toBeInstanceOf(EditorWatchdog);
  });

  it('should be possible to unwrap watchdog from editor instance', async () => {
    const { Constructor } = await wrapWithWatchdog(ClassicEditor);
    const editor = await Constructor.create(element, {
      licenseKey: 'GPL',
    });

    expect(unwrapEditorWatchdog(editor)).toBeInstanceOf(EditorWatchdog);

    await editor.destroy();
  });
});
