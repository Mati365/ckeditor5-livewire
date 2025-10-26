<?php

namespace Mati365\CKEditor5Livewire;

use Illuminate\Contracts\Config\Repository as ConfigRepository;
use Mati365\CKEditor5Livewire\Preset\Preset;
use Mati365\CKEditor5Livewire\Context\Context;
use Mati365\CKEditor5Livewire\Exceptions\UnknownPreset;
use Mati365\CKEditor5Livewire\Exceptions\UnknownContext;
use Mati365\CKEditor5Livewire\Preset\PresetParser;
use Mati365\CKEditor5Livewire\Context\ContextParser;

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
     * @return array<string, array>
     */
    public function getRawPresets(): array
    {
        $presets = $this->config['presets'] ?? [];

        if (!is_array($presets)) {
            return [];
        }

        /** @var array<string, array> $presets */
        return $presets;
    }

    /**
     * Return the package's context configurations.
     *
     * @return array<string, array>
     */
    public function getRawContexts(): array
    {
        $contexts = $this->config['contexts'] ?? [];

        if (!is_array($contexts)) {
            return [];
        }

        /** @var array<string, array> $contexts */
        return $contexts;
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

        $json = $this->getRawPresets()[$nameOrPreset] ?? null;

        if (!isset($json)) {
            throw new UnknownPreset($nameOrPreset);
        }

        return PresetParser::parse($json);
    }

    /**
     * Get a context by its name or return the context instance directly.
     *
     * @param Context|string $name The context name or instance
     * @return Context The resolved Context instance
     * @throws UnknownContext If the context name does not exist in the configuration
     */
    public function resolveContextOrThrow(Context|string $nameOrContext): Context
    {
        if ($nameOrContext instanceof Context) {
            return $nameOrContext;
        }

        $json = $this->getRawContexts()[$nameOrContext] ?? null;

        if (!isset($json)) {
            throw new UnknownContext($nameOrContext);
        }

        return ContextParser::parse($json);
    }
}
