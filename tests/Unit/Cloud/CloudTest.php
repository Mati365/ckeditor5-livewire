<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Cloud;

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\UsesClass;
use Mati365\CKEditor5Livewire\Cloud\Cloud;
use Mati365\CKEditor5Livewire\Cloud\CKBox\CKBox;
use Mati365\CKEditor5Livewire\Utils\Arrays;

#[CoversClass(Cloud::class)]
#[UsesClass(CKBox::class)]
#[UsesClass(Arrays::class)]
class CloudTest extends TestCase
{
    public function testConstructorSetsProperties(): void
    {
        $cloud = new Cloud(
            editorVersion: '36.0.0',
            premium: true,
            translations: ['pl', 'en'],
            ckbox: null
        );

        $this->assertSame('36.0.0', $cloud->editorVersion);
        $this->assertTrue($cloud->premium);
        $this->assertSame(['pl', 'en'], $cloud->translations);
        $this->assertNull($cloud->ckbox);
    }

    public function testCloneCreatesDeepCopy(): void
    {
        $ckbox = new CKBox(version: '2.0.0', theme: 'lark');
        $cloud = new Cloud(
            editorVersion: '36.0.0',
            premium: true,
            translations: ['pl', 'en'],
            ckbox: $ckbox
        );

        $cloned = $cloud->clone();

        $this->assertNotSame($cloud, $cloned);
        $this->assertSame($cloud->editorVersion, $cloned->editorVersion);
        $this->assertSame($cloud->premium, $cloned->premium);
        $this->assertEquals($cloud->translations, $cloned->translations);
        $this->assertNotSame($cloud->ckbox, $cloned->ckbox);
        $this->assertEquals($cloud->ckbox, $cloned->ckbox);
    }

    public function testOfEditorVersionReturnsNewInstance(): void
    {
        $cloud = new Cloud(
            editorVersion: '36.0.0',
            premium: false,
            translations: []
        );

        $updated = $cloud->ofEditorVersion('37.0.0');

        $this->assertNotSame($cloud, $updated);
        $this->assertSame('36.0.0', $cloud->editorVersion);
        $this->assertSame('37.0.0', $updated->editorVersion);
    }

    public function testOfPremiumReturnsNewInstance(): void
    {
        $cloud = new Cloud(
            editorVersion: '36.0.0',
            premium: false,
            translations: []
        );

        $updated = $cloud->ofPremium(true);

        $this->assertNotSame($cloud, $updated);
        $this->assertFalse($cloud->premium);
        $this->assertTrue($updated->premium);
    }

    public function testOfTranslationsReturnsNewInstance(): void
    {
        $cloud = new Cloud(
            editorVersion: '36.0.0',
            premium: false,
            translations: ['pl']
        );

        $updated = $cloud->ofTranslations(['en', 'de']);

        $this->assertNotSame($cloud, $updated);
        $this->assertSame(['pl'], $cloud->translations);
        $this->assertSame(['en', 'de'], $updated->translations);
    }

    public function testOfCKBoxReturnsNewInstance(): void
    {
        $cloud = new Cloud(
            editorVersion: '36.0.0',
            premium: false,
            translations: [],
            ckbox: null
        );

        $ckbox = new CKBox(version: '2.0.0', theme: 'lark');
        $updated = $cloud->ofCKBox($ckbox);

        $this->assertNotSame($cloud, $updated);
        $this->assertNull($cloud->ckbox);
        $this->assertSame($ckbox, $updated->ckbox);
    }

    public function testOfCKBoxCanRemoveCKBox(): void
    {
        $ckbox = new CKBox(version: '2.0.0', theme: 'lark');
        $cloud = new Cloud(
            editorVersion: '36.0.0',
            premium: false,
            translations: [],
            ckbox: $ckbox
        );

        $updated = $cloud->ofCKBox(null);

        $this->assertNotSame($cloud, $updated);
        $this->assertNotNull($cloud->ckbox);
        $this->assertNull($updated->ckbox);
    }
}
