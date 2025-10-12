<?php

namespace Mati365\CKEditor5Livewire;

use Illuminate\Support\Facades\Blade;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Config\Repository as ConfigRepository;
use Livewire\Livewire;
use Mati365\CKEditor5Livewire\Components\{CKEditor5, CKEditor5Assets, CKEHiddenInput};

final class ServiceProvider extends \Illuminate\Support\ServiceProvider
{
    /**
     * Register package services.
     */
    #[\Override]
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../config/config.php', 'ckeditor5');

        $this->app->singleton(Config::class, function (Application $app): Config {
            return new Config($app->make(ConfigRepository::class));
        });
    }

    /**
     * Boot the package services.
     */
    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'ckeditor5');

        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__ . '/../config/config.php' => config_path('ckeditor5.php'),
            ], 'ckeditor5-config');

            $this->publishes([
                __DIR__ . '/../resources/views' => resource_path('views/vendor/ckeditor5/views'),
            ], 'ckeditor5-views');
        }

        Livewire::component('ckeditor5', CKEditor5::class);
        Blade::component('ckeditor5-assets', CKEditor5Assets::class);
        Blade::component('ckeditor5-hidden-input', CKEHiddenInput::class);
    }
}
