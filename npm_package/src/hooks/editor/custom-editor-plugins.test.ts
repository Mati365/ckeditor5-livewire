import { Plugin } from 'ckeditor5';
import { afterEach, describe, expect, it } from 'vitest';

import { CustomEditorPluginsRegistry } from './custom-editor-plugins';

class MockPlugin1 extends Plugin {
  static get pluginName() {
    return 'MockPlugin1';
  }
}

class MockPlugin2 extends Plugin {
  static get pluginName() {
    return 'MockPlugin2';
  }
}

describe('custom-editor-plugins', () => {
  afterEach(() => {
    CustomEditorPluginsRegistry.the.unregisterAll();
  });

  describe('register', () => {
    it('should register a plugin successfully', async () => {
      const unregister = CustomEditorPluginsRegistry.the.register('test-plugin', () => MockPlugin1);

      expect(await CustomEditorPluginsRegistry.the.get('test-plugin')).toBe(MockPlugin1);
      expect(typeof unregister).toBe('function');
    });

    it('should throw an error when registering a plugin with the same name', () => {
      CustomEditorPluginsRegistry.the.register('duplicate-plugin', () => MockPlugin1);

      expect(() => {
        CustomEditorPluginsRegistry.the.register('duplicate-plugin', () => MockPlugin2);
      }).toThrow('Plugin with name "duplicate-plugin" is already registered.');
    });

    it('should return an unregister function that removes the plugin', async () => {
      const unregister = CustomEditorPluginsRegistry.the.register('removable-plugin', () => MockPlugin1);

      expect(await CustomEditorPluginsRegistry.the.get('removable-plugin')).toBe(MockPlugin1);

      unregister();

      expect(await CustomEditorPluginsRegistry.the.get('removable-plugin')).toBeUndefined();
    });
  });

  describe('unregister', () => {
    it('should unregister an existing plugin', async () => {
      CustomEditorPluginsRegistry.the.register('temp-plugin', () => MockPlugin1);

      expect(await CustomEditorPluginsRegistry.the.get('temp-plugin')).toBe(MockPlugin1);

      CustomEditorPluginsRegistry.the.unregister('temp-plugin');

      expect(await CustomEditorPluginsRegistry.the.get('temp-plugin')).toBeUndefined();
    });

    it('should throw an error when unregistering a non-existent plugin', () => {
      expect(() => {
        CustomEditorPluginsRegistry.the.unregister('non-existent');
      }).toThrow('Plugin with name "non-existent" is not registered.');
    });
  });

  describe('unregisterAll', () => {
    it('should clear all registered plugins', async () => {
      CustomEditorPluginsRegistry.the.register('plugin-1', () => MockPlugin1);
      CustomEditorPluginsRegistry.the.register('plugin-2', () => MockPlugin2);

      expect(await CustomEditorPluginsRegistry.the.get('plugin-1')).toBe(MockPlugin1);
      expect(await CustomEditorPluginsRegistry.the.get('plugin-2')).toBe(MockPlugin2);

      CustomEditorPluginsRegistry.the.unregisterAll();

      expect(await CustomEditorPluginsRegistry.the.get('plugin-1')).toBeUndefined();
      expect(await CustomEditorPluginsRegistry.the.get('plugin-2')).toBeUndefined();
    });
  });

  describe('get', () => {
    it('should return the correct plugin when it exists', async () => {
      CustomEditorPluginsRegistry.the.register('existing-plugin', () => MockPlugin1);

      expect(await CustomEditorPluginsRegistry.the.get('existing-plugin')).toBe(MockPlugin1);
    });

    it('should return undefined for non-existent plugins', async () => {
      expect(await CustomEditorPluginsRegistry.the.get('non-existent-plugin')).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true for registered plugins', () => {
      CustomEditorPluginsRegistry.the.register('check-plugin', () => MockPlugin1);

      expect(CustomEditorPluginsRegistry.the.has('check-plugin')).toBe(true);
      expect(CustomEditorPluginsRegistry.the.has('non-existent')).toBe(false);
    });
  });
});
