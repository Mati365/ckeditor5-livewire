<?php

namespace Mati365\CKEditor5Livewire\Tests\Feature\Components;

use Livewire\Livewire;
use Mati365\CKEditor5Livewire\Tests\TestCase;
use Mati365\CKEditor5Livewire\Components\CKEditor5Context;

class CKEditor5ContextTest extends TestCase
{
    public function testComponentCanBeRendered(): void
    {
        $component = Livewire::test(CKEditor5Context::class)
            ->assertOk();

        $this->assertNotNull($component);
    }

    public function testComponentMountWithContextName(): void
    {
        config(['ckeditor5.contexts.default' => [
            'config' => ['plugins' => ['Plugin1']],
        ]]);

        $component = Livewire::test(CKEditor5Context::class, [
            'contextName' => 'default',
        ]);

        $this->assertNotEmpty($component->context);
        $this->assertSame(['plugins' => ['Plugin1']], $component->context['config']);
    }

    public function testComponentGeneratesUniqueContextId(): void
    {
        config(['ckeditor5.contexts.default' => [
            'config' => ['plugins' => []],
        ]]);

        $component1 = Livewire::test(CKEditor5Context::class);
        $component2 = Livewire::test(CKEditor5Context::class);

        $this->assertNotSame($component1->contextId, $component2->contextId);
    }

    public function testComponentMountWithCustomContextId(): void
    {
        config(['ckeditor5.contexts.default' => [
            'config' => ['plugins' => []],
        ]]);

        $component = Livewire::test(CKEditor5Context::class, [
            'contextId' => 'custom-context-123',
        ]);

        $this->assertSame('custom-context-123', $component->contextId);
    }

    public function testComponentMountWithCustomConfig(): void
    {
        config(['ckeditor5.contexts.default' => [
            'config' => ['plugins' => ['Plugin1']],
        ]]);

        $customConfig = ['plugins' => ['Plugin2', 'Plugin3']];

        $component = Livewire::test(CKEditor5Context::class, [
            'config' => $customConfig,
        ]);

        $this->assertSame($customConfig, $component->context['config']);
    }

    public function testComponentMountWithWatchdogConfig(): void
    {
        config(['ckeditor5.contexts.default' => [
            'config' => ['plugins' => []],
        ]]);

        $watchdogConfig = ['crashNumberLimit' => 5];

        $component = Livewire::test(CKEditor5Context::class, [
            'watchdogConfig' => $watchdogConfig,
        ]);

        $this->assertSame($watchdogConfig, $component->context['watchdogConfig']);
    }

    public function testComponentMountWithCustomTranslations(): void
    {
        config(['ckeditor5.contexts.default' => [
            'config' => ['plugins' => []],
        ]]);

        $translations = ['Save' => 'Zapisz', 'Cancel' => 'Anuluj'];

        $component = Livewire::test(CKEditor5Context::class, [
            'customTranslations' => $translations,
        ]);

        $this->assertSame($translations, $component->context['customTranslations']);
    }

    public function testComponentMountWithStringLocale(): void
    {
        config(['ckeditor5.contexts.default' => [
            'config' => ['plugins' => []],
        ]]);

        $component = Livewire::test(CKEditor5Context::class, [
            'locale' => 'pl',
        ]);

        $this->assertSame(['ui' => 'pl', 'content' => 'pl'], $component->language);
    }

    public function testComponentMountWithArrayLocale(): void
    {
        config(['ckeditor5.contexts.default' => [
            'config' => ['plugins' => []],
        ]]);

        $component = Livewire::test(CKEditor5Context::class, [
            'locale' => ['ui' => 'en', 'content' => 'pl'],
        ]);

        $this->assertSame(['ui' => 'en', 'content' => 'pl'], $component->language);
    }

    public function testComponentMountWithCssClasses(): void
    {
        config(['ckeditor5.contexts.default' => [
            'config' => ['plugins' => []],
        ]]);

        $component = Livewire::test(CKEditor5Context::class, [
            'class' => 'custom-class',
            'style' => 'color: red;',
        ]);

        $this->assertSame('custom-class', $component->class);
        $this->assertSame('color: red;', $component->style);
    }

    public function testComponentMountWithDefaultStyle(): void
    {
        config(['ckeditor5.contexts.default' => [
            'config' => ['plugins' => []],
        ]]);

        $component = Livewire::test(CKEditor5Context::class);

        $this->assertSame('display: none;', $component->style);
    }

    public function testComponentRenderReturnsView(): void
    {
        config(['ckeditor5.contexts.default' => [
            'config' => ['plugins' => []],
        ]]);

        Livewire::test(CKEditor5Context::class)
            ->assertViewIs('ckeditor5::livewire.ckeditor5-context');
    }
}
