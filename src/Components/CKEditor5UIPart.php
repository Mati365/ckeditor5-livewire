<?php

namespace Mati365\CKEditor5Livewire\Components;

use Livewire\Component;
use Illuminate\View\View;

/**
 * Livewire component for CKEditor5 UI part.
 *
 * This component allows extracting UI parts (toolbar, menubar) from the editor
 * and rendering them in separate locations on the page.
 *
 * @psalm-suppress MissingConstructor
 */
final class CKEditor5UIPart extends Component
{
    /**
     * Unique identifier for the UI part instance.
     * Generated automatically to ensure multiple UI parts can coexist on the same page.
     */
    public string $uiPartId;

    /**
     * The identifier of the editor instance this UI part belongs to.
     */
    public string $editorId;

    /**
     * The name of the UI part (e.g., "toolbar", "menubar").
     */
    public string $name;

    /**
     * CSS class for the UI part wrapper element.
     */
    public ?string $class = null;

    /**
     * Inline styles for the UI part wrapper element.
     */
    public ?string $style = null;

    /**
     * Mount method called when the component is initialized.
     *
     * @param string $editorId The identifier of the editor instance
     * @param string $name The name of the UI part ("toolbar" or "menubar")
     * @param ?string $uiPartId Unique identifier for the UI part instance
     * @param ?string $class CSS class for the wrapper element
     * @param ?string $style Inline styles for the wrapper element
     * @return void
     */
    public function mount(
        string $editorId,
        string $name,
        ?string $uiPartId = null,
        ?string $class = null,
        ?string $style = null
    ): void {
        if (!in_array($name, ['toolbar', 'menubar'])) {
            throw new \InvalidArgumentException(
                "Invalid UI part name: \"{$name}\". Supported names are \"toolbar\" and \"menubar\"."
            );
        }

        $this->uiPartId = $uiPartId ?? 'ckeditor-ui-part-' . uniqid();
        $this->editorId = $editorId;
        $this->name = $name;
        $this->class = $class;
        $this->style = $style;
    }

    /**
     * Render the Livewire component view.
     *
     * @return View The view instance for the CKEditor5 UI part component
     */
    public function render(): View
    {
        return view('ckeditor5::livewire.ckeditor5-ui-part');
    }
}
