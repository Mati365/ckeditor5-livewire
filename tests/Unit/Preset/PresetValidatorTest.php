<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Preset;

use InvalidArgumentException;
use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\Preset\PresetValidator;

class PresetValidatorTest extends TestCase
{
    public function testValidateValidMinimal(): void
    {
        PresetValidator::validate([
            'config' => ['toolbar' => []],
            'editorType' => 'classic',
        ]);
        $this->assertTrue(true);
    }

    public function testValidateValidFull(): void
    {
        PresetValidator::validate([
            'config' => ['toolbar' => []],
            'editorType' => 'inline',
            'licenseKey' => 'GPL',
            'cloud' => ['editorVersion' => '40.0.0', 'premium' => false],
            'customTranslations' => ['Save' => 'Zapisz'],
        ]);
        $this->assertTrue(true);
    }

    public function testValidateMissingConfigThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        PresetValidator::validate(['editorType' => 'classic']);
    }

    public function testValidateConfigNotArrayThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        PresetValidator::validate([
            'config' => 'nope',
            'editorType' => 'classic',
        ]);
    }

    public function testValidateMissingEditorTypeThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        PresetValidator::validate(['config' => []]);
    }

    public function testValidateEditorTypeEmptyStringThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        PresetValidator::validate([
            'config' => [],
            'editorType' => '',
        ]);
    }

    public function testValidateLicenseKeyNotStringThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        PresetValidator::validate([
            'config' => [],
            'editorType' => 'classic',
            'licenseKey' => 123,
        ]);
    }

    public function testValidateCloudNotArrayThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        PresetValidator::validate([
            'config' => [],
            'editorType' => 'classic',
            'cloud' => 'not-an-array',
        ]);
    }

    public function testValidateCustomTranslationsNotArrayThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        PresetValidator::validate([
            'config' => [],
            'editorType' => 'classic',
            'customTranslations' => 'string',
        ]);
    }
}
