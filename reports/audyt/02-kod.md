# Etap 2 – Przegląd kodu moduł po module

**Jak powstał:** 7 przeglądów (R1–R7, po 1–3 pliki, wspólne zasady w `research_notes/audyt-robocze/COMMON.md`). Błędy w obliczeniach potwierdzano skryptami Node na prawdziwych funkcjach z `js/`, a w interfejsie – w demo przez Playwright. Zanim zgłoszenie trafiło tutaj, sam sprawdzałem w kodzie każde 🔴 i 🟠 oraz każde naprawione. Pozostałe 🟡 mają pewność taką, jaką podał przegląd. Surowe raporty i skrypty dowodowe leżą w `research_notes/audyt-robocze/R1…R7/` (poza git).

**Oznaczenia:** ✅N = naprawione w audycie (numer w `NAPRAWIONE.md`). Pewność: **P** = potwierdzone (skrypt albo demo), **p** = prawdopodobne (z kodu), **?** = do sprawdzenia. Wysiłek: S (godzina), M (dzień), L (kilka dni).

## Ogólna ocena kodu
- **Porządek jest dobry jak na projekt bez build stepu:**
  - czyste moduły obliczeń (`util/pay/inv/logic/today/advisor/report`) są oddzielone od interfejsu, a automaty używają tych samych funkcji;
  - 349 klas CSS i 35 zmiennych CSS – nic nieużywanego;
  - brak martwych funkcji na `window`;
  - NEWS bez dziur (v4–v68);
  - brak `toISOString()` dla dat lokalnych;
  - nie znaleziono zmian `S.tx` w miejscu.
- **XSS: nie znaleziono.** R3 dopisał `<img src=x onerror=…>` do wszystkich nazw i notatek w demo i przeszedł ~100 ekranów oraz okienek. Nic się nie wykonało, a `esc()` zamienia `& < > " '`.
- **Słabości:**
  - bardzo długie linie (śr. ~140 znaków, najdłuższe kilka tysięcy), trudne do przeglądu i do łączenia zmian z kilku okien;
  - logika „poduszki”, sklepów i obligacji jest napisana w 2–3 miejscach;
  - ok. 50 eksportów używanych tylko we własnym pliku;
  - atrapa Firestore w demo zachowywała się łagodniej niż prawdziwe SDK – stąd błąd 🔴 nr 5, którego robot nie złapał.

## 🔴 Krytyczne
| # | Miejsce | Problem | Pewność | Stan |
|---|---|---|---|---|
| K1 | `js/core.js:180` `saveCfg` | „Wczytaj kopię (.json)” (oraz pierwszy start i stary format) kończył się błędem SDK „Field 'accs' is specified in your field mask but missing” – kopii nie dało się wczytać | P (prawdziwe SDK 10.14.1) | ✅5 |

