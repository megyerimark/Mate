# Done Translations – frontend

Ügyfélszerzésre optimalizált weboldal egy fordítóiroda számára, **Angular 21**-ben, admin felülettel.
A hozzá tartozó backend (Laravel): [mate_back](https://github.com/megyerimark/mate_back).

## Fejlesztés

Kell hozzá: Node.js 22 (legalább 22.12) vagy újabb, és a futó Laravel backend.

```bash
npm install
npm start            # http://localhost:4200
```

A `/api` hívásokat a fejlesztői szerver a `http://localhost:8000`-en futó Laravelhez továbbítja (`proxy.conf.json`).

## Mit kell kitölteni?

Szinte minden szöveg és adat egy helyen van: **`src/app/site.config.ts`**.

- `[TELEFONSZÁM]`, `[EMAIL]`, cím, cégadatok
- **`STATS`: most PÉLDA számok vannak benne (1200 ügyfél stb.), élesítés előtt valósra kell cserélni!**
- `[X]`: árak
- `HERO_WORDS`: a nyitóképernyőn a részecskékből kirajzolódó szavak (csak olyan nyelv legyen, amit valóban vállal)
- `LIVE_TRANSLATION`: a görgetésre „élőben” lefordítódó mondat
- Szolgáltatások, nyelvek, GYIK, vélemények (valódi véleményekre, pl. a Google Cégprofilból)

Továbbá:

- `src/index.html`: a keresőknek szóló cégadatok (JSON-LD blokk)
- `src/app/pages/home.html`: a „Miért minket” részben a rövid bemutatkozás
- Az adatkezelési tájékoztató, ÁSZF és impresszum oldalak (a láblécben és az űrlapon most `#` a link)

## Admin felület

A **`/admin`** címen érhető el (pl. `https://donetranslations.hu/admin`). Admin felhasználót a backendben kell létrehozni (lásd ott).

- Összesítő számok állapot szerint (kattintásra szűr), keresés név, e-mail, telefon vagy megjegyzés alapján
- Részletek panel: válasz e-mailben egy kattintással, hívás, a feltöltött dokumentum letöltése
- Állapotok: **Új → Folyamatban → Ajánlat elküldve → Megrendelve / Elmaradt**
- Belső jegyzet (az ügyfél nem látja), törlés megerősítéssel
- Külön töltődik be, a nyilvános oldalt nem lassítja. A bejelentkezés 12 óráig érvényes.

Kód: `src/app/admin/`, megjelenés: `src/admin.css`.

## Élesítés

**A) Egy domainen a Laravellel (ajánlott, átlagos PHP tárhelyre):**

```bash
npm run build:backend
```

Lebuildeli az oldalt, és bemásolja a mellette lévő `mate_back` (vagy `backend`) mappa `public` könyvtárába.
Más helyen lévő backendhez: `BACKEND_DIR=/ut/a/mate_back npm run build:backend`. Utána csak a backendet kell feltölteni.

**B) Külön domainen a backendtől:** a `src/environments/environment.ts`-ben az `apiUrl`-be írd a backend címét,
majd `npm run build`, és a `dist/frontend/browser` mappát töltsd fel. A backendben a `CORS_ALLOWED_ORIGINS`-be
írd a frontend címét.

## Arculat

**Ivory + Forest Green, sárgaréz arany részletekkel.** Világos elefántcsont háttér, mélyzöld gombok és kiemelések, apró arany részletek.

| Szín | Kód | Mire |
|---|---|---|
| Elefántcsont | `#F7F5EF` | háttér |
| Fehér | `#FFFFFF` | kártyák, űrlap |
| Mélyzöld | `#245B48` | gombok, kiemelt szavak, logó |
| Sötétzöld-szürke | `#202A26` | fő szöveg |
| Zsályaszürke | `#5E6B64` | másodlagos szöveg |
| Halvány zsálya | `#A7B9AD` | csak díszítés (szövegnek túl világos) |
| Sárgaréz arany | `#C29B4A` | kitöltések: címke, jelek, pontok |
| Óarany | `#8C6420` | ha az arany maga a szöveg |

- A színek a `src/styles.css` elején vannak, egy helyen.
- Megosztási kép (Facebook, Messenger): `public/og-image.png`.
- Ikonok: `src/app/components/icon.ts` (saját vonalas ikonok, zöld körvonal arany részlettel).

## Effektek

- **Nyitóképernyő**: több ezer részecske (three.js / WebGL), amik sorban kirajzolják a „fordítás” szót különböző nyelveken, mögöttük lassan forgó ív. Az egér közelében szétrebbennek, görgetéskor szétrepülnek.
- **Élő fordítás**: rögzített szakasz, ahol görgetésre betűnként fordítódik egy mondat magyarról angolra, majd németre (GSAP ScrollTrigger).
- **Lépések**: asztali gépen vízszintesen görgetett panelek.
- Soronként becsúszó címsorok, felpörgő számlálók, 3D-ben dönthető kártyák, mágneses gombok, egyedi kurzor, nyelvi szalag.

A 3D jelenet külön, késleltetve töltődik be, mobilon kevesebb részecskével fut, és leáll, ha nem látszik.
Ha a látogató csökkentett mozgást kért, vagy a böngésző nem tud WebGL-t, statikus változatot kap.

## További tippek több ügyfélhez

- **Google Cégprofil** (Google Maps) létrehozása, és vélemény kérése minden elégedett ügyféltől
- Az oldal beküldése a Google Search Console-ba
- Külön aloldalak a legkeresettebb témákra (pl. „bizonyítvány fordítás angolra”)
