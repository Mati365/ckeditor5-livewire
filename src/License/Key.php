<?php

namespace Mati365\CKEditor5Livewire\License;

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
     * Creates a deep clone of the current Key instance.
     *
     * @return self A new Key instance that is a deep clone of the current instance.
     */
    public function clone(): self
    {
        return new self(
            raw: $this->raw,
            distributionChannel: $this->distributionChannel,
            expiresAt: $this->expiresAt,
        );
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
     * Checks if the license is a GPL license.
     *
     * @return bool True if the license is GPL, false otherwise
     */
    public function isGPL(): bool
    {
        return $this->raw === 'GPL';
    }

    /**
     * Checks if the license is compatible with self-hosted distribution channels only.
     *
     * @return bool True if the license is compatible with self-hosted distribution channels only, false otherwise
     */
    public function isSelfHostedOnly(): bool
    {
        return $this->distributionChannel === DistributionChannel::SH;
    }

    /**
     * Checks if the license is compatible with cloud distribution channels only.
     *
     * @return bool True if the license is compatible with cloud distribution channels only, false otherwise
     */
    public function isCloudOnly(): bool
    {
        return $this->distributionChannel === DistributionChannel::CLOUD;
    }

    /**
     * Checks if the license is compatible with any distribution channel.
     *
     * @return bool True if the license is compatible with any distribution channel, false otherwise
     */
    public function isCompatibleWithAnyDistributionChannel(): bool
    {
        return $this->distributionChannel === null;
    }

    /**
     * Checks if the license is compatible with cloud distribution channels.
     *
     * @return bool True if the license is compatible with cloud distribution channels, false otherwise
     */
    public function isCompatibleWithCloud(): bool
    {
        return $this->isCompatibleWithAnyDistributionChannel() || $this->isCloudOnly();
    }

    /**
     * Checks if the license is compatible with self-hosted distribution channels.
     *
     * @return bool True if the license is compatible with self-hosted distribution channels, false otherwise
     */
    public function isCompatibleWithSelfHosted(): bool
    {
        return $this->isCompatibleWithAnyDistributionChannel() || $this->isSelfHostedOnly();
    }

    /**
     * Creates a GPL license key instance.
     *
     * @return self New GPL license key instance
     */
    public static function ofGPL(): self
    {
        return new self(
            raw: 'GPL',
            distributionChannel: DistributionChannel::SH,
        );
    }
}