## 🟠 Ważne
| # | Miejsce | Problem | Pewność | Stan / propozycja |
|---|---|---|---|---|
| W1 | `today.js` `shortP` | „Nie starczy” liczyło pensję razem z potrąceniami z paska | P | ✅1 |
| W2 | `today.js` `todayItems` klucz `short:` | „Wiem” wracało 1. dnia miesiąca | P | ✅2 |
| W3 | `debts.js:186` `editRem` | przypomnienie „co ile km” od razu po terminie (lastOdo 0) | P | ✅3 |
| W4 | `savings.js:151` `saveValues` | „Aktualizuj wartości” wyceniało po cenie automatu | P | ✅6 |
| W5 | `savings.js:108` `addLot` | starszy zakup nadpisywał nowszą cenę | P (demo) | ✅11 |
| W6 | `savings.js:79` + `core.js` `merge` | wyczyszczona marża obligacji wracała z bazy | P (zasada merge w demo) | ✅10 |
| W7 | `advisor.js:239`, `advisorui.js` | „Nie wiem” w pytaniach liczbowych → NaN | P | ✅8 |
| W8 | `savings.js:267` `editYear` (+ `logic.js:78`, `inv.js:111`) | wydatek „co 2 lata” dodany/zmieniony przez „Edytuj” nie ma `last` → w planie i kopercie **co roku** | P (obliczenie) | **Propozycja S:** przy `every` niedzielącym 12 ustawić `last` jak w `newYear`. Wymaga decyzji, który rok jest pierwszym terminem, gdy znamy tylko miesiąc (np. „najbliższy przyszły”) |
| W9 | `actions.js:364` `removeSavAcc` | powiązania konta (opłaty, drobne, PPK, instrumenty) przepinane **przed** potwierdzeniem usunięcia; „Anuluj” zostawia je przepięte | p | S: najpierw zebrać odpowiedzi, potem zastosować |
| W10 | `salary.js:117` `restoreTx`, `actions.js:226` Cofnij w `toggleFixed` | po odznacz → odhacz → „Przywróć” stary wpis: dwa żywe wpisy tej samej opłaty stałej w miesiącu (pieniądze 2×) | p | S: odmówić/zapytać, gdy w miesiącu jest żywy wpis z tym `fixedId` (jak przy paskach) |
| W11 | `actions.js:428, 458` import `budzet-mw-tx` / stara wersja | ponowne wczytanie listy wpisów **wskrzesza usunięte** wpisy i cofa poprawki (zapis `deleted:false` na istniejących id); nowe konta bez `owner` | p | S: pomijać id już obecne w `S.tx` (także usunięte) |
| W12 | `advisor.js:403` `thermoP` + `scripts/market.mjs:103` | termometr „w zł” (decyzja Matiego 22.11) **nigdy nie włączy się** na prawdziwych danych – automat ma 5 lat cen, ale kursy tylko od dnia startu; warunek „historia kursów ≥ 80% historii cen” nie będzie spełniony | P (funkcja + kod automatu) | S–M: automat raz dociąga historię kursów EUR z NBP (API tabel A ma zakresy dat) |
| W13 | `advisorui.js:370` `advTodo` | `catch(e){return[]}` połyka każdy błąd – w razie błędu znikają po cichu wszystkie przypomnienia doradcy (m.in. IKE w grudniu) | P (kod) | S: `console.error(e)` – uwaga: robot traktuje błędy konsoli jako czerwone, więc najpierw sprawdzić, że nie ma ukrytych błędów |
| W14 | `advisorui.js` (licznik 🔔 → `advTodo`) | doradca liczy ankietę, koło majątku, `devP`, `buyChecks`, `thermoP` przy **każdym** przerysowaniu i co minutę (~2,3 ms na komputerze) | p | S: zapamiętać wynik dla tych samych danych (jak `liveOf`) |
| W15 | `advisor.js:139` q1 | odpowiedź „rok urodzenia” w ankiecie nie jest nigdzie używana – Emerytura i IKE/IKZE biorą wiek tylko z 🎂 `birth` (bez niej: wiek 35) | P (grep) | S: użyć q1, gdy brak `birth`; albo usunąć pytanie |
| W16 | `advisor.js:344` `tranchesP` | przy pustym portfelu (pierwsza duża wpłata = 100% akcji) **brak transz**, a przy 1 zł w portfelu ta sama kwota → 12 transz | P | S – to zasada porady, potrzebna decyzja Matiego |
| W17 | `app.js:453` przeładowanie po nowej wersji | warunek „zajęty” nie sprawdza otwartego paska pensji (`S.slip`), wyrównania sald (`S.recon`) ani zamknięcia (`S.close`) – niezapisane kwoty mogą przepaść po aktualizacji | p | S: dopisać 3 warunki |

