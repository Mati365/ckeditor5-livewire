<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>CKEditor 5 Playground - Index</title>
        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
            @vite(['resources/css/app.css', 'resources/js/app.js'])
        @endif
    </head>
    <body class="flex flex-col items-center bg-[#FDFDFC] dark:bg-[#0a0a0a] p-6 lg:p-8 min-h-screen text-[#1b1b18]">
        <div class="w-full max-w-4xl">
            <header class="mb-12 text-center">
                <h1 class="mb-4 font-bold text-4xl">CKEditor 5 Livewire Playground</h1>
                <p class="text-gray-600 dark:text-gray-400">Explore different editor types and configurations</p>
            </header>

            <nav class="gap-6 grid md:grid-cols-2 mb-8">
                <a href="{{ route('editors.classic') }}"
                   class="block p-6 border-2 border-gray-200 hover:border-blue-500 dark:border-gray-700 dark:hover:border-blue-400 rounded-lg transition-colors">
                    <h2 class="mb-2 font-semibold text-xl">Classic Editor</h2>
                    <p class="text-gray-600 dark:text-gray-400 text-sm">
                        Standard editor with toolbar at the top. Includes wire:model binding examples.
                    </p>
                </a>

                <a href="{{ route('editors.inline') }}"
                   class="block p-6 border-2 border-gray-200 hover:border-blue-500 dark:border-gray-700 dark:hover:border-blue-400 rounded-lg transition-colors">
                    <h2 class="mb-2 font-semibold text-xl">Inline Editor</h2>
                    <p class="text-gray-600 dark:text-gray-400 text-sm">
                        Edit content inline with toolbar appearing on selection.
                    </p>
                </a>

                <a href="{{ route('editors.decoupled') }}"
                   class="block p-6 border-2 border-gray-200 hover:border-blue-500 dark:border-gray-700 dark:hover:border-blue-400 rounded-lg transition-colors">
                    <h2 class="mb-2 font-semibold text-xl">Decoupled Editor</h2>
                    <p class="text-gray-600 dark:text-gray-400 text-sm">
                        Separate toolbar and editable areas for maximum flexibility.
                    </p>
                </a>

                <a href="{{ route('editors.multiroot') }}"
                   class="block p-6 border-2 border-gray-200 hover:border-blue-500 dark:border-gray-700 dark:hover:border-blue-400 rounded-lg transition-colors">
                    <h2 class="mb-2 font-semibold text-xl">Multiroot Editor</h2>
                    <p class="text-gray-600 dark:text-gray-400 text-sm">
                        Multiple editable roots with a shared toolbar for complex documents.
                    </p>
                </a>

                <a href="{{ route('editors.context') }}"
                   class="block p-6 border-2 border-gray-200 hover:border-blue-500 dark:border-gray-700 dark:hover:border-blue-400 rounded-lg transition-colors">
                    <h2 class="mb-2 font-semibold text-xl">Context Editor</h2>
                    <p class="text-gray-600 dark:text-gray-400 text-sm">
                        Multiple editors sharing the same context and configuration.
                    </p>
                </a>
            </nav>

            <footer class="mt-12 text-gray-500 dark:text-gray-500 text-sm text-center">
                <p>CKEditor 5 Livewire Integration Playground</p>
            </footer>
        </div>
    </body>
</html>
