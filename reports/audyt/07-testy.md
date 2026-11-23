# Etap 7 – Testy: co jest pokryte, czego brakuje

## Stan
| Test | Co sprawdza | Ocena |
|---|---|---|
| `calc.mjs` (430 sprawdzeń, 0,5 s) | pensje 2026, JDG, zlecenie, ulga dla młodych, obligacje/Belka, raty, salda, `balDrop`, budżet, drobne, roczne, zamknięcie (`closeDueP`/`closeStateP` – 28 wywołań), „Na dziś” (17), „Czy starczy?”, doradca D1–D7, mail, automat (`keepPrev`, parsery) | **Bardzo dobry** – oczekiwane liczby policzone niezależnie, z komentarzem „skąd ta liczba”. Daty w testach stałe (jedno `Date.now()` tylko jako „kopia była dziś”) – testy nie zależą od dnia uruchomienia |
| `screens.mjs` (103 ekrany × 4 telefony, **4 min 11 s**) | błędy JS, napisy poza ekranem, ucięte kwoty, położenie ikon, index ≠ demo | Dobry jako „dymny” test. **Nie sprawdza wartości** na ekranach ani skutków kliknięć (np. czy po zapisie wpisu saldo się zmieniło) |
| `restore.mjs` (5 s) | kopia z demo → czysta baza → porównanie wpisów, sald, kont, pozycji, planów, pasków, instrumentów, celów, `BACKUP_KEYS` | Dobry. Sprawdza tylko format `budzet-mw-2` |
| `cache.mjs`, `imports.mjs`, eslint, `node --check` | numer `CACHE`, importy/eksporty, nieużywane zmienne | Dobre, szybkie |

## Czego nie pokrywają (najważniejsze luki, wg ważności)
Sprawdzone skryptem: lista eksportów czystych modułów, których nazwa nie pada w `tests/calc.mjs` (część jest testowana pośrednio – zaznaczam tylko te, które liczą pieniądze lub decydują o przypomnieniach).

1. 🟠 **Zapis i usuwanie wpisów (`saveTx`/`delTx` w `sheet.js`, `toggleFixed`, `restoreTx`)** – najważniejsza ścieżka aplikacji (dzielenie paragonu, zwrot, waluty, zmiana daty na inny miesiąc, drobne, powiązane wpisy PPK/zwrotów, „Cofnij”) nie ma testu skutków. `screens.mjs` tylko otwiera okienko. **Propozycja (M):** test w Playwright na demo: zapisz wydatek → sprawdź `S.tx` i saldo konta; zmień datę na poprzedni miesiąc → wpis jest raz, w dobrym dokumencie miesiąca; usuń → „Cofnij” → stan jak przed. 10–15 scenariuszy.
2. 🟠 **Wycena majątku: `marketQuote`, `holdAt`, `instDiffP`** (inv.js) – decydują, czy automat zapisze dobrą wycenę konta na koniec miesiąca (`adj val:true`). `instValue` ma 7 sprawdzeń, te trzy – żadnego po nazwie. **(S)**
3. 🟠 **Strażnik porządku `checksP`** (today.js) – duplikaty, odwołania do usuniętych kont/pozycji (`ref:`, `refa:`), ujemne saldo. Bez testu. **(S)**
4. 🟠 **Daty wypłat `payDateP`, `closeWinP`, `closeYmP`, `salaryTxP`** – testowane pośrednio przez `closeDueP`, ale bez bezpośrednich przypadków: 31. w lutym, wypłata 1. przesunięta na 31. poprzedniego miesiąca, święta, zmiana roku. To dokładnie miejsca, gdzie przegląd 21.11 znalazł błędy. **(S)**
5. 🟡 **Import starych formatów** (`budzet-mw-tx`, pierwsza wersja aplikacji, `.json.gz`) – `restore.mjs` sprawdza tylko pełną kopię. **(S)** – mały plik przykładowy w `tests/` i jedno wczytanie.
6. 🟡 **`backupDoc` a nowe pola** – jest `BACKUP_KEYS`, ale brak testu, który porównuje listę pól dokumentu `households/main` używanych w kodzie z `BACKUP_KEYS` + `CFG_F`. Nowe ustawienie łatwo zapomnieć. **(S)**: test „każde pole zapisywane przez `merge(H,{x:…})` jest w kopii”.
7. 🟡 **`anomalies`, `avgActuals`, `yearPlanOf`, `typedToday`, `maturitiesP`, `pitSummaryP`, `intOf`/`intRate`** – drobniejsze obliczenia bez testu po nazwie. **(S)** każde.
8. 🟡 **`plDay`, `addMonths`, `daysIn`** (util.js) – podstawy dat bez testu (31 stycznia + 1 miesiąc, zmiana czasu). **(S)**
9. 🟡 **Automaty `notify.mjs`/`mail.mjs`** – logika „wyślij najwyżej raz” (`pushlog`, `maillog`) bez testu. **(S–M)** – wyciągnąć decyzję do czystej funkcji.
10. 💡 **Wartości na ekranie** – jeden test „złoty”: na demo z zamrożoną datą porównać liczby z kafelków Budżetu z `agg()` (S).

