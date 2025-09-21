<?php

namespace Mati365\CKEditor5Livewire;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;
use Illuminate\Contracts\Foundation\Application;
use Livewire\Livewire;
use Mati365\CKEditor5Livewire\Components\CKEditor5;

final class CKEditor5ServiceProvider extends ServiceProvider
{
    /**
     * Register package services.
     */
    #[\Override]
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/config.php', 'ckeditor5');

        $this->app->singleton(CKEditor5Config::class, function (Application $app): CKEditor5Config {
            return new CKEditor5Config($app->make('config'));
        });
    }

    /**
     * Boot the package services.
     */
    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'ckeditor5');

        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__.'/../config/config.php' => config_path('ckeditor5.php'),
            ], 'ckeditor5-config');

            $this->publishes([
                __DIR__.'/../resources/views' => resource_path('views/vendor/ckeditor5/views'),
            ], 'ckeditor5-views');
        }

        Livewire::component('ckeditor5', CKEditor5::class);
        Blade::directive('ckeditor5Assets', fn () => "<?php echo view('ckeditor5::assets'); ?>");
    }
}
