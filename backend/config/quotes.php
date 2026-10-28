<?php

return [
    // Ide érkeznek az ajánlatkérések.
    'recipient' => env('QUOTE_RECIPIENT_EMAIL', env('MAIL_FROM_ADDRESS')),

    // Az ügyfélnek küldött visszaigazolásban jelenik meg.
    'phone' => env('QUOTE_CONTACT_PHONE', ''),

    'max_file_kb' => (int) env('QUOTE_MAX_FILE_KB', 8192),
];
