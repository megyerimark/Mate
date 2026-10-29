<?php

namespace Tests\Feature;

use App\Models\QuoteRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    private function quote(array $attributes = []): QuoteRequest
    {
        $quote = QuoteRequest::create(array_merge([
            'name' => 'Teszt Elek',
            'email' => 'elek@example.com',
            'deadline' => 'normal',
            'message' => 'Bizonyítvány angolra',
        ], $attributes));

        return $quote->refresh();
    }

    public function test_admin_can_log_in_and_out(): void
    {
        User::factory()->create(['email' => 'admin@example.com', 'password' => 'titkos-jelszo-123']);

        $token = $this->postJson('/api/admin/login', ['email' => 'admin@example.com', 'password' => 'titkos-jelszo-123'])
            ->assertOk()
            ->assertJsonPath('user.email', 'admin@example.com')
            ->json('token');

        $this->withToken($token)->getJson('/api/admin/me')->assertOk()->assertJsonPath('email', 'admin@example.com');
        $this->withToken($token)->postJson('/api/admin/logout')->assertOk();

        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/admin/me')->assertUnauthorized();
    }

    public function test_wrong_password_is_rejected_and_login_is_rate_limited(): void
    {
        User::factory()->create(['email' => 'admin@example.com', 'password' => 'titkos-jelszo-123']);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/admin/login', ['email' => 'admin@example.com', 'password' => 'rossz'])
                ->assertUnprocessable()
                ->assertJsonValidationErrors(['email' => 'Hibás e-mail cím vagy jelszó.']);
        }

        $this->postJson('/api/admin/login', ['email' => 'admin@example.com', 'password' => 'titkos-jelszo-123'])
            ->assertTooManyRequests();
    }

    public function test_admin_endpoints_require_login(): void
    {
        $quote = $this->quote();

        $this->getJson('/api/admin/quote-requests')->assertUnauthorized();
        $this->getJson('/api/admin/stats')->assertUnauthorized();
        $this->patchJson("/api/admin/quote-requests/{$quote->id}", ['status' => 'won'])->assertUnauthorized();
        $this->deleteJson("/api/admin/quote-requests/{$quote->id}")->assertUnauthorized();
    }

    public function test_list_is_newest_first_and_filters_by_status_and_search(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $old = $this->quote(['name' => 'Régi Ügyfél']);
        $old->forceFill(['status' => 'quoted', 'created_at' => now()->subDays(3)])->save();
        $new = $this->quote(['name' => 'Kovács Anna', 'email' => 'anna@example.com']);

        $this->getJson('/api/admin/quote-requests')
            ->assertOk()
            ->assertJsonPath('data.0.id', $new->id)
            ->assertJsonPath('data.0.status_label', 'Új')
            ->assertJsonPath('meta.total', 2);

        $this->getJson('/api/admin/quote-requests?status=quoted')
            ->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $old->id);

        $this->getJson('/api/admin/quote-requests?search=anna@')
            ->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $new->id);

        $this->getJson('/api/admin/quote-requests?status=nincs-ilyen')->assertUnprocessable();
    }

    public function test_admin_can_update_status_and_note(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $quote = $this->quote();

        $this->patchJson("/api/admin/quote-requests/{$quote->id}", ['status' => 'quoted', 'admin_note' => '12 000 Ft, holnapra'])
            ->assertOk()
            ->assertJsonPath('data.status', 'quoted')
            ->assertJsonPath('data.status_label', 'Ajánlat elküldve')
            ->assertJsonPath('data.admin_note', '12 000 Ft, holnapra');

        $this->patchJson("/api/admin/quote-requests/{$quote->id}", ['status' => 'kitalalt'])
            ->assertUnprocessable()->assertJsonValidationErrors(['status' => 'Ismeretlen állapot.']);
    }

    public function test_public_form_cannot_set_status_or_note(): void
    {
        $this->post('/api/quote-requests', [
            'name' => 'Teszt', 'email' => 't@example.com', 'deadline' => 'normal', 'privacy_accepted' => '1',
            'status' => 'won', 'admin_note' => 'hack',
        ])->assertCreated();

        $quote = QuoteRequest::sole();
        $this->assertSame('new', $quote->status);
        $this->assertNull($quote->admin_note);
    }

    public function test_document_download_and_delete_removes_file(): void
    {
        Storage::fake('local');
        Sanctum::actingAs(User::factory()->create());
        $path = UploadedFile::fake()->create('okirat.pdf', 20, 'application/pdf')->store('quote-requests', 'local');
        $quote = $this->quote(['document_path' => $path, 'document_name' => 'okirat.pdf']);

        $this->get("/api/admin/quote-requests/{$quote->id}/document")
            ->assertOk()
            ->assertDownload('okirat.pdf');

        $this->deleteJson("/api/admin/quote-requests/{$quote->id}")->assertOk();
        Storage::disk('local')->assertMissing($path);
        $this->assertDatabaseCount('quote_requests', 0);

        $other = $this->quote();
        $this->getJson("/api/admin/quote-requests/{$other->id}/document")->assertNotFound();
    }

    public function test_stats_count_by_status(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $this->quote();
        $this->quote()->forceFill(['status' => 'won'])->save();
        $this->quote()->forceFill(['status' => 'won'])->save();

        $this->getJson('/api/admin/stats')
            ->assertOk()
            ->assertJsonPath('total', 3)
            ->assertJsonPath('this_month', 3)
            ->assertJsonFragment(['status' => 'won', 'label' => 'Megrendelve', 'total' => 2])
            ->assertJsonFragment(['status' => 'new', 'label' => 'Új', 'total' => 1]);
    }

    public function test_admin_create_command(): void
    {
        $this->artisan('admin:create', ['email' => 'baratom@example.com', '--name' => 'Barátom'])
            ->expectsQuestion('Jelszó (legalább 10 karakter)', 'eleg-hosszu-jelszo')
            ->expectsQuestion('Jelszó újra', 'eleg-hosszu-jelszo')
            ->expectsOutput('Admin létrehozva: baratom@example.com')
            ->assertSuccessful();

        $this->postJson('/api/admin/login', ['email' => 'baratom@example.com', 'password' => 'eleg-hosszu-jelszo'])->assertOk();

        $this->artisan('admin:create', ['email' => 'x@example.com'])
            ->expectsQuestion('Jelszó (legalább 10 karakter)', 'rovid')
            ->expectsQuestion('Jelszó újra', 'rovid')
            ->assertFailed();
    }
}
