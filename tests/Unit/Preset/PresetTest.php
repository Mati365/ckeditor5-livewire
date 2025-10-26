<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Preset;

use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\Preset\{Preset, EditorType};
use Mati365\CKEditor5Livewire\License\Key;
use Mati365\CKEditor5Livewire\Cloud\Cloud;

class PresetTest extends TestCase
{
    public function testConstructorSetsProperties(): void
    {
        $config = ['toolbar' => ['bold', 'italic']];
        $editorType = EditorType::CLASSIC;
        $licenseKey = Key::ofGPL();
        $cloud = new Cloud(editorVersion: '40.0.0', premium: false);
        $customTranslations = ['Save' => 'Zapisz'];

        $preset = new Preset(
            config: $config,
            editorType: $editorType,
            licenseKey: $licenseKey,
            cloud: $cloud,
            customTranslations: $customTranslations
        );

        $this->assertSame($config, $preset->config);
        $this->assertSame($editorType, $preset->editorType);
        $this->assertSame($licenseKey, $preset->licenseKey);
        $this->assertSame($cloud, $preset->cloud);
        $this->assertSame($customTranslations, $preset->customTranslations);
    }

    public function testConstructorWithOptionalParameters(): void
    {
        $config = ['toolbar' => ['bold']];
        $editorType = EditorType::CLASSIC;
        $licenseKey = Key::ofGPL();

        $preset = new Preset(
            config: $config,
            editorType: $editorType,
            licenseKey: $licenseKey
        );

        $this->assertSame($config, $preset->config);
        $this->assertSame($editorType, $preset->editorType);
        $this->assertSame($licenseKey, $preset->licenseKey);
        $this->assertNull($preset->cloud);
        $this->assertNull($preset->customTranslations);
    }

    public function testCloneCreatesDeepCopy(): void
    {
        $config = ['toolbar' => ['bold', 'italic']];
        $editorType = EditorType::CLASSIC;
        $licenseKey = Key::ofGPL();
        $cloud = new Cloud(editorVersion: '40.0.0', premium: false);
        $customTranslations = ['Save' => 'Zapisz'];

        $original = new Preset(
            config: $config,
            editorType: $editorType,
            licenseKey: $licenseKey,
            cloud: $cloud,
            customTranslations: $customTranslations
        );

        $cloned = $original->clone();

        $this->assertNotSame($original, $cloned);
        $this->assertEquals($original->config, $cloned->config);
        $this->assertSame($original->editorType, $cloned->editorType);
        $this->assertNotSame($original->licenseKey, $cloned->licenseKey);
        $this->assertNotSame($original->cloud, $cloned->cloud);
        $this->assertEquals($original->customTranslations, $cloned->customTranslations);

        // Modify cloned to ensure it's a deep copy
        $cloned->config['toolbar'][] = 'underline';
        $this->assertNotEquals($original->config, $cloned->config);
    }

    public function testOfConfigReturnsNewInstance(): void
    {
        $original = new Preset(
            config: ['toolbar' => ['bold']],
            editorType: EditorType::CLASSIC,
            licenseKey: Key::ofGPL()
        );
        $newConfig = ['toolbar' => ['bold', 'italic', 'underline']];

        $modified = $original->ofConfig($newConfig);

        $this->assertNotSame($original, $modified);
        $this->assertSame(['toolbar' => ['bold']], $original->config);
        $this->assertSame($newConfig, $modified->config);
    }

    public function testOfMergedConfigMergesConfigs(): void
    {
        $original = new Preset(
            config: [
                'toolbar' => ['bold'],
                'language' => 'en',
            ],
            editorType: EditorType::CLASSIC,
            licenseKey: Key::ofGPL()
        );
        $mergeConfig = ['toolbar' => ['italic', 'underline']];

        $modified = $original->ofMergedConfig($mergeConfig);

        $this->assertNotSame($original, $modified);
        $this->assertSame(['toolbar' => ['bold'], 'language' => 'en'], $original->config);
        $this->assertSame(['toolbar' => ['bold', 'italic', 'underline'], 'language' => 'en'], $modified->config);
    }

    public function testOfEditorTypeReturnsNewInstance(): void
    {
        $original = new Preset(
            config: ['toolbar' => ['bold']],
            editorType: EditorType::CLASSIC,
            licenseKey: Key::ofGPL()
        );

        $modified = $original->ofEditorType(EditorType::INLINE);

        $this->assertNotSame($original, $modified);
        $this->assertSame(EditorType::CLASSIC, $original->editorType);
        $this->assertSame(EditorType::INLINE, $modified->editorType);
    }

    public function testOfCustomTranslationsReturnsNewInstance(): void
    {
        $original = new Preset(
            config: ['toolbar' => ['bold']],
            editorType: EditorType::CLASSIC,
            licenseKey: Key::ofGPL(),
            customTranslations: ['Save' => 'Zapisz']
        );
        $newTranslations = ['Save' => 'Salvar', 'Cancel' => 'Cancelar'];

        $modified = $original->ofCustomTranslations($newTranslations);

        $this->assertNotSame($original, $modified);
        $this->assertSame(['Save' => 'Zapisz'], $original->customTranslations);
        $this->assertSame($newTranslations, $modified->customTranslations);
    }

    public function testOfCustomTranslationsCanSetToNull(): void
    {
        $original = new Preset(
            config: ['toolbar' => ['bold']],
            editorType: EditorType::CLASSIC,
            licenseKey: Key::ofGPL(),
            customTranslations: ['Save' => 'Zapisz']
        );

        $modified = $original->ofCustomTranslations(null);

        $this->assertNotSame($original, $modified);
        $this->assertSame(['Save' => 'Zapisz'], $original->customTranslations);
        $this->assertNull($modified->customTranslations);
    }

    public function testChainedModifications(): void
    {
        $original = new Preset(
            config: ['toolbar' => ['bold']],
            editorType: EditorType::CLASSIC,
            licenseKey: Key::ofGPL(),
            customTranslations: ['Save' => 'Zapisz']
        );

        $modified = $original
            ->ofConfig(['toolbar' => ['italic']])
            ->ofEditorType(EditorType::MULTIROOT)
            ->ofCustomTranslations(['Save' => 'Salvar']);

        $this->assertNotSame($original, $modified);
        $this->assertSame(['toolbar' => ['bold']], $original->config);
        $this->assertSame(['toolbar' => ['italic']], $modified->config);
        $this->assertSame(EditorType::CLASSIC, $original->editorType);
        $this->assertSame(EditorType::MULTIROOT, $modified->editorType);
        $this->assertSame(['Save' => 'Zapisz'], $original->customTranslations);
        $this->assertSame(['Save' => 'Salvar'], $modified->customTranslations);
    }
}
