<?php

namespace Mati365\CKEditor5Livewire\Tests;

use Orchestra\Testbench\TestCase as BaseTestCase;
use Mati365\CKEditor5Livewire\ServiceProvider;
use Livewire\LivewireServiceProvider;

abstract class TestCase extends BaseTestCase
{
    protected function getPackageProviders($app): array
    {
        return [
            LivewireServiceProvider::class,
            ServiceProvider::class,
        ];
    }

    protected function defineEnvironment($app): void
    {
        $app['config']->set('app.key', 'base64:' . base64_encode(random_bytes(32)));

        // Configure CKEditor5 presets and contexts for testing
        $app['config']->set('ckeditor5.presets.default', [
            'config' => ['toolbar' => ['bold', 'italic']],
            'editorType' => 'classic',
        ]);

        $app['config']->set('ckeditor5.contexts.default', [
            'config' => ['plugins' => []],
        ]);
    }
}
