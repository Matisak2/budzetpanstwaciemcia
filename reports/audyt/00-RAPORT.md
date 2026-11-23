# Audyt aplikacji Budżet M&W – raport końcowy (23.11.2026)

## 1. Dla Matiego – w skrócie

**Stan aplikacji: dobry, a po audycie lepszy.** Aplikacja jest szybka, także przy 3 latach wpisów. Obliczenia pensji, ZUS, podatków, obligacji i limitów IKE/IKZE na 2026 r. zgadzają się z przepisami. Dane są dobrze chronione przed przypadkowym usunięciem. Wpisanie wydatku zajmuje 4 stuknięcia. Przed audytem wszystkie testy robota były zielone, a mimo to znalazłem **jeden poważny błąd**: od 22.11 nie dało się **wczytać kopii zapasowej** w prawdziwej aplikacji. Robot go nie widział, bo wersja demo „wybaczała” to, czego prawdziwy Firebase nie wybacza. Jest już naprawiony. Naprawiłem jeszcze 13 mniejszych błędów – lista w punkcie 2.

**5 najważniejszych rzeczy do zrobienia:**
1. 🔴 **Zamknij rejestrację nowych kont w Firebase** (2 minuty, tylko Ty możesz to zrobić). Dziś mail z podsumowaniem miesiąca idzie do *każdego* konta logowania. Gdyby ktoś obcy założył konto, 1. dnia miesiąca dostałby Wasze finanse. Instrukcja krok po kroku w punkcie 3.
2. 🟠 **Nie dublować opłat i wpisów przy „Przywróć” / „Cofnij” i ponownym imporcie** – dziś w kilku rzadkich ścieżkach ta sama opłata może się policzyć dwa razy, a usunięte wpisy mogą „wrócić”.
3. 🟠 **Wydatki „co 2 lata” trafiają do planu co roku**, gdy dodasz je albo zmienisz przez „Edytuj”.
4. 🟠 **Termometr rynku w złotych nigdy się nie włączy** na prawdziwych danych (działa tylko w demo). Trzeba albo dociągnąć historię kursów, albo zostać przy euro.
5. 🟡 **Szybsze i wygodniejsze codzienne używanie:** klawiatura otwiera się od razu po ＋ (dziś trzeba stuknąć drugi raz), większe pola do stuknięcia (✓, ⓘ), krótszy ekran Budżetu, szybsze przerysowanie ekranu (jedna mała funkcja zabiera prawie połowę czasu).

**5 rzeczy do uproszczenia albo usunięcia** (tylko propozycje – zdecydujesz po zrzucie „📊 Czego używamy”, a część zmienia Twoje wcześniejsze decyzje):
1. 🧭 **Doradca** – zostawić rdzeń (koło majątku, ankieta i plan, „Gdzie wpłacić”, „W co”). Piaskownicę z listą życzeń, test kryzysów, najem i „Czy stać Was na zakup” schować, a po 3 miesiącach bez użycia usunąć. Doradca to dziś 16% całego kodu.
2. 🗓️ **Zamknięcie miesiąca** – 2 kroki obowiązkowe (salda i plan), reszta jednym „Pomiń resztę”.
3. 👥 **„Czy starczy?”** na Budżecie jako jedna linijka („✅ Wszystkim starczy”), szczegóły po stuknięciu. 🏷️ Projekty z dołu Budżetu do 📌 Stałe.
4. 🖨️ **Podsumowanie roku i 🎁 Money Wrapped** – połączyć w jedną stronę roczną. Dziś pokazują różną „średnią na miesiąc”.
5. 🐾 **Kotki zostają**, ale rysowane raz, jak już na Budżecie. Dziś w Analizie i pustych ekranach rysują się od nowa przy każdym odświeżeniu. Wygląd bez zmian.

**Sztuczna inteligencja:** na razie **nie warto** (szczegóły w `09-ai.md`). Aplikacja już robi regułami to, co AI dałoby najczęściej: podpowiada pozycję po notatce, wykrywa stałe opłaty i nietypowe wydatki. AI oznacza dane finansowe u zewnętrznej firmy, klucz API bez serwera i brak działania offline. Ewentualnie później: komentarz kotków w mailu miesięcznym.

