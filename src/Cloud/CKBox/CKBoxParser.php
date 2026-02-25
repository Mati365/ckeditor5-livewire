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

        $cdnUrl = isset($data['cdnUrl']) ? (string) $data['cdnUrl'] : CKBox::DEFAULT_CDN_URL;

        return new CKBox(
            version: (string) $data['version'],
            theme: isset($data['theme']) ? (string) $data['theme'] : null,
            cdnUrl: $cdnUrl,
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

        if ($ckbox->cdnUrl !== CKBox::DEFAULT_CDN_URL) {
            $result['cdnUrl'] = $ckbox->cdnUrl;
        }

        return $result;
    }
}
