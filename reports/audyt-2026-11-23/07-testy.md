# Etap 7 – Testy (24.11.2026)

## Stan
| Test | 22.11 | 24.11 (po audycie 2) | Czas |
|---|---|---|---|
| `calc.mjs` | 430 sprawdzeń | **512** (+4 z audytu 2: plan doradcy „dlaczego”, `typedToday` ×2, poduszka w mailu) | <1 s |
| `screens.mjs` | 103 ekrany, 4 min 11 s | 103 ekrany × 4 telefony, **1 min 13 s** (równolegle) | 1:13 |
| `flows.mjs` | – | **14 scenariuszy** (+2 z audytu 2: „Czy starczy?” po przerysowaniu, wycena po usunięciu instrumentów) | 15–20 s |
| `sdk.mjs` | – | 28 przypadków atrapa = SDK 10.14.1 | ~1 s |
| `restore.mjs` | liczby | pole po polu | ~5 s |
| eslint, `--check`, `imports`, `cache` | ✅ | ✅ | ~4 s |

Wszystkie luki 1–10 z poprzedniego audytu zostały zamknięte w etapie B (lista w `00-poprzedni.md`). Robot jest dziś mocny: każda z 7 poprawek tego audytu ma test, który bez poprawki jest czerwony.

## Czego nadal nie pokrywają (kolejność wg ważności)
1. 🟠 🆕 **Automat cen przez kilka dni z rzędu** – `dropJumps` jest testowany na jednym kroku; brak scenariusza „krach przez 4 dni” i „dzień bez odpowiedzi w środku” (K5 w `02-kod.md`). S – po decyzji o poprawce.
2. 🟠 🆕 **`cushionP` z celami opłacanymi z rachunku maklerskiego** (K4) – test pokazałby problem od razu. S – razem z poprawką.
3. 🟡 🔁 **Przepisy bez testu:** KUP 300 zł, zlecenie KUP 50%, ryczałt najmu 12,5% wprost, IKZE-JDG 2026, opłata wykupu COI/ROR/DOR, dzieło z PIT-2 (wyniki sprawdzone skryptem w `03-przepisy.md` – brakuje tylko zapisania ich w robocie). S.
4. 🟡 🆕 **„Cofnij” po usunięciu paska** (`salary.js:299`) i ponowne wczytanie **starej wersji** z planami i saldami (dziś `flows.mjs` sprawdza tylko wpisy i konto). S.
5. 🟡 🆕 **`payPatternP` dla wypłaty 30. bez rozstrzygającego miesiąca** (30.09/30.10/30.11 → grudzień). S.
6. 🟡 🆕 **`writeBatch` w atrapie** z błędnym `update` / brakującym polem `mergeFields` w paczce (prawdziwe SDK odrzuca całość) – dopisać do `sdk.mjs`. S.
7. 🟡 🆕 **Licznik „Czego używamy”** – `cardKey` i `USAGE_CAT` nie mają żadnego testu; dwa błędy z tego audytu (✅4, ✅7) złapałby prosty test: „każdy tytuł karty `section.chart` na ekranach robota daje klucz z katalogu” (w `screens.mjs` – tytuły są już pod ręką). S.
8. 💡 🔁 Ekrany o innej porze dnia (dymek po 20:00, ciekawostka po południu) – robot widzi tylko 12:00.

## Kruche miejsca (🔁, bez zmian)
- `screens.mjs`: ekrany w `SCREENS` zależą od kolejności (`closeAll`, `window.__tw`) i brakuje komentarza, które od których – dopisując ekran w środku łatwo zepsuć następne. 💡 jeden komentarz.
- `calc.mjs`: wyjątek w jednym sprawdzeniu przerywa cały plik (widać tylko `RangeError`, bez nazwy testu – tak było przy `typedToday` przed poprawką). 💡 `eq` mogłoby przyjmować funkcję i łapać wyjątek (S).
