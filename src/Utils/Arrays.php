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
     * @param array<array-key, mixed> $arr
     * @return array<array-key, mixed>
     */
    public static function deepClone(array $arr): array
    {
        return (array) unserialize(serialize($arr));
    }
}
