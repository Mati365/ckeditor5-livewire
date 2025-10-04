<?php

namespace Mati365\CKEditor5Livewire\Cloud;

/**
 * CKBox information used when importing the editor from the cloud (CDN / importmap).
 *
 * This class stores data required to load CKBox — an add-on for CKEditor 5
 * provided from the cloud. These values are used to build CDN URLs or importmap
 * entries for dynamic resource loading.
 */
final readonly class CKBox
{
    /**
     * CKBox constructor.
     *
     * @param string $version CKBox version (e.g. "1.2.3"). Used to reference the
     *                        exact package on the CDN or in an importmap.
     * @param string|null $theme Optional theme/skin for CKBox (e.g. "dark").
     */
    public function __construct(
        public string $version,
        public ?string $theme = null,
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
        );
    }
}
