<?php
namespace Mati365\CKEditor5Livewire\Components;

use Illuminate\View\View;
use Illuminate\View\Component;

use Mati365\CKEditor5Livewire\CKEditor5Config;

/**
 * Blade component for including CKEditor5 assets.
 */
final class CKEditor5Assets extends Component
{
    /**
     * Configuration manager instance for handling CKEditor5 settings.
     */
    private CKEditor5Config $configManager;

    /**
     * Constructor with dependency injection.
     *
     * @param CKEditor5Config $configManager The configuration manager for CKEditor5
     */
    public function __construct(CKEditor5Config $configManager)
    {
        $this->configManager = $configManager;
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
