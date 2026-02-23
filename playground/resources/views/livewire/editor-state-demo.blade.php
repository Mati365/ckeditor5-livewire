<div>
    <p class="mb-4">
        <span class="font-semibold">Editor status:</span>
        <span class="font-bold {{ $isReady ? 'text-blue-500' : 'text-gray-500' }}">
            {{ $isReady ? 'Ready' : 'Initializing...' }}
        </span>
        &mdash;
        <span class="font-bold {{ $isFocused ? 'text-green-500' : 'text-red-500' }}">
            {{ $isFocused ? 'Focused' : 'Not Focused' }}
        </span>
    </p>

    <livewire:ckeditor5
        :editorId="$editorId"
        content='<p>This editor demonstrates focus and ready events.</p>'
    />
</div>
