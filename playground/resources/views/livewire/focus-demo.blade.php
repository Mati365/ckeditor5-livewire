<div>
    <p class="mb-4">
        Editor focus state:
        <span class="font-bold {{ $isFocused ? 'text-green-500' : 'text-red-500' }}">
            {{ $isFocused ? 'Focused' : 'Not Focused' }}
        </span>
    </p>

    <livewire:ckeditor5
        :editorId="$editorId"
        content='<p>This editor demonstrates the focus event.</p>'
    />
</div>
