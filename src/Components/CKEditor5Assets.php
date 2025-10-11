<?php

namespace Mati365\CKEditor5Livewire\Components;

use Illuminate\View\{View, Component, ComponentAttributeBag};
use Mati365\CKEditor5Livewire\Config;
use Mati365\CKEditor5Livewire\Cloud\CloudBundleBuilder;

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
     */
    public function __construct(
        private Config $configService,
        private string $preset = 'default',
        private ?string $nonce = null
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

        $bundle = CloudBundleBuilder::build($resolvedPreset->cloud);

        return view('ckeditor5::components.assets')->with(['bundle' => $bundle, 'nonce' => $this->nonce]);
    }
}
