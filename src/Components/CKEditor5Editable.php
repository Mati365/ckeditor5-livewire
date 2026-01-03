<?php

namespace Mati365\CKEditor5Livewire\Components;

use Livewire\Component;
use Illuminate\View\View;

/**
 * Livewire component for CKEditor5 editable root.
 *
 * This component allows creating additional editable roots for multi-root editors.
 * Each editable can have its own content and synchronize with a hidden input for form submission.
 *
 * @psalm-suppress MissingConstructor
 */
final class CKEditor5Editable extends Component
{
    /**
     * The identifier of the editor instance this editable belongs to.
     */
    public string $editorId;

    /**
     * The name of the root element in the editor.
     * This is used to identify the editable root in the multi-root editor.
     */
    public string $rootName;

    /**
     * The initial content value for the editable.
     */
    public ?string $content;

    /**
     * The name attribute for the hidden input field.
     * If provided, a hidden input will be rendered for form submission.
     */
    public ?string $name = null;

    /**
     * Whether the hidden input is required.
     */
    public bool $required = false;

    /**
     * Unique identifier for the editable instance.
     * Generated automatically to ensure multiple editables can coexist on the same page.
     */
    public string $id;

    /**
     * CSS class for the editable wrapper element.
     */
    public ?string $class = null;

    /**
     * Inline styles for the editable wrapper element.
     */
    public ?string $style = null;

    /**
     * CSS class for the editable content element.
     */
    public ?string $editableClass = null;

    /**
     * Inline styles for the editable content element.
     */
    public ?string $editableStyle = null;

    /**
     * The debounce time in milliseconds for saving content changes.
     * Prevents excessive updates by delaying the save operation.
     */
    public int $saveDebounceMs = 300;

    /**
     * Mount method called when the component is initialized.
     *
     * @param string $editorId The identifier of the editor instance
     * @param string $rootName The name of the root element
     * @param ?string $content The initial content for the editable
     * @param ?string $id Unique identifier for the editable instance
     * @param ?string $name Name attribute for the hidden input field
     * @param bool $required Whether the hidden input is required
     * @param ?string $class CSS class for the wrapper element
     * @param ?string $style Inline styles for the wrapper element
     * @param ?string $editableClass CSS class for the editable content element
     * @param ?string $editableStyle Inline styles for the editable content element
     * @param int $saveDebounceMs Debounce time in milliseconds for saving content changes
     * @return void
     */
    public function mount(
        string $editorId,
        string $rootName = 'main',
        ?string $content = null,
        ?string $id = null,
        ?string $name = null,
        bool $required = false,
        ?string $class = null,
        ?string $style = null,
        ?string $editableClass = null,
        ?string $editableStyle = null,
        int $saveDebounceMs = 300,
    ): void {
        $this->id = $id ?? 'ckeditor-editable-' . uniqid();
        $this->editorId = $editorId;
        $this->rootName = $rootName;
        $this->content = $content;
        $this->name = $name;
        $this->required = $required;
        $this->class = $class;
        $this->style = 'position: relative;' . ($style !== null ? ' ' . $style : '');
        $this->editableClass = $editableClass;
        $this->editableStyle = $editableStyle;
        $this->saveDebounceMs = $saveDebounceMs;
    }

    /**
     * Render the Livewire component view.
     *
     * @return View The view instance for the CKEditor5 editable component
     */
    public function render(): View
    {
        return view('ckeditor5::livewire.ckeditor5-editable');
    }
}
