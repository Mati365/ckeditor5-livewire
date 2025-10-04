<?php

namespace Mati365\CKEditor5Livewire\License;

use Mati365\CKEditor5Livewire\Exceptions\InvalidLicenseKey;

/**
 * Represents a CKEditor 5 license key.
 *
 * This class parses JWT license tokens and extracts basic information
 * such as distribution channel and expiration date.
 */
final readonly class Key
{
    /**
     * Creates a new license key instance.
     *
     * @param string $raw Raw JWT token
     * @param DistributionChannel|null $distributionChannel Distribution channel (e.g., 'npm', 'cdn')
     * @param int|null $expiresAt License expiration timestamp
     */
    public function __construct(
        public string $raw,
        public ?DistributionChannel $distributionChannel = null,
        public ?int $expiresAt = null,
    ) {}

    /**
     * Checks if the license is a GPL license.
     *
     * @return bool True if the license is GPL, false otherwise
     */
    public function isGPL(): bool
    {
        return $this->raw === 'GPL';
    }

    /**
     * Checks if the license has expired.
     *
     * @return bool True if the license has expired, false otherwise
     */
    public function isExpired(): bool
    {
        return $this->expiresAt !== null && $this->expiresAt < time();
    }

    /**
     * Parses a license key string and creates a license key instance.
     *
     * @param string $key License key string (JWT or 'GPL')
     * @return self New license key instance
     * @throws InvalidLicenseKey When the key is invalid
     */
    public static function parse(string $key)
    {
        if ($key === 'GPL') {
            return new self(
                raw: $key,
                distributionChannel: DistributionChannel::SH,
            );
        }

        return self::parseJWT($key);
    }

    /**
     * Parses a JWT token and creates a license key instance.
     *
     * @param string $jwt JWT token to parse
     * @return self New license key instance
     * @throws InvalidLicenseKey When token is empty or invalid
     */
    public static function parseJWT(string $jwt): self
    {
        if (empty($jwt)) {
            throw new InvalidLicenseKey('License key cannot be empty');
        }

        $parts = explode('.', $jwt);
        $payload = decodeJWTPayload($parts[1]);

        validateJWTPayload($payload);

        return new self(
            raw: $jwt,
            expiresAt: (int) $payload['exp'],
            distributionChannel: decodeDistributionChannel((string) $payload['distribution_channel']),
        );
    }
}

/**
 * Decodes the distribution channel from a string.
 *
 * @param string|null $channel Distribution channel string
 * @return DistributionChannel|null Decoded distribution channel or null
 * @throws InvalidLicenseKey When the channel is invalid
 */
function decodeDistributionChannel(?string $channel): ?DistributionChannel
{
    if ($channel === null) {
        return null;
    }

    $channel = DistributionChannel::tryFrom($channel);

    if ($channel === null) {
        throw new InvalidLicenseKey('Invalid distribution_channel in JWT payload');
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
function decodeJWTPayload(string $encodedPayload): array
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
    } catch (\Throwable $e) {
        throw new InvalidLicenseKey('Failed to decode JWT payload', 0, $e);
    }
}

/**
 * Validates JWT payload for required fields.
 *
 * @param array $payload JWT payload data
 * @throws InvalidLicenseKey When payload is missing required fields
 */
function validateJWTPayload(array $payload): void
{
    if (!isset($payload['distribution_channel']) || !is_string($payload['distribution_channel'])) {
        throw new InvalidLicenseKey('Missing or invalid distribution_channel in JWT payload');
    }
}
