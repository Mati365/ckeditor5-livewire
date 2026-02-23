<?php

namespace Mati365\CKEditor5Livewire\Cloud\CKBox;

use InvalidArgumentException;

/**
 * Parser for CKBox configuration.
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
        CKBoxValidator::validate($data);

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
