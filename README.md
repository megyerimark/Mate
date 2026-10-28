# Done Translations – weboldal

Ügyfélszerzésre optimalizált weboldal egy fordítóiroda számára.

- **`frontend/`**: Angular 21 (az oldal maga)
- **`backend/`**: Laravel 13 API (az árajánlatkérések mentése, a feltöltött fájl tárolása, e-mail értesítés)

Élesben a Laravel szolgálja ki a lebuildelt Angular oldalt is, így **egy domainen, egy átlagos PHP tárhelyen** fut minden (pl. Rackhost, Tárhely.eu, bármilyen cPanel).

## Hogyan működik az ajánlatkérés?

1. Az ügyfél kitölti az űrlapot, és opcionálisan feltölti a dokumentumot.
2. `POST /api/quote-requests`: a Laravel ellenőrzi az adatokat, elmenti az adatbázisba, a fájlt pedig privát tárhelyre (`storage/app/private/quote-requests`).
3. A fordító e-mailt kap az összes adattal **és a csatolt dokumentummal**. A „Válasz” gomb közvetlenül az ügyfélnek ír.
4. Az ügyfél automatikus visszaigazoló e-mailt kap.
5. Védelem: rejtett mezős spamszűrő (honeypot), IP-alapú korlát (5 kérés/perc, 30/nap), fájltípus- és méretellenőrzés (max. 8 MB).

## Fejlesztés helyben

Kell hozzá: PHP 8.3+, Composer, Node.js 22.22+.

```bash
# Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve            # http://localhost:8000

# Frontend (másik terminálban)
cd frontend
npm install
npm start                    # http://localhost:4200, az /api hívásokat a Laravelhez proxyzza
```

Helyben a kimenő e-mailek a `backend/storage/logs/laravel.log` fájlba kerülnek (`MAIL_MAILER=log`).

Tesztek: `cd backend && php artisan test`

## Élesítés

1. `cd frontend && npm run build:backend`: lebuildeli az Angulart, és bemásolja a `backend/public` mappába.
2. A `backend` mappát töltsd fel a tárhelyre. A domain gyökere (document root) a `backend/public` mappára mutasson.
3. A tárhelyen: `composer install --no-dev --optimize-autoloader`, `.env` kitöltése, `php artisan key:generate`, `php artisan migrate --force`.
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
   ```
5. A domain DNS-ét a tárhelyre kell állítani (ezt a domain-regisztrátornál lehet).

## Mit kell még kitölteni?

Szinte minden szöveg és adat egy helyen van: **`frontend/src/app/site.config.ts`**. Itt kell kicserélni:

- `[TELEFONSZÁM]`, `[EMAIL]`, cím, cégadatok
- `[X]`: statisztikák és árak
- Szolgáltatások, nyelvek, GYIK, vélemények (valódi véleményekre, pl. a Google Cégprofilból)

Továbbá:

- `frontend/src/index.html`: a keresőknek szóló cégadatok (JSON-LD blokk)
- `frontend/src/app/pages/home.html`: a „Miért minket” részben a rövid bemutatkozás
- Az adatkezelési tájékoztató, ÁSZF és impresszum oldalak (a láblécben és az űrlapon most `#` a link)

## További tippek több ügyfélhez

- **Google Cégprofil** (Google Maps) létrehozása, és vélemény kérése minden elégedett ügyféltől
- Az oldal beküldése a Google Search Console-ba
- Külön aloldalak a legkeresettebb témákra (pl. „bizonyítvány fordítás angolra”), mert jól hoznak keresési forgalmat
