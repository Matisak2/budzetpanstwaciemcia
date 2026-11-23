# Audyt 2 aplikacji Budżet M&W – raport końcowy (23–24.11.2026)

## 1. Dla Matiego – w skrócie

**Stan aplikacji: bardzo dobry.** Od poprzedniego audytu (22.11) zrobiliście z nim etapy A–E: pilne błędy, porządki, nowe testy, szybkość, mniej rzeczy na wierzchu, trwała pamięć i przycisk „Dodaj wydatek”. Robot sprawdza dziś dużo więcej niż przed dwoma dniami: 512 obliczeń, 103 ekrany w 4 ustawieniach telefonu, 14 scenariuszy zapisu i prawdziwy Firebase. Wszystkie testy były zielone na starcie. Ekrany rysują się kilka razy szybciej niż 22.11, także przy 20 tysiącach wpisów.

Mimo to znalazłem **8 błędów i od razu je naprawiłem** (punkt 2). Najważniejszy: po usunięciu ostatniego instrumentu z konta inwestycyjnego „📈 Aktualizuj wartości” **kasował ręcznie wpisaną wartość konta** przy każdym zapisie. Trzy z tych błędów powstały przy porządkach w etapie B. Siedziały w bardzo długich linijkach kodu – dlatego proponuję prostą zasadę na przyszłość (punkt 4, „Kod”).

**5 najważniejszych rzeczy do zrobienia:**
1. 🟠 **Poduszka bezpieczeństwa** odejmuje cele, które leżą na rachunku maklerskim, choć tych pieniędzy w poduszce nie ma. Przy celu „Auto” opłacanym z XTB poduszka może pokazać 0 miesięcy zamiast ok. 2,5. Wpływa to na kartę, doradcę („najpierw poduszka”) i mail. Decyzja: jak liczyć (punkt 7).
2. 🟠 **Automat cen przy krachu** – gdy kurs spada o ponad 40% i dalej szybko się zmienia, aplikacja przez kilka dni pokazuje starą cenę. Jeśli trafi to na koniec miesiąca, wycena miesięczna zapisze starą cenę na stałe. Poprawka jest mała (S).
3. 🟠 **Styczeń 2027 – przepisy:** limit ZUS 300 990 zł, ZUS dla JDG, zdrowotna. Lista „co i gdzie” jest w `03-przepisy.md`; „Na dziś” przypomni o tym samo.
4. 🟡 **Data wypłaty 30. dnia** – po miesiącach, w których 31. wypadał w weekend, aplikacja może uznać, że wypłata jest „na koniec miesiąca”, i spodziewać się jej dzień później (S).
5. 📊 **Zrzut „Czego używamy”** w połowie grudnia. Od dziś licznik poprawnie liczy też „Czy starczy?” i plan doradcy. Od tego zależą cięcia odłożone 23.11.

**5 rzeczy do uproszczenia** (tylko propozycje; część czeka na dane z „Czego używamy”, zgodnie z Twoją decyzją z 23.11):
1. 🧭 Doradca: schować kryzysy, najem, „Czy stać Was na zakup”, piaskownicę i termometr (po danych).
2. 🖨️ Podsumowanie roku + 🎁 Wrapped w jedną stronę roczną (po danych).
3. 🌊 Kaskada nadwyżek tylko w zamknięciu miesiąca. Dziś jest jeszcze karta w Oszczędnościach osoby.
4. 🌡️ Termometr rynku: w złotych nie włączy się nigdy. Albo dociągnąć historię kursów, albo zostać przy euro i to napisać.
5. 👥 „Czy starczy?” po rozwinięciu: lista pozycji osoby pod jeszcze jednym „Szczegóły” (po danych, czy ktoś to rozwija).

**Sztuczna inteligencja:** nadal **nie teraz** (`09-ai.md`). Nowy, darmowy pomysł bez AI: skrót iPhone'a „zdjęcie paragonu → kwota” z rozpoznawaniem tekstu w telefonie.

**Badanie (etap 8):** polskie banki liczą wydatki według kategorii, ale żaden nie robi budżetu dla pary ani „Czy starczy?”. Na iPhonie przytrzymanie ikony aplikacji **nie** pokazuje skrótów, choć obiecywał to przewodnik – poprawione. Import z banku (Enable Banking, CSV) i liczbę na ikonie zostawiłem zgodnie z Twoimi decyzjami („Rezygnujemy”, „na razie nie”).

