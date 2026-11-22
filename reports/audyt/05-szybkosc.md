# Etap 5 – Szybkość (pomiary 22.11.2026)

**Metoda.** Wersja demo w Chromium (Playwright), profil iPhone 13 (390×844, dotyk), **procesor spowolniony 4×** (CDP `Emulation.setCPUThrottlingRate`) – to ostrożne przybliżenie starszego telefonu; iPhone 13 jest w praktyce 2–4× szybszy niż te liczby. Pliki z lokalnego serwera (bez opóźnień sieci – w prawdziwej aplikacji i tak idą z cache service workera). Skrypty: katalog tymczasowy `audit/perf/perf*.mjs` (nie w repo). Demo podmienia Firebase na atrapę, więc **czas SDK Firebase i odczytów Firestore nie jest w tych liczbach** (opisany niżej z kodu).

## Wyniki

### Start
| Miara (CPU 4×) | Wynik |
|---|---|
| Pierwszy ekran Budżetu (od `goto` do kafelków) | **1,7–2,3 s** (dwa pomiary) |
| First Contentful Paint | 1,0–1,25 s |
| Pobierane pliki | 35 plików, **1,13 MB** bez kompresji (własne pliki ok. **370 kB po gzip**) |
| Największe | `guide.js` 121 kB (44 kB gzip), `actions.js` 85 kB, `advisorui.js` 82 kB, `app.js` 80 kB, `style.css` 71 kB, `advisor.js` 66 kB |
| Czas skryptów przy starcie (profil) | app.js 456 ms, util.js 90 ms, logic 61, cats 52, today 52, advisor 36 ms; „(program)” – układ strony i parsowanie HTML – 948 ms |

**Pokrycie kodu przy starcie** (jaka część pliku w ogóle się wykonała do pierwszego ekranu):
`charts 6%`, `report 8%`, `analysis 8%`, `salary 9%`, `savings 10%`, `debts 13%`, `advisorui 13%`, `sheet 14%`, `actions 17%`, `app 25%`. `guide.js` 94% i `facts.js` 100% to wielkie tablice tekstów (HELP, NEWS, 366 ciekawostek) tworzone w całości przy starcie, choć na ekranie potrzebny jest jeden dymek.

### Przełączanie zakładek (CPU 4×)
| Zakładka | dane demo (172 wpisy) | **3 lata (6 364 wpisy)** |
|---|---:|---:|
| Budżet | 99 ms | **345 ms** (pierwszy raz), 119 ms kolejny `render()` |
| Rejestr | 111 ms | 178 ms |
| Stałe | 113 ms | 87 ms |
| Oszczędności | 283 ms | 145 ms |
| Konta | 69 ms | 99 ms |
| Analiza (miesiąc) | 289 ms | 260 ms; rok 306 ms |
| 🔔 Na dziś | – | 169 ms |
| Pamięć JS | | **10 MB** |
| Węzły DOM na Budżecie | | 3 847 |

Wniosek: **aplikacja jest szybka**; 3 lata danych nie są problemem (pamiętanie wyników `liveOf`/`inPeriod`/`balance` działa – drugi render 3× szybszy). Na iPhonie 13 przełączanie zakładek to szacunkowo 30–120 ms.

## Wąskie gardła (profil CPU)

### 1. 🟠 `fitNums()` – dopasowanie wielkości liczb w kafelkach (app.js:45–48) – potwierdzone profilem
Przy każdym `render()` dla każdego kafelka: zapis `style.fontSize=''` → odczyt `getComputedStyle`, `scrollWidth`, `getBoundingClientRect` każdego dziecka → w pętli do 10× zapis i odczyt. Każdy odczyt po zapisie wymusza **przeliczenie układu całej strony** (3 800 węzłów).
Profil: Budżet `fitNums` + `over` = **~155 ms z ~330 ms skryptu**; Analiza **~172 ms** (więcej niż samo budowanie ekranu `render` 68 ms); Oszczędności ~45 ms.
**Propozycja (S):** najpierw odczytać wszystkie kafelki (jedna faza odczytu), zmieniać tylko te, które się nie mieszczą; pomijać, gdy szerokość ekranu i teksty się nie zmieniły; albo zastąpić CSS-em (`font-size: clamp(...)` z jednostkami kontenera `cqi` – już używacie `@container` w Kontach). **Zysk: ok. 40–50% czasu każdego przerysowania.**

