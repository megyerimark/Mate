<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuoteRequest extends Model
{
    public const DEADLINES = [
        'normal' => 'Normál (2–5 munkanap)',
        'urgent' => 'Sürgős (1–2 munkanap)',
        'express' => 'Expressz (24 órán belül)',
    ];

    protected $fillable = [
        'name',
        'email',
        'phone',
        'deadline',
        'source_language',
        'target_language',
        'message',
        'document_path',
        'document_name',
        'ip_address',
    ];

    protected $hidden = ['ip_address'];

    public function deadlineLabel(): string
    {
        return self::DEADLINES[$this->deadline] ?? $this->deadline;
    }
}
