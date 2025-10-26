@extends('layouts.app')

@section('title', 'Decoupled Editor')

@section('content')
    <div class="mb-8">
        <a href="{{ route('index') }}" class="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
            <svg class="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Index
        </a>
    </div>

    <h1 class="mb-8 font-bold text-3xl">Decoupled Editor Examples</h1>

    <section class="mb-16">
        <h2 class="mb-4 font-semibold text-xl">Basic Decoupled Editor</h2>
        <p class="mb-4 text-gray-600 dark:text-gray-400 text-sm">
            The toolbar is separated from the editable area, allowing for flexible layouts.
        </p>
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
            <livewire:ckeditor5
                editorId="decoupled-editor"
                editorType="decoupled"
                :content="['main' => '<p>This is the initial content of the decoupled editor.</p>']"
            />

            <div class="p-4 border-gray-200 dark:border-gray-700 border-b">
                <livewire:ckeditor5-ui-part name="toolbar" editorId="decoupled-editor" />
            </div>

            <livewire:ckeditor5-editable
                editorId="decoupled-editor"
                class="border-gray-300"
                editableClass="p-6"
                content="<p>This is the editable area. The toolbar is rendered separately above.</p>"
            />
        </div>
    </section>

    <section class="mb-16">
        <h2 class="mb-4 font-semibold text-xl">Decoupled Editor with Custom Layout</h2>
        <p class="mb-4 text-gray-600 dark:text-gray-400 text-sm">
            You can place the toolbar anywhere in your layout.
        </p>
        <div class="gap-4 grid lg:grid-cols-[300px,1fr]">
            <div class="bg-white dark:bg-gray-800 shadow p-4 rounded-lg">
                <h3 class="mb-4 font-semibold">Toolbar</h3>
                <livewire:ckeditor5
                    editorId="decoupled-editor-2"
                    editorType="decoupled"
                    :content="['main' => '<p>Content for second editor.</p>']"
                />
                <livewire:ckeditor5-ui-part name="toolbar" editorId="decoupled-editor-2" />
            </div>

            <div class="bg-white dark:bg-gray-800 shadow p-4 rounded-lg">
                <h3 class="mb-4 font-semibold">Content Area</h3>
                <livewire:ckeditor5-editable
                    editorId="decoupled-editor-2"
                    editableClass="p-4 min-h-[400px]"
                    content="<h2>Custom Layout Example</h2><p>The toolbar is in a separate column on the left, while the content is here on the right.</p>"
                />
            </div>
        </div>
    </section>
@endsection
