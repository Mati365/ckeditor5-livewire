<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>CKEditor 5 Playground</title>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <!-- CKEditor 5 Assets -->
        <x-ckeditor5-assets :translations="['pl', 'de', 'fr']" />

        <!-- Styles / Scripts -->
        @livewireScripts

        @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
            @vite(['resources/css/app.css', 'resources/js/app.js'])
        @endif
    </head>
    <body class="flex flex-col lg:justify-center items-center bg-[#FDFDFC] dark:bg-[#0a0a0a] p-6 lg:p-8 min-h-screen text-[#1b1b18]">
        <section class="mb-16 w-full max-w-5xl">
            <h2 class="mb-4 font-semibold text-lg">CKEditor 5 Basic</h2>
            <div>
                <livewire:ckeditor5
                    :content="['main' => '<p>This is the initial content of the editor.</p>']"
                    :mergeConfig="[
                        'menuBar' => [
                            'isVisible' => true
                        ]
                    ]"
                />
            </div>
        </section>

        <section class="mb-16 w-full max-w-5xl">
            <h2 class="mb-4 font-semibold text-lg">CKEditor 5 with Custom Config</h2>
            <div>
                <livewire:ckeditor5
                    :locale="'pl'"
                    :content="['main' => '<p>This editor has a custom configuration.</p>']"
                    :customTranslations="[
                        'pl' => [
                            'Bold' => 'Grubo'
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

        <section class="mb-16 w-full max-w-5xl">
            <h2 class="mb-4 font-semibold text-lg">CKEditor 5 Context</h2>
            <div>
                <livewire:ckeditor5-context contextId="my-context" />
                <livewire:ckeditor5
                    contextId="my-context"
                    :content="['main' => 'Content 1']"
                />
                <livewire:ckeditor5
                    class="mt-6"
                    contextId="my-context"
                    :content="['main' => 'Content 2']"
                />
            </div>
        </section>

        <section class="mb-16 w-full max-w-5xl">
            <h2 class="mb-4 font-semibold text-lg">CKEditor 5 Decoupled</h2>
            <div>
                <livewire:ckeditor5
                    editorId="decoupled-editor"
                    editorType="decoupled"
                    :content="['main' => '<p>This is the initial content of the decoupled editor.</p>']"
                />

                <livewire:ckeditor5-ui-part :name="'toolbar'" :editorId="'decoupled-editor'" class="my-4" />

                <livewire:ckeditor5-editable
                    editorId="decoupled-editor"
                    editableId="decoupled-editor-main"
                    class="border border-gray-300 rounded-xs"
                    editableClass="p-4"
                    content="<p>This is the initial content of the decoupled editor editable.</p>"
                />
            </div>
        </section>
    </body>
</html>