## 🟡 Drobne (wybór; pełna lista w surowych raportach)
**Obliczenia i daty**
- ✅7 `logic.js` `yearAgoP`/`ytdSpanP` – 29 lutego (P).
- `today.js` `payPatternP`: wypłata zawsze 30. dnia jest brana za „koniec miesiąca”, więc w miesiącach 31-dniowych aplikacja czeka na wypłatę dzień za późno (P).
- `today.js` `payDateP`: święta (np. 1.01.2027 w piątek) nie przesuwają oczekiwanej wypłaty, tylko weekendy (P). Do decyzji – wymaga listy świąt (jest w `guide.js`).
- `today.js` `typedToday`: patrzy na datę wpisu, a nie na chwilę wpisania (`ts`). Wydatek z wczoraj dopisany dziś nie wycisza przypomnienia o 20:00 (P).
- `today.js` PIT-28: wspólny klucz `pit28:rok` – „Złożone” jednej osoby ukrywa przypomnienie drugiej (p).
- `today.js` strażnik: klucz `ref:i:` bez pozycji potrącenia – „To nie błąd” ukrywa też późniejsze braki (p).
- `inv.js:107` `paidInYear`: przeniesienie IKE→IKE liczy się do limitu (P; rzadkie).
- `inv.js:95` `instDiffP`: po usunięciu ostatniego instrumentu jego wycena zostaje w saldzie na zawsze (P).
- `inv.js:89` `position`: partia ETF z przyszłą datą liczy się już dziś (P).
- `savings.js:171`: karta 🛡️ Limity pomija IKE/IKZE z grupą `sav`, a raport i PIT je liczą (p).
- `debts.js:202` `cascSurplus`: przy wypłacie 1. dnia pomija nieopłacone rachunki z końca poprzedniego miesiąca (p).
- `util.js:7` `fmtN`: „-0,00 zł” dla ułamka grosza – nie znaleziono ekranu, który to pokazuje (P).
- `sheet.js:21` `calcAmt`: `1,2,3` → 123 zł, `12,345` → 12,35 zł, `1e3` → 1 000 zł, `Infinity` przechodzi (P; głównie przy wklejaniu).

**Zapis, dwa telefony**
- `core.js:157` `w()`/`putTx` zawsze zwracają `true`, więc `if(ok)` w `saveTx`/`delTx` nic nie sprawdza. Przy błędzie zapisu zdjęcia, drobne i części paragonu i tak idą, a „Dodano” pojawia się przed komunikatem o błędzie (P).
- `sheet.js:259/263`: przeniesienie wpisu do innego miesiąca to dwa osobne zapisy bez `writeBatch`. Przez chwilę mogą istnieć dwa żywe wpisy (p).
- `salary.js:274` `saveSlip`: dwa telefony offline mogą zostawić drugi żywy wpływ z paska, czyli pensja liczy się 2× (?).
- `debts.js:119/161`: `saveProj`/`saveRem` dalej używają `indexOf` zamiast `posOf` (ten sam błąd, który 21.11 naprawiono w innych miejscach) (p).
- `debts.js:62`: usunięcia zobowiązania nie da się cofnąć ani przywrócić z 🗑️ (cele już to mają).
- `salary.js:289`: `delSlip` paska bez zaksięgowanego wpływu usuwa go bez kopii `slipBak`.
- `actions.js:249`, `salary.js:268`: „Ta pensja już jest?” pojawia się też przy pensji drugiej osoby z tą samą pozycją.
- `actions.js:139` `reassignAcc` może dać dwie reguły drobnych na jedno konto. `mergeSub` nie przenosi `payM`/`pay`. `editAcc` pozwala usunąć konto używane tylko przez wpisy w 🗑️.

