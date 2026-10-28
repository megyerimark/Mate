<?php

namespace App\Mail;

use App\Models\QuoteRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Attachment;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Értesítés a fordítónak egy új ajánlatkérésről, a feltöltött dokumentummal. */
class QuoteRequestReceived extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public QuoteRequest $quote) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            replyTo: [new Address($this->quote->email, $this->quote->name)],
            subject: "Új ajánlatkérés: {$this->quote->name} ({$this->quote->deadlineLabel()})",
        );
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.quote-request-received');
    }

    public function attachments(): array
    {
        if (! $this->quote->document_path) {
            return [];
        }

        return [
            Attachment::fromStorageDisk('local', $this->quote->document_path)
                ->as($this->quote->document_name),
        ];
    }
}
