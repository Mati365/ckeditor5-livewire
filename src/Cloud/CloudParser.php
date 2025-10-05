<?php

namespace Mati365\CKEditor5Livewire\Cloud;

use Respect\Validation\Validator as v;
use Respect\Validation\Exceptions\NestedValidationException;
use InvalidArgumentException;

/**
 * Parser for Cloud configuration using Respect/Validation.
 */
final class CloudParser
{
    /**
     * Parses cloud data and creates a Cloud instance.
     *
     * @param array $data Cloud data array.
     * @return Cloud The parsed Cloud instance.
     * @throws InvalidArgumentException If validation fails.
     */
    public static function parse(array $data): Cloud
    {
        $validator = v::key('editorVersion', v::stringType()->regex('/^\d+\.\d+\.\d+$/'))
            ->key('premium', v::boolType(), false)
            ->key('translations', v::optional(v::arrayType()->each(v::stringType())), false)
            ->key('ckbox', v::optional(v::arrayType()), false);

        try {
            $validator->assert($data);
        } catch (NestedValidationException $e) {
            throw new InvalidArgumentException('Cloud config validation failed: ' . implode(', ', $e->getMessages()));
        }

        $ckbox = isset($data['ckbox']) ? CKBoxParser::parse((array) $data['ckbox']) : null;

        return new Cloud(
            editorVersion: (string) $data['editorVersion'],
            premium: (bool) $data['premium'],
            translations: (array) ($data['translations'] ?? []),
            ckbox: $ckbox,
        );
    }
}
