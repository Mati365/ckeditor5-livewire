<div
    wire:ignore
    id="{{ $editorId }}"
    @if($class) class="{{ $class }}" @endif
    @if($style) style="{{ $style }}" @endif
>
    @if($preset['editorType'] !== 'multiroot' && $preset['editorType'] !== 'decoupled')
        <div id="{{ $editorId }}_editor"></div>
    @endif

    @if($name)
        <x-ckeditor5-hidden-input
            :id="$editorId . '_input'"
            :name="$name"
            :value="$content['main'] ?? ''"
            :required="$required"
        />
    @endif
</div>
