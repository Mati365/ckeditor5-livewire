<div
    wire:ignore
    id="{{ $editableId }}"
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
            :id="$editableId . '_input'"
            :name="$name"
            :value="$content"
            :required="$required"
        />
    @endif
</div>
