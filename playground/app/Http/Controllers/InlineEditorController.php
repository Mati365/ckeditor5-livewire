<?php

namespace App\Http\Controllers;

class InlineEditorController extends Controller
{
    public function index()
    {
        return view('editors.inline');
    }
}
