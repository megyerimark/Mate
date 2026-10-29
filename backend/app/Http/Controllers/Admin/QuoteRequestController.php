<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateQuoteRequest;
use App\Http\Resources\QuoteRequestResource;
use App\Models\QuoteRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class QuoteRequestController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in(array_keys(QuoteRequest::STATUSES))],
            'search' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ]);

        $quotes = QuoteRequest::query()
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($filters['search'] ?? null, function ($q, $search) {
                $like = '%'.$search.'%';
                $q->where(fn ($q) => $q
                    ->where('name', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhere('phone', 'like', $like)
                    ->orWhere('message', 'like', $like));
            })
            ->latest()
            ->paginate($filters['per_page'] ?? 20);

        return QuoteRequestResource::collection($quotes);
    }

    public function show(QuoteRequest $quoteRequest): QuoteRequestResource
    {
        return new QuoteRequestResource($quoteRequest);
    }

    public function update(UpdateQuoteRequest $request, QuoteRequest $quoteRequest): QuoteRequestResource
    {
        $quoteRequest->forceFill($request->validated())->save();

        return new QuoteRequestResource($quoteRequest);
    }

    public function destroy(QuoteRequest $quoteRequest): JsonResponse
    {
        if ($quoteRequest->document_path) {
            Storage::disk('local')->delete($quoteRequest->document_path);
        }
        $quoteRequest->delete();

        return response()->json(['message' => 'Törölve.']);
    }

    public function document(QuoteRequest $quoteRequest): StreamedResponse
    {
        abort_unless(
            $quoteRequest->document_path && Storage::disk('local')->exists($quoteRequest->document_path),
            404,
            'Ehhez az ajánlatkéréshez nincs dokumentum.',
        );

        return Storage::disk('local')->download($quoteRequest->document_path, $quoteRequest->document_name);
    }

    /** Összesítő számok a vezérlőpult tetejére. */
    public function stats(): JsonResponse
    {
        $byStatus = QuoteRequest::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return response()->json([
            'total' => (int) $byStatus->sum(),
            'this_month' => QuoteRequest::where('created_at', '>=', now()->startOfMonth())->count(),
            'by_status' => collect(QuoteRequest::STATUSES)
                ->map(fn ($label, $key) => ['status' => $key, 'label' => $label, 'total' => (int) ($byStatus[$key] ?? 0)])
                ->values(),
        ]);
    }
}
