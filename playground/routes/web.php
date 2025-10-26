<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\IndexController;
use App\Http\Controllers\ClassicEditorController;
use App\Http\Controllers\InlineEditorController;
use App\Http\Controllers\DecoupledEditorController;
use App\Http\Controllers\ContextEditorController;

Route::get('/', [IndexController::class, 'index'])->name('index');

Route::prefix('editors')->group(function () {
    Route::get('/classic', [ClassicEditorController::class, 'index'])->name('editors.classic');
    Route::get('/inline', [InlineEditorController::class, 'index'])->name('editors.inline');
    Route::get('/decoupled', [DecoupledEditorController::class, 'index'])->name('editors.decoupled');
    Route::get('/context', [ContextEditorController::class, 'index'])->name('editors.context');
});
