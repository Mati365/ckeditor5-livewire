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
     *
     * @var array<string, string> Content sections, e.g., ['main' => '<p>Initial content</p>']
     */
    public array $content;

    /**
     * Unique identifier for the editor instance.
     * Generated automatically to ensure multiple editors can coexist on the same page.
     */
    public string $editorId;

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
     * Whether to use a watchdog for the CKEditor5 instance.
     * Watchdog helps recover from crashes by automatically restarting the editor.
     */
    public bool $watchdog = false;

    /**
     * The identifier of the CKEditor context.
     * Allows multiple editors to share a common context for better performance.
     */
    public ?string $contextId = null;

    /**
     * The debounce time in milliseconds for saving content changes.
     * Prevents excessive updates by delaying the save operation.
     */
    public int $saveDebounceMs = 300;

    /**
     * The height of the editable area, if specified.
     * Sets a fixed height for the editor's content area in pixels.
     */
    public ?int $editableHeight = null;

    /**
     * The language configuration for the editor UI and content.
     *
     * @var array{ui: string, content: string}
     */
    public array $language = [
        'ui' => 'en',
        'content' => 'en',
    ];

    /**
     * Configuration for which events should be forwarded to Livewire.
     *
     * @var array{change: bool, focus: bool, blur: bool}
     */
    public array $events = [
        'change' => true,
        'focus' => false,
        'blur' => false,
    ];

    /**
     * Public serializable preset dump for the view/JS and Livewire snapshot.
     * Stored as array so Livewire will include it in `wire:snapshot`.
     */
    public array $preset = [];

    /**
     * Configuration manager instance for handling CKEditor5 settings.
     * Injected via dependency injection in the boot method.
     */
    private Config $configService;

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
     * @param array<string, string> $content Initial content for the editor
     * @param Preset|string $preset Preset instance or preset name
     * @param ?string $editorId Unique identifier for the editor instance
     * @param ?array $config Configuration array for CKEditor5. It'll override the preset config if provided.
     * @param bool $watchdog Whether to use watchdog for automatic crash recovery
     * @param ?string $contextId Identifier of the CKEditor context for shared contexts
     * @param int $saveDebounceMs Debounce time in milliseconds for saving content changes
     * @param ?int $editableHeight Fixed height for the editor's content area in pixels
     * @param array{ui?: string, content?: string} $language Language configuration for UI and content
     * @param array{change?: bool, focus?: bool, blur?: bool} $events Events to forward to Livewire
     * @param ?string $name Name attribute for the hidden input field (if form submission is needed)
     * @param bool $required Whether the hidden input is required
     * @return void
     */
    public function mount(
        array $content = ['main' => ''],
        Preset|string $preset = 'default',
        ?string $editorId = null,
        ?array $config = null,
        bool $watchdog = false,
        ?string $contextId = null,
        int $saveDebounceMs = 300,
        ?int $editableHeight = null,
        array $language = [],
        array $events = [],
        ?string $name = null,
        bool $required = false
    ): void {
        $resolvedPreset = $this->configService->resolvePresetOrThrow($preset);

        if (isset($config)) {
            $resolvedPreset = $resolvedPreset->ofConfig($config);
        }

        $this->editorId = $editorId ?? 'ckeditor-' . uniqid();
        $this->content = $content;
        $this->preset = PresetParser::dump($resolvedPreset);
        $this->watchdog = $watchdog;
        $this->contextId = $contextId;
        $this->saveDebounceMs = $saveDebounceMs;
        $this->editableHeight = $editableHeight;
        $this->name = $name;
        $this->required = $required;

        // Merge with defaults
        $this->language = array_merge($this->language, $language);
        $this->events = array_merge($this->events, $events);
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
