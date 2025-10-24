import { Context, ContextPlugin, ContextWatchdog } from 'ckeditor5';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createContextHtmlElement, createContextSnapshot, DEFAULT_TEST_CONTEXT_ID, LivewireStub, waitForTestContext } from '~/test-utils';

import { EditorComponentHook } from '../editor';
import { CustomEditorPluginsRegistry } from '../editor/custom-editor-plugins';
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
});
