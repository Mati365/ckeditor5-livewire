<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Cloud\CKBox;

use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\Cloud\CKBox\CKBox;

class CKBoxTest extends TestCase
{
    public function testConstructorSetsProperties(): void
    {
        $ckbox = new CKBox(version: '2.0.0', theme: 'lark');

        $this->assertSame('2.0.0', $ckbox->version);
        $this->assertSame('lark', $ckbox->theme);
    }

    public function testConstructorWithoutTheme(): void
    {
        $ckbox = new CKBox(version: '2.0.0');

        $this->assertSame('2.0.0', $ckbox->version);
        $this->assertNull($ckbox->theme);
    }

    public function testCloneCreatesNewInstance(): void
    {
        $ckbox = new CKBox(version: '2.0.0', theme: 'lark');
        $cloned = $ckbox->clone();

        $this->assertNotSame($ckbox, $cloned);
        $this->assertSame($ckbox->version, $cloned->version);
        $this->assertSame($ckbox->theme, $cloned->theme);
    }

    public function testCloneWithoutTheme(): void
    {
        $ckbox = new CKBox(version: '2.0.0');
        $cloned = $ckbox->clone();

        $this->assertNotSame($ckbox, $cloned);
        $this->assertSame($ckbox->version, $cloned->version);
        $this->assertNull($cloned->theme);
    }
}
