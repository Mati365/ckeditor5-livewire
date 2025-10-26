<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Cloud\CKBox;

use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\Cloud\CKBox\CKBoxCloudBundleBuilder;
use Mati365\CKEditor5Livewire\Cloud\Bundle\{JSAssetType, AssetsBundle};

class CKBoxCloudBundleBuilderTest extends TestCase
{
    public function testBuildWithoutTranslations(): void
    {
        $bundle = CKBoxCloudBundleBuilder::build('2.0.0');

        $this->assertInstanceOf(AssetsBundle::class, $bundle);
        $this->assertCount(1, $bundle->js);
        $this->assertCount(1, $bundle->css);

        $this->assertSame('ckbox', $bundle->js[0]->name);
        $this->assertStringContainsString('2.0.0', $bundle->js[0]->url);
        $this->assertStringContainsString('ckbox.js', $bundle->js[0]->url);
        $this->assertSame(JSAssetType::UMD, $bundle->js[0]->type);

        $this->assertStringContainsString('themes/theme.css', $bundle->css[0]);
        $this->assertStringContainsString('2.0.0', $bundle->css[0]);
    }

    public function testBuildWithCustomTheme(): void
    {
        $bundle = CKBoxCloudBundleBuilder::build('2.0.0', [], 'lark');

        $this->assertStringContainsString('themes/lark.css', $bundle->css[0]);
    }

    public function testBuildWithTranslations(): void
    {
        $bundle = CKBoxCloudBundleBuilder::build('2.0.0', ['pl', 'en']);

        $this->assertCount(3, $bundle->js); // main + 2 translations
        $this->assertCount(1, $bundle->css);

        // Check main script
        $this->assertSame('ckbox', $bundle->js[0]->name);

        // Check translation scripts
        $this->assertStringContainsString('translations/pl.js', $bundle->js[1]->url);
        $this->assertSame('ckbox/translations/pl', $bundle->js[1]->name);
        $this->assertSame(JSAssetType::UMD, $bundle->js[1]->type);

        $this->assertStringContainsString('translations/en.js', $bundle->js[2]->url);
        $this->assertSame('ckbox/translations/en', $bundle->js[2]->name);
        $this->assertSame(JSAssetType::UMD, $bundle->js[2]->type);
    }

    public function testCDNBaseURL(): void
    {
        $this->assertSame(
            'https://cdn.ckbox.io/',
            CKBoxCloudBundleBuilder::CDN_BASE_URL
        );
    }

    public function testBuildURLFormat(): void
    {
        $bundle = CKBoxCloudBundleBuilder::build('2.5.0', [], 'dark');

        $expectedJSUrl = 'https://cdn.ckbox.io/ckbox/2.5.0/ckbox.js';
        $expectedCSSUrl = 'https://cdn.ckbox.io/ckbox/2.5.0/styles/themes/dark.css';

        $this->assertSame($expectedJSUrl, $bundle->js[0]->url);
        $this->assertSame($expectedCSSUrl, $bundle->css[0]);
    }

    public function testBuildWithAllParameters(): void
    {
        $bundle = CKBoxCloudBundleBuilder::build('2.5.0', ['pl', 'de'], 'custom-theme');

        $this->assertCount(3, $bundle->js);
        $this->assertCount(1, $bundle->css);
        $this->assertStringContainsString('custom-theme', $bundle->css[0]);
        $this->assertStringContainsString('translations/pl.js', $bundle->js[1]->url);
        $this->assertStringContainsString('translations/de.js', $bundle->js[2]->url);
    }
}
