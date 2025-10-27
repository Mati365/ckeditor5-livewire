<?php

namespace App\Livewire;

use Livewire\Component;
use Livewire\Attributes\On;

class TemplateDemo extends Component
{
    public array $content = [
        'main' => '<p>Select a template to load it into the editor...</p>',
    ];

    public string $editorId = 'template-demo-editor';

    public array $templates = [
        'welcome_email' => [
            'name' => 'Welcome Email',
            'content' => '<h2>Welcome to our platform!</h2><p>Dear {{name}},</p><p>We\'re excited to have you on board. Here are some things you can do:</p><ul><li>Complete your profile</li><li>Explore our features</li><li>Connect with other users</li></ul><p>Best regards,<br>The Team</p>',
        ],
        'newsletter' => [
            'name' => 'Newsletter Template',
            'content' => '<h1>Monthly Newsletter</h1><h2>{{month}} {{year}}</h2><h3>This Month\'s Highlights</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.</p><h3>Featured Article</h3><p><strong>{{article_title}}</strong></p><p>{{article_excerpt}}</p>',
        ],
        'blog_post' => [
            'name' => 'Blog Post Template',
            'content' => '<h1>{{post_title}}</h1><p><em>Published on {{date}} by {{author}}</em></p><p>{{introduction}}</p><h2>Main Content</h2><p>{{content}}</p><h2>Conclusion</h2><p>{{conclusion}}</p>',
        ],
        'meeting_notes' => [
            'name' => 'Meeting Notes',
            'content' => '<h2>Meeting Notes - {{date}}</h2><p><strong>Attendees:</strong> {{attendees}}</p><p><strong>Duration:</strong> {{duration}}</p><h3>Agenda</h3><ol><li>Topic 1</li><li>Topic 2</li><li>Topic 3</li></ol><h3>Action Items</h3><ul><li>[ ] Action item 1</li><li>[ ] Action item 2</li></ul>',
        ],
    ];

    public ?string $selectedTemplate = null;

    public function loadTemplate(string $templateKey): void
    {
        if (!isset($this->templates[$templateKey])) {
            return;
        }

        $this->selectedTemplate = $templateKey;
        $this->dispatch(
            'set-editor-content',
            editorId: $this->editorId,
            content: ['main' => $this->templates[$templateKey]['content']]
        );
    }

    #[On('editor-content-changed')]
    public function onEditorContentChanged(string $editorId, array $content): void
    {
        if ($editorId === $this->editorId) {
            $this->content = $content;
        }
    }

    public function clearEditor(): void
    {
        $this->selectedTemplate = null;
        $this->dispatch(
            'set-editor-content',
            editorId: $this->editorId,
            content: ['main' => '<p>Select a template to load it into the editor...</p>']
        );
    }

    public function render()
    {
        return view('livewire.template-demo');
    }
}
