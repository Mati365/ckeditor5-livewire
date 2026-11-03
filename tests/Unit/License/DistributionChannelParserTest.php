<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\License;

use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\License\{DistributionChannel, DistributionChannelParser};
use Mati365\CKEditor5Livewire\Exceptions\InvalidLicenseKey;

class DistributionChannelParserTest extends TestCase
{
    public function testParseNullReturnsNull(): void
    {
        $this->assertNull(DistributionChannelParser::parse(null));
    }

    public function testParseCloudString(): void
    {
        $this->assertSame(DistributionChannel::CLOUD, DistributionChannelParser::parse('cloud'));
    }

    public function testParseShString(): void
    {
        $this->assertSame(DistributionChannel::SH, DistributionChannelParser::parse('sh'));
    }

    public function testParseUnknownStringThrowsException(): void
    {
        $this->expectException(InvalidLicenseKey::class);
        $this->expectExceptionMessage('Invalid distributionChannel in JWT payload');

        DistributionChannelParser::parse('unknown-channel');
    }

    public function testParseListContainingCloud(): void
    {
        $this->assertSame(DistributionChannel::CLOUD, DistributionChannelParser::parse(['cloud']));
    }

    public function testParseListContainingSh(): void
    {
        $this->assertSame(DistributionChannel::SH, DistributionChannelParser::parse(['sh']));
    }

    public function testParseListIgnoresUnknownAndNonStringEntries(): void
    {
        $this->assertSame(
            DistributionChannel::SH,
            DistributionChannelParser::parse(['drupal', 42, null, 'sh', 'something-else'])
        );
    }

    public function testParseListContainingBothAllowsEveryChannel(): void
    {
        $this->assertNull(DistributionChannelParser::parse(['sh', 'cloud']));
    }

    public function testParseListWithoutKnownChannelThrowsException(): void
    {
        $this->expectException(InvalidLicenseKey::class);
        $this->expectExceptionMessage('Invalid distributionChannel in JWT payload');

        DistributionChannelParser::parse(['drupal', 'unknown']);
    }

    public function testParseEmptyListThrowsException(): void
    {
        $this->expectException(InvalidLicenseKey::class);

        DistributionChannelParser::parse([]);
    }

    public function testParseAssociativeArrayThrowsException(): void
    {
        $this->expectException(InvalidLicenseKey::class);

        DistributionChannelParser::parse(['channel' => 'cloud']);
    }

    public function testParseNumberThrowsException(): void
    {
        $this->expectException(InvalidLicenseKey::class);

        DistributionChannelParser::parse(42);
    }

    public function testParseBooleanThrowsException(): void
    {
        $this->expectException(InvalidLicenseKey::class);

        DistributionChannelParser::parse(true);
    }
}
