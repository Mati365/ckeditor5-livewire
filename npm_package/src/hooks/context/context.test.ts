import { CKEditorError, ClassicEditor, Context, ContextPlugin, Plugin } from 'ckeditor5';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createContextHtmlElement,
  createContextSnapshot,
  createEditorHtmlElement,
  createEditorSnapshot,
  DEFAULT_TEST_CONTEXT_ID,
  LivewireStub,
  waitForTestContext,
  waitForTestEditor,
} from '~/test-utils';

import type { Snapshot as EditorSnapshot } from '../editor';

import { timeout } from '../../shared';
import { EditorComponentHook } from '../editor';
import { CustomEditorPluginsRegistry } from '../editor/custom-editor-plugins';
import { EditorsRegistry } from '../editor/editors-registry';
import { registerLivewireComponentHook } from '../hook';
import { ContextComponentHook } from './context';
import { ContextsRegistry } from './contexts-registry';

describe('context component', () => {
  let livewireStub: LivewireStub;

  beforeEach(() => {
    document.body.innerHTML = '';
    livewireStub = window.Livewire = new LivewireStub();

    registerLivewireComponentHook('ckeditor5', EditorComponentHook);
    registerLivewireComponentHook('ckeditor5-context', ContextComponentHook);
  });

  afterEach(async () => {
    CustomEditorPluginsRegistry.the.unregisterAll();
    await livewireStub.$internal.destroy();
    vi.restoreAllMocks();
  });

  /**
   * Mounts the context component with the given ID and optional context configuration.
   */
  function appendContext(contextId: string = DEFAULT_TEST_CONTEXT_ID, config: Parameters<typeof createContextSnapshot>[1] = {}) {
    return livewireStub.$internal.appendComponentToDOM({
      name: 'ckeditor5-context',
      el: createContextHtmlElement(),
      canonical: createContextSnapshot(contextId, config),
    });
  }

  /**
   * Mounts the editor component attached to the given context.
   */
  function appendEditorInContext(editorId: string, contextId: string = DEFAULT_TEST_CONTEXT_ID) {
    return livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
      name: 'ckeditor5',
      el: createEditorHtmlElement({ id: editorId }),
      canonical: {
        ...createEditorSnapshot(),
        editorId,
        contextId,
      },
    });
  }

  describe('mount', () => {
    it('should save the context instance in the registry with provided id', async () => {
      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        canonical: createContextSnapshot('my-context'),
      });

      const context = await ContextsRegistry.the.waitFor('my-context');

      expect(context).toBeInstanceOf(Context);
    });

    it('should initialize context with empty creator config', async () => {
      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        canonical: createContextSnapshot(DEFAULT_TEST_CONTEXT_ID, {
          config: {},
        }),
      });

      expect(await waitForTestContext()).toBeInstanceOf(Context);
    });

    it('should initialize custom plugins passed to context', async () => {
      class CustomPlugin extends ContextPlugin {
        static get pluginName() {
          return 'CustomPlugin';
        }
      }

      CustomEditorPluginsRegistry.the.register('CustomPlugin', () => CustomPlugin);

      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        canonical: createContextSnapshot(DEFAULT_TEST_CONTEXT_ID, {
          config: {
            plugins: ['CustomPlugin'],
          },
        }),
      });

      const context = await waitForTestContext();

      expect(context?.plugins.get('CustomPlugin')).toBeInstanceOf(CustomPlugin);
    });

    describe('language', () => {
      class CustomPlugin extends ContextPlugin {
        static get pluginName() {
          return 'CustomPlugin';
        }

        getHelloTitle() {
          return this.context.t('HELLO');
        }
      }

      beforeEach(() => {
        CustomEditorPluginsRegistry.the.register('CustomPlugin', () => CustomPlugin);
      });

      it('registered plugins should support custom translations', async () => {
        livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-context',
          el: createContextHtmlElement(),
          canonical: createContextSnapshot(DEFAULT_TEST_CONTEXT_ID, {
            customTranslations: {
              en: {
                HELLO: 'Hello from CustomPlugin',
              },
            },
            config: {
              plugins: ['CustomPlugin'],
            },
          }),
        });

        const context = await waitForTestContext();
        const plugin = context?.plugins.get('CustomPlugin') as CustomPlugin;

        expect(plugin.getHelloTitle()).toBe('Hello from CustomPlugin');
      });

      it('should support custom language for context translations', async () => {
        livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-context',
          el: createContextHtmlElement(),
          canonical: createContextSnapshot(
            DEFAULT_TEST_CONTEXT_ID,
            {
              customTranslations: {
                en: {
                  HELLO: 'Hello from CustomPlugin',
                },
                pl: {
                  HELLO: 'Witaj z CustomPlugin',
                },
              },
              config: {
                plugins: ['CustomPlugin'],
              },
            },
            {
              ui: 'pl',
              content: 'pl',
            },
          ),
        });

        const context = await waitForTestContext();
        const plugin = context?.plugins.get('CustomPlugin') as CustomPlugin;

        expect(plugin.getHelloTitle()).toBe('Witaj z CustomPlugin');
      });

      it('should resolve $translation references in the context configuration', async () => {
        livewireStub.$internal.appendComponentToDOM({
          name: 'ckeditor5-context',
          el: createContextHtmlElement(),
          canonical: createContextSnapshot(
            DEFAULT_TEST_CONTEXT_ID,
            {
              customTranslations: {
                en: {
                  Custom: 'Custom value',
                },
                pl: {
                  Custom: 'Wartość niestandardowa',
                },
              },
              config: {
                customPlugin: {
                  label: { $translation: 'Custom' },
                },
              },
            },
            {
              ui: 'pl',
              content: 'pl',
            },
          ),
        });

        const context = await waitForTestContext();

        expect((context!.config.get('customPlugin') as any).label).toBe('Wartość niestandardowa');
      });
    });
  });

  describe('mount errors', () => {
    // A regular editor plugin is rejected by `Context.create()`, which gives a real creation failure.
    class NotAContextPlugin extends Plugin {
      static pluginName = 'NotAContextPlugin';
    }

    const appendBrokenContext = () => appendContext(DEFAULT_TEST_CONTEXT_ID, {
      config: {
        plugins: ['NotAContextPlugin'],
      },
    });

    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      CustomEditorPluginsRegistry.the.register('NotAContextPlugin', () => NotAContextPlugin);
    });

    afterEach(() => {
      // Errors are not cleared between tests. Clearing them also clears the default (`null`) error,
      // so they do not leak into tests that wait for the default context or editor.
      ContextsRegistry.the.resetErrors(DEFAULT_TEST_CONTEXT_ID);
      EditorsRegistry.the.resetErrors('editor-in-broken-context');
    });

    it('should log and register the error if the context cannot be created', async () => {
      appendBrokenContext();

      await expect(ContextsRegistry.the.waitFor(DEFAULT_TEST_CONTEXT_ID)).rejects.toThrow('context-initplugins-invalid-plugin');

      expect(ContextsRegistry.the.hasItem(DEFAULT_TEST_CONTEXT_ID)).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        `Error initializing CKEditor5 context with ID "${DEFAULT_TEST_CONTEXT_ID}":`,
        expect.anything(),
      );
    });

    it('should reject editors waiting for the context that cannot be created', async () => {
      appendBrokenContext();
      appendEditorInContext('editor-in-broken-context');

      await expect(EditorsRegistry.the.waitFor('editor-in-broken-context')).rejects.toThrow('context-initplugins-invalid-plugin');
    });

    it('should not fail when unmounting the context that could not be created', async () => {
      const { id, el } = appendBrokenContext();

      await expect(ContextsRegistry.the.waitFor(DEFAULT_TEST_CONTEXT_ID)).rejects.toThrow();

      // Rejects (and fails the test) if the creation error is not swallowed in `destroyed()`.
      await livewireStub.$internal.unmountComponent(id);

      expect(el.style.display).toBe('none');
    });
  });

  describe('errors of the running context', () => {
    /**
     * Reports an error attributed to the context the same way the browser does for an uncaught error.
     */
    const reportContextError = (context: Context) => {
      const error = new CKEditorError('test-context-error', context);

      window.dispatchEvent(new ErrorEvent('error', { error }));

      return error;
    };

    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should log the error and switch editors of the context to read-only mode', async () => {
      appendContext();
      appendEditorInContext('editor-in-failing-context');

      const context = await waitForTestContext();
      const editor = await waitForTestEditor('editor-in-failing-context');

      expect(editor.isReadOnly).toBe(false);

      const error = reportContextError(context);

      expect(console.error).toHaveBeenCalledWith(`CKEditor5 context with ID "${DEFAULT_TEST_CONTEXT_ID}" failed.`, error);
      expect(editor.isReadOnly).toBe(true);
    });

    it('should ignore errors attributed to other contexts', async () => {
      appendContext('healthy-context');
      appendContext('other-failing-context');
      appendEditorInContext('editor-in-healthy-context', 'healthy-context');

      const failingContext = await ContextsRegistry.the.waitFor('other-failing-context');
      const healthyEditor = await waitForTestEditor('editor-in-healthy-context');

      reportContextError(failingContext);

      expect(console.error).toHaveBeenCalledWith('CKEditor5 context with ID "other-failing-context" failed.', expect.anything());
      expect(console.error).not.toHaveBeenCalledWith('CKEditor5 context with ID "healthy-context" failed.', expect.anything());
      expect(healthyEditor.isReadOnly).toBe(false);
    });
  });

  describe('attaching editor', () => {
    it('should not attach editor to the context (editor has no specified context, context initialized)', async () => {
      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        canonical: createContextSnapshot(),
      });

      const context = await waitForTestContext();

      livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
        el: createEditorHtmlElement(),
        canonical: createEditorSnapshot(),
      });

      await waitForTestEditor();

      expect(context?.editors.first).toBeNull();
    });

    it('should attach editor to the context (editor has specified context, context initialized)', async () => {
      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        canonical: createContextSnapshot(),
      });

      const context = await waitForTestContext();

      livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
        el: createEditorHtmlElement(),
        canonical: {
          ...createEditorSnapshot(),
          contextId: DEFAULT_TEST_CONTEXT_ID,
        },
      });

      const editor = await waitForTestEditor();

      expect(context?.editors.first).toEqual(editor);
    });

    it('should pause editor initialization when context is not yet initialized', async () => {
      livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
        el: createEditorHtmlElement(),
        canonical: {
          ...createEditorSnapshot(),
          contextId: DEFAULT_TEST_CONTEXT_ID,
        },
      });

      await timeout(50);

      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        canonical: createContextSnapshot(),
      });

      const context = await waitForTestContext();
      const editor = await waitForTestEditor();

      expect(context?.editors.first).toEqual(editor);
    });

    it('should be possible to attach multiple editors to the same context', async () => {
      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        canonical: createContextSnapshot(),
      });

      const context = await waitForTestContext();

      livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
        el: createEditorHtmlElement({ id: 'editor-1' }),
        canonical: {
          ...createEditorSnapshot(),
          editorId: 'editor-1',
          contextId: DEFAULT_TEST_CONTEXT_ID,
        },
      });

      livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
        el: createEditorHtmlElement({ id: 'editor-2' }),
        canonical: {
          ...createEditorSnapshot(),
          editorId: 'editor-2',
          contextId: DEFAULT_TEST_CONTEXT_ID,
        },
      });

      const editors = await Promise.all([
        waitForTestEditor('editor-1'),
        waitForTestEditor('editor-2'),
      ]);

      expect(context?.editors.length).toBe(2);
      expect([...context!.editors]).toEqual(editors);
    });
  });

  describe('destroy', () => {
    it('destroyed editor is removed from the context editors collection', async () => {
      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        canonical: createContextSnapshot(),
      });

      const context = await waitForTestContext();

      const { id: editorId } = livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
        el: createEditorHtmlElement(),
        canonical: {
          ...createEditorSnapshot(),
          contextId: DEFAULT_TEST_CONTEXT_ID,
        },
      });

      const editor = await waitForTestEditor();

      expect(context?.editors.first).toEqual(editor);

      await livewireStub.$internal.unmountComponent(editorId);

      await vi.waitFor(() => {
        expect(context?.editors.first).toBeNull();
      });
    });

    it('should remove the context instance from the registry on destroy', async () => {
      const { id } = livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        canonical: createContextSnapshot('my-context'),
      });

      const context = await ContextsRegistry.the.waitFor('my-context');
      const destroySpy = vi.spyOn(context, 'destroy');

      await livewireStub.$internal.unmountComponent(id);

      expect(ContextsRegistry.the.hasItem('my-context')).toBe(false);
      expect(destroySpy).toHaveBeenCalledTimes(1);
    });

    it('should hide element during destruction', async () => {
      const { id, el } = livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        canonical: createContextSnapshot(),
      });

      await livewireStub.$internal.unmountComponent(id);

      expect(el.style.display).toBe('none');
    });

    it('should handle destruction when mounted promise is not resolved yet', async () => {
      const { id, el } = livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        canonical: createContextSnapshot(),
      });

      await livewireStub.$internal.unmountComponent(id);

      expect(el.style.display).toBe('none');
    });

    it('destroying context should destroy all attached editors', async () => {
      const { id: contextId } = livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        canonical: createContextSnapshot(),
      });

      await waitForTestContext();

      const { id: editorId } = livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
        el: createEditorHtmlElement(),
        canonical: {
          ...createEditorSnapshot(),
          contextId: DEFAULT_TEST_CONTEXT_ID,
        },
      });

      const editor = await waitForTestEditor();

      expect(editor.state).toBe('ready');

      await livewireStub.$internal.unmountComponent(contextId);

      expect(editor.state).toBe('destroyed');

      expect(ContextsRegistry.the.hasItem(DEFAULT_TEST_CONTEXT_ID)).toBe(false);
      expect(EditorsRegistry.the.hasItem(editorId)).toBe(false);
    });

    it('should log and swallow errors thrown while destroying the context', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { id } = appendContext('failing-destroy-context');

      const context = await ContextsRegistry.the.waitFor('failing-destroy-context');
      const error = new Error('Destroy failed');
      const destroySpy = vi.spyOn(context, 'destroy').mockRejectedValueOnce(error);

      // Rejects (and fails the test) if the error is not swallowed in `destroyed()`.
      await livewireStub.$internal.unmountComponent(id);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to destroy CKEditor5 context with ID "failing-destroy-context".', error);

      // The context is not registered anymore, so the cleanup won't destroy it.
      destroySpy.mockRestore();
      await context.destroy();
    });

    it('should destroy the context and skip registration if the hook is destroyed during creation', async () => {
      const destroySpy = vi.spyOn(Context.prototype, 'destroy');
      const registerSpy = vi.spyOn(ContextsRegistry.the, 'register');

      let releaseInit!: () => void;
      const initGate = new Promise<void>((resolve) => {
        releaseInit = resolve;
      });

      let initStarted = false;

      // Keeps the context being created until the hook is destroyed.
      class SlowContextPlugin extends ContextPlugin {
        static get pluginName() {
          return 'SlowContextPlugin';
        }

        async init() {
          initStarted = true;
          await initGate;
        }
      }

      CustomEditorPluginsRegistry.the.register('SlowContextPlugin', () => SlowContextPlugin);

      const { id } = appendContext('short-lived-context', {
        config: {
          plugins: ['SlowContextPlugin'],
        },
      });

      await expect.poll(() => initStarted).toBe(true);

      const unmounting = livewireStub.$internal.unmountComponent(id);

      releaseInit();
      await unmounting;

      expect(destroySpy).toHaveBeenCalledTimes(1);
      expect(registerSpy).not.toHaveBeenCalled();
      expect(ContextsRegistry.the.hasItem('short-lived-context')).toBe(false);
    });

    it('should not unregister the context of a new hook with the same id when the old one is destroyed', async () => {
      const destroySpy = vi.spyOn(Context.prototype, 'destroy');

      let releaseFirstInit!: () => void;
      const firstInitGate = new Promise<void>((resolve) => {
        releaseFirstInit = resolve;
      });

      let initializedPlugins = 0;

      // Only the first (old) context is kept being created until the new one is registered.
      class GatedContextPlugin extends ContextPlugin {
        static get pluginName() {
          return 'GatedContextPlugin';
        }

        async init() {
          if (initializedPlugins++ === 0) {
            await firstInitGate;
          }
        }
      }

      CustomEditorPluginsRegistry.the.register('GatedContextPlugin', () => GatedContextPlugin);

      const config = {
        config: {
          plugins: ['GatedContextPlugin'],
        },
      };

      const { id: oldId } = appendContext('replaced-context', config);

      await expect.poll(() => initializedPlugins).toBe(1);

      // Simulate replacing the component with a new one with the same context id.
      const oldUnmounting = livewireStub.$internal.unmountComponent(oldId);

      appendContext('replaced-context', config);

      const newContext = await ContextsRegistry.the.waitFor('replaced-context');

      releaseFirstInit();
      await oldUnmounting;

      // The old context is destroyed by its hook.
      expect(destroySpy).toHaveBeenCalledTimes(1);
      expect(ContextsRegistry.the.getItem('replaced-context')).toBe(newContext);
    });

    it.each([
      ['context before editor', false],
      ['editor before context', true],
    ])('should destroy the editor only once when unmounted together with its context (%s)', async (_, editorFirst) => {
      // Spied before creation, so the spy is what the idempotent `destroy()` wraps.
      const destroySpy = vi.spyOn(ClassicEditor.prototype, 'destroy');

      const { id: contextComponentId } = appendContext();
      const { id: editorComponentId } = appendEditorInContext('editor-unmounted-with-context');

      const context = await waitForTestContext();

      await waitForTestEditor('editor-unmounted-with-context');

      // Both are unmounted in the same update, in the given order.
      const order = editorFirst
        ? [editorComponentId, contextComponentId]
        : [contextComponentId, editorComponentId];

      await Promise.all(order.map(id => livewireStub.$internal.unmountComponent(id)));

      await expect.poll(() => context.editors.length).toBe(0);

      expect(destroySpy).toHaveBeenCalledTimes(1);
    });
  });
});
