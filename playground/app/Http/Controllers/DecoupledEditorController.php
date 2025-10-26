<?php

namespace App\Http\Controllers;

class DecoupledEditorController extends Controller
{
    public function index()
    {
        return view('editors.decoupled');
    }
}
