<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Preset;

use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\Preset\EditorType;

class EditorTypeTest extends TestCase
{
    public function testEnumHasClassicValue(): void
    {
        $this->assertSame('classic', EditorType::CLASSIC->value);
    }

    public function testEnumHasInlineValue(): void
    {
        $this->assertSame('inline', EditorType::INLINE->value);
    }

    public function testEnumHasBalloonValue(): void
    {
        $this->assertSame('balloon', EditorType::BALLOON->value);
    }

    public function testEnumHasDecoupledValue(): void
    {
        $this->assertSame('decoupled', EditorType::DECOUPLED->value);
    }

    public function testEnumHasMultirootValue(): void
    {
        $this->assertSame('multiroot', EditorType::MULTIROOT->value);
    }

    public function testFromStringValue(): void
    {
        $this->assertSame(EditorType::CLASSIC, EditorType::from('classic'));
        $this->assertSame(EditorType::INLINE, EditorType::from('inline'));
        $this->assertSame(EditorType::BALLOON, EditorType::from('balloon'));
        $this->assertSame(EditorType::DECOUPLED, EditorType::from('decoupled'));
        $this->assertSame(EditorType::MULTIROOT, EditorType::from('multiroot'));
    }

    public function testTryFromStringValue(): void
    {
        $this->assertSame(EditorType::CLASSIC, EditorType::tryFrom('classic'));
        $this->assertSame(EditorType::INLINE, EditorType::tryFrom('inline'));
        $this->assertSame(EditorType::BALLOON, EditorType::tryFrom('balloon'));
        $this->assertSame(EditorType::DECOUPLED, EditorType::tryFrom('decoupled'));
        $this->assertSame(EditorType::MULTIROOT, EditorType::tryFrom('multiroot'));
        $this->assertNull(EditorType::tryFrom('invalid'));
    }

    public function testFromInvalidStringThrowsException(): void
    {
        $this->expectException(\ValueError::class);

        EditorType::from('invalid-type');
    }

    public function testAllEditorTypesAreUnique(): void
    {
        $types = [
            EditorType::CLASSIC,
            EditorType::INLINE,
            EditorType::BALLOON,
            EditorType::DECOUPLED,
            EditorType::MULTIROOT,
        ];

        $values = array_map(fn($type) => $type->value, $types);
        $uniqueValues = array_unique($values);

        $this->assertCount(count($values), $uniqueValues);
    }
}
