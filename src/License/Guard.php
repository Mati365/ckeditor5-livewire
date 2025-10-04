<?php

namespace Mati365\CKEditor5Livewire\License;

/**
 * CKEditor 5 License guards. It's used to protect license key data from being accessed directly.
 */
final class Guard
{
    /**
     * Creates a new license guards instance.
     *
     * @param Key $key The license key to protect.
     */
    public function __construct(
        private Key $key
    ) {}
}
