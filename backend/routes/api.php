<?php

use App\Http\Controllers\QuoteRequestController;
use Illuminate\Support\Facades\Route;

Route::post('/quote-requests', [QuoteRequestController::class, 'store'])
    ->middleware('throttle:quote-requests');
