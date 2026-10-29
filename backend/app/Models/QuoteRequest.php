<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuoteRequest extends Model
{
    /** Az ajánlatkérés útja az admin felületen, a beérkezéstől a megrendelésig. */
    public const STATUSES = [
        'new' => 'Új',
        'in_progress' => 'Folyamatban',
        'quoted' => 'Ajánlat elküldve',
        'won' => 'Megrendelve',
        'lost' => 'Elmaradt',
    ];

    public const DEADLINES = [
        'normal' => 'Normál (2–5 munkanap)',
        'urgent' => 'Sürgős (1–2 munkanap)',
        'express' => 'Expressz (24 órán belül)',
    ];

    // A status és az admin_note szándékosan nincs itt: csak az admin felület állítja őket.
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

    public function statusLabel(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    public function deadlineLabel(): string
    {
        return self::DEADLINES[$this->deadline] ?? $this->deadline;
    }
}