**Analiza i raporty**
- `analysis.js:23`: przyszły miesiąc pokazuje „✅ Zmieściło się” (p).
- `analysis.js:70,73` Wrapped: inne waluty (300 € jako „300 zł”) i projekty spoza budżetu.
- `analysis.js:31` Mati ↔ Wercia liczy wydatki projektów z `inBudget:false`.
- `report.js:16`: „Majątek – teraz” w trwającym roku liczony do 1.01 następnego roku.
- „Średnio na miesiąc” liczona dwiema metodami: Analiza → Rok i Podsumowanie roku.
- `charts.js:46` `hbarsH`: ujemna kwota rysuje pełny pasek (p).
- `analysis.js:64` CSV: brak ochrony przed formułami Excela (`=`, `+`, `@` na początku notatki) i brak `amount2`.

**Doradca (R6)**
- `whereP` zmienia przekazane dane osób – `S.advRes.P` trzyma już pomniejszone limity.
- Brak odpowiedzi na q43 daje 100% akcji, a „Nie wiem” – 40%. Brak odpowiedzi nie jest więc ostrożny.
- `retireP`: gdy wiek emerytury ≤ dzisiejszy wiek, wychodzi „odkładaj 125 000 zł/mies.”.
- `thermoP` przy pustej inflacji/stopie pokazuje „realna stopa 0 pkt”.
- W grudniu brak dopisku „(do założenia)” przy IKE, którego nie ma w aplikacji. Cel „piaskownica” po pełnym limicie przechodzi na IKZE/IKE bez słowa.

**Wygląd, PWA, teksty (R7)**
- ✅9 `sw.js`: adres …/demo bez ukośnika (P).
- `index.html:13` + `sw.js`: arkusz Google Fonts bez `crossorigin` nie trafia do cache, więc offline może się pokazać czcionka systemowa zamiast Nunito (p – nie sprawdzone w trybie samolotowym).
- Kotki: scena to ok. 150 kB SVG i ok. 1 400 elementów (ok. 1 230 kresek sierści, filtry feTurbulence). Kotek w pustych ekranach, Analizie i ankiecie rysuje się od nowa przy każdym przerysowaniu – `mountCats` działa tylko na Budżecie (P rozmiar, p wpływ).
- `guide.js:271` HELP podaje „+ Przychód”, a przycisk bez przychodów stałych nazywa się „📥 + Przychód stały (np. najem)”.
- `style.css`: 6 pierwszych wersji reguł nadpisanych później (`.sub`, `.lim`, `.greet .gcats svg`, `.ecats svg`, `.fab`, `.lcats svg`) – do usunięcia, wygląd bez zmian.
- `demo/fb-firestore.js`: `setDoc` bez merge z `deleteField()` działa inaczej niż SDK (dziś nieużywane). Atrapę trzeba trzymać tak samo ostrą jak SDK – patrz K1.
- `usage.js` `USAGE_CAT` – brakuje: `f:gdzie`, kart „Gdzie wpłacić?”, „Razem w miesiącu”, „Netto miesiąc po miesiącu”, „Cały rok”, „Struktura kosztów”. Karta ankiety daje klucz z imieniem.

## 💡 Porządki w kodzie (propozycje, bez pilności)
| Propozycja | Wysiłek | Korzyść |
|---|---|---|
| Jedna funkcja „poduszki” w `logic.js` – dziś trzy definicje: `app.js:177`, `mail-lib.mjs:48`, `isPodAcc` w doradcy; mail i aplikacja mogą pokazać inną liczbę miesięcy | M | jedna prawda w mailu i aplikacji |
| Mail: sklepy (`mail-lib`) jak `shopsH`; plan przez `planOf`; opłaty stałe bez tych po `until`; roczne z `earlyN` | S–M | mail = aplikacja |
| Obligacje: `bondAfter` (doradca) powtarza z `inv.js` ROR/DOR, kapitalizację i opłatę wykupu – wspólne funkcje | M | jedna zasada przy zmianach MF |
| Ryczałt najmu w `rentP` i `rentTax` – jedna stała; `tNumUI` = `tNum` | S | – |
| ~50 eksportów używanych tylko we własnym pliku (lista w R4–R6) – zdjąć `export` | S | czytelność, mniej powiązań |
| Martwe eksporty: `ZWROT_PIT` (data.js), `curMap`, `outProj` (logic.js) | S | – |
| Krótsze linie w nowych zmianach (np. ≤ 200 znaków) – mniej konfliktów przy pracy w kilku oknach | – (zasada) | łatwiejsze łączenie |
| Atrapa Firestore w demo = tak samo surowa jak SDK (testy na prawdziwym pakiecie `firebase@10.14.1` w Node dla `saveCfg`, `merge`, `deleteField`) | S | robot łapie błędy zapisu |
| Dokumentacja: w kodzie „64 pytania”, w CLAUDE.md „ok. 70” | S | – |

