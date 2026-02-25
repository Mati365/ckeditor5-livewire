<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Cloud\CKBox;

use InvalidArgumentException;
use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\Cloud\CKBox\CKBoxValidator;

class CKBoxValidatorTest extends TestCase
{
    public function testValidateValidMinimal(): void
    {
        // only mandatory field
        CKBoxValidator::validate(['version' => '2.0.0']);
        $this->assertTrue(true, 'Validation should pass for minimal valid data');
    }

    public function testValidateValidWithTheme(): void
    {
        CKBoxValidator::validate([
            'version' => '2.0.0',
            'theme' => 'lark',
        ]);
        $this->assertTrue(true);
    }

    public function testValidateMissingVersionThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('CKBox config validation failed');

        CKBoxValidator::validate([]);
    }

    public function testValidateEmptyVersionThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('CKBox config validation failed');

        CKBoxValidator::validate(['version' => '']);
    }

    public function testValidateInvalidVersionTypeThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        CKBoxValidator::validate(['version' => 123]);
    }

    public function testValidateInvalidThemeTypeThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);

        CKBoxValidator::validate([
            'version' => '2.0.0',
            'theme' => 42,
        ]);
    }

    public function testValidateEmptyThemeThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);

        CKBoxValidator::validate([
            'version' => '2.0.0',
            'theme' => '',
        ]);
    }

    public function testValidateCdnUrlNotStringThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);

        CKBoxValidator::validate([
            'version' => '2.0.0',
            'cdnUrl' => 999,
        ]);
    }

    public function testValidateWithCdnUrlString(): void
    {
        CKBoxValidator::validate([
            'version' => '2.0.0',
            'cdnUrl' => 'https://foo.bar/',
        ]);
        $this->assertTrue(true);
    }
}
