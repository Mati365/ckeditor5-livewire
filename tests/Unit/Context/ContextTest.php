<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Context;

use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\Context\Context;

class ContextTest extends TestCase
{
    public function testConstructorSetsProperties(): void
    {
        $config = ['plugins' => ['Plugin1', 'Plugin2']];
        $watchdogConfig = ['crashNumberLimit' => 5];
        $customTranslations = ['Save' => 'Zapisz'];

        $context = new Context(
            config: $config,
            watchdogConfig: $watchdogConfig,
            customTranslations: $customTranslations
        );

        $this->assertSame($config, $context->config);
        $this->assertSame($watchdogConfig, $context->watchdogConfig);
        $this->assertSame($customTranslations, $context->customTranslations);
    }

    public function testConstructorWithOptionalParameters(): void
    {
        $config = ['plugins' => ['Plugin1']];

        $context = new Context(config: $config);

        $this->assertSame($config, $context->config);
        $this->assertNull($context->watchdogConfig);
        $this->assertNull($context->customTranslations);
    }

    public function testCloneCreatesDeepCopy(): void
    {
        $config = ['plugins' => ['Plugin1']];
        $watchdogConfig = ['crashNumberLimit' => 5];
        $customTranslations = ['Save' => 'Zapisz'];

        $original = new Context(
            config: $config,
            watchdogConfig: $watchdogConfig,
            customTranslations: $customTranslations
        );

        $cloned = $original->clone();

        $this->assertNotSame($original, $cloned);
        $this->assertEquals($original->config, $cloned->config);
        $this->assertEquals($original->watchdogConfig, $cloned->watchdogConfig);
        $this->assertEquals($original->customTranslations, $cloned->customTranslations);

        // Modify cloned to ensure it's a deep copy
        $cloned->config['plugins'][] = 'Plugin2';
        $this->assertNotEquals($original->config, $cloned->config);
    }

    public function testOfConfigReturnsNewInstance(): void
    {
        $original = new Context(config: ['plugins' => ['Plugin1']]);
        $newConfig = ['plugins' => ['Plugin2', 'Plugin3']];

        $modified = $original->ofConfig($newConfig);

        $this->assertNotSame($original, $modified);
        $this->assertSame(['plugins' => ['Plugin1']], $original->config);
        $this->assertSame($newConfig, $modified->config);
    }

    public function testOfWatchdogConfigReturnsNewInstance(): void
    {
        $original = new Context(
            config: ['plugins' => ['Plugin1']],
            watchdogConfig: ['crashNumberLimit' => 5]
        );
        $newWatchdogConfig = ['crashNumberLimit' => 10];

        $modified = $original->ofWatchdogConfig($newWatchdogConfig);

        $this->assertNotSame($original, $modified);
        $this->assertSame(['crashNumberLimit' => 5], $original->watchdogConfig);
        $this->assertSame($newWatchdogConfig, $modified->watchdogConfig);
    }

    public function testOfWatchdogConfigCanSetToNull(): void
    {
        $original = new Context(
            config: ['plugins' => ['Plugin1']],
            watchdogConfig: ['crashNumberLimit' => 5]
        );

        $modified = $original->ofWatchdogConfig(null);

        $this->assertNotSame($original, $modified);
        $this->assertSame(['crashNumberLimit' => 5], $original->watchdogConfig);
        $this->assertNull($modified->watchdogConfig);
    }

    public function testOfCustomTranslationsReturnsNewInstance(): void
    {
        $original = new Context(
            config: ['plugins' => ['Plugin1']],
            customTranslations: ['Save' => 'Zapisz']
        );
        $newTranslations = ['Save' => 'Salvar', 'Cancel' => 'Cancelar'];

        $modified = $original->ofCustomTranslations($newTranslations);

        $this->assertNotSame($original, $modified);
        $this->assertSame(['Save' => 'Zapisz'], $original->customTranslations);
        $this->assertSame($newTranslations, $modified->customTranslations);
    }

    public function testOfCustomTranslationsCanSetToNull(): void
    {
        $original = new Context(
            config: ['plugins' => ['Plugin1']],
            customTranslations: ['Save' => 'Zapisz']
        );

        $modified = $original->ofCustomTranslations(null);

        $this->assertNotSame($original, $modified);
        $this->assertSame(['Save' => 'Zapisz'], $original->customTranslations);
        $this->assertNull($modified->customTranslations);
    }

    public function testChainedModifications(): void
    {
        $original = new Context(
            config: ['plugins' => ['Plugin1']],
            watchdogConfig: ['crashNumberLimit' => 5],
            customTranslations: ['Save' => 'Zapisz']
        );

        $modified = $original
            ->ofConfig(['plugins' => ['Plugin2']])
            ->ofWatchdogConfig(['crashNumberLimit' => 10])
            ->ofCustomTranslations(['Save' => 'Salvar']);

        $this->assertNotSame($original, $modified);
        $this->assertSame(['plugins' => ['Plugin1']], $original->config);
        $this->assertSame(['plugins' => ['Plugin2']], $modified->config);
        $this->assertSame(['crashNumberLimit' => 5], $original->watchdogConfig);
        $this->assertSame(['crashNumberLimit' => 10], $modified->watchdogConfig);
        $this->assertSame(['Save' => 'Zapisz'], $original->customTranslations);
        $this->assertSame(['Save' => 'Salvar'], $modified->customTranslations);
    }
}
