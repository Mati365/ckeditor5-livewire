<?php

namespace Mati365\CKEditor5Livewire\Exceptions;

/**
 * Exception thrown when no cloud configuration is provided for CKEditor5.
 */
final class NoCloudConfig extends \Exception
{
    public function __construct()
    {
        parent::__construct("Cannot render CKEditor5 assets without cloud configuration.");
    }
}
