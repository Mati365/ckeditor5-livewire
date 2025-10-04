<?php

namespace Mati365\CKEditor5Livewire\Components;

use Illuminate\View\{View, Component, ComponentAttributeBag};
use Mati365\CKEditor5Livewire\Config;

/**
 * Blade component for including CKEditor5 assets.
 */
final class CKEditor5Assets extends Component
{
    /**
     * Configuration manager instance for handling CKEditor5 settings.
     */
    private Config $configService;

    /**
     * Constructor with dependency injection.
     *
     * @param Config $configService The configuration manager for CKEditor5
     */
    public function __construct(Config $configService)
    {
        $this->componentName = 'ckeditor5-assets';
        $this->attributes = new ComponentAttributeBag();
        $this->configService = $configService;
    }

    /**
     * Render the component view.
     *
     * @return View The view instance for the CKEditor5 assets
     */
    #[\Override]
    public function render(): View
    {
        return view('ckeditor5::components.assets');
    }
}
