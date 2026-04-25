import { EditorsRegistry } from 'ckeditor5-livewire';

declare global {
  // eslint-disable-next-line ts/consistent-type-definitions
  interface Window {
    triggerCKE5Error: (editorId: string) => void;
  }
}

export function triggerCKE5Error(editorId: string) {
  setTimeout(() => {
    const err: any = new Error('foo');

    err.context = EditorsRegistry.the.getItem(editorId);
    err.is = () => true;

    throw err;
  });
}

window.triggerCKE5Error = triggerCKE5Error;
