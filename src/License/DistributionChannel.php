<?php

namespace Mati365\CKEditor5Livewire\License;

/**
 * Represents a CKEditor 5 license key distribution channel.
 */
enum DistributionChannel: string
{
    case SH  = 'sh';  // Self-hosted, imported via npm or yarn.
    case CLOUD = 'cloud'; // Cloud, imported via importmap or script tag.
}
