<?php

namespace App\Livewire;

use Livewire\Component;

class EditorForm extends Component
{
    public string $content = '<p>Initial content from wire:model</p>';

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
        $this->content = '<p>Content has been reset!</p>';
    }
}
