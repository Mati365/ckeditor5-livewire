<div>
    @if (session()->has('message'))
        <div class="bg-green-100 dark:bg-green-900 mb-4 p-4 rounded-lg text-green-700 dark:text-green-200">
            {{ session('message') }}
        </div>
    @endif

    <form wire:submit="save">
        <div class="mb-6">
            <label class="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
                Description (Required)
            </label>
            <div class="@error('content.main') border-2 border-red-500 rounded-lg @enderror">
                <livewire:ckeditor5
                    wire:model="content"
                    editorId="required-editor"
                />
            </div>
            @error('content.main')
                <p class="mt-1 text-red-500 text-sm">{{ $message }}</p>
            @enderror
        </div>

        <button
            type="submit"
            class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition-colors">
            Submit Form
        </button>
    </form>
</div>
