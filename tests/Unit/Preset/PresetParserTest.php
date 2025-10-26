<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Preset;

use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\Preset\{Preset, PresetParser, EditorType};
use Mati365\CKEditor5Livewire\License\{Key, KeyParser};
use Mati365\CKEditor5Livewire\Cloud\{Cloud, CloudParser};
use InvalidArgumentException;

class PresetParserTest extends TestCase
{
    public function testParseValidMinimalData(): void
    {
        $data = [
            'config' => ['toolbar' => ['bold', 'italic']],
            'editorType' => 'classic',
        ];

        $preset = PresetParser::parse($data);

        $this->assertInstanceOf(Preset::class, $preset);
        $this->assertSame(['toolbar' => ['bold', 'italic']], $preset->config);
        $this->assertSame(EditorType::CLASSIC, $preset->editorType);
        $this->assertTrue($preset->licenseKey->isGPL());
        $this->assertNull($preset->cloud);
        $this->assertNull($preset->customTranslations);
    }

    public function testParseValidFullData(): void
    {
        $data = [
            'config' => ['toolbar' => ['bold', 'italic']],
            'editorType' => 'inline',
            'licenseKey' => 'GPL',
            'cloud' => [
                'editorVersion' => '40.0.0',
                'premium' => false,
            ],
            'customTranslations' => ['Save' => 'Zapisz'],
        ];

        $preset = PresetParser::parse($data);

        $this->assertInstanceOf(Preset::class, $preset);
        $this->assertSame(['toolbar' => ['bold', 'italic']], $preset->config);
        $this->assertSame(EditorType::INLINE, $preset->editorType);
        $this->assertTrue($preset->licenseKey->isGPL());
        $this->assertNotNull($preset->cloud);
        $this->assertSame('40.0.0', $preset->cloud->editorVersion);
        $this->assertFalse($preset->cloud->premium);
        $this->assertSame(['Save' => 'Zapisz'], $preset->customTranslations);
    }

    public function testParseMissingConfigThrowsException(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Preset config validation failed');

        PresetParser::parse(['editorType' => 'classic']);
    }

    public function testParseMissingEditorTypeThrowsException(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Preset config validation failed');

        PresetParser::parse(['config' => ['toolbar' => []]]);
    }

    public function testParseInvalidConfigTypeThrowsException(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Preset config validation failed');

        PresetParser::parse([
            'config' => 'invalid',
            'editorType' => 'classic',
        ]);
    }

    public function testParseInvalidEditorTypeThrowsException(): void
    {
        $this->expectException(\ValueError::class);

        PresetParser::parse([
            'config' => ['toolbar' => []],
            'editorType' => 'invalid-type',
        ]);
    }

    public function testDumpMinimalPreset(): void
    {
        $preset = new Preset(
            config: ['toolbar' => ['bold']],
            editorType: EditorType::CLASSIC,
            licenseKey: Key::ofGPL()
        );

        $result = PresetParser::dump($preset);

        $expected = [
            'config' => ['toolbar' => ['bold']],
            'editorType' => 'classic',
            'licenseKey' => 'GPL',
        ];

        $this->assertSame($expected, $result);
    }

    public function testDumpFullPreset(): void
    {
        $payload = [
            'exp' => time() + 3600,
            'distributionChannel' => 'sh',
        ];
        $encodedPayload = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');
        $jwt = 'header.' . $encodedPayload . '.signature';

        $data = [
            'config' => ['toolbar' => ['bold', 'italic']],
            'editorType' => 'multiroot',
            'licenseKey' => $jwt,
            'cloud' => [
                'editorVersion' => '40.0.0',
                'premium' => true,
            ],
            'customTranslations' => ['Save' => 'Zapisz'],
        ];

        $preset = PresetParser::parse($data);
        $dumped = PresetParser::dump($preset);

        $this->assertSame(['toolbar' => ['bold', 'italic']], $dumped['config']);
        $this->assertSame('multiroot', $dumped['editorType']);
        $this->assertSame($jwt, $dumped['licenseKey']);
        $this->assertArrayHasKey('cloud', $dumped);
        $this->assertSame(['Save' => 'Zapisz'], $dumped['customTranslations']);
    }

    public function testDumpAndParseRoundTrip(): void
    {
        $original = [
            'config' => ['toolbar' => ['bold', 'italic', 'underline']],
            'editorType' => 'balloon',
            'licenseKey' => 'GPL',
            'cloud' => [
                'editorVersion' => '40.0.0',
                'premium' => false,
            ],
            'customTranslations' => ['Save' => 'Zapisz', 'Cancel' => 'Anuluj'],
        ];

        $preset = PresetParser::parse($original);
        $dumped = PresetParser::dump($preset);
        $parsedAgain = PresetParser::parse($dumped);

        $this->assertEquals($preset->config, $parsedAgain->config);
        $this->assertSame($preset->editorType, $parsedAgain->editorType);
        $this->assertEquals($preset->licenseKey->raw, $parsedAgain->licenseKey->raw);
        $this->assertEquals($preset->customTranslations, $parsedAgain->customTranslations);
    }

    public function testParseWithEnvironmentLicenseKey(): void
    {
        $originalEnv = getenv('CKEDITOR5_LICENSE_KEY');
        putenv('CKEDITOR5_LICENSE_KEY=GPL');

        try {
            $data = [
                'config' => ['toolbar' => ['bold']],
                'editorType' => 'classic',
            ];

            $preset = PresetParser::parse($data);

            $this->assertTrue($preset->licenseKey->isGPL());
        } finally {
            if ($originalEnv !== false) {
                putenv('CKEDITOR5_LICENSE_KEY=' . $originalEnv);
            } else {
                putenv('CKEDITOR5_LICENSE_KEY');
            }
        }
    }

    public function testDumpPresetWithoutCloud(): void
    {
        $preset = new Preset(
            config: ['toolbar' => ['bold']],
            editorType: EditorType::INLINE,
            licenseKey: Key::ofGPL(),
            cloud: null,
            customTranslations: ['Save' => 'Zapisz']
        );

        $result = PresetParser::dump($preset);

        $this->assertArrayNotHasKey('cloud', $result);
        $this->assertArrayHasKey('customTranslations', $result);
    }

    public function testDumpPresetWithoutCustomTranslations(): void
    {
        $preset = new Preset(
            config: ['toolbar' => ['bold']],
            editorType: EditorType::CLASSIC,
            licenseKey: Key::ofGPL(),
            customTranslations: null
        );

        $result = PresetParser::dump($preset);

        $this->assertArrayNotHasKey('customTranslations', $result);
    }
}
