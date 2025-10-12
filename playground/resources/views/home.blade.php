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
        <x-ckeditor5-assets />

        <!-- Styles / Scripts -->
        @livewireScripts

        @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
            @vite(['resources/css/app.css', 'resources/js/app.js'])
        @endif
    </head>
    <body class="flex flex-col lg:justify-center items-center bg-[#FDFDFC] dark:bg-[#0a0a0a] p-6 lg:p-8 min-h-screen text-[#1b1b18]">
        <livewire:ckeditor5
            wire:model="content"
            name="editor1"
            :content="['main' => '<p>Initial content</p>']"
        />
    </body>
</html>
