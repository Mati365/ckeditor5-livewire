<?php

namespace Mati365\CKEditor5Livewire\Utils;

/**
 * Utility class for array operations.
 */
final class Arrays
{
    /**
     * Deep-clone an array recursively. Objects contained within the array
     * will be cloned using PHP's serialization.
     *
     * @template T
     * @param array<array-key, T> $arr
     * @return array<array-key, T>
     */
    public static function deepClone(array $arr): array
    {
        return (array) unserialize(serialize($arr));
    }
}
