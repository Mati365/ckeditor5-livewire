<?php

namespace Mati365\CKEditor5Livewire\License;

/**
 * Represents a CKEditor 5 license key distribution channel.
 */
enum DistributionChannel: string
{
    case SH  = 'sh';  // Self-hosted, imported via npm or yarn.
    case CDN = 'cdn'; // CDN, imported via importmap or script tag.

    /**
     * Checks if this distribution channel is compatible with another.
     *
     * @param self|null $other The other distribution channel to compare with. If null, it's considered compatible.
     * @return bool True if compatible, false otherwise.
     */
    public function isCompatibleWith(?self $other): bool
    {
        return $other === null || $this === $other;
    }
}
