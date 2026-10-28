<?php

use Illuminate\Support\Facades\Route;

// Az Angular frontendet szolgálja ki (frontend: npm run build:backend).
// Minden nem /api útvonal az index.html-t kapja, az Angular router dönt.
Route::get('/{path?}', function () {
    $index = public_path('index.html');

    abort_unless(is_file($index), 404, 'A frontend még nincs lebuildelve: cd frontend && npm run build:backend');

    return response()->file($index, ['Cache-Control' => 'no-cache']);
})->where('path', '(?!api(/|$)|up$).*');
