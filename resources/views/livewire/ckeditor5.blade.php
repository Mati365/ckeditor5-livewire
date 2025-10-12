<div id="{{ $editorId }}" wire:ignore>
    <div id="{{ $editorId }}_editor"></div>

    @if($slot ?? false)
        <div class="ckeditor-slot-content">
            {!! $slot !!}
        </div>
    @endif
</div>
