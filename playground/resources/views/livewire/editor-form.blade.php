<div>
    @if (session()->has('message'))
        <div class="bg-green-100 dark:bg-green-900 mb-4 p-4 rounded-lg text-green-700 dark:text-green-200">
            {{ session('message') }}
        </div>
    @endif

    <div class="mb-6">
        <label class="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
            Content (wire:model binding)
        </label>
        <livewire:ckeditor5
            wire:model="content"
            editorId="editor-with-model"
            :emit="['change' => true]"
            :mergeConfig="[
                'menuBar' => [
                    'isVisible' => true
                ]
            ]"
        />
    </div>

    <div class="flex gap-4 mb-6">
        <button
            wire:click="save"
            class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition-colors">
            Save Content
        </button>
        <button
            wire:click="resetContent"
            class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white transition-colors">
            Reset Content
        </button>
    </div>

    <div class="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
        <h3 class="mb-2 font-semibold text-gray-700 dark:text-gray-300">Current Content Value:</h3>
        <div class="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded font-mono text-sm break-all">
            {{ $content }}
        </div>
    </div>

    <div class="bg-blue-50 dark:bg-blue-900/30 mt-6 p-4 rounded-lg">
        <h3 class="mb-2 font-semibold text-blue-800 dark:text-blue-200">How wire:model works:</h3>
        <ul class="space-y-2 text-blue-700 dark:text-blue-300 text-sm list-disc list-inside">
            <li>The editor content is automatically synchronized with the <code class="bg-blue-100 dark:bg-blue-800 px-1 rounded">$content</code> property</li>
            <li>Changes in the editor update the property in real-time</li>
            <li>Clicking "Reset Content" demonstrates programmatic content updates</li>
            <li>The current value is displayed below the buttons</li>
        </ul>
    </div>
</div>
