<?php

namespace Mati365\CKEditor5Livewire\Cloud\Bundle;

/**
 * Represents a JavaScript asset loaded from a CDN.
 */
final readonly class JSAsset
{
    /**
     * Constructor for JSAsset.
     *
     * @param string $name The name of the asset. e.g. 'ckeditor5', it'll be used in import maps (if ESM).
     * @param string $url The URL of the asset on the CDN.
     * @param JSAssetType $type The type of the asset (ESM or UMD).
     */
    public function __construct(
        public readonly string $name,
        public readonly string $url,
        public readonly JSAssetType $type,
    ) {}
}