## 2. Co naprawiłem w trakcie audytu (szczegóły w `NAPRAWIONE.md`)
Każda poprawka to kilka linijek i osobny commit. Wszystkie testy robota są zielone, a tam, gdzie się dało, robot dostał nowy test, który łapie dany błąd. Telefony dostały to w 4 wysyłkach (wersje v99–v102).

| # | Co było źle | Gdzie to zobaczysz |
|---|---|---|
| 1 | „Nie starczy na rachunki” nie ostrzegało, gdy brakowało mniej niż potrącenia z paska | 🔔 Na dziś |
| 2 | „Wiem” przy „Nie starczy” wracało 1. dnia miesiąca | 🔔 Na dziś |
| 3 | Przypomnienie „co ile km” po dopisaniu km od razu było „po terminie” | 📅 Roczne i terminy |
| 4 | Automat nie zapisywał cen z ostatniego dnia miesiąca – wycena kont na koniec miesiąca szła z cen z dnia uruchomienia | Oszczędności (wycena) |
| 5 | 🔴 **„Wczytaj kopię (.json)” nie działał** (od 22.11) | ⚙️ Bezpieczeństwo |
| 6 | „📈 Aktualizuj wartości” wyceniało po cenie automatu zamiast wpisanej | Oszczędności |
| 7 | „Rok temu” 28.02 po roku przestępnym pomijało 29.02 | Analiza |
| 8 | „Nie wiem” w ankiecie doradcy dawało „NaN” (piaskownica, plan, mieszkanie, najem) | 🧭 Doradca |
| 9 | Adres …/demo bez ukośnika otwierał prawdziwą aplikację | link do demo |
| 10 | Wyczyszczona marża obligacji wracała z bazy | Instrumenty |
| 11 | Dopisanie starego zakupu cofało cenę instrumentu | Instrumenty |
| 12 | „Policz”, „Analizuj”, „Zapisz” nie działały przy otwartej klawiaturze | 🧭 Doradca, Aktualizuj wartości |
| 13 | Przelew z kaskady miał tytuł „Wypłata…” zamiast „Wpłata” | Zamknięcie, Oszczędności |
| 14 | 3 nieaktualne opisy w przewodniku | ⚙️ → 📖 Pomoc |

Robot sprawdza teraz także pliki automatów (`scripts/`), a demo zachowuje się przy zapisie ustawień jak prawdziwy Firebase.

## 3. Pozostałe błędy 🔴 i 🟠 z dowodami
Pełne opisy z numerami linii: `02-kod.md`, `04-dane-bezpieczenstwo.md`. Pewność: **P** = potwierdzone skryptem lub w demo, **p** = prawdopodobne (z kodu).

### 🔴 R8-1 Mail z podsumowaniem idzie do każdego konta Firebase (P – kod; czy rejestracja jest otwarta, nie widzę)
`scripts/mail.mjs:25–26` – odbiorcy = `getAuth().listUsers(20)` + adresy z `users/{uid}`. Klucz `apiKey` jest publiczny (to normalne), więc przy otwartej rejestracji obcy może założyć konto przez REST API Firebase. Do danych w aplikacji się nie dostanie, bo zatrzymają go zasady Firestore, ale **automat wyśle mu podsumowanie**.

**Co zrobić (Mati, 2 minuty):**
1. Otwórz https://console.firebase.google.com i wybierz projekt **budzet-panstwa-ciemcia**.
2. Po lewej: **Authentication** (Uwierzytelnianie) → zakładka **Settings** (Ustawienia).
3. **User actions** → odznacz **„Enable create (sign-up)”** → **Save**.

Wasze dwa konta działają dalej. Potem w kodzie (S): wysyłać tylko na adresy z `users/{uid}`.

