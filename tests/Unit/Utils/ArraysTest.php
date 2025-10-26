<?php

namespace Mati365\CKEditor5Livewire\Tests\Unit\Utils;

use PHPUnit\Framework\TestCase;
use Mati365\CKEditor5Livewire\Utils\Arrays;

class ArraysTest extends TestCase
{
    public function testDeepCloneSimpleArray(): void
    {
        $original = ['a', 'b', 'c'];
        $cloned = Arrays::deepClone($original);

        $this->assertEquals($original, $cloned);
    }

    public function testDeepCloneNestedArray(): void
    {
        $original = [
            'level1' => [
                'level2' => [
                    'level3' => 'value',
                ],
            ],
        ];

        $cloned = Arrays::deepClone($original);

        $this->assertEquals($original, $cloned);
    }

    public function testDeepCloneWithObjects(): void
    {
        $object = new \stdClass();
        $object->property = 'value';

        $original = ['object' => $object];
        $cloned = Arrays::deepClone($original);

        $this->assertEquals($original, $cloned);
        $this->assertNotSame($original['object'], $cloned['object']);
    }

    public function testDeepCloneEmptyArray(): void
    {
        $original = [];
        $cloned = Arrays::deepClone($original);

        $this->assertEquals($original, $cloned);
        $this->assertEmpty($cloned);
    }

    public function testDeepCloneMixedArray(): void
    {
        $object = new \stdClass();
        $object->value = 42;

        $original = [
            'string' => 'test',
            'number' => 123,
            'nested' => [
                'array' => [1, 2, 3],
            ],
            'object' => $object,
        ];

        $cloned = Arrays::deepClone($original);

        $this->assertEquals($original, $cloned);
        $this->assertSame($original['string'], $cloned['string']);
        $this->assertSame($original['number'], $cloned['number']);
        $this->assertEquals($original['nested'], $cloned['nested']);
        $this->assertNotSame($original['object'], $cloned['object']);
        $this->assertEquals($original['object']->value, $cloned['object']->value);
    }
}
