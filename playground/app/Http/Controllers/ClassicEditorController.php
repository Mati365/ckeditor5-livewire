<?php

namespace App\Http\Controllers;

class ClassicEditorController extends Controller
{
    public function index()
    {
        return view('editors.classic');
    }
}
