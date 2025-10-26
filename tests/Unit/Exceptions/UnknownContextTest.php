<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Exceptions;

use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\Exceptions\UnknownContext;

class UnknownContextTest extends TestCase
{
    public function testExceptionMessageWithContextName(): void
    {
        $exception = new UnknownContext('custom-context');

        $this->assertSame("Context 'custom-context' not found in configuration.", $exception->getMessage());
    }

    public function testExceptionWithDifferentContextName(): void
    {
        $exception = new UnknownContext('default');

        $this->assertSame("Context 'default' not found in configuration.", $exception->getMessage());
    }

    public function testExceptionIsThrowable(): void
    {
        $exception = new UnknownContext('test');

        $this->assertInstanceOf(\Exception::class, $exception);
        $this->assertInstanceOf(\Throwable::class, $exception);
    }
}
