import type { PluginConstructor } from 'ckeditor5';

import type { CanBePromise } from '../../types';

type PluginReader = () => CanBePromise<PluginConstructor>;

/**
 * Registry for custom CKEditor plugins.
 * Allows registration and retrieval of custom plugins that can be used alongside built-in plugins.
 */
export class CustomEditorPluginsRegistry {
  static readonly the = new CustomEditorPluginsRegistry();

  /**
   * Map of registered custom plugins.
   */
  private readonly plugins = new Map<string, PluginReader>();

  /**
   * Private constructor to enforce singleton pattern.
   */
  private constructor() {}

  /**
   * Registers a custom plugin for the CKEditor.
   *
   * @param name The name of the plugin.
   * @param reader The plugin reader function that returns the plugin constructor.
   * @returns A function to unregister the plugin.
   */
  register(name: string, reader: PluginReader): () => void {
    if (this.plugins.has(name)) {
      throw new Error(`Plugin with name "${name}" is already registered.`);
    }

    this.plugins.set(name, reader);

    return this.unregister.bind(this, name);
  }

  /**
   * Removes a custom plugin by its name.
   *
   * @param name The name of the plugin to unregister.
   * @throws Will throw an error if the plugin is not registered.
   */
  unregister(name: string): void {
    if (!this.plugins.has(name)) {
      throw new Error(`Plugin with name "${name}" is not registered.`);
    }

    this.plugins.delete(name);
  }

  /**
   * Removes all custom editor plugins.
   * This is useful for cleanup in tests or when reloading plugins.
   */
  unregisterAll(): void {
    this.plugins.clear();
  }

  /**
   * Retrieves a custom plugin by its name.
   *
   * @param name The name of the plugin.
   * @returns The plugin constructor or undefined if not found.
   */
  async get(name: string): Promise<PluginConstructor | undefined> {
    const reader = this.plugins.get(name);

    return reader?.();
  }

  /**
   * Checks if a plugin with the given name is registered.
   *
   * @param name The name of the plugin.
   * @returns `true` if the plugin is registered, `false` otherwise.
   */
  has(name: string): boolean {
    return this.plugins.has(name);
  }
}
