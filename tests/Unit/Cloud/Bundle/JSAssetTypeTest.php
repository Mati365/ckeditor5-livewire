<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Cloud\Bundle;

use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\Cloud\Bundle\JSAssetType;

class JSAssetTypeTest extends TestCase
{
    public function testESMValue(): void
    {
        $this->assertSame('esm', JSAssetType::ESM->value);
    }

    public function testUMDValue(): void
    {
        $this->assertSame('umd', JSAssetType::UMD->value);
    }

    public function testFromString(): void
    {
        $this->assertSame(JSAssetType::ESM, JSAssetType::from('esm'));
        $this->assertSame(JSAssetType::UMD, JSAssetType::from('umd'));
    }
}
