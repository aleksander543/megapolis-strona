# Plan implementacji — Iteracja UX (10 punktów)

**Status:** w trakcie
**Data:** 2026-05-06

Iteracja po cofnięciu poprzedniej optymalizacji. Skupiamy się na: kontakt, porównywarki, premium feeling.

---

## Status punktów (10)

| # | Punkt | Status | Faza |
|---|-------|--------|------|
| 1 | Popup mapy → opis osiedla, link 3D osobno | TODO | F2 |
| 2 | Kliknięcie osiedla → nowa karta | TODO | F1 (quick) |
| 3 | Porównywarka w `/wyszukiwarka` | TODO | F4 |
| 4 | Auto-porównywarka w `/ulubione` | TODO | F5 |
| 5 | Kontakt w wielu miejscach | TODO + ❓ | F3 |
| 6 | RODO po umówieniu prezentacji | TODO + ❓ | F6 |
| 7 | Udostępnij w `/ulubione` | TODO + ❓ | F5 |
| 8 | Minimalizm — mniej tekstu | TODO | F7 (audit) |
| 9 | Prefill formularza pod mieszkaniem | ✅ JUŻ DZIAŁA — `kontakt/?mieszkanie=A-01` autofill | — |
| 10 | Usuń pulsujące CTA (tandetne) | TODO | F1 (quick) |

---

## ❓ Pytania (3 niejednoznaczne)

### Q1 (punkt 5) — Forma „kontakt w wielu miejscach"
- **(a)** Floating button (Zadzwoń + Napisz) — sticky w prawym dolnym rogu, na każdej podstronie
- **(b)** Block kontaktowy (telefon + email + form) na końcu każdej sekcji/podstrony
- **(c)** Oba (a+b) — minimalny floating + rozbudowany block na dole

**Sugestia:** (c) — klient zawsze ma jeden klik do kontaktu, plus na końcu treści jest pełny block.

### Q2 (punkt 6) — RODO po umówieniu prezentacji
- **(a)** Zgody marketingowe (newsletter, telemarketing, profilowanie) **wbudowane w formularz** kontaktu jako opcjonalne checkboxy oprócz wymaganej zgody na przetwarzanie
- **(b)** Po wysłaniu formularza → **modal z dodatkowymi zgodami** opcjonalnymi (newsletter, marketing) jako oddzielny krok
- **(c)** Zgody na osobnej stronie `/kontakt/zgody` → dopiero po zaznaczeniu przekierowanie do potwierdzenia

**Sugestia:** (a) — najprościej, użytkownik widzi wszystko w jednym kroku, RODO compliant.

### Q3 (punkt 7) — Udostępnij w `/ulubione`
- **(a)** Tylko Web Share API (mobile native) + fallback „Skopiuj link" (URL z kodowaną listą `?favs=A-01,B-07`)
- **(b)** (a) + opcja „Wyślij mailem" (mailto:?subject=...&body=...)
- **(c)** (a) + (b) + WhatsApp/Messenger (deep link)

**Sugestia:** (b) — Web Share + mail. Każdy ma maila, a Web Share załatwia mobile.

---

## 📋 Fazy implementacji

### Faza 1 — Quick fixy (15 min)
Co: 2 + 10 + 9 (potwierdzenie).

| # | Zmiana | Plik |
|---|--------|------|
| 1.1 | Usunąć animację `sales-pulse` (urgent promo — czerwone bąbelki pulsujące) | `index.html` (CSS inline) |
| 1.2 | Usunąć animację `scPulse` (kropka eyebrow showcase) | `index.html` (CSS inline) |
| 1.3 | Linki do osiedli (kafelki mapy + popup + sekcja allinv) → `target="_blank"` | `index.html` |
| 1.4 | Smoke test: prefill formularza `/kontakt?mieszkanie=A-01` | `kontakt/index.html` |

**Commit:** `feat(ux): usun pulsujace CTA + linki osiedli w nowej karcie`

---

### Faza 2 — Popup mapy: 2 CTA (15 min)
Co: punkt 1.

| # | Zmiana | Plik |
|---|--------|------|
| 2.1 | Popup mapy: 2 CTA — „Zobacz osiedle" (do `/osiedle-X`) + „Wyszukiwarka 3D" (do invToSearchUrl) | `index.html` |
| 2.2 | Kafelki listy `.invmap__item` (po lewej) → klik = otwiera stronę osiedla w nowej karcie (zamiast tylko aktywować pin) | `index.html` |
| 2.3 | Style 2-CTA popupu | `css/style.css` |

**Commit:** `feat(home/mapa): popup z 2 CTA — opis osiedla + wyszukiwarka 3D`

---

### Faza 3 — Kontakt w wielu miejscach (30–45 min, zależne od Q1)
Co: punkt 5.