### 🟠 Ważne – do naprawy (wszystkie S, chyba że napisano inaczej)
| # | Miejsce | Problem | Pewność |
|---|---|---|---|
| W8 | `savings.js:267` `editYear` | wydatek „co 2 lata” bez `last` → w planie i kopercie co roku | P |
| W10 | `salary.js:117`, `actions.js:226` | odznacz → odhacz → „Przywróć” = dwa wpisy tej samej opłaty | p |
| W11 | `actions.js:428, 458` | ponowny import listy wpisów / starej wersji wskrzesza usunięte wpisy | p |
| W9 | `actions.js:364` | usuwane konto przepina powiązania przed „Usuń” (Anuluj ich nie cofa) | p |
| W12 | `advisor.js:403`, `market.mjs:103` | termometr w zł nigdy się nie włączy (brak historii kursów) – S–M | P |
| W13 | `advisorui.js:370` | `advTodo` po cichu połyka błędy – przypomnienia doradcy mogą zniknąć | P |
| W14 | `advisorui.js` | doradca liczy wszystko przy każdym przerysowaniu i co minutę | p |
| W15 | `advisor.js:139` | odpowiedź „rok urodzenia” w ankiecie nieużywana (bez 🎂 wiek = 35) | P |
| W16 | `advisor.js:344` | pierwsza duża wpłata bez transz, a przy 1 zł w portfelu – 12 transz (decyzja) | P |
| W17 | `app.js:453` | po aktualizacji przeładowanie może zgubić niezapisany pasek / wyrównanie / zamknięcie | p |
| D3 | `market.mjs:55–100` | brak kontroli „dziwnej” ceny przed jednorazową wyceną końca miesiąca | p |
| Z3 | `pay.js:5,28` | od 1.01.2027 obliczenia pasków biorą limity ZUS i JDG z 2026 – **aktualizacja w styczniu** (lista w `03-przepisy.md`) | P |

## 4. Wszystkie propozycje
Wysiłek: S = godzina, M = dzień, L = kilka dni. Korzyść: ★ mała · ★★ średnia · ★★★ duża.

