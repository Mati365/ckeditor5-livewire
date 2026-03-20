<?php

namespace App\Livewire;

use Livewire\Component;

class RootAttributesDemo extends Component
{
    public int $counter = 0;

    public function incrementCounter(): void
    {
        $this->counter++;
    }

    public function render()
    {
        return view('livewire.root-attributes-demo');
    }
}
