<?php

namespace Mati365\CKEditor5Livewire\Tests\Feature\Components;

use Livewire\Livewire;
use Mati365\CKEditor5Livewire\Tests\TestCase;
use Mati365\CKEditor5Livewire\Components\CKEditor5;

class CKEditor5Test extends TestCase
{
    public function testComponentCanBeRendered(): void
    {
        $component = Livewire::test(CKEditor5::class)
            ->assertOk();

        $this->assertNotNull($component);
    }

    public function testComponentMountWithStringContent(): void
    {
        $component = Livewire::test(CKEditor5::class, [
            'content' => '<p>Test content</p>',
        ]);

        $this->assertSame(['main' => '<p>Test content</p>'], $component->content);
    }

    public function testComponentMountWithArrayContent(): void
    {
        $content = [
            'main' => '<p>Main content</p>',
            'sidebar' => '<p>Sidebar content</p>',
        ];

        $component = Livewire::test(CKEditor5::class, [
            'content' => $content,
        ]);

        $this->assertSame($content, $component->content);
    }

    public function testComponentMountWithPresetName(): void
    {
        config(['ckeditor5.presets.default' => [
            'config' => ['toolbar' => ['bold', 'italic']],
            'editorType' => 'classic',
        ]]);

        $component = Livewire::test(CKEditor5::class, [
            'presetName' => 'default',
        ]);

        $this->assertNotEmpty($component->preset);
        $this->assertSame('classic', $component->preset['editorType']);
    }

    public function testComponentMountWithCustomConfig(): void
    {
        config(['ckeditor5.presets.default' => [
            'config' => ['toolbar' => ['bold']],
            'editorType' => 'classic',
        ]]);

        $customConfig = ['toolbar' => ['italic', 'underline']];

        $component = Livewire::test(CKEditor5::class, [
            'config' => $customConfig,
        ]);

        $this->assertSame($customConfig, $component->preset['config']);
    }

    public function testComponentMountWithMergedConfig(): void
    {
        config(['ckeditor5.presets.default' => [
            'config' => ['toolbar' => ['bold'], 'language' => 'en'],
            'editorType' => 'classic',
        ]]);

        $mergeConfig = ['toolbar' => ['italic']];

        $component = Livewire::test(CKEditor5::class, [
            'mergeConfig' => $mergeConfig,
        ]);

        $this->assertSame(['bold', 'italic'], $component->preset['config']['toolbar']);
        $this->assertSame('en', $component->preset['config']['language']);
    }

    public function testComponentMountWithEditorType(): void
    {
        config(['ckeditor5.presets.default' => [
            'config' => ['toolbar' => ['bold']],
            'editorType' => 'classic',
        ]]);

        $component = Livewire::test(CKEditor5::class, [
            'editorType' => 'inline',
        ]);

        $this->assertSame('inline', $component->preset['editorType']);
    }

    public function testComponentGeneratesUniqueEditorId(): void
    {
        $component1 = Livewire::test(CKEditor5::class);
        $component2 = Livewire::test(CKEditor5::class);

        $this->assertNotSame($component1->editorId, $component2->editorId);
    }

    public function testComponentMountWithCustomEditorId(): void
    {
        $component = Livewire::test(CKEditor5::class, [
            'editorId' => 'custom-editor-123',
        ]);

        $this->assertSame('custom-editor-123', $component->editorId);
    }

    public function testComponentMountWithWatchdog(): void
    {
        $component = Livewire::test(CKEditor5::class, [
            'watchdog' => true,
        ]);

        $this->assertTrue($component->watchdog);
    }

    public function testComponentMountWithContextId(): void
    {
        $component = Livewire::test(CKEditor5::class, [
            'contextId' => 'context-123',
        ]);

        $this->assertSame('context-123', $component->contextId);
    }

    public function testComponentMountWithSaveDebounce(): void
    {
        $component = Livewire::test(CKEditor5::class, [
            'saveDebounceMs' => 500,
        ]);

        $this->assertSame(500, $component->saveDebounceMs);
    }

    public function testComponentMountWithEditableHeight(): void
    {
        $component = Livewire::test(CKEditor5::class, [
            'editableHeight' => 400,
        ]);

        $this->assertSame(400, $component->editableHeight);
    }

    public function testComponentMountWithStringLocale(): void
    {
        $component = Livewire::test(CKEditor5::class, [
            'locale' => 'pl',
        ]);

        $this->assertSame(['ui' => 'pl', 'content' => 'pl'], $component->language);
    }

    public function testComponentMountWithArrayLocale(): void
    {
        $component = Livewire::test(CKEditor5::class, [
            'locale' => ['ui' => 'en', 'content' => 'pl'],
        ]);

        $this->assertSame(['ui' => 'en', 'content' => 'pl'], $component->language);
    }

    public function testComponentMountWithNameAttribute(): void
    {
        $component = Livewire::test(CKEditor5::class, [
            'name' => 'editor-content',
            'required' => true,
        ]);

        $this->assertSame('editor-content', $component->name);
        $this->assertTrue($component->required);
    }

    public function testComponentMountWithCssClasses(): void
    {
        $component = Livewire::test(CKEditor5::class, [
            'class' => 'custom-class',
            'style' => 'color: red;',
        ]);

        $this->assertSame('custom-class', $component->class);
        $this->assertSame('position: relative; color: red;', $component->style);
    }

    public function testComponentMountWithCustomTranslations(): void
    {
        config(['ckeditor5.presets.default' => [
            'config' => ['toolbar' => ['bold']],
            'editorType' => 'classic',
        ]]);

        $translations = ['Save' => 'Zapisz', 'Cancel' => 'Anuluj'];

        $component = Livewire::test(CKEditor5::class, [
            'customTranslations' => $translations,
        ]);

        $this->assertSame($translations, $component->preset['customTranslations']);
    }

    public function testComponentDispatchesFocusChangeEvent(): void
    {
        $component = Livewire::test(CKEditor5::class);

        $component->set('focused', true)
            ->assertDispatched('editor-focus-changed', editorId: $component->get('editorId'), focused: true);

        $component->set('focused', false)
            ->assertDispatched('editor-focus-changed', editorId: $component->get('editorId'), focused: false);
    }

    public function testComponentRenderReturnsView(): void
    {
        config(['ckeditor5.presets.default' => [
            'config' => ['toolbar' => ['bold']],
            'editorType' => 'classic',
        ]]);

        Livewire::test(CKEditor5::class)
            ->assertViewIs('ckeditor5::livewire.ckeditor5');
    }
}