Zakładam (c) — floating + bloki:
| # | Zmiana | Plik |
|---|--------|------|
| 3.1 | Komponent `<contact-fab>` — sticky pill „Zadzwoń · 12 300 00 77 / Napisz" w prawym dolnym rogu | `index.html`, `js/contact-fab.js` |
| 3.2 | Włączyć FAB na wszystkich kluczowych podstronach (home, wyszukiwarka, mieszkanie, realizacje, lokale, standardy, ulubione) | inject lub partial w każdej stronie |
| 3.3 | Sekcja „Kontakt" przed stopką na: `/wyszukiwarka`, `/mieszkanie`, `/realizacje`, `/nasze-standardy` | każdy plik |

**Commit:** `feat(kontakt): floating FAB + sekcje kontaktowe na podstronach`

---

### Faza 4 — Porównywarka w `/wyszukiwarka` (60–90 min)
Co: punkt 3.

| # | Zmiana | Plik |
|---|--------|------|
| 4.1 | State: `compareIds` w sessionStorage (niezależnie od ulubionych) | `js/compare.js` (nowy) |
| 4.2 | Każda `.ws-card` → checkbox „Porównaj" (max 4) | `wyszukiwarka/index.html` |
| 4.3 | Floating bar dolny: „Wybrano X z 4 — Porównaj / Wyczyść" | `wyszukiwarka/index.html` + style |
| 4.4 | Modal/sekcja z tabelą porównawczą (wiersze: ID, m², pokoje, piętro, strona świata, cena, zł/m², dostawa, status, funkcje) | `wyszukiwarka/index.html` |
| 4.5 | „Najlepszy w kategorii" — automatyczne podświetlenie (najtańsze, największe, etc.) | JS |

**Commit:** `feat(wyszukiwarka): porownywarka mieszkan (max 4)`

---

### Faza 5 — `/ulubione`: auto-porównywarka + udostępnij (45 min)
Co: punkty 4 + 7.

| # | Zmiana | Plik |
|---|--------|------|
| 5.1 | Auto-porównywarka: gdy ≥2 mieszkania → tabela jest WIDOCZNA pod listą bez klikania | `ulubione/index.html` |
| 5.2 | Wybór które porównujesz: domyślnie wszystkie ulubione, z możliwością odznaczenia | `ulubione/index.html` |
| 5.3 | Button „Udostępnij listę" — Web Share API + fallback kopiuj link + mailto (zależne od Q3) | `ulubione/index.html` |
| 5.4 | URL `/ulubione/?favs=A-01,B-07` — załaduj listę z parametru (dla odbiorcy linka) | `ulubione/index.html` |

**Commit:** `feat(ulubione): auto-porownywarka + udostepnianie listy`

---

### Faza 6 — RODO po umówieniu (20–30 min, zależne od Q2)
Co: punkt 6.

Zakładam (a) — wbudowane w formularz:
| # | Zmiana | Plik |
|---|--------|------|
| 6.1 | Formularz `/kontakt`: dodać 3 opcjonalne checkboxy zgód (newsletter, marketing telefoniczny, profilowanie) — oddzielone od wymaganej zgody na przetwarzanie | `kontakt/index.html` |
| 6.2 | Po wysłaniu — komunikat sukcesu z podsumowaniem zaznaczonych zgód | `kontakt/index.html` JS |

**Commit:** `feat(kontakt): rozszerzone zgody RODO po prezentacji`

---

### Faza 7 — Audit minimalizmu (60 min)
Co: punkt 8.

Przegląd każdej podstrony pod kątem:
- Czy lead jest krótki (≤2 zdania)?
- Czy są zbędne sekcje „edukacyjne"?
- Czy CTA kontaktowe jest widoczne na każdym widoku?
- Wycięcie tekstów typu „Cztery powody, dla których wybierzesz nas..."

**Commit:** `feat(ux): minimalizm — kompaktowe lead'y, mniej szumu`

---

### Faza 8 — Build, weryfikacja, deploy
1. Smoke testy — każda zmieniona strona, 200 + kluczowe stringi
2. Manualny przegląd w przeglądarce
3. Push → GH Pages

---

## 🎯 Szacunek czasu

| Faza | Czas |
|------|------|
| F1 quick | 15 min |
| F2 popup mapy | 15 min |
| F3 kontakt | 30–45 min |
| F4 porównywarka /wyszukiwarka | 60–90 min |
| F5 /ulubione | 45 min |
| F6 RODO | 30 min |
| F7 minimalizm | 60 min |
| F8 deploy | 15 min |

**Razem:** ~4–5 godzin pracy.

---

## 🚀 Co robię teraz

**Zaczynam od F1** (quick — bez ryzyka, niezależne od Q1–Q3) i równolegle czekam na decyzje Q1–Q3 dla F3, F5, F6.

Jeśli odpowiesz „idź z założeniami" — lecę z (c) / (a) / (b) wg moich sugestii.
