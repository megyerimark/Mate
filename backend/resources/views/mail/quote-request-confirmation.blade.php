<x-mail::message>
# Kedves {{ $quote->name }}!

Köszönjük, megkaptuk az ajánlatkérését. Munkaidőben **1 órán belül** jelentkezünk a pontos árral és határidővel.

@if ($quote->document_name)
A csatolt dokumentum ({{ $quote->document_name }}) rendben megérkezett.
@endif

Ha sürgős, vagy kérdése van, válaszoljon erre a levélre, vagy hívjon minket: {{ config('quotes.phone') }}

Üdvözlettel,<br>
{{ config('app.name') }}
</x-mail::message>
