<div class="space-y-4">
    <p class="text-gray-600 dark:text-gray-400 text-sm">
        This demo shows how Livewire can update <code>rootAttributes</code> on the editor root.
        Click the button to increment the counter and observe the editor root gaining a <code>data-counter</code> attribute.
    </p>

    <div class="flex items-center gap-4">
        <button
            wire:click="incrementCounter"
            class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
        >
            Increment counter
        </button>

        <div class="text-gray-700 dark:text-gray-200 text-sm">
            Current counter: <span class="font-semibold">{{ $counter }}</span>
        </div>
    </div>

    <livewire:ckeditor5
        wire:key="ckeditor5-roots-attributes"
        :rootAttributes="['data-counter' => $counter]"
        content="<p>This editor demonstrates root attributes.</p>"
    />
</div>
