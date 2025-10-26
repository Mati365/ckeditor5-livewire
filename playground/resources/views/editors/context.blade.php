@extends('layouts.app')

@section('title', 'Context Editor')

@section('content')
    <div class="mb-8">
        <a href="{{ route('index') }}" class="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
            <svg class="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Index
        </a>
    </div>

    <h1 class="mb-8 font-bold text-3xl">Context Editor Examples</h1>

    <section class="mb-16">
        <h2 class="mb-4 font-semibold text-xl">Multiple Editors with Shared Context</h2>
        <p class="mb-4 text-gray-600 dark:text-gray-400 text-sm">
            Multiple editor instances can share the same configuration and plugins through a context.
        </p>

        <div class="space-y-6">
            <livewire:ckeditor5-context contextId="my-context" />

            <div class="bg-white dark:bg-gray-800 shadow p-6 rounded-lg">
                <h3 class="mb-2 font-semibold">Editor 1</h3>
                <livewire:ckeditor5
                    contextId="my-context"
                    content="<p>This is the first editor using the shared context.</p>"
                />
            </div>

            <div class="bg-white dark:bg-gray-800 shadow p-6 rounded-lg">
                <h3 class="mb-2 font-semibold">Editor 2</h3>
                <livewire:ckeditor5
                    contextId="my-context"
                    content="<p>This is the second editor using the same shared context.</p>"
                />
            </div>

            <div class="bg-white dark:bg-gray-800 shadow p-6 rounded-lg">
                <h3 class="mb-2 font-semibold">Editor 3</h3>
                <livewire:ckeditor5
                    contextId="my-context"
                    content="<p>This is the third editor, also using the shared context.</p>"
                />
            </div>
        </div>
    </section>

    <section class="mb-16">
        <h2 class="mb-4 font-semibold text-xl">Two-Column Layout with Context</h2>
        <p class="mb-4 text-gray-600 dark:text-gray-400 text-sm">
            Context editors work great in complex layouts.
        </p>

        <livewire:ckeditor5-context contextId="two-column-context" />

        <div class="gap-6 grid md:grid-cols-2">
            <div class="bg-white dark:bg-gray-800 shadow p-6 rounded-lg">
                <h3 class="mb-2 font-semibold">Left Editor</h3>
                <livewire:ckeditor5
                    contextId="two-column-context"
                    content="<p>Content for the left column.</p>"
                />
            </div>

            <div class="bg-white dark:bg-gray-800 shadow p-6 rounded-lg">
                <h3 class="mb-2 font-semibold">Right Editor</h3>
                <livewire:ckeditor5
                    contextId="two-column-context"
                    content="<p>Content for the right column.</p>"
                />
            </div>
        </div>
    </section>
@endsection
