<?php

namespace Mati365\CKEditor5Livewire\Components;

use Illuminate\View\{Component, View};

/**
 * Blade component for rendering a hidden input field.
 *
 * This component creates a visually hidden input that maintains accessibility
 * and form integration while being invisible to users.
 *
 * @psalm-suppress PropertyNotSetInConstructor
 */
final class CKEHiddenInput extends Component
{
    /**
     * The ID of the hidden input.
     */
    public string $id;

    /**
     * The name of the hidden input.
     */
    public string $name;

    /**
     * The value of the hidden input.
     */
    public string $value;

    /**
     * Whether the input is required.
     */
    public bool $required;

    /**
     * Create a new component instance.
     *
     * @param string $id The ID of the hidden input
     * @param string $name The name of the hidden input
     * @param string $value The value of the hidden input
     * @param bool $required Whether the input is required
     */
    public function __construct(
        string $id,
        string $name,
        string $value = '',
        bool $required = false
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->value = $value;
        $this->required = $required;
    }

    /**
     * Get the inline styles for the hidden input.
     *
     * @return string
     */
    public function getStyles(): string
    {
        return 'display: flex; width: 100%; height: 1px; opacity: 0; pointer-events: none; margin: 0; padding: 0; border: none;';
    }

    /**
     * Get the view / contents that represent the component.
     *
     * @return View
     */
    #[\Override]
    public function render(): View
    {
        return view('ckeditor5::components.hidden-input');
    }
}
