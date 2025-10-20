import { Editor, Plugin } from 'ckeditor5';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  createEditorHtmlElement,
  createEditorPreset,
  DEFAULT_TEST_EDITOR_ID,
  LivewireStub,
  waitForTestEditor,
} from '~/test-utils';

import type { Snapshot } from './editor';

import { registerLivewireComponentHook } from '../hook';
import { CustomEditorPluginsRegistry } from './custom-editor-plugins';
import { EditorComponentHook } from './editor';
import { EditorsRegistry } from './editors-registry';

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

  describe('mount', () => {
    it('should save the editor instance in the registry with provided editorId', async () => {
      livewireStub.$internal.appendComponentToDOM({
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

      livewireStub.$internal.appendComponentToDOM({
        name: COMPONENT_NAME,
        el: createEditorHtmlElement(),
        ephemeral: {
          ...createEditorSnapshot(),
          preset,
        },
      });

      const editor = await waitForTestEditor(DEFAULT_TEST_EDITOR_ID);

      expect(editor.plugins.get('MyCustomPlugin')).toBeInstanceOf(MyCustomPlugin);
    });
  });
});

/**
 * Creates a default snapshot for testing purposes.
 */
function createEditorSnapshot(): Snapshot {
  return {
    editorId: DEFAULT_TEST_EDITOR_ID,
    content: {
      main: '<p>Initial content</p>',
    },
    preset: createEditorPreset(),
    contextId: null,
    editableHeight: null,
    emit: {
      change: true,
      focus: true,
    },
    language: {
      ui: 'en',
      content: 'en',
    },
    saveDebounceMs: 500,
    watchdog: false,
  };
}
