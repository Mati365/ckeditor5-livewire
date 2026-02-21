<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\Attributes\On;

class MultiRootDynamicDemo extends Component
{
    public array $roots = [
        'header' => '<h2>Dynamic header</h2>',
        'body' => '<p>Dynamic body content.</p>',
    ];

    public string $editorId = 'multiroot-dynamic-demo-editor';
    public string $newRootName = '';

    public function mount(): void
    {
        $this->randomizeNewRootName();
    }

    private function randomizeNewRootName(): void
    {
        $this->newRootName = 'root_' . substr(md5(uniqid('', true)), 0, 6);
    }
    public function addRoot(): void
    {
        $name = trim($this->newRootName);

        if ($name && !isset($this->roots[$name])) {
            $this->roots[$name] = 'New root content';
            $this->randomizeNewRootName();
        }
    }

    public function removeRoot(string $name): void
    {
        if (isset($this->roots[$name])) {
            unset($this->roots[$name]);
        }
    }

    #[On('editor-content-changed')]
    public function onEditorContentChanged(string $editorId, array $content): void
    {
        if ($editorId === $this->editorId) {
            $this->roots = $content;
        }
    }

    public function render()
    {
        return view('livewire.multiroot-dynamic-demo');
    }
}
