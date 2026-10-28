<?php

namespace Tests\Feature;

use App\Mail\QuoteRequestConfirmation;
use App\Mail\QuoteRequestReceived;
use App\Models\QuoteRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Mail\Attachment;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class QuoteRequestTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        Storage::fake('local');
        config(['quotes.recipient' => 'forditas@example.com']);
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Teszt Elek',
            'email' => 'elek@example.com',
            'phone' => '+36301234567',
            'deadline' => 'urgent',
            'source_language' => 'magyar',
            'target_language' => 'angol',
            'message' => 'Érettségi bizonyítvány, záradékkal.',
            'privacy_accepted' => '1',
            'website' => '',
        ], $overrides);
    }

    public function test_it_stores_the_request_with_document_and_sends_emails(): void
    {
        $file = UploadedFile::fake()->create('bizonyitvany.pdf', 500, 'application/pdf');

        $this->post('/api/quote-requests', $this->payload(['document' => $file]))
            ->assertCreated()
            ->assertJson(['message' => 'Köszönjük, megkaptuk az ajánlatkérést!']);

        $quote = QuoteRequest::sole();
        $this->assertSame('Teszt Elek', $quote->name);
        $this->assertSame('bizonyitvany.pdf', $quote->document_name);
        Storage::disk('local')->assertExists($quote->document_path);

        Mail::assertSent(QuoteRequestReceived::class, function (QuoteRequestReceived $mail) use ($quote) {
            $mail->assertTo('forditas@example.com')
                ->assertHasReplyTo('elek@example.com')
                ->assertHasAttachment(Attachment::fromStorageDisk('local', $quote->document_path)->as('bizonyitvany.pdf'));

            return true;
        });
        Mail::assertSent(QuoteRequestConfirmation::class, fn ($mail) => $mail->hasTo('elek@example.com'));
    }

    public function test_document_is_optional(): void
    {
        $this->post('/api/quote-requests', $this->payload())->assertCreated();

        $this->assertNull(QuoteRequest::sole()->document_path);
    }

    public function test_it_validates_with_hungarian_messages(): void
    {
        $this->postJson('/api/quote-requests', $this->payload([
            'name' => '',
            'email' => 'nem-email',
            'privacy_accepted' => '0',
        ]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'name' => 'Kérjük, adja meg a nevét.',
                'email' => 'Kérjük, adjon meg egy érvényes e-mail címet.',
                'privacy_accepted' => 'Az adatkezelési tájékoztató elfogadása kötelező.',
            ]);

        $this->assertDatabaseCount('quote_requests', 0);
    }

    public function test_it_rejects_unsupported_and_oversized_files(): void
    {
        $this->postJson('/api/quote-requests', $this->payload([
            'document' => UploadedFile::fake()->create('virus.exe', 10),
        ]))->assertJsonValidationErrors('document');

        $this->postJson('/api/quote-requests', $this->payload([
            'document' => UploadedFile::fake()->create('nagy.pdf', 9000, 'application/pdf'),
        ]))->assertJsonValidationErrors('document');
    }

    public function test_honeypot_submissions_are_silently_dropped(): void
    {
        $this->post('/api/quote-requests', $this->payload(['website' => 'http://spam.example']))
            ->assertCreated();

        $this->assertDatabaseCount('quote_requests', 0);
        Mail::assertNothingSent();
    }

    public function test_it_is_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->post('/api/quote-requests', $this->payload())->assertCreated();
        }

        $this->post('/api/quote-requests', $this->payload())->assertTooManyRequests();
    }

    public function test_spa_routes_serve_the_angular_index(): void
    {
        $index = public_path('index.html');
        $existed = is_file($index);
        if (! $existed) {
            file_put_contents($index, '<app-root></app-root>');
        }

        try {
            $this->get('/')->assertOk();
            $this->get('/koszonjuk')->assertOk();
            $this->get('/api/nem-letezik')->assertNotFound();
        } finally {
            if (! $existed) {
                unlink($index);
            }
        }
    }
}
