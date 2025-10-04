<?php

namespace Mati365\CKEditor5Livewire\Components;

use Livewire\Component;
use Illuminate\View\View;
use Mati365\CKEditor5Livewire\Config;
use Mati365\CKEditor5Livewire\Preset\{Preset, EditorType};

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
     */
    public string $content = '';

    /**
     * The preset configuration for the CKEditor5 instance.
     */
    public Preset $preset;

    /**
     * Unique identifier for the editor instance.
     * Generated automatically to ensure multiple editors can coexist on the same page.
     */
    public ?string $editorId = null;

    /**
     * Configuration manager instance for handling CKEditor5 settings.
     * Injected via dependency injection in the boot method.
     */
    protected Config $configService;

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

        $this->content = $content;
        $this->preset = $resolvedPreset;
        $this->editorId = 'ckeditor-' . uniqid();
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
