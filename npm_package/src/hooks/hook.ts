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

  constructor(
    /**
     * The Livewire component instance associated with this hook.
     */
    protected livewireComponent: LivewireComponent,
  ) {}

  /**
   * The ephemeral snapshot of the Livewire component.
   */
  get ephemeral(): T {
    return this.livewireComponent.ephemeral as T;
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
  window.Livewire.hook('component.init', async ({ component, cleanup }) => {
    if (component.name !== name) {
      return;
    }

    const instance = new Hook(component);

    cleanup(async () => {
      instance.state = 'destroying';
      await instance.destroyed();
      instance.state = 'destroyed';
    });

    await instance.mounted();
    instance.state = 'mounted';
  });
}
