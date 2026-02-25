<?php

namespace Mati365\CKEditor5Livewire\Cloud;

use InvalidArgumentException;
use Mati365\CKEditor5Livewire\Cloud\CKBox\CKBoxParser;

/**
 * Parser for Cloud configuration.
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
        CloudValidator::validate($data);

        $ckbox = isset($data['ckbox']) ? CKBoxParser::parse((array) $data['ckbox']) : null;
        $translations = isset($data['translations']) ? (array) $data['translations'] : [];
        $cdnUrl = isset($data['cdnUrl']) ? (string) $data['cdnUrl'] : Cloud::DEFAULT_CDN_URL;

        /** @var string[] $translations */
        return new Cloud(
            editorVersion: (string) $data['editorVersion'],
            premium: (bool) $data['premium'],
            translations: $translations,
            ckbox: $ckbox,
            cdnUrl: $cdnUrl,
        );
    }

    /**
     * Dump Cloud instance to an array compatible with CloudParser::parse().
     *
     * @param Cloud $cloud
     * @return array
     */
    public static function dump(Cloud $cloud): array
    {
        $result = [
            'editorVersion' => $cloud->editorVersion,
            'premium' => $cloud->premium,
        ];

        if (!empty($cloud->translations)) {
            $result['translations'] = $cloud->translations;
        }

        if ($cloud->ckbox !== null) {
            $result['ckbox'] = CKBoxParser::dump($cloud->ckbox);
        }

        if ($cloud->cdnUrl !== Cloud::DEFAULT_CDN_URL) {
            $result['cdnUrl'] = $cloud->cdnUrl;
        }

        return $result;
    }
}
