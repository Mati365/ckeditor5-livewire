<div>
    <div class="mb-6">
        <label class="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
            Multiroot Editor — Livewire-settable root (body)
        </label>

        <livewire:ckeditor5
            :editorId="$editorId"
            editorType="multiroot"
            :mergeConfig="[
                'menuBar' => [
                    'isVisible' => true
                ]
            ]"
        />

        <div class="bg-gray-50 dark:bg-gray-900 mt-4 mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded">
            <livewire:ckeditor5-ui-part name="toolbar" :editorId="$editorId" />
        </div>

        <div class="space-y-4">
            <div>
                <label class="block mb-2 font-medium text-sm">Header (set from Livewire)</label>
                <livewire:ckeditor5-editable
                    :editorId="$editorId"
                    rootName="header"
                    wire:model.live="content.header"
                    class="border border-gray-300 dark:border-gray-600 rounded"
                    editableClass="p-4"
                />
            </div>

            <div>
                <label class="block mb-2 font-medium text-sm">Body (Livewire-synced)</label>
                <livewire:ckeditor5-editable
                    :editorId="$editorId"
                    rootName="body"
                    wire:model.live="content.body"
                    class="border border-gray-300 dark:border-gray-600 rounded"
                    editableClass="p-4 min-h-[160px]"
                />

                <div class="flex items-start gap-4 mt-3">
                    <div class="flex-1 bg-gray-50 dark:bg-gray-900 p-3 border border-gray-200 dark:border-gray-700 rounded">
                        <h4 class="mb-2 font-semibold text-sm">Value in Livewire</h4>
                        <pre class="text-gray-800 dark:text-gray-200 text-sm"><code>{{ $content['body'] }}</code></pre>
                    </div>

                    <div>
                        <button
                            wire:click="resetBody"
                            class="bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 px-4 py-2 rounded text-yellow-800 dark:text-yellow-200"
                        >
                            Reset body from Livewire
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
