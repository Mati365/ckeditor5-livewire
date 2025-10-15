<?php

namespace Mati365\CKEditor5Livewire\Components;

use Illuminate\View\{View, Component, ComponentAttributeBag};
use Mati365\CKEditor5Livewire\Config;
use Mati365\CKEditor5Livewire\Cloud\CloudBundleBuilder;
use Mati365\CKEditor5Livewire\Cloud\CKBox\CKBox;

/**
 * Blade component for including CKEditor5 assets.
 */
final class CKEditor5Assets extends Component
{
    /**
     * Constructor with dependency injection.
     *
     * @param Config $configService The configuration manager for CKEditor5
     * @param string $preset The preset name to resolve
     * @param ?string $nonce The nonce value for CSP
     * @param ?string $editorVersion Override editor version from preset
     * @param ?bool $premium Override premium flag from preset
     * @param string[]|null $translations Override translations from preset
     * @param ?string $ckboxVersion Override CKBox version (creates CKBox instance if provided)
     * @param ?string $ckboxTheme Override CKBox theme
     */
    public function __construct(
        private Config $configService,
        private string $preset = 'default',
        private ?string $nonce = null,
        private ?string $editorVersion = null,
        private ?bool $premium = null,
        private ?array $translations = null,
        private ?string $ckboxVersion = null,
        private ?string $ckboxTheme = null,
    ) {
        $this->componentName = 'ckeditor5-assets';
        $this->attributes = new ComponentAttributeBag();
    }

    /**
     * Render the component view.
     *
     * @return View The view instance for the CKEditor5 assets
     */
    #[\Override]
    public function render(): View
    {
        $resolvedPreset = $this->configService->resolvePresetOrThrow($this->preset);

        if ($resolvedPreset->cloud == null) {
            throw new \RuntimeException('Cannot render CKEditor5 assets without cloud configuration.');
        }

        $cloud = $resolvedPreset->cloud;

        if ($this->editorVersion !== null) {
            $cloud = $cloud->ofEditorVersion($this->editorVersion);
        }

        if ($this->premium !== null) {
            $cloud = $cloud->ofPremium($this->premium);
        }

        if ($this->translations !== null) {
            $cloud = $cloud->ofTranslations($this->translations);
        }

        if ($this->ckboxVersion !== null) {
            $ckbox = new CKBox(
                version: $this->ckboxVersion,
                theme: $this->ckboxTheme,
            );

            $cloud = $cloud->ofCKBox($ckbox);
        }

        $bundle = CloudBundleBuilder::build($cloud);

        return view('ckeditor5::components.assets')->with([
            'bundle' => $bundle,
            'nonce' => $this->nonce,
        ]);
    }
}
