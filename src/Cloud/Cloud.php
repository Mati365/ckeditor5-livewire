<?php

namespace Mati365\CKEditor5Livewire\Cloud;

use Mati365\CKEditor5Livewire\Utils\Arrays;
use Mati365\CKEditor5Livewire\Cloud\CKBox\CKBox;

/**
 * Configuration data required to import CKEditor 5 from the cloud (CDN / importmap).
 *
 * This class holds metadata needed to generate CDN URLs or importmap entries
 * that allow loading the correct editor version and optional add-ons (e.g. CKBox).
 * It contains information about the editor version, whether it's a premium
 * package, available translations, and CKBox details.
 */
final readonly class Cloud
{
    /**
     * Cloud constructor.
     *
     * @param string $editorVersion The CKEditor 5 version to import (e.g. "36.0.0").
     * @param bool $premium Flag indicating whether the premium package is used.
     * @param string[] $translations List of available translations (e.g. ["pl", "en"]).
     * @param CKBox|null $ckbox CKBox information (optional) if used.
     */
    public function __construct(
        public string $editorVersion,
        public bool $premium,
        public array $translations = [],
        public ?CKBox $ckbox = null,
    ) {}

    /**
     * Creates a deep clone of the current Cloud instance.
     *
     * @return self A new Cloud instance that is a deep clone of the current instance.
     */
    public function clone(): self
    {
        return new self(
            editorVersion: $this->editorVersion,
            premium: $this->premium,
            translations: Arrays::deepClone($this->translations),
            ckbox: $this->ckbox?->clone(),
        );
    }
}
