<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreQuoteRequest;
use App\Mail\QuoteRequestConfirmation;
use App\Mail\QuoteRequestReceived;
use App\Models\QuoteRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class QuoteRequestController extends Controller
{
    public function store(StoreQuoteRequest $request): JsonResponse
    {
        $ok = response()->json(['message' => 'Köszönjük, megkaptuk az ajánlatkérést!'], 201);

        // Botnak ugyanazt a választ adjuk, de semmit nem mentünk.
        if ($request->isSpam()) {
            return $ok;
        }

        $data = $request->safe()->except(['document', 'privacy_accepted', 'website']);

        if ($file = $request->file('document')) {
            $data['document_path'] = $file->store('quote-requests', 'local');
            $data['document_name'] = $file->getClientOriginalName();
        }

        $quote = QuoteRequest::create($data + ['ip_address' => $request->ip()]);

        // Az ajánlatkérés el van mentve; ha a levélküldés hibázik, ne veszítsük el miatta az ügyfelet.
        try {
            Mail::to(config('quotes.recipient'))->send(new QuoteRequestReceived($quote));
            Mail::to($quote->email)->send(new QuoteRequestConfirmation($quote));
        } catch (Throwable $e) {
            Log::error('Az ajánlatkérés e-mailje nem ment ki', ['quote_request_id' => $quote->id, 'error' => $e->getMessage()]);
        }

        return $ok;
    }
}
