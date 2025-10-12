<input
    id="{{ $id }}"
    name="{{ $name }}"
    value="{{ $value }}"
    type="hidden"
    style="{{ $getStyles() }}"
    @if($required) required @endif
/>
