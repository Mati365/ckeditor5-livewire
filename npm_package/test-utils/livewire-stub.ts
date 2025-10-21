import { vi } from 'vitest';

import type { ComponentInitEvent, LivewireComponent, LivewireGlobal } from '../src/livewire';

import { uid } from '../src/shared/uid';

/**
 * Livewire stub class for testing purposes.
 * Provides a mock implementation of Livewire global object with all necessary methods.
 */
export class LivewireStub implements LivewireGlobal {
  /**
   * Collection of registered Livewire components
   */
  private componentsDeclarations = new Set<ComponentDeclaration>();

  /**
   * Map of event callbacks registered via the `on` method
   */
  private callbacks = new Map<string, Function[]>();

  /**
   * Map of hook callbacks registered via the `hook` method
   */
  private hooks = new Map<string, Function[]>();

  /**
   * Returns all registered Livewire components.
   *
   * @returns Array of all components
   */
  all = vi.fn(() => Array.from(this.componentsDeclarations).map(decl => decl.component));

  /**
   * Registers a hook callback that will be called when the specified hook is triggered.
   *
   * @param hook - The name of the hook to listen for
   * @param callback - The function to call when the hook is triggered
   */
  hook = vi.fn((hook: string, callback: Function) => {
    const prevCallbacks = this.hooks.get(hook) || [];

    this.hooks.set(hook, [...prevCallbacks, callback]);
  });

  /**
   * Registers an event listener that will be called when the specified event is dispatched.
   *
   * @param event - The name of the event to listen for
   * @param callback - The function to call when the event is dispatched
   */
  on = vi.fn((event: string, callback: Function) => {
    const prevCallbacks = this.callbacks.get(event) || [];

    this.callbacks.set(event, [...prevCallbacks, callback]);
  });

  /**
   * Dispatches an event to all registered listeners.
   *
   * @param event - The name of the event to dispatch
   * @param args - Arguments to pass to the event listeners
   */
  dispatch = vi.fn((event: string, ...args: any[]) => {
    for (const callback of this.callbacks.get(event) || []) {
      callback(...args);
    }
  });

  /**
   * Finds a Livewire component by its ID.
   *
   * @param id - The ID of the component to find
   * @returns The found Livewire component or undefined if not found
   */
  find = vi.fn((id: string): LivewireComponent | undefined => (
    Array
      .from(this.componentsDeclarations)
      .map(decl => decl.component)
      .find(component => component.id === id)
  ));

  /**
   * Internal methods for testing purposes.
   */
  readonly $internal = {
    /**
     * Manually dispatches a hook to all registered hook listeners.
     *
     * @param hook - The name of the hook to dispatch
     * @param args - Arguments to pass to the hook listeners
     */
    dispatchHook: (hook: string, ...args: any[]) => {
      for (const callback of this.hooks.get(hook) || []) {
        callback(...args);
      }
    },

    /**
     * Simulates the initialization of a Livewire component.
     * Creates a full component object and triggers the component.init hook.
     *
     * @param component - Base component data to initialize
     * @returns The initialized Livewire component
     */
    dispatchComponentInit: (component: LivewireBaseComponent) => {
      const mappedComponent = {
        id: `component-${uid()}`,
        effects: {},
        canonical: {},
        reactive: {},
        $wire: {
          set: vi.fn(),
        },
        children: [],
        snapshot: {},
        snapshotEncoded: '',
        ...component,
      } satisfies LivewireComponent;

      const declaration = new ComponentDeclaration(mappedComponent);

      this.componentsDeclarations.add(declaration);
      this.$internal.dispatchHook('component.init', declaration);

      return mappedComponent;
    },

    /**
     * Creates and appends a Livewire component to the DOM and initializes it.
     *
     * @param component - Base component data to create and append
     * @returns The created Livewire component
     */
    appendComponentToDOM: <E>(component: LivewireBaseComponent<E>) => {
      const { el } = component;

      document.body.appendChild(el);

      return this.$internal.dispatchComponentInit(component);
    },

    /**
     * Finds a component declaration by its ID.
     *
     * @param id - The ID of the component to find
     * @returns The found component declaration or undefined if not found
     */
    findComponentDeclaration: (id: string): ComponentDeclaration | undefined => (
      Array
        .from(this.componentsDeclarations)
        .find(decl => decl.component.id === id)
    ),

    /**
     * Unmounts (destroys) a Livewire component by its ID.
     *
     * @param id - The ID of the component to unmount
     * @throws Error if the component with the specified ID is not found
     */
    unmountComponent: (id: string) => {
      const declaration = this.$internal.findComponentDeclaration(id);

      if (!declaration) {
        throw new Error(`Component with ID "${id}" not found in LivewireStub.`);
      }

      declaration.$internal.destroy();
      this.componentsDeclarations.delete(declaration);
    },

    /**
     * Destroys the LivewireStub instance by clearing all registered components, callbacks, and hooks.
     */
    destroy: () => {
      for (const declaration of Array.from(this.componentsDeclarations)) {
        declaration.$internal.destroy();
      }

      this.componentsDeclarations.clear();
      this.callbacks.clear();
      this.hooks.clear();
    },
  };
}

/**
 * Base component data used for initializing a Livewire component in tests.
 */
type LivewireBaseComponent<E = any> = Pick<LivewireComponent<E>, 'name' | 'el' | 'ephemeral'>;

/**
 * Component declaration that wraps a Livewire component and manages its lifecycle.
 */
class ComponentDeclaration implements ComponentInitEvent {
  private cleanupCallbacks: VoidFunction[] = [];

  constructor(
    readonly component: LivewireComponent,
  ) {}

  /**
   * Registers a cleanup callback to be called when the component is destroyed.
   *
   * @param cb - The cleanup callback function
   */
  cleanup = (cb: VoidFunction) => {
    this.cleanupCallbacks.push(cb);
  };

  /**
   * Internal methods for testing purposes.
   */
  readonly $internal = {
    /**
     * Destroys the component by calling all registered cleanup callbacks.
     */
    destroy: () => {
      for (const cb of this.cleanupCallbacks) {
        cb();
      }

      this.component.el.remove();
    },
  };
}
