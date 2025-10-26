<?php

namespace Mati365\CKEditor5Livewire\Components;

use Livewire\Component;
use Illuminate\View\View;
use Livewire\Attributes\Modelable;
use Mati365\CKEditor5Livewire\Config;
use Mati365\CKEditor5Livewire\Preset\{EditorType, Preset, PresetParser};
use Mati365\CKEditor5Livewire\Utils\LanguageNormalizer;

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
    #[Modelable]
    public mixed $content;

    /**
     * Whether the editor is currently focused.
     * Updated by the JavaScript side when focus changes.
     */
    public bool $focused = false;

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
     * CSS class for the main wrapper element.
     */
    public ?string $class = null;

    /**
     * Inline styles for the main wrapper element.
     */
    public ?string $style = null;

    /**
     * The language configuration for the editor UI and content.
     *
     * @var array{ui: string, content: string}
     */
    public array $language;

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
     * @param Preset|string $presetName Preset instance or preset name
     * @param string|array<string, string>|null $content Initial content for the editor
     * @param ?string $editorId Unique identifier for the editor instance
     * @param ?array $config Configuration array for CKEditor5. It'll override the preset config if provided.
     * @param ?array $mergeConfig Configuration array to be merged with the preset config if provided.
     * @param ?array $customTranslations Custom translations dictionary. It'll override the preset customTranslations if provided.
     * @param string|null $editorType Editor type. It'll override the preset editorType if provided.
     * @param bool $watchdog Whether to use watchdog for automatic crash recovery
     * @param ?string $contextId Identifier of the CKEditor context for shared contexts
     * @param int $saveDebounceMs Debounce time in milliseconds for saving content changes
     * @param ?int $editableHeight Fixed height for the editor's content area in pixels
     * @param array{ui?: string, content?: string}|string|null $locale Language configuration for UI and content
     * @param ?string $name Name attribute for the hidden input field (if form submission is needed)
     * @param bool $required Whether the hidden input is required
     * @param ?string $class CSS class for the main wrapper element
     * @param ?string $style Inline styles for the main wrapper element
     * @return void
     */
    public function mount(
        Preset|string $presetName = 'default',
        array|string|null $content = null,
        ?string $editorId = null,
        ?array $config = null,
        ?array $mergeConfig = null,
        ?array $customTranslations = null,
        EditorType|string|null $editorType = null,
        bool $watchdog = false,
        ?string $contextId = null,
        int $saveDebounceMs = 300,
        ?int $editableHeight = null,
        array|string|null $locale = null,
        ?string $name = null,
        bool $required = false,
        ?string $class = null,
        ?string $style = null
    ): void {
        $resolvedPreset = $this->configService->resolvePresetOrThrow($presetName);

        if ($config !== null) {
            $resolvedPreset = $resolvedPreset->ofConfig($config);
        }

        if ($mergeConfig !== null) {
            $resolvedPreset = $resolvedPreset->ofMergedConfig($mergeConfig);
        }

        if ($customTranslations !== null) {
            $resolvedPreset = $resolvedPreset->ofCustomTranslations($customTranslations);
        }

        if ($editorType !== null) {
            $resolvedPreset = $resolvedPreset->ofEditorType(
                EditorType::from($editorType)
            );
        }

        if ($content !== null) {
            if (is_string($content)) {
                $this->content = [ 'main' => $content ];
            } else {
                $this->content = $content;
            }
        }

        $this->editorId = $editorId ?? 'ckeditor-' . uniqid();
        $this->preset = PresetParser::dump($resolvedPreset);
        $this->watchdog = $watchdog;
        $this->contextId = $contextId;
        $this->saveDebounceMs = $saveDebounceMs;
        $this->editableHeight = $editableHeight;
        $this->name = $name;
        $this->required = $required;
        $this->language = LanguageNormalizer::normalize($locale);
        $this->class = $class;
        $this->style = $style;
    }

    /**
     * Called when the focused property is updated.
     * Dispatches an event to the parent component with the new focused state.
     *
     * @param bool $value The new focused state
     * @return void
     */
    public function updatedFocused(bool $value): void
    {
        $this->dispatch(
            'editor-focus-changed',
            editorId: $this->editorId,
            focused: $value
        );
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
