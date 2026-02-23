<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Context;

use InvalidArgumentException;
use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\Context\ContextValidator;

class ContextValidatorTest extends TestCase
{
    public function testValidateValidMinimal(): void
    {
        ContextValidator::validate(['config' => ['foo' => 'bar']]);
        $this->assertTrue(true);
    }

    public function testValidateValidWithOptionalFields(): void
    {
        ContextValidator::validate([
            'config' => [],
            'watchdogConfig' => ['interval' => 5],
            'customTranslations' => ['Save' => 'Zapisz'],
        ]);
        $this->assertTrue(true);
    }

    public function testValidateMissingConfigThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Context config validation failed');

        ContextValidator::validate([]);
    }

    public function testValidateConfigNotArrayThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        ContextValidator::validate(['config' => 'not-an-array']);
    }

    public function testValidateWatchdogConfigNotArrayThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        ContextValidator::validate([
            'config' => [],
            'watchdogConfig' => 'nope',
        ]);
    }

    public function testValidateCustomTranslationsNotArrayThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        ContextValidator::validate([
            'config' => [],
            'customTranslations' => 'not an array',
        ]);
    }
}
