<?php

namespace Mati365\CKEditor5Livewire\Cloud\CKBox;

/**
 * CKBox information used when importing the editor from the cloud (CDN / importmap).
 *
 * This class stores data required to load CKBox — an add-on for CKEditor 5
 * provided from the cloud. These values are used to build CDN URLs or importmap
 * entries for dynamic resource loading.
 */
final class CKBox
{
    /**
     * Default CDN base URL used by the official CKBox CDN.
     */
    public const DEFAULT_CDN_URL = 'https://cdn.ckbox.io/';

    /**
     * CKBox constructor.
     *
     * @param string $version CKBox version (e.g. "1.2.3"). Used to reference the
     *                        exact package on the CDN or in an importmap.
     * @param string|null $theme Optional theme/skin for CKBox (e.g. "dark").
     * @param string $cdnUrl Base URL for the CKBox CDN (defaults to official).
     */
    public function __construct(
        public string $version,
        public ?string $theme = null,
        public string $cdnUrl = self::DEFAULT_CDN_URL,
    ) {}

    /**
     * Creates a deep clone of the current CKBox instance.
     *
     * @return self A new CKBox instance that is a deep clone of the current instance.
     */
    public function clone(): self
    {
        return new self(
            version: $this->version,
            theme: $this->theme,
            cdnUrl: $this->cdnUrl,
        );
    }

    /**
     * Returns a new instance using a different CDN base URL.
     *
     * @param string $cdnUrl The CDN base URL to use.
     * @return self
     */
    public function ofCdnUrl(string $cdnUrl): self
    {
        $clone = $this->clone();
        $clone->cdnUrl = $cdnUrl;
        return $clone;
    }
}
