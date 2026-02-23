<?php

namespace Mati365\CKEditor5Livewire\Cloud;

use InvalidArgumentException;

/**
 * Validator for Cloud configuration arrays.
 */
final class CloudValidator
{
    /**
     * @param array $data
     * @return void
     */
    public static function validate(array $data): void
    {
        $errors = [];

        if (!isset($data['editorVersion'])) {
            $errors[] = 'editorVersion is required';
        } elseif (!is_string($data['editorVersion']) || !preg_match('/^\d+\.\d+\.\d+$/', $data['editorVersion'])) {
            $errors[] = 'editorVersion must be a semver string (e.g. "44.0.0")';
        }

        if (isset($data['premium']) && !is_bool($data['premium'])) {
            $errors[] = 'premium must be a boolean';
        }

        if (isset($data['translations'])) {
            if (!is_array($data['translations'])) {
                $errors[] = 'translations must be an array';
            } else {
                /** @psalm-suppress MixedAssignment */
                foreach ($data['translations'] as $i => $translation) {
                    if (!is_string($translation)) {
                        $errors[] = "translations[$i] must be a string";
                    }
                }
            }
        }

        if (isset($data['ckbox']) && !is_array($data['ckbox'])) {
            $errors[] = 'ckbox must be an array';
        }

        if ($errors !== []) {
            throw new InvalidArgumentException('Cloud config validation failed: ' . implode(', ', $errors));
        }
    }
}