| Obszar | Problem / pomysł | Waga | Wysiłek | Korzyść | Rekomendacja |
|---|---|---|---|---|---|
| Bezpieczeństwo | R8-1 rejestracja w Firebase + odbiorcy maili | 🔴 | S + 2 min Matiego | ★★★ | **zrobić od razu** |
| Bezpieczeństwo | R8-5 `sendMail` bez try/catch – adresy mogą trafić do publicznego dziennika | 🟡 | S | ★★ | zrobić (etap A) |
| Bezpieczeństwo | R8-7 automaty z sekretami: `npm ci` z lockfile / `--ignore-scripts`, `contents: write` tylko w jednym kroku | 🟡 | S | ★★ | zrobić (A) |
| Bezpieczeństwo | adres Gmail w metadanych commitów → GitHub „Keep my email private” | 🟡 | 2 min Matiego | ★ | zrobić |
| Dane | W10, W11, W9 – dublowanie / wskrzeszanie / przepinanie | 🟠 | S ×3 | ★★★ | A |
| Dane | W17 przeładowanie po aktualizacji | 🟠 | S | ★★ | A |
| Dane | strażnik: 2 żywe wpisy o tym samym id / 2 wpływy z paska w miesiącu | 🟡 | S | ★★ | A |
| Dane | pasek na 2 telefonach offline, przeniesienie wpisu bez `writeBatch` | 🟡 | S–M | ★ | B |
| Obliczenia | W8 „co 2 lata” | 🟠 | S | ★★ | A |
| Obliczenia | `payPatternP` (30. dnia ≠ koniec miesiąca), święta w `payDateP` | 🟡 | S | ★★ | A (święta – decyzja) |
| Obliczenia | `typedToday` po `ts`, PIT-28 klucz na osobę, strażnik `ref:i:` | 🟡 | S | ★ | A |
| Obliczenia | IKE→IKE w limicie, karta Limity z `sav`, `instDiffP` po ostatnim instrumencie, partia z przyszłą datą, kaskada przy wypłacie 1. | 🟡 | S każde | ★ | B |
| Obliczenia | Analiza: przyszły miesiąc „✅ Zmieściło się”, Wrapped z walutami, Mati↔Wercia z projektami, „Majątek – teraz”, dwie średnie | 🟡 | S każde | ★ | B |
| Obliczenia | dzieło bez PIT-2 (Z1), próg najmu dla 2 mieszkań (Z2) | 🟡 | S | ★ | tylko gdy dotyczy |
| Przepisy | aktualizacja na 2027 (ZUS, JDG, zdrowotna) – lista w `03-przepisy.md` | 🟠 | S | ★★★ | **styczeń 2027** |
| Przepisy | `ZUS_LIMIT`/`TAX_THR` jako mapy po roku (jak `JDG[rok]`) | 💡 | S | ★★ | przy aktualizacji |
| Automat | D3 kontrola skoku ceny ±40% | 🟠 | S | ★★ | A |
| Automat | W12 historia kursów dla termometru w zł | 🟠 | S–M | ★ | decyzja (albo EUR) |
| Automat | termometr czytać tylko na ekranie Oszczędności (nie subskrybować) | 💡 | S | ★ | C |
| Doradca | W13 (błędy widoczne), W14 (pamiętanie wyników), W15 (q1), W16 (transze) | 🟠 | S | ★★ | A/C |
| Doradca | drobne R6: brak q43 = 100% akcji, retireP po wieku emerytalnym, „(do założenia)” w grudniu | 🟡 | S | ★ | B |
| Szybkość | `fitNums` bez wymuszania układu w pętli (~40–50% czasu przerysowania) | 🟡 | S | ★★ | C |
| Szybkość | kotki rysowane raz także poza Budżetem | 🟡 | S–M | ★★ | C |
| Szybkość | HELP/NEWS i doradca ładowane na żądanie | 💡 | S–M / M | ★ | C (niski priorytet) |
| UX | fokus kwoty od razu po ＋ (iPhone) | 🟡 | S | ★★★ | D |
| UX | podpowiedź po notatce ustawia też konto | 💡 | S | ★★ | D |
| UX | „Czy starczy?” jako jedna linijka, Projekty z Budżetu do Stałych | 💡 | S | ★★ | D (decyzja) |
| UX | zamknięcie: 2 kroki obowiązkowe + „Pomiń resztę” | 💡 | S | ★★ | D (decyzja U/V) |
| UX | ciche podpowiedzi w Na dziś w zwiniętej grupie „💡 Podpowiedzi” | 💡 | S | ★★ | D |
| UX | cele dotyku ≥ 44 px (✓, ⓘ, summary), `aria-label` przy ✓ ⋯ ✎ | 🟡 | S | ★★ | D |
| UX | Podsumowanie roku + Wrapped w jedną stronę | 💡 | M | ★ | D |
| UX | Doradca: schować D5–D7 (kryzysy, najem, zakup, piaskownica, termometr) | 💡 | S–M | ★★ | po „Czego używamy” |
| UX | JDG / zlecenie / dzieło ukryte za „Inny rodzaj umowy” | 💡 | S | ★ | D (jeśli nie dotyczy) |
| Kod | jedna „poduszka” (app, mail, doradca), mail = aplikacja (sklepy, plan, roczne) | 💡 | M | ★★ | B |
| Kod | wspólne funkcje obligacji (`bondAfter` vs `inv.js`) | 💡 | M | ★ | B |
| Kod | ~50 zbędnych `export`, martwe `ZWROT_PIT`, `curMap`, `outProj`, 6 nadpisanych reguł CSS | 💡 | S | ★ | B |
| Kod | krótsze linie w nowym kodzie (łatwiejsze łączenie z wielu okien) | 💡 | zasada | ★★ | od teraz |
| Testy | test zapisu/usuwania wpisów (saveTx, delTx, Cofnij, zmiana miesiąca) w Playwright | 🟠 | M | ★★★ | B |
| Testy | test na prawdziwym SDK Firebase (`saveCfg`, `merge`, `deleteField`) | 🟠 | S | ★★★ | B |
| Testy | `checksP`, `marketQuote`/`holdAt`/`instDiffP`, daty wypłat, import starych formatów, głębsze `restore.mjs` | 🟡 | S każde | ★★ | B |
| Testy | `screens.mjs` równolegle (4 min → ok. 1,5 min) | 💡 | S | ★★ | B |
| Dane | kwartalne przypomnienie o kopii ze zdjęciami paragonów | 💡 | S | ★ | E |
| Nowe | liczba spraw „Na dziś” na ikonie aplikacji (z porannego powiadomienia, iOS 16.4+) | 💡 | S | ★★ | E |
| Nowe | `navigator.storage.persist()` przy starcie (chroni niewysłane wpisy offline), wynik w Diagnostyce | 💡 | S | ★★ | E |
| Nowe | instrukcja w Pomocy: skrót „＋ wydatek” jako widżet Skrótów na ekranie głównym / blokady | 💡 | S | ★★ | E |
| Nowe | połączenie z bankiem (Enable Banking przez GitHub Actions) / import CSV z banku | 💡 | L | ★ | **nie robić** – zostaje „Rezygnujemy” (`08-porownanie.md`) |
| Nowe | reguły kategoryzacji ustawiane samemu | 💡 | M | ★ | nie teraz (bez importu z banku mało dają) |
| AI | komentarz kotków w mailu (GitHub Actions) | 💡 | S–M | ★ | F – może później |

