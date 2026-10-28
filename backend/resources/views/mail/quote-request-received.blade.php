<x-mail::message>
# Új ajánlatkérés érkezett

<x-mail::table>
| | |
|:--|:--|
| **Név** | {{ $quote->name }} |
| **E-mail** | {{ $quote->email }} |
| **Telefon** | {{ $quote->phone ?: '–' }} |
| **Határidő** | {{ $quote->deadlineLabel() }} |
| **Nyelvpár** | {{ $quote->source_language ?: '?' }} → {{ $quote->target_language ?: '?' }} |
| **Dokumentum** | {{ $quote->document_name ?: 'nincs csatolva' }} |
</x-mail::table>

@if ($quote->message)
**Megjegyzés:**

{{ $quote->message }}
@endif

Erre a levélre válaszolva közvetlenül az ügyfélnek ír. Ne felejtse: 1 órán belül válaszolni!

Azonosító: #{{ $quote->id }}
</x-mail::message>
