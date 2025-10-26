<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Cloud\CKEditor;

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\UsesClass;
use Mati365\CKEditor5Livewire\Cloud\CKEditor\CKEditorCloudBundleBuilder;
use Mati365\CKEditor5Livewire\Cloud\Bundle\AssetsBundle;
use Mati365\CKEditor5Livewire\Cloud\Bundle\JSAsset;
use Mati365\CKEditor5Livewire\Cloud\Bundle\JSAssetType;

#[CoversClass(CKEditorCloudBundleBuilder::class)]
#[UsesClass(AssetsBundle::class)]
#[UsesClass(JSAsset::class)]
class CKEditorCloudBundleBuilderTest extends TestCase
{
    public function testBuildWithoutTranslations(): void
    {
        $bundle = CKEditorCloudBundleBuilder::build('36.0.0');

        $this->assertInstanceOf(AssetsBundle::class, $bundle);
        $this->assertCount(1, $bundle->js);
        $this->assertCount(1, $bundle->css);

        $this->assertSame('ckeditor5', $bundle->js[0]->name);
        $this->assertStringContainsString('36.0.0', $bundle->js[0]->url);
        $this->assertSame(JSAssetType::ESM, $bundle->js[0]->type);

        $this->assertStringContainsString('ckeditor5.css', $bundle->css[0]);
        $this->assertStringContainsString('36.0.0', $bundle->css[0]);
    }

    public function testBuildWithTranslations(): void
    {
        $bundle = CKEditorCloudBundleBuilder::build('36.0.0', ['pl', 'en']);

        $this->assertCount(3, $bundle->js); // main + 2 translations
        $this->assertCount(1, $bundle->css);

        // Check main script
        $this->assertSame('ckeditor5', $bundle->js[0]->name);

        // Check translation scripts
        $this->assertStringContainsString('translations/pl.js', $bundle->js[1]->url);
        $this->assertSame('ckeditor5/translations/pl.js', $bundle->js[1]->name);
        $this->assertSame(JSAssetType::ESM, $bundle->js[1]->type);

        $this->assertStringContainsString('translations/en.js', $bundle->js[2]->url);
        $this->assertSame('ckeditor5/translations/en.js', $bundle->js[2]->name);
        $this->assertSame(JSAssetType::ESM, $bundle->js[2]->type);
    }

    public function testCDNBaseURL(): void
    {
        $this->assertSame(
            'https://cdn.ckeditor.com/',
            CKEditorCloudBundleBuilder::CDN_BASE_URL
        );
    }

    public function testBuildURLFormat(): void
    {
        $bundle = CKEditorCloudBundleBuilder::build('37.1.0');

        $expectedJSUrl = 'https://cdn.ckeditor.com/ckeditor5/37.1.0/ckeditor5.js';
        $expectedCSSUrl = 'https://cdn.ckeditor.com/ckeditor5/37.1.0/ckeditor5.css';

        $this->assertSame($expectedJSUrl, $bundle->js[0]->url);
        $this->assertSame($expectedCSSUrl, $bundle->css[0]);
    }
}
