import type { LanguageConfig } from 'ckeditor5';

import {
  BalloonEditor,
  ClassicEditor,
  DecoupledEditor,
  Editor,
  InlineEditor,
  MultiRootEditor,
  Plugin,
} from 'ckeditor5';
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
    CustomEditorPluginsRegistry.the.unregisterAll();
    await livewireStub.$internal.destroy();
  });

  it('should save the editor instance in the registry with provided editorId', async () => {
    livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
      name: 'ckeditor5',
      el: createEditorHtmlElement(),
      canonical: createEditorSnapshot(),
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
      canonical: {
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
          canonical: createEditorSnapshot(),
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
          canonical: {
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
          canonical: {
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
          canonical: {
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
          canonical: {
            ...createEditorSnapshot(),
            preset: createEditorPreset('decoupled'),
          },
        });

        livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-editable',
          el: createEditableHtmlElement(),
          canonical: createEditableSnapshot('main', null),
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
          canonical: {
            ...createEditorSnapshot(),
            preset: createEditorPreset('decoupled'),
          },
        });

        livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-editable',
          el: createEditableHtmlElement(),
          canonical: createEditableSnapshot('main', initialEditableContent),
        });

        const editor = await waitForTestEditor();

        expect(editor).to.toBeInstanceOf(DecoupledEditor);
        expect(editor.getData()).toBe(initialEditableContent);
      });

      it('should throw error if `main` editable is not found in the DOM', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          canonical: {
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
          canonical: {
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
          canonical: {
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
          canonical: {
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
          canonical: createEditableSnapshot('header'),
        });

        const editor = await waitForTestEditor();

        expect(editor).toBeInstanceOf(MultiRootEditor);
        expect(editor.getData({ rootName: 'header' })).toBe('<p>Header root initial content</p>');
      });

      it('should wait and for root elements to be present in DOM if they are not (with content=\'\' value)', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          canonical: {
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
          canonical: createEditableSnapshot('header', ''),
        });

        const editor = await waitForTestEditor();

        expect(editor).toBeInstanceOf(MultiRootEditor);
        expect(editor.getData({ rootName: 'header' })).toBe('');
      });

      it('should wait and for root elements to be present in DOM if they are not (with set content value)', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          canonical: {
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
          canonical: createEditableSnapshot('header', '<p>Editable content overrides snapshot content</p>'),
        });

        const editor = await waitForTestEditor();

        expect(editor).toBeInstanceOf(MultiRootEditor);
        expect(editor.getData({ rootName: 'header' })).toBe('<p>Editable content overrides snapshot content</p>');
      });

      it('should not crash after setting content using `setData`', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          canonical: {
            ...createEditorSnapshot(),
            content: {
              main: '<p>Initial content</p>',
            },
          },
        });

        const editor = await waitForTestEditor();

        expect(() => {
          editor.setData('<p>New content</p>');
        }).not.toThrow();
      });
    });
  });

  describe('`editableHeight` snapshot parameter`', () => {
    it('should not set any height if `editableHeight` parameter is `null`', async () => {
      livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
        el: createEditorHtmlElement(),
        canonical: {
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
        canonical: {
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
        canonical: {
          ...createEditorSnapshot(),
          saveDebounceMs: 400,
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
        canonical: {
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
        canonical: {
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
        canonical: {
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
        canonical: {
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
        canonical: {
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
        canonical: {
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

  describe('livewire <> editor synchronization', () => {
    describe('`$wire.set` calls on editor snapshot', () => {
      it('should set `focused` state on focus change', async () => {
        const { $wire } = livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          canonical: createEditorSnapshot(),
        });

        const { ui: { focusTracker } } = await waitForTestEditor();

        // Focus the editor.
        $wire.set.mockClear();
        focusTracker.isFocused = true;

        expect($wire.set).toHaveBeenCalledWith('focused', true);

        // Blur the editor.
        $wire.set.mockClear();
        focusTracker.isFocused = false;

        expect($wire.set).toHaveBeenCalledWith('focused', false);
      });

      it('should set `content` state on change', async () => {
        vi.useFakeTimers();

        const { $wire } = livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          canonical: {
            ...createEditorSnapshot(),
            saveDebounceMs: 0,
          },
        });

        const editor = await waitForTestEditor();

        $wire.set.mockClear();
        editor.setData('<p>New content</p>');

        await vi.advanceTimersByTimeAsync(1);

        expect($wire.set).toHaveBeenCalledWith('content', { main: '<p>New content</p>' });
        vi.useRealTimers();
      });

      it('should sync `content` if changed at the same time as focus change', async () => {
        vi.useFakeTimers();

        const { $wire } = livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          canonical: {
            ...createEditorSnapshot(),
            saveDebounceMs: 0,
          },
        });

        const editor = await waitForTestEditor();
        const { ui: { focusTracker } } = editor;

        $wire.set.mockClear();
        editor.setData('<p>Updated content</p>');
        focusTracker.isFocused = true;

        await vi.advanceTimersByTimeAsync(1);

        expect($wire.set).toHaveBeenCalledWith('content', { main: '<p>Updated content</p>' });
        expect($wire.set).toHaveBeenCalledWith('focused', true);

        vi.useRealTimers();
      });
    });

    describe('dispatch / receive events', () => {
      it('should dispatch `editor-content-changed` event on content change', async () => {
        vi.useFakeTimers();

        const { $wire } = livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          canonical: {
            ...createEditorSnapshot(),
            saveDebounceMs: 0,
          },
        });

        const editor = await waitForTestEditor();

        $wire.dispatch.mockClear();
        editor.setData('<p>Content change event test</p>');

        await vi.advanceTimersByTimeAsync(1);

        expect($wire.dispatch).toHaveBeenCalledExactlyOnceWith('editor-content-changed', {
          editorId: DEFAULT_TEST_EDITOR_ID,
          content: { main: '<p>Content change event test</p>' },
        });

        vi.useRealTimers();
      });

      it('should receive `set-editor-content` event and update editor content', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          canonical: createEditorSnapshot(),
        });

        const editor = await waitForTestEditor();

        livewireStub.dispatch('set-editor-content', {
          editorId: DEFAULT_TEST_EDITOR_ID,
          content: {
            main: '<p>New content from event</p>',
          },
        });

        expect(editor.getData()).toBe('<p>New content from event</p>');
      });

      it('should not set editor content on `set-editor-content` event if content is the same', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          canonical: {
            ...createEditorSnapshot(),
            content: {
              main: '<p>Initial content</p>',
            },
          },
        });

        const editor = await waitForTestEditor();
        const setDataSpy = vi.spyOn(editor, 'setData');

        livewireStub.dispatch('set-editor-content', {
          editorId: DEFAULT_TEST_EDITOR_ID,
          content: {
            main: '<p>Initial content</p>',
          },
        });

        expect(setDataSpy).not.toHaveBeenCalled();
      });

      it('should not set editor content on `set-editor-content` event if editor is not found', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          canonical: createEditorSnapshot(),
        });

        const editor = await waitForTestEditor();

        livewireStub.dispatch('set-editor-content', {
          editorId: 'non-existing-editor-id',
          content: {
            main: '<p>New content from event</p>',
          },
        });

        expect(editor.getData()).toBe('<p>Initial content</p>');
      });
    });

    describe('sync editor content after commit', () => {
      it('should update editor content after `afterCommitSynced` event if content changed in Livewire (`wire:model` is present)', async () => {
        const { id } = livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement({
            wireModel: 'content',
          }),
          canonical: {
            ...createEditorSnapshot(),
            content: {
              main: '<p>Initial content</p>',
            },
          },
        });

        const editor = await waitForTestEditor();

        await livewireStub.$internal.dispatchComponentCommit<EditorSnapshot>(id, {
          content: {
            main: '<p>Updated content from Livewire</p>',
          },
        });

        await vi.waitFor(async () => {
          expect(editor.getData()).toBe('<p>Updated content from Livewire</p>');
        });
      });

      it('should not update editor content after `afterCommitSynced` event if content changed in Livewire (`wire:model` is not present)', async () => {
        const { id } = livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          canonical: {
            ...createEditorSnapshot(),
            content: {
              main: '<p>Initial content</p>',
            },
          },
        });

        const editor = await waitForTestEditor();

        await livewireStub.$internal.dispatchComponentCommit<EditorSnapshot>(id, {
          content: {
            main: '<p>Updated content</p>',
          },
        });

        expect(editor.getData()).toBe('<p>Initial content</p>');
      });

      it('should ignore dispatched `afterCommitSynced` if editor is not found', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          canonical: {
            ...createEditorSnapshot(),
            content: {
              main: '<p>Initial content</p>',
            },
          },
        });

        const editor = await waitForTestEditor();

        await livewireStub.$internal.dispatchComponentCommit<EditorSnapshot>('non-existing-editor-id', {
          content: {
            main: '<p>Updated content</p>',
          },
        });

        expect(editor.getData()).toBe('<p>Initial content</p>');
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
        canonical: {
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
        canonical: {
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
        canonical: {
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
        canonical: createEditorSnapshot(),
      });

      const editor = await waitForTestEditor();

      livewireStub.$internal.unmountComponent(component.id);

      await vi.waitFor(() => {
        expect(editor.state).toBe('destroyed');
      });
    });
  });
});
