import type { MultiRootEditor } from 'ckeditor5';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createEditableHtmlElement,
  createEditableSnapshot,
  createEditorHtmlElement,
  createEditorPreset,
  createEditorSnapshot,
  LivewireStub,
  queryEditableInput,
  waitForTestEditor,
} from '~/test-utils';

import type { Snapshot as EditorSnapshot } from './editor';

import { EditableComponentHook } from './editable';
import { EditorComponentHook } from './editor';
import { registerLivewireComponentHook } from './hook';

describe('editable component', () => {
  let livewireStub: LivewireStub;

  beforeEach(() => {
    document.body.innerHTML = '';
    livewireStub = window.Livewire = new LivewireStub();

    registerLivewireComponentHook('ckeditor5', EditorComponentHook);
    registerLivewireComponentHook('ckeditor5-editable', EditableComponentHook);
  });

  afterEach(async () => {
    await livewireStub.$internal.destroy();
  });

  describe('mounting editable', () => {
    it('should add editable root to the editor after mounting editor (empty editor)', async () => {
      appendMultirootEditor();

      const editor = await waitForTestEditor();

      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement(),
        ephemeral: createEditableSnapshot('foo', '<p>Initial foo component</p>'),
      });

      expect(editor.getData({ rootName: 'foo' })).toBe('<p>Initial foo component</p>');
    });

    it('should add editable root to the editor after mounting editor (non-empty editor, other editable defined before)', async () => {
      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement(),
        ephemeral: createEditableSnapshot('bar', '<p>Initial bar content</p>'),
      });

      appendMultirootEditor({
        bar: '<p>Initial bar content</p>',
      });

      const editor = await waitForTestEditor();

      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement(),
        ephemeral: createEditableSnapshot('foo', '<p>Initial foo content</p>'),
      });

      expect(editor.getData({ rootName: 'foo' })).toBe('<p>Initial foo content</p>');
      expect(editor.getData({ rootName: 'bar' })).toBe('<p>Initial bar content</p>');
    });

    it('should add editable root to the editor after mounting editor (non-empty editor, other editable defined after)', async () => {
      appendMultirootEditor({
        bar: '<p>Initial bar content</p>',
      });

      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement(),
        ephemeral: createEditableSnapshot('bar', '<p>Initial bar content</p>'),
      });

      const editor = await waitForTestEditor();

      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement(),
        ephemeral: createEditableSnapshot('foo', '<p>Initial foo content</p>'),
      });

      expect(editor.getData({ rootName: 'foo' })).toBe('<p>Initial foo content</p>');
      expect(editor.getData({ rootName: 'bar' })).toBe('<p>Initial bar content</p>');
    });

    it('should do nothing if adding existing root (without provided content)', async () => {
      appendMultirootEditor({
        main: '<p>Initial main content</p>',
      });

      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement(),
        ephemeral: createEditableSnapshot('main'),
      });

      const editor = await waitForTestEditor();

      expect(editor.getData({ rootName: 'main' })).toBe('<p>Initial main content</p>');

      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement(),
        ephemeral: createEditableSnapshot('main'),
      });

      expect(editor.getData({ rootName: 'main' })).toBe('<p>Initial main content</p>');
    });

    it('should update existing root content if added existing root with provided content', async () => {
      appendMultirootEditor({
        main: '<p>Initial main content</p>',
      });

      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement(),
        ephemeral: createEditableSnapshot('main'),
      });

      const editor = await waitForTestEditor();

      expect(editor.getData({ rootName: 'main' })).toBe('<p>Initial main content</p>');

      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement(),
        ephemeral: createEditableSnapshot('main', '<p>Updated main content</p>'),
      });

      expect(editor.getData({ rootName: 'main' })).toBe('<p>Updated main content</p>');
    });
  });

  describe('input value synchronization', () => {
    let editor: MultiRootEditor;

    beforeEach(async () => {
      appendMultirootEditor();
      editor = await waitForTestEditor();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should not crash if input is not present', () => {
      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement({
          withInput: false,
        }),
        ephemeral: createEditableSnapshot('foo', '<p>Initial foo component</p>'),
      });

      expect(editor.getData({ rootName: 'foo' })).toBe('<p>Initial foo component</p>');
    });

    it('should synchronize input value after mounting editable', async () => {
      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement({
          id: 'editable-foo',
        }),
        ephemeral: createEditableSnapshot('foo', '<p>Initial foo component</p>'),
      });

      const input = queryEditableInput('editable-foo')!;

      expect(input.value).toBe('<p>Initial foo component</p>');
    });

    it('should debounce input value synchronization', async () => {
      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement({
          id: 'editable-foo',
        }),
        ephemeral: {
          ...createEditableSnapshot('foo', '<p>Initial foo component</p>'),
          saveDebounceMs: 500,
        },
      });

      const input = queryEditableInput('editable-foo')!;

      expect(input.value).toBe('<p>Initial foo component</p>');

      editor.setData({
        foo: '<p>Modified foo content</p>',
      });

      vi.advanceTimersByTime(300);

      expect(input.value).toBe('<p>Initial foo component</p>');

      vi.advanceTimersByTime(300);

      expect(input.value).toBe('<p>Modified foo content</p>');
    });
  });

  describe('socket synchronization', () => {
    let editor: MultiRootEditor;

    beforeEach(async () => {
      appendMultirootEditor();
      editor = await waitForTestEditor();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should synchronize socket after mounting editable', async () => {
      const { $wire } = livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement(),
        ephemeral: createEditableSnapshot('foo', '<p>Initial foo component</p>'),
      });

      expect($wire.set).toHaveBeenCalledWith('content', '<p>Initial foo component</p>');
    });

    it('should debounce socket synchronization', async () => {
      const { $wire } = livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement(),
        ephemeral: {
          ...createEditableSnapshot('foo', '<p>Initial foo component</p>'),
          saveDebounceMs: 500,
        },
      });

      expect($wire.set).toHaveBeenCalledWith('content', '<p>Initial foo component</p>');

      editor.setData({
        foo: '<p>Modified foo content</p>',
      });

      vi.advanceTimersByTime(300);

      expect($wire.set).not.toHaveBeenCalledWith('content', '<p>Modified foo content</p>');

      vi.advanceTimersByTime(300);

      expect($wire.set).toHaveBeenCalledWith('content', '<p>Modified foo content</p>');
    });
  });

  function appendMultirootEditor(initialContent: Record<string, string> = {}) {
    livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
      name: 'ckeditor5',
      el: createEditorHtmlElement(),
      ephemeral: {
        ...createEditorSnapshot(),
        preset: createEditorPreset('multiroot'),
        content: initialContent,
      },
    });
  }
});
