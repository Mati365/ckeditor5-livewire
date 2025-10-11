<?php

namespace Mati365\CKEditor5Livewire\Cloud\Bundle;

/**
 * Represents a bundle of assets (JavaScript and CSS) loaded from a CDN.
 */
final readonly class AssetsBundle
{
    /**
     * Constructor for AssetsBundle.
     *
     * @param JSAsset[] $js Array of JavaScript assets.
     * @param string[] $css Array of CSS asset URLs.
     */
    public function __construct(
        public readonly array $js,
        public readonly array $css,
    ) {}

    /**
     * Merges two AssetsBundles into one. Returns new instance.
     *
     * @param AssetsBundle $other The other AssetsBundle to merge with.
     * @return AssetsBundle The merged AssetsBundle.
     */
    public function merge(AssetsBundle $other): AssetsBundle
    {
        return new AssetsBundle(
            js: array_merge($this->js, $other->js),
            css: array_merge($this->css, $other->css),
        );
    }
}
