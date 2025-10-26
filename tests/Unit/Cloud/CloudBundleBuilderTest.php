<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Cloud;

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\UsesClass;
use Mati365\CKEditor5Livewire\Cloud\Cloud;
use Mati365\CKEditor5Livewire\Cloud\CloudBundleBuilder;
use Mati365\CKEditor5Livewire\Cloud\Bundle\AssetsBundle;
use Mati365\CKEditor5Livewire\Cloud\Bundle\JSAsset;
use Mati365\CKEditor5Livewire\Cloud\CKBox\CKBox;
use Mati365\CKEditor5Livewire\Cloud\CKBox\CKBoxCloudBundleBuilder;
use Mati365\CKEditor5Livewire\Cloud\CKEditor\CKEditorCloudBundleBuilder;
use Mati365\CKEditor5Livewire\Cloud\CKEditor\CKEditorPremiumCloudBundleBuilder;

#[CoversClass(CloudBundleBuilder::class)]
#[UsesClass(AssetsBundle::class)]
#[UsesClass(JSAsset::class)]
#[UsesClass(Cloud::class)]
#[UsesClass(CKBox::class)]
#[UsesClass(CKEditorCloudBundleBuilder::class)]
#[UsesClass(CKEditorPremiumCloudBundleBuilder::class)]
#[UsesClass(CKBoxCloudBundleBuilder::class)]
class CloudBundleBuilderTest extends TestCase
{
    public function testBuildBasicEditorBundle(): void
    {
        $cloud = new Cloud(
            editorVersion: '36.0.0',
            premium: false,
            translations: []
        );

        $bundle = CloudBundleBuilder::build($cloud);

        $this->assertInstanceOf(AssetsBundle::class, $bundle);
        $this->assertNotEmpty($bundle->js);
        $this->assertNotEmpty($bundle->css);
    }

    public function testBuildWithTranslations(): void
    {
        $cloud = new Cloud(
            editorVersion: '36.0.0',
            premium: false,
            translations: ['pl', 'en']
        );

        $bundle = CloudBundleBuilder::build($cloud);

        $this->assertInstanceOf(AssetsBundle::class, $bundle);
        // Should have: ckeditor5.js + 2 translations
        $this->assertCount(3, $bundle->js);
    }

    public function testBuildWithPremium(): void
    {
        $cloud = new Cloud(
            editorVersion: '36.0.0',
            premium: true,
            translations: []
        );

        $bundle = CloudBundleBuilder::build($cloud);

        $this->assertInstanceOf(AssetsBundle::class, $bundle);
        // Should have more assets with premium
        $this->assertGreaterThan(1, count($bundle->js));
    }

    public function testBuildWithCKBox(): void
    {
        $cloud = new Cloud(
            editorVersion: '36.0.0',
            premium: false,
            translations: [],
            ckbox: new CKBox(version: '2.0.0', theme: 'lark')
        );

        $bundle = CloudBundleBuilder::build($cloud);

        $this->assertInstanceOf(AssetsBundle::class, $bundle);
        // Should have CKBox assets included
        $this->assertGreaterThan(1, count($bundle->js));
    }

    public function testBuildWithAllFeatures(): void
    {
        $cloud = new Cloud(
            editorVersion: '36.0.0',
            premium: true,
            translations: ['pl', 'en'],
            ckbox: new CKBox(version: '2.0.0', theme: 'lark')
        );

        $bundle = CloudBundleBuilder::build($cloud);

        $this->assertInstanceOf(AssetsBundle::class, $bundle);
        // Should have all assets: editor + premium + translations + ckbox
        $this->assertGreaterThan(3, count($bundle->js));
        $this->assertNotEmpty($bundle->css);
    }
}
