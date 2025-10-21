import type { LanguageConfig } from 'ckeditor5';

import { ClassicEditor, Editor, Plugin } from 'ckeditor5';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createEditorHtmlElement,
  createEditorPreset,
  createEditorSnapshot,
  DEFAULT_TEST_EDITOR_ID,
  getTestEditorInput,
  isEditorShown,
  LivewireStub,
  waitForTestEditor,
} from '~/test-utils';

import type { Snapshot } from './editor';

import { registerLivewireComponentHook } from '../hook';
import { CustomEditorPluginsRegistry } from './custom-editor-plugins';
import { EditorComponentHook } from './editor';
import { EditorsRegistry } from './editors-registry';
import { unwrapEditorWatchdog } from './utils';

const COMPONENT_NAME = 'ckeditor5';

describe('editor component', () => {
  let livewireStub: LivewireStub;

  beforeEach(() => {
    document.body.innerHTML = '';
    livewireStub = window.Livewire = new LivewireStub();

    registerLivewireComponentHook(COMPONENT_NAME, EditorComponentHook);
  });

  afterEach(() => {
    livewireStub.$internal.destroy();
  });

  it('should save the editor instance in the registry with provided editorId', async () => {
    livewireStub.$internal.appendComponentToDOM<Snapshot>({
      name: COMPONENT_NAME,
      el: createEditorHtmlElement(),
      ephemeral: createEditorSnapshot(),
    });

    const editor = await EditorsRegistry.the.waitFor(DEFAULT_TEST_EDITOR_ID);

    expect(editor).toBeInstanceOf(Editor);
  });

  it('should be possible to pass custom plugins to the editor', async () => {
    class MyCustomPlugin extends Plugin {
      static pluginName = 'MyCustomPlugin';
    }

    const preset = createEditorPreset('classic', {
      toolbar: [],
      plugins: ['MyCustomPlugin'],
    });

    CustomEditorPluginsRegistry.the.register('MyCustomPlugin', () => MyCustomPlugin);

    livewireStub.$internal.appendComponentToDOM<Snapshot>({
      name: COMPONENT_NAME,
      el: createEditorHtmlElement(),
      ephemeral: {
        ...createEditorSnapshot(),
        preset,
      },
    });

    const editor = await waitForTestEditor();

    expect(editor.plugins.get('MyCustomPlugin')).toBeInstanceOf(MyCustomPlugin);
  });

  describe('classic editor', () => {
    it('should create an classic editor with default preset', async () => {
      livewireStub.$internal.appendComponentToDOM<Snapshot>({
        name: COMPONENT_NAME,
        el: createEditorHtmlElement(),
        ephemeral: createEditorSnapshot(),
      });

      const editor = await waitForTestEditor();

      expect(editor).to.toBeInstanceOf(ClassicEditor);
      expect(isEditorShown()).toBe(true);
    });

    it('should assign default value from `content` snapshot property', async () => {
      const initialValue = `<p>Hello World! Today is ${new Date().toLocaleDateString()}</p>`;

      livewireStub.$internal.appendComponentToDOM<Snapshot>({
        name: COMPONENT_NAME,
        el: createEditorHtmlElement(),
        ephemeral: {
          ...createEditorSnapshot(),
          content: {
            main: initialValue,
          },
        },
      });

      const editor = await waitForTestEditor();

      expect(editor.getData()).toBe(initialValue);
    });
  });

  describe('`editableHeight` snapshot parameter`', () => {
    it('should not set any height if `editableHeight` parameter is `null`', async () => {
      livewireStub.$internal.appendComponentToDOM<Snapshot>({
        name: COMPONENT_NAME,
        el: createEditorHtmlElement(),
        ephemeral: {
          ...createEditorSnapshot(),
          editableHeight: null,
        },
      });

      const editor = await waitForTestEditor();
      const editableElement = editor.ui.getEditableElement()!;

      expect(getComputedStyle(editableElement).height).toBe('');
    });

    it('should set the editable height if `editableHeight` snapshot parameter is provided', async () => {
      livewireStub.$internal.appendComponentToDOM<Snapshot>({
        name: COMPONENT_NAME,
        el: createEditorHtmlElement(),
        ephemeral: {
          ...createEditorSnapshot(),
          editableHeight: 400,
        },
      });

      const editor = await waitForTestEditor();
      const editableElement = editor.ui.getEditableElement()!;

      expect(getComputedStyle(editableElement).height).toBe('400px');
    });
  });

  describe('`saveDebounceMs` snapshot parameter`', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should parameter to debounce `$wire.set` when `emit.change` is true', async () => {
      const { $wire } = livewireStub.$internal.appendComponentToDOM<Snapshot>({
        name: COMPONENT_NAME,
        el: createEditorHtmlElement(),
        ephemeral: {
          ...createEditorSnapshot(),
          saveDebounceMs: 400,
          emit: {
            change: true,
            focus: false,
          },
        },
      });

      const editor = await waitForTestEditor();

      $wire.set.mockClear();
      editor.setData('<p>Debounce test</p>');

      await vi.advanceTimersByTimeAsync(399);
      expect($wire.set).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      expect($wire.set).toHaveBeenCalledExactlyOnceWith('content', { main: '<p>Debounce test</p>' });
    });

    it('should use parameter to debounce input sync', async () => {
      livewireStub.$internal.appendComponentToDOM<Snapshot>({
        name: COMPONENT_NAME,
        el: createEditorHtmlElement({
          withInput: true,
        }),
        ephemeral: {
          ...createEditorSnapshot(),
          saveDebounceMs: 400,
        },
      });

      const editor = await waitForTestEditor();
      const input = getTestEditorInput();

      editor.setData('<p>Debounce test</p>');
      expect(input.value).to.be.equal('<p>Initial content</p>');

      await vi.advanceTimersByTimeAsync(399);
      expect(input.value).to.be.equal('<p>Initial content</p>');

      await vi.advanceTimersByTimeAsync(1);
      expect(input.value).to.be.equal('<p>Debounce test</p>');
    });
  });

  describe('`language` snapshot parameter`', () => {
    it('should be possible to pass language configuration to the editor configuration', async () => {
      livewireStub.$internal.appendComponentToDOM<Snapshot>({
        name: COMPONENT_NAME,
        el: createEditorHtmlElement(),
        ephemeral: {
          ...createEditorSnapshot(),
          language: {
            ui: 'pl',
            content: 'de',
          },
        },
      });

      const editor = await waitForTestEditor();
      const configLanguage = editor.config.get('language') as LanguageConfig;

      expect(configLanguage.ui).toBe('pl');
      expect(configLanguage.content).toBe('de');
    });

    it('should have buttons translated to the selected UI language', async () => {
      livewireStub.$internal.appendComponentToDOM<Snapshot>({
        name: COMPONENT_NAME,
        el: createEditorHtmlElement(),
        ephemeral: {
          ...createEditorSnapshot(),
          language: {
            ui: 'pl',
            content: 'pl',
          },
        },
      });

      const editor = await waitForTestEditor();

      expect(editor.t('Bold')).toBe('Pogrubienie');
    });

    it('should be possible to pass custom translations to the editor', async () => {
      const preset = createEditorPreset('classic', {}, {
        pl: {
          Bold: 'Czcionka grubaśna',
        },
      });

      livewireStub.$internal.appendComponentToDOM<Snapshot>({
        name: COMPONENT_NAME,
        el: createEditorHtmlElement(),
        ephemeral: {
          ...createEditorSnapshot(),
          preset,
          language: {
            ui: 'pl',
            content: 'pl',
          },
        },
      });

      const editor = await waitForTestEditor();

      expect(editor.t('Bold')).toBe('Czcionka grubaśna');
    });
  });

  describe('`watchdog` snapshot parameter`', () => {
    it('should not wrap editor with watchdog if `watchdog` is false', async () => {
      livewireStub.$internal.appendComponentToDOM<Snapshot>({
        name: COMPONENT_NAME,
        el: createEditorHtmlElement(),
        ephemeral: {
          ...createEditorSnapshot(),
          watchdog: false,
        },
      });

      const editor = await waitForTestEditor();
      const watchdog = unwrapEditorWatchdog(editor);

      expect(watchdog).toBeNull();
    });

    it('should resurrect editor after crashing and broadcast the new instance when `watchdog` is enabled', async () => {
      livewireStub.$internal.appendComponentToDOM<Snapshot>({
        name: COMPONENT_NAME,
        el: createEditorHtmlElement({
          id: 'editor-with-watchdog',
        }),
        ephemeral: {
          ...createEditorSnapshot(),
          editorId: 'editor-with-watchdog',
          watchdog: true,
        },
      });

      const originalEditor = await waitForTestEditor('editor-with-watchdog');
      const watchdog = unwrapEditorWatchdog(originalEditor)!;

      (watchdog as any)._restart();

      await vi.waitFor(async () => {
        const newEditor = await waitForTestEditor('editor-with-watchdog');

        expect(newEditor).not.equals(originalEditor);
      });
    });
  });

  describe('socket sync', () => {
    describe('`emit.focus` snapshot parameter`', () => {
      it('should sync editor content on focus change if `emit.focus` is true', async () => {
        const { $wire } = livewireStub.$internal.appendComponentToDOM<Snapshot>({
          name: COMPONENT_NAME,
          el: createEditorHtmlElement(),
          ephemeral: {
            ...createEditorSnapshot(),
            emit: {
              change: false,
              focus: true,
            },
          },
        });

        const { ui: { focusTracker } } = await waitForTestEditor();

        // Focus the editor.
        $wire.set.mockClear();
        focusTracker.isFocused = true;

        expect($wire.set).toHaveBeenCalledWith('focused', true);
        expect($wire.set).toHaveBeenCalledWith('content', { main: '<p>Initial content</p>' });

        // Blur the editor.
        $wire.set.mockClear();
        focusTracker.isFocused = false;

        expect($wire.set).toHaveBeenCalledWith('focused', false);
        expect($wire.set).toHaveBeenCalledWith('content', { main: '<p>Initial content</p>' });
      });

      it('should not sync editor content on focus change if `emit.focus` is false', async () => {
        const { $wire } = livewireStub.$internal.appendComponentToDOM<Snapshot>({
          name: COMPONENT_NAME,
          el: createEditorHtmlElement(),
          ephemeral: {
            ...createEditorSnapshot(),
            emit: {
              change: false,
              focus: false,
            },
          },
        });

        const { ui: { focusTracker } } = await waitForTestEditor();

        // Focus the editor.
        $wire.set.mockClear();
        focusTracker.isFocused = true;

        expect($wire.set).not.toHaveBeenCalled();

        // Blur the editor.
        $wire.set.mockClear();
        focusTracker.isFocused = false;

        expect($wire.set).not.toHaveBeenCalled();
      });
    });

    describe('`emit.change` snapshot parameter`', () => {
      beforeEach(() => {
        vi.useFakeTimers();
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('should sync editor content on change if `emit.change` is true', async () => {
        const { $wire } = livewireStub.$internal.appendComponentToDOM<Snapshot>({
          name: COMPONENT_NAME,
          el: createEditorHtmlElement(),
          ephemeral: {
            ...createEditorSnapshot(),
            saveDebounceMs: 0,
            emit: {
              change: true,
              focus: false,
            },
          },
        });

        const editor = await waitForTestEditor();

        $wire.set.mockClear();
        editor.setData('<p>New content</p>');

        await vi.advanceTimersByTimeAsync(1);

        expect($wire.set).toHaveBeenCalledWith('content', { main: '<p>New content</p>' });
      });

      it('should not sync editor content on change if `emit.change` is false', async () => {
        const { $wire } = livewireStub.$internal.appendComponentToDOM<Snapshot>({
          name: COMPONENT_NAME,
          el: createEditorHtmlElement(),
          ephemeral: {
            ...createEditorSnapshot(),
            saveDebounceMs: 0,
            emit: {
              change: false,
              focus: false,
            },
          },
        });

        const editor = await waitForTestEditor();

        $wire.set.mockClear();
        editor.setData('<p>New content</p>');

        await vi.advanceTimersByTimeAsync(1);

        expect($wire.set).not.toHaveBeenCalled();
      });
    });
  });
});