## 2. Co naprawiłem w trakcie audytu (szczegóły i dowody w `NAPRAWIONE.md`)
Każda poprawka to kilka linijek i osobny commit. Każda ma test robota, który bez poprawki jest czerwony. Telefony dostały je w 3 wysyłkach: **v110, v111 i v112**.

| # | Co było źle | Gdzie to zobaczysz |
|---|---|---|
| 1 | Plan doradcy nie pisał w „dlaczego”, że obciął akcje przez reakcję na spadek | 🧭 Doradca → plan |
| 2 | Rozwinięta osoba w „Czy starczy?” zwijała się po każdym zapisie z drugiego telefonu | Budżet, dół |
| 3 | 🟠 „Aktualizuj wartości” kasowało ręcznie wpisaną wartość konta inwestycyjnego, które nie ma już instrumentów | Oszczędności → 📈 |
| 4 | „Czego używamy” nie liczyło karty „Czy starczy?” (wyszłaby jako nieużywana) | ⚙️ → Pomoc |
| 5 | Zapisanie paska pensji wieczorem wyciszało „Wpiszcie dzisiejsze wydatki”; uszkodzony wpis mógł wywrócić 🔔 | 🔔 / powiadomienie 20:00 |
| 6 | Poduszka w mailu liczona z innych miesięcy niż w aplikacji | mail 1. dnia |
| 7 | „Czego używamy” nie znało karty planu doradcy | ⚙️ → Pomoc |
| 8 | Przewodnik obiecywał skróty po przytrzymaniu ikony – iPhone tego nie umie | ⚙️ → 📖 Pomoc |

## 3. Poprzedni audyt w skrócie (szczegóły w `00-poprzedni.md`)
- ✅ **zrobione:** wszystkie poprawki w trakcie (14), wszystkie 🔴/🟠 poza dwiema decyzjami, cały plan A–E (poza punktami odrzuconymi), 10 luk w testach, prawie wszystkie 🟡.
- ❌ **odrzucone przez Ciebie (23.11):** fokus kwoty po ＋, konto z podpowiedzi notatki, „Pomiń resztę” w zamknięciu, VoiceOver, liczba na ikonie, przenosiny Projektów.
- 💤 **nieaktualne:** adres Gmail w autorach commitów (nowe commity mają inny adres), pytanie o kotki „kod czy obrazki” (rysowanie już szybkie), reguły kategoryzacji (bez importu nie mają sensu).
- ⏳ **otwarte, przeniesione tutaj:**
  - decyzje: W12 termometr w zł, W16 transze przy pustym portfelu, święta w dacie wypłaty, JDG/zlecenie/dzieło (Z1);
  - drobne: Z2 próg najmu przy 2 mieszkaniach, OKI powyżej 100 tys. zł;
  - zostawione świadomie: IKE→IKE w limicie, `putTx` zawsze „ok”, pasek offline na 2 telefonach, usuwanie konta używanego tylko w 🗑️;
  - automaty: R8-10 (3 drobne);
  - termin styczeń 2027: Z3 + lista przepisów;
  - po danych z „Czego używamy”: Doradca D5–D7, Wrapped + Podsumowanie roku;
  - bez decyzji: kaskada w 2 miejscach, kalkulator obligacji zwinięty, HELP/NEWS ładowane na żądanie, kopia ze zdjęciami co kwartał, lupa z sumą, komentarz kotków w mailu (AI);
  - zasada „krótsze linie”, brakujące testy przepisów.

## 4. Pozostałe błędy 🔴 i 🟠 z dowodami
🔴: **brak.** Pewność: **P** = potwierdzone skryptem albo w demo.

