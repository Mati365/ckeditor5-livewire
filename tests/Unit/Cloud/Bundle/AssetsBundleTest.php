<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Cloud\Bundle;

use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\Cloud\Bundle\AssetsBundle;
use Mati365\CKEditor5Livewire\Cloud\Bundle\JSAsset;
use Mati365\CKEditor5Livewire\Cloud\Bundle\JSAssetType;

class AssetsBundleTest extends TestCase
{
    public function testConstructorSetsProperties(): void
    {
        $jsAssets = [
            new JSAsset(name: 'script1', url: 'https://example.com/script1.js', type: JSAssetType::ESM),
            new JSAsset(name: 'script2', url: 'https://example.com/script2.js', type: JSAssetType::UMD),
        ];
        $cssAssets = [
            'https://example.com/style1.css',
            'https://example.com/style2.css',
        ];

        $bundle = new AssetsBundle(js: $jsAssets, css: $cssAssets);

        $this->assertSame($jsAssets, $bundle->js);
        $this->assertSame($cssAssets, $bundle->css);
    }

    public function testMergeCreatesCombinedBundle(): void
    {
        $bundle1 = new AssetsBundle(
            js: [
                new JSAsset(name: 'script1', url: 'https://example.com/script1.js', type: JSAssetType::ESM),
            ],
            css: ['https://example.com/style1.css']
        );

        $bundle2 = new AssetsBundle(
            js: [
                new JSAsset(name: 'script2', url: 'https://example.com/script2.js', type: JSAssetType::UMD),
            ],
            css: ['https://example.com/style2.css']
        );

        $merged = $bundle1->merge($bundle2);

        $this->assertCount(2, $merged->js);
        $this->assertCount(2, $merged->css);
        $this->assertSame('https://example.com/script1.js', $merged->js[0]->url);
        $this->assertSame('https://example.com/script2.js', $merged->js[1]->url);
        $this->assertSame('https://example.com/style1.css', $merged->css[0]);
        $this->assertSame('https://example.com/style2.css', $merged->css[1]);
    }

    public function testMergeDoesNotModifyOriginalBundles(): void
    {
        $bundle1 = new AssetsBundle(
            js: [new JSAsset(name: 'script1', url: 'https://example.com/script1.js', type: JSAssetType::ESM)],
            css: ['https://example.com/style1.css']
        );

        $bundle2 = new AssetsBundle(
            js: [new JSAsset(name: 'script2', url: 'https://example.com/script2.js', type: JSAssetType::UMD)],
            css: ['https://example.com/style2.css']
        );

        $merged = $bundle1->merge($bundle2);

        $this->assertCount(1, $bundle1->js);
        $this->assertCount(1, $bundle1->css);
        $this->assertCount(1, $bundle2->js);
        $this->assertCount(1, $bundle2->css);
        $this->assertCount(2, $merged->js);
        $this->assertCount(2, $merged->css);
    }

    public function testMergeEmptyBundles(): void
    {
        $bundle1 = new AssetsBundle(js: [], css: []);
        $bundle2 = new AssetsBundle(js: [], css: []);

        $merged = $bundle1->merge($bundle2);

        $this->assertEmpty($merged->js);
        $this->assertEmpty($merged->css);
    }

    public function testMergeWithEmptyBundle(): void
    {
        $bundle1 = new AssetsBundle(
            js: [new JSAsset(name: 'script1', url: 'https://example.com/script1.js', type: JSAssetType::ESM)],
            css: ['https://example.com/style1.css']
        );

        $bundle2 = new AssetsBundle(js: [], css: []);

        $merged = $bundle1->merge($bundle2);

        $this->assertCount(1, $merged->js);
        $this->assertCount(1, $merged->css);
        $this->assertSame('https://example.com/script1.js', $merged->js[0]->url);
        $this->assertSame('https://example.com/style1.css', $merged->css[0]);
    }
}
