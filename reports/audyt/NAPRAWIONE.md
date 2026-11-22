# Naprawione w trakcie audytu

Każda pozycja: co było źle, dowód, co zmienione, commit. Wszystkie poprawki: kilka linijek, bez zmiany modelu danych, wyglądu ani zasad podatkowych; wszystkie testy robota zielone po zmianie.

## 1. „Nie starczy na rachunki” liczyło przyszłą pensję razem z potrąceniami z paska
- **Było źle:** `shortP` (`js/today.js`) dodawał do prognozy salda cały wpływ z paska (netto + potrącenia), a potrącenia (`slipOf`) schodzą z tego samego konta osobnymi wydatkami. Gdy brakowało mniej niż suma potrąceń (np. ubezpieczenie grupowe, Multisport), ostrzeżenie „zabraknie” się nie pokazywało.
- **Dowód:** saldo 100 zł, pensja 6 500 zł wpływu − 500 zł potrąceń, czynsz 6 200 zł → powinno zabraknąć 100 zł, `shortP` zwracał pustą listę (skrypt R2 `t1_short.mjs`).
- **Zmiana:** od kwoty ostatniej pensji odejmowane są jej potrącenia z tego konta.
- **Test:** `tests/calc.mjs` „Nie starczy – pensja bez potrąceń z paska” (na starym kodzie czerwony).
- **Commit:** `8e9c4ff`

## 2. „Wiem” przy „Nie starczy” wracało 1. dnia miesiąca
- **Było źle:** klucz ukrycia `short:konto:opłata:ym` brał dzisiejszy miesiąc, a od 22.11 ostrzeżenie patrzy 7 dni do przodu, więc termin bywa w następnym miesiącu. „Wiem” z 28.11 przy czynszu z 2.12 przestawał działać 1.12 – wracał pilny punkt i powiadomienie.
- **Dowód:** skrypt R2 `t3_key.mjs`; test poniżej na starym kodzie czerwony.
- **Zmiana:** klucz z miesiącem terminu (`x.date.slice(0,7)`); CLAUDE.md zaktualizowane. Jednorazowo: „Wiem” naciśnięte przed tą poprawką dla terminu w następnym miesiącu może się pokazać jeszcze raz.
- **Test:** `tests/calc.mjs` „Na dziś – „Wiem” przy terminie w następnym miesiącu działa po 1.”.
- **Commit:** `bd40750`

## 3. Przypomnienie „co ile km” zaraz po dopisaniu km było „po terminie”
- **Było źle:** `editRem` (`js/debts.js`) zachowywał `lastOdo: 0` z przypomnienia zapisanego wcześniej bez km (`r0.lastOdo ?? …`). Po dopisaniu np. „co 15 000 km” przy aucie z licznikiem 120 000 km aplikacja liczyła „zostało −105 000 km” i pokazywała spóźniony punkt w „Na dziś”.
- **Dowód:** skrypt R4 `rem.mjs` (`kmLeft: -105000, late: true`); w demo (Playwright) przed poprawką `lastOdo: 0`, po – `120000`; edycja przypomnienia, które już liczyło km, zachowuje swój licznik (`110000`).
- **Zmiana:** stary licznik zostaje tylko, gdy przypomnienie już wcześniej liczyło km dla tego samego auta; inaczej liczy od dzisiejszego stanu licznika.
- **Test:** sprawdzenie w demo (skrypt Playwright poza repo) – test robota wymagałby nowego ekranu z autem w demo.
- **Commit:** `dbaaa20`

## 4. Automat nie zapisywał cen z końca miesiąca (`market/eom`)
- **Było źle:** w `scripts/market.mjs` zapis `market/eom` używał zmiennej `ym` zadeklarowanej 8 linijek niżej. Wyjątek (strefa martwa `const`) cicho połykała funkcja `tryIt`, więc `market/eom` nigdy się nie zapisywał, a wycena kont na koniec miesiąca robiona 1.–7. dnia brała ceny z dnia uruchomienia zamiast z ostatniej sesji miesiąca. Poprawka z 21.11 (`7f4af83`) w praktyce nie działała.
- **Dowód:** skrypt R8 `tdz.mjs` („Cannot access 'ym' before initialization”); eslint `no-use-before-define` na starym kodzie: `70:62 'ym' was used before it was defined`.
- **Zmiana:** `today.slice(0,7)` zamiast `ym`.
- **Test:** robot (eslint) sprawdza teraz także `scripts/` regułą `no-use-before-define` (`tests/eslint.config.mjs`, `test.yml`, CLAUDE.md).
- **Commit:** `43e878c`

## 5. 🔴 „Wczytaj kopię (.json)” nie działał w prawdziwej aplikacji
- **Było źle:** `saveCfg` (`js/core.js`) zapisuje ustawienia z `mergeFields`, a lista pól zawierała stare pola `accs`, `cats`, `fixed`, których dane nie zawierały. Prawdziwe SDK Firebase 10.14.1 od razu odrzuca taki zapis, więc **wczytanie kopii kończyło się komunikatem „Błąd wczytywania: Field 'accs'…”**, zanim zapisało się cokolwiek. To samo zablokowałoby pierwsze uruchomienie na nowym koncie i przejście ze starego formatu. Błąd był od `d89a692` (22.11). Danych nie uszkodził – zapis był odrzucany w całości.
- **Dlaczego robot nie złapał:** atrapa Firestore w demo (`demo/fb-firestore.js`) po cichu pomijała brakujące pole, choć komentarz mówił „jak SDK”.
- **Dowód:** skrypt R3 `fbtest/t.mjs` na prawdziwym pakiecie `firebase@10.14.1` w Node (bez łączenia z Firebase): `invalid-argument Field 'accs' is specified in your field mask but missing from your input data`; z `deleteField()` – zapis przyjęty.
- **Zmiana:** stare pola wysyłane jako `deleteField()`; atrapa w demo rzuca ten sam błąd co SDK i obsługuje `deleteField()` w `mergeFields`.
- **Test:** `tests/restore.mjs --demo` na starym `core.js` z nową atrapą – nie przechodzi; po poprawce – zielony (172/172 wpisy, 16/16 ustawień).
- **Commit:** `9e699af`

## Wysyłka
CACHE `budzet-mw-v98` → `v99`. Przed push lokalnie: eslint (z `scripts/`), `node --check`, `cache.mjs`, `imports.mjs`, `calc.mjs` (432), `screens.mjs` (4 × 103 ekrany), `restore.mjs --demo` – wszystko zielone.
