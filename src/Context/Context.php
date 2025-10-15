<?php

namespace Mati365\CKEditor5Livewire\Context;

use Mati365\CKEditor5Livewire\Utils\Arrays;

/**
 * CKEditor 5 context class. Represents a shared context configuration for multiple editor instances.
 */
final class Context
{
    /**
     * Constructor for the Context class.
     *
     * @param array $config Context configuration array containing plugins and other settings.
     * @param array|null $watchdogConfig Optional watchdog configuration for error recovery.
     * @param array|null $customTranslations Optional custom translations dictionary.
     */
    public function __construct(
        public array $config,
        public ?array $watchdogConfig = null,
        public ?array $customTranslations = null,
    ) {}

    /**
     * Creates a deep clone of the current Context instance.
     *
     * @return self A new Context instance that is a deep clone of the current instance.
     */
    public function clone(): self
    {
        return new self(
            config: Arrays::deepClone($this->config),
            watchdogConfig: $this->watchdogConfig !== null ? Arrays::deepClone($this->watchdogConfig) : null,
            customTranslations: $this->customTranslations !== null ? Arrays::deepClone($this->customTranslations) : null,
        );
    }

    /**
     * Creates a new Context instance with modified configuration.
     *
     * @param array $config New context configuration array.
     * @return self A new Context instance with the specified configuration.
     */
    public function ofConfig(array $config): self
    {
        $clone = $this->clone();
        $clone->config = $config;
        return $clone;
    }

    /**
     * Creates a new Context instance with modified watchdog configuration.
     *
     * @param array|null $watchdogConfig New watchdog configuration.
     * @return self A new Context instance with the specified watchdog configuration.
     */
    public function ofWatchdogConfig(?array $watchdogConfig): self
    {
        $clone = $this->clone();
        $clone->watchdogConfig = $watchdogConfig;
        return $clone;
    }

    /**
     * Creates a new Context instance with modified custom translations.
     *
     * @param array|null $customTranslations New custom translations dictionary.
     * @return self A new Context instance with the specified custom translations.
     */
    public function ofCustomTranslations(?array $customTranslations): self
    {
        $clone = $this->clone();
        $clone->customTranslations = $customTranslations;
        return $clone;
    }
}
