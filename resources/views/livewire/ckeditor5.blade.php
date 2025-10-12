<div id="{{ $editorId }}" wire:ignore>
    <div id="{{ $editorId }}_editor"></div>

    @if($name)
        <x-ckeditor5-hidden-input
            :id="$editorId . '_input'"
            :name="$name"
            :value="$content['main'] ?? ''"
            :required="$required"
        />
    @endif
</div>
