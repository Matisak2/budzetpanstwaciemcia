# Etap 2 – Przegląd kodu (24.11.2026)

**Jak powstał:** 4 przeglądy (podagenci, po 4–9 plików, wspólne zasady), skupione na kodzie zmienionym od poprzedniego audytu (`git diff 0936f93..HEAD`, ok. 40 commitów: naprawy z audytu i etapy A–E). Każde zgłoszenie 🟠 i każde naprawione sprawdziłem sam w kodzie, a błędy odtworzyłem skryptem Node albo w demo (Playwright). Sprawy już znane (⏳ w `00-poprzedni.md`) nie są tu powtarzane, chyba że coś nowego wyszło.

**Oznaczenia:** ✅N = naprawione w audycie (numer w `NAPRAWIONE.md`); 🆕 nowe; 🔁 z poprzedniego audytu. Pewność: **P** = potwierdzone (skrypt/demo), **p** = prawdopodobne (z kodu).

## Ogólna ocena
Nowy kod z etapów A–E jest staranny: `fixedDupStop`, `reassignAcc`, import bez wskrzeszania, `putTxs`, `saveCfg`/`mergeFields`, `fitNums`, memo `todayItems`, `catSlot`/`mountCats`, `yearLastFor`, strażnik `twin:`/`slip2:`, odbiorcy maili, `pushSlot`/`mailPlan` – sprawdzone bez uwag (lista na końcu). **Wszystkie 3 błędy, które realnie dotykały danych albo decyzji, powstały przy porządkach w etapie B** (komentarz połykający instrukcję, `instDiff` po usunięciu instrumentu, przestawiona poduszka w mailu) – to typowe ryzyko długich linii, o których mówił poprzedni audyt.

## 🟠 Ważne
| # | Miejsce | Problem | Pewność | Stan / propozycja |
|---|---|---|---|---|
| K1 | `savings.js:26–29` `instDiff` | ręcznie wpisana wartość konta inwestycyjnego bez instrumentów znikała przy każdym „Zapisz wszystko” | P (demo) | ✅3 |
| K2 | `advisor.js:233` `planP` | „dlaczego” bez linijki o reakcji na spadek (instrukcja w komentarzu) | P | ✅1 |
| K3 | `usage.js:39` `cardKey` | „Czy starczy?” liczone pod innym kluczem – w „Czego używamy” wyszłoby jako nieużywane | P (demo) | ✅4 |
| K4 🆕 | `logic.js:167` `cushionP` | Od poduszki (konta `sav` bez IKE/IKZE + „poduszka”) odejmowane są **wszystkie** cele, także te opłacane z rachunku maklerskiego (`inv`) – a `poolNow` (`actions.js:301`) bierze pieniądze na cele także z kont `inv`. Przykład: oszczędności 10 000 zł, makler 50 000 zł, cel „Auto” 30 000 zł → poduszka 0 miesięcy zamiast ok. 2,5. Wpływa na kartę poduszki, kafelek doradcy, bramkę „z poduszki → nic” w „Gdzie wpłacić” i mail. Tak liczyła też karta przed etapem B, ale teraz jedna funkcja przenosi to wszędzie. | P (skrypt) | **Propozycja S:** odejmować tylko tę część celów, której nie pokrywają konta `inv` bez IKE/IKZE (albo pozwolić przypisać cel do konta). Zmiana sposobu liczenia – decyzja Matiego |
| K5 🆕 | `scripts/market-lib.mjs:61` `dropJumps` | Prawdziwy duży ruch ceny (krach, krypto) jest przyjmowany dopiero, gdy **kolejne** uruchomienie da cenę w ±10% od wstrzymanej. Przy dalszym spadku o > 10% dziennie aplikacja pokazuje starą cenę kilka dni (skrypt: 100 → 50 → 44 → 39 → 38: przyjęte dopiero 38, przez 3 dni widać 100). Dzień bez odpowiedzi źródła kasuje wstrzymanie. Jeśli to okno trafi na koniec miesiąca, jednorazowa wycena `av…` zapisze starą cenę na stałe. Złoto, fundusze TFI/PPK i kursy walut nie są sprawdzane wcale. | P (skrypt) | **Propozycja S:** przyjmować, gdy druga cena z rzędu jest po tej samej stronie progu względem starej (nie ±10% od wstrzymanej); w wycenie końca miesiąca pomijać (odłożyć) konto z ceną „w poczekalni” |
| W12 🔁 | `advisor.js:410`, `market.mjs:108` | termometr w zł nigdy się nie włączy (kursy tylko od dnia startu) – potwierdzone ponownie skryptem; CLAUDE.md opisuje go jako „liczy w zł” | P | decyzja Matiego (dociągnąć historię EUR z NBP – S–M – albo zostać przy euro i poprawić opis) |

