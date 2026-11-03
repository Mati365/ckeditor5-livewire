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
     * @return DistributionChannel|null Resolved distribution channel or null when every channel is allowed
     * @throws InvalidLicenseKey When the claim has an unknown value, contains no known channel or has an unsupported type
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
     *
     * @param list<mixed> $values List of channel names
     * @return DistributionChannel|null The single listed channel, or null (every channel allowed) when both are listed
     * @throws InvalidLicenseKey When the list contains no known channel
     */
    private static function parseList(array $values): ?DistributionChannel
    {
        $channels = array_map(
            static fn(string $value): ?DistributionChannel => DistributionChannel::tryFrom($value),
            array_filter($values, 'is_string'),
        );

        $hasCloud = in_array(DistributionChannel::CLOUD, $channels, true);
        $hasSH = in_array(DistributionChannel::SH, $channels, true);

        if ($hasCloud && $hasSH) {
            return null;
        }

        if ($hasCloud) {
            return DistributionChannel::CLOUD;
        }

        if ($hasSH) {
            return DistributionChannel::SH;
        }

        throw new InvalidLicenseKey('Invalid distributionChannel in JWT payload');
    }
}
