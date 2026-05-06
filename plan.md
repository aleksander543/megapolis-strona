# Plan implementacji — Optymalizacja WWW (z dokumentu „WWW optymalizacja (1).docx")

**Status:** czeka na akceptację użytkownika
**Źródło:** `WWW optymalizacja (1).docx` (74 linie tekstu + 20 screenshotów referencyjnych)
**Data:** 2026-05-06

---

## Filozofia podziału

Dokument zawiera ~25 osobnych poprawek rozsianych po stronie głównej i 4 podstronach. Realizacja w jednym podejściu = wysokie ryzyko literówek i regresji. Dlatego dzielę na **7 atomowych faz**, każda osobno commitowana, deployowana i weryfikowana.

Po każdej fazie: build → smoke test w przeglądarce → commit → deploy.

---

## ❓ Pytania do użytkownika (zanim ruszę)

Zaznaczyłem rzeczy, których nie jestem pewny. Proszę o decyzję:

### Q1. „Oferta specjalna bielszą czcionką" (image1, image2)
W obecnym headerze pill „Oferta specjalna" ma kolor tekstu nieco przygaszony. Czy chodzi o:
- (a) ustawić tekst na czysty `#ffffff` (najjaśniejszy biały),
- (b) pogrubić font (heavier weight),
- (c) (a) + (b)?

### Q2. Okno AI — dyktowanie + wklejenie zdjęcia (image3 — odniesienie do Google)
Czy implementacja:
- (a) **tylko ikonki UI** (mikrofon + aparat) bez funkcjonalności — placeholder pod przyszłą integrację,
- (b) **mikrofon działa lokalnie** (Web Speech API w przeglądarce — wpisuje tekst do inputa, jak Google), **upload zdjęcia** = otwiera file picker i pokazuje miniaturkę (bez wysyłania do AI),
- (c) **pełna integracja** — voice + image przesyłane do backendu AI (wymaga rozbudowy `server.js`)?

Sugeruję (b) — sensowny kompromis, działa w lokalnym hostingu, nie wymaga sekretów API.

### Q3. „JESTEŚMY CZĘŚCIĄ HOLDING1" — gdzie wszędzie zamienić?
- ✅ Hero tagline (linia 1727 `index.html`) — pewne.
- ❓ Stopka „Deweloper mieszkaniowy · Kraków & Wrocław · EST. 1989" (linia 2752) — zostawić czy też zamienić?

