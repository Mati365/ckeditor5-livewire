<?php

namespace App\Support;

use Spatie\Csp\Directive;
use Spatie\Csp\Policies\Policy;

class CspPolicy extends Policy
{
    public function configure(): void
    {
        $this
            ->addDirective(Directive::DEFAULT, '*')
            ->addDirective(Directive::SCRIPT, '*')
            ->addDirective(Directive::SCRIPT, 'unsafe-inline')
            ->addDirective(Directive::SCRIPT, 'unsafe-eval')
            ->addDirective(Directive::STYLE, '*')
            ->addDirective(Directive::STYLE, 'unsafe-inline')
            ->addDirective(Directive::IMG, '*')
            ->addDirective(Directive::FONT, '*')
            ->addDirective(Directive::CONNECT, '*')
            ->addDirective(Directive::FRAME, '*')
            ->addDirective(Directive::BASE, '*')
            ->addDirective(Directive::FORM_ACTION, '*');
    }
}
