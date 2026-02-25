<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Cloud\CKEditor;

use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\Cloud\CKEditor\CKEditorPremiumCloudBundleBuilder;
use Mati365\CKEditor5Livewire\Cloud\Bundle\{JSAssetType, AssetsBundle};

class CKEditorPremiumCloudBundleBuilderTest extends TestCase
{
    public function testBuildWithoutTranslations(): void
    {
        $bundle = CKEditorPremiumCloudBundleBuilder::build(
            '36.0.0',
            'https://cdn.ckeditor.com/'
        );

        $this->assertInstanceOf(AssetsBundle::class, $bundle);
        $this->assertCount(1, $bundle->js);
        $this->assertCount(1, $bundle->css);

        $this->assertSame('ckeditor5-premium-features', $bundle->js[0]->name);
        $this->assertStringContainsString('36.0.0', $bundle->js[0]->url);
        $this->assertStringContainsString('ckeditor5-premium-features', $bundle->js[0]->url);
        $this->assertSame(JSAssetType::ESM, $bundle->js[0]->type);

        $this->assertStringContainsString('ckeditor5-premium-features.css', $bundle->css[0]);
        $this->assertStringContainsString('36.0.0', $bundle->css[0]);
    }

    public function testBuildWithTranslations(): void
    {
        $bundle = CKEditorPremiumCloudBundleBuilder::build(
            '36.0.0',
            'https://cdn.ckeditor.com/',
            ['pl', 'de']
        );

        $this->assertCount(3, $bundle->js); // main + 2 translations
        $this->assertCount(1, $bundle->css);

        // Check main script
        $this->assertSame('ckeditor5-premium-features', $bundle->js[0]->name);

        // Check translation scripts
        $this->assertStringContainsString('translations/pl.js', $bundle->js[1]->url);
        $this->assertSame('ckeditor5-premium-features/translations/pl.js', $bundle->js[1]->name);
        $this->assertSame(JSAssetType::ESM, $bundle->js[1]->type);

        $this->assertStringContainsString('translations/de.js', $bundle->js[2]->url);
        $this->assertSame('ckeditor5-premium-features/translations/de.js', $bundle->js[2]->name);
        $this->assertSame(JSAssetType::ESM, $bundle->js[2]->type);
    }


    public function testBuildURLFormat(): void
    {
        $bundle = CKEditorPremiumCloudBundleBuilder::build('37.1.0', 'https://cdn.ckeditor.com/');

        $expectedJSUrl = 'https://cdn.ckeditor.com/ckeditor5-premium-features/37.1.0/ckeditor5-premium-features.js';
        $expectedCSSUrl = 'https://cdn.ckeditor.com/ckeditor5-premium-features/37.1.0/ckeditor5-premium-features.css';

        $this->assertSame($expectedJSUrl, $bundle->js[0]->url);
        $this->assertSame($expectedCSSUrl, $bundle->css[0]);
    }

    public function testBuildWithCustomCdnUrl(): void
    {
        $custom = 'https://another.cdn/';
        $bundle = CKEditorPremiumCloudBundleBuilder::build('36.0.0', $custom);

        $this->assertStringStartsWith($custom, $bundle->js[0]->url);
        $this->assertStringStartsWith($custom, $bundle->css[0]);
    }
}
