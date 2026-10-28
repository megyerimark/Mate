// Az oldal minden cserélendő adata egy helyen. A [ ] részeket kell kitölteni.
export const SITE = {
  name: 'Done Translations',
  phone: '[TELEFONSZÁM]',
  // tel: linkhez szóköz nélkül, pl. '+36301234567'
  phoneHref: 'tel:[TELEFONSZÁM]',
  email: '[EMAIL]',
  address: '[CÍM / VÁROS]',
  company: '[CÉGNÉV / EV, ADÓSZÁM]',
  openingHours: 'H–P: 8:00–18:00',
};

// A hős szakaszban a részecskék sorban ezeket a szavakat formázzák meg.
export const HERO_WORDS = [
  { text: 'Fordítás', language: 'Magyar' },
  { text: 'Translation', language: 'Angol' },
  { text: 'Übersetzung', language: 'Német' },
  { text: 'Traduction', language: 'Francia' },
  { text: 'Traduzione', language: 'Olasz' },
  { text: 'Traducción', language: 'Spanyol' },
  { text: 'Vertaling', language: 'Holland' },
];

// Görgetésre "élőben" lefordítódó mondat.
export const LIVE_TRANSLATION = [
  { language: 'Magyar', text: 'Nálunk a határidő nem kérdés, hanem ígéret.' },
  { language: 'English', text: 'With us, a deadline is not a question but a promise.' },
  { language: 'Deutsch', text: 'Bei uns ist eine Frist keine Frage, sondern ein Versprechen.' },
];

// PÉLDA SZÁMOK! Cserélje a valós adatokra, mielőtt élesedik az oldal.
export const STATS = [
  { value: 1200, suffix: '+', label: 'elégedett ügyfél' },
  { value: 15000, suffix: '+', label: 'lefordított oldal' },
  { value: 9, suffix: '', label: 'nyelv' },
  { value: 1, suffix: ' óra', label: 'alatt árajánlat' },
];

export const SERVICES = [
  {
    icon: '📄',
    title: 'Hivatalos iratok',
    text: 'Bizonyítványok, oklevelek, anyakönyvi kivonatok, erkölcsi bizonyítvány, jogosítvány – záradékolt fordítással, külföldi munkavállaláshoz és tanuláshoz.',
  },
  {
    icon: '⚖️',
    title: 'Jogi és üzleti fordítás',
    text: 'Szerződések, cégiratok, ÁSZF, pályázatok, üzleti levelezés. Precíz terminológia, szigorú titoktartás.',
  },
  {
    icon: '⚙️',
    title: 'Műszaki és orvosi szakfordítás',
    text: 'Használati útmutatók, műszaki leírások, orvosi leletek, zárójelentések – szakterületen jártas fordítóval.',
  },
  {
    icon: '🌐',
    title: 'Weboldal és marketing',
    text: 'Weboldalak, webshopok, termékleírások lokalizálása, hogy külföldön is ugyanúgy eladjon, mint itthon.',
  },
  {
    icon: '🔍',
    title: 'Lektorálás',
    text: 'Meglévő fordítások, szakdolgozatok, cikkek nyelvi és szakmai ellenőrzése, javítása.',
  },
  {
    icon: '🎙️',
    title: 'Tolmácsolás',
    text: 'Üzleti tárgyalások, hivatalos ügyintézés, rendezvények – személyesen vagy online.',
  },
];

export const LANGUAGES = [
  { flag: '🇬🇧', name: 'angol' },
  { flag: '🇩🇪', name: 'német' },
  { flag: '🇫🇷', name: 'francia' },
  { flag: '🇮🇹', name: 'olasz' },
  { flag: '🇪🇸', name: 'spanyol' },
  { flag: '🇳🇱', name: 'holland' },
  { flag: '🇷🇴', name: 'román' },
  { flag: '🇸🇰', name: 'szlovák' },
];

export const STEPS = [
  {
    title: 'Küldje el a dokumentumot',
    text: 'Töltse fel az űrlapon, vagy fotózza le és küldje e-mailben. Elég egy jó minőségű telefonos kép is.',
  },
  {
    title: 'Fix árajánlatot kap',
    text: '1 órán belül (munkaidőben) pontos árat és határidőt küldünk. Ez az ár nem változik.',
  },
  {
    title: 'Megkapja a fordítást',
    text: 'Elfogadás után elkészítjük, és határidőre e-mailben, kérésre postán is elküldjük.',
  },
];

