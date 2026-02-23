<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Cloud;

use InvalidArgumentException;
use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\Cloud\CloudValidator;

class CloudValidatorTest extends TestCase
{
    public function testValidateValidMinimal(): void
    {
        CloudValidator::validate(['editorVersion' => '44.0.0']);
        $this->assertTrue(true);
    }

    public function testValidateValidFull(): void
    {
        CloudValidator::validate([
            'editorVersion' => '44.0.0',
            'premium' => true,
            'translations' => ['Foo', 'Bar'],
            'ckbox' => ['version' => '2.0.0'],
        ]);
        $this->assertTrue(true);
    }

    public function testValidateMissingEditorVersionThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        CloudValidator::validate([]);
    }

    public function testValidateInvalidEditorVersionFormatThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        CloudValidator::validate(['editorVersion' => 'not-semver']);
    }

    public function testValidatePremiumNotBoolThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        CloudValidator::validate([
            'editorVersion' => '44.0.0',
            'premium' => 'yes',
        ]);
    }

    public function testValidateTranslationsNotArrayThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        CloudValidator::validate([
            'editorVersion' => '44.0.0',
            'translations' => 'string',
        ]);
    }

    public function testValidateTranslationsElementNotStringThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        CloudValidator::validate([
            'editorVersion' => '44.0.0',
            'translations' => ['ok', 123],
        ]);
    }

    public function testValidateCkboxNotArrayThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        CloudValidator::validate([
            'editorVersion' => '44.0.0',
            'ckbox' => 'not-an-array',
        ]);
    }
}
