import { EditorsRegistry } from './editor/editors-registry';
import { ClassHook } from './hook';

/**
 * UI Part hook for Livewire. It allows you to create UI parts for multi-root editors.
 */
export class UIPartComponentHook extends ClassHook<Snapshot> {
  /**
   * The promise that resolves when the UI part is mounted.
   */
  private mountedPromise: Promise<void> | null = null;

  /**
   * Mounts the UI part component.
   */
  override async mounted() {
    const { editorId, name } = this.canonical;

    // If the editor is not registered yet, we will wait for it to be registered.
    this.mountedPromise = EditorsRegistry.the.execute(editorId, (editor) => {
      /* v8 ignore next 3 */
      if (this.isBeingDestroyed()) {
        return;
      }

      const { ui } = editor;

      const uiViewName = mapUIPartView(name);
      const uiPart = (ui.view as any)[uiViewName!];

      if (!uiPart) {
        console.error(`Unknown UI part name: "${name}". Supported names are "toolbar" and "menubar".`);
        return;
      }

      this.element.appendChild(uiPart.element);
    });
  }

  /**
   * Destroys the UI part component. Unmounts UI parts from the editor.
   */
  override async destroyed() {
    // Let's hide the element during destruction to prevent flickering.
    this.element.style.display = 'none';

    // Let's wait for the mounted promise to resolve before proceeding with destruction.
    await this.mountedPromise;
    this.mountedPromise = null;

    // Unmount all UI parts from the editor.
    this.element.innerHTML = '';
  }
}

/**
 * Maps the UI part name to the corresponding view in the editor.
 */
function mapUIPartView(name: string): string | null {
  switch (name) {
    case 'toolbar':
      return 'toolbar';

    case 'menubar':
      return 'menuBarView';

    default:
      return null;
  }
}

/**
 * A snapshot of the Livewire component's state relevant to the CKEditor5 UI part hook.
 */
export type Snapshot = {
  /**
   * The ID of the editor instance this UI part belongs to.
   */
  editorId: string;

  /**
   * The name of the UI part (e.g., "toolbar", "menubar").
   */
  name: string;
};