### 2. 🟡 Cały ekran budowany od nowa (`$('app').innerHTML=h`) przy każdej zmianie
Każde stuknięcie (rozwinięcie kategorii, filtr) przebudowuje cały ekran (~3 800 węzłów) – „(program)” w profilu to głównie parsowanie HTML i układ. Przy tej architekturze (bez frameworka) to świadomy wybór i przy obecnych czasach akceptowalny. **Nie proponuję zmiany** (wysiłek L, zysk mały). Ewentualnie: rozwinięcie/zwinięcie kategorii przez `<details>` bez `render()` (S–M, dotyczy tylko Budżetu).

### 3. 🟡 Teksty kotków i przewodnika ładowane zawsze (`guide.js` 121 kB + `facts.js` 43 kB)
Statyczny import w 10 modułach. HELP (przewodnik, ~60 kB) i NEWS („Co nowego”, ~40 kB) są potrzebne tylko po otwarciu Pomocy/lupy. Przeniesienie ich do osobnego pliku ładowanego `import()` dopiero po stuknięciu: **–35 kB gzip i ok. 20–40 ms startu przy CPU 4×** (na iPhonie 13 ~10 ms). Wysiłek S–M (lupa przeszukuje HELP – musi poczekać na `import()`). Zysk niewielki – **niski priorytet**.

### 4. 🟡 Doradca ładowany przy starcie (advisor.js 66 kB + advisorui.js 82 kB = 21% całego JS)
Wykonuje się 13% `advisorui` (karta w Oszczędnościach, przypomnienia w Na dziś). Dynamiczny import utrudniają cykle modułów i funkcje na `window` – **wysiłek M**, zysk podobny jak w p. 3. Warto tylko, jeśli Mati zdecyduje, że doradca zostaje, a i tak będzie przebudowywany (etap 6).

### 5. ℹ️ Firestore przy starcie (z kodu, app.js:432–449)
Subskrypcje: dokument główny, **wszystkie miesiące** (`months`), plany, paski, `meta/backup`, `meta/receipts`, cały `market` (w tym `market/thermo` z ~5 latami dziennych cen VWCE i kursów oraz rosnący `market/eom`), zobowiązania, instrumenty, cele. Dzięki trwałemu cache offline ekran pojawia się z pamięci telefonu, a serwer dosyła zmiany. Koszt odczytów dla dwóch osób jest pomijalny (darmowy limit 50 000/dzień). Ryzyka:
- dokument miesiąca ma limit 1 MiB – przy ~300 B na wpis to ~3 000 wpisów w miesiącu; **bezpieczne**.
- `market/thermo` rośnie codziennie (≈ 1 300 dni + kursy); przy każdej aktualizacji automatu cały dokument (dziesiątki kB) jest przesyłany do obu telefonów i wywołuje `render()`. **Propozycja (S):** termometr czytać `getDoc` tylko na ekranie Oszczędności, a nie subskrybować; albo ograniczyć historię do 3 lat (tyle potrzebuje średnia).
- każda zmiana jednego wpisu przebudowuje listę `S.tx` ze **wszystkich** miesięcy (app.js:439–441) – przy 6 000 wpisów to kilka ms; bez znaczenia.

### 6. ℹ️ Rysunki kotków
`cats.js` 52 ms przy starcie (CPU 4×); od 22.11 rysowane raz (`mountCats`) – **w porządku**.

## Ranking propozycji
| # | Propozycja | Wysiłek | Zysk |
|---|---|---|---|
| 1 | `fitNums` bez wymuszania układu w pętli | S | ~40–50% każdego przerysowania |
| 2 | Termometr bez stałej subskrypcji | S | mniej transferu i przerysowań po automacie |
| 3 | HELP/NEWS ładowane na żądanie | S–M | –35 kB gzip, ~10 ms startu na iPhonie |
| 4 | Doradca ładowany na żądanie | M | –40 kB gzip, ~15 ms startu |
| 5 | Rozwijanie kategorii bez pełnego `render()` | S–M | płynniejsze stukanie w Budżecie |

Architektury (bez build stepu, bez frameworka) **nie warto zmieniać** z powodu szybkości – zmierzone czasy są dobre, a największy zysk daje jedna mała funkcja.
