<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Preset;

use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\Cloud\Cloud;
use Mati365\CKEditor5Livewire\License\Key;
use Mati365\CKEditor5Livewire\Tests\Helpers\LicenseKeyHelper;
use Mati365\CKEditor5Livewire\Exceptions\{NoCloudConfig, CloudLicenseIncompatible};
use Mati365\CKEditor5Livewire\Preset\{Preset, EditorType, PresetLicenseCompatibility};

class PresetLicenseCompatibilityTest extends TestCase
{
    public function testThrowsWhenCloudMissing(): void
    {
        $preset = new Preset(
            config: ['toolbar' => []],
            editorType: EditorType::CLASSIC,
            licenseKey: Key::ofGPL(),
            cloud: null,
        );

        $this->expectException(NoCloudConfig::class);
        PresetLicenseCompatibility::ensureCloudCompatibilityOrThrow($preset);
    }

    public function testThrowsWhenLicenseIncompatible(): void
    {
        $cloud = new Cloud(
            editorVersion: '40.0.0',
            premium: false,
            translations: [],
        );

        $preset = new Preset(
            config: ['toolbar' => []],
            editorType: EditorType::CLASSIC,
            licenseKey: Key::ofGPL(),
            cloud: $cloud,
        );

        $this->expectException(CloudLicenseIncompatible::class);
        PresetLicenseCompatibility::ensureCloudCompatibilityOrThrow($preset);
    }

    public function testReturnsCloudForCompatibleLicense(): void
    {
        $cloud = new Cloud(
            editorVersion: '40.0.0',
            premium: false,
            translations: [],
        );

        $license = LicenseKeyHelper::create();

        $preset = new Preset(
            config: ['toolbar' => []],
            editorType: EditorType::CLASSIC,
            licenseKey: $license,
            cloud: $cloud,
        );

        $result = PresetLicenseCompatibility::ensureCloudCompatibilityOrThrow($preset);
        $this->assertSame($cloud, $result);
    }
}
