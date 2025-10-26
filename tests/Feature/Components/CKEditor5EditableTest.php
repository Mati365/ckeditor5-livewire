<?php

namespace Mati365\CKEditor5Livewire\Tests\Feature\Components;

use Livewire\Livewire;
use Mati365\CKEditor5Livewire\Tests\TestCase;
use Mati365\CKEditor5Livewire\Components\CKEditor5Editable;

class CKEditor5EditableTest extends TestCase
{
    public function testComponentCanBeRendered(): void
    {
        $component = Livewire::test(CKEditor5Editable::class, [
            'editorId' => 'editor-123',
        ])->assertOk();

        $this->assertNotNull($component);
    }

    public function testComponentMountWithRequiredParameters(): void
    {
        $component = Livewire::test(CKEditor5Editable::class, [
            'editorId' => 'editor-123',
            'rootName' => 'sidebar',
        ]);

        $this->assertSame('editor-123', $component->editorId);
        $this->assertSame('sidebar', $component->rootName);
    }

    public function testComponentMountWithDefaultRootName(): void
    {
        $component = Livewire::test(CKEditor5Editable::class, [
            'editorId' => 'editor-123',
        ]);

        $this->assertSame('main', $component->rootName);
    }

    public function testComponentGeneratesUniqueId(): void
    {
        $component1 = Livewire::test(CKEditor5Editable::class, [
            'editorId' => 'editor-123',
        ]);
        $component2 = Livewire::test(CKEditor5Editable::class, [
            'editorId' => 'editor-123',
        ]);

        $this->assertNotSame($component1->id, $component2->id);
    }

    public function testComponentMountWithCustomId(): void
    {
        $component = Livewire::test(CKEditor5Editable::class, [
            'editorId' => 'editor-123',
            'id' => 'custom-editable-123',
        ]);

        $this->assertSame('custom-editable-123', $component->id);
    }

    public function testComponentMountWithContent(): void
    {
        $component = Livewire::test(CKEditor5Editable::class, [
            'editorId' => 'editor-123',
            'content' => '<p>Initial content</p>',
        ]);

        $this->assertSame('<p>Initial content</p>', $component->content);
    }

    public function testComponentMountWithNameAttribute(): void
    {
        $component = Livewire::test(CKEditor5Editable::class, [
            'editorId' => 'editor-123',
            'name' => 'sidebar-content',
            'required' => true,
        ]);

        $this->assertSame('sidebar-content', $component->name);
        $this->assertTrue($component->required);
    }

    public function testComponentMountWithCssClasses(): void
    {
        $component = Livewire::test(CKEditor5Editable::class, [
            'editorId' => 'editor-123',
            'class' => 'wrapper-class',
            'style' => 'margin: 10px;',
            'editableClass' => 'editor-class',
            'editableStyle' => 'padding: 5px;',
        ]);

        $this->assertSame('wrapper-class', $component->class);
        $this->assertSame('margin: 10px;', $component->style);
        $this->assertSame('editor-class', $component->editableClass);
        $this->assertSame('padding: 5px;', $component->editableStyle);
    }

    public function testComponentMountWithSaveDebounce(): void
    {
        $component = Livewire::test(CKEditor5Editable::class, [
            'editorId' => 'editor-123',
            'saveDebounceMs' => 500,
        ]);

        $this->assertSame(500, $component->saveDebounceMs);
    }

    public function testComponentMountWithDefaultSaveDebounce(): void
    {
        $component = Livewire::test(CKEditor5Editable::class, [
            'editorId' => 'editor-123',
        ]);

        $this->assertSame(300, $component->saveDebounceMs);
    }

    public function testComponentRenderReturnsView(): void
    {
        Livewire::test(CKEditor5Editable::class, [
            'editorId' => 'editor-123',
        ])->assertViewIs('ckeditor5::livewire.ckeditor5-editable');
    }
}
