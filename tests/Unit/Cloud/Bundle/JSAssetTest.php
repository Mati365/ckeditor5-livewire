<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Cloud\Bundle;

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\CoversClass;
use Mati365\CKEditor5Livewire\Cloud\Bundle\JSAsset;
use Mati365\CKEditor5Livewire\Cloud\Bundle\JSAssetType;

#[CoversClass(JSAsset::class)]
class JSAssetTest extends TestCase
{
    public function testConstructorSetsProperties(): void
    {
        $asset = new JSAsset(
            name: 'ckeditor5',
            url: 'https://cdn.example.com/ckeditor5.js',
            type: JSAssetType::ESM
        );

        $this->assertSame('ckeditor5', $asset->name);
        $this->assertSame('https://cdn.example.com/ckeditor5.js', $asset->url);
        $this->assertSame(JSAssetType::ESM, $asset->type);
    }

    public function testConstructorWithUMDType(): void
    {
        $asset = new JSAsset(
            name: 'legacy-script',
            url: 'https://cdn.example.com/legacy.js',
            type: JSAssetType::UMD
        );

        $this->assertSame('legacy-script', $asset->name);
        $this->assertSame('https://cdn.example.com/legacy.js', $asset->url);
        $this->assertSame(JSAssetType::UMD, $asset->type);
    }
}
