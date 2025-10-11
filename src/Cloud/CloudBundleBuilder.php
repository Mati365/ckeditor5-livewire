<?php

namespace Mati365\CKEditor5Livewire\Cloud;

use Mati365\CKEditor5Livewire\Cloud\Bundle\AssetsBundle;
use Mati365\CKEditor5Livewire\Cloud\CKEditor\{CKEditorCloudBundleBuilder, CKEditorPremiumCloudBundleBuilder};
use Mati365\CKEditor5Livewire\Cloud\CKBox\CKBoxCloudBundleBuilder;

/**
 * Builds an AssetsBundle from a Cloud configuration.
 */
final readonly class CloudBundleBuilder
{
    /**
     * Creates an AssetsBundle from the given Cloud configuration.
     *
     * @param Cloud $cloud The Cloud configuration.
     * @return AssetsBundle The resulting AssetsBundle.
     */
    public static function build(Cloud $cloud): AssetsBundle
    {
        $editorBundle = CKEditorCloudBundleBuilder::build($cloud->editorVersion, $cloud->translations);

        if ($cloud->premium) {
            $premiumBundle = CKEditorPremiumCloudBundleBuilder::build($cloud->editorVersion, $cloud->translations);
            $editorBundle = $editorBundle->merge($premiumBundle);
        }

        if ($cloud->ckbox !== null) {
            $ckboxBundle = CKBoxCloudBundleBuilder::build(
                $cloud->ckbox->version,
                $cloud->translations,
                $cloud->ckbox->theme ?? 'theme'
            );

            $editorBundle = $editorBundle->merge($ckboxBundle);
        }

        return $editorBundle;
    }
}
