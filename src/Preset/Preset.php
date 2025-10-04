<?php

namespace Mati365\CKEditor5Livewire\Preset;

use Mati365\CKEditor5Livewire\Cloud\Cloud;
use Mati365\CKEditor5Livewire\Utils\Arrays;

/**
 * CKEditor 5 preset class. It should contain editor key, cloud configuration and editor settings.
 */
final readonly class Preset
{
    /**
     * Constructor for the Preset class.
     *
     * @param array $config Editor configuration array.
     * @param EditorType $editorType Type of CKEditor 5 editor (default is CLASSIC).
     * @param string $licenseKey License key for CKEditor 5 (default is 'GPL').
     * @param Cloud|null $cloud Optional cloud configuration array.
     */
    public function __construct(
        public array $config = [],
        public EditorType $editorType = EditorType::CLASSIC,
        public string $licenseKey = 'GPL',
        public ?Cloud $cloud = null,
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
            licenseKey: $this->licenseKey,
            cloud: $this->cloud?->clone(),
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
}
