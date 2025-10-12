import { afterEach, describe, expect, it } from 'vitest';

import type { EditorPlugin } from '../typings';

import { CustomEditorPluginsRegistry } from '../custom-editor-plugins';
import { loadEditorPlugins } from './load-editor-plugins';

class CustomPlugin {
  static get pluginName() {
    return 'CustomPlugin';
  }
}

describe('loadEditorPlugins', () => {
  it('should load plugins from base package', async () => {
    const plugins: EditorPlugin[] = ['Bold', 'Italic'];
    const { loadedPlugins } = await loadEditorPlugins(plugins);

    expect(loadedPlugins).toHaveLength(2);
    expect(loadedPlugins[0]).toBeDefined();
    expect(loadedPlugins[1]).toBeDefined();
  });

  it('should load plugins from premium package', async () => {
    const plugins: EditorPlugin[] = ['ExportInlineStyles', 'Comments'];
    const { loadedPlugins } = await loadEditorPlugins(plugins);

    expect(loadedPlugins).toHaveLength(2);
    expect(loadedPlugins[0]).toBeDefined();
    expect(loadedPlugins[1]).toBeDefined();
  });

  it('should handle empty plugin array', async () => {
    const plugins: EditorPlugin[] = [];
    const { loadedPlugins } = await loadEditorPlugins(plugins);

    expect(loadedPlugins).toHaveLength(0);
  });

  it('should prioritize base package over premium package', async () => {
    const plugins: EditorPlugin[] = ['Bold'];
    const { loadedPlugins } = await loadEditorPlugins(plugins);

    expect(loadedPlugins).toHaveLength(1);
    expect(loadedPlugins[0]).toBeDefined();
  });

  it('should return plugin constructors', async () => {
    const plugins: EditorPlugin[] = ['Bold'];
    const { loadedPlugins } = await loadEditorPlugins(plugins);

    expect(loadedPlugins).toHaveLength(1);
    expect(typeof loadedPlugins[0]).toBe('function');
  });

  it('should throw an error for unknown plugins', async () => {
    const plugins: EditorPlugin[] = ['UnknownPlugin'];
    await expect(loadEditorPlugins(plugins)).rejects.toThrowError(/not found/);
  });

  describe('custom plugins', () => {
    afterEach(() => {
      CustomEditorPluginsRegistry.the.unregisterAll();
    });

    it('should load custom plugins', async () => {
      CustomEditorPluginsRegistry.the.register('CustomPlugin', () => CustomPlugin);

      const plugins: EditorPlugin[] = ['CustomPlugin'];
      const { loadedPlugins } = await loadEditorPlugins(plugins);

      expect(loadedPlugins).toHaveLength(1);
      expect(loadedPlugins[0]).toEqual(CustomPlugin);
    });

    it('should prefer loading custom plugins over base package', async () => {
      CustomEditorPluginsRegistry.the.register('Bold', () => CustomPlugin);

      const plugins: EditorPlugin[] = ['Bold'];
      const { loadedPlugins } = await loadEditorPlugins(plugins);

      expect(loadedPlugins).toHaveLength(1);
      expect(loadedPlugins[0]).toEqual(CustomPlugin);
    });

    it('should be possible to load async custom plugins', async () => {
      CustomEditorPluginsRegistry.the.register('AsyncPlugin', async () => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(CustomPlugin), 20);
        });
      });

      const plugins: EditorPlugin[] = ['AsyncPlugin'];
      const { loadedPlugins } = await loadEditorPlugins(plugins);

      expect(loadedPlugins).toHaveLength(1);
      expect(loadedPlugins[0]).toEqual(CustomPlugin);
    });
  });
});