| # | Miejsce | Problem | Dowód | 🆕/🔁 |
|---|---|---|---|---|
| K4 | `js/logic.js:167` `cushionP` | od poduszki (konta `sav` + „poduszka”) odejmowane są wszystkie cele, także te opłacane z kont `inv` (`poolNow` w `actions.js:301` bierze na cele także `inv`) | P: oszczędności 10 000 zł, makler 50 000 zł, cel 30 000 zł → poduszka 0 mies. zamiast ok. 2,5 | 🆕 |
| K5 | `scripts/market-lib.mjs:61` `dropJumps`, `market.mjs:94–101` | prawdziwy ruch > 40% przyjmowany dopiero, gdy kolejna cena jest w ±10% od wstrzymanej. Przy krachu stara cena wisi kilka dni, a dzień bez odpowiedzi źródła zeruje oczekiwanie. Wycena końca miesiąca (`av…`, raz) może utrwalić starą cenę. Złoto, fundusze TFI/PPK i kursy bez kontroli | P: ceny 100 → 50 → 44 → 39 → 38: przez 3 dni 100, przyjęte dopiero 38 | 🆕 |
| W12 | `js/advisor.js:410`, `scripts/market.mjs:108` | termometr w zł nigdy się nie włączy: kursy są tylko od dnia startu, a ceny z 5 lat; CLAUDE.md opisuje go jako „w zł” | P (skrypt) | 🔁 |
| Z3 | `js/pay.js:5, 27–28` | od 1.01.2027 paski liczą limit ZUS i JDG według 2026 | P | 🔁 (termin: styczeń) |

## 5. Wszystkie propozycje (bez zrobionych i odrzuconych)
Wysiłek: S = godzina, M = dzień. Korzyść: ★ mała · ★★ średnia · ★★★ duża.

| Obszar | Problem / pomysł | 🆕/🔁 | Waga | Wysiłek | Korzyść | Rekomendacja |
|---|---|---|---|---|---|---|
| Obliczenia | K4 poduszka a cele na rachunku maklerskim | 🆕 | 🟠 | S | ★★★ | A (decyzja: jak liczyć) |
| Automat | K5 krach: przyjmować drugą cenę po tej samej stronie progu; w wycenie końca miesiąca odłożyć konto z ceną „w poczekalni”; kontrola złota i funduszy | 🆕 | 🟠 | S | ★★ | A |
| Przepisy | Z3 + lista na 2027 (`03-przepisy.md`), `ZUS_LIMIT`/`TAX_THR` jako mapy po roku | 🔁 | 🟠 | S | ★★★ | **styczeń 2027** |
| Automat | W12 termometr: historia EUR z NBP albo „w euro” w opisie | 🔁 | 🟠 | S–M / S | ★ | decyzja |
| Daty | `payPatternP` – wypłata 30. bez rozstrzygającego miesiąca → 31. | 🆕 | 🟡 | S | ★★ | A |
| Daty | święta w `payDateP` (np. 1.01 w piątek) | 🔁 | 🟡 | S | ★ | decyzja |
| Doradca | W16 transze przy pustym portfelu | 🔁 | 🟡 | S | ★ | decyzja |
| Doradca | `ageOf` – wiek z samego roku, także przy znanej dacie 🎂 | 🆕 | 🟡 | S | ★ | B |
| Analiza | „W planie zostało” w trwającym miesiącu nie odejmuje przekroczeń; `wealthH` z przyszłymi wpisami ≠ podsumowanie roku | 🆕 | 🟡 | S | ★ | B |
| Import | stara wersja wczytana drugi raz nadpisuje plany i salda początkowe; teksty „nadpisane” / „Wczytano N” niezgodne z działaniem | 🆕 | 🟡 | S | ★ | B |
| Zapis | „Cofnij” po usunięciu paska / w `delTx` / w `toggleFixed` bez sprawdzenia „jest już nowy pasek” | 🆕 | 🟡 | S | ★ | B |
| Zapis | podwójne zapisy przy przesuwaniu kont; Diagnostyka „pamięć: …” bez `persist` | 🆕 | 💡 | S | ★ | B |
| Przepisy | Z1 dzieło z PIT-2; Z2 próg najmu dla 2 mieszkań; OKI > 100 tys. zł | 🔁 | 🟡 | S | ★ | tylko gdy dotyczy |
| Automaty | B1 `--ignore-scripts` przy Playwright w kroku z kopią; B2 usuwanie kopii przy czerwonym teście; R8-10 (pushlog, `sched`, adres kopii) | 🆕/🔁 | 🟡 | S | ★ | B |
| Licznik | karty Pensji (rok) zapisują nazwy pracodawców jako „karty” | 🆕 | 🟡 | S | ★ | B |
| Testy | 7 luk z `07-testy.md` (automat kilka dni, poduszka, przepisy, Cofnij paska, 30. dnia, `writeBatch` atrapy, licznik kart) | 🆕/🔁 | 🟡 | S każdy | ★★ | B |
| Testy | `eq` w `calc.mjs` łapie wyjątek i pokazuje nazwę testu | 🆕 | 💡 | S | ★ | B |
| Kod | **zasada w CLAUDE.md: nowy/zmieniany kod – linie ≤ 200 znaków, komentarze w środku linii tylko `/* */`** (3 błędy etapu B były w długich liniach) | 🔁 | 💡 | – | ★★ | od teraz |
| Wygląd | `details.more` – niewidoczne pole zachodzi 9 px na treść; `preconnect` bez `crossorigin`; zdublowany komentarz | 🆕 | 💡 | S | ★ | B |
| Pomoc | HELP: Diagnostyka / trwała pamięć, przywracanie celów, kolory pór roku, kaskada | 🔁 | 🟡 | S | ★ | B |
| Szybkość | Oszczędności: zapamiętać `agg` i `instDiffP` (−20% przy dużych danych) | 🆕 | 💡 | S | ★ | C (niski) |
| Szybkość | HELP/NEWS i doradca na żądanie (−100 kB) | 🔁 | 💡 | S–M | ★ | C (niski) |
| Szybkość | `market/maillog`, `autoval` bez stałej subskrypcji | 🆕 | 💡 | S | ★ | C (niski) |
| UX | kaskada tylko w zamknięciu; kalkulator obligacji i porady zwinięte; JDG za „Inny rodzaj umowy” | 🔁 | 💡 | S | ★★ | D (decyzja) |
| UX | „Czy starczy?” – pozycje pod „Szczegóły”; pusty stan Projektów = sam przycisk | 🆕 | 💡 | S | ★ | D (po danych) |
| UX | Doradca D5–D7, Wrapped + Podsumowanie roku | 🔁 | 💡 | S–M / M | ★★ | po „Czego używamy” |
| Nowe | lupa 🔍 z sumą znalezionych i zakresem dat | 🔁 | 💡 | S | ★★ | E |
| Nowe | instrukcja skrótu „paragon → kwota” (Live Text, bez AI) | 🆕 | 💡 | S | ★ | E (po teście widżetu) |
| Nowe | kopia ze zdjęciami co kwartał w „Na dziś” | 🔁 | 💡 | S | ★ | E |
| AI | komentarz kotków w mailu (GitHub Actions) | 🔁 | 💡 | S–M | ★ | F – może później |

