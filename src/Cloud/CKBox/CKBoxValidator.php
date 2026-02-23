<?php

namespace Mati365\CKEditor5Livewire\Cloud\CKBox;

use InvalidArgumentException;

/**
 * Validator for CKBox configuration arrays.
 */
final class CKBoxValidator
{
    public static function validate(array $data): void
    {
        $errors = [];

        if (!isset($data['version'])) {
            $errors[] = 'version is required';
        } elseif (!is_string($data['version']) || $data['version'] === '') {
            $errors[] = 'version must be a non-empty string';
        }

        if (isset($data['theme']) && (!is_string($data['theme']) || $data['theme'] === '')) {
            $errors[] = 'theme must be a non-empty string';
        }

        if ($errors !== []) {
            throw new InvalidArgumentException('CKBox config validation failed: ' . implode(', ', $errors));
        }
    }
}
