// Megapolis — backend application server
// Vanilla Node.js HTTP server: static files + JSON API + auth + form handling
// Replaces the earlier static-only dev server. No external dependencies.

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const SUBMISSIONS_DIR = path.join(DATA_DIR, 'submissions');

// Ensure data directories exist
for (const dir of [DATA_DIR, SUBMISSIONS_DIR, path.join(DATA_DIR, 'sites')]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.otf':  'font/otf',
  '.eot':  'application/vnd.ms-fontobject',
  '.pdf':  'application/pdf',
  '.txt':  'text/plain; charset=utf-8',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
  '.ogv':  'video/ogg',
  '.mov':  'video/quicktime',
  '.mp3':  'audio/mpeg',
  '.m4a':  'audio/mp4',
};

// ---------- Utilities ----------

function readJSON(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error('readJSON error', filePath, e.message);
    return fallback;
  }
}

function writeJSON(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function sendJSON(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function sendText(res, status, text, mime = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': mime });
  res.end(text);
}

function parseBody(req, maxBytes = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > maxBytes) { reject(new Error('payload too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf8');
      if (!body) return resolve({});
      try {
        const ct = (req.headers['content-type'] || '').split(';')[0].trim();
        if (ct === 'application/json') return resolve(JSON.parse(body));
        if (ct === 'application/x-www-form-urlencoded') {
          const obj = {};
          for (const p of body.split('&')) {
            const [k, v] = p.split('=');
            obj[decodeURIComponent(k)] = decodeURIComponent((v || '').replace(/\+/g, ' '));
          }
          return resolve(obj);
        }
        resolve({ raw: body });
      } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

// ---------- Auth ----------
// Simple token store in memory. In production this would be JWT + hashed passwords.
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'megapolis2026';
const activeTokens = new Map(); // token -> { user, createdAt }

function issueToken(user) {
  const t = crypto.randomBytes(24).toString('hex');
  activeTokens.set(t, { user, createdAt: Date.now() });
  return t;
}
function verifyToken(req) {
  const h = req.headers['authorization'] || '';
  const m = /^Bearer\s+(.+)$/.exec(h);
  if (!m) return null;
  const rec = activeTokens.get(m[1]);
  if (!rec) return null;
  // 8-hour session
  if (Date.now() - rec.createdAt > 8 * 3600 * 1000) { activeTokens.delete(m[1]); return null; }
  return rec;
}
function requireAuth(req, res) {
  const who = verifyToken(req);
  if (!who) { sendJSON(res, 401, { error: 'auth required' }); return null; }
  return who;
}

// ---------- Content storage ----------
// Each content collection is a JSON file in data/
const VALID_KEYS = new Set([
  'settings',     // global site config (logo, accent, contact, social, topbar, promo)
  'news',         // array of articles
  'realizacje',   // array of investments
  'faq',          // array {q,a}
  'testimonials', // array
  'apartments',   // array (mock THTG)
  'jobs',         // array (mock eRecruiter)
  'osiedla',      // array of sub-sites in multisite
  'i18n',         // { pl: {...}, en: {...} }
]);

function contentPath(key) { return path.join(DATA_DIR, `${key}.json`); }
function getContent(key, fallback = null) {
  if (!VALID_KEYS.has(key)) return null;
  return readJSON(contentPath(key), fallback);
}
function setContent(key, data) {
  if (!VALID_KEYS.has(key)) return false;
  writeJSON(contentPath(key), data);
  return true;
}

// ---------- Seed data (first run) ----------
function seedIfMissing(key, seed) {
  if (!fs.existsSync(contentPath(key))) setContent(key, seed);
}

seedIfMissing('settings', {
  logo: 'MEGAPOLIS',
  accent: '#c9a96e',
  bg: '#06080e',
  contact: {
    phone: '+48 58 123 45 67',
    email: 'biuro@megapolis.pl',
    address: 'ul. Przykladowa 12, 80-001 Gdansk',
  },
  social: {
    facebook: 'https://facebook.com/megapolis',
    instagram: 'https://instagram.com/megapolis',
    linkedin: 'https://linkedin.com/company/megapolis',
  },
  topBar: { enabled: true, text: 'Nowa inwestycja w Gdansku — zapisy trwaja', ctaText: 'Sprawdz', ctaLink: '#realizacje' },
  promoModal: { enabled: true, title: 'Promocja wiosenna', body: 'Rezerwuj mieszkanie do 30 maja i skorzystaj z bonusu wykonczeniowego.', ctaText: 'Zarezerwuj rozmowe', ctaLink: '#kontakt' },
  seo: { title: 'Megapolis — deweloper premium', description: 'Luksusowe inwestycje mieszkaniowe w Trojmiescie i calej Polsce.' },
});

seedIfMissing('news', [
  { id: 'n1', slug: 'nowa-inwestycja-ozon', title: 'Rusza sprzedaz w Osiedlu Ozon', date: '2026-04-10', excerpt: 'Rozpoczelismy sprzedaz 142 apartamentow w Gdansku Wrzeszczu.', cover: '', body: '<p>Osiedle Ozon to nasza najnowsza inwestycja premium w sercu Wrzeszcza. Oddajemy do dyspozycji 142 apartamenty z pelnym zapleczem wellness, prywatnym ogrodem i podziemnym parkingiem.</p><p>Pierwsi klienci juz rezerwuja mieszkania z widokiem na park.</p>' },
  { id: 'n2', slug: 'nagroda-property-design-awards', title: 'Nagroda Property Design Awards 2026', date: '2026-03-22', excerpt: 'Nasza realizacja Linden Bunscha zdobyla nagrode w kategorii Residential.', cover: '', body: '<p>Mamy zaszczyt ogolsic, ze projekt <strong>Linden Bunscha</strong> zostal wyrozniony w prestizowym konkursie Property Design Awards 2026.</p>' },
  { id: 'n3', slug: 'dzien-otwarty-cloud-lindego', title: 'Dzien otwarty — Cloud Lindego', date: '2026-03-05', excerpt: 'Zapraszamy na dzien otwarty w apartamencie pokazowym.', cover: '', body: '<p>W sobote 15 marca otwieramy dla Panstwa apartament pokazowy w inwestycji Cloud Lindego.</p>' },
]);

seedIfMissing('realizacje', [
  { id: 'r1', slug: 'cloud-lindego', title: 'Cloud Lindego', city: 'Gdansk', status: 'building', type: 'apartamenty', year: 2026, cover: '', lat: 54.3721, lng: 18.6386, description: 'Ekskluzywny apartamentowiec z panoramicznym widokiem na Zatoke Gdanska.', units: 84, area: '38-180 m2' },
  { id: 'r2', slug: 'osiedle-ozon', title: 'Osiedle Ozon', city: 'Gdansk', status: 'building', type: 'osiedle', year: 2026, cover: '', lat: 54.3612, lng: 18.6218, description: 'Przestronne osiedle z wlasnym parkiem i strefa SPA.', units: 142, area: '42-135 m2' },
  { id: 'r3', slug: 'osiedle-fi', title: 'Osiedle Fi', city: 'Gdynia', status: 'done', type: 'osiedle', year: 2024, cover: '', lat: 54.5189, lng: 18.5305, description: 'Zrealizowane w 2024 osiedle z zielonymi dachami i strefa coworkingu.', units: 68, area: '45-110 m2' },
  { id: 'r4', slug: 'linden-bunscha', title: 'Linden Bunscha', city: 'Sopot', status: 'done', type: 'apartamenty', year: 2023, cover: '', lat: 54.4416, lng: 18.5601, description: 'Butikowa inwestycja w sercu Sopotu, 200 metrow od plazy.', units: 24, area: '52-220 m2' },
  { id: 'r5', slug: 'cloud-mazowiecka', title: 'Cloud Mazowiecka', city: 'Warszawa', status: 'building', type: 'apartamenty', year: 2027, cover: '', lat: 52.2297, lng: 21.0122, description: 'Wiezowiec mieszkalny w sercu Mokotowa.', units: 220, area: '40-280 m2' },
]);

seedIfMissing('faq', [
  { id: 'f1', q: 'Jakie sa terminy realizacji inwestycji Megapolis?', a: 'Kazda inwestycja ma indywidualny harmonogram. Szczegoly znajda Panstwo w zakladce Nasze realizacje.' },
  { id: 'f2', q: 'Czy mozna obejrzec apartament pokazowy?', a: 'Tak. Umawiamy indywidualne wizyty po wczesniejszej rezerwacji przez Calendly lub telefonicznie.' },
  { id: 'f3', q: 'Czy oferujecie finansowanie?', a: 'Wspolpracujemy z wiodacymi bankami i doradcami kredytowymi. Chetnie polecimy sprawdzonych partnerow.' },
  { id: 'f4', q: 'Jakie standardy wykonczenia oferujecie?', a: 'Standard deweloperski plus trzy pakiety wykonczenia: Classic, Signature oraz Bespoke.' },
  { id: 'f5', q: 'Czy mozna spersonalizowac uklad mieszkania?', a: 'Tak, do momentu zakonczenia etapu stanu surowego oferujemy pelna adaptacje ukladu scian wewnetrznych.' },
  { id: 'f6', q: 'Jakie sa formy platnosci?', a: 'Standardowe transze bankowe, platnosci gotowkowe oraz indywidualne harmonogramy dla klientow VIP.' },
  { id: 'f7', q: 'Czy inwestycje posiadaja miejsca parkingowe?', a: 'Wszystkie nasze inwestycje oferuja podziemny parking z mozliwoscia zakupu lub dlugoterminowego najmu miejsca.' },
]);

seedIfMissing('testimonials', [
  { id: 't1', author: 'Anna Kowalska', role: 'Klientka, Cloud Lindego', text: 'Proces zakupu byl pierwszorzedny. Doradcy Megapolis przeprowadzili nas przez kazdy etap z najwyzsza staranniscia.', photo: '' },
  { id: 't2', author: 'Piotr Nowak', role: 'Klient, Osiedle Fi', text: 'Jakosc wykonczenia apartamentu przerosla moje oczekiwania. Naprawde premium.', photo: '' },
]);

seedIfMissing('apartments', [
  // Mock THTG — lista mieszkan zagregowana z kilku inwestycji
  { id: 'a1',  investment: 'cloud-lindego', building: 'A', floor: 3, rooms: 2, area: 52.4, price: 890000,  priceOld: null,     direction: 'S',  features: ['balkon'],              status: 'available' },
  { id: 'a2',  investment: 'cloud-lindego', building: 'A', floor: 5, rooms: 3, area: 74.8, price: 1240000, priceOld: null,     direction: 'W',  features: ['balkon','taras'],      status: 'available' },
  { id: 'a3',  investment: 'cloud-lindego', building: 'A', floor: 8, rooms: 4, area: 118.0, price: 2150000, priceOld: null,    direction: 'SW', features: ['taras','antresola'],   status: 'reserved'  },
  { id: 'a4',  investment: 'osiedle-ozon',  building: 'C', floor: 1, rooms: 2, area: 48.6, price: 730000,  priceOld: 780000,   direction: 'E',  features: ['ogrodek'],             status: 'available' },
  { id: 'a5',  investment: 'osiedle-ozon',  building: 'C', floor: 2, rooms: 3, area: 68.2, price: 950000,  priceOld: null,     direction: 'S',  features: ['balkon'],              status: 'available' },
  { id: 'a6',  investment: 'osiedle-ozon',  building: 'D', floor: 4, rooms: 4, area: 92.5, price: 1350000, priceOld: 1420000,  direction: 'W',  features: ['balkon','taras'],      status: 'available' },
  { id: 'a7',  investment: 'osiedle-fi',    building: 'B', floor: 0, rooms: 2, area: 45.1, price: 680000,  priceOld: null,     direction: 'N',  features: ['ogrodek'],             status: 'sold'      },
  { id: 'a8',  investment: 'osiedle-fi',    building: 'B', floor: 3, rooms: 3, area: 72.4, price: 980000,  priceOld: null,     direction: 'SE', features: ['balkon','taras'],      status: 'available' },
  { id: 'a9',  investment: 'linden-bunscha',building: 'A', floor: 6, rooms: 3, area: 88.0, price: 2100000, priceOld: null,     direction: 'W',  features: ['taras'],               status: 'available' },
  { id: 'a10', investment: 'linden-bunscha',building: 'A', floor: 7, rooms: 4, area: 156.0, price: 3800000, priceOld: null,    direction: 'SW', features: ['taras','antresola'],   status: 'reserved'  },
  { id: 'a11', investment: 'cloud-mazowiecka', building: 'A', floor: 12, rooms: 2, area: 54.0, price: 1150000, priceOld: null, direction: 'E',  features: ['balkon'],              status: 'available' },
  { id: 'a12', investment: 'cloud-mazowiecka', building: 'A', floor: 20, rooms: 4, area: 140.0, price: 3500000, priceOld: null, direction: 'S', features: ['taras','antresola'],   status: 'available' },
]);

seedIfMissing('jobs', [
  { id: 'j1', slug: 'project-manager', title: 'Project Manager — inwestycje premium', city: 'Gdansk', department: 'Rozwoj', type: 'pelny etat', published: '2026-04-02', salary: '18 000 - 24 000 PLN', description: '<p>Szukamy doswiadczonego Project Managera do prowadzenia inwestycji mieszkaniowych premium.</p><h3>Wymagania</h3><ul><li>5+ lat doswiadczenia w deweloperce</li><li>Znajomosc Primavera / MS Project</li><li>Umiejetnosci negocjacyjne</li></ul><h3>Oferujemy</h3><ul><li>Prywatna opieka medyczna</li><li>Karta sportowa</li><li>Mozliwosc pracy hybrydowej</li></ul>' },
  { id: 'j2', slug: 'architekt-wnetrz', title: 'Architekt wnetrz', city: 'Warszawa', department: 'Design', type: 'pelny etat', published: '2026-03-28', salary: '12 000 - 16 000 PLN', description: '<p>Do rozbudowujacego sie zespolu Design poszukujemy architekta wnetrz specjalizujacego sie w projektach premium.</p>' },
  { id: 'j3', slug: 'specjalista-sprzedazy', title: 'Specjalista ds. sprzedazy mieszkan', city: 'Gdynia', department: 'Sprzedaz', type: 'pelny etat', published: '2026-03-15', salary: 'podstawa + prowizja', description: '<p>Doradca klienta prowadzacy transakcje od pierwszego kontaktu do odbioru kluczy.</p>' },
  { id: 'j4', slug: 'marketing-manager', title: 'Marketing Manager', city: 'Gdansk', department: 'Marketing', type: 'pelny etat', published: '2026-02-28', salary: '15 000 - 20 000 PLN', description: '<p>Osoba odpowiedzialna za calosciowa strategie marketingowa Megapolis.</p>' },
]);

seedIfMissing('osiedla', [
  { id: 's1', slug: 'osiedle-ozon',  name: 'Osiedle Ozon',  city: 'Gdansk',   accent: '#7cb7a8', tagline: 'Miejska enklawa w sercu Wrzeszcza',    published: true },
  { id: 's2', slug: 'osiedle-fi',    name: 'Osiedle Fi',    city: 'Gdynia',   accent: '#d4a373', tagline: 'Architektura bliska naturze',         published: true },
  { id: 's3', slug: 'cloud-lindego', name: 'Cloud Lindego', city: 'Gdansk',   accent: '#8b9fc7', tagline: 'Nad Baltykiem. Nad codziennoscia.',   published: true },
]);

seedIfMissing('i18n', {
  pl: {
    nav: { home: 'Strona glowna', about: 'O nas', realizacje: 'Nasze realizacje', generalContractor: 'Generalny wykonawca', career: 'Kariera', contact: 'Kontakt', search: 'Wyszukiwarka' },
    hero: { kicker: 'PREMIUM REAL ESTATE', title: 'Gdzie architektura spotyka codziennosc', subtitle: 'Tworzymy inwestycje dla osob, ktore oczekuja wiecej niz czterech scian.', cta: 'Zobacz inwestycje' },
    search: { title: 'Znajdz swoje mieszkanie', text: 'Wybierz lokalizacje i parametry, a my pokazemy Ci dostepne oferty.', rooms: 'Pokoje', area: 'Powierzchnia', price: 'Cena', floor: 'Pietro' },
    realizacje: { title: 'Nasze realizacje', grid: 'Siatka', map: 'Mapa', all: 'Wszystkie', building: 'W budowie', done: 'Zrealizowane' },
    news: { title: 'Aktualnosci', more: 'Czytaj wiecej', all: 'Zobacz wszystkie' },
    faq: { title: 'Pytania i odpowiedzi' },
    contact: { title: 'Skontaktuj sie', submit: 'Wyslij wiadomosc', name: 'Imie i nazwisko', email: 'Email', phone: 'Telefon', message: 'Wiadomosc', policy: 'Akceptuje polityke prywatnosci' },
    footer: { rights: 'Wszelkie prawa zastrzezone.', privacy: 'Polityka prywatnosci' },
  },
  en: {
    nav: { home: 'Home', about: 'About us', realizacje: 'Our portfolio', generalContractor: 'General contractor', career: 'Careers', contact: 'Contact', search: 'Search' },
    hero: { kicker: 'PREMIUM REAL ESTATE', title: 'Where architecture meets everyday', subtitle: 'We create homes for people who expect more than four walls.', cta: 'Explore portfolio' },
    search: { title: 'Find your apartment', text: 'Pick a location and parameters — we will show matching offers.', rooms: 'Rooms', area: 'Area', price: 'Price', floor: 'Floor' },
    realizacje: { title: 'Our portfolio', grid: 'Grid', map: 'Map', all: 'All', building: 'Under construction', done: 'Completed' },
    news: { title: 'News', more: 'Read more', all: 'See all' },
    faq: { title: 'Frequently asked questions' },
    contact: { title: 'Get in touch', submit: 'Send message', name: 'Full name', email: 'Email', phone: 'Phone', message: 'Message', policy: 'I accept the privacy policy' },
    footer: { rights: 'All rights reserved.', privacy: 'Privacy policy' },
  },
});

// ---------- Routes ----------
async function handleAPI(req, res, parsed) {
  const p = parsed.pathname;
  const m = req.method;

  // CORS for local dev tools
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (m === 'OPTIONS') return sendText(res, 204, '');

  // --- Auth ---
  if (p === '/api/auth/login' && m === 'POST') {
    const body = await parseBody(req);
    if (body.user === ADMIN_USER && body.pass === ADMIN_PASS) {
      return sendJSON(res, 200, { token: issueToken(body.user), user: body.user });
    }
    return sendJSON(res, 401, { error: 'invalid credentials' });
  }
  if (p === '/api/auth/me' && m === 'GET') {
    const who = verifyToken(req);
    if (!who) return sendJSON(res, 401, { error: 'not logged in' });
    return sendJSON(res, 200, { user: who.user });
  }
  if (p === '/api/auth/logout' && m === 'POST') {
    const h = req.headers['authorization'] || '';
    const t = /^Bearer\s+(.+)$/.exec(h); if (t) activeTokens.delete(t[1]);
    return sendJSON(res, 200, { ok: true });
  }

  // --- Content CRUD ---
  const contentMatch = /^\/api\/content\/([a-z0-9_]+)$/.exec(p);
  if (contentMatch) {
    const key = contentMatch[1];
    if (!VALID_KEYS.has(key)) return sendJSON(res, 404, { error: 'unknown key' });
    if (m === 'GET') return sendJSON(res, 200, getContent(key, null));
    if (m === 'PUT') {
      if (!requireAuth(req, res)) return;
      const body = await parseBody(req, 5 * 1024 * 1024);
      setContent(key, body);
      return sendJSON(res, 200, { ok: true, key });
    }
    return sendJSON(res, 405, { error: 'method not allowed' });
  }

  // --- Mock THTG: apartment listings ---
  if (p === '/api/thtg/apartments' && m === 'GET') {
    const q = parsed.query;
    let list = getContent('apartments', []) || [];
    if (q.investment) list = list.filter(a => a.investment === q.investment);
    if (q.rooms) list = list.filter(a => String(a.rooms) === String(q.rooms));
    if (q.minArea) list = list.filter(a => a.area >= Number(q.minArea));
    if (q.maxArea) list = list.filter(a => a.area <= Number(q.maxArea));
    if (q.minPrice) list = list.filter(a => a.price >= Number(q.minPrice));
    if (q.maxPrice) list = list.filter(a => a.price <= Number(q.maxPrice));
    if (q.floor) list = list.filter(a => String(a.floor) === String(q.floor));
    if (q.direction) list = list.filter(a => a.direction === q.direction);
    if (q.feature) list = list.filter(a => (a.features || []).includes(q.feature));
    if (q.promo === '1') list = list.filter(a => a.priceOld && a.priceOld > a.price);
    if (q.status) list = list.filter(a => a.status === q.status);
    return sendJSON(res, 200, { items: list, total: list.length });
  }
  // Single apartment detail
  const apMatch = /^\/api\/thtg\/apartments\/([a-z0-9_-]+)$/.exec(p);
  if (apMatch && m === 'GET') {
    const list = getContent('apartments', []) || [];
    const a = list.find(x => x.id === apMatch[1]);
    if (!a) return sendJSON(res, 404, { error: 'not found' });
    return sendJSON(res, 200, a);
  }

  // --- AI search: semantic-ish search across all content + generated answer ---
  if (p === '/api/search' && (m === 'GET' || m === 'POST')) {
    const started = Date.now();
    let query = '';
    if (m === 'GET') query = String(parsed.query.q || '').trim();
    else { const body = await parseBody(req); query = String(body.query || body.q || '').trim(); }
    if (!query) return sendJSON(res, 200, { query: '', answer: '', sources: [], took_ms: 0 });

    // --- Tokenize + strip Polish diacritics for robust matching ---
    const removeDia = (s) => String(s || '')
      .toLowerCase()
      .replace(/ą/g,'a').replace(/ć/g,'c').replace(/ę/g,'e').replace(/ł/g,'l')
      .replace(/ń/g,'n').replace(/ó/g,'o').replace(/ś/g,'s').replace(/ź/g,'z').replace(/ż/g,'z');
    const STOP = new Set(['i','a','o','w','we','z','ze','na','do','od','po','za','dla','ze','czy','to','jest','jak','jaki','jakie','jaka','ile','gdzie','co','kto','kiedy','bez','ale','lub','oraz','the','an','of','in','on','at','is','are','and','or','to','for']);
    const tokens = (s) => removeDia(s).replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(t => t && t.length > 1 && !STOP.has(t));
    const qTokens = tokens(query);
    const qRaw = removeDia(query);
    if (!qTokens.length) return sendJSON(res, 200, { query, answer: 'Wpisz konkretne pytanie lub slowo kluczowe.', sources: [], took_ms: Date.now() - started });

    // --- Corpus: flatten every content collection into searchable docs ---
    const news = getContent('news', []) || [];
    const realizacje = getContent('realizacje', []) || [];
    const faq = getContent('faq', []) || [];
    const jobs = getContent('jobs', []) || [];
    const apartments = getContent('apartments', []) || [];
    const osiedla = getContent('osiedla', []) || [];
    const testimonials = getContent('testimonials', []) || [];

    const stripHtml = (s) => String(s || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
    const docs = [];
    news.forEach(n => docs.push({ kind: 'news', title: n.title, snippet: n.excerpt || stripHtml(n.body).slice(0, 160), url: '/aktualnosc/?slug=' + encodeURIComponent(n.slug), text: [n.title, n.excerpt, stripHtml(n.body), n.date].join(' ') }));
    realizacje.forEach(r => docs.push({ kind: 'realizacja', title: r.title, snippet: (r.city ? r.city + ' · ' : '') + (r.status === 'building' ? 'W budowie' : 'Zrealizowane') + ' · ' + (r.description || '').slice(0, 120), url: '/inwestycja/?slug=' + encodeURIComponent(r.slug), text: [r.title, r.city, r.description, r.type, r.area, 'inwestycja', 'osiedle', 'apartament'].join(' ') }));
    osiedla.forEach(s => docs.push({ kind: 'osiedle', title: s.name, snippet: s.city + ' · ' + (s.tagline || ''), url: '/site/' + encodeURIComponent(s.slug), text: [s.name, s.city, s.tagline, 'osiedle', 'multisite'].join(' ') }));
    faq.forEach(f => docs.push({ kind: 'faq', title: f.q, snippet: f.a.slice(0, 200), url: '/#faq', text: [f.q, f.a].join(' '), faqAnswer: f.a }));
    jobs.forEach(j => docs.push({ kind: 'job', title: j.title, snippet: j.city + ' · ' + j.department + (j.salary ? ' · ' + j.salary : ''), url: '/praca/' + encodeURIComponent(j.slug), text: [j.title, j.city, j.department, j.salary, stripHtml(j.description), 'praca', 'kariera'].join(' ') }));
    apartments.forEach(a => docs.push({ kind: 'apartment', title: a.rooms + '-pokojowe, ' + a.area + ' m² — ' + a.investment, snippet: (a.priceOld ? 'Promocja: ' : '') + (a.price || 0).toLocaleString('pl-PL') + ' PLN · ' + a.status, url: '/inwestycja/?slug=' + encodeURIComponent(a.investment), text: [a.investment, a.building, 'pietro ' + a.floor, a.rooms + ' pokoje', a.area + ' m2', 'cena ' + a.price, a.direction, (a.features||[]).join(' '), a.status, a.priceOld ? 'promocja' : ''].join(' ') }));
    testimonials.forEach(t2 => docs.push({ kind: 'opinia', title: 'Opinia: ' + t2.author, snippet: t2.text.slice(0, 180), url: '/#opinie', text: [t2.author, t2.role, t2.text].join(' ') }));

    // --- Scoring: sum of per-token hits with weighted boosts for title matches ---
    const scored = docs.map(d => {
      const blob = removeDia(d.text);
      const titleBlob = removeDia(d.title);
      let score = 0;
      qTokens.forEach(t => {
        // Title exact-match is strongest
        if (titleBlob.includes(t)) score += 5;
        // Full-text occurrences
        const occ = (blob.match(new RegExp('\\b' + t.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'g')) || []).length;
        score += occ;
      });
      // Exact phrase match bonus
      if (blob.includes(qRaw)) score += 3;
      return { ...d, score };
    }).filter(d => d.score > 0).sort((a, b) => b.score - a.score);

    const top = scored.slice(0, 8);

    // --- Answer generation (rule-based templates + top match context) ---
    function generateAnswer() {
      if (!top.length) return `Nie znalazlem informacji o "${query}". Sprobuj zadac pytanie inaczej lub napisz do nas przez formularz kontaktowy.`;

      const ql = removeDia(query);
      const bestFaq = top.find(d => d.kind === 'faq');
      // If query is phrased as a question AND top hit is FAQ → return FAQ answer directly
      if (bestFaq && bestFaq.score >= 3 && /[?]|^(czy|jak|gdzie|ile|co|kto|kiedy|jakie|jaka|jaki)\b/.test(ql)) {
        return bestFaq.faqAnswer;
      }

      // Apartment/price queries
      if (/\b(cena|ceny|koszt|promocja|mieszkan|apartament|pokoj|pokoje|metraz)\b/.test(ql)) {
        const apts = top.filter(d => d.kind === 'apartment');
        if (apts.length) {
          const prices = apartments.map(a => a.price).filter(Boolean);
          const minP = Math.min(...prices), maxP = Math.max(...prices);
          const promos = apartments.filter(a => a.priceOld && a.priceOld > a.price).length;
          return `W ofercie Megapolis znalazlem ${apts.length} pasujacych mieszkan. Zakres cenowy naszych mieszkan to ${minP.toLocaleString('pl-PL')} - ${maxP.toLocaleString('pl-PL')} PLN. Obecnie ${promos} mieszkan jest w promocji. Szczegolowe oferty znajdziesz ponizej — mozesz je filtrowac na stronie Wyszukiwarki.`;
        }
      }
      // Investment/realization queries
      if (/\b(inwestycj|osiedl|realizacj|budow|projekt)\b/.test(ql)) {
        const invs = top.filter(d => d.kind === 'realizacja' || d.kind === 'osiedle');
        if (invs.length) {
          const titles = invs.slice(0, 3).map(r => r.title).join(', ');
          return `Do zapytania "${query}" najlepiej pasuja nasze inwestycje: ${titles}. Megapolis prowadzi aktualnie ${realizacje.filter(r=>r.status==='building').length} inwestycji w budowie oraz ${realizacje.filter(r=>r.status==='done').length} juz zrealizowanych.`;
        }
      }
      // Career/job queries
      if (/\b(praca|kariera|oferty|zatrudn|etat|rekrut)\b/.test(ql)) {
        const jobHits = top.filter(d => d.kind === 'job');
        if (jobHits.length) {
          return `Megapolis ma obecnie ${jobs.length} otwartych ofert pracy. Pasujace do zapytania: ${jobHits.slice(0,3).map(j => j.title).join(', ')}. Pelna lista jest w zakladce Kariera.`;
        }
      }
      // Contact queries
      if (/\b(kontakt|telefon|email|adres|gdzie|znale|biuro)\b/.test(ql)) {
        const s = getContent('settings', {}) || {};
        const c = s.contact || {};
        return `Mozesz sie z nami skontaktowac telefonicznie pod numerem ${c.phone || '-'}, mailowo na ${c.email || '-'}, lub odwiedzic nasze biuro: ${c.address || '-'}.`;
      }

      // Default: summarize top matches
      const kinds = {};
      top.forEach(d => kinds[d.kind] = (kinds[d.kind] || 0) + 1);
      const summary = Object.entries(kinds).map(([k, n]) => {
        const label = { news: 'aktualnosci', realizacja: 'inwestycji', osiedle: 'osiedli', faq: 'odpowiedzi FAQ', job: 'ofert pracy', apartment: 'mieszkan', opinia: 'opinii' }[k] || k;
        return n + ' ' + label;
      }).join(', ');
      return `Znalazlem ${top.length} wynikow dla "${query}" (${summary}). Sprawdz najlepiej pasujace pozycje ponizej.`;
    }

    const answer = generateAnswer();
    return sendJSON(res, 200, {
      query,
      answer,
      sources: top.map(d => ({ kind: d.kind, title: d.title, snippet: d.snippet, url: d.url, score: d.score })),
      total: scored.length,
      took_ms: Date.now() - started,
    });
  }

  // --- Mock eRecruiter: jobs ---
  if (p === '/api/erecruiter/jobs' && m === 'GET') {
    const list = getContent('jobs', []) || [];
    return sendJSON(res, 200, { items: list, total: list.length });
  }
  const jobMatch = /^\/api\/erecruiter\/jobs\/([a-z0-9_-]+)$/.exec(p);
  if (jobMatch && m === 'GET') {
    const list = getContent('jobs', []) || [];
    const j = list.find(x => x.slug === jobMatch[1] || x.id === jobMatch[1]);
    if (!j) return sendJSON(res, 404, { error: 'not found' });
    return sendJSON(res, 200, j);
  }

  // --- Forms (contact, job application, reservation) ---
  if (p === '/api/forms/submit' && m === 'POST') {
    const body = await parseBody(req);
    // Derive name from first+last if full name missing (job application forms)
    const fullName = body.name || [body.firstName, body.lastName].filter(Boolean).join(' ').trim();
    // Basic validation
    if (!fullName || !body.email) return sendJSON(res, 400, { error: 'name and email are required' });
    // Strip meta fields to extract just user data
    const META_KEYS = new Set(['formType','sourcePage','site','consent']);
    const userData = {};
    for (const k of Object.keys(body)) if (!META_KEYS.has(k)) userData[k] = body[k];
    userData.name = fullName;
    const submission = {
      id: crypto.randomBytes(8).toString('hex'),
      createdAt: new Date().toISOString(),
      sourcePage: body.sourcePage || 'unknown',
      formType: body.formType || 'contact',
      site: body.site || 'megapolis',
      data: userData,
      ip: req.socket.remoteAddress,
      ua: req.headers['user-agent'] || '',
    };
    // Persist as one file per submission
    writeJSON(path.join(SUBMISSIONS_DIR, `${submission.id}.json`), submission);
    // "Send email" stub — log to console + to submissions.log
    const logLine = `[${submission.createdAt}] ${submission.formType} from ${submission.data.name} <${submission.data.email}> (page: ${submission.sourcePage})\n`;
    fs.appendFileSync(path.join(DATA_DIR, 'submissions.log'), logLine, 'utf8');
    console.log('FORM SUBMISSION:', logLine.trim());
    return sendJSON(res, 200, { ok: true, id: submission.id });
  }

  // --- List submissions (admin only) ---
  if (p === '/api/forms/submissions' && m === 'GET') {
    if (!requireAuth(req, res)) return;
    const files = fs.existsSync(SUBMISSIONS_DIR) ? fs.readdirSync(SUBMISSIONS_DIR).filter(f => f.endsWith('.json')) : [];
    const items = files.map(f => readJSON(path.join(SUBMISSIONS_DIR, f), null)).filter(Boolean).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return sendJSON(res, 200, { items, total: items.length });
  }

  // --- Osiedla (multisite) ---
  if (p === '/api/osiedla' && m === 'POST') {
    if (!requireAuth(req, res)) return;
    const body = await parseBody(req);
    const list = getContent('osiedla', []) || [];
    const id = 's' + (list.length + 1);
    const item = { id, slug: body.slug, name: body.name, city: body.city, accent: body.accent || '#c9a96e', tagline: body.tagline || '', published: !!body.published };
    list.push(item);
    setContent('osiedla', list);
    return sendJSON(res, 200, { ok: true, item });
  }

  // --- Health ---
  if (p === '/api/health' && m === 'GET') return sendJSON(res, 200, { ok: true, version: '2.0.0', time: new Date().toISOString() });

  return sendJSON(res, 404, { error: 'unknown endpoint', path: p });
}

// ---------- Static files ----------
// URL rewrites for dynamic-slug pages (shared template + client-side data fetch)
// Only applied when the literal path does not resolve to an existing file/dir.
const REWRITE_RULES = [
  { match: /^\/site\/([^\/]+)\/?$/,         target: '/site/index.html' },
  { match: /^\/inwestycja\/([^\/]+)\/?$/,   target: '/inwestycja/index.html' },
  { match: /^\/osiedle\/([^\/]+)\/?$/,      target: '/inwestycja/index.html' },
  { match: /^\/realizacja\/([^\/]+)\/?$/,   target: '/inwestycja/index.html' },
  { match: /^\/realizacje\/([^\/]+)\/?$/,   target: '/inwestycja/index.html' },
  { match: /^\/aktualnosc\/([^\/]+)\/?$/,   target: '/aktualnosci/single.html' },
  { match: /^\/aktualnosci\/([^\/]+)\/?$/,  target: '/aktualnosci/single.html' },
  { match: /^\/praca\/([^\/]+)\/?$/,        target: '/praca/index.html' },
  { match: /^\/strona\/([^\/]+)\/?$/,       target: '/strona-tekstowa/index.html' },
];

function resolveFilePath(urlPath) {
  let p = path.join(ROOT, urlPath);
  if (!p.startsWith(ROOT)) return null;
  if (!fs.existsSync(p)) return null;
  const stat = fs.statSync(p);
  if (stat.isDirectory()) {
    const idx = path.join(p, 'index.html');
    return fs.existsSync(idx) ? idx : null;
  }
  return p;
}

function serveStatic(req, res, parsed) {
  let urlPath = decodeURIComponent(parsed.pathname);
  urlPath = urlPath.replace(/\0/g, '');

  // Directory trailing-slash redirect (so relative URLs resolve correctly)
  try {
    const probe = path.join(ROOT, urlPath);
    if (probe.startsWith(ROOT) && fs.existsSync(probe) && fs.statSync(probe).isDirectory() && !urlPath.endsWith('/')) {
      const qs = parsed.search || '';
      res.writeHead(301, { Location: urlPath + '/' + qs });
      return res.end();
    }
  } catch {}

  // 1) try literal path
  let filePath = resolveFilePath(urlPath);

  // 2) try rewrite rules (only if literal path didn't resolve)
  if (!filePath) {
    for (const r of REWRITE_RULES) {
      if (r.match.test(urlPath)) {
        filePath = resolveFilePath(r.target);
        if (filePath) break;
      }
    }
  }

  // 3) extensionless -> implicit /index.html (e.g. /kariera)
  if (!filePath && !path.extname(urlPath)) {
    const withIndex = urlPath.replace(/\/?$/, '/') + 'index.html';
    filePath = resolveFilePath(withIndex);
  }

  // 4) 404 page fallback
  if (!filePath) {
    const fourOhFour = resolveFilePath('/404/index.html');
    if (fourOhFour) {
      fs.readFile(fourOhFour, (err, content) => {
        if (err) return sendText(res, 404, '404 Not Found');
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
      });
      return;
    }
    return sendText(res, 404, '404 Not Found');
  }

  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';

  // Streaming + Range support dla mediow (wideo/audio) — inaczej <video> nie przewinie
  const streamable = ['.mp4', '.webm', '.ogv', '.mov', '.mp3', '.m4a'];
  if (streamable.includes(ext)) {
    let stat;
    try { stat = fs.statSync(filePath); }
    catch { return sendText(res, 500, '500 Internal'); }
    const total = stat.size;
    const range = req.headers['range'];
    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!m) { res.writeHead(416, { 'Content-Range': `bytes */${total}` }); return res.end(); }
      let start = m[1] ? parseInt(m[1], 10) : 0;
      let end   = m[2] ? parseInt(m[2], 10) : total - 1;
      if (isNaN(start) || isNaN(end) || start > end || end >= total) {
        res.writeHead(416, { 'Content-Range': `bytes */${total}` }); return res.end();
      }
      res.writeHead(206, {
        'Content-Type': mime,
        'Content-Length': (end - start + 1),
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
      });
      return fs.createReadStream(filePath, { start, end }).pipe(res);
    }
    res.writeHead(200, {
      'Content-Type': mime,
      'Content-Length': total,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
    });
    return fs.createReadStream(filePath).pipe(res);
  }

  fs.readFile(filePath, (err, content) => {
    if (err) return sendText(res, 500, '500 Internal');
    const headers = { 'Content-Type': mime };
    if (['.woff', '.woff2', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico'].includes(ext)) headers['Cache-Control'] = 'public, max-age=3600';
    res.writeHead(200, headers);
    res.end(content);
  });
}

// ---------- Server ----------
http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  if (parsed.pathname && parsed.pathname.startsWith('/api/')) {
    handleAPI(req, res, parsed).catch(err => { console.error(err); sendJSON(res, 500, { error: String(err && err.message || err) }); });
    return;
  }
  serveStatic(req, res, parsed);
}).listen(PORT, () => {
  console.log(`Megapolis dev server running on http://localhost:${PORT}`);
  console.log(`Admin: http://localhost:${PORT}/admin (user: ${ADMIN_USER} / pass: ${ADMIN_PASS})`);
});
