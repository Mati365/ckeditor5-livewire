<?php

namespace Mati365\CKEditor5Livewire\Cloud;

use Respect\Validation\Validator as v;
use Respect\Validation\Exceptions\NestedValidationException;
use InvalidArgumentException;

/**
 * Parser for CKBox configuration using Respect/Validation.
 */
final class CKBoxParser
{
    /**
     * Parses ckbox data and creates a CKBox instance.
     *
     * @param array $data CKBox data array.
     * @return CKBox The parsed CKBox instance.
     * @throws InvalidArgumentException If validation fails.
     */
    public static function parse(array $data): CKBox
    {
        $validator = v::key('version', v::stringType()->notEmpty())
            ->key('theme', v::optional(v::stringType()), false);

        try {
            $validator->assert($data);
        } catch (NestedValidationException $e) {
            throw new InvalidArgumentException('CKBox config validation failed: ' . implode(', ', $e->getMessages()));
        }

        return new CKBox(
            version: (string) $data['version'],
            theme: isset($data['theme']) ? (string) $data['theme'] : null,
        );
    }

    /**
     * Dump CKBox instance to an array compatible with CKBoxParser::parse().
     *
     * @param CKBox $ckbox
     * @return array
     */
    public static function dump(CKBox $ckbox): array
    {
        $result = ['version' => $ckbox->version];

        if ($ckbox->theme !== null) {
            $result['theme'] = $ckbox->theme;
        }

        return $result;
    }
}
