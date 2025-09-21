<?php

namespace Mati365\CKEditor5;

use Illuminate\Support\Facades\Facade;

/**
 * @see \CKEditor5\CKEditor5Manager
 */
final class CKEditor extends Facade
{
    /**
     * Get the registered container name for the facade.
     *
     * @return string
     */
    #[\Override]
    protected static function getFacadeAccessor(): string
    {
        return 'ckeditor5-manager';
    }
}
