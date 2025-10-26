<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Cloud;

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\UsesClass;
use InvalidArgumentException;
use Mati365\CKEditor5Livewire\Cloud\Cloud;
use Mati365\CKEditor5Livewire\Cloud\CloudParser;
use Mati365\CKEditor5Livewire\Cloud\CKBox\CKBox;
use Mati365\CKEditor5Livewire\Cloud\CKBox\CKBoxParser;

#[CoversClass(CloudParser::class)]
#[UsesClass(Cloud::class)]
#[UsesClass(CKBox::class)]
#[UsesClass(CKBoxParser::class)]
class CloudParserTest extends TestCase
{
    public function testParseValidMinimalData(): void
    {
        $data = [
            'editorVersion' => '36.0.0',
            'premium' => false,
        ];

        $cloud = CloudParser::parse($data);

        $this->assertSame('36.0.0', $cloud->editorVersion);
        $this->assertFalse($cloud->premium);
        $this->assertEmpty($cloud->translations);
        $this->assertNull($cloud->ckbox);
    }

    public function testParseValidFullData(): void
    {
        $data = [
            'editorVersion' => '36.0.0',
            'premium' => true,
            'translations' => ['pl', 'en'],
            'ckbox' => [
                'version' => '2.0.0',
                'theme' => 'lark',
            ],
        ];

        $cloud = CloudParser::parse($data);

        $this->assertSame('36.0.0', $cloud->editorVersion);
        $this->assertTrue($cloud->premium);
        $this->assertSame(['pl', 'en'], $cloud->translations);
        $this->assertInstanceOf(CKBox::class, $cloud->ckbox);
        $this->assertSame('2.0.0', $cloud->ckbox->version);
        $this->assertSame('lark', $cloud->ckbox->theme);
    }

    public function testParseInvalidEditorVersionThrowsException(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Cloud config validation failed');

        CloudParser::parse([
            'editorVersion' => 'invalid-version',
            'premium' => false,
        ]);
    }

    public function testParseMissingEditorVersionThrowsException(): void
    {
        $this->expectException(InvalidArgumentException::class);

        CloudParser::parse([
            'premium' => false,
        ]);
    }

    public function testParseInvalidPremiumTypeThrowsException(): void
    {
        $this->expectException(InvalidArgumentException::class);

        CloudParser::parse([
            'editorVersion' => '36.0.0',
            'premium' => 'yes',
        ]);
    }

    public function testDumpMinimalCloud(): void
    {
        $cloud = new Cloud(
            editorVersion: '36.0.0',
            premium: false,
            translations: []
        );

        $result = CloudParser::dump($cloud);

        $this->assertSame([
            'editorVersion' => '36.0.0',
            'premium' => false,
        ], $result);
    }

    public function testDumpFullCloud(): void
    {
        $cloud = new Cloud(
            editorVersion: '36.0.0',
            premium: true,
            translations: ['pl', 'en'],
            ckbox: new CKBox(version: '2.0.0', theme: 'lark')
        );

        $result = CloudParser::dump($cloud);

        $this->assertSame('36.0.0', $result['editorVersion']);
        $this->assertTrue($result['premium']);
        $this->assertSame(['pl', 'en'], $result['translations']);
        $this->assertIsArray($result['ckbox']);
        $this->assertSame('2.0.0', $result['ckbox']['version']);
        $this->assertSame('lark', $result['ckbox']['theme']);
    }

    public function testDumpAndParseRoundTrip(): void
    {
        $original = new Cloud(
            editorVersion: '37.1.2',
            premium: true,
            translations: ['de', 'fr'],
            ckbox: new CKBox(version: '2.5.0', theme: 'dark')
        );

        $dumped = CloudParser::dump($original);
        $parsed = CloudParser::parse($dumped);

        $this->assertSame($original->editorVersion, $parsed->editorVersion);
        $this->assertSame($original->premium, $parsed->premium);
        $this->assertSame($original->translations, $parsed->translations);
        $this->assertSame($original->ckbox->version, $parsed->ckbox->version);
        $this->assertSame($original->ckbox->theme, $parsed->ckbox->theme);
    }
}
