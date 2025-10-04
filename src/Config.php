<?php

namespace Mati365\CKEditor5Livewire;

use Illuminate\Contracts\Config\Repository as ConfigRepository;
use Mati365\CKEditor5Livewire\Preset\Preset;
use Mati365\CKEditor5Livewire\Exceptions\UnknownPreset;

/**
 * CKEditor 5 configuration class. It's used internally by the package.
 */
final class Config
{
    /**
     * Holds the package configuration array.
     *
     * @var array
     */
    protected array $config;

    /**
     * Constructor receives the framework config repository and
     * extracts this package's configuration.
     *
     * @param ConfigRepository $config
     */
    public function __construct(ConfigRepository $config)
    {
        $this->config = (array) $config->get('ckeditor5');
    }

    /**
     * Return the package's default editor configuration.
     * Can be called via the facade: CKEditor::getDefaultConfig()
     *
     * @return array<string, Preset>
     */
    public function getPresets(): array
    {
        $presets = $this->config['presets'];

        if (!is_array($presets)) {
            return [];
        }

        /** @var array<string, Preset> $presets */
        return $presets;
    }

    /**
     * Return the package's default preset configuration.
     *
     * @return Preset
     */
    public function getDefaultPreset(): Preset
    {
        return $this->getPresets()['default'];
    }

    /**
     * Get a preset by its name or return the preset instance directly.
     *
     * @param Preset|string $name The preset name or instance
     * @return Preset The resolved Preset instance
     * @throws UnknownPreset If the preset name does not exist in the configuration
     */
    public function resolvePresetOrThrow(Preset|string $nameOrPreset): Preset
    {
        if ($nameOrPreset instanceof Preset) {
            return $nameOrPreset;
        }

        $preset = $this->getPresets()[$nameOrPreset] ?? null;

        if (!isset($preset)) {
            throw new UnknownPreset($nameOrPreset);
        }

        return $preset;
    }
}
