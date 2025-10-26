<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\Attributes\On;

class FocusDemo extends Component
{
    public bool $isFocused = false;
    public string $editorId = 'focus-demo-editor';

    #[On('editor-focus-changed')]
    public function onEditorFocusChanged(string $editorId, bool $focused): void
    {
        if ($editorId === $this->editorId) {
            $this->isFocused = $focused;
        }
    }

    public function render()
    {
        return view('livewire.focus-demo');
    }
}
