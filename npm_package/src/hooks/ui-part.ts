import { EditorsRegistry } from './editor/editors-registry';
import { ClassHook } from './hook';

/**
 * UI Part hook for Livewire. It allows you to create UI parts for multi-root editors.
 */
export class UIPartComponentHook extends ClassHook<Snapshot> {
  /**
   * Mounts the UI part component.
   */
  override mounted() {
    const { editorId, name } = this.canonical;

    const unmountEffect = EditorsRegistry.the.mountEffect(editorId, (editor) => {
      /* v8 ignore next if -- @preserve */
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

      return () => {
        this.element.innerHTML = '';
      };
    });

    this.onBeforeDestroy(unmountEffect);
  }

  /**
   * Destroys the UI part component. Unmounts UI parts from the editor.
   */
  override destroyed() {
    // Let's hide the element during destruction to prevent flickering.
    // The innerHTML cleanup is handled by the mountEffect cleanup function.
    this.element.style.display = 'none';
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
