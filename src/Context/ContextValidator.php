<?php

namespace Mati365\CKEditor5Livewire\Context;

use InvalidArgumentException;

/**
 * Validator for Context configuration arrays.
 */
final class ContextValidator
{
    public static function validate(array $data): void
    {
        $errors = [];

        if (!isset($data['config'])) {
            $errors[] = 'config is required';
        } elseif (!is_array($data['config'])) {
            $errors[] = 'config must be an array';
        }

        if (isset($data['watchdogConfig']) && !is_array($data['watchdogConfig'])) {
            $errors[] = 'watchdogConfig must be an array';
        }

        if (isset($data['customTranslations']) && !is_array($data['customTranslations'])) {
            $errors[] = 'customTranslations must be an array';
        }

        if ($errors !== []) {
            throw new InvalidArgumentException('Context config validation failed: ' . implode(', ', $errors));
        }
    }
}
