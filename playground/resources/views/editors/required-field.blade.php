@extends('layouts.app')

@section('title', 'Required Field Example')

@section('content')
    <div class="mb-8">
        <a href="{{ route('index') }}" class="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline">
            <svg class="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Index
        </a>
    </div>

    <h1 class="mb-8 font-bold text-3xl">Required Field Example</h1>

    <section class="mb-16">
        <h2 class="mb-4 font-semibold text-xl">Form Validation Demo</h2>
        <p class="mb-4 text-gray-600 dark:text-gray-400">
            This example demonstrates how to use CKEditor 5 with Livewire validation.
            Try submitting the form empty or with short content.
        </p>
        <div class="bg-white dark:bg-gray-800 shadow p-6 rounded-lg">
            <livewire:required-field-form />
        </div>
    </section>

    <section class="mb-16">
        <h2 class="mb-4 font-semibold text-xl">Classic Form Demo (Standard POST)</h2>
        <p class="mb-4 text-gray-600 dark:text-gray-400">
            This example demonstrates how to use CKEditor 5 with standard Laravel validation and form submission.
        </p>
        <div class="bg-white dark:bg-gray-800 shadow p-6 rounded-lg">
            @if (session('success'))
                <div class="bg-green-100 dark:bg-green-900 mb-4 p-4 rounded-lg text-green-700 dark:text-green-200">
                    {{ session('success') }}
                </div>
            @endif

            <form action="{{ route('editors.required-field.store') }}" method="POST">
                @csrf
                <div class="mb-6">
                    <label class="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
                        Description (Required)
                    </label>
                    <div class="@error('content') border-2 border-red-500 rounded-lg @enderror">
                        <livewire:ckeditor5
                            required
                            name="content"
                            editorId="classic-required-editor"
                            :content="old('content')"
                        />
                    </div>
                    @error('content')
                        <p class="mt-1 text-red-500 text-sm">{{ $message }}</p>
                    @enderror
                </div>

                <button
                    type="submit"
                    class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition-colors">
                    Submit Classic Form
                </button>
            </form>
        </div>
    </section>
@endsection