## Zgodność z CLAUDE.md
Wszystko w porządku: zasada modułów (kod startowy tylko w `wire…()`), `index.html` = `demo/index.html` (różnią się tylko tytułem, `noindex`, ścieżkami i import map), `SHELL` kompletny, `BACKUP_KEYS` + `CFG_F` obejmują wszystkie pola zapisywane w `households/main` (R1). Rozbieżności z opisem: termometr w zł (W12 – opisany jako działający), klucz `short:` (naprawione, opis zaktualizowany).

## ✅ Stan po Etapie B (23.11.2026)
**Zrobione:** jedna poduszka (`cushionP` w `logic.js`: karta, doradca, mail); mail = aplikacja (sklepy `shopsP`, plan `planOf`, opłaty bez zakończonych umów, roczne `yearPlanOf`); wspólne zasady obligacji (`bondMonRate`, `bondFee`, `bondRates` w `bondAfter`); ryczałt najmu (`rentTaxRaw`), `tNumUI` → `tNum`; 150 zbędnych `export` (+ `export {BOND_FEE}` w doradcy); 6 nadpisanych reguł CSS scalonych; atrapa Firestore = SDK (`tests/sdk.mjs`); ANK w CLAUDE.md (ok. 80).
**Drobne 🟡 zrobione:** `instDiffP` po ostatnim instrumencie (w `instDiff`), partia z przyszłą datą, karta Limity z `sav`, `cascSurplus` przy wypłacie 1., `fmtN` „-0,00”, `pnum`/`calcAmt` („1,2,3”, „1e3”, „Infinity” = 0; „12,345” zostaje 12,35 – świadoma zasada z testu „przecinek = grosze”), przeniesienie wpisu `writeBatch` (`putTxs`), `posOf` w `saveProj`/`saveRem`, „Cofnij” usunięcia zobowiązania, „Ta pensja już jest?” tylko ta sama osoba, `mergeSub` przenosi `pay`/`payM`, `reassignAcc` bez dwóch reguł drobnych, tekst `delSlip` bez wpływu; Analiza: przyszły miesiąc, Wrapped (waluty, projekty, ulubione miejsce = `shopsP`), Mati ↔ Wercia bez projektów spoza budżetu, „Majątek – teraz”, jedna średnia, `hbarsH` < 0, CSV (formuły, `amount2`); doradca: `whereP` nie zmienia danych, brak q43 = ostrożnie, `retireP` po wieku, `thermoP` bez danych, „(do założenia)” w grudniu, piaskownica pełna – punkt w „Na pewno nie tu”; Google Fonts `crossorigin`; `USAGE_CAT` + `cardKey` (· w tytule).
**Zostawione świadomie:** `paidInYear` IKE→IKE (rzadkie, wymaga zmiany 9 wywołań), `w()`/`putTx` zawsze `true` (błąd walidacji i tak przerywa zapis wyjątkiem; błąd serwera pokazuje `w()`), `saveSlip` na dwóch telefonach offline (strażnik `slip2:`), `editAcc` przy wpisach tylko w 🗑️ (strażnik `acc:`). **Na Etap C:** W13, W14, W15, termometr bez subskrypcji, kotki przez `mountCats`. **Decyzje Matiego:** W12 (termometr w zł), W16 (transze), święta w `payDateP`.
