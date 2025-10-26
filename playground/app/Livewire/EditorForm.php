<?php

namespace App\Livewire;

use Livewire\Component;

class EditorForm extends Component
{
    public array $content = [
        'main' => '<p>Initial content</p>',
    ];

    public function render()
    {
        return view('livewire.editor-form');
    }

    public function save()
    {
        session()->flash('message', 'Content saved successfully!');
    }

    public function resetContent()
    {
        $this->content = [ 'main' => '<p>Content has been reset!</p>' ];
    }
}
