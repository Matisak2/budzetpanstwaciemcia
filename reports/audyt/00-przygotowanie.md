# Etap 0 – Przygotowanie (22.11.2026)

## Punkt odniesienia: testy przed audytem (commit `6dd5fe7`)
Uruchomione lokalnie tak jak w `.github/workflows/test.yml` (Node 22.22, eslint i Playwright z `/opt/node-tools`, Chromium `/opt/pw-browsers/chromium`).

| Test | Wynik | Czas |
|---|---|---|
| `eslint -c tests/eslint.config.mjs js/ demo/ sw.js` | ✅ 0 uwag | 3,6 s |
| `node --check` (js/, demo/, sw.js, scripts/, tests/) | ✅ | <1 s |
| `node tests/cache.mjs HEAD~1` | ✅ „Pliki aplikacji bez zmian” | <1 s |
| `node tests/imports.mjs` | ✅ 174 importy | <1 s |
| `node tests/calc.mjs` | ✅ 430 sprawdzeń | 0,5 s |
| `node tests/screens.mjs` | ✅ 4 ustawienia × 103 ekrany | **4 min 11 s** |
| `node tests/restore.mjs --demo` | ✅ 172/172 wpisy, 10/10 sald, 16/16 ustawień | 5,5 s |

Uwaga: `reports/` jest w `.git/info/exclude` (lokalny wykluczony katalog) – raporty audytu dodaję `git add -f reports/audyt`.

## Mapa plików

### Moduły aplikacji (`js/`) – rozmiar, linie (śr. długość linii ~140 znaków, najdłuższe kilka tys.), liczba eksportów, kto importuje

