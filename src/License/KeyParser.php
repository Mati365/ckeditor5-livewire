<?php

namespace Mati365\CKEditor5Livewire\License;

use Illuminate\Support\Facades\Log;
use Mati365\CKEditor5Livewire\Exceptions\InvalidLicenseKey;

/**
 * Parser for License Key.
 */
final class KeyParser
{
    /**
     * Parses a license key string and creates a license key instance.
     *
     * @param string $key License key string (JWT or 'GPL')
     * @return Key New license key instance
     * @throws InvalidLicenseKey When the key is invalid
     */
    public static function parse(string $key): Key
    {
        if ($key === 'GPL') {
            return Key::ofGPL();
        }

        return self::parseJWT($key);
    }

    /**
     * Parses a JWT token and creates a license key instance.
     *
     * @param string $jwt JWT token to parse
     * @return Key New license key instance
     * @throws InvalidLicenseKey When token is empty or invalid
     */
    public static function parseJWT(string $jwt): Key
    {
        if (empty($jwt)) {
            throw new InvalidLicenseKey('License key cannot be empty');
        }

        $parts = explode('.', $jwt);
        $payload = self::decodeJWTPayload($parts[1]);

        $distributionChannel = isset($payload['distributionChannel']) && is_string($payload['distributionChannel'])
            ? $payload['distributionChannel']
            : null;

        return new Key(
            raw: $jwt,
            expiresAt: (int) $payload['exp'],
            distributionChannel: self::decodeDistributionChannel($distributionChannel),
        );
    }

    /**
     * Decodes the distribution channel from a string.
     *
     * @param string|null $channel Distribution channel string
     * @return DistributionChannel|null Decoded distribution channel or null
     * @throws InvalidLicenseKey When the channel is invalid
     */
    private static function decodeDistributionChannel(?string $channel): ?DistributionChannel
    {
        if ($channel === null) {
            return null;
        }

        $channel = DistributionChannel::tryFrom($channel);

        if ($channel === null) {
            throw new InvalidLicenseKey('Invalid distributionChannel in JWT payload');
        }

        return $channel;
    }

    /**
     * Decodes the payload from a JWT token.
     *
     * @param string $encodedPayload Base64url encoded payload
     * @return array Decoded payload data
     * @throws InvalidLicenseKey When decoding fails
     */
    private static function decodeJWTPayload(string $encodedPayload): array
    {
        try {
            $decoded = base64_decode(strtr($encodedPayload, '-_', '+/'), true);

            if ($decoded === false) {
                throw new InvalidLicenseKey('Invalid base64 encoding in JWT payload');
            }

            $payload = (array) json_decode($decoded, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new InvalidLicenseKey('Invalid JSON in JWT payload: ' . json_last_error_msg());
            }

            return $payload;
        } catch (InvalidLicenseKey $e) {
            throw $e;
        }
    }

    /**
     * Dumps a Key instance back to a string suitable for re-parsing.
     *
     * - GPL keys are represented as the literal string "GPL" (same as parse() expects).
     * - Non-GPL keys are returned as their raw JWT string.
     *
     * @param Key $key The Key instance to dump
     * @return string The string representation that can be passed to KeyParser::parse()
     */
    public static function dump(Key $key): string
    {
        return $key->raw;
    }
}