export const PRICES = [
  {
    title: 'Hivatalos irat',
    price: '[X] Ft-tól',
    unit: '/ dokumentum',
    features: ['Bizonyítvány, anyakönyvi kivonat', 'Záradékolt fordítás', '2–3 munkanap'],
    featured: false,
  },
  {
    title: 'Szakfordítás',
    price: '[X] Ft-tól',
    unit: '/ karakter',
    features: ['Jogi, üzleti, műszaki, orvosi', 'Szakterületen jártas fordító', 'Ellenőrzés leadás előtt'],
    featured: true,
  },
  {
    title: 'Expressz',
    price: '+[X]%',
    unit: 'felár',
    features: ['Akár 24 órán belül', 'Hétvégén is', 'Sürgős ügyintézéshez'],
    featured: false,
  },
];

export const REASONS = [
  { title: 'Gyors válasz', text: 'Munkaidőben 1 órán belül reagálunk.' },
  { title: 'Fix ár', text: 'Az ajánlatban szereplő ár a végleges ár.' },
  { title: 'Határidő-garancia', text: 'Ha mi csúszunk, Ön kedvezményt kap.' },
  { title: 'Titoktartás', text: 'Dokumentumait bizalmasan kezeljük, kérésre titoktartási szerződést (NDA) is aláírunk.' },
  { title: 'Ingyenes javítás', text: 'Ha bármi nem tetszik, díjmentesen javítjuk.' },
];

// Cserélje valódi véleményekre, pl. a Google Cégprofilból.
export const TESTIMONIALS = [
  {
    quote: 'Az érettségi bizonyítványom fordítását másnapra megkaptam, pedig sürgős volt. Gördülékeny, gyors, kedves kommunikáció.',
    author: '[Név], magánszemély',
  },
  {
    quote: 'A cégünk szerződéseit és weboldalát is itt fordíttatjuk. Precíz szakmai munka, mindig határidőre.',
    author: '[Név], [Cégnév]',
  },
  {
    quote: 'Az orvosi leleteimet kellett németre fordítani a külföldi kezeléshez. Pontos, érthető fordítást kaptam, korrekt áron.',
    author: '[Név], magánszemély',
  },
];

export const FAQ = [
  {
    q: 'Mennyi idő alatt készül el a fordítás?',
    a: 'Egy 1–2 oldalas hivatalos irat általában 1–3 munkanap alatt, de expressz fordítást akár 24 órán belül is vállalunk. A pontos határidőt az ajánlatban megadjuk.',
  },
  {
    q: 'Mi a különbség a hiteles és a záradékolt fordítás között?',
    a: 'Magyarországon hiteles fordítást főszabály szerint az OFFI készíthet, bizonyos esetekben (pl. cégiratok, illetve ha a fogadó szerv kifejezetten ezt kéri). Külföldi hatóságok, munkáltatók és egyetemek az esetek többségében elfogadják a fordítói záradékkal ellátott fordítást. Ha bizonytalan, kérdezze meg a fogadó intézményt, vagy írjon nekünk, és segítünk eldönteni.',
  },
  {
    q: 'Hogyan küldhetem el a dokumentumot?',
    a: 'Az árajánlatkérő űrlapon feltöltheti, vagy elküldheti e-mailben. Szkennelt PDF és jó minőségű telefonos fotó is megfelelő.',
  },
  {
    q: 'Hogyan fizethetek?',
    a: 'Banki átutalással vagy [egyéb fizetési mód]. Minden megrendelésről számlát állítunk ki, cégeknek is.',
  },
  {
    q: 'Mi történik, ha nem vagyok elégedett?',
    a: 'Jelezze nekünk, és díjmentesen javítjuk a fordítást, amíg nem lesz tökéletes.',
  },
];

export const DEADLINES = [
  { value: 'normal', label: 'Normál (2–5 munkanap)' },
  { value: 'urgent', label: 'Sürgős (1–2 munkanap)' },
  { value: 'express', label: 'Expressz (24 órán belül)' },
];

export const MAX_FILE_MB = 8;
export const ACCEPTED_FILES = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xlsx,.pptx';
