<div>
    <div class="mb-6">
        <label class="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
            Dynamic Multiroot Editor — Add/Remove Roots
        </label>

        <livewire:ckeditor5 :editorId="$editorId" editorType="multiroot" />

        <div class="bg-gray-50 dark:bg-gray-900 mt-4 mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded">
            <livewire:ckeditor5-ui-part name="toolbar" :editorId="$editorId" />
        </div>

        <form wire:submit.prevent="addRoot" class="flex items-center gap-2 mb-6">
            <input
                type="text"
                wire:model.lazy="newRootName"
                placeholder="New root name"
                class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm"
            />
            <button
                type="submit"
                class="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 px-4 py-2 rounded text-blue-800 dark:text-blue-200"
            >
                Add Root
            </button>
        </form>

        <div class="space-y-4">
            @foreach($roots as $name => $value)
                <div class="relative" wire:key="root-{{ $name }}">
                    <label class="block mb-2 font-medium text-sm">{{ ucfirst($name) }}</label>
                    <livewire:ckeditor5-editable
                        :editorId="$editorId"
                        :rootName="$name"
                        wire:model.live="roots.{{ $name }}"
                        class="border border-gray-300 dark:border-gray-600 rounded"
                        editableClass="p-4 min-h-[120px]"
                    />
                    <button
                        wire:click="removeRoot('{{ $name }}')"
                        class="top-0 right-0 absolute bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 mt-1 mr-1 px-2 py-1 rounded text-red-800 dark:text-red-200 text-xs"
                    >
                        Remove
                    </button>
                </div>
            @endforeach
        </div>
    </div>
</div>
