<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\Attributes\Validate;

class RequiredFieldForm extends Component
{
    public $content = ['main' => ''];

    protected $rules = [
        'content.main' => 'required|string|min:10',
    ];

    protected $messages = [
        'content.main.required' => 'The content field is required.',
        'content.main.min' => 'The content field must be at least 10 characters.',
    ];

    public function save()
    {
        $this->validate();
        session()->flash('message', 'Form submitted successfully!');
    }

    public function render()
    {
        return view('livewire.required-field-form');
    }
}
