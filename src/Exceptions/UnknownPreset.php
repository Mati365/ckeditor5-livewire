<?php

namespace Mati365\CKEditor5Livewire\Exceptions;

/**
 * Exception thrown when a requested preset is not found in the configuration.
 */
final class UnknownPreset extends \Exception
{
    /**
     * Constructor that accepts the preset name.
     *
     * @param string $presetName The name of the preset that was not found.
     */
    public function __construct(string $presetName)
    {
        parent::__construct("Preset '{$presetName}' not found in configuration.");
    }
}
