<?php

namespace Mati365\CKEditor5Livewire\License;

use Mati365\CKEditor5Livewire\Exceptions\InvalidLicenseKey;

/**
 * Parser for the `distributionChannel` license claim.
 */
final class DistributionChannelParser
{
    /**
     * Parses the `distributionChannel` claim, which can be null, a single string or a list of strings.
     *
     * @param mixed $value Decoded claim value
     * @return DistributionChannel|null Resolved distribution channel or null when none applies
     * @throws InvalidLicenseKey When the claim is a string with an unknown value or has an unsupported type
     */
    public static function parse(mixed $value): ?DistributionChannel
    {
        if ($value === null) {
            return null;
        }

        if (is_string($value)) {
            return DistributionChannel::tryFrom($value)
                ?? throw new InvalidLicenseKey('Invalid distributionChannel in JWT payload');
        }

        if (is_array($value) && array_is_list($value)) {
            return self::parseList($value);
        }

        throw new InvalidLicenseKey('Invalid distributionChannel in JWT payload');
    }

    /**
     * Resolves a list of channel names. Unknown entries are ignored.
     * When the list contains both `cloud` and `sh`, CLOUD takes precedence.
     *
     * @param list<mixed> $values List of channel names
     * @return DistributionChannel|null Resolved distribution channel or null if the list contains no known channel
     */
    private static function parseList(array $values): ?DistributionChannel
    {
        if (in_array(DistributionChannel::CLOUD->value, $values, true)) {
            return DistributionChannel::CLOUD;
        }

        if (in_array(DistributionChannel::SH->value, $values, true)) {
            return DistributionChannel::SH;
        }

        return null;
    }
}
