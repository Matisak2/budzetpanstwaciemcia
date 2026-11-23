# Etap 0 – Przygotowanie (start 23.11.2026, ok. 23:57, commit `3c59207`)

Poprzedni audyt: `reports/audyt/` (start 22.11.2026 19:37, commit `0936f93`). Od tamtej chwili: 39 commitów, w tym naprawy z audytu oraz etapy A–E z części 9 `PLAN.md`.

## Testy na start (punkt odniesienia) – wszystkie zielone
| Polecenie | Wynik | Czas |
|---|---|---|
| `npx eslint -c tests/eslint.config.mjs js/ demo/ sw.js scripts/` | bez uwag | ~3 s |
| `node --check` (wszystkie pliki) | OK | <1 s |
| `node tests/imports.mjs` | ✅ 174 importy | <1 s |
| `node tests/calc.mjs` | ✅ 508 sprawdzeń | <1 s |
| `node tests/sdk.mjs` | ✅ 28 przypadków (atrapa = SDK 10.14.1) | ~1 s |
| `node tests/cache.mjs HEAD~1` | ✅ pliki aplikacji bez zmian | <1 s |
| `node tests/screens.mjs` | ✅ 103 ekrany × 4 ustawienia telefonu | 1 min 13 s |
| `node tests/flows.mjs` | ✅ 12 scenariuszy | 15 s |
| `node tests/restore.mjs --demo` | ✅ 172/172 wpisy, 10/10 sald, 16/16 ustawień | ~5 s |

Poprzedni audyt na starcie: calc 430 sprawdzeń, screens 4 min 11 s, bez `sdk.mjs` i `flows.mjs`. Robot jest dziś wyraźnie mocniejszy i szybszy.

## Mapa plików (rozmiar w bajtach; zmiana = linie +/− od `0936f93`; linie są bardzo długie, więc mała liczba linii to i tak sporo kodu)
| Plik | Rozmiar | Zmiana | Kto importuje |
|---|---|---|---|
| `actions.js` – budżet, konta, „kto płaci”, „Czy starczy?”, import/kopia | 88 899 | +67/−42 | advisorui analysis app close core debts salary sheet todayui |
| `advisor.js` – doradca, czyste obliczenia | 66 801 | +31/−26 | advisorui app savings today |
| `advisorui.js` – doradca, ekrany | 82 057 | +39/−38 | app todayui |
| `analysis.js` – Analiza, CSV, Wrapped | 30 620 | +30/−33 | app |
| `app.js` – render, start, ⚙️, subskrypcje | 81 667 | +34/−21 | 10 modułów |
| `art.js` – ikonki, `catSlot`/`mountCats` | 2 098 | +12/−2 | 10 modułów + mail-lib |
| `cats.js` – rysunki kotów | 28 003 | – | app art core todayui |
| `charts.js` – wykresy SVG | 10 817 | +4/−4 | 6 modułów |
| `close.js` – zamknięcie miesiąca | 12 360 | +4/−4 | app todayui |
| `core.js` – stan, Firebase, zapis | 23 526 | +14/−15 | 11 modułów |
| `data.js` – domyślne dane, kolory | 6 531 | +2/−2 | 6 modułów |
| `debts.js` – zobowiązania, projekty, przypomnienia, kaskada | 38 214 | +19/−18 | 7 modułów |
| `facts.js` – 366 ciekawostek | 42 844 | – | guide |
| `guide.js` – kotki, NEWS, HELP | 126 998 | +14/−9 | 10 modułów |
| `inv.js` – instrumenty, obligacje, limity | 18 203 | +11/−6 | 11 modułów + market.mjs |
| `logic.js` – czyste obliczenia | 37 753 | +27/−3 | 15 modułów + mail-lib |
| `pay.js` – pasek pensji | 10 582 | +4/−4 | advisorui salary today |
| `report.js` – podsumowanie roku | 9 303 | +3/−3 | app + mail.mjs |
| `salary.js` – pensje, usunięte, zmiany | 48 889 | +22/−16 | 6 modułów |
| `savings.js` – oszczędności, instrumenty, roczne | 51 438 | +22/−16 | 8 modułów |
| `sheet.js` – okienko wpisu | 42 548 | +28/−29 | 5 modułów |
| `today.js` – „Na dziś”, daty wypłat, strażnik | 47 531 | +27/−12 | 11 modułów + 3 automaty |
| `todayui.js` – „Na dziś” w aplikacji | 17 238 | +27/−16 | app core |
| `usage.js` – „Czego używamy” | 10 843 | +6/−6 | 9 modułów |
| `util.js` – formatowanie, daty | 4 890 | +3/−2 | prawie wszystko |
| `style.css` | 72 339 | +23/−9 | – |
| `index.html` / `demo/index.html` | 9 300 / 9 743 | +1/−1 każdy | – |
| `demo/demo.js` | 23 658 | – | – |
| `demo/fb-firestore.js` (atrapa) | 6 051 | +28/−7 | – |
| `sw.js` | 5 427 | +2/−2 | – |
| `manifest.json` | 1 283 | – | – |
| `scripts/mail-lib.mjs` / `mail.mjs` | 18 452 / 4 406 | +7/−11 / +13/−11 | – |
| `scripts/market-lib.mjs` / `market.mjs` | 8 570 / 13 626 | +9/−0 / +4/−2 | – |
| `scripts/notify.mjs` / `when-lib.mjs` / `common.mjs` / `rules.mjs` | 3 966 / 1 333 / 3 006 / 5 369 | +3/−2 / +12 nowy kod / – / – | – |
| `tests/*` | – | calc +193, flows +145 (nowy), sdk +81 (nowy), web +27 | – |

Razem kodu w `js/`: ok. 1,03 MB (+ `style.css` 72 kB). Bez nowych plików w `js/` od poprzedniego audytu.

**Najwięcej uwagi w etapie 2** (zmienione od poprzedniego audytu): `actions.js` (`fixedDupStop`, `reassignAcc`, import, „Czy starczy?” w nowej postaci), `app.js` (`fitNums`, przeładowanie, `persist`), `advisorui.js`/`advisor.js` (pamiętanie wyników, q1), `art.js` (`mountCats`), `logic.js` (`cushionP`, `ytdSpanP`), `today.js` (`twin:`, `slip2:`, `typedToday`, PIT-28), `todayui.js` (pamiętany `todayItems`, „💡 Podpowiedzi”), `sheet.js` (`putTxs`), `savings.js` (`yearLastFor`), `scripts/` (`dropJumps`, `when-lib`, odbiorcy maili), `style.css` (`::after` 44 px, `.pbcat`).
