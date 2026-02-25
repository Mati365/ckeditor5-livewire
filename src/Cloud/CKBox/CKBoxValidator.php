<?php

namespace Mati365\CKEditor5Livewire\Cloud\CKBox;

use InvalidArgumentException;

/**
 * Validator for CKBox configuration arrays.
 */
final class CKBoxValidator
{
    /**
     * Validates the given CKBox data array.
     *
     * @param array $data The CKBox data to validate.
     * @throws InvalidArgumentException If validation fails with details about the errors.
     * @return void
     */
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

        if (isset($data['cdnUrl']) && !is_string($data['cdnUrl'])) {
            $errors[] = 'cdnUrl must be a string';
        }

        if ($errors !== []) {
            throw new InvalidArgumentException('CKBox config validation failed: ' . implode(', ', $errors));
        }
    }
}
