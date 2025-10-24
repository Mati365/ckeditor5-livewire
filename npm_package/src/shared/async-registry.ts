/**
 * Generic async registry for objects with an async destroy method.
 * Provides a way to register, unregister, and execute callbacks on objects by ID.
 */
/**
 * Generic async registry for objects with an async destroy method.
 * Provides a way to register, unregister, and execute callbacks on objects by ID.
 */
export class AsyncRegistry<T extends Destructible> {
  /**
   * Map of registered items.
   */
  private readonly items = new Map<RegistryId | null, T>();

  /**
   * Map of error callbacks for items.
   */
  private readonly initializationErrors = new Map<RegistryId | null, Error>();

  /**
   * Map of callbacks that are waiting for an item to be registered.
   */
  private readonly callbacks = new Map<RegistryId | null, RegistryCallback<T>[]>();

  /**
   * Map of error callbacks for items.
   */
  private readonly errorCallbacks = new Map<RegistryId | null, RegistryErrorCallback[]>();

  /**
   * Set of watchers that observe changes to the registry.
   */
  private readonly watchers = new Set<RegistryWatcher<T>>();

  /**
   * Executes a function on an item.
   * If the item is not yet registered, it will wait for it to be registered.
   *
   * @param id The ID of the item.
   * @param onSuccess The function to execute.
   * @param onError Optional error callback.
   * @returns A promise that resolves with the result of the function.
   */
  execute<R, E extends T = T>(
    id: RegistryId | null,
    onSuccess: (item: E) => R,
    onError?: (error: Error) => void,
  ): Promise<Awaited<R>> {
    const { callbacks, items, initializationErrors } = this;

    const item = items.get(id);
    const error = initializationErrors.get(id);

    if (error && onError) {
      onError(error);
    }

    if (item) {
      return Promise.resolve(onSuccess(item as E));
    }

    return new Promise((resolve) => {
      const callback = async (item: T) => resolve(await onSuccess(item as E));

      if (onError) {
        this.onError(id, onError);
      }

      if (!this.callbacks.has(id)) {
        callbacks.set(id, []);
      }

      callbacks.set(id, [
        ...callbacks.get(id)!,
        callback,
      ]);
    });
  }

  /**
   * Registers an item.
   *
   * @param id The ID of the item.
   * @param item The item instance.
   */
  register(id: RegistryId | null, item: T): void {
    const { items, callbacks } = this;
    const callbacksForItem = callbacks.get(id);

    if (items.has(id)) {
      throw new Error(`Item with ID "${id}" is already registered.`);
    }

    this.resetErrors(id);
    items.set(id, item);

    if (callbacksForItem) {
      callbacksForItem.forEach(callback => callback(item));
      callbacks.delete(id);
    }

    // Register the first item as the default item (null ID).
    if (this.items.size === 1) {
      this.register(null, item);
    }

    this.notifyWatchers();
  }

  /**
   * Registers an error callback for an item.
   *
   * @param id The ID of the item.
   * @param callback The error callback to register.
   */
  onError(id: RegistryId | null, callback: RegistryErrorCallback): void {
    const { initializationErrors, errorCallbacks } = this;
    const error = initializationErrors.get(id);

    if (error) {
      callback(error);
      return;
    }

    if (!errorCallbacks.has(id)) {
      errorCallbacks.set(id, []);
    }

    errorCallbacks.get(id)!.push(callback);
  }

  /**
   * Resets errors for an item.
   *
   * @param id The ID of the item.
   */
  resetErrors(id: RegistryId | null): void {
    const { initializationErrors } = this;

    if (
      initializationErrors.has(null)
      && initializationErrors.get(null) === initializationErrors.get(id)
    ) {
      initializationErrors.delete(null);
    }

    this.initializationErrors.delete(id);
    this.errorCallbacks.delete(id);
  }

  /**
   * Registers an error for an item.
   *
   * @param id The ID of the item.
   * @param error The error to register.
   */
  error(id: RegistryId | null, error: Error): void {
    const errorCallbacksForItem = this.errorCallbacks.get(id);

    this.initializationErrors.set(id, error);

    if (errorCallbacksForItem) {
      errorCallbacksForItem.forEach(callback => callback(error));
      this.errorCallbacks.delete(id);
    }

    if (this.initializationErrors.size === 1 && !this.items.size) {
      this.initializationErrors.set(null, error);
    }
  }

  /**
   * Un-registers an item.
   *
   * @param id The ID of the item.
   */
  unregister(id: RegistryId | null): void {
    const { items, callbacks } = this;

    if (!items.has(id)) {
      throw new Error(`Item with ID "${id}" is not registered.`);
    }

    if (id && this.items.get(null) === items.get(id)) {
      this.unregister(null);
    }

    items.delete(id);
    callbacks.delete(id);

    this.notifyWatchers();
  }

  /**
   * Gets all registered items.
   *
   * @returns An array of all registered items.
   */
  getItems(): T[] {
    return Array.from(this.items.values());
  }

  /**
   * Checks if an item with the given ID is registered.
   *
   * @param id The ID of the item.
   * @returns `true` if the item is registered, `false` otherwise.
   */
  hasItem(id: RegistryId | null): boolean {
    return this.items.has(id);
  }

  /**
   * Gets a promise that resolves with the item instance for the given ID.
   * If the item is not registered yet, it will wait for it to be registered.
   *
   * @param id The ID of the item.
   * @returns A promise that resolves with the item instance.
   */
  waitFor<E extends T = T>(id: RegistryId | null): Promise<E> {
    return new Promise<E>((resolve, reject) => {
      void this.execute(id, resolve as (value: E) => void, reject);
    });
  }

  /**
   * Destroys all registered items and clears the registry.
   * This will call the `destroy` method on each item.
   */
  async destroyAll() {
    const promises = (
      Array
        .from(new Set(this.items.values()))
        .map(item => item.destroy())
    );

    this.items.clear();
    this.callbacks.clear();

    await Promise.all(promises);

    this.notifyWatchers();
  };

  /**
   * Registers a watcher that will be called whenever the registry changes.
   *
   * @param watcher The watcher function to register.
   * @returns A function to unregister the watcher.
   */
  watch(watcher: RegistryWatcher<T>): () => void {
    this.watchers.add(watcher);

    // Call the watcher immediately with the current state
    watcher(new Map(this.items));

    return this.unwatch.bind(this, watcher);
  }

  /**
   * Un-registers a watcher.
   *
   * @param watcher The watcher function to unregister.
   */
  unwatch(watcher: RegistryWatcher<T>): void {
    this.watchers.delete(watcher);
  }

  /**
   * Notifies all watchers about changes to the registry.
   */
  private notifyWatchers(): void {
    const itemsCopy = new Map(this.items);
    this.watchers.forEach(watcher => watcher(itemsCopy));
  }
}

/**
 * Interface for objects that can be destroyed.
 */
export type Destructible = {
  destroy: () => Promise<any>;
};

/**
 * Identifier of the registry item.
 */
type RegistryId = string;

/**
 * Callback type for registry operations.
 */
type RegistryCallback<T> = (item: T) => void;

/**
 * Callback type for registry errors.
 */
type RegistryErrorCallback = (error: Error) => void;

/**
 * Callback type for watching registry changes.
 */
type RegistryWatcher<T> = (items: Map<RegistryId | null, T>) => void;
