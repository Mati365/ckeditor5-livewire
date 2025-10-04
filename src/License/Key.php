<?php

namespace Mati365\CKEditor5Livewire\License;

/**
 * Represents a CKEditor 5 license key.
 *
 * This class parses JWT license tokens and extracts basic information
 * such as distribution channel and expiration date.
 */
readonly class Key
{
    /**
     * Creates a new license key instance.
     *
     * @param string $raw Raw JWT token
     * @param string|null $distributionChannel Distribution channel (e.g., 'npm', 'cdn')
     * @param int $expiresAt License expiration timestamp
     */
    public function __construct(
        public string $raw,
        public ?string $distributionChannel,
        public int $expiresAt,
    ) {}

    /**
     * Checks if the license has expired.
     *
     * @return bool True if the license has expired, false otherwise
     */
    public function isExpired(): bool
    {
        return $this->expiresAt < time();
    }

    /**
     * Parses a JWT token and creates a license key instance.
     *
     * @param string $jwt JWT token to parse
     * @return self New license key instance
     * @throws CKEditor5LicenseKeyException When token is empty or invalid
     */
    public static function parseJWT(string $jwt): self
    {
        if (empty($jwt)) {
            throw new CKEditor5LicenseKeyException('License key cannot be empty');
        }

        $parts = explode('.', $jwt);
        $payload = decodeJWTPayload($parts[1]);

        validateJWTPayload($payload);

        return new self(
            raw: $jwt,
            expiresAt: (int) $payload['exp'],
            distributionChannel: isset($payload['distribution_channel'])
                ? (string) $payload['distribution_channel']
                : null,
        );
    }
}

/**
 * Exception thrown during CKEditor 5 license key parsing.
 *
 * Represents all errors related to invalid format,
 * decoding, or validation of JWT license keys.
 */
final class CKEditor5LicenseKeyException extends \Exception {}

/**
 * Decodes the payload from a JWT token.
 *
 * @param string $encodedPayload Base64url encoded payload
 * @return array Decoded payload data
 * @throws CKEditor5LicenseKeyException When decoding fails
 */
function decodeJWTPayload(string $encodedPayload): array
{
    try {
        $decoded = base64_decode(strtr($encodedPayload, '-_', '+/'), true);

        if ($decoded === false) {
            throw new CKEditor5LicenseKeyException('Invalid base64 encoding in JWT payload');
        }

        $payload = (array) json_decode($decoded, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new CKEditor5LicenseKeyException('Invalid JSON in JWT payload: ' . json_last_error_msg());
        }

        return $payload;
    } catch (CKEditor5LicenseKeyException $e) {
        throw $e;
    } catch (\Throwable $e) {
        throw new CKEditor5LicenseKeyException('Failed to decode JWT payload', 0, $e);
    }
}

/**
 * Validates JWT payload for required fields.
 *
 * @param array $payload JWT payload data
 * @throws CKEditor5LicenseKeyException When payload is missing required fields
 */
function validateJWTPayload(array $payload): void
{
    if (!isset($payload['distribution_channel']) || !is_string($payload['distribution_channel'])) {
        throw new CKEditor5LicenseKeyException('Missing or invalid distribution_channel in JWT payload');
    }
}
