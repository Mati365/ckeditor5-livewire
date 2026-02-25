<?php

namespace Mati365\CKEditor5Livewire\Exceptions;

/**
 * Exception thrown when a license key cannot be used with the selected
 * cloud configuration (e.g. an SH/GPL key used with CDN hosting).
 */
final class CloudLicenseIncompatible extends \Exception
{
    /**
     * @param string $message Optional custom error message.
     */
    public function __construct(string $message = "The provided license key is not compatible with the cloud configuration.")
    {
        parent::__construct($message);
    }
}
