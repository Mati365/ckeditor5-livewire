<?php

namespace Mati365\CKEditor5Livewire\Preset;

use InvalidArgumentException;
use Respect\Validation\Validator as v;
use Respect\Validation\Exceptions\NestedValidationException;
use Mati365\CKEditor5Livewire\Cloud\CloudParser;
use Mati365\CKEditor5Livewire\License\{Key, KeyParser};

/**
 * Parser for Preset configuration using Respect/Validation.
 */
final class PresetParser
{
    /**
     * Parses preset data and creates a Preset instance.
     *
     * @param array $data Preset data array.
     * @return Preset The parsed Preset instance.
     * @throws InvalidArgumentException If validation fails.
     */
    public static function parse(array $data): Preset
    {
        $validator = v::key('config', v::arrayType())
            ->key('editorType', v::stringType()->notEmpty())
            ->key('licenseKey', v::optional(v::stringType()), false)
            ->key('cloud', v::optional(v::arrayType()), false)
            ->key('customTranslations', v::optional(v::arrayType()), false);

        try {
            $validator->assert($data);
        } catch (NestedValidationException $e) {
            throw new InvalidArgumentException('Preset config validation failed: ' . implode(', ', $e->getMessages()));
        }

        $editorType = EditorType::from((string) $data['editorType']);
        $cloud = isset($data['cloud'])
            ? CloudParser::parse((array) $data['cloud'])
            : null;

        if (isset($data['licenseKey'])) {
            $licenseKey = KeyParser::parse((string) $data['licenseKey']);
        } elseif (env('CKEDITOR5_LICENSE_KEY') !== null) {
            $licenseKey = KeyParser::parse((string) env('CKEDITOR5_LICENSE_KEY'));
        } else {
            $licenseKey = Key::ofGPL();
        }

        return new Preset(
            config: (array) $data['config'],
            editorType: $editorType,
            licenseKey: $licenseKey,
            cloud: $cloud,
            customTranslations: isset($data['customTranslations']) ? (array) $data['customTranslations'] : null,
        );
    }

    /**
     * Dump Preset instance to an array compatible with PresetParser::parse().
     *
     * @param Preset $preset
     * @return array
     */
    public static function dump(Preset $preset): array
    {
        $result = [
            'config' => $preset->config,
            'editorType' => $preset->editorType->value,
            'licenseKey' => KeyParser::dump($preset->licenseKey),
        ];

        if ($preset->cloud !== null) {
            $result['cloud'] = CloudParser::dump($preset->cloud);
        }

        if ($preset->customTranslations !== null) {
            $result['customTranslations'] = $preset->customTranslations;
        }

        return $result;
    }
}
