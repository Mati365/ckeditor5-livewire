<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Context;

use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\Context\{Context, ContextParser};
use InvalidArgumentException;

class ContextParserTest extends TestCase
{
    public function testParseValidMinimalData(): void
    {
        $data = [
            'config' => ['plugins' => ['Plugin1']],
        ];

        $context = ContextParser::parse($data);

        $this->assertInstanceOf(Context::class, $context);
        $this->assertSame(['plugins' => ['Plugin1']], $context->config);
        $this->assertNull($context->watchdogConfig);
        $this->assertNull($context->customTranslations);
    }

    public function testParseValidFullData(): void
    {
        $data = [
            'config' => ['plugins' => ['Plugin1', 'Plugin2']],
            'watchdogConfig' => ['crashNumberLimit' => 5],
            'customTranslations' => ['Save' => 'Zapisz'],
        ];

        $context = ContextParser::parse($data);

        $this->assertInstanceOf(Context::class, $context);
        $this->assertSame(['plugins' => ['Plugin1', 'Plugin2']], $context->config);
        $this->assertSame(['crashNumberLimit' => 5], $context->watchdogConfig);
        $this->assertSame(['Save' => 'Zapisz'], $context->customTranslations);
    }

    public function testParseMissingConfigThrowsException(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Context config validation failed');

        ContextParser::parse([]);
    }

    public function testParseInvalidConfigTypeThrowsException(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Context config validation failed');

        ContextParser::parse(['config' => 'invalid']);
    }

    public function testParseInvalidWatchdogConfigTypeThrowsException(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Context config validation failed');

        ContextParser::parse([
            'config' => ['plugins' => []],
            'watchdogConfig' => 'invalid',
        ]);
    }

    public function testParseInvalidCustomTranslationsTypeThrowsException(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Context config validation failed');

        ContextParser::parse([
            'config' => ['plugins' => []],
            'customTranslations' => 'invalid',
        ]);
    }

    public function testDumpMinimalContext(): void
    {
        $context = new Context(
            config: ['plugins' => ['Plugin1']]
        );

        $result = ContextParser::dump($context);

        $this->assertSame(['config' => ['plugins' => ['Plugin1']]], $result);
    }

    public function testDumpFullContext(): void
    {
        $context = new Context(
            config: ['plugins' => ['Plugin1', 'Plugin2']],
            watchdogConfig: ['crashNumberLimit' => 5],
            customTranslations: ['Save' => 'Zapisz']
        );

        $result = ContextParser::dump($context);

        $expected = [
            'config' => ['plugins' => ['Plugin1', 'Plugin2']],
            'watchdogConfig' => ['crashNumberLimit' => 5],
            'customTranslations' => ['Save' => 'Zapisz'],
        ];

        $this->assertSame($expected, $result);
    }

    public function testDumpAndParseRoundTrip(): void
    {
        $original = new Context(
            config: ['plugins' => ['Plugin1', 'Plugin2']],
            watchdogConfig: ['crashNumberLimit' => 5],
            customTranslations: ['Save' => 'Zapisz']
        );

        $dumped = ContextParser::dump($original);
        $parsed = ContextParser::parse($dumped);

        $this->assertEquals($original->config, $parsed->config);
        $this->assertEquals($original->watchdogConfig, $parsed->watchdogConfig);
        $this->assertEquals($original->customTranslations, $parsed->customTranslations);
    }

    public function testDumpContextWithNullWatchdogConfig(): void
    {
        $context = new Context(
            config: ['plugins' => ['Plugin1']],
            watchdogConfig: null,
            customTranslations: ['Save' => 'Zapisz']
        );

        $result = ContextParser::dump($context);

        $this->assertArrayNotHasKey('watchdogConfig', $result);
        $this->assertArrayHasKey('customTranslations', $result);
    }

    public function testDumpContextWithNullCustomTranslations(): void
    {
        $context = new Context(
            config: ['plugins' => ['Plugin1']],
            watchdogConfig: ['crashNumberLimit' => 5],
            customTranslations: null
        );

        $result = ContextParser::dump($context);

        $this->assertArrayHasKey('watchdogConfig', $result);
        $this->assertArrayNotHasKey('customTranslations', $result);
    }
}