## 6. Plan wdrożenia (do akceptacji – **nie wpisany do PLAN.md**)
Etapy, które dotykają tych samych plików, robić po kolei w jednym oknie (🔁). Każdy dopiero na Twoją komendę, po kopii.

### Etap A2. Pieniądze i automat (1 okno; pliki: `logic.js`, `scripts/market-lib.mjs`, `scripts/market.mjs`, `today.js`, `tests/calc.mjs`)
- [ ] Poduszka bez celów opłacanych z kont inwestycyjnych (po Twojej decyzji)
- [ ] Automat: krach – cena przyjmowana po dwóch odczytach po tej samej stronie progu; wycena końca miesiąca nie z ceny „w poczekalni”; kontrola złota i funduszy
- [ ] Wypłata 30. dnia: szukanie dalej wstecz
**Gotowe, gdy:** każdy punkt ma test w `calc.mjs`, robot zielony.

### Etap B2. Drobne poprawki i testy (🔁 po A2; pliki: `advisorui.js`, `analysis.js`, `actions.js`, `salary.js`, `sheet.js`, `usage.js`, `guide.js`, `style.css`, `index.html` + demo, `.github/workflows/mail.yml`, `scripts/notify.mjs`, `scripts/mail.mjs`, `tests/*`)
- [ ] `ageOf` z pełnej daty; „W planie zostało”; `wealthH`; import starej wersji (plany, salda, teksty); „Cofnij” paska; podwójne zapisy kont; Diagnostyka bez `persist`
- [ ] Automaty: `--ignore-scripts`, `trap rm`, pushlog przed pętlą, `sched`, adres kopii z `lock`
- [ ] Licznik: karty Pensji bez nazw pracodawców; test „każda karta ma klucz z katalogu”
- [ ] Testy przepisów (KUP 300, zlecenie 50%, najem 12,5%, IKZE-JDG, wykup COI/ROR/DOR), `writeBatch` atrapy, `eq` z wyjątkiem
- [ ] HELP: Diagnostyka, przywracanie celów, kaskada; drobiazgi CSS (`details.more`, `preconnect`)
- [ ] Zasada „krótkie linie” w CLAUDE.md
**Gotowe, gdy:** raporty `02` i `07` odhaczone, robot zielony.