## 5. Plan wdrożenia (w stylu PLAN.md – do akceptacji, **nie wpisany do PLAN.md**)
Kolejność uwzględnia pracę w kilku oknach. Etapy, które dotykają tych samych plików, robić po kolei w jednym oknie (zaznaczone 🔁).

### Etap A. Pilne błędy (1 okno; pliki: `scripts/mail.mjs`, `scripts/market.mjs`, `actions.js`, `salary.js`, `savings.js`, `app.js`, `today.js`)
- [ ] Mati: zamknięta rejestracja w Firebase; potem maile tylko na adresy z `users/{uid}`, `sendMail` w try/catch
- [ ] Bez dublowania: „Przywróć” / „Cofnij” opłaty stałej, ponowny import listy wpisów, usuwanie konta dopiero po „Usuń”
- [ ] „Co 2 lata” z `last` przy edycji (decyzja: pierwszy termin = najbliższy przyszły miesiąc)
- [ ] Przeładowanie po aktualizacji nie przy otwartym pasku / wyrównaniu / zamknięciu
- [ ] Automat: odrzuca skok ceny > 40% przed wyceną końca miesiąca
- [ ] Drobne daty: wypłata 30. dnia, `typedToday` po `ts`, PIT-28 na osobę, strażnik `ref:i:`, 2 żywe wpisy o tym samym id
- [ ] Automaty: `npm ci`/`--ignore-scripts`, `contents: write` tylko w jednym kroku

**Gotowe, gdy:** każdy punkt ma test w `calc.mjs` albo skrypt w demo, robot zielony.

### Etap B. Porządki i testy (🔁 po A; pliki: `tests/*`, `logic.js`, `scripts/mail-lib.mjs`, `inv.js`, `advisor.js`)
- [ ] Testy: zapis/usuwanie wpisów (Playwright), prawdziwe SDK Firebase, `checksP`, wycena, daty wypłat, import starych formatów, głęboki `restore.mjs`; `screens.mjs` równolegle
- [ ] Jedna „poduszka”, mail liczy jak aplikacja; wspólne funkcje obligacji
- [ ] Drobne 🟡 z Analizy i Oszczędności (lista w `02-kod.md`)
- [ ] Zbędne `export`, martwe stałe, nadpisane reguły CSS

**Gotowe, gdy:** robot ma nowe testy, raporty `02` i `07` odhaczone.

### Etap C. Szybkość (osobne okno możliwe – pliki: `app.js` (tylko `fitNums`), `cats.js`, `art.js`, `analysis.js`, `advisorui.js`)
- [ ] `fitNums` bez wymuszania układu; kotki wszędzie przez `mountCats`; doradca zapamiętuje wyniki (W14); termometr bez subskrypcji

**Gotowe, gdy:** pomiar z `05-szybkosc.md` (Budżet, Analiza) szybszy o min. 30%.

