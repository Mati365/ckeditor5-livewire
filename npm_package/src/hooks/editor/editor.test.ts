import type { LanguageConfig } from 'ckeditor5';

import {
  BalloonEditor,
  CKEditorError,
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
import { EditableComponentHook } from '../editable';
import { registerLivewireComponentHook } from '../hook';
import { CustomEditorPluginsRegistry } from './custom-editor-plugins';
import { EditorComponentHook } from './editor';
import { EditorsRegistry } from './editors-registry';

describe('editor component', () => {
  let livewireStub: LivewireStub;

  beforeEach(() => {
    document.body.innerHTML = '';
    livewireStub = window.Livewire = new LivewireStub();

    registerLivewireComponentHook('ckeditor5', EditorComponentHook);
    registerLivewireComponentHook('ckeditor5-editable', EditableComponentHook);
  });

  afterEach(async () => {
    CustomEditorPluginsRegistry.the.unregisterAll();
    await livewireStub.$internal.destroy();
    vi.restoreAllMocks();
  });

  /**
   * Mounts the editor component with the given editor ID and optional snapshot overrides.
   */
  function appendEditor(editorId: string, snapshot: Partial<EditorSnapshot> = {}) {
    return livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
      name: 'ckeditor5',
      el: createEditorHtmlElement({ id: editorId }),
      canonical: {
        ...createEditorSnapshot(),
        editorId,
        ...snapshot,
      },
    });
  }

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

      it('should be possible to specify root element name', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          canonical: createEditorSnapshot({
            modelElement: '$inlineRoot',
          }),
        });

        const editor = await waitForTestEditor();

        expect(editor.model.document.getRoot()?.name).toBe('$inlineRoot');
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
          el: createEditorHtmlElement({ editorType: 'decoupled' }),
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
          el: createEditorHtmlElement({ editorType: 'decoupled' }),
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

      it('should pick initial content from root editor element if editable has null content', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement({ editorType: 'decoupled' }),
          canonical: {
            ...createEditorSnapshot(),
            preset: createEditorPreset('decoupled'),
          },
        });

        livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-editable',
          el: createEditableHtmlElement(),
          canonical: createEditableSnapshot('main'),
        });

        const editor = await waitForTestEditor();

        expect(editor).to.toBeInstanceOf(DecoupledEditor);
        expect(editor.getData()).toBe('<p>Initial content</p>');
      });

      it('should throw error if `main` editable is not found in the DOM', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement({ editorType: 'decoupled' }),
          canonical: {
            ...createEditorSnapshot(),
            preset: createEditorPreset('decoupled'),
          },
        });

        await expect(waitForTestEditor()).rejects.toThrow(
          /It looks like not all required root elements are present yet/,
        );
      });

      it('should be possible to specify root element name using editable config alone', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement({ editorType: 'decoupled' }),
          canonical: {
            ...createEditorSnapshot(),
            preset: createEditorPreset('decoupled'),
          },
        });

        livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-editable',
          el: createEditableHtmlElement(),
          canonical: {
            ...createEditableSnapshot('main'),
            modelElement: '$inlineRoot',
          },
        });

        const editor = await waitForTestEditor<DecoupledEditor>();

        await vi.waitFor(() => {
          expect(editor.model.document.getRoot()?.name).toEqual('$inlineRoot');
        });
      });

      it('should use editable root element name config if both specified', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement({ editorType: 'decoupled' }),
          canonical: createEditorSnapshot({
            preset: createEditorPreset('decoupled'),
            modelElement: '$miaMia',
          }),
        });

        livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-editable',
          el: createEditableHtmlElement(),
          canonical: {
            ...createEditableSnapshot('main'),
            modelElement: '$inlineRoot',
          },
        });

        const editor = await waitForTestEditor<DecoupledEditor>();

        await vi.waitFor(() => {
          expect(editor.model.document.getRoot()?.name).toEqual('$inlineRoot');
        });
      });

      it('should use root editor element if editable root name is not specified', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement({ editorType: 'decoupled' }),
          canonical: createEditorSnapshot({
            preset: createEditorPreset('decoupled'),
            modelElement: '$inlineRoot',
            content: {},
          }),
        });

        livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-editable',
          el: createEditableHtmlElement(),
          canonical: createEditableSnapshot('main'),
        });

        const editor = await waitForTestEditor<DecoupledEditor>();

        await vi.waitFor(() => {
          expect(editor.model.document.getRoot()?.name).toEqual('$inlineRoot');
        });
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
          el: createEditorHtmlElement({ editorType: 'multiroot' }),
          canonical: {
            ...createEditorSnapshot(),
            preset: createEditorPreset('multiroot'),
            content: {},
          },
        });

        const editor = await waitForTestEditor();

        expect(editor).toBeInstanceOf(MultiRootEditor);
      });

      it('should create a multiroot editor with lazy added inline editables', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement({ editorType: 'multiroot' }),
          canonical: {
            ...createEditorSnapshot(),
            preset: createEditorPreset('multiroot'),
            content: {},
          },
        });

        const editor = await waitForTestEditor();

        await timeout(500); // Simulate some delay before adding the root.

        livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-editable',
          el: createEditableHtmlElement(),
          canonical: {
            ...createEditableSnapshot('header', 'Head'),
            modelElement: '$inlineRoot',
          },
        });

        livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-editable',
          el: createEditableHtmlElement(),
          canonical: {
            ...createEditableSnapshot('footer', 'Footer'),
            modelElement: '$inlineRoot',
          },
        });

        expect(editor.model.document.getRoot('header')?.name).toEqual('$inlineRoot');
        expect(editor.model.document.getRoot('footer')?.name).toEqual('$inlineRoot');
      });

      it('should create a multiroot editor with initially added inline editables', async () => {
        livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-editable',
          el: createEditableHtmlElement(),
          canonical: {
            ...createEditableSnapshot('header', 'Head'),
            modelElement: '$inlineRoot',
          },
        });

        livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-editable',
          el: createEditableHtmlElement(),
          canonical: {
            ...createEditableSnapshot('footer', 'Footer'),
            modelElement: '$inlineRoot',
          },
        });

        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement({ editorType: 'multiroot' }),
          canonical: {
            ...createEditorSnapshot(),
            preset: createEditorPreset('multiroot'),
            content: {},
          },
        });

        const editor = await waitForTestEditor();

        expect(editor.model.document.getRoot('header')?.name).toEqual('$inlineRoot');
        expect(editor.model.document.getRoot('footer')?.name).toEqual('$inlineRoot');
      });

      it('should wait and for root elements to be present in DOM if they are not (with content=null value)', async () => {
        livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement({ editorType: 'multiroot' }),
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
          el: createEditorHtmlElement({ editorType: 'multiroot' }),
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
          el: createEditorHtmlElement({ editorType: 'multiroot' }),
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

    describe('root attributes', () => {
      it('should apply root attributes from snapshot', async () => {
        const { id } = livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          canonical: createEditorSnapshot({
            rootAttributes: {
              'data-test': 'initial',
              'foo': 'bar',
            },
          }),
        });

        const editor = await waitForTestEditor();
        const root = editor.model.document.getRoot('main')!;

        expect(root.getAttribute('data-test')).toBe('initial');
        expect(root.getAttribute('foo')).toBe('bar');

        // Ensure attributes managed by other consumers are not removed.
        editor.model.change((writer) => {
          writer.setAttribute('external', 'value', root);
        });

        await livewireStub.$internal.dispatchComponentCommit<EditorSnapshot>(id, {
          rootAttributes: {
            'data-test': 'updated',
          },
        });

        await vi.waitFor(() => {
          expect(root.getAttribute('data-test')).toBe('updated');
          expect(root.getAttribute('foo')).toBeUndefined();
          expect(root.getAttribute('external')).toBe('value');
        });

        await livewireStub.$internal.dispatchComponentCommit<EditorSnapshot>(id, {
          rootAttributes: null as any,
        });

        await vi.waitFor(() => {
          expect(root.getAttribute('data-test')).toBeUndefined();
          expect(root.getAttribute('external')).toBe('value');
        });
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

      // Debounce should only be applied while the editor is focused.
      editor.ui.focusTracker.isFocused = true;

      vi.mocked($wire.set).mockClear();
      editor.setData('<p>Debounce test</p>');

      await vi.advanceTimersByTimeAsync(399);
      expect($wire.set).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(20);
      expect($wire.set).toHaveBeenCalledExactlyOnceWith('content', { main: '<p>Debounce test</p>' });
    });

    it('should almost immediately send `$wire.set` when editor is not focused', async () => {
      const { $wire } = livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
        el: createEditorHtmlElement(),
        canonical: {
          ...createEditorSnapshot(),
          saveDebounceMs: 400,
        },
      });

      const editor = await waitForTestEditor();

      vi.mocked($wire.set).mockClear();
      editor.setData('<p>Debounce test</p>');

      await vi.advanceTimersByTimeAsync(20);

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

      await vi.advanceTimersByTimeAsync(20);
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

    it('should resolve $translation references in the editor configuration', async () => {
      const preset = createEditorPreset(
        'classic',
        {
          customPlugin: {
            label: { $translation: 'Custom' },
          },
        },
        {
          pl: {
            Custom: 'Mocarna czcionka',
          },
        },
      );

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

      expect((editor.config.get('customPlugin') as any).label).toBe('Mocarna czcionka');
    });
  });

  describe('initialization errors', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      // Errors are not cleared between tests. Clearing them also clears the default (`null`) error,
      // so they do not leak into tests that wait for the default editor.
      EditorsRegistry.the.resetErrors('failing-init-editor');
    });

    it('should log and register the error if the editor cannot be created', async () => {
      class FailingPlugin extends Plugin {
        static pluginName = 'FailingPlugin';

        init() {
          throw new Error('Plugin initialization failed');
        }
      }

      CustomEditorPluginsRegistry.the.register('FailingPlugin', () => FailingPlugin);

      appendEditor('failing-init-editor', {
        preset: createEditorPreset('classic', {
          toolbar: [],
          plugins: ['FailingPlugin'],
        }),
      });

      await expect(EditorsRegistry.the.waitFor('failing-init-editor')).rejects.toThrow('Plugin initialization failed');

      expect(console.error).toHaveBeenCalledWith(
        'Error initializing CKEditor5 instance with ID "failing-init-editor":',
        expect.any(Error),
      );
    });
  });

  describe('errors of the running editor', () => {
    /**
     * Reports an error attributed to the given editor the same way the browser does for an uncaught error.
     */
    const reportEditorError = (editor: Editor) => {
      const error = new CKEditorError('test-editor-error', editor);

      window.dispatchEvent(new ErrorEvent('error', { error }));

      return error;
    };

    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should log the error and switch the editor to read-only mode', async () => {
      appendEditor('failing-editor');

      const editor = await waitForTestEditor('failing-editor');

      expect(editor.isReadOnly).toBe(false);

      const error = reportEditorError(editor);

      expect(console.error).toHaveBeenCalledWith('CKEditor5 instance with ID "failing-editor" failed.', error);
      expect(editor.isReadOnly).toBe(true);
    });

    it('should ignore errors attributed to other editors', async () => {
      appendEditor('healthy-editor');
      appendEditor('other-failing-editor');

      const healthyEditor = await waitForTestEditor('healthy-editor');
      const failingEditor = await waitForTestEditor('other-failing-editor');

      reportEditorError(failingEditor);

      expect(console.error).toHaveBeenCalledWith('CKEditor5 instance with ID "other-failing-editor" failed.', expect.anything());
      expect(console.error).not.toHaveBeenCalledWith('CKEditor5 instance with ID "healthy-editor" failed.', expect.anything());
      expect(healthyEditor.isReadOnly).toBe(false);
      expect(failingEditor.isReadOnly).toBe(true);
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
        vi.mocked($wire.set).mockClear();
        focusTracker.isFocused = true;

        expect($wire.set).toHaveBeenCalledWith('focused', true);

        // Blur the editor.
        vi.mocked($wire.set).mockClear();
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

        vi.mocked($wire.set).mockClear();
        editor.setData('<p>New content</p>');

        await vi.advanceTimersByTimeAsync(20);

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

        vi.mocked($wire.set).mockClear();
        editor.setData('<p>Updated content</p>');
        focusTracker.isFocused = true;

        await vi.advanceTimersByTimeAsync(20);

        expect($wire.set).toHaveBeenCalledWith('content', { main: '<p>Updated content</p>' });
        expect($wire.set).toHaveBeenCalledWith('focused', true);

        vi.useRealTimers();
      });

      it('should not crash if content is null in snapshot', async () => {
        vi.useFakeTimers();

        const { $wire } = livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          canonical: {
            ...createEditorSnapshot(),
            content: null as any,
            saveDebounceMs: 0,
          },
        });

        const editor = await waitForTestEditor();

        vi.mocked($wire.set).mockClear();
        editor.setData('<p>New content</p>');

        await vi.advanceTimersByTimeAsync(20);

        expect($wire.set).toHaveBeenCalledWith('content', { main: '<p>New content</p>' });
        vi.useRealTimers();
      });

      it('should not crash on focus change if content is null in snapshot', async () => {
        const { $wire } = livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          canonical: {
            ...createEditorSnapshot(),
            content: null as any,
          },
        });

        const { ui: { focusTracker } } = await waitForTestEditor();

        // Focus the editor.
        vi.mocked($wire.set).mockClear();
        focusTracker.isFocused = true;

        expect($wire.set).toHaveBeenCalledWith('focused', true);
      });
    });

    describe('dispatch / receive events', () => {
      it('should dispatch `editor-ready` event when editor becomes ready', async () => {
        const { $wire } = livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
          name: 'ckeditor5',
          el: createEditorHtmlElement(),
          canonical: createEditorSnapshot(),
        });

        // clear initial calls that may come from mounting logic
        vi.mocked($wire.dispatch).mockClear();

        await waitForTestEditor();

        expect($wire.dispatch).toHaveBeenCalledExactlyOnceWith('editor-ready', {
          editorId: DEFAULT_TEST_EDITOR_ID,
        });
      });

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

        vi.mocked($wire.dispatch).mockClear();
        editor.setData('<p>Content change event test</p>');

        await vi.advanceTimersByTimeAsync(20);

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

      it('should defer content update if editor is focused during `afterCommitSynced` and apply it on blur', async () => {
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
        const { ui: { focusTracker } } = editor;

        focusTracker.isFocused = true;

        await livewireStub.$internal.dispatchComponentCommit<EditorSnapshot>(id, {
          content: {
            main: '<p>Updated content from Livewire</p>',
          },
        });

        expect(editor.getData()).toBe('<p>Initial content</p>');

        focusTracker.isFocused = false;

        expect(editor.getData()).toBe('<p>Updated content from Livewire</p>');
      });

      it('should abort content update if editor is focused during `afterCommitSynced` and content changes before blur', async () => {
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
        const { ui: { focusTracker } } = editor;

        focusTracker.isFocused = true;

        await livewireStub.$internal.dispatchComponentCommit<EditorSnapshot>(id, {
          content: {
            main: '<p>Updated content from Livewire</p>',
          },
        });

        expect(editor.getData()).toBe('<p>Initial content</p>');

        editor.setData('<p>Content changed by user</p>');

        focusTracker.isFocused = false;

        expect(editor.getData()).toBe('<p>Content changed by user</p>');
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
      await vi.advanceTimersByTimeAsync(20);

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
      await vi.advanceTimersByTimeAsync(20);

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

    it('should destroy the editor and skip registration if component is unmounted during creation', async () => {
      const registerSpy = vi.spyOn(EditorsRegistry.the, 'register');

      let releaseInit!: () => void;
      const initGate = new Promise<void>((resolve) => {
        releaseInit = resolve;
      });

      let createdEditor: Editor | null = null;

      // Keeps the editor in the `initializing` state until the component is unmounted.
      class SlowPlugin extends Plugin {
        static pluginName = 'SlowPlugin';

        async init() {
          createdEditor = this.editor;
          await initGate;
        }
      }

      CustomEditorPluginsRegistry.the.register('SlowPlugin', () => SlowPlugin);

      const component = appendEditor('short-lived-editor', {
        preset: createEditorPreset('classic', {
          toolbar: [],
          plugins: ['SlowPlugin'],
        }),
      });

      await vi.waitFor(() => {
        expect(createdEditor).not.toBeNull();
      });

      const unmounting = livewireStub.$internal.unmountComponent(component.id);

      releaseInit();
      await unmounting;

      await vi.waitFor(() => {
        expect(createdEditor!.state).toBe('destroyed');
      });

      expect(registerSpy).not.toHaveBeenCalled();
      expect(EditorsRegistry.the.hasItem('short-lived-editor')).toBe(false);
    });

    it('should not destroy the editor twice if it was destroyed manually before unmount', async () => {
      // Spied before creation, so the spy is what the idempotent `destroy()` wraps.
      const destroySpy = vi.spyOn(ClassicEditor.prototype, 'destroy');
      const component = appendEditor('manually-destroyed-editor');

      const editor = await waitForTestEditor('manually-destroyed-editor');

      await editor.destroy();

      // Unregistered by the `destroy` listener, not by the hook.
      expect(EditorsRegistry.the.hasItem('manually-destroyed-editor')).toBe(false);

      await livewireStub.$internal.unmountComponent(component.id);
      await timeout(0);

      expect(destroySpy).toHaveBeenCalledTimes(1);
    });

    it('should log and swallow errors thrown while destroying the editor', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const component = appendEditor('failing-destroy-editor');

      const editor = await waitForTestEditor('failing-destroy-editor');
      const error = new Error('Destroy failed');
      const destroySpy = vi.spyOn(editor, 'destroy').mockRejectedValueOnce(error);

      // `onBeforeDestroy` callbacks are not awaited, so a rejection here would be unhandled (and fail the run).
      await livewireStub.$internal.unmountComponent(component.id);

      await vi.waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to destroy CKEditor5 instance with ID "failing-destroy-editor".', error);
      });

      // The editor is not registered anymore, so the cleanup won't destroy it.
      destroySpy.mockRestore();
      await editor.destroy();
    });
  });
});
