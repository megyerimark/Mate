# Done Translations – új weboldal

Egyoldalas, ügyfélszerzésre optimalizált statikus weboldal (HTML + CSS + JS).
**Nincs szükség backendre**: bármilyen tárhelyen működik, a régi oldal technológiájától függetlenül.

## Fájlok
- `index.html` – a teljes oldal
- `styles.css` – megjelenés
- `script.js` – mobil menü, animációk, fájlméret-ellenőrzés
- `koszonjuk.html` – az űrlap elküldése után megjelenő oldal

## Mit kell kitölteni?
Keressen rá a `[` jelre, és cserélje ki ezeket:
- `[TELEFONSZÁM]` (a `tel:` linkekben szóköz nélkül, pl. `+36301234567`)
- `[EMAIL]`, `[VÁROS]`, `[CÍM / VÁROS]`, `[CÉGNÉV / EV, ADÓSZÁM]`
- `[X]` – statisztikák és árak
- `[RÖVID BEMUTATKOZÁS ...]` – pár mondat a fordítóról
- Vélemények: valódi ügyfélvéleményekre cserélni (pl. Google Cégprofilból)
- Nyelvek listája, szolgáltatások: a valós kínálathoz igazítani
- Adatkezelési tájékoztató / ÁSZF / Impresszum linkek

## Élesítés (ingyenes)
1. **Netlify** (ajánlott): netlify.com → „Add new site” → a mappa feltöltése vagy a GitHub repó összekötése.
   Az árajánlatkérő űrlap (fájlfeltöltéssel) **magától működik**, a beérkező kéréseket e-mailben küldi.
2. A `donetranslations.hu` domain DNS-ét a domain-regisztrátornál át kell állítani a Netlify-ra
   (Netlify → Domain settings mutatja a pontos lépéseket).

Más tárhelyen (pl. a jelenlegin) az űrlaphoz egy ingyenes [Formspree](https://formspree.io) fiók kell:
a `<form>` `action` attribútumát kell átírni `https://formspree.io/f/AZONOSITO`-ra.

## További tippek több ügyfélhez
- **Google Cégprofil** (Google Maps) létrehozása, vélemények kérése minden elégedett ügyféltől
- Google Search Console-ba beküldeni az oldalt
- Külön aloldalak a legkeresettebb témákra (pl. „bizonyítvány fordítás angolra”), mert jól hoznak keresési forgalmat
