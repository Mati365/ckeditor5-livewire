<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Exceptions;

use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\Exceptions\UnknownPreset;

class UnknownPresetTest extends TestCase
{
    public function testExceptionMessageWithPresetName(): void
    {
        $exception = new UnknownPreset('custom-preset');

        $this->assertSame("Preset 'custom-preset' not found in configuration.", $exception->getMessage());
    }

    public function testExceptionWithDifferentPresetName(): void
    {
        $exception = new UnknownPreset('default');

        $this->assertSame("Preset 'default' not found in configuration.", $exception->getMessage());
    }

    public function testExceptionIsThrowable(): void
    {
        $exception = new UnknownPreset('test');

        $this->assertInstanceOf(\Exception::class, $exception);
        $this->assertInstanceOf(\Throwable::class, $exception);
    }
}
