<?php

namespace Mati365\CKEditor5Livewire\Components;

use Livewire\Component;
use Illuminate\Contracts\View\View;
use Livewire\Attributes\Modelable;
use Livewire\Attributes\Reactive;

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
    public string $rootName = 'main';

    /**
     * The initial content value for the editable.
     *
     * @var string|null The initial HTML content for this editable root, e.g., '<p>Initial content</p>'
     */
    #[Modelable]
    public ?string $content = null;

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
    #[Reactive]
    public ?string $class = null;

    /**
     * Inline styles for the editable wrapper element.
     */
    #[Reactive]
    public ?string $style = null;

    /**
     * CSS class for the editable content element.
     */
    #[Reactive]
    public ?string $editableClass = null;

    /**
     * Inline styles for the editable content element.
     */
    #[Reactive]
    public ?string $editableStyle = null;

    /**
     * Root attributes to apply to the editable root.
     *
     * @var array<string, mixed>
     */
    #[Reactive]
    public ?array $rootAttributes = null;

    /**
     * The root model element name for editable. Setting `$inlineRoot`
     * allows to use editor in paragraph-like mode.
     */
    public string $modelElement = '$root';

    /**
     * The debounce time in milliseconds for saving content changes.
     * Prevents excessive updates by delaying the save operation.
     */
    public int $saveDebounceMs = 300;

    /**
     * Mount method called when the component is initialized.
     *
     * @param string $editorId The identifier of the editor instance
     * @param ?string $rootName The name of the root element
     * @param ?string $content The initial content for the editable
     * @param ?string $id Unique identifier for the editable instance
     * @param ?string $name Name attribute for the hidden input field
     * @param ?bool $required Whether the hidden input is required
     * @param ?string $class CSS class for the wrapper element
     * @param ?string $style Inline styles for the wrapper element
     * @param ?string $editableClass CSS class for the editable content element
     * @param ?string $editableStyle Inline styles for the editable content element
     * @param ?int $saveDebounceMs Debounce time in milliseconds for saving content changes
     * @param ?array<string, mixed> $rootAttributes Root attributes to apply to the editable root
     * @param ?string $modelElement Root model element name for root.
     * @return void
     */
    public function mount(
        string $editorId,
        ?string $rootName = null,
        ?string $content = null,
        ?string $id = null,
        ?string $name = null,
        ?bool $required = null,
        ?string $class = null,
        ?string $style = null,
        ?string $editableClass = null,
        ?string $editableStyle = null,
        ?array $rootAttributes = null,
        ?string $modelElement = null,
        ?int $saveDebounceMs = null,
    ): void {
        $this->id = $id ?? 'ckeditor-editable-' . uniqid();
        $this->editorId = $editorId;
        $this->rootName = $rootName ?? $this->rootName;
        $this->name = $name;
        $this->required = $required ?? $this->required;
        $this->class = $class;
        $this->style = $style;
        $this->editableClass = $editableClass;
        $this->editableStyle = $editableStyle;
        $this->rootAttributes = $rootAttributes;
        $this->saveDebounceMs = $saveDebounceMs ?? $this->saveDebounceMs;
        $this->modelElement = $modelElement ?? $this->modelElement;

        if ($content !== null) {
            $this->content = $content;
        }
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
