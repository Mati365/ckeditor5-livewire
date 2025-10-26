@extends('layouts.app')

@section('title', 'Inline Editor')

@section('content')
    <div class="mb-8">
        <a href="{{ route('index') }}" class="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
            <svg class="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Index
        </a>
    </div>

    <h1 class="mb-8 font-bold text-3xl">Inline Editor Examples</h1>

    <section class="mb-16">
        <h2 class="mb-4 font-semibold text-xl">Basic Inline Editor</h2>
        <div class="bg-white dark:bg-gray-800 shadow p-6 rounded-lg">
            <p class="mb-4 text-gray-600 dark:text-gray-400 text-sm">
                Click on the content below to start editing. The toolbar will appear when you select text.
            </p>
            <livewire:ckeditor5
                editorId="inline-editor"
                editorType="inline"
                editableHeight="200"
                content="<p>This is the initial content of the inline editor. Click here to edit!</p>"
            />
        </div>
    </section>

    <section class="mb-16">
        <h2 class="mb-4 font-semibold text-xl">Inline Editor with Custom Styling</h2>
        <div class="bg-white dark:bg-gray-800 shadow p-6 rounded-lg">
            <livewire:ckeditor5
                editorId="inline-editor-styled"
                editorType="inline"
                editableHeight="300"
                editableClass="text-lg leading-relaxed"
                content="<h2>Welcome to Inline Editing</h2><p>This editor has custom styling applied. You can edit headings, paragraphs, and more inline without a fixed toolbar.</p><p>Try selecting some text to see the toolbar appear!</p>"
            />
        </div>
    </section>
@endsection
