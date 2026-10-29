<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\QuoteRequest */
class QuoteRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'deadline' => $this->deadline,
            'deadline_label' => $this->deadlineLabel(),
            'source_language' => $this->source_language,
            'target_language' => $this->target_language,
            'message' => $this->message,
            'admin_note' => $this->admin_note,
            'status' => $this->status,
            'status_label' => $this->statusLabel(),
            'document_name' => $this->document_name,
            'has_document' => (bool) $this->document_path,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
