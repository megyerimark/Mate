<?php

namespace App\Http\Requests;

use App\Models\QuoteRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreQuoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:40'],
            'deadline' => ['required', Rule::in(array_keys(QuoteRequest::DEADLINES))],
            'source_language' => ['nullable', 'string', 'max:50'],
            'target_language' => ['nullable', 'string', 'max:50'],
            'message' => ['nullable', 'string', 'max:5000'],
            'document' => [
                'nullable',
                'file',
                'max:'.config('quotes.max_file_kb'),
                'mimes:pdf,doc,docx,jpg,jpeg,png,txt,xlsx,pptx',
            ],
            'privacy_accepted' => ['accepted'],
            // Honeypot: emberek nem látják, botok kitöltik.
            'website' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Kérjük, adja meg a nevét.',
            'email.required' => 'Kérjük, adja meg az e-mail címét.',
            'email.email' => 'Kérjük, adjon meg egy érvényes e-mail címet.',
            'deadline.required' => 'Kérjük, válasszon határidőt.',
            'deadline.in' => 'Érvénytelen határidő.',
            'document.max' => 'A fájl túl nagy (max. '.intdiv(config('quotes.max_file_kb'), 1024).' MB). Kérjük, küldje e-mailben.',
            'document.mimes' => 'Ez a fájltípus nem támogatott. PDF, Word, Excel, PowerPoint, kép vagy szöveg tölthető fel.',
            'document.uploaded' => 'A fájl feltöltése nem sikerült. Kérjük, próbálja újra vagy küldje e-mailben.',
            'privacy_accepted.accepted' => 'Az adatkezelési tájékoztató elfogadása kötelező.',
            '*.max' => 'A(z) :attribute legfeljebb :max karakter lehet.',
            '*.string' => 'A(z) :attribute mező formátuma érvénytelen.',
            'document.file' => 'A dokumentum feltöltése nem sikerült.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'név',
            'email' => 'e-mail',
            'phone' => 'telefon',
            'source_language' => 'forrásnyelv',
            'target_language' => 'célnyelv',
            'message' => 'megjegyzés',
        ];
    }

    public function isSpam(): bool
    {
        return filled($this->input('website'));
    }
}
