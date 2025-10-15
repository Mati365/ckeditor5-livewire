<?php

namespace Mati365\CKEditor5Livewire\Components;

use Livewire\Component;
use Illuminate\View\View;
use Mati365\CKEditor5Livewire\Config;
use Mati365\CKEditor5Livewire\Context\{Context, ContextParser};
use Mati365\CKEditor5Livewire\Utils\LanguageNormalizer;

/**
 * Livewire component for CKEditor5 context.
 *
 * This component allows creating a shared context for multiple CKEditor instances.
 * Context provides shared configuration and plugins that can be reused across editors.
 * The context is resolved from the configuration file using the context name.
 *
 * @psalm-suppress MissingConstructor
 */
final class CKEditor5Context extends Component
{
    /**
     * Unique identifier for the context instance.
     * Generated automatically to ensure multiple contexts can coexist on the same page.
     */
    public string $contextId;

    /**
     * CSS class for the context wrapper element.
     */
    public ?string $class = null;

    /**
     * Inline styles for the context wrapper element.
     */
    public ?string $style = null;

    /**
     * Public serializable context dump for the view/JS and Livewire snapshot.
     * Stored as array so Livewire will include it in `wire:snapshot`.
     */
    public array $context = [];

    /**
     * The language configuration for the editor UI and content.
     *
     * @var array{ui: string, content: string}
     */
    public array $language;

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
     *
     * @param Context|string $context Context instance or context name
     * @param ?string $contextId Unique identifier for the context instance
     * @param ?array $config Configuration array for CKEditor5 context. It'll override the context config if provided.
     * @param ?array $watchdogConfig Configuration for the watchdog. It'll override the context watchdogConfig if provided.
     * @param ?array $customTranslations Custom translations dictionary. It'll override the context customTranslations if provided.
     * @param array{ui?: string, content?: string}|string|null $locale Language configuration for UI and content
     * @param ?string $class CSS class for the wrapper element
     * @param ?string $style Inline styles for the wrapper element
     * @return void
     */
    public function mount(
        Context|string $contextName = 'default',
        ?string $contextId = null,
        ?array $config = null,
        ?array $watchdogConfig = null,
        ?array $customTranslations = null,
        array|string|null $locale = null,
        ?string $class = null,
        ?string $style = 'display: none;'
    ): void {
        $resolvedContext = $this->configService->resolveContextOrThrow($contextName);

        if (isset($config)) {
            $resolvedContext = $resolvedContext->ofConfig($config);
        }

        if (isset($watchdogConfig)) {
            $resolvedContext = $resolvedContext->ofWatchdogConfig($watchdogConfig);
        }

        if (isset($customTranslations)) {
            $resolvedContext = $resolvedContext->ofCustomTranslations($customTranslations);
        }

        $this->contextId = $contextId ?? 'ckeditor-context-' . uniqid();
        $this->context = ContextParser::dump($resolvedContext);
        $this->language = LanguageNormalizer::normalize($locale);
        $this->class = $class;
        $this->style = $style;
    }

    /**
     * Render the Livewire component view.
     *
     * @return View The view instance for the CKEditor5 context component
     */
    public function render(): View
    {
        return view('ckeditor5::livewire.ckeditor5-context');
    }
}