| Plik | Bajty | Linie | Eksp. | Za co odpowiada | Importują go |
|---|---:|---:|---:|---|---|
| `util.js` | 4 642 | 50 | 29 | kwoty, daty, `plu`/`dmy`/`plDay`, tryb dyskretny, `ls` | prawie wszystko + `mail-lib`, `mail`, `market`, testy |
| `data.js` | 6 545 | 54 | 12 | domyślne konta/kategorie, kolory (`SEASON`, `OWN_COL`, `CURS`) | actions, analysis, app, core, debts, sheet |
| `pay.js` | 10 610 | 98 | 25 | pasek pensji 2026, JDG, ulga dla młodych, `fromNet` | advisorui, salary, today, calc |
| `inv.js` | 17 677 | 152 | 39 | instrumenty, obligacje `BONDS`, lokaty, Belka, limity, FIRE, odsetki kont | 9 modułów + `market.mjs`, calc |
| `logic.js` | 34 403 | 287 | 52 | czyste obliczenia: salda, `balDrop`, plan, agregaty, „kto płaci”, `personBudP`, `savFlow`, kopia `backupDoc` | 15 modułów + `mail-lib`, calc |
| `today.js` | 44 936 | 297 | 33 | „Na dziś” (`todayItems`), strażnik porządku, `recurringP`, `shortP`, daty wypłat, zamknięcie (stan) | 11 modułów + `mail-lib`, `market`, `notify`, calc |
| `close.js` | 12 371 | 91 | 10 | UI zamknięcia miesiąca | app, todayui |
| `core.js` | 23 616 | 200 | 64 | stan `S`, Firebase, zapis, `ask`/`toast`, `infoH`, `negStop`/`txOk` | 11 modułów |
| `sheet.js` | 42 633 | 337 | 44 | okienko transakcji, `saveTx`/`delTx`, zdjęcia, waluty | 6 modułów |
| `actions.js` | 84 575 | 592 | 93 | akcje budżetu i kont, „kto płaci”, „Czy starczy?”, opłaty stałe, kopia, filtry | 9 modułów |
| `app.js` | 79 953 | 457 | 6 | `render`, ekrany zakładek, logowanie, subskrypcje, start, `window.*` | (wejście) |
| `salary.js` | 46 864 | 292 | 51 | pensje i paski, ulgi PIT, koszt roczny stałych, usunięte, zmiany | 6 modułów |
| `savings.js` | 50 587 | 309 | 54 | instrumenty, limity, FIRE, wydatki roczne, odsetki | 8 modułów |
| `debts.js` | 37 817 | 218 | 45 | zobowiązania, projekty, przypomnienia, kaskada | 7 modułów |
| `analysis.js` | 30 791 | 214 | 18 | Analiza, sklepy, CSV, Wrapped | app |
| `todayui.js` | 15 708 | 103 | 26 | „Na dziś” UI, powiadomienia, `runGo` | app, core |
| `usage.js` | 10 647 | 67 | 8 | licznik „Czego używamy” | 9 modułów |
| `report.js` | 9 083 | 56 | 4 | podsumowanie roku (aplikacja + mail) | app, `mail.mjs`, calc |
| `advisor.js` | 65 899 | 448 | 69 | 🧭 doradca – obliczenia (D1–D7) | advisorui, app, savings, today, calc |
| `advisorui.js` | 81 655 | 467 | 50 | 🧭 doradca – ekrany | app, todayui |
| `guide.js` | 121 327 | 332 | 12 | kotki (dymki), święta, NEWS, HELP | 10 modułów + calc |
| `facts.js` | 42 844 | 374 | 2 | 366 ciekawostek | guide, calc |
| `cats.js` | 28 003 | 197 | 2 | rysunki Bailey i Ivo (SVG w kodzie) | 7 modułów |
| `art.js` | 1 036 | 7 | 3 | ikonki kategorii | 7 modułów + `mail-lib` |
| `charts.js` | 10 826 | 77 | 14 | wykresy SVG | 6 modułów |
| **Razem js/** | **~868 kB** | | | | |

### Pozostałe pliki

| Plik | Bajty | Za co |
|---|---:|---|
| `index.html` / `demo/index.html` | 9 191 / 9 634 | szkielet, okienko transakcji (w obu!) |
| `style.css` | 71 140 | cały wygląd (761 linii), kwiatki Werci jako SVG na końcu |
| `sw.js` | 5 424 | service worker (`CACHE` v98, `SHELL`) |
| `manifest.json` | 1 283 | PWA, skróty ikony |
| `demo/demo.js` | 23 658 | przykładowe dane, imiona, kursy |
| `demo/fb-*.js` | ~4 kB | atrapa Firebase (Auth, Firestore w `localStorage`) |
| `scripts/common.mjs` | 3 006 | Firebase Admin dla automatów |
| `scripts/market.mjs` + `market-lib.mjs` | 13 301 + 7 688 | kursy, ceny, inflacja, obligacje, wycena końca miesiąca |
| `scripts/notify.mjs` | 3 979 | powiadomienia Web Push |
| `scripts/mail.mjs` + `mail-lib.mjs` | 4 213 + 19 239 | kopia mailem, podsumowanie miesiąca/roku |
| `scripts/rules.mjs` | 5 369 | publikacja zasad Firestore (ręczny automat) |
| `tests/*` | ~157 kB | calc (768 linii, 430 sprawdzeń), screens (103 ekrany), restore, cache, imports, eslint |
| `.github/workflows/*` | 5 plików | test (robot+Pages), market, notify, mail, rules |
| `firebase/*` | 2 pliki | kopie zasad (bez e-maili) |
| ikony PNG | ~184 kB | 4 pliki |

### Kierunek importów (uproszczony)
`util ← data ← pay/inv ← logic ← today ← advisor` (czyste, bez DOM, używane też przez automaty)
→ `core` (stan, Firebase) → `sheet / actions / salary / savings / debts / analysis / todayui / close / usage / advisorui` (UI, importują się nawzajem – cykle) → `app.js` (wejście, `window.*`).
`guide.js` (121 kB) i `facts.js` (43 kB) są importowane statycznie przez 10 modułów → ładowane zawsze przy starcie (sprawdzone w etapie 5).
