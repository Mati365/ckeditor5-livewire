<div>
    <div class="gap-6 grid grid-cols-1 lg:grid-cols-3 mb-6">
        <div class="lg:col-span-1">
            <h3 class="mb-3 font-semibold text-gray-700 dark:text-gray-300">Available Templates</h3>
            <div class="space-y-2">
                @foreach($templates as $key => $template)
                    <button
                        wire:click="loadTemplate('{{ $key }}')"
                        class="w-full text-left px-4 py-3 rounded-lg transition-colors
                            {{ $selectedTemplate === $key
                                ? 'bg-blue-600 text-white font-semibold'
                                : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }}">
                        {{ $template['name'] }}
                    </button>
                @endforeach

                <button
                    wire:click="clearEditor"
                    class="bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 px-4 py-3 rounded-lg w-full text-red-700 dark:text-red-300 text-left transition-colors">
                    Clear Editor
                </button>
            </div>
        </div>

        <div class="lg:col-span-2">
            <h3 class="mb-3 font-semibold text-gray-700 dark:text-gray-300">Editor</h3>
            <livewire:ckeditor5
                :content="$content"
                :editorId="$editorId"
                :editableHeight="300"
                :mergeConfig="[
                    'menuBar' => [
                        'isVisible' => true
                    ]
                ]"
            />
        </div>
    </div>

    @if($selectedTemplate)
        <div class="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <h3 class="mb-2 font-semibold text-blue-800 dark:text-blue-200">
                Currently loaded: {{ $templates[$selectedTemplate]['name'] }}
            </h3>
            <p class="text-blue-700 dark:text-blue-300 text-sm">
                The template has been loaded into the editor via the <code class="bg-blue-100 dark:bg-blue-800 px-1 rounded">set-editor-content</code> event.
                You can now edit it directly in the editor above.
            </p>
        </div>
    @endif
</div>