## Kruche lub wolne
- **`screens.mjs` – 4 min** (z 4,5 min całego robota). 4 ustawienia telefonu idą jedno po drugim. **Propozycja (S):** uruchamiać 4 konteksty przeglądarki równolegle (`Promise.all`) → ok. 1–1,5 min. Każdy push = szybsza publikacja.
- Ekrany w `SCREENS` są skryptami tekstowymi w `eval` wołającymi funkcje z `window` i modyfikującymi `S` bezpośrednio – po zmianie nazwy funkcji test pada z mało czytelnym błędem; kolejne ekrany zależą od poprzednich (`closeAll`, `window.__tw`). Kolejność jest istotna – dopisując ekran w środku, łatwo zepsuć następne. Akceptowalne, ale warto komentarz „ekrany zależne od poprzednich: …”.
- Dane demo idą za dzisiejszą datą (`clock.setFixedTime` na 15. dnia) – dobrze; ale ekrany zależne od pory dnia (dymek po 20:00, ciekawostka „co popołudnie”) są sprawdzane tylko o 12:00.
- `cache.mjs` przyjmuje commit sprzed push – przy pushu wielu commitów naraz porównuje z `github.event.before` (dobrze).

## ✅ Stan po Etapie B (23.11.2026)
| Luka | Co jest teraz |
|---|---|
| 1. Zapis i usuwanie wpisów | `tests/flows.mjs` – 12 scenariuszy w demo przez prawdziwe okienko (saldo, dokument miesiąca, zmiana miesiąca tam i z powrotem, „Ostatnio usunięte”, duplikat, zwrot + Cofnij, paragon, przelew, drobne, za mało na koncie, opłata stała + Przywróć). Sprawdzone: zepsuty `fixedDupStop` → test czerwony |
| 2. Wycena | `calc.mjs`: `marketQuote` (nowsza/starsza cena, inna waluta, złoto, konto w euro), `holdAt`, `instDiffP` (z odsetkami, z ceną automatu) |
| 3. Strażnik | `calc.mjs`: `checksP` – 7 rodzajów punktów + „To nie błąd” |
| 4. Daty wypłat | `calc.mjs`: `payDateP` (sobota → piątek, koniec miesiąca w lutym, 1. przesunięta na 31., 31. w lutym, zmiana roku), `closeWinP`, `closeYmP`, `salaryTxP` |
| 5. Stare formaty | `flows.mjs`: `budzet-mw-tx` jako `.json.gz` i `.json` dwa razy (bez wskrzeszania), pierwsza wersja aplikacji dwa razy |
| 6. `backupDoc` a nowe pola | `calc.mjs`: każde pole z `merge(H,…)` / `updateDoc(H,…)` jest w `BACKUP_KEYS` albo `CFG_F` |
| 7. Drobne obliczenia | `calc.mjs`: `yearPlanOf`, `avgActuals`, `anomalies`, `maturitiesP`, `pitSummaryP`, `intRate`/`intOf`, `cushionP`, obligacje doradca = wycena |
| 8. Daty | `calc.mjs`: `plDay` (zmiana czasu), `addMonths`, `daysIn`, `addDays` w strefie Europe/Warsaw |
| 9. Automaty | decyzja wyjęta do `scripts/when-lib.mjs` (`pushSlot`, `mailPlan`) + testy |
| 10. Wartości na ekranie | częściowo: `flows.mjs` sprawdza salda po zapisie (nie kafelki) |
| Prawdziwe SDK | `tests/sdk.mjs` – 28 przypadków; atrapa poprawiona w 10 miejscach, w których była łagodniejsza |
| `screens.mjs` | 4 telefony równolegle: 3 min 33 s → 1 min 12 s |
| `restore.mjs` | porównanie pole po polu (wpisy, ustawienia, plany, paski, zobowiązania, instrumenty, cele), salda z żywych wpisów |
