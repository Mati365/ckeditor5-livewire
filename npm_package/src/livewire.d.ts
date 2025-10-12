export type LivewireComponent = {
  el: HTMLElement;
  id: string;
  name: string;
  effects: Record<string, unknown>;
  canonical: Record<string, unknown>;
  ephemeral: Record<string, unknown>;
  reactive: any;
  $wire: Wire;
  children: Array<any>;
  snapshot: Record<string, unknown>;
  snapshotEncoded: string;
};

export type Wire = {
  dispatch: (event: string, ...params: any[]) => void;
  set: (key: string | Record<string, any>, value?: any) => void | Promise<void>;
};

type ComponentInitEvent = {
  cleanup: (cb: VoidFunction) => void;
  component: LivewireComponent;
};

type Hook = {
  (event: 'component.init', callback: (attrs: ComponentInitEvent) => void): void;
  (event: string, callback: (attrs: any) => void): void;
};

export type LivewireGlobal = {
  find: (id: string) => any;
  emit: (event: string, ...params: any[]) => void;
  on: (event: string, callback: (...params: any[]) => void) => void;
  hook: Hook;
};

declare global {
  // eslint-disable-next-line ts/consistent-type-definitions
  interface Window {
    Livewire: LivewireGlobal;
  }
}
