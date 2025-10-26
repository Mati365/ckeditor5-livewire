<?php

namespace Mati365\CKEditor5Livewire\Tests;

use Orchestra\Testbench\TestCase as BaseTestCase;
use Mati365\CKEditor5Livewire\ServiceProvider;

abstract class TestCase extends BaseTestCase
{
    protected function getPackageProviders($app): array
    {
        return [
            ServiceProvider::class,
        ];
    }

    protected function defineEnvironment($app): void
    {
        $app['config']->set('app.key', 'base64:' . base64_encode(random_bytes(32)));
    }
}