### Etap C2. Szybkość (niski priorytet, osobne okno możliwe; `savings.js`, `app.js`, `guide.js`)
- [ ] `agg`/`instDiffP` zapamiętane; HELP/NEWS na żądanie; `maillog`/`autoval` bez subskrypcji
**Gotowe, gdy:** Oszczędności przy 20 tys. wpisów < 70 ms (CPU 4×).

### Etap D2. Uproszczenia (decyzje przed startem; 🔁 po B2, bo `app.js`, `advisorui.js`)
- [ ] Kaskada tylko w zamknięciu; kalkulator obligacji i porady zwinięte; JDG/zlecenie/dzieło za „Inny rodzaj umowy” (jeśli nikt nie ma)
- [ ] **(po „Czego używamy”, połowa grudnia)** Doradca D5–D7; Wrapped + Podsumowanie roku; „Czy starczy?” – pozycje pod „Szczegóły”
**Gotowe, gdy:** Wercia akceptuje wygląd, Budżet nie dłuższy niż dziś.

### Etap E2. Nowe (tylko wybrane)
- [ ] Lupa z sumą; instrukcja „paragon → kwota”; kopia ze zdjęciami co kwartał

### Etap F. AI – nie teraz (`09-ai.md`)

### Styczeń 2027 – przepisy (osobno, małe; lista w `03-przepisy.md`)
- [ ] `ZUS_LIMIT` 300 990 zł, JDG 2027 (pełny 6 019,80; preferencyjny 1 485,00; zdrowotna min. 445,50 od lutego), ryczałt – zdrowotna (komunikat ZUS ok. 20.01), `linLimit` (obwieszczenie MF), `RULES_YEAR`, oczekiwane liczby w testach

## 7. Pytania do Matiego (bez pytań, na które już odpowiedziałeś)
1. **Poduszka (K4):** czy cel opłacany z rachunku maklerskiego (np. XTB) ma zmniejszać poduszkę? Proponuję: nie – poduszka odejmuje tylko cele, których nie pokrywają konta inwestycyjne.
2. **„📊 Czego używamy”:** zrzut ekranu w połowie grudnia (⚙️ → 📖 Pomoc → 📊 Czego używamy).
3. **Termometr rynku:** dociągnąć historię kursów i liczyć w zł, zostać przy euro (i poprawić opis), czy schować?
4. **Transze:** czy pierwszą dużą wpłatę przy pustym portfelu też dzielić na transze?
5. **Wypłata w święto** (np. 1.01 w piątek): spodziewać się jej dzień roboczy wcześniej, jak w weekend?
6. **Rodzaje umów:** czy któreś z Was ma JDG, zlecenie albo dzieło? Jeśli nie – schować je w okienku źródła.
7. **Kaskada nadwyżek:** czy wystarczy w zamknięciu miesiąca (bez osobnej karty w Oszczędnościach)?
8. **Na telefonie (1 minuta):** czy widżet „Dodaj wydatek” otwiera okienko wydatku? (Skrót otwiera Safari – trzeba być tam zalogowanym.)

## 8. Mapa raportów
| Plik | Etap |
|---|---|
| `00-poprzedni.md` | 0 – rozliczenie poprzedniego audytu |
| `00-przygotowanie.md` | 0 – testy na start, mapa plików |
| `01-funkcje.md` | 1 – spis funkcji, stuknięcia, HELP |
| `02-kod.md` | 2 – przegląd kodu |
| `03-przepisy.md` | 3 – przepisy, lista na styczeń 2027 |
| `04-dane-bezpieczenstwo.md` | 4 – dane, bezpieczeństwo, automaty |
| `05-szybkosc.md` | 5 – pomiary |
| `06-ux.md` | 6 – wygoda |
| `07-testy.md` | 7 – luki w testach |
| `08-porownanie.md` | 8 – banki, Enable Banking, eksport, PWA na iOS |
| `09-ai.md` | 9 – sztuczna inteligencja |
| `NAPRAWIONE.md` | 8 poprawek z dowodami |
| `POSTEP.md` | postęp pracy |

Poprzedni raport (`reports/audyt/`) usunięty po przeniesieniu otwartych spraw – zostaje w historii git (commit sprzed usunięcia: `bf70a19`). Raporty są w publicznym repozytorium, tak jak cały kod. Nie zawierają Waszych danych ani adresów e-mail; liczby pochodzą z wersji demo.
