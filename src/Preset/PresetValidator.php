<?php

namespace Mati365\CKEditor5Livewire\Preset;

use InvalidArgumentException;

/**
 * Validator for Preset configuration arrays.
 */
final class PresetValidator
{
    public static function validate(array $data): void
    {
        $errors = [];

        if (!isset($data['config'])) {
            $errors[] = 'config is required';
        } elseif (!is_array($data['config'])) {
            $errors[] = 'config must be an array';
        }

        if (!isset($data['editorType'])) {
            $errors[] = 'editorType is required';
        } elseif (!is_string($data['editorType']) || $data['editorType'] === '') {
            $errors[] = 'editorType must be a non-empty string';
        }

        if (isset($data['licenseKey']) && !is_string($data['licenseKey'])) {
            $errors[] = 'licenseKey must be a string';
        }

        if (isset($data['cloud']) && !is_array($data['cloud'])) {
            $errors[] = 'cloud must be an array';
        }

        if (isset($data['customTranslations']) && !is_array($data['customTranslations'])) {
            $errors[] = 'customTranslations must be an array';
        }

        if ($errors !== []) {
            throw new InvalidArgumentException('Preset config validation failed: ' . implode(', ', $errors));
        }
    }
}
