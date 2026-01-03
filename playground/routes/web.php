<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\IndexController;
use App\Http\Controllers\ClassicEditorController;
use App\Http\Controllers\InlineEditorController;
use App\Http\Controllers\DecoupledEditorController;
use App\Http\Controllers\MultirootEditorController;
use App\Http\Controllers\ContextEditorController;
use App\Http\Controllers\RequiredFieldController;

Route::get('/', [IndexController::class, 'index'])->name('index');

Route::prefix('editors')->group(function () {
    Route::get('/classic', [ClassicEditorController::class, 'index'])->name('editors.classic');
    Route::get('/inline', [InlineEditorController::class, 'index'])->name('editors.inline');
    Route::get('/decoupled', [DecoupledEditorController::class, 'index'])->name('editors.decoupled');
    Route::get('/multiroot', [MultirootEditorController::class, 'index'])->name('editors.multiroot');
    Route::get('/context', [ContextEditorController::class, 'index'])->name('editors.context');
    Route::get('/required-field', [RequiredFieldController::class, 'index'])->name('editors.required-field');
    Route::post('/required-field', [RequiredFieldController::class, 'store'])->name('editors.required-field.store');
});
