@extends('layouts.app')

@section('title', 'Multiroot Editor')

@section('content')
    <div class="mb-8">
        <a href="{{ route('index') }}" class="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
            <svg class="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Index
        </a>
    </div>

    <h1 class="mb-8 font-bold text-3xl">Multiroot Editor Examples</h1>

    <section class="mb-16">
        <h2 class="mb-4 font-semibold text-xl">Basic Multiroot Editor</h2>
        <p class="mb-4 text-gray-600 dark:text-gray-400 text-sm">
            A single editor with multiple editable areas (roots) sharing the same toolbar and configuration.
        </p>
        <div class="bg-white dark:bg-gray-800 shadow p-6 rounded-lg">
            <livewire:ckeditor5
                editorId="multiroot-editor"
                editorType="multiroot"
                :content="[
                    'header' => '<h1>Document Header</h1>',
                    'content' => '<p>Main document content goes here.</p>',
                    'footer' => '<p>Document footer</p>'
                ]"
            />

            <div class="bg-gray-50 dark:bg-gray-900 mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded">
                <livewire:ckeditor5-ui-part name="toolbar" editorId="multiroot-editor" />
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block mb-2 font-medium text-sm">Header Root</label>
                    <livewire:ckeditor5-editable
                        editorId="multiroot-editor"
                        rootName="header"
                        class="border border-gray-300 dark:border-gray-600 rounded"
                        editableClass="p-4"
                    />
                </div>

                <div>
                    <label class="block mb-2 font-medium text-sm">Main Content Root</label>
                    <livewire:ckeditor5-editable
                        editorId="multiroot-editor"
                        rootName="content"
                        class="border border-gray-300 dark:border-gray-600 rounded"
                        editableClass="p-4 min-h-[200px]"
                    />
                </div>

                <div>
                    <label class="block mb-2 font-medium text-sm">Footer Root</label>
                    <livewire:ckeditor5-editable
                        editorId="multiroot-editor"
                        rootName="footer"
                        class="border border-gray-300 dark:border-gray-600 rounded"
                        editableClass="p-4"
                    />
                </div>
            </div>
        </div>
    </section>

    <section class="mb-16">
        <h2 class="mb-4 font-semibold text-xl">Document Structure Example</h2>
        <p class="mb-4 text-gray-600 dark:text-gray-400 text-sm">
            A more complex example simulating a document with sidebar, header, main content, and aside sections.
        </p>
        <div class="bg-white dark:bg-gray-800 shadow p-6 rounded-lg">
            <livewire:ckeditor5
                editorId="multiroot-editor-2"
                editorType="multiroot"
                :content="[
                    'title' => '<h1>Article Title</h1>',
                    'lead' => '<p class=&quot;lead&quot;>This is the article lead paragraph.</p>',
                    'body' => '<p>Main article body content.</p>',
                    'sidebar' => '<h3>Related Links</h3><ul><li>Link 1</li><li>Link 2</li></ul>'
                ]"
            />

            <div class="top-0 z-10 sticky bg-gray-50 dark:bg-gray-900 mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded">
                <livewire:ckeditor5-ui-part name="toolbar" editorId="multiroot-editor-2" />
            </div>

            <div class="gap-6 grid lg:grid-cols-[1fr,300px]">
                <div class="space-y-4">
                    <div>
                        <label class="block mb-2 font-medium text-sm">Title</label>
                        <livewire:ckeditor5-editable
                            editorId="multiroot-editor-2"
                            rootName="title"
                            class="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded"
                            editableClass="p-4"
                        />
                    </div>

                    <div>
                        <label class="block mb-2 font-medium text-sm">Lead Paragraph</label>
                        <livewire:ckeditor5-editable
                            editorId="multiroot-editor-2"
                            rootName="lead"
                            class="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded"
                            editableClass="p-4"
                        />
                    </div>

                    <div>
                        <label class="block mb-2 font-medium text-sm">Main Content</label>
                        <livewire:ckeditor5-editable
                            editorId="multiroot-editor-2"
                            rootName="body"
                            class="border-2 border-gray-300 dark:border-gray-600 rounded"
                            editableClass="p-4 min-h-[300px]"
                        />
                    </div>
                </div>

                <div>
                    <label class="block mb-2 font-medium text-sm">Sidebar</label>
                    <livewire:ckeditor5-editable
                        editorId="multiroot-editor-2"
                        rootName="sidebar"
                        class="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded"
                        editableClass="p-4 min-h-[200px]"
                    />
                </div>
            </div>
        </div>
    </section>
@endsection
