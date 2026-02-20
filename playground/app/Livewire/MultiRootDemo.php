<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\Attributes\On;

class MultiRootDemo extends Component
{
    public array $content = [
        'header' => '<h2>Livewire-set header</h2>',
        'body' => '<p>Initial body content set from Livewire.</p>',
    ];

    public string $editorId = 'multiroot-attribute-demo-editor';

    public function resetBody(): void
    {
        $this->content['body'] = '<p>Body has been reset by Livewire.</p>';
    }

    #[On('editor-content-changed')]
    public function onEditorContentChanged(string $editorId, array $content): void
    {
        if ($editorId === $this->editorId) {
            $this->content = $content;
        }
    }

    public function render()
    {
        return view('livewire.multiroot-demo');
    }
}
