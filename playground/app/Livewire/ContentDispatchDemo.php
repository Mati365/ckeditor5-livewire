<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\Attributes\On;

class ContentDispatchDemo extends Component
{
    public array $content = [
        'main' => '<p>Type something to see the content dispatch event in action...</p>',
    ];

    public string $editorId = 'content-dispatch-editor';

    #[On('editor-content-changed')]
    public function onEditorContentChanged(string $editorId, array $content): void
    {
        if ($editorId === $this->editorId) {
            $this->content = $content;
        }
    }

    public function render()
    {
        return view('livewire.content-dispatch-demo');
    }
}
