<?php

namespace Mati365\CKEditor5Livewire\Preset;

use InvalidArgumentException;

/**
 * Represents a CKEditor 5 editor type.
 */
enum EditorType: string
{
    case CLASSIC = 'classic';
    case INLINE = 'inline';
    case BALLOON = 'balloon';
    case DECOUPLED = 'decoupled';
    case MULTIROOT = 'multiroot';

    /**
     * Parses a string value to an EditorType enum instance.
     *
     * @param string $value The string value to parse.
     * @return self The corresponding EditorType instance.
     * @throws InvalidArgumentException If the value does not match any enum case.
     */
    public static function fromString(string $value): self
    {
        return match (strtolower($value)) {
            'classic' => self::CLASSIC,
            'inline' => self::INLINE,
            'balloon' => self::BALLOON,
            'decoupled' => self::DECOUPLED,
            'multiroot' => self::MULTIROOT,
            default => throw new InvalidArgumentException("Invalid editor type: {$value}"),
        };
    }
}
