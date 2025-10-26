<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\License;

use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\License\{Key, DistributionChannel};

class KeyTest extends TestCase
{
    public function testConstructorSetsProperties(): void
    {
        $raw = 'test-jwt-token';
        $distributionChannel = DistributionChannel::SH;
        $expiresAt = time() + 3600;

        $key = new Key(
            raw: $raw,
            distributionChannel: $distributionChannel,
            expiresAt: $expiresAt
        );

        $this->assertSame($raw, $key->raw);
        $this->assertSame($distributionChannel, $key->distributionChannel);
        $this->assertSame($expiresAt, $key->expiresAt);
    }

    public function testConstructorWithOptionalParameters(): void
    {
        $key = new Key(raw: 'test-token');

        $this->assertSame('test-token', $key->raw);
        $this->assertNull($key->distributionChannel);
        $this->assertNull($key->expiresAt);
    }

    public function testCloneCreatesNewInstance(): void
    {
        $original = new Key(
            raw: 'test-token',
            distributionChannel: DistributionChannel::CLOUD,
            expiresAt: time() + 3600
        );

        $cloned = $original->clone();

        $this->assertNotSame($original, $cloned);
        $this->assertSame($original->raw, $cloned->raw);
        $this->assertSame($original->distributionChannel, $cloned->distributionChannel);
        $this->assertSame($original->expiresAt, $cloned->expiresAt);
    }

    public function testIsExpiredReturnsTrueForExpiredKey(): void
    {
        $key = new Key(
            raw: 'test-token',
            expiresAt: time() - 3600 // 1 hour ago
        );

        $this->assertTrue($key->isExpired());
    }

    public function testIsExpiredReturnsFalseForValidKey(): void
    {
        $key = new Key(
            raw: 'test-token',
            expiresAt: time() + 3600 // 1 hour from now
        );

        $this->assertFalse($key->isExpired());
    }

    public function testIsExpiredReturnsFalseWhenExpiresAtIsNull(): void
    {
        $key = new Key(
            raw: 'test-token',
            expiresAt: null
        );

        $this->assertFalse($key->isExpired());
    }

    public function testIsGPLReturnsTrueForGPLKey(): void
    {
        $key = new Key(raw: 'GPL');

        $this->assertTrue($key->isGPL());
    }

    public function testIsGPLReturnsFalseForNonGPLKey(): void
    {
        $key = new Key(raw: 'some-jwt-token');

        $this->assertFalse($key->isGPL());
    }

    public function testOfGPLCreatesGPLKey(): void
    {
        $key = Key::ofGPL();

        $this->assertSame('GPL', $key->raw);
        $this->assertSame(DistributionChannel::SH, $key->distributionChannel);
        $this->assertNull($key->expiresAt);
        $this->assertTrue($key->isGPL());
    }
}
