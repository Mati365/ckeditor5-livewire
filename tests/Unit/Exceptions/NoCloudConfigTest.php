<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Exceptions;

use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\Exceptions\NoCloudConfig;

class NoCloudConfigTest extends TestCase
{
    public function testExceptionMessage(): void
    {
        $exception = new NoCloudConfig();

        $this->assertSame("Cannot render CKEditor5 assets without cloud configuration.", $exception->getMessage());
    }

    public function testExceptionIsThrowable(): void
    {
        $exception = new NoCloudConfig();

        $this->assertInstanceOf(\Exception::class, $exception);
        $this->assertInstanceOf(\Throwable::class, $exception);
    }
}
