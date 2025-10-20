export type LivewireComponent<E = any> = {
  id: string;
  el: HTMLElement;
  name: string;
  ephemeral: E;
  $wire: Wire;
  effects: Record<string, unknown>;
  canonical: Record<string, unknown>;
  reactive: any;
  children: Array<any>;
  snapshot: Record<string, unknown>;
  snapshotEncoded: string;
};

export type Wire = {
  set: (key: string | Record<string, any>, value?: any) => void | Promise<void>;
};

export type ComponentInitEvent = {
  cleanup: (cb: VoidFunction) => void;
  component: LivewireComponent;
};

type Hook = {
  (event: 'component.init', callback: (attrs: ComponentInitEvent) => void): void;
  (event: string, callback: (attrs: any) => void): void;
};

export type LivewireGlobal = {
  find: (id: string) => LivewireComponent | undefined;
  all: () => LivewireComponent[];
  on: (event: string, callback: (...params: any[]) => void) => void;
  dispatch: (event: string, ...params: any[]) => void;
  hook: Hook;
};

declare global {
  // eslint-disable-next-line vars-on-top
  var Livewire: LivewireGlobal;
}
