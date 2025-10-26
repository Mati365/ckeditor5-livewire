<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit;

use Mati365\CKEditor5Livewire\Tests\TestCase;
use Mati365\CKEditor5Livewire\Config;
use Mati365\CKEditor5Livewire\Preset\{Preset, EditorType};
use Mati365\CKEditor5Livewire\Context\Context;
use Mati365\CKEditor5Livewire\License\Key;
use Mati365\CKEditor5Livewire\Exceptions\{UnknownPreset, UnknownContext};
use Illuminate\Contracts\Config\Repository as ConfigRepository;
use Mockery;

class ConfigTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function testGetRawPresetsReturnsArray(): void
    {
        $mockConfig = Mockery::mock(ConfigRepository::class);
        $mockConfig->shouldReceive('get')
            ->with('ckeditor5')
            ->andReturn([
                'presets' => [
                    'default' => [
                        'config' => ['toolbar' => ['bold']],
                        'editorType' => 'classic',
                    ],
                ],
            ]);

        $config = new Config($mockConfig);
        $presets = $config->getRawPresets();

        $this->assertIsArray($presets);
        $this->assertArrayHasKey('default', $presets);
        $this->assertSame(['toolbar' => ['bold']], $presets['default']['config']);
    }

    public function testGetRawPresetsReturnsEmptyArrayWhenNotSet(): void
    {
        $mockConfig = Mockery::mock(ConfigRepository::class);
        $mockConfig->shouldReceive('get')
            ->with('ckeditor5')
            ->andReturn([]);

        $config = new Config($mockConfig);
        $presets = $config->getRawPresets();

        $this->assertIsArray($presets);
        $this->assertEmpty($presets);
    }

    public function testGetRawPresetsReturnsEmptyArrayWhenNotArray(): void
    {
        $mockConfig = Mockery::mock(ConfigRepository::class);
        $mockConfig->shouldReceive('get')
            ->with('ckeditor5')
            ->andReturn(['presets' => 'invalid']);

        $config = new Config($mockConfig);
        $presets = $config->getRawPresets();

        $this->assertIsArray($presets);
        $this->assertEmpty($presets);
    }

    public function testGetRawContextsReturnsArray(): void
    {
        $mockConfig = Mockery::mock(ConfigRepository::class);
        $mockConfig->shouldReceive('get')
            ->with('ckeditor5')
            ->andReturn([
                'contexts' => [
                    'default' => [
                        'config' => ['plugins' => ['Plugin1']],
                    ],
                ],
            ]);

        $config = new Config($mockConfig);
        $contexts = $config->getRawContexts();

        $this->assertIsArray($contexts);
        $this->assertArrayHasKey('default', $contexts);
        $this->assertSame(['plugins' => ['Plugin1']], $contexts['default']['config']);
    }

    public function testGetRawContextsReturnsEmptyArrayWhenNotSet(): void
    {
        $mockConfig = Mockery::mock(ConfigRepository::class);
        $mockConfig->shouldReceive('get')
            ->with('ckeditor5')
            ->andReturn([]);

        $config = new Config($mockConfig);
        $contexts = $config->getRawContexts();

        $this->assertIsArray($contexts);
        $this->assertEmpty($contexts);
    }

    public function testResolvePresetOrThrowReturnsPresetInstance(): void
    {
        $mockConfig = Mockery::mock(ConfigRepository::class);
        $mockConfig->shouldReceive('get')->andReturn([]);

        $config = new Config($mockConfig);
        $preset = new Preset(
            config: ['toolbar' => ['bold']],
            editorType: EditorType::CLASSIC,
            licenseKey: Key::ofGPL()
        );

        $result = $config->resolvePresetOrThrow($preset);

        $this->assertSame($preset, $result);
    }

    public function testResolvePresetOrThrowParsesPresetName(): void
    {
        $mockConfig = Mockery::mock(ConfigRepository::class);
        $mockConfig->shouldReceive('get')
            ->with('ckeditor5')
            ->andReturn([
                'presets' => [
                    'custom' => [
                        'config' => ['toolbar' => ['bold', 'italic']],
                        'editorType' => 'inline',
                    ],
                ],
            ]);

        $config = new Config($mockConfig);
        $preset = $config->resolvePresetOrThrow('custom');

        $this->assertInstanceOf(Preset::class, $preset);
        $this->assertSame(['toolbar' => ['bold', 'italic']], $preset->config);
    }

    public function testResolvePresetOrThrowThrowsExceptionForUnknownPreset(): void
    {
        $mockConfig = Mockery::mock(ConfigRepository::class);
        $mockConfig->shouldReceive('get')
            ->with('ckeditor5')
            ->andReturn(['presets' => []]);

        $config = new Config($mockConfig);

        $this->expectException(UnknownPreset::class);
        $this->expectExceptionMessage("Preset 'nonexistent' not found in configuration.");

        $config->resolvePresetOrThrow('nonexistent');
    }

    public function testResolveContextOrThrowReturnsContextInstance(): void
    {
        $mockConfig = Mockery::mock(ConfigRepository::class);
        $mockConfig->shouldReceive('get')->andReturn([]);

        $config = new Config($mockConfig);
        $context = new Context(
            config: ['plugins' => ['Plugin1']]
        );

        $result = $config->resolveContextOrThrow($context);

        $this->assertSame($context, $result);
    }

    public function testResolveContextOrThrowParsesContextName(): void
    {
        $mockConfig = Mockery::mock(ConfigRepository::class);
        $mockConfig->shouldReceive('get')
            ->with('ckeditor5')
            ->andReturn([
                'contexts' => [
                    'custom' => [
                        'config' => ['plugins' => ['Plugin1', 'Plugin2']],
                    ],
                ],
            ]);

        $config = new Config($mockConfig);
        $context = $config->resolveContextOrThrow('custom');

        $this->assertInstanceOf(Context::class, $context);
        $this->assertSame(['plugins' => ['Plugin1', 'Plugin2']], $context->config);
    }

    public function testResolveContextOrThrowThrowsExceptionForUnknownContext(): void
    {
        $mockConfig = Mockery::mock(ConfigRepository::class);
        $mockConfig->shouldReceive('get')
            ->with('ckeditor5')
            ->andReturn(['contexts' => []]);

        $config = new Config($mockConfig);

        $this->expectException(UnknownContext::class);
        $this->expectExceptionMessage("Context 'nonexistent' not found in configuration.");

        $config->resolveContextOrThrow('nonexistent');
    }
}
