import type { LanguageConfig } from 'ckeditor5';

import { BalloonEditor, ClassicEditor, DecoupledEditor, Editor, InlineEditor, MultiRootEditor, Plugin } from 'ckeditor5';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createEditableHtmlElement,
  createEditableSnapshot,
  createEditorHtmlElement,
  createEditorPreset,
  createEditorSnapshot,
  DEFAULT_TEST_EDITOR_ID,
  getTestEditorInput,
  html,
  isEditorShown,
  LivewireStub,
  waitForTestEditor,
} from '~/test-utils';

import type { Snapshot as EditorSnapshot } from './editor';

import { timeout } from '../../shared/timeout';
import { registerLivewireComponentHook } from '../hook';
import { CustomEditorPluginsRegistry } from './custom-editor-plugins';
import { EditorComponentHook } from './editor';
import { EditorsRegistry } from './editors-registry';
import { unwrapEditorWatchdog } from './utils';

describe('editor component', () => {
  let livewireStub: LivewireStub;

  beforeEach(() => {
    document.body.innerHTML = '';
    livewireStub = window.Livewire = new LivewireStub();

    registerLivewireComponentHook('ckeditor5', EditorComponentHook);
  });

  afterEach(async () => {
    await livewireStub.$internal.destroy();
  });

  it('should save the editor instance in the registry with provided editorId', async () => {
    livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
      name: 'ckeditor5',
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

    livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
      name: 'ckeditor5',
      el: createEditorHtmlElement(),
      ephemeral: {
        ...createEditorSnapshot(),
        preset,
      },
    });

    const editor = await waitForTestEditor();

    expect(editor.plugins.get('MyCustomPlugin')).toBeInstanceOf(MyCustomPlugin);
  });

  describe('editor types', () => {
    describe('classic', () => {
      it('should create an classic editor with default preset', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          ephemeral: createEditorSnapshot(),
        });

        const editor = await waitForTestEditor();

        expect(editor).to.toBeInstanceOf(ClassicEditor);
        expect(isEditorShown()).toBe(true);
      });

      it('should assign default value from `content` snapshot property', async () => {
        const initialValue = `<p>Hello World! Today is ${new Date().toLocaleDateString()}</p>`;

        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
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

      it('should assign empty main value if initialized editor with empty `content` snapshot property', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          ephemeral: {
            ...createEditorSnapshot(),
            content: {},
          },
        });

        const editor = await waitForTestEditor();

        expect(editor.getData()).toBe('');
      });
    });

    describe('inline', () => {
      it('should create an inline editor with default preset', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          ephemeral: {
            ...createEditorSnapshot(),
            preset: createEditorPreset('inline'),
          },
        });

        const editor = await waitForTestEditor();

        expect(editor).to.toBeInstanceOf(InlineEditor);
        expect(isEditorShown()).toBe(true);
      });
    });

    describe('decoupled', () => {
      it('should create a decoupled editor with `main` editable and default preset', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          ephemeral: {
            ...createEditorSnapshot(),
            preset: createEditorPreset('decoupled'),
          },
        });

        livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-editable',
          el: createEditableHtmlElement(),
          ephemeral: createEditableSnapshot('main', null),
        });

        const editor = await waitForTestEditor();

        expect(editor).to.toBeInstanceOf(DecoupledEditor);
        expect(isEditorShown()).toBe(true);
      });

      it('should pick initial content from the editable snapshot if provided', async () => {
        const initialEditableContent = '<p>Initial editable content</p>';

        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          ephemeral: {
            ...createEditorSnapshot(),
            preset: createEditorPreset('decoupled'),
          },
        });

        livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-editable',
          el: createEditableHtmlElement(),
          ephemeral: createEditableSnapshot('main', initialEditableContent),
        });

        const editor = await waitForTestEditor();

        expect(editor).to.toBeInstanceOf(DecoupledEditor);
        expect(editor.getData()).toBe(initialEditableContent);
      });

      it('should throw error if `main` editable is not found in the DOM', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          ephemeral: {
            ...createEditorSnapshot(),
            preset: createEditorPreset('decoupled'),
          },
        });

        await expect(waitForTestEditor()).rejects.toThrowError(
          `No "main" editable found for editor with ID "test-editor".`,
        );
      });
    });

    describe('balloon', () => {
      it('should create a balloon editor with default preset', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          ephemeral: {
            ...createEditorSnapshot(),
            preset: createEditorPreset('balloon'),
          },
        });

        const editor = await waitForTestEditor();

        expect(editor).to.toBeInstanceOf(BalloonEditor);
        expect(isEditorShown()).toBe(true);
      });
    });

    describe('multiroot', () => {
      it('should create a multiroot editor without editables in the DOM and initial content', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          ephemeral: {
            ...createEditorSnapshot(),
            preset: createEditorPreset('multiroot'),
            content: {},
          },
        });

        const editor = await waitForTestEditor();

        expect(editor).toBeInstanceOf(MultiRootEditor);
      });

      it('should wait and for root elements to be present in DOM if they are not (with content=null value)', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          ephemeral: {
            ...createEditorSnapshot(),
            preset: createEditorPreset('multiroot'),
            content: {
              header: '<p>Header root initial content</p>',
            },
          },
        });

        await timeout(500); // Simulate some delay before adding the root.

        livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-editable',
          el: createEditableHtmlElement(),
          ephemeral: createEditableSnapshot('header'),
        });

        const editor = await waitForTestEditor();

        expect(editor).toBeInstanceOf(MultiRootEditor);
        expect(editor.getData({ rootName: 'header' })).toBe('<p>Header root initial content</p>');
      });

      it('should wait and for root elements to be present in DOM if they are not (with content=\'\' value)', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          ephemeral: {
            ...createEditorSnapshot(),
            preset: createEditorPreset('multiroot'),
            content: {
              header: '<p>Header root initial content</p>',
            },
          },
        });

        await timeout(500); // Simulate some delay before adding the root.

        livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-editable',
          el: createEditableHtmlElement(),
          ephemeral: createEditableSnapshot('header', ''),
        });

        const editor = await waitForTestEditor();

        expect(editor).toBeInstanceOf(MultiRootEditor);
        expect(editor.getData({ rootName: 'header' })).toBe('');
      });

      it('should wait and for root elements to be present in DOM if they are not (with set content value)', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          ephemeral: {
            ...createEditorSnapshot(),
            preset: createEditorPreset('multiroot'),
            content: {
              header: '<p>Header root initial content</p>',
            },
          },
        });

        await timeout(500); // Simulate some delay before adding the root.

        livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-editable',
          el: createEditableHtmlElement(),
          ephemeral: createEditableSnapshot('header', '<p>Editable content overrides snapshot content</p>'),
        });

        const editor = await waitForTestEditor();

        expect(editor).toBeInstanceOf(MultiRootEditor);
        expect(editor.getData({ rootName: 'header' })).toBe('<p>Editable content overrides snapshot content</p>');
      });
    });
  });

  describe('`editableHeight` snapshot parameter`', () => {
    it('should not set any height if `editableHeight` parameter is `null`', async () => {
      livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
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
      livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
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
      const { $wire } = livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
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
      livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
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
      livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
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
      livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
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

      livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
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
      livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
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
      livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
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
        const { $wire } = livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
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
        const { $wire } = livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
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
        const { $wire } = livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
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
        const { $wire } = livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
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

  describe('form integration', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should sync editor data to the associated input field', async () => {
      livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
        el: createEditorHtmlElement({
          withInput: true,
        }),
        ephemeral: {
          ...createEditorSnapshot(),
          saveDebounceMs: 0,
        },
      });

      const editor = await waitForTestEditor();
      const input = getTestEditorInput();

      editor.setData('<p>Form integration test</p>');
      await vi.advanceTimersByTimeAsync(1);

      expect(input.value).to.be.equal('<p>Form integration test</p>');
    });

    it('should not crash if hidden input is not present', async () => {
      livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
        el: createEditorHtmlElement({
          withInput: false,
        }),
        ephemeral: {
          ...createEditorSnapshot(),
          saveDebounceMs: 0,
        },
      });

      const editor = await waitForTestEditor();

      expect(() => {
        editor.setData('<p>Form integration test</p>');
        vi.advanceTimersByTime(1);
      }).not.to.throw();
    });

    it('should immediately sync editor data to the associated input field on form submit', async () => {
      document.body.appendChild(
        html.form({ id: 'form' }),
      );

      livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
        el: createEditorHtmlElement({
          withInput: true,
        }),
        ephemeral: {
          ...createEditorSnapshot(),
          saveDebounceMs: 5000,
        },
      }, '#form');

      const editor = await waitForTestEditor();
      const input = getTestEditorInput();

      editor.setData('<p>Form integration test</p>');
      await vi.advanceTimersByTimeAsync(1000);

      // Value should not be synced yet due to debounce.
      expect(input.value).to.be.equal('<p>Initial content</p>');

      // Submit the form.
      input.closest('form')!.dispatchEvent(new Event('submit', { bubbles: true }));
      await vi.advanceTimersByTimeAsync(1);

      // Value should be synced immediately on form submit.
      expect(input.value).to.be.equal('<p>Form integration test</p>');
    });
  });

  describe('destroy', () => {
    it('should destroy editor on component unmount', async () => {
      const component = livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
        el: createEditorHtmlElement(),
        ephemeral: createEditorSnapshot(),
      });

      const editor = await waitForTestEditor();

      livewireStub.$internal.unmountComponent(component.id);

      await vi.waitFor(() => {
        expect(editor.state).toBe('destroyed');
      });
    });
  });
});
