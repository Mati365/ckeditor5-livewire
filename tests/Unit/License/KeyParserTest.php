<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\License;

use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\License\{Key, KeyParser, DistributionChannel};
use Mati365\CKEditor5Livewire\Exceptions\InvalidLicenseKey;

class KeyParserTest extends TestCase
{
    public function testParseGPLKey(): void
    {
        $key = KeyParser::parse('GPL');

        $this->assertInstanceOf(Key::class, $key);
        $this->assertSame('GPL', $key->raw);
        $this->assertSame(DistributionChannel::SH, $key->distributionChannel);
        $this->assertNull($key->expiresAt);
        $this->assertTrue($key->isGPL());
    }

    public function testParseValidJWT(): void
    {
        // Create a valid JWT token with exp and distributionChannel
        $payload = [
            'exp' => time() + 3600,
            'distributionChannel' => 'sh',
        ];
        $encodedPayload = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');
        $jwt = 'header.' . $encodedPayload . '.signature';

        $key = KeyParser::parse($jwt);

        $this->assertInstanceOf(Key::class, $key);
        $this->assertSame($jwt, $key->raw);
        $this->assertSame(DistributionChannel::SH, $key->distributionChannel);
        $this->assertSame($payload['exp'], $key->expiresAt);
    }

    public function testParseJWTWithCloudDistributionChannel(): void
    {
        $payload = [
            'exp' => time() + 3600,
            'distributionChannel' => 'cloud',
        ];
        $encodedPayload = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');
        $jwt = 'header.' . $encodedPayload . '.signature';

        $key = KeyParser::parse($jwt);

        $this->assertSame(DistributionChannel::CLOUD, $key->distributionChannel);
    }

    public function testParseJWTWithShDistributionChannel(): void
    {
        $payload = [
            'exp' => time() + 3600,
            'distributionChannel' => 'sh',
        ];
        $encodedPayload = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');
        $jwt = 'header.' . $encodedPayload . '.signature';

        $key = KeyParser::parse($jwt);

        $this->assertSame(DistributionChannel::SH, $key->distributionChannel);
    }

    public function testParseEmptyKeyThrowsException(): void
    {
        $this->expectException(InvalidLicenseKey::class);
        $this->expectExceptionMessage('License key cannot be empty');

        KeyParser::parse('');
    }

    public function testParseJWTWithInvalidDistributionChannelThrowsException(): void
    {
        $payload = [
            'exp' => time() + 3600,
            'distributionChannel' => 'invalid-channel',
        ];
        $encodedPayload = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');
        $jwt = 'header.' . $encodedPayload . '.signature';

        $this->expectException(InvalidLicenseKey::class);
        $this->expectExceptionMessage('Invalid distributionChannel in JWT payload');

        KeyParser::parse($jwt);
    }

    public function testParseJWTWithInvalidBase64ThrowsException(): void
    {
        $jwt = 'header.invalid-base64!@#$.signature';

        $this->expectException(InvalidLicenseKey::class);
        $this->expectExceptionMessage('Invalid base64 encoding in JWT payload');

        KeyParser::parse($jwt);
    }

    public function testParseJWTWithInvalidJSONThrowsException(): void
    {
        $encodedPayload = rtrim(strtr(base64_encode('{invalid-json}'), '+/', '-_'), '=');
        $jwt = 'header.' . $encodedPayload . '.signature';

        $this->expectException(InvalidLicenseKey::class);
        $this->expectExceptionMessage('Invalid JSON in JWT payload');

        KeyParser::parse($jwt);
    }

    public function testDumpGPLKey(): void
    {
        $key = Key::ofGPL();
        $dumped = KeyParser::dump($key);

        $this->assertSame('GPL', $dumped);
    }

    public function testDumpJWTKey(): void
    {
        $jwt = 'header.payload.signature';
        $key = new Key(
            raw: $jwt,
            distributionChannel: DistributionChannel::SH,
            expiresAt: time() + 3600
        );

        $dumped = KeyParser::dump($key);

        $this->assertSame($jwt, $dumped);
    }

    public function testDumpAndParseRoundTrip(): void
    {
        $payload = [
            'exp' => time() + 3600,
            'distributionChannel' => 'sh',
        ];
        $encodedPayload = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');
        $jwt = 'header.' . $encodedPayload . '.signature';

        $originalKey = KeyParser::parse($jwt);
        $dumped = KeyParser::dump($originalKey);
        $parsedKey = KeyParser::parse($dumped);

        $this->assertSame($originalKey->raw, $parsedKey->raw);
        $this->assertSame($originalKey->distributionChannel, $parsedKey->distributionChannel);
        $this->assertSame($originalKey->expiresAt, $parsedKey->expiresAt);
    }

    public function testParseJWTWithoutDistributionChannel(): void
    {
        $payload = [
            'exp' => time() + 3600,
        ];
        $encodedPayload = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');
        $jwt = 'header.' . $encodedPayload . '.signature';

        $key = KeyParser::parse($jwt);

        $this->assertNull($key->distributionChannel);
        $this->assertSame($payload['exp'], $key->expiresAt);
    }
}