## 🟡 Drobne
**Obliczenia i daty**
- 🆕 `today.js:159` `payPatternP` – wypłata zawsze 30. dnia: gdy w 3 ostatnich miesiącach nie było miesiąca 31-dniowego z roboczym 31. (np. 30.09, 30.10 – 31.10 to sobota –, 30.11), wychodzi „koniec miesiąca”: `payDateP(…,'2026-12')` = **31.12** zamiast 30.12 (P). Wypłata dzień za późno w zamknięciu, „Czy starczy?”, „nie starczy”. Propozycja S: szukać dalej wstecz do pierwszego rozstrzygającego miesiąca.
- ✅5 `today.js:215` `typedToday` – pasek zapisany dziś wyciszał przypomnienie; zepsuty `ts` wywracał dzwonek.
- ✅6 `mail-lib.mjs:45` – poduszka w mailu z innego okresu niż w aplikacji.
- 🆕 `advisorui.js:375` `ageOf` – wiek = rok − rok urodzenia, także gdy znana jest pełna data 🎂 (przed urodzinami o rok za dużo; wpływa na emeryturę i IKZE w „Gdzie”) (p). S.
- 🆕 `analysis.js:20,25` – w trwającym miesiącu „W planie zostało” sumuje resztę tylko z pozycji w planie, nie odejmuje przekroczeń innych pozycji (p). S – albo napisać „w pozycjach, które się mieszczą”.
- 🆕 `analysis.js:47` `wealthH` – punkt bieżącego miesiąca liczy saldo do końca miesiąca (z przyszłymi wpisami), a podsumowanie roku do dziś – mogą pokazać różne kwoty (p). S.
- 🆕 `util.js:26` `pnum` – mieszane separatory bez kontroli grup: „1.2.3,5” → 123,50 zł (P). Tylko przy wklejaniu dziwnych napisów. 💡

**Zapis, import, „Cofnij”**
- 🆕 `actions.js:466–477` – ponowne wczytanie pliku ze **starej wersji** aplikacji pomija wpisy, ale znowu nadpisuje plany i salda początkowe z pliku (poprawione po pierwszym wczytaniu wracają) (p). Do tego pytanie mówi „transakcje o tym samym numerze zostaną nadpisane” (w starym formacie są pomijane), a toast „Wczytano N transakcji” liczy też pominięte (P – kod). Rzadkie (stary format). S.
- 🆕 `salary.js:299` „Cofnij” po usunięciu paska, `sheet.js:281` „Cofnij” w `delTx`, `actions.js:236` „Cofnij” w `toggleFixed` – nie sprawdzają „miesiąc ma już nowy pasek tej pensji” (`restoreTx` sprawdza). Okno czasu = widoczny dymek, więc ryzyko małe; strażnik `slip2:` pokaże skutek (p).
- 🆕 `actions.js:122, 128–129` – `toEndOfKind`/`moveAcc` zapisują to samo konto dwa razy (`saveAcc` + `saveOrder`) – wynik dobry, tylko zbędne zapisy 💡.
- 🆕 `app.js:30` – gdy przeglądarka ma `persisted`, a nie ma `persist`, Diagnostyka zostaje na „pamięć telefonu: …” (błąd połknięty) 💡.
- 🆕 `demo/fb-firestore.js:48` – `writeBatch` w atrapie nie jest „wszystko albo nic” dla `update` i `mergeFields` (prawdziwe SDK odrzuca całość). Aplikacja używa dziś tylko `set` z merge, więc ukryte (p). S – dopisać przypadek do `tests/sdk.mjs`.

