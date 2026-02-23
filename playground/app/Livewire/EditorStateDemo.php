<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\Attributes\On;

class EditorStateDemo extends Component
{
    public bool $isFocused = false;
    public bool $isReady = false;
    public string $editorId = 'state-demo-editor';

    #[On('editor-focus-changed')]
    public function onEditorFocusChanged(string $editorId, bool $focused): void
    {
        if ($editorId === $this->editorId) {
            $this->isFocused = $focused;
        }
    }

    #[On('editor-ready')]
    public function onEditorReady(string $editorId): void
    {
        if ($editorId === $this->editorId) {
            $this->isReady = true;
        }
    }

    public function render()
    {
        return view('livewire.editor-state-demo');
    }
}