### Q4. Cytat „Budujemy miejsca, w których chce się **mieszkań**" (image12)
Tekst z dokumentu zawiera literówkę („mieszkań" zamiast „mieszkać"). Wpisać:
- (a) dosłownie z dokumentu („mieszkań") — być może świadomie,
- (b) poprawić na „mieszkać" (zakładam, że to literówka)?

Sugeruję (b).

### Q5. Karta mieszkania „dopasować do ustawy" (image15)
Karta `/mieszkanie/A-03` ma już: cenę, m², pokoje, piętro, stronę świata, odbiór, funkcje, rzut PDF, „Dodaj do ulubionych".
Czego konkretnie brakuje? Ustawa deweloperska (z 2021/2024) wymaga m.in.:
- prospekt informacyjny (link/PDF),
- harmonogram budowy + status,
- oświadczenie o gwarancji DFG,
- numer pozwolenia na budowę.

Czy mam dodać te pola (i jakie z nich)? Bez tej info nie ruszam karty.

### Q6. NASZE REALIZACJE — liczby (image16)
Obecnie: 10 inwestycji / 2 400+ mieszkań / 120 965 m² / 2 miasta.
Z dokumentu: „Siedem projektów zrealizowanych w Krakowie, **pięć, które obecnie mamy w sprzedaży**. Planujemy realizacje kolejne we Wrocławiu, Katowicach oraz Warszawie."

Czy zaktualizować też stat-box? Propozycja:
- 7 zrealizowanych / 5 w sprzedaży / 4 miasta (Kraków, Wrocław, Katowice, Warszawa) / ?? mieszkań?

### Q7. Nagrody (sekcja „Realizacje")
Z dokumentu: „Deweloper Tworzący szczęśliwe sąsiedztwa". Czy to **jedyna nagroda**, czy są inne (logo, rok, wystawca)? Jeśli tylko ta jedna — zrobię prosty banner; jeśli więcej — siatka kafelków.

### Q8. LOKALE USŁUGOWE — uproszczenie zakładki (image20)
„Dodajmy tylko opis wstępny i potem ten buton z formularzem". Czy oznacza:
- (a) **całkowicie zastąpić** obecną zawartość zakładki (lista lokali, ceny, filtr) krótkim hero + CTA,
- (b) **dodać** opis na górze, reszta strony zostaje?

### Q9. Ulubione w wyszukiwarkach
Dotyczy WSZYSTKICH wyszukiwarek tekstowych:
- `/wyszukiwarka` (główna),
- per inwestycja: `/osiedle-ozon`, `/osiedle-fi`, `/clou-lindego`, `/link-bunscha`, `/inwestycja/*`,
- na stronie głównej (jeśli dojdzie nowa wyszukiwarka pod mapą).

Czy wszędzie? (Zakładam, że tak.)

---

## 📋 Fazy implementacji

### Faza 1 — Strona główna: drobne zmiany tekstowe (najszybsze, najmniej ryzyka)
**Cel:** Czyste tekstowe poprawki bez zmian layoutu.

| # | Zmiana | Plik | Linia |
|---|--------|------|-------|
| 1.1 | „Oferta specjalna" — biała czcionka [Q1] | `index.html` (CSS) | ~1574 + style |
| 1.2 | Hero tagline „KRAKÓW · EST. 1989" → „JESTEŚMY CZĘŚCIĄ HOLDING1" | `index.html` | 1727 |
| 1.3 | Sekcja showcase: „Osiedla w sprzedaży" → „Nasze Inwestycje w sprzedaży" | `index.html` | 1768 |
| 1.4 | Sekcja WHY: tytuł „Dlaczego nam ufają? Wysoka jakość…" → „Co sprawia, że jesteśmy godni zaufania" | `index.html` | 2534 |
| 1.5 | WHY card 01: „Jakość i niezawodność" → „Tworzymy jak dla siebie" | `index.html` | 2541 |
| 1.6 | Cytat zespołu: dopisać/zmienić „Budujemy miejsca, w których chce się mieszkać" [Q4] | `o-nas/zespol/index.html` | TBD |
| 1.7 | Sekcja zespołu — tekst opisowy: „Megapolis tworzą zespoły doświadczonych architektów, inżynierów, kierowników budowy, doradców i osób, które kreują otoczenie." | `o-nas/zespol/index.html` | TBD |
| 1.8 | „AI" → „Ai" (w okolicy okna AI) | `index.html` | TBD |
| 1.9 | „PRZYCIĄGAMY" + tekst nad oknem AI: „Kształtujemy przyszłość z której możemy być dumni" — sprawdzić czy już jest, ewentualnie poprawić interpunkcję | `index.html` | 1732 |

**Commit:** `feat(content): poprawki tekstowe strony głównej i sekcji zespołu (z opt. WWW)`

---

### Faza 2 — Strona główna: wyszukiwarka pod mapą + reorganizacja sekcji inwestycji
**Cel:** Layout — przenieść kafelki inwestycji do menu „Nasze realizacje", w ich miejsce wstawić wyszukiwarkę tekstową; mapa po kliknięciu otwiera makietę bez opisu.

| # | Zmiana | Plik |
|---|--------|------|
| 2.1 | Wstawić wyszukiwarkę tekstową pod mapą (komponent z `/wyszukiwarka`) | `index.html` |
| 2.2 | Usunąć ze strony głównej kafelki „Osiedla w sprzedaży" (zostają w menu) | `index.html` (~1768–...) |
| 2.3 | Zachowanie mapy: kliknięcie pin → bezpośrednio makieta + filtr mieszkań tej inwestycji, bez opisu nad nią | `index.html` + JS mapy |
| 2.4 | Sprawdzić menu „Nasze realizacje" — czy zawiera wszystkie inwestycje (jeśli nie — dopisać) | menu w `index.html` |

**Commit:** `feat(home): wyszukiwarka pod mapą, kafelki inwestycji do menu, makieta bez opisu`

---

### Faza 3 — Okno AI: ikonki dyktowania + zdjęcia
**Cel:** UX okna AI — ikonki mic + camera (zakres zależny od Q2).

| # | Zmiana | Plik |
|---|--------|------|
| 3.1 | Ikonki mic + aparat w prawej części inputa AI | `index.html` + CSS |
| 3.2 | (jeśli Q2=b) Web Speech API — kliknięcie mic → dyktowanie do inputa | nowy `js/ai-voice.js` |
| 3.3 | (jeśli Q2=b) Image upload — kliknięcie aparatu → file picker → preview pod inputem | `js/ai-voice.js` |

**Commit:** `feat(home): okno Ai z dyktowaniem i uploadem zdjęcia (jak Google)`

---

### Faza 4 — Zakładka MIESZKANIA (`/wyszukiwarka`)
**Cel:** Wizualne dopracowanie + opisy stron świata + (opcjonalnie) karta mieszkania.

| # | Zmiana | Plik |
|---|--------|------|
| 4.1 | Wkleić poziome zdjęcie hero + tytuł „Znajdź swoje mieszkanie" pod spodem | `wyszukiwarka/index.html` |
| 4.2 | Sekcja „Strona świata" — dodać opis pod tytułem: „Usytuowanie mieszkania względem stron świata" | `wyszukiwarka/index.html` |
| 4.3 | Karta mieszkania `/mieszkanie/*` — dopasowanie do ustawy [Q5] | `mieszkanie/*/index.html` lub template |

**Commit:** `feat(mieszkania): hero, opisy stron świata, karta mieszkania zgodna z ustawą`

---

### Faza 5 — NASZE REALIZACJE
**Cel:** Liczby + sekcja nagród.

| # | Zmiana | Plik |
|---|--------|------|
| 5.1 | Tekst opisowy: „Siedem projektów zrealizowanych w Krakowie, pięć, które obecnie mamy w sprzedaży. Planujemy realizacje kolejne we Wrocławiu, Katowicach oraz Warszawie." [Q6] | `realizacje/index.html` |
| 5.2 | Stat-box: aktualizacja liczb [Q6] | `realizacje/index.html` |
| 5.3 | Nowa sekcja „Nagrody" — „Deweloper Tworzący szczęśliwe sąsiedztwa" [Q7] | `realizacje/index.html` |

**Commit:** `feat(realizacje): nowy opis liczbowy + sekcja nagród`

---

### Faza 6 — NASZE STANDARDY
**Cel:** Tytuł, tekst pod tytułem, 2 z 4 kafelków.

| # | Zmiana | Plik |
|---|--------|------|
| 6.1 | Tytuł „Standard, który nie negocjujemy" → „Standard jakości, który gwarantujemy" | `nasze-standardy/index.html` |
| 6.2 | Tekst pod tytułem — nowa wersja z dokumentu (4 zdania, smart-life/premium) | `nasze-standardy/index.html` |
| 6.3 | Sekcja „Co składa się na standard Megapolis" — zamienić tekst „Naszym celem jest tworzenie..." na nowy (zachować jeśli zostaje) lub usunąć | `nasze-standardy/index.html` |
| 6.4 | Kafelek Architektura: „Tworzymy przestrzenie, w których chce się żyć i przebywać" | `nasze-standardy/index.html` |
| 6.5 | Kafelek Obsługa: „Standard zaczyna się jeszcze przed wprowadzeniem się: program wykończenia pod klucz, doradztwo finansowe, uporządkowany proces zakupu." | `nasze-standardy/index.html` |
| 6.6 | Materiały + Energooszczędność — bez zmian (potwierdzone w dokumencie „ok") | — |

**Commit:** `feat(standardy): nowy tytuł, opis i 2 zaktualizowane kafelki`

---

### Faza 7 — LOKALE USŁUGOWE
**Cel:** Uproszczenie zakładki [Q8].

| # | Zmiana | Plik |
|---|--------|------|
| 7.1 | (Q8=a) Zastąpić obecną zawartość: hero z opisem wstępnym + CTA „Skontaktuj się z doradcą" (sekcja `Odezwij się do nas`) | `lokale-uslugowe/index.html` |
| 7.2 | (Q8=b) Dopisać opis wstępny na górze, reszta zostaje | `lokale-uslugowe/index.html` |

**Commit:** `feat(lokale): uproszczona zakładka — opis + CTA do doradcy`

---

### Faza 8 — Ulubione w wyszukiwarkach (przekrojowe)
**Cel:** Przycisk serca przy każdym wyniku w każdej tekstowej wyszukiwarce.

Plan techniczny:
1. Sprawdzić, czy `/ulubione` ma już API/store (sprawdzę w `js/`).
2. Jeśli tak — dorzucić button serca do listy wyników w każdej wyszukiwarce; jeśli nie — wspólny moduł `js/favorites.js` (localStorage).
3. Zastosować w: `/wyszukiwarka`, `/osiedle-ozon`, `/osiedle-fi`, `/clou-lindego`, `/link-bunscha`, `/inwestycja/*`.

**Commit:** `feat(ulubione): serce przy każdym wyniku tekstowej wyszukiwarki`

---

### Faza 9 — Build, weryfikacja, deploy
1. `node server.js` lokalnie → curl smoke testy każdej zmienionej strony (status 200, kluczowe stringi obecne).
2. Przegląd wzrokowy w przeglądarce.
3. Push do `master` → GitHub Pages auto-deploy → weryfikacja `https://aleksander543.github.io/megapolis-strona/`.

---

## ⏱ Szacunkowy czas

| Faza | Czas |
|------|------|
| 1 — teksty główne | 20 min |
| 2 — layout strona główna | 60 min |
| 3 — okno AI | 30–60 min (zależne od Q2) |
| 4 — mieszkania | 60–120 min (zależne od Q5) |
| 5 — realizacje | 30 min |
| 6 — standardy | 25 min |
| 7 — lokale | 20–40 min (zależne od Q8) |
| 8 — ulubione | 60–90 min |
| 9 — verify + deploy | 20 min |

**Razem:** ~5–7 godzin czystej pracy.

---

## 🎯 Następny krok

**Czekam na odpowiedzi na pytania Q1–Q9.** Jeśli chcesz, możesz odpowiedzieć tylko na te pytania, które dotyczą najbliższej fazy (Q1–Q4 → Faza 1) i ruszę z tym, a resztę uzgodnimy później.

**Ewentualnie:** powiedz „idź z założeniami" i ruszę z moimi sugestiami (Q1=a, Q2=b, Q3=tylko hero, Q4=poprawić, Q5=czekam na info, Q6=czekam, Q7=jedna nagroda banner, Q8=a, Q9=tak, wszystkie).
