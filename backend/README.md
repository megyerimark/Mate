# Done Translations – backend

**Laravel 13** API a Done Translations weboldalhoz: árajánlatkérések fogadása, e-mail értesítés, admin felület API.
A hozzá tartozó frontend (Angular): [mate_front](https://github.com/megyerimark/mate_front).

## Fejlesztés

Kell hozzá: PHP 8.3+ és Composer.

```bash
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan admin:create admin@donetranslations.hu   # bekéri a jelszót
php artisan serve                                    # http://localhost:8000
```

Helyben a kimenő e-mailek a `storage/logs/laravel.log` fájlba kerülnek (`MAIL_MAILER=log`).

Tesztek: `php artisan test`

## Hogyan működik az ajánlatkérés?

1. Az ügyfél kitölti az űrlapot a weboldalon, és opcionálisan feltölti a dokumentumot.
2. `POST /api/quote-requests`: a Laravel ellenőrzi az adatokat, elmenti az adatbázisba, a fájlt privát tárhelyre (`storage/app/private/quote-requests`).
3. A fordító e-mailt kap az összes adattal **és a csatolt dokumentummal**. A „Válasz” gomb közvetlenül az ügyfélnek ír.
4. Az ügyfél automatikus visszaigazoló e-mailt kap.
5. Védelem: rejtett mezős spamszűrő (honeypot), IP-alapú korlát (5 kérés/perc, 30/nap), fájltípus- és méretellenőrzés (max. 8 MB).

Az e-mailek a weboldal színeit használják: `resources/views/vendor/mail/html/themes/donetranslations.css`.

## Admin

Admin felhasználó létrehozása, vagy jelszavának megváltoztatása (ilyenkor a régi bejelentkezések megszűnnek):

```bash
php artisan admin:create baratom@example.com --name="Barátom"
```

Nyilvános regisztráció nincs. A bejelentkezés tokennel működik (Laravel Sanctum), 12 óráig érvényes
(`SANCTUM_EXPIRATION`, percben). Hibás jelszóval percenként legfeljebb 5 próba lehet.

| Végpont | Mire |
|---|---|
| `POST /api/admin/login` | bejelentkezés, tokent ad |
| `POST /api/admin/logout` | kijelentkezés |
| `GET /api/admin/stats` | összesítő számok állapot szerint |
| `GET /api/admin/quote-requests` | lista (`status`, `search`, `page`) |
| `GET /api/admin/quote-requests/{id}` | egy ajánlatkérés |
| `PATCH /api/admin/quote-requests/{id}` | állapot (`status`) és belső jegyzet (`admin_note`) |
| `DELETE /api/admin/quote-requests/{id}` | törlés a feltöltött fájllal együtt |
| `GET /api/admin/quote-requests/{id}/document` | a feltöltött dokumentum letöltése |

Állapotok: `new` (Új), `in_progress` (Folyamatban), `quoted` (Ajánlat elküldve), `won` (Megrendelve), `lost` (Elmaradt).

## Élesítés

1. A frontendben: `npm run build:backend` – bemásolja a lebuildelt oldalt ennek a projektnek a `public` mappájába.
   Így a Laravel szolgálja ki a weboldalt és az admin felületet is, **egy domainen, egy átlagos PHP tárhelyen**.
2. Ezt a projektet töltsd fel a tárhelyre. A domain gyökere (document root) a `public` mappára mutasson.
3. A tárhelyen: `composer install --no-dev --optimize-autoloader`, `.env` kitöltése, `php artisan key:generate`,
   `php artisan migrate --force`, `php artisan admin:create ...`.
4. `.env` fontos sorai:
   ```
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://donetranslations.hu
   DB_CONNECTION=mysql            # vagy maradhat sqlite
   MAIL_MAILER=smtp               # a tárhely SMTP adataival
   MAIL_FROM_ADDRESS=info@donetranslations.hu
   QUOTE_RECIPIENT_EMAIL=ide-jonnek-az-ajanlatkeresek@example.com
   QUOTE_CONTACT_PHONE="+36 30 123 4567"
   # Csak ha a frontend külön domainen fut:
   CORS_ALLOWED_ORIGINS=https://donetranslations.hu
   ```
5. A domain DNS-ét a tárhelyre kell állítani (ezt a domain-regisztrátornál lehet).
