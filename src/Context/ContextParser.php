<?php

namespace Mati365\CKEditor5Livewire\Context;

use InvalidArgumentException;
use Respect\Validation\Validator as v;
use Respect\Validation\Exceptions\NestedValidationException;

/**
 * Parser for Context configuration using Respect/Validation.
 */
final class ContextParser
{
    /**
     * Parses context data and creates a Context instance.
     *
     * @param array $data Context data array.
     * @return Context The parsed Context instance.
     * @throws InvalidArgumentException If validation fails.
     */
    public static function parse(array $data): Context
    {
        $validator = v::key('config', v::arrayType())
            ->key('watchdogConfig', v::optional(v::arrayType()), false)
            ->key('customTranslations', v::optional(v::arrayType()), false);

        try {
            $validator->assert($data);
        } catch (NestedValidationException $e) {
            throw new InvalidArgumentException('Context config validation failed: ' . implode(', ', $e->getMessages()));
        }

        return new Context(
            config: (array) $data['config'],
            watchdogConfig: isset($data['watchdogConfig']) ? (array) $data['watchdogConfig'] : null,
            customTranslations: isset($data['customTranslations']) ? (array) $data['customTranslations'] : null,
        );
    }

    /**
     * Dump Context instance to an array compatible with ContextParser::parse().
     *
     * @param Context $context
     * @return array
     */
    public static function dump(Context $context): array
    {
        $result = [
            'config' => $context->config,
        ];

        if ($context->watchdogConfig !== null) {
            $result['watchdogConfig'] = $context->watchdogConfig;
        }

        if ($context->customTranslations !== null) {
            $result['customTranslations'] = $context->customTranslations;
        }

        return $result;
    }
}
