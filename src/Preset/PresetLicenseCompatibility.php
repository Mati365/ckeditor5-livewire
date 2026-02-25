<?php

namespace Mati365\CKEditor5Livewire\Preset;

use Mati365\CKEditor5Livewire\Cloud\Cloud;
use Mati365\CKEditor5Livewire\Exceptions\{CloudLicenseIncompatible, NoCloudConfig};

/**
 * Utility class for validating that a preset's license key is compatible with the cloud configuration it contains.
 * This is used to ensure that presets with incompatible license keys are not used with cloud configurations.
 */
final class PresetLicenseCompatibility
{
    /**
     * Ensures that the provided preset contains a cloud configuration and that
     * the associated license key is compatible with it. If one of the checks
     * fails an exception is thrown describing the problem.
     *
     * @param Preset $preset The preset to validate.
     * @return Cloud The non-null Cloud configuration stored in the preset; a
     *               caller can use the returned value when building assets.
     *
     * @throws NoCloudConfig When the preset does not contain any cloud data.
     * @throws CloudLicenseIncompatible When the license key cannot be used with
     *                                  the cloud configuration.
     */
    public static function ensureCloudCompatibilityOrThrow(Preset $preset): Cloud
    {
        if ($preset->cloud === null) {
            throw new NoCloudConfig();
        }

        $license = $preset->licenseKey;
        $cloud = $preset->cloud;

        if ($cloud->hasOfficialCdn() && !$license->isCompatibleWithCloud()) {
            throw new CloudLicenseIncompatible(
                "The license key associated with the preset is not compatible with CKEditor Cloud CDN hosting. "
                . "Please ensure that the preset's license key is valid for cloud usage or switch to a different CDN hosting option."
            );
        }

        return $cloud;
    }
}
