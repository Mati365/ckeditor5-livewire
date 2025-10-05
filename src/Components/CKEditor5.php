<?php

namespace Mati365\CKEditor5Livewire\Components;

use Livewire\Component;
use Illuminate\View\View;
use Mati365\CKEditor5Livewire\Config;
use Mati365\CKEditor5Livewire\Preset\{Preset, EditorType};
use Mati365\CKEditor5Livewire\Preset\PresetParser;

/**
 * Livewire component for integrating CKEditor5.
 *
 * @psalm-suppress MissingConstructor
 */
final class CKEditor5 extends Component
{
    /**
     * The content of the CKEditor5 instance.
     * This property is bound to Livewire and will trigger updates when changed.
     * Made public so Livewire can serialize and bind it to the frontend.
     */
    public string $content = '';


    /**
     * Unique identifier for the editor instance.
     * Generated automatically to ensure multiple editors can coexist on the same page.
     */
    public ?string $editorId = null;

    /**
     * Public serializable preset dump for the view/JS and Livewire snapshot.
     * Stored as array so Livewire will include it in `wire:snapshot`.
     */
    public array $serializedPreset = [];

    /**
     * Configuration manager instance for handling CKEditor5 settings.
     * Injected via dependency injection in the boot method.
     */
    private Config $configService;

    /**
     * Internal preset object (kept private).
     * Livewire cannot reliably serialize complex objects for the view, so
     * we expose a serializable representation via `presetForView()`.
     */
    private Preset $preset;

    /**
     * Boot method called by Livewire to inject dependencies.
     *
     * @param Config $configService The configuration manager for CKEditor5
     * @return void
     */
    public function boot(Config $configService): void
    {
        $this->configService = $configService;
    }

    /**
     * Mount method called when the component is initialized.
     * Sets up the initial content, configuration, and generates a unique editor ID.
     *
     * @param string $content Initial content for the editor
     * @param Preset|string $preset Preset instance or preset name
     * @param array $config Configuration array for CKEditor5. It'll override the preset config if provided.
     * @return void
     */
    public function mount(
        string $content = '',
        Preset|string $preset = 'default',
        ?array $config = null
    ): void {
        $resolvedPreset = $this->configService->resolvePresetOrThrow($preset);

        if (isset($config)) {
            $resolvedPreset = $resolvedPreset->ofConfig($config);
        }

        $this->editorId = 'ckeditor-' . uniqid();
        $this->content = $content;
        $this->preset = $resolvedPreset;
        $this->serializedPreset = PresetParser::dump($this->preset);
    }

    /**
     * Livewire lifecycle hook triggered when the content property is updated.
     * Dispatches a 'content-changed' event with the new content value.
     *
     * @param string $value The new content value
     * @return void
     */
    public function updatedContent(string $value): void
    {
        $this->dispatch('content-changed', $value);
    }

    /**
     * Render the Livewire component view.
     * Returns the CKEditor5 Blade template for rendering in the browser.
     *
     * @return View The view instance for the CKEditor5 component
     */
    public function render(): View
    {
        return view('ckeditor5::livewire.ckeditor5');
    }
}
