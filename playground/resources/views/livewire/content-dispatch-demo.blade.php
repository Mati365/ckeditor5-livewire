<div>
    <div class="mb-6">
        <label class="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
            Editor with Content Dispatch Event
        </label>
        <livewire:ckeditor5
            :content="$content"
            :editorId="$editorId"
            :mergeConfig="[
                'menuBar' => [
                    'isVisible' => true
                ]
            ]"
        />
    </div>

    <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 class="mb-2 font-semibold text-gray-700 dark:text-gray-300">Current Content</h3>
        <pre class="text-gray-800 dark:text-gray-200 text-sm"><code>{{ $content['main'] }}</code></pre>
    </div>
</div>
