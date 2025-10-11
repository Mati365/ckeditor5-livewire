<?php

namespace Mati365\CKEditor5Livewire\Preset;

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
}
