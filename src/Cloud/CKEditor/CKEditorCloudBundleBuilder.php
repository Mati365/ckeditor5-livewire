<?php

namespace Mati365\CKEditor5Livewire\Cloud\CKEditor;

use Mati365\CKEditor5Livewire\Cloud\Bundle\{AssetsBundle, JSAsset, JSAssetType};

/**
 * Generates asset package URLs for CKEditor5 core files.
 */
final class CKEditorCloudBundleBuilder
{
    /**
     * Creates URLs for CKEditor5 core JavaScript and CSS files.
     *
     * @param string $version The CKEditor5 version.
     * @param string $cdnBaseUrl Base CDN URL to use for generated assets.
     * @param string[] $translations List of translations.
     * @return AssetsBundle The asset package.
     */
    public static function build(string $version, string $cdnBaseUrl, array $translations = []): AssetsBundle
    {
        $base = $cdnBaseUrl;
        $cssUrl = $base . "ckeditor5/{$version}/ckeditor5.css";

        $jsAsset = new JSAsset(
            name: 'ckeditor5',
            url: $base . "ckeditor5/{$version}/ckeditor5.js",
            type: JSAssetType::ESM
        );

        $translationJsAssets = array_map(
            fn(string $translation) => new JSAsset(
                name: "ckeditor5/translations/{$translation}.js",
                url: $base . "ckeditor5/{$version}/translations/{$translation}.js",
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
