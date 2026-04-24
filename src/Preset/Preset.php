<?php

namespace Mati365\CKEditor5Livewire\Preset;

use Mati365\CKEditor5Livewire\Cloud\Cloud;
use Mati365\CKEditor5Livewire\Utils\Arrays;
use Mati365\CKEditor5Livewire\License\Key;

/**
 * CKEditor 5 preset class. It should contain editor key, cloud configuration and editor settings.
 */
final class Preset
{
    /**
     * Constructor for the Preset class.
     *
     * @param array $config Editor configuration array.
     * @param EditorType $editorType Type of CKEditor 5 editor (default is CLASSIC).
     * @param Key $licenseKey License key for CKEditor 5 (default is 'GPL').
     * @param array $watchdogConfig Watchdog configuration array.
     * @param Cloud|null $cloud Optional cloud configuration array.
     * @param array|null $customTranslations Optional custom translations dictionary.
     */
    public function __construct(
        public array $config,
        public EditorType $editorType,
        public Key $licenseKey,
        public ?array $watchdogConfig = null,
        public ?Cloud $cloud = null,
        public ?array $customTranslations = null,
    ) {}

    /**
     * Creates a deep clone of the current Preset instance.
     *
     * @return self A new Preset instance that is a deep clone of the current instance.
     */
    public function clone(): self
    {
        return new self(
            config: Arrays::deepClone($this->config),
            editorType: $this->editorType,
            licenseKey: $this->licenseKey->clone(),
            watchdogConfig: $this->watchdogConfig !== null ? Arrays::deepClone($this->watchdogConfig) : null,
            cloud: $this->cloud?->clone(),
            customTranslations: $this->customTranslations !== null ? Arrays::deepClone($this->customTranslations) : null,
        );
    }

    /**
     * Creates a new Preset instance with modified configuration.
     *
     * @param array $config New editor configuration array.
     * @return self A new Preset instance with the specified configuration.
     */
    public function ofConfig(array $config): self
    {
        $clone = $this->clone();
        $clone->config = $config;
        return $clone;
    }

    /**
     * Creates a new Preset instance with deep merged configuration.
     *
     * @param array $config Configuration to be merged.
     * @return self A new Preset instance with the merged configuration.
     */
    public function ofMergedConfig(array $config): self
    {
        $clone = $this->clone();
        $clone->config = array_merge_recursive($this->config, $config);
        return $clone;
    }

    /**
     * Creates a new Preset instance with modified watchdog configuration.
     *
     * @param array|null $watchdogConfig New watchdog configuration array.
     * @return self A new Preset instance with the specified watchdog configuration.
     */
    public function ofWatchdogConfig(?array $watchdogConfig): self
    {
        $clone = $this->clone();
        $clone->watchdogConfig = $watchdogConfig;
        return $clone;
    }

    /**
     * Creates a new Preset instance with modified editor type.
     *
     * @param EditorType $editorType New editor type.
     * @return self A new Preset instance with the specified editor type.
     */
    public function ofEditorType(EditorType $editorType): self
    {
        $clone = $this->clone();
        $clone->editorType = $editorType;
        return $clone;
    }

    /**
     * Creates a new Preset instance with modified custom translations.
     *
     * @param array|null $customTranslations New custom translations dictionary.
     * @return self A new Preset instance with the specified custom translations.
     */
    public function ofCustomTranslations(?array $customTranslations): self
    {
        $clone = $this->clone();
        $clone->customTranslations = $customTranslations;
        return $clone;
    }
}