### Etap D. Uproszczenia UX (🔁 po C, bo `app.js`; decyzje Matiego przed startem)
- [ ] Fokus kwoty od razu po ＋; konto z podpowiedzi notatki
- [ ] „Czy starczy?” jako jedna linijka; Projekty do Stałych
- [ ] Zamknięcie: „Pomiń resztę”
- [ ] Na dziś: „💡 Podpowiedzi” zwinięte
- [ ] Cele dotyku ≥ 44 px, `aria-label`
- [ ] (po „Czego używamy”) Doradca: schować/usunąć D5–D7 według użycia; Wrapped + Podsumowanie roku

**Gotowe, gdy:** dodanie wydatku = 3 stuknięcia na iPhonie, Budżet krótszy o min. 1 ekran, Wercia akceptuje wygląd.

### Etap E. Nowe funkcje (tylko wybrane przez Matiego – patrz `08-porownanie.md`)
### Etap F. AI – nie teraz (patrz `09-ai.md`)
### Styczeń 2027 – przepisy (osobno, małe): lista w `03-przepisy.md`

## 6. Pytania do Matiego (decyzje, których nie mogę podjąć sam)
1. **Firebase:** czy możesz wyłączyć rejestrację (instrukcja w p. 3)? I czy na pewno oboje macie w aplikacji dokument `users` – czyli czy każde z Was zalogowało się choć raz na swoim telefonie (wtedy można bezpiecznie zmienić odbiorców maili)?
2. **„📊 Czego używamy”:** zrzut ekranu za 2–3 tygodnie – od tego zależą cięcia w doradcy, zamknięciu i Analizie.
3. **Termometr rynku:** naprawić „w zł” (automat dociągnie historię kursów) czy zostać przy euro? A może schować?
4. **Doradca D5–D7** (kryzysy, najem, „czy stać na zakup”, piaskownica z listą życzeń): czy zgadzasz się je schować teraz i usunąć po 3 miesiącach bez użycia? To zmienia Twoje decyzje z 14.11–22.11.
5. **Zamknięcie miesiąca:** czy kroki 2, 3 i 5 mogą być opcjonalne („Pomiń resztę”)? (zmienia etap U/V)
6. **„Co 2 lata”:** gdy znamy tylko miesiąc, pierwszy termin = najbliższy przyszły taki miesiąc – OK?
7. **Pierwsza duża inwestycja** (W16): czy też ją dzielić na transze, gdy portfel jest pusty?
8. **Wypłata w święto** (np. 1.01 w piątek): czy aplikacja ma się jej spodziewać dzień roboczy wcześniej, tak jak w weekend?
9. **Rodzaje umów:** czy któreś z Was ma JDG, zlecenie albo dzieło? Jeśli nie – schować je w okienku źródła.
10. **Kotki:** zostać przy rysowaniu w kodzie (losowe miny) czy przejść na gotowe obrazki (szybciej, ten sam wygląd, bez losowania)?
11. **Nowe funkcje z porównania** (`08-porownanie.md`): które Cię interesują? „Wczytywanie wyciągów bankowych” jest dziś na liście „Rezygnujemy” – czy to aktualne?

## 7. Mapa raportów
| Plik | Etap |
|---|---|
| `00-przygotowanie.md` | 0 – testy na start, mapa plików |
| `01-funkcje.md` + `zrzuty/` | 1 – spis funkcji, stuknięcia, HELP |
| `02-kod.md` | 2 – przegląd kodu |
| `03-przepisy.md` | 3 – przepisy 2026, lista na styczeń 2027 |
| `04-dane-bezpieczenstwo.md` | 4 – dane, bezpieczeństwo, automaty |
| `05-szybkosc.md` | 5 – pomiary szybkości |
| `06-ux.md` | 6 – sens funkcji, wygoda |
| `07-testy.md` | 7 – luki w testach |
| `08-porownanie.md` | 8 – porównanie z innymi aplikacjami |
| `09-ai.md` | 9 – sztuczna inteligencja |
| `NAPRAWIONE.md` | poprawki z dowodami |
| `POSTEP.md` | postęp pracy |

Raporty są w publicznym repozytorium, tak jak cały kod. Nie zawierają Waszych danych ani adresów e-mail, a zrzuty pochodzą z wersji demo.
