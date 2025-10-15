<?php

namespace Mati365\CKEditor5Livewire\Exceptions;

/**
 * Exception thrown when a requested context is not found in the configuration.
 */
final class UnknownContext extends \Exception
{
    /**
     * Constructor that accepts the context name.
     *
     * @param string $contextName The name of the context that was not found.
     */
    public function __construct(string $contextName)
    {
        parent::__construct("Context '{$contextName}' not found in configuration.");
    }
}
