<?php

namespace Mati365\CKEditor5Livewire\Utils;

use Illuminate\Support\Facades\App;

/**
 * Utility class for normalizing language configuration.
 */
final class LanguageNormalizer
{
    /**
     * Normalizes the language parameter into a standardized array format.
     *
     * @param array{ui?: string, content?: string}|string|null $language The language configuration
     * @return array{ui: string, content: string} The normalized language array
     */
    public static function normalize(array|string|null $language): array
    {
        if (is_string($language)) {
            return [
                'ui' => $language,
                'content' => $language,
            ];
        }

        if ($language === null) {
            $defaultLanguage = App::getLocale();

            return [
                'ui' => $defaultLanguage,
                'content' => $defaultLanguage,
            ];
        }

        return array_merge(
            [
                'ui' => 'en',
                'content' => 'en',
            ],
            $language
        );
    }
}
