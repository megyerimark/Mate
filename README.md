# Done Translations – weboldal

Ügyfélszerzésre optimalizált weboldal egy fordítóiroda számára.

- **`frontend/`**: Angular 21 (az oldal maga)
- **`backend/`**: Laravel 13 API (az árajánlatkérések mentése, a feltöltött fájl tárolása, e-mail értesítés)

Élesben a Laravel szolgálja ki a lebuildelt Angular oldalt is, így **egy domainen, egy átlagos PHP tárhelyen** fut minden (pl. Rackhost, Tárhely.eu, bármilyen cPanel).

## Színtémák

Három beépített színtéma van, mindegyik ugyanazokkal az effektekkel:

| Téma | Kód | Hangulat |
|---|---|---|
| Midnight Blue + Teal | `midnight` | sötétkék, türkiz gombok |
| Ivory + Forest Green | `ivory` (alapértelmezett) | világos elefántcsont, mélyzöld gombok, sárgaréz arany részletek |
| Charcoal + Champagne | `champagne` | grafit, pezsgőarany gombok |

- **Kipróbálás:** a cím végére `?tema=midnight` vagy `?tema=champagne` (pl. `https://donetranslations.hu/?tema=midnight`).
- **Végleges választás:** a `frontend/src/index.html`-ben a `<html lang="hu" data-theme="ivory">` értékét kell átírni.
- A színek a `frontend/src/styles.css` elején vannak, témánként egy blokkban.

## Dizájn és effektek

Sötét, filmszerű megjelenés, a modern „agency” oldalak stílusában:

- **Nyitóképernyő**: több ezer fénylő részecske (three.js / WebGL), amik sorban kirajzolják a „fordítás” szót különböző nyelveken. Az egér közelében szétrebbennek, görgetéskor szétrepülnek.
- **Élő fordítás**: rögzített szakasz, ahol görgetésre betűnként fordítódik egy mondat magyarról angolra, majd németre (GSAP ScrollTrigger).
- **Lépések**: asztali gépen vízszintesen görgetett panelek.
- Soronként becsúszó címsorok, felpörgő számlálók, 3D-ben dönthető kártyák, mágneses gombok, egyedi kurzor, nyelvi szalag.

Teljesítmény: a 3D jelenet külön, késleltetve töltődik be (az oldal maga gyorsan megjelenik). Mobilon kevesebb részecskével fut. Ha a nyitóképernyő nem látszik, leáll. Ha a látogató a rendszerében csökkentett mozgást kért, vagy a böngésző nem tud WebGL-t, egyszerűsített, statikus változatot kap.

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
- **`STATS`: most PÉLDA számok vannak benne (1200 ügyfél stb.), ezeket élesítés előtt valósra kell cserélni!**
- `[X]`: árak
- `HERO_WORDS`: a nyitóképernyőn a részecskékből kirajzolódó szavak (csak olyan nyelv legyen, amit valóban vállal)
- `LIVE_TRANSLATION`: a görgetésre „élőben” lefordítódó mondat
- Szolgáltatások, nyelvek, GYIK, vélemények (valódi véleményekre, pl. a Google Cégprofilból)

Továbbá:

- `frontend/src/index.html`: a keresőknek szóló cégadatok (JSON-LD blokk)
- `frontend/src/app/pages/home.html`: a „Miért minket” részben a rövid bemutatkozás
- Az adatkezelési tájékoztató, ÁSZF és impresszum oldalak (a láblécben és az űrlapon most `#` a link)

## További tippek több ügyfélhez

- **Google Cégprofil** (Google Maps) létrehozása, és vélemény kérése minden elégedett ügyféltől
- Az oldal beküldése a Google Search Console-ba
- Külön aloldalak a legkeresettebb témákra (pl. „bizonyítvány fordítás angolra”), mert jól hoznak keresési forgalmat
