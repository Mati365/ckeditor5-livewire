<?php

namespace Mati365\CKEditor5Livewire\Tests\Feature\Components;

use Livewire\Livewire;
use Mati365\CKEditor5Livewire\Tests\TestCase;
use Mati365\CKEditor5Livewire\Components\CKEditor5UIPart;
use Illuminate\View\ViewException;

class CKEditor5UIPartTest extends TestCase
{
    public function testComponentCanBeRendered(): void
    {
        $component = Livewire::test(CKEditor5UIPart::class, [
            'editorId' => 'test-editor',
            'name' => 'toolbar',
        ])->assertOk();

        $this->assertNotNull($component);
    }

    public function testComponentMountWithToolbar(): void
    {
        $component = Livewire::test(CKEditor5UIPart::class, [
            'editorId' => 'test-editor',
            'name' => 'toolbar',
        ]);

        $this->assertSame('test-editor', $component->editorId);
        $this->assertSame('toolbar', $component->name);
        $this->assertStringStartsWith('ckeditor-ui-part-', $component->uiPartId);
    }

    public function testComponentMountWithMenubar(): void
    {
        $component = Livewire::test(CKEditor5UIPart::class, [
            'editorId' => 'test-editor',
            'name' => 'menubar',
        ]);

        $this->assertSame('test-editor', $component->editorId);
        $this->assertSame('menubar', $component->name);
    }

    public function testComponentGeneratesUniqueUIPartId(): void
    {
        $component1 = Livewire::test(CKEditor5UIPart::class, [
            'editorId' => 'test-editor',
            'name' => 'toolbar',
        ]);

        $component2 = Livewire::test(CKEditor5UIPart::class, [
            'editorId' => 'test-editor',
            'name' => 'toolbar',
        ]);

        $this->assertNotSame($component1->uiPartId, $component2->uiPartId);
    }

    public function testComponentMountWithCustomUIPartId(): void
    {
        $component = Livewire::test(CKEditor5UIPart::class, [
            'editorId' => 'test-editor',
            'name' => 'toolbar',
            'uiPartId' => 'custom-ui-part-123',
        ]);

        $this->assertSame('custom-ui-part-123', $component->uiPartId);
    }

    public function testComponentMountWithCssClasses(): void
    {
        $component = Livewire::test(CKEditor5UIPart::class, [
            'editorId' => 'test-editor',
            'name' => 'toolbar',
            'class' => 'custom-toolbar-class',
            'style' => 'border: 1px solid red;',
        ]);

        $this->assertSame('custom-toolbar-class', $component->class);
        $this->assertSame('border: 1px solid red;', $component->style);
    }

    public function testComponentMountWithoutCssClasses(): void
    {
        $component = Livewire::test(CKEditor5UIPart::class, [
            'editorId' => 'test-editor',
            'name' => 'toolbar',
        ]);

        $this->assertNull($component->class);
        $this->assertNull($component->style);
    }

    public function testComponentThrowsExceptionForInvalidUIPartName(): void
    {
        $this->expectException(ViewException::class);
        $this->expectExceptionMessage('Invalid UI part name: "invalid". Supported names are "toolbar" and "menubar".');

        Livewire::test(CKEditor5UIPart::class, [
            'editorId' => 'test-editor',
            'name' => 'invalid',
        ]);
    }

    public function testComponentThrowsExceptionForEmptyUIPartName(): void
    {
        $this->expectException(ViewException::class);
        $this->expectExceptionMessage('Invalid UI part name: "". Supported names are "toolbar" and "menubar".');

        Livewire::test(CKEditor5UIPart::class, [
            'editorId' => 'test-editor',
            'name' => '',
        ]);
    }

    public function testComponentThrowsExceptionForSidebar(): void
    {
        $this->expectException(ViewException::class);
        $this->expectExceptionMessage('Invalid UI part name: "sidebar". Supported names are "toolbar" and "menubar".');

        Livewire::test(CKEditor5UIPart::class, [
            'editorId' => 'test-editor',
            'name' => 'sidebar',
        ]);
    }

    public function testComponentRenderReturnsView(): void
    {
        Livewire::test(CKEditor5UIPart::class, [
            'editorId' => 'test-editor',
            'name' => 'toolbar',
        ])->assertViewIs('ckeditor5::livewire.ckeditor5-ui-part');
    }

    public function testComponentWithDifferentEditorIds(): void
    {
        $component1 = Livewire::test(CKEditor5UIPart::class, [
            'editorId' => 'editor-1',
            'name' => 'toolbar',
        ]);

        $component2 = Livewire::test(CKEditor5UIPart::class, [
            'editorId' => 'editor-2',
            'name' => 'toolbar',
        ]);

        $this->assertSame('editor-1', $component1->editorId);
        $this->assertSame('editor-2', $component2->editorId);
        $this->assertNotSame($component1->editorId, $component2->editorId);
    }

    public function testComponentWithLongEditorId(): void
    {
        $longEditorId = 'ckeditor-' . str_repeat('a', 100);

        $component = Livewire::test(CKEditor5UIPart::class, [
            'editorId' => $longEditorId,
            'name' => 'menubar',
        ]);

        $this->assertSame($longEditorId, $component->editorId);
    }

    public function testComponentWithSpecialCharactersInEditorId(): void
    {
        $component = Livewire::test(CKEditor5UIPart::class, [
            'editorId' => 'editor-123_test',
            'name' => 'toolbar',
        ]);

        $this->assertSame('editor-123_test', $component->editorId);
    }

    public function testComponentWithAllParametersCombined(): void
    {
        $component = Livewire::test(CKEditor5UIPart::class, [
            'editorId' => 'main-editor',
            'name' => 'menubar',
            'uiPartId' => 'main-menubar',
            'class' => 'custom-class another-class',
            'style' => 'padding: 10px; margin: 5px;',
        ]);

        $this->assertSame('main-editor', $component->editorId);
        $this->assertSame('menubar', $component->name);
        $this->assertSame('main-menubar', $component->uiPartId);
        $this->assertSame('custom-class another-class', $component->class);
        $this->assertSame('padding: 10px; margin: 5px;', $component->style);
    }
}
