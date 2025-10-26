<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Exceptions;

use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\Exceptions\InvalidLicenseKey;

class InvalidLicenseKeyTest extends TestCase
{
    public function testExceptionMessage(): void
    {
        $exception = new InvalidLicenseKey('Invalid key format');

        $this->assertSame('Invalid key format', $exception->getMessage());
    }

    public function testExceptionWithCode(): void
    {
        $exception = new InvalidLicenseKey('Invalid key', 123);

        $this->assertSame('Invalid key', $exception->getMessage());
        $this->assertSame(123, $exception->getCode());
    }

    public function testExceptionWithPrevious(): void
    {
        $previous = new \Exception('Previous exception');
        $exception = new InvalidLicenseKey('Invalid key', 0, $previous);

        $this->assertSame('Invalid key', $exception->getMessage());
        $this->assertSame($previous, $exception->getPrevious());
    }

    public function testExceptionIsThrowable(): void
    {
        $exception = new InvalidLicenseKey('Test message');

        $this->assertInstanceOf(\Exception::class, $exception);
        $this->assertInstanceOf(\Throwable::class, $exception);
    }
}
