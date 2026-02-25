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

    public function testIsSelfHostedOnly(): void
    {
        $key1 = new Key(raw: 'token', distributionChannel: DistributionChannel::SH);
        $key2 = new Key(raw: 'token', distributionChannel: DistributionChannel::CLOUD);
        $key3 = new Key(raw: 'token'); // any

        $this->assertTrue($key1->isSelfHostedOnly());
        $this->assertFalse($key2->isSelfHostedOnly());
        $this->assertFalse($key3->isSelfHostedOnly());
    }

    public function testIsCloudOnly(): void
    {
        $key1 = new Key(raw: 'token', distributionChannel: DistributionChannel::CLOUD);
        $key2 = new Key(raw: 'token', distributionChannel: DistributionChannel::SH);
        $key3 = new Key(raw: 'token');

        $this->assertTrue($key1->isCloudOnly());
        $this->assertFalse($key2->isCloudOnly());
        $this->assertFalse($key3->isCloudOnly());
    }

    public function testIsCompatibleWithAnyDistributionChannel(): void
    {
        $key1 = new Key(raw: 'token');
        $key2 = new Key(raw: 'token', distributionChannel: DistributionChannel::SH);

        $this->assertTrue($key1->isCompatibleWithAnyDistributionChannel());
        $this->assertFalse($key2->isCompatibleWithAnyDistributionChannel());
    }

    public function testIsCompatibleWithCloud(): void
    {
        $any = new Key(raw: 'token');
        $cloud = new Key(raw: 'token', distributionChannel: DistributionChannel::CLOUD);
        $sh = new Key(raw: 'token', distributionChannel: DistributionChannel::SH);

        $this->assertTrue($any->isCompatibleWithCloud());
        $this->assertTrue($cloud->isCompatibleWithCloud());
        $this->assertFalse($sh->isCompatibleWithCloud());
    }

    public function testIsCompatibleWithSelfHosted(): void
    {
        $any = new Key(raw: 'token');
        $sh = new Key(raw: 'token', distributionChannel: DistributionChannel::SH);
        $cloud = new Key(raw: 'token', distributionChannel: DistributionChannel::CLOUD);

        $this->assertTrue($any->isCompatibleWithSelfHosted());
        $this->assertTrue($sh->isCompatibleWithSelfHosted());
        $this->assertFalse($cloud->isCompatibleWithSelfHosted());
    }
}
