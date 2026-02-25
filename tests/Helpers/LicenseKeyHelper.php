<?php

namespace Mati365\CKEditor5Livewire\Tests\Helpers;

use Mati365\CKEditor5Livewire\License\KeyParser;
use Mati365\CKEditor5Livewire\License\Key;

/**
 * Utility methods for generating dummy license keys inside tests.
 *
 * Only a very small subset of JWT semantics is required: the token may
 * contain an expiration timestamp and optional distribution channel.  The
 * helper always produces a valid base64url-encoded payload with the
 * required fields so that KeyParser::parse() will accept it.
 */
final class LicenseKeyHelper
{
    /**
     * Create a raw license key string (JWT-like) for use in configuration
     * arrays.
     *
     * @param array{exp?:int,distributionChannel?:string|null} $opts Optional configuration values.
     * @return string Raw token that can be passed to KeyParser::parse().
     */
    public static function createRaw(array $opts = []): string
    {
        $exp = $opts['exp'] ?? (time() + 3600);
        $payload = ['exp' => $exp];

        if (array_key_exists('distributionChannel', $opts)) {
            $payload['distributionChannel'] = $opts['distributionChannel'];
        }

        $encoded = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');
        return "header.{$encoded}.signature";
    }

    /**
     * Shortcut that returns an actual parsed Key instance.
     *
     * @param array{exp?:int,distributionChannel?:string|null} $opts Same as for createRaw().
     * @return Key
     */
    public static function create(array $opts = []): Key
    {
        return KeyParser::parse(self::createRaw($opts));
    }
}
