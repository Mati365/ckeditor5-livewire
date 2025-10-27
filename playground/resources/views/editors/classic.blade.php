@extends('layouts.app')

@section('title', 'Classic Editor')

@section('content')
    <div class="mb-8">
        <a href="{{ route('index') }}" class="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
            <svg class="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Index
        </a>
    </div>

    <h1 class="mb-8 font-bold text-3xl">Classic Editor Examples</h1>

    <section class="mb-16">
        <h2 class="mb-4 font-semibold text-xl">Basic Classic Editor</h2>
        <div class="bg-white dark:bg-gray-800 shadow p-6 rounded-lg">
            <livewire:ckeditor5
                content='<p>This is the initial content of the classic editor.</p>'
                :mergeConfig="[
                    'menuBar' => [
                        'isVisible' => true
                    ]
                ]"
            />
        </div>
    </section>

    <section class="mb-16">
        <h2 class="mb-4 font-semibold text-xl">Classic Editor with Custom Config</h2>
        <div class="bg-white dark:bg-gray-800 shadow p-6 rounded-lg">
            <livewire:ckeditor5
                locale="pl"
                content="<p>Editor z niestandardową konfiguracją i polskim językiem.</p>"
                :customTranslations="[
                    'pl' => [
                        'Bold' => 'Grubo',
                        'Italic' => 'Pochyło'
                    ]
                ]"
                :config="[
                    'plugins' => [
                        'Essentials',
                        'Paragraph',
                        'Bold',
                        'Italic',
                        'Link',
                        'Undo'
                    ],
                    'toolbar' => [
                        'items' => [
                            'bold',
                            'italic',
                            'link',
                            'undo',
                            'redo'
                        ]
                    ]
                ]"
            />
        </div>
    </section>

    <section class="mb-16">
        <h2 class="mb-4 font-semibold text-xl">Classic Editor with wire:model Binding</h2>
        <div class="bg-white dark:bg-gray-800 shadow p-6 rounded-lg">
            <livewire:editor-form />
        </div>
    </section>

    <section class="mb-16">
        <h2 class="mb-4 font-semibold text-xl">Classic Editor with Focus Event</h2>
        <div class="bg-white dark:bg-gray-800 shadow p-6 rounded-lg">
            <livewire:focus-demo />
        </div>
    </section>

    <section class="mb-16">
        <h2 class="mb-4 font-semibold text-xl">Classic Editor with Content Dispatch Event</h2>
        <div class="bg-white dark:bg-gray-800 shadow p-6 rounded-lg">
            <livewire:content-dispatch-demo />
        </div>
    </section>

    <section class="mb-16">
        <h2 class="mb-4 font-semibold text-xl">Template System Demo (Livewire ↔ Editor Communication)</h2>
        <div class="bg-white dark:bg-gray-800 shadow p-6 rounded-lg">
            <livewire:template-demo />
        </div>
    </section>
@endsection
