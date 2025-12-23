<?php

namespace Mati365\CKEditor5Livewire\Tests\Feature\Components;

use Mati365\CKEditor5Livewire\Tests\TestCase;
use Mati365\CKEditor5Livewire\Components\CKEditor5Assets;

class CKEditor5AssetsTest extends TestCase
{
    protected function defineEnvironment($app): void
    {
        parent::defineEnvironment($app);

        // Configure a preset with cloud configuration
        $app['config']->set('ckeditor5.presets.default', [
            'config' => ['toolbar' => ['bold', 'italic']],
            'editorType' => 'classic',
            'cloud' => [
                'editorVersion' => '43.3.1',
                'premium' => false,
                'translations' => ['en'],
            ],
        ]);

        $app['config']->set('ckeditor5.presets.premium', [
            'config' => ['toolbar' => ['bold', 'italic']],
            'editorType' => 'classic',
            'cloud' => [
                'editorVersion' => '43.3.1',
                'premium' => true,
                'translations' => ['en', 'pl'],
            ],
        ]);
    }

    public function testComponentCanBeRendered(): void
    {
        $component = $this->app->make(CKEditor5Assets::class);

        $view = $component->render();

        $this->assertNotNull($view);
        $this->assertSame('ckeditor5::components.assets', $view->name());
    }

    public function testComponentWithDefaultPreset(): void
    {
        $component = $this->app->make(CKEditor5Assets::class, [
            'preset' => 'default',
        ]);

        $view = $component->render();
        $data = $view->getData();

        $this->assertArrayHasKey('bundle', $data);
        $this->assertArrayHasKey('nonce', $data);
    }

    public function testComponentWithNonce(): void
    {
        $component = $this->app->make(CKEditor5Assets::class, [
            'preset' => 'default',
            'nonce' => 'test-nonce-123',
        ]);

        $view = $component->render();
        $data = $view->getData();

        $this->assertSame('test-nonce-123', $data['nonce']);
    }

    public function testComponentWithOverriddenEditorVersion(): void
    {
        $component = $this->app->make(CKEditor5Assets::class, [
            'preset' => 'default',
            'editorVersion' => '44.0.0',
        ]);

        $view = $component->render();
        $data = $view->getData();

        $this->assertArrayHasKey('bundle', $data);
        $bundle = $data['bundle'];

        $jsUrls = array_map(fn($asset) => $asset->url, $bundle->js);
        $allJsUrls = implode(' ', $jsUrls);
        $this->assertStringContainsString('44.0.0', $allJsUrls);
    }

    public function testComponentWithOverriddenPremiumFlag(): void
    {
        $component = $this->app->make(CKEditor5Assets::class, [
            'preset' => 'default',
            'premium' => true,
        ]);

        $view = $component->render();
        $data = $view->getData();

        $this->assertArrayHasKey('bundle', $data);
        $bundle = $data['bundle'];

        $jsUrls = array_map(fn($asset) => $asset->url, $bundle->js);
        $allJsUrls = implode(' ', $jsUrls);
        $this->assertStringContainsString('ckeditor5-premium-features', $allJsUrls);
    }

    public function testComponentWithOverriddenTranslations(): void
    {
        $component = $this->app->make(CKEditor5Assets::class, [
            'preset' => 'default',
            'translations' => ['pl', 'de', 'fr'],
        ]);

        $view = $component->render();
        $data = $view->getData();

        $this->assertArrayHasKey('bundle', $data);
        $bundle = $data['bundle'];

        $jsUrls = array_map(fn($asset) => $asset->url, $bundle->js);
        $allJsUrls = implode(' ', $jsUrls);
        $this->assertStringContainsString('pl', $allJsUrls);
        $this->assertStringContainsString('de', $allJsUrls);
        $this->assertStringContainsString('fr', $allJsUrls);
    }

    public function testComponentWithCKBox(): void
    {
        $component = $this->app->make(CKEditor5Assets::class, [
            'preset' => 'default',
            'ckboxVersion' => '2.6.1',
            'ckboxTheme' => 'lark',
        ]);

        $view = $component->render();
        $data = $view->getData();

        $this->assertArrayHasKey('bundle', $data);
        $bundle = $data['bundle'];

        $jsUrls = array_map(fn($asset) => $asset->url, $bundle->js);
        $allJsUrls = implode(' ', $jsUrls);
        $this->assertStringContainsString('ckbox', $allJsUrls);
        $this->assertStringContainsString('2.6.1', $allJsUrls);
    }

    public function testComponentWithCKBoxDefaultTheme(): void
    {
        $component = $this->app->make(CKEditor5Assets::class, [
            'preset' => 'default',
            'ckboxVersion' => '2.6.1',
        ]);

        $view = $component->render();
        $data = $view->getData();

        $this->assertArrayHasKey('bundle', $data);
        $bundle = $data['bundle'];

        $jsUrls = array_map(fn($asset) => $asset->url, $bundle->js);
        $allJsUrls = implode(' ', $jsUrls);
        $this->assertStringContainsString('ckbox', $allJsUrls);
    }

    public function testComponentWithPremiumPreset(): void
    {
        $component = $this->app->make(CKEditor5Assets::class, [
            'preset' => 'premium',
        ]);

        $view = $component->render();
        $data = $view->getData();

        $this->assertArrayHasKey('bundle', $data);
        $bundle = $data['bundle'];

        $jsUrls = array_map(fn($asset) => $asset->url, $bundle->js);
        $allJsUrls = implode(' ', $jsUrls);
        $this->assertStringContainsString('ckeditor5-premium-features', $allJsUrls);
    }

    public function testComponentThrowsExceptionWhenCloudConfigurationMissing(): void
    {
        config(['ckeditor5.presets.no-cloud' => [
            'config' => ['toolbar' => ['bold']],
            'editorType' => 'classic',
        ]]);

        $component = $this->app->make(CKEditor5Assets::class, [
            'preset' => 'no-cloud',
        ]);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Cannot render CKEditor5 assets without cloud configuration.');

        $component->render();
    }

    public function testComponentWithMultipleOverrides(): void
    {
        $component = $this->app->make(CKEditor5Assets::class, [
            'preset' => 'default',
            'editorVersion' => '44.0.0',
            'premium' => true,
            'translations' => ['pl', 'de'],
            'ckboxVersion' => '2.6.1',
            'ckboxTheme' => 'lark',
            'nonce' => 'secure-nonce',
        ]);

        $view = $component->render();
        $data = $view->getData();

        $this->assertSame('secure-nonce', $data['nonce']);
        $this->assertArrayHasKey('bundle', $data);
        $bundle = $data['bundle'];

        $jsUrls = array_map(fn($asset) => $asset->url, $bundle->js);
        $allJsUrls = implode(' ', $jsUrls);
        $this->assertStringContainsString('44.0.0', $allJsUrls);
        $this->assertStringContainsString('ckeditor5-premium-features', $allJsUrls);
        $this->assertStringContainsString('ckbox', $allJsUrls);
    }
}
