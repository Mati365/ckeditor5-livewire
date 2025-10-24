import { Context, ContextPlugin, ContextWatchdog } from 'ckeditor5';
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
  });

  describe('mount', () => {
    it('should save the context instance in the registry with provided id', async () => {
      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        ephemeral: createContextSnapshot('my-context'),
      });

      const watchdog = await ContextsRegistry.the.waitFor('my-context');

      expect(watchdog).toBeInstanceOf(ContextWatchdog);
      expect(watchdog.context).toBeInstanceOf(Context);
    });

    it('should initialize context with empty creator config', async () => {
      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        ephemeral: createContextSnapshot(DEFAULT_TEST_CONTEXT_ID, {
          config: {},
        }),
      });

      expect(await waitForTestContext()).toBeInstanceOf(ContextWatchdog);
    });

    it('should print console error if `itemError` event is fired', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        ephemeral: createContextSnapshot(),
      });

      const watchdog = await waitForTestContext();

      (watchdog as any)._fire('itemError', 'test-error', { some: 'data' });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Context item error:', null, 'test-error', { some: 'data' });

      consoleErrorSpy.mockRestore();
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
        ephemeral: createContextSnapshot(DEFAULT_TEST_CONTEXT_ID, {
          config: {
            plugins: ['CustomPlugin'],
          },
        }),
      });

      const { context } = await waitForTestContext();

      expect(context?.plugins.get('CustomPlugin')).toBeInstanceOf(CustomPlugin);
    });

    it('registered plugins should support custom translations', async () => {
      class CustomPlugin extends ContextPlugin {
        static get pluginName() {
          return 'CustomPlugin';
        }

        getHelloTitle() {
          return this.context.t('HELLO');
        }
      }

      CustomEditorPluginsRegistry.the.register('CustomPlugin', () => CustomPlugin);

      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        ephemeral: createContextSnapshot(DEFAULT_TEST_CONTEXT_ID, {
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

      const { context } = await waitForTestContext();
      const plugin = context?.plugins.get('CustomPlugin') as CustomPlugin;

      expect(plugin.getHelloTitle()).toBe('Hello from CustomPlugin');
    });

    it('should support custom language for context translations', async () => {
      class CustomPlugin extends ContextPlugin {
        static get pluginName() {
          return 'CustomPlugin';
        }

        getHelloTitle() {
          return this.context.t('HELLO');
        }
      }

      CustomEditorPluginsRegistry.the.register('CustomPlugin', () => CustomPlugin);

      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        ephemeral: createContextSnapshot(
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

      const { context } = await waitForTestContext();
      const plugin = context?.plugins.get('CustomPlugin') as CustomPlugin;

      expect(plugin.getHelloTitle()).toBe('Witaj z CustomPlugin');
    });
  });

  describe('attaching editor', () => {
    it('should not attach editor to the context (editor has no specified context, context initialized)', async () => {
      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        ephemeral: createContextSnapshot(),
      });

      const { context } = await waitForTestContext();

      livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
        el: createEditorHtmlElement(),
        ephemeral: createEditorSnapshot(),
      });

      await waitForTestEditor();

      expect(context?.editors.first).toBeNull();
    });

    it('should attach editor to the context (editor has specified context, context initialized)', async () => {
      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        ephemeral: createContextSnapshot(),
      });

      const { context } = await waitForTestContext();

      livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
        el: createEditorHtmlElement(),
        ephemeral: {
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
        ephemeral: {
          ...createEditorSnapshot(),
          contextId: DEFAULT_TEST_CONTEXT_ID,
        },
      });

      await timeout(50);

      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        ephemeral: createContextSnapshot(),
      });

      const { context } = await waitForTestContext();
      const editor = await waitForTestEditor();

      expect(context?.editors.first).toEqual(editor);
    });
  });

  describe('destroy', () => {
    it('destroyed editor is removed from the context editors collection', async () => {
      livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        ephemeral: createContextSnapshot(),
      });

      const { context } = await waitForTestContext();

      const { id: editorId } = livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
        el: createEditorHtmlElement(),
        ephemeral: {
          ...createEditorSnapshot(),
          contextId: DEFAULT_TEST_CONTEXT_ID,
        },
      });

      const editor = await waitForTestEditor();

      expect(context?.editors.first).toEqual(editor);

      await livewireStub.$internal.unmountComponent(editorId);

      expect(context?.editors.first).toBeNull();
    });

    it('should remove the context instance from the registry on destroy', async () => {
      const { id } = livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        ephemeral: createContextSnapshot('my-context'),
      });

      const watchdog = await ContextsRegistry.the.waitFor('my-context');

      expect(watchdog).toBeInstanceOf(ContextWatchdog);

      await livewireStub.$internal.unmountComponent(id);

      expect(ContextsRegistry.the.hasItem('my-context')).toBe(false);
      expect(watchdog.state).toBe('destroyed');
    });

    it('should hide element during destruction', async () => {
      const { id, el } = livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        ephemeral: createContextSnapshot(),
      });

      await livewireStub.$internal.unmountComponent(id);

      expect(el.style.display).toBe('none');
    });

    it('should handle destruction when mounted promise is not resolved yet', async () => {
      const { id, el } = livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        ephemeral: createContextSnapshot(),
      });

      await livewireStub.$internal.unmountComponent(id);

      expect(el.style.display).toBe('none');
    });

    it('destroying context should destroy all attached editors', async () => {
      const { id: contextId } = livewireStub.$internal.appendComponentToDOM({
        name: 'ckeditor5-context',
        el: createContextHtmlElement(),
        ephemeral: createContextSnapshot(),
      });

      await waitForTestContext();

      const { id: editorId } = livewireStub.$internal.appendComponentToDOM<EditorSnapshot>({
        name: 'ckeditor5',
        el: createEditorHtmlElement(),
        ephemeral: {
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
  });
});
