<?php

namespace Mati365\CKEditor5Livewire\Cloud\CKBox;

use Mati365\CKEditor5Livewire\Cloud\Bundle\{AssetsBundle, JSAsset, JSAssetType};

/**
 * Builds an AssetsBundle for CKBox based on the provided Cloud configuration.
 */
final readonly class CKBoxCloudBundleBuilder
{
    /**
     * Builds an AssetsBundle for CKBox based on the provided version, translations, and theme.
     *
     * This method generates URLs for CKBox JavaScript and CSS assets, including
     * translations if specified.
     *
     * @param string $version The CKBox version.
     * @param string $cdnBaseUrl Base CDN URL to use for generated assets.
     * @param string[] $translations List of translations.
     * @param string $theme The theme name (defaults to 'theme').
     * @return AssetsBundle The bundle containing JS and CSS assets for CKBox.
     */
    public static function build(string $version, string $cdnBaseUrl, array $translations = [], string $theme = 'theme'): AssetsBundle
    {
        $base = $cdnBaseUrl;
        $css = [$base . "ckbox/{$version}/styles/themes/{$theme}.css"];
        $js = [
            new JSAsset(
                name: 'ckbox',
                url: $base . "ckbox/{$version}/ckbox.js",
                type: JSAssetType::UMD
            ),
        ];

        foreach ($translations as $translation) {
            $js[] = new JSAsset(
                name: "ckbox/translations/{$translation}",
                url: $base . "ckbox/{$version}/translations/{$translation}.js",
                type: JSAssetType::UMD
            );
        }

        return new AssetsBundle(js: $js, css: $css);
    }
}
