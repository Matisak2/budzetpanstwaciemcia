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

## 6. „📈 Aktualizuj wartości” wyceniało po cenie automatu zamiast wpisanej ręcznie
- **Było źle:** `saveValues` (`js/savings.js`) zapisywał w bazie nową cenę z dzisiejszą datą, ale wycenę konta liczył z lokalnej kopii, w której została stara data ceny. `marketQuote` uznawał wtedy cenę automatu za nowszą – wpis „Zmiana wartości” szedł ze złej ceny, a po zapisie znowu pojawiało się „Zapisz wycenę”.
- **Dowód:** demo (Playwright, skrypt poza repo): ETF z ceną automatu 50 i wpisaną ręcznie 300 → przed poprawką wpis wyceny **−1 836,61 zł**, po poprawce **+10 103,39 zł**.
- **Zmiana:** lokalna kopia dostaje `priceDate = dziś`, tak jak zapis w bazie.
- **Commit:** `2152f71`

## 7. „Rok temu” i „Wasza inflacja” 28 lutego po roku przestępnym pomijały 29 lutego
- **Było źle:** `yearAgoP` i `ytdSpanP` (`js/logic.js`) w ostatnim dniu miesiąca liczyły zeszłoroczny miesiąc do tego samego numeru dnia – 28.02.2029 bez wpisów z 29.02.2028 (karta „Rok temu” mogła zniknąć). Pierwszy raz zdarzyłoby się w 2029 r.
- **Dowód:** skrypt R1; testy poniżej na starym kodzie czerwone (`[null,null]` i `0`).
- **Zmiana:** ostatni dzień miesiąca = cały miesiąc rok wcześniej.
- **Test:** `tests/calc.mjs` – dwa nowe sprawdzenia.
- **Commit:** `6221044`

## 8. „Nie wiem” w liczbowych pytaniach ankiety doradcy dawało NaN
- **Było źle:** odpowiedź „?” w pytaniach liczbowych zamieniała się na NaN: piaskownica „NaN” (limit 0), „ok. NaN%” nieruchomości w planie (i NaN zapisany do Firestore), fałszywe „✓ Wkład i koszty już są” w 🎯 Celach, rentowność najmu NaN.
- **Dowód:** skrypt R6 `t4.mjs`; test poniżej na starym kodzie czerwony.
- **Zmiana:** pomocnik `qn(v,d)` w `js/advisor.js`: brak odpowiedzi, „?” albo nie-liczba → ta sama wartość domyślna, co dotąd przy braku odpowiedzi; każda inna odpowiedź (także „0”) bez zmian. Użyty w 11 miejscach (`advisor.js`, `advisorui.js`).
- **Test:** `tests/calc.mjs` „Plan: „?” przy nieruchomościach i piaskownicy”.
- **Commit:** `b04a921`

## 9. Adres …/demo (bez ukośnika) otwierał prawdziwą aplikację
- **Było źle:** service worker pomijał tylko ścieżki z `/demo/`; wejście na `…/budzetpanstwaciemcia/demo` dostawało z cache prawdziwą aplikację (ekran logowania) zamiast przekierowania na `/demo/`. Link w aplikacji ma ukośnik – dotyczyło adresu wpisanego albo udostępnionego.
- **Dowód:** Chromium z prawdziwym service workerem (skrypt poza repo, serwer przekierowuje jak GitHub Pages): przed – tytuł „Budżet M&W”, po – „Budżet M&W – demo”.
- **Zmiana:** `sw.js`: `/\/demo(\/|$)/`.
- **Commit:** `da0f86e`

## 10. Wyczyszczona marża obligacji wracała z bazy
- **Było źle:** `editInst` (`js/savings.js:79`) przy pustym polu „Marża” usuwał pole tylko z lokalnego obiektu (`delete body.bond.margin`), a zapis z `merge` zostawia w Firestore pole, którego nie ma w danych – stara marża dalej liczyła się w wycenie obligacji.
- **Dowód:** atrapa Firestore w demo (łączy mapy jak Firestore): zapis bez pola → `margin: 2` zostaje; z `deleteField()` → pole znika. Zasada `merge` w Firestore – ta sama.
- **Zmiana:** `body.bond.margin=deleteField()`.
- **Commit:** `e041118`

## 11. Zakup/sprzedaż z wcześniejszą datą nadpisywał nowszą cenę instrumentu
- **Było źle:** `addLot` (`js/savings.js:108`) zawsze zapisywał cenę i datę partii jako bieżącą cenę – dopisanie starego zakupu cofało wycenę instrumentu bez automatu do starej ceny.
- **Dowód:** demo (Playwright): przed poprawką zakup z 10.01 po 111 zastępował cenę z 5.08 (95); po poprawce cena z 5.08 zostaje, a zakup z 21.11 po 222 ją aktualizuje.
- **Zmiana:** cena z partii tylko, gdy partia nie jest starsza niż obecna cena.
- **Commit:** `8274d31`

## 12. „Policz” (Gdzie wpłacić), „Analizuj” (Piaskownica) i „Zapisz” (Aktualizuj wartości) nie działały przy otwartej klawiaturze
- **Było źle:** `render()` (`app.js:62`) czeka, gdy kursor jest w polu tekstowym, a `calcWhere`, `sandCalc` i `saveValues` – inaczej niż `slipSuggest`/`slipNetto` – nie zdejmowały kursora. Wynik był policzony, ale nie pokazywał się, dopóki nie schowało się klawiatury; wyglądało, jakby przycisk nie działał. Strona „Aktualizuj wartości” nie zamykała się po zapisie.
- **Dowód:** demo (Playwright, emulacja iPhone 13 – E1 `j3.mjs` i mój skrypt): przed – `{pend:true, kursor w wAmt, wynik niewidoczny}`, po – wynik na ekranie.
- **Zmiana:** `blur()` na początku tych trzech funkcji (ta sama linijka co w `salary.js`).
- **Commit:** `1545ad2`

## 13. Przelew z kaskady nadwyżek miał tytuł „Wypłata na konto bieżące”
- **Było źle:** `sheet.js:187` dawał ten tytuł każdemu przelewowi z podanym kontem źródłowym – także kaskadzie (z konta bieżącego **na** oszczędności/IKE, krok 3 zamknięcia i „→ kwota” w Oszczędnościach).
- **Dowód:** demo: przed – „Wypłata na konto bieżące”, po – „Wpłata”; wypłata z oszczędności dalej „Wypłata na konto bieżące”.
- **Commit:** `32ee003`

## 14. Nieaktualne opisy w przewodniku (⚙️ → 📖 Pomoc)
- „+ Przychód” → „📥 + Przychód stały” (innego przycisku nie ma), strażnik – ujemne saldo dotyczy też subkont i oszczędności (pilnie, codziennie – od 22.11), koło majątku – doradca jest gotowy (nie „w kolejnych etapach”). Sam tekst.
- **Dowód:** E1 (porównanie HELP z demo), R7 (`helpq.mjs`).
- **Commit:** `c2e98b9`

## Wysyłki
- Push 1: CACHE `v98` → `v99` (poprawki 1–5).
- Push 2: CACHE `v99` → `v100` (poprawki 6–9).
- Push 3: CACHE `v100` → `v101` (poprawki 10–11).
- Push 4: CACHE `v101` → `v102` (poprawki 12–14).
- CACHE `budzet-mw-v98` → `v99`. Przed push lokalnie: eslint (z `scripts/`), `node --check`, `cache.mjs`, `imports.mjs`, `calc.mjs` (432), `screens.mjs` (4 × 103 ekrany), `restore.mjs --demo` – wszystko zielone.
