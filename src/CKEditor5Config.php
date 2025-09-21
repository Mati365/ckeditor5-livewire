<?php

namespace Mati365\CKEditor5Livewire;

use Illuminate\Contracts\Config\Repository as Config;

final class CKEditor5Config
{
    /**
     * Holds the package configuration array.
     *
     * @var array
     */
    protected $config;

    /**
     * Constructor receives the framework config repository and
     * extracts this package's configuration.
     *
     * @param \Illuminate\Contracts\Config\Repository $config
     */
    public function __construct(Config $config)
    {
        $this->config = $config->get('ckeditor5');
    }

    /**
     * Return the package's default editor configuration.
     * Can be called via the facade: CKEditor::getDefaultConfig()
     *
     * @return array
     */
    public function getDefaultConfig(): array
    {
        return $this->config['editor_config'] ?? [];
    }

    /**
     * Merge the default configuration with a custom configuration array.
     *
     * @param array $customConfig Custom configuration to merge.
     * @return array
     */
    public function mergeConfig(array $customConfig = []): array
    {
        return array_merge_recursive($this->getDefaultConfig(), $customConfig);
    }
}
