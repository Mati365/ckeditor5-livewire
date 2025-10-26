<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Utils;

use Mati365\CKEditor5Livewire\Tests\TestCase;
use Mati365\CKEditor5Livewire\Utils\LanguageNormalizer;
use Illuminate\Support\Facades\App;

class LanguageNormalizerTest extends TestCase
{
    public function testNormalizeWithStringLanguage(): void
    {
        $result = LanguageNormalizer::normalize('pl');

        $this->assertSame([
            'ui' => 'pl',
            'content' => 'pl',
        ], $result);
    }

    public function testNormalizeWithFullArrayLanguage(): void
    {
        $result = LanguageNormalizer::normalize([
            'ui' => 'en',
            'content' => 'pl',
        ]);

        $this->assertSame([
            'ui' => 'en',
            'content' => 'pl',
        ], $result);
    }

    public function testNormalizeWithPartialArrayLanguageUiOnly(): void
    {
        $result = LanguageNormalizer::normalize([
            'ui' => 'de',
        ]);

        $this->assertSame([
            'ui' => 'de',
            'content' => 'en',
        ], $result);
    }

    public function testNormalizeWithPartialArrayLanguageContentOnly(): void
    {
        $result = LanguageNormalizer::normalize([
            'content' => 'fr',
        ]);

        $this->assertSame([
            'ui' => 'en',
            'content' => 'fr',
        ], $result);
    }

    public function testNormalizeWithNull(): void
    {
        App::shouldReceive('getLocale')
            ->once()
            ->andReturn('es');

        $result = LanguageNormalizer::normalize(null);

        $this->assertSame([
            'ui' => 'es',
            'content' => 'es',
        ], $result);
    }

    public function testNormalizeWithEmptyArray(): void
    {
        $result = LanguageNormalizer::normalize([]);

        $this->assertSame([
            'ui' => 'en',
            'content' => 'en',
        ], $result);
    }

    public function testNormalizeDefaultsToEnglish(): void
    {
        $result = LanguageNormalizer::normalize([]);

        $this->assertSame('en', $result['ui']);
        $this->assertSame('en', $result['content']);
    }
}
