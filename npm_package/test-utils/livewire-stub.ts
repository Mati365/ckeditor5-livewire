import { vi } from 'vitest';

import type { ComponentInitEvent, LivewireComponent, LivewireGlobal } from '../src/livewire';
import type { CanBePromise } from '../src/types';

import { once, timeout, uid } from '../src/shared';

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
    dispatchComponentInit: <E>(component: LivewireBaseComponent<E>) => {
      const mappedComponent = {
        id: `component-${uid()}`,
        effects: {},
        reactive: {},
        $wire: {
          set: vi.fn(),
          dispatch: vi.fn(),
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
     * Simulates the commit event of a Livewire component.
     * Updates the component's canonical data and triggers the commit hook.
     *
     * @param componentId - The ID of the component to commit
     * @param newCanonical - Partial canonical data to update the component with
     */
    dispatchComponentCommit: async <E>(componentId: string, newCanonical?: Partial<E>) => {
      let component = this.find(componentId);

      if (!component) {
        component = this.$internal.dispatchComponentInit<E>({
          id: componentId,
          name: 'unknown',
          el: document.createElement('div'),
          canonical: {} as E,
        });
      }

      const event = new ComponentCommitEvent(component);

      this.$internal.dispatchHook('commit', event);
      await timeout(0);

      // Simulate it's set just before succeed callbacks are called.
      component.canonical = {
        ...component.canonical,
        ...newCanonical,
      };

      event.$internal.callSucceedCallbacks();

      // Make sure all updates are processed.
      await timeout(50);
    },

    /**
     * Creates and appends a Livewire component to the DOM and initializes it.
     *
     * @param component - Base component data to create and append.
     * @param selector - CSS selector of the parent element to append the component to (default is 'body').
     * @returns The created Livewire component.
     */
    appendComponentToDOM: <E>(component: LivewireBaseComponent<E>, selector: string = 'body') => {
      const { el } = component;

      document.querySelector(selector)?.appendChild(el);

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
    unmountComponent: async (id: string) => {
      const declaration = this.$internal.findComponentDeclaration(id);

      if (!declaration) {
        throw new Error(`Component with ID "${id}" not found in LivewireStub.`);
      }

      this.componentsDeclarations.delete(declaration);
      await declaration.$internal.destroy();
    },

    /**
     * Destroys the LivewireStub instance by clearing all registered components, callbacks, and hooks.
     */
    destroy: async () => {
      for (const declaration of Array.from(this.componentsDeclarations)) {
        await declaration.$internal.destroy();
      }

      this.componentsDeclarations.clear();
      this.callbacks.clear();
      this.hooks.clear();
    },
  };
}

/**
 * Component initialization event implementation.
 */
class ComponentCommitEvent implements ComponentCommitEvent {
  constructor(
    readonly component: LivewireComponent,
  ) {}

  private succeedCallbacks: VoidFunction[] = [];

  /**
   * Registers a callback to be called when the commit succeeds.
   *
   * @param cb - The callback function
   */
  succeed = (cb: VoidFunction) => {
    this.succeedCallbacks.push(cb);
  };

  /**
   * Internal methods for testing purposes.
   */
  readonly $internal = {
    /**
     * Calls all registered succeed callbacks.
     */
    callSucceedCallbacks: () => {
      for (const cb of this.succeedCallbacks) {
        cb();
      }
    },
  };
}

/**
 * Component declaration that wraps a Livewire component and manages its lifecycle.
 */
class ComponentDeclaration implements ComponentInitEvent {
  private cleanupCallbacks: LivewireUnmountCallback[] = [];

  constructor(
    readonly component: LivewireComponent,
  ) {}

  /**
   * Registers a cleanup callback to be called when the component is destroyed.
   *
   * @param cb - The cleanup callback function
   */
  cleanup = (cb: LivewireUnmountCallback) => {
    this.cleanupCallbacks.push(cb);
  };

  /**
   * Internal methods for testing purposes.
   */
  readonly $internal = {
    /**
     * Destroys the component by calling all registered cleanup callbacks.
     */
    destroy: once(async () => {
      for (const cb of this.cleanupCallbacks) {
        await cb();
      }

      this.component.el.remove();
    }),
  };
}

/**
 * Callback type for Livewire unmount event.
 */
type LivewireUnmountCallback = () => CanBePromise<void>;

/**
 * Base component data used for initializing a Livewire component in tests.
 */
type LivewireBaseComponent<E = any> = Pick<LivewireComponent<E>, 'name' | 'el' | 'canonical'> & {
  id?: string;
};
