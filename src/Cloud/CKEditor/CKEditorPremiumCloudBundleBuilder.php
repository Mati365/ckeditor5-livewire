<?php

namespace Mati365\CKEditor5Livewire\Cloud\CKEditor;

use Mati365\CKEditor5Livewire\Cloud\Bundle\{AssetsBundle, JSAsset, JSAssetType};

/**
 * Generates asset package URLs for CKEditor5 Premium Features.
 */
final class CKEditorPremiumCloudBundleBuilder
{
    /**
     * Base URL for the CKEditor CDN.
     */
    public const CDN_BASE_URL = 'https://cdn.ckeditor.com/';

    /**
     * Creates URLs for CKEditor5 Premium Features JavaScript and CSS files.
     *
     * @param string $version The CKEditor5 version.
     * @param string[] $translations List of translations.
     * @return AssetsBundle The asset package.
     */
    public static function build(string $version, array $translations = []): AssetsBundle
    {
        $cssUrl = self::CDN_BASE_URL . "ckeditor5-premium-features/{$version}/ckeditor5-premium-features.css";

        $jsAsset = new JSAsset(
            name: 'ckeditor5-premium-features',
            url: self::CDN_BASE_URL . "ckeditor5-premium-features/{$version}/ckeditor5-premium-features.js",
            type: JSAssetType::ESM
        );

        $translationJsAssets = array_map(
            fn(string $translation) => new JSAsset(
                name: "ckeditor5-premium-features/translations/{$translation}.js",
                url: self::CDN_BASE_URL . "ckeditor5-premium-features/{$version}/translations/{$translation}.js",
                type: JSAssetType::ESM
            ),
            $translations
        );

        return new AssetsBundle(
            js: [$jsAsset, ...$translationJsAssets],
            css: [$cssUrl]
        );
    }
}
