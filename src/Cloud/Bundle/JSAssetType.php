<?php

namespace Mati365\CKEditor5Livewire\Cloud\Bundle;

/**
 * Enum representing the type of JavaScript asset.
 */
enum JSAssetType: string
{
    case ESM = 'esm';
    case UMD = 'umd';
}
