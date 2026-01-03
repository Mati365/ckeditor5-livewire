<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class RequiredFieldController extends Controller
{
    public function index()
    {
        return view('editors.required-field');
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|min:10',
        ]);

        return redirect()->route('editors.required-field')
            ->with('success', 'Classic form submitted successfully!');
    }
}
