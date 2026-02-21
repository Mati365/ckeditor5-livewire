import type { LivewireComponent, Wire } from '../livewire';
import type { CanBePromise } from '../types';

/**
 * An abstract class representing a class-based hook for Livewire components.
 */
export abstract class ClassHook<T extends object = Record<string, unknown>> {
  /**
   * The current state of the hook.
   */
  state: ClassHookState = 'mounting';

  /**
   * Callbacks to run before the hook is destroyed.
   */
  private _beforeDestroyCallbacks: Array<() => void> = [];

  constructor(
    /**
     * The Livewire component instance associated with this hook.
     */
    protected livewireComponent: LivewireComponent,
  ) {}

  /**
   * Registers a callback to be called before the hook is destroyed.
   * Callbacks are called in LIFO order (last registered, first called).
   */
  onBeforeDestroy(callback: () => void): void {
    this._beforeDestroyCallbacks.push(callback);
  }

  /**
   * The canonical snapshot of the Livewire component.
   */
  get canonical(): T {
    return this.livewireComponent.canonical as T;
  }

  /**
   * The root HTML element of the Livewire component.
   */
  get element(): HTMLElement {
    return this.livewireComponent.el;
  }

  /**
   * The wire interface for the Livewire component.
   */
  get $wire(): Wire {
    return this.livewireComponent.$wire;
  }

  /**
   * Checks if the hook is in the process of being destroyed.
   */
  isBeingDestroyed(): boolean {
    return ['destroyed', 'destroying'].includes(this.state);
  }

  /**
   * Called when the hook has been mounted to the DOM.
   */
  abstract mounted(): CanBePromise<void>;

  /**
   * Called when the element has been removed from the DOM.
   */
  abstract destroyed(): CanBePromise<void>;

  /**
   * Called when the component is updated by Livewire.
   */
  afterCommitSynced?(): CanBePromise<void>;

  /**
   * Runs all registered before-destroy callbacks and clears the list.
   * Called internally by makeHook before destroyed().
   */
  _runBeforeDestroyCallbacks(): void {
    for (const cb of this._beforeDestroyCallbacks.reverse()) {
      cb();
    }

    this._beforeDestroyCallbacks = [];
  }
}

/**
 * A type that represents the state of a class-based hook.
 */
export type ClassHookState = 'mounting' | 'mounted' | 'destroying' | 'destroyed';

/**
 * Registers a Livewire hook that watches initialization of components and manages their lifecycle.
 *
 * @param name - The name of the component to watch for.
 * @param Hook - A class that extends `ClassHook` to handle component lifecycle events.
 */
export function registerLivewireComponentHook(name: string, Hook: { new(component: LivewireComponent): ClassHook<any>; }) {
  /**
   * A map storing hook instances by component ID.
   */
  const hookInstances = new Map<string, ClassHook<any>>();

  window.Livewire?.hook('component.init', async ({ component, cleanup }) => {
    if (component.name !== name) {
      return;
    }

    const instance = new Hook(component);
    hookInstances.set(component.id, instance);

    cleanup(async () => {
      instance.state = 'destroying';

      instance._runBeforeDestroyCallbacks();
      await instance.destroyed();

      instance.state = 'destroyed';
      hookInstances.delete(component.id);
    });

    await instance.mounted();
    instance.state = 'mounted';
  });

  // Add hook for updates when content changes from parent
  window.Livewire?.hook('commit', async ({ component, succeed }) => {
    if (component.name !== name) {
      return;
    }

    succeed(() => {
      const instance = hookInstances.get(component.id);

      if (instance?.state === 'mounted') {
        instance?.afterCommitSynced?.();
      }
    });
  });
}
