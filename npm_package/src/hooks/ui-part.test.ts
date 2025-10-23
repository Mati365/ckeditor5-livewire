import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createEditorHtmlElement,
  createEditorPreset,
  createEditorSnapshot,
  createUIPartHtmlElement,
  createUIPartSnapshot,
  LivewireStub,
  waitForTestEditor,
} from '~/test-utils';

import type { Snapshot as EditorSnapshot } from './editor';

import { EditorComponentHook } from './editor';
import { registerLivewireComponentHook } from './hook';
import { UIPartComponentHook } from './ui-part';

describe('ui-part component', () => {
  let livewireStub: LivewireStub;

  beforeEach(() => {
    document.body.innerHTML = '';
    livewireStub = window.Livewire = new LivewireStub();

    registerLivewireComponentHook('ckeditor5', EditorComponentHook);
    registerLivewireComponentHook('ckeditor5-ui-part', UIPartComponentHook);
  });

  afterEach(async () => {
    await livewireStub.$internal.destroy();
  });

  describe('mounting ui part', () => {
    it('should mount toolbar to the editor after mounting editor', async () => {
      appendMultirootEditor();

      const editor = await waitForTestEditor();
      const toolbarElement = editor.ui.view.toolbar?.element;

      const { el } = livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-ui-part',
        el: createUIPartHtmlElement(),
        ephemeral: createUIPartSnapshot('toolbar'),
      });

      expect(toolbarElement).toBeTruthy();
      expect(el.contains(toolbarElement!)).toBe(true);
    });

    it('should mount menubar to the editor after mounting editor', async () => {
      appendMultirootEditor();

      const editor = await waitForTestEditor();
      const menubarElement = (editor.ui.view as any).menuBarView.element;

      const { el } = livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-ui-part',
        el: createUIPartHtmlElement(),
        ephemeral: createUIPartSnapshot('menubar'),
      });

      expect(el.children.length).toBeGreaterThan(0);
      expect(el.contains(menubarElement)).toBe(true);
    });

    it('should log error for unknown UI part name', async () => {
      appendMultirootEditor();
      await waitForTestEditor();

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-ui-part',
        el: createUIPartHtmlElement(),
        ephemeral: createUIPartSnapshot('unknown-part'),
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown UI part name: "unknown-part"'),
      );

      consoleErrorSpy.mockRestore();
    });

    it('should mount UI part before editor is created', async () => {
      const { el } = livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-ui-part',
        el: createUIPartHtmlElement(),
        ephemeral: createUIPartSnapshot('toolbar'),
      });

      appendMultirootEditor();

      const editor = await waitForTestEditor();
      const toolbarElement = editor.ui.view.toolbar?.element;

      expect(toolbarElement).toBeTruthy();
      expect(el.contains(toolbarElement!)).toBe(true);
    });
  });

  describe('destroying ui part', () => {
    beforeEach(async () => {
      appendMultirootEditor();
      await waitForTestEditor();
    });

    it('should clear UI part element on destruction', async () => {
      const { id, el } = livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-ui-part',
        el: createUIPartHtmlElement(),
        ephemeral: createUIPartSnapshot('toolbar'),
      });

      expect(el.children.length).toBeGreaterThan(0);

      await livewireStub.$internal.unmountComponent(id);

      expect(el.innerHTML).toBe('');
      expect(el.style.display).toBe('none');
    });

    it('should hide element during destruction', async () => {
      const { id, el } = livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-ui-part',
        el: createUIPartHtmlElement(),
        ephemeral: createUIPartSnapshot('toolbar'),
      });

      await livewireStub.$internal.unmountComponent(id);

      expect(el.style.display).toBe('none');
    });

    it('should handle destruction when mounted promise is not resolved yet', async () => {
      const { id, el } = livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-ui-part',
        el: createUIPartHtmlElement(),
        ephemeral: createUIPartSnapshot('toolbar'),
      });

      await livewireStub.$internal.unmountComponent(id);

      expect(el.innerHTML).toBe('');
      expect(el.style.display).toBe('none');
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
