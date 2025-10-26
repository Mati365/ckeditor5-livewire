<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\License;

use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\License\DistributionChannel;

class DistributionChannelTest extends TestCase
{
    public function testEnumHasShValue(): void
    {
        $this->assertSame('sh', DistributionChannel::SH->value);
    }

    public function testEnumHasCloudValue(): void
    {
        $this->assertSame('cloud', DistributionChannel::CLOUD->value);
    }

    public function testIsCompatibleWithSameChannel(): void
    {
        $sh = DistributionChannel::SH;

        $this->assertTrue($sh->isCompatibleWith(DistributionChannel::SH));
    }

    public function testIsCompatibleWithDifferentChannel(): void
    {
        $sh = DistributionChannel::SH;
        $cloud = DistributionChannel::CLOUD;

        $this->assertFalse($sh->isCompatibleWith($cloud));
        $this->assertFalse($cloud->isCompatibleWith($sh));
    }

    public function testIsCompatibleWithNull(): void
    {
        $sh = DistributionChannel::SH;
        $cloud = DistributionChannel::CLOUD;

        $this->assertTrue($sh->isCompatibleWith(null));
        $this->assertTrue($cloud->isCompatibleWith(null));
    }

    public function testFromStringValue(): void
    {
        $sh = DistributionChannel::from('sh');
        $cloud = DistributionChannel::from('cloud');

        $this->assertSame(DistributionChannel::SH, $sh);
        $this->assertSame(DistributionChannel::CLOUD, $cloud);
    }

    public function testTryFromStringValue(): void
    {
        $sh = DistributionChannel::tryFrom('sh');
        $cloud = DistributionChannel::tryFrom('cloud');
        $invalid = DistributionChannel::tryFrom('invalid');

        $this->assertSame(DistributionChannel::SH, $sh);
        $this->assertSame(DistributionChannel::CLOUD, $cloud);
        $this->assertNull($invalid);
    }
}
