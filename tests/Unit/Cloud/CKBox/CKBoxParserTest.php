<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Cloud\CKBox;

use InvalidArgumentException;
use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\Cloud\CKBox\{CKBox,CKBoxParser};

class CKBoxParserTest extends TestCase
{
    public function testParseValidMinimalData(): void
    {
        $data = ['version' => '2.0.0'];

        $ckbox = CKBoxParser::parse($data);

        $this->assertSame('2.0.0', $ckbox->version);
        $this->assertNull($ckbox->theme);
    }

    public function testParseValidFullData(): void
    {
        $data = [
            'version' => '2.0.0',
            'theme' => 'lark',
        ];

        $ckbox = CKBoxParser::parse($data);

        $this->assertSame('2.0.0', $ckbox->version);
        $this->assertSame('lark', $ckbox->theme);
    }

    public function testParseMissingVersionThrowsException(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('CKBox config validation failed');

        CKBoxParser::parse([]);
    }

    public function testParseEmptyVersionThrowsException(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('CKBox config validation failed');

        CKBoxParser::parse(['version' => '']);
    }

    public function testParseInvalidVersionTypeThrowsException(): void
    {
        $this->expectException(InvalidArgumentException::class);

        CKBoxParser::parse(['version' => 123]);
    }

    public function testDumpMinimalCKBox(): void
    {
        $ckbox = new CKBox(version: '2.0.0');

        $result = CKBoxParser::dump($ckbox);

        $this->assertSame(['version' => '2.0.0'], $result);
    }

    public function testDumpFullCKBox(): void
    {
        $ckbox = new CKBox(version: '2.0.0', theme: 'lark');

        $result = CKBoxParser::dump($ckbox);

        $this->assertSame([
            'version' => '2.0.0',
            'theme' => 'lark',
        ], $result);
    }

    public function testDumpAndParseRoundTrip(): void
    {
        $original = new CKBox(version: '2.5.0', theme: 'dark');

        $dumped = CKBoxParser::dump($original);
        $parsed = CKBoxParser::parse($dumped);

        $this->assertSame($original->version, $parsed->version);
        $this->assertSame($original->theme, $parsed->theme);
    }
}