**Licznik „Czego używamy”**
- ✅4, ✅7 (karta „Czy starczy?”, karta planu doradcy).
- 🆕 `salary.js:72,77` – w widoku roku Pensji tytuły kart to nazwy pracodawców / osób, więc licznik zapisuje je jako karty (`k:<nazwa pracodawcy>`). Szum w statystyce (dokument prywatny, nie wyciek). S: stały tytuł albo pominąć.

**Wygląd, PWA**
- 🆕 `style.css:775` `details.more>summary::after{inset:-13px 0}` – po rozwinięciu niewidoczne pole stuknięcia zachodzi ok. 9 px na treść; stuknięcie w samą górę treści zwija kartę (Termometr, Lista funduszy) 💡 – do sprawdzenia na telefonie.
- 🆕 `index.html:11` (i demo) – `preconnect` do fonts.googleapis.com bez `crossorigin`, a arkusz ma już `crossorigin` – wczesne połączenie się marnuje 💡.
- 🆕 `today.js:218–219` – dwa komentarze do tej samej linijki ryczałtu najmu 💡.

## Zgodność z CLAUDE.md
- **Rozbieżność:** termometr „liczy VWCE w zł” – w praktyce zawsze w euro (W12).
- Zasada modułów, `index.html` = `demo/index.html` (różnice tylko w tytule, `noindex`, ścieżkach, import map), `SHELL`, `BACKUP_KEYS` + `CFG_F`, brak zmian `S.tx` w miejscu – bez uwag.
- 💡 **Zasada „krótsze linie”** (🔁) – nadal niewpisana. Wszystkie trzy błędy etapu B (K1, K2, ✅6) siedziały w długich liniach zmienianych przy porządkach. Proponuję dopisać do CLAUDE.md: „nowy i zmieniany kod – linie ≤ 200 znaków, komentarze `/* */` w środku linii”.

## Sprawdzone bez uwag (kod zmieniony od 22.11)
`fixedDupStop` (restore/Cofnij), `reassignAcc` (wołany dopiero po „Usuń”, `false` = nic), import listy wpisów (pomija istniejące, także usunięte), `putTxs` + `moved`, `saveCfg`/`CFG_F`, `saveOrder`, `pbudH` (zwinięta karta, `esc`), przeładowanie po aktualizacji (`S.slip`/`S.recon`/`S.close`, ponawia co 3 s), `fitNums`, `MKT_DOCS`/`loadThermo`, `catSlot`/`mountCats`, memo `todayItems` i `advTodo` (klucze obejmują wszystko, co czytają; najwyżej 1 min), `isHint`, `pushLive`, `runGo`, q1 → wiek, `whereP` bez mutacji, `bondAfter` = `bondLotValue` (EDO, COI, TOS, ROR, DOR, OTS), `checksP` (`twin:`, `slip2:`, `ref:i:`), PIT-28 na osobę, `yearLastFor`/`editYear`/`yearUndo`, `yearAgoP`/`ytdSpanP` (29.02), `fmtN`, `shortP`, `payDateP`/`closeWinP`/`closeYmP` (poza 30. – wyżej), `personBudP`, `holdAt`/`instValue`/`instDiffP` (partia z przyszłą datą), `bondFee`/`bondMonRate`, `restoreTx`/`slipBack`/`delSlip`, `saveSlip` (ta sama osoba), karta Limity z `sav`, `cascWin`/`cascSurplus`, `saveProj`/`saveRem` (`posOf`), Wrapped/Mati↔Wercia/CSV, „Majątek – teraz”, odbiorcy maili i `send()`, `pushSlot`/`mailPlan`, `keepPrev`, `sw.js`, `.pbcat`/`@container`, `charts.js`.
