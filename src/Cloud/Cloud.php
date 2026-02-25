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
final class Cloud
{
    /**
     * Default CDN base URL used by the official CKEditor CDN.
     */
    public const DEFAULT_CDN_URL = 'https://cdn.ckeditor.com/';

    /**
     * Cloud constructor.
     *
     * @param string $editorVersion The CKEditor 5 version to import (e.g. "36.0.0").
     * @param bool $premium Flag indicating whether the premium package is used.
     * @param string[] $translations List of available translations (e.g. ["pl", "en"]).
     * @param CKBox|null $ckbox CKBox information (optional) if used.
     * @param string $cdnUrl Base URL for the editor CDN. Defaults to the official CDN.
     */
    public function __construct(
        public string $editorVersion,
        public bool $premium,
        public array $translations = [],
        public ?CKBox $ckbox = null,
        public string $cdnUrl = self::DEFAULT_CDN_URL,
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
            cdnUrl: $this->cdnUrl,
        );
    }

    /**
     * Creates a new Cloud instance with modified editor version.
     *
     * @param string $editorVersion New editor version string.
     * @return self A new Cloud instance with the specified editor version.
     */
    public function ofEditorVersion(string $editorVersion): self
    {
        $clone = $this->clone();
        $clone->editorVersion = $editorVersion;
        return $clone;
    }

    /**
     * Creates a new Cloud instance with modified premium flag.
     *
     * @param bool $premium New premium flag value.
     * @return self A new Cloud instance with the specified premium flag.
     */
    public function ofPremium(bool $premium): self
    {
        $clone = $this->clone();
        $clone->premium = $premium;
        return $clone;
    }

    /**
     * Creates a new Cloud instance with modified translations.
     *
     * @param string[] $translations New list of translations.
     * @return self A new Cloud instance with the specified translations.
     */
    public function ofTranslations(array $translations): self
    {
        $clone = $this->clone();
        $clone->translations = $translations;
        return $clone;
    }

    /**
     * Creates a new Cloud instance with modified CKBox information.
     *
     * @param CKBox|null $ckbox New CKBox information (or null to remove).
     * @return self A new Cloud instance with the specified CKBox information.
     */
    public function ofCKBox(?CKBox $ckbox): self
    {
        $clone = $this->clone();
        $clone->ckbox = $ckbox;
        return $clone;
    }

    /**
     * Creates a new Cloud instance with a custom CDN URL for the editor assets.
     *
     * @param string $cdnUrl The base URL to use when generating asset paths.
     * @return self A new Cloud instance referring to the specified CDN.
     */
    public function ofCdnUrl(string $cdnUrl): self
    {
        $clone = $this->clone();
        $clone->cdnUrl = $cdnUrl;
        return $clone;
    }

    /**
     * Determines whether the cloud configuration points at the official
     * CKEditor CDN.
     *
     * @return bool True when the configuration targets the official CDN.
     */
    public function hasOfficialCdn(): bool
    {
        return $this->cdnUrl === self::DEFAULT_CDN_URL;
    }
}
