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
        canonical: createEditableSnapshot('foo', '<p>Initial foo component</p>'),
      });

      expect(editor.getData({ rootName: 'foo' })).toBe('<p>Initial foo component</p>');
    });

    it('should add editable root to the editor after mounting editor (non-empty editor, other editable defined before)', async () => {
      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement(),
        canonical: createEditableSnapshot('bar', '<p>Initial bar content</p>'),
      });

      appendMultirootEditor({
        bar: '<p>Initial bar content</p>',
      });

      const editor = await waitForTestEditor();

      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement(),
        canonical: createEditableSnapshot('foo', '<p>Initial foo content</p>'),
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
        canonical: createEditableSnapshot('bar', '<p>Initial bar content</p>'),
      });

      const editor = await waitForTestEditor();

      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement(),
        canonical: createEditableSnapshot('foo', '<p>Initial foo content</p>'),
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
        canonical: createEditableSnapshot('main'),
      });

      const editor = await waitForTestEditor();

      expect(editor.getData({ rootName: 'main' })).toBe('<p>Initial main content</p>');

      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement(),
        canonical: createEditableSnapshot('main'),
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
        canonical: createEditableSnapshot('main'),
      });

      const editor = await waitForTestEditor();

      expect(editor.getData({ rootName: 'main' })).toBe('<p>Initial main content</p>');

      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement(),
        canonical: createEditableSnapshot('main', '<p>Updated main content</p>'),
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
        canonical: createEditableSnapshot('foo', '<p>Initial foo component</p>'),
      });

      expect(editor.getData({ rootName: 'foo' })).toBe('<p>Initial foo component</p>');
    });

    it('should synchronize input value after mounting editable', async () => {
      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement({
          id: 'editable-foo',
        }),
        canonical: createEditableSnapshot('foo', '<p>Initial foo component</p>'),
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
        canonical: {
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

  describe('livewire <> editor synchronization', () => {
    describe('`$wire.set` calls', () => {
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
          canonical: createEditableSnapshot('foo', '<p>Initial foo component</p>'),
        });

        expect($wire.set).toHaveBeenCalledWith('content', '<p>Initial foo component</p>');
      });

      it('should debounce socket synchronization', async () => {
        const { $wire } = livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-editable',
          el: createEditableHtmlElement(),
          canonical: {
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

    describe('sync editable content after commit', () => {
      it('should update editable content after commit if content changed in Livewire', async () => {
        const { id } = livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-editable',
          el: createEditableHtmlElement(),
          canonical: createEditableSnapshot('foo', '<p>Initial foo content</p>'),
        });

        appendMultirootEditor({
          foo: '<p>Initial foo content</p>',
        });

        const editor = await waitForTestEditor();

        await livewireStub.$internal.dispatchComponentCommit(id, {
          content: '<p>Updated foo content from Livewire</p>',
        });

        await vi.waitFor(() => {
          expect(editor.getData({ rootName: 'foo' })).toBe('<p>Updated foo content from Livewire</p>');
        });
      });

      it('should not update editable content after commit if content has not changed', async () => {
        const { id } = livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-editable',
          el: createEditableHtmlElement(),
          canonical: createEditableSnapshot('foo', '<p>Initial foo content</p>'),
        });

        appendMultirootEditor({
          foo: '<p>Initial foo content</p>',
        });

        const editor = await waitForTestEditor();

        await livewireStub.$internal.dispatchComponentCommit(id, {
          content: '<p>Initial foo content</p>',
        });

        expect(editor.getData({ rootName: 'foo' })).toBe('<p>Initial foo content</p>');
      });

      it('should handle null content in commit', async () => {
        const { id } = livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-editable',
          el: createEditableHtmlElement(),
          canonical: createEditableSnapshot('foo', '<p>Initial foo content</p>'),
        });

        appendMultirootEditor({
          foo: '<p>Initial foo content</p>',
        });

        const editor = await waitForTestEditor();

        await livewireStub.$internal.dispatchComponentCommit(id, {
          content: null,
        });

        await vi.waitFor(() => {
          expect(editor.getData({ rootName: 'foo' })).toBe('');
        });
      });

      it('should not crash if editor is not found during commit', async () => {
        appendMultirootEditor();
        await waitForTestEditor();

        const { id } = livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-editable',
          el: createEditableHtmlElement(),
          canonical: createEditableSnapshot('foo', '<p>Initial foo content</p>'),
        });

        // Immediately destroy to simulate editor being unavailable
        await livewireStub.$internal.unmountComponent(id);

        // Now try to commit - should not crash
        await expect(
          livewireStub.$internal.dispatchComponentCommit(id, {
            content: '<p>Updated content</p>',
          }),
        ).resolves.not.toThrow();
      });

      it('should sync multiple editables independently after commit', async () => {
        const { id: fooId } = livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-editable',
          el: createEditableHtmlElement(),
          canonical: createEditableSnapshot('foo', '<p>Initial foo content</p>'),
        });

        const { id: barId } = livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-editable',
          el: createEditableHtmlElement(),
          canonical: createEditableSnapshot('bar', '<p>Initial bar content</p>'),
        });

        appendMultirootEditor({
          foo: '<p>Initial foo content</p>',
          bar: '<p>Initial bar content</p>',
        });

        const editor = await waitForTestEditor();

        // Update only foo
        await livewireStub.$internal.dispatchComponentCommit(fooId, {
          content: '<p>Updated foo content</p>',
        });

        await vi.waitFor(() => {
          expect(editor.getData({ rootName: 'foo' })).toBe('<p>Updated foo content</p>');
        });

        // bar should remain unchanged
        expect(editor.getData({ rootName: 'bar' })).toBe('<p>Initial bar content</p>');

        // Update only bar
        await livewireStub.$internal.dispatchComponentCommit(barId, {
          content: '<p>Updated bar content</p>',
        });

        await vi.waitFor(() => {
          expect(editor.getData({ rootName: 'bar' })).toBe('<p>Updated bar content</p>');
        });

        // foo should remain with previous update
        expect(editor.getData({ rootName: 'foo' })).toBe('<p>Updated foo content</p>');
      });
    });
  });

  describe('destroy', () => {
    it('should detach editable root from editor on component unmount', async () => {
      appendMultirootEditor();
      const editor = await waitForTestEditor();

      const { id } = livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement(),
        canonical: createEditableSnapshot('foo', '<p>Initial foo content</p>'),
      });

      const rootBefore = editor.model.document.getRoot('foo');
      expect(rootBefore).toBeDefined();
      expect((rootBefore as any)._isAttached).toBe(true);

      await livewireStub.$internal.unmountComponent(id);

      const rootAfter = editor.model.document.getRoot('foo');
      expect(rootAfter).toBeDefined();
      expect((rootAfter as any)._isAttached).toBe(false);
    });

    it('should hide element during destruction', async () => {
      appendMultirootEditor();
      await waitForTestEditor();

      const { id, el } = livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement(),
        canonical: createEditableSnapshot('foo', '<p>Initial foo content</p>'),
      });

      expect(el.style.display).not.toBe('none');

      await livewireStub.$internal.unmountComponent(id);

      expect(el.style.display).toBe('none');
    });

    it('should not crash if editor was destroyed before editable', async () => {
      appendMultirootEditor();

      const editor = await waitForTestEditor();

      const { id } = livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement(),
        canonical: createEditableSnapshot('foo', '<p>Initial foo content</p>'),
      });

      await editor.destroy();
      await expect(
        livewireStub.$internal.unmountComponent(id),
      ).resolves.not.toThrow();
    });

    it('should handle unmounting multiple editables', async () => {
      appendMultirootEditor();
      const editor = await waitForTestEditor();

      const { id: fooId } = livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement(),
        canonical: createEditableSnapshot('foo', '<p>Foo content</p>'),
      });

      const { id: barId } = livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-editable',
        el: createEditableHtmlElement(),
        canonical: createEditableSnapshot('bar', '<p>Bar content</p>'),
      });

      const fooRootBefore = editor.model.document.getRoot('foo');
      const barRootBefore = editor.model.document.getRoot('bar');

      expect(fooRootBefore).toBeDefined();
      expect((fooRootBefore as any)._isAttached).toBe(true);

      expect(barRootBefore).toBeDefined();
      expect((barRootBefore as any)._isAttached).toBe(true);

      await livewireStub.$internal.unmountComponent(fooId);

      const fooRootAfter = editor.model.document.getRoot('foo');
      const barRootAfter = editor.model.document.getRoot('bar');

      expect(fooRootAfter).toBeDefined();
      expect((fooRootAfter as any)._isAttached).toBe(false);

      expect(barRootAfter).toBeDefined();
      expect((barRootAfter as any)._isAttached).toBe(true);

      await livewireStub.$internal.unmountComponent(barId);

      const barRootFinal = editor.model.document.getRoot('bar');

      expect(barRootFinal).toBeDefined();
      expect((barRootFinal as any)._isAttached).toBe(false);
    });
  });

  function appendMultirootEditor(initialContent: Record<string, string> = {}) {
    livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
      name: 'ckeditor5',
      el: createEditorHtmlElement(),
      canonical: {
        ...createEditorSnapshot(),
        preset: createEditorPreset('multiroot'),
        content: initialContent,
      },
    });
  }
});
