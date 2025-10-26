<div
    wire:ignore
    id="{{ $id }}"
    data-cke-editable-editor-id="{{ $editorId }}"
    data-cke-editable-root-name="{{ $rootName }}"
    data-cke-editable-initial-content="{{ htmlspecialchars($content, ENT_QUOTES, 'UTF-8') }}"
    @if($class) class="{{ $class }}" @endif
    @if($style) style="{{ $style }}" @endif
>
    <div
        data-cke-editable-content
        @if($editableClass) class="{{ $editableClass }}" @endif
        @if($editableStyle) style="{{ $editableStyle }}" @endif
    ></div>

    @if($name)
        <x-ckeditor5-hidden-input
            :id="$id . '-hidden'"
            :name="$name"
            :value="$content ?? ''"
            :required="$required"
        />
    @endif
</div>
