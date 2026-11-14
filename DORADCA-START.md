# 🧭 Doradca – instrukcja dla nowego okna Claude (czytaj w całości przed pracą)

Ten plik zastępuje długie rozmowy z 13–14.11.2026, w których powstał plan (także drugą rozmowę 14.11 o nieruchomościach, klasach aktywów i ankiecie – decyzje 10–20, oraz trzecią – decyzje 21–25). **Stan: D1a, D1b, D2 i D3 zrobione 14.11 (`advisor.js`, `advisorui.js`; następny D4 – na komendę; Mati i Wercia wypełnili ankiety); Mati chce po każdym etapie pytania „czy robić następny”. Decyzje 25–26: własne mieszkanie osobno, poza proporcjami; wszystkie etapy jednego dnia, jeden po drugim (każdy osobno testowany i wysyłany).** Nowe okno nie zna tej rozmowy – wszystko, co potrzebne, jest tutaj i w plikach wymienionych niżej.

## 1. Zanim cokolwiek zrobisz
1. `git pull origin main`, `git log -5` (zasady wielu okien z `CLAUDE.md`).
2. Przeczytaj w tej kolejności:
   - `CLAUDE.md` (architektura, zasady pracy – obowiązują w całości),
   - **`DORADCA-plan.md`** – plan; **punkt 0 „Decyzje Matiego” jest nadrzędny** wobec reszty tekstu,
   - `PLAN.md` → „Część 8 – Doradca” (co już odhaczone),
   - `DORADCA-notatki.md` – wiedza merytoryczna (liczby, zasady kont, przykłady do testów). Czytaj sekcje potrzebne w danym etapie; przy liczbach do testów – zawsze stąd, nie z pamięci.
3. Ustal, który etap jest następny (pierwszy nieodhaczony D1a, D1b, D2…D7 w `PLAN.md`). **Etap zaczynasz dopiero na wyraźną komendę Matiego** („zrób D1a” itp.). Przed etapem poproś o kopię (⚙️ → Pobierz kopię).
4. Przed etapem napisz Matiemu krótko (po polsku, prosto) plan etapu: co zobaczy w aplikacji, gdzie; poczekaj na „ok”, jeśli coś jest niejasne.

## 2. Najważniejsze decyzje (skrót punktu 0 planu)
- **PPK nie istnieje dla doradcy**: nie liczyć w kole, w proporcjach, w bramkach, w ankiecie, w celach. Konta z `wrap:'ppk'` pomijać.
- Broker: **XTB** – prowizja 0, **0,5% marży przy wymianie walut**, ułamki jednostek, brak walut na rachunku. Stawki trzymać jako dane z datą „stan na”.
- OKI (od 1.01.2027): poduszka, wkład własny, polskie aktywa; zagraniczne ETF-y najpierw IKE/IKZE.
- IKZE wg progu: 0% – nie; 12% – najpierw IKE; 32% – najpierw IKZE; liniowy/ryczałt – liczyć.
- Doradca **nie prognozuje**; „czy warto kupić” = czego brakuje względem planu. Termometr tylko informuje (transze, własne reguły na spadki).
- Mieszkanie: cel odkładania + wartość w majątku (ręcznie, raz na 1–3 lata).
- Piaskownica (pojedyncze akcje/tematy) do 10% części długoterminowej.
- **Koło** (wykres kołowy) w Inwestycjach z widełkami planu; **kotki** przy kole podpowiadają wyrównanie.
- Lista ETF-ów Matiego: punkt 13 planu (7 funduszy z XTB; ALLW usunięty). Każdy instrument spoza listy: po wpisaniu zakupu sam trafia do śledzenia i analizy. ISIN-y i koszty z tabeli **sprawdź u dostawcy** przed wpisaniem do kodu (wpisz datę sprawdzenia); jeśli sieć nie pozwala – zapytaj Matiego o zgodę na dodanie hosta (narzędzia środowiska) albo zostaw pole „do sprawdzenia”.
- Ankieta: każda osoba na swoim telefonie (`S.who`); tryb „wspólnie” łączy.
- **Decyzje 21–26 (trzecia rozmowa 14.11):** D1 dzielone na D1a / D1b; pod kołem paski „jest / ma być” z widełkami (D2); szczegółowa ankieta zostaje, ale jej wynik = prosty plan, po D2 przegląd licznika „Czego używamy”; ETF-y przepisane ze zrzutów XTB (punkt 13, VWCE 0,14%, VFEA 0,17%); dostęp do stron dostawców – Mati się zgadza; 25: własne mieszkanie osobno jako „🏡 Nasz dom (nie zarabia)” – w majątku, **bez proporcji** (zastępuje 15); ALLW usunięty z listy (7 ETF-ów); 26: etapy jeden po drugim tego samego dnia.
- **Uzupełnienie 14.11 (decyzje 10–14):** nieobowiązkowe „🏠 Dodaj nieruchomość” (wartość, mieszkamy/wynajem, czynsz, kredyt) – na kole (punkt 15 planu); koło przyjmuje **każdy rodzaj aktywa** + własne klasy i „＋ Dodaj inne aktywo” (punkt 14); proporcje całego majątku (np. 50% nieruchomości / 50% aktywa) – sugestia zakupu tylko, gdy stać (15.4); **doradcą są kotki**; ankieta rozbudowana do ok. 64 pytań warunkowych (4.1). Decyzje 15–16: własne mieszkanie liczy się do wartości i proporcji, ale „nie zarabia”; jeden główny wykres nieruchomości / aktywa, stuknięcie = szczegóły. Decyzje 17–20: przechył w stronę nieruchomości dozwolony (kotki sprawdzają, czy stać na zakup, i podsuwają); udział % właścicieli (Wspólne 50/50, widok „Ja” = swój udział wartości i kredytu); ankieta najpierw tylko u Matiego; pytanie-bramka przed każdym działem („nie chcę” = doradca tego nie proponuje).

**Uwaga przy czytaniu planu:** punkty 1–9 planu pisane były przed decyzjami; gdzie mówią inaczej (PPK, „nieruchomość tylko jako cel”, „dwa pierścienie koła”), obowiązuje punkt 0 (decyzje 1–20) oraz punkty 14–15.

## 2a. Co dokładnie wchodzi w D1 (zebrane z całego planu) – **D1a = punkty 1, 2, 4 (koło kont i instrumentów), 5, 6; D1b = punkt 3 + główny wykres 🏠 / 📈 i widok Ja / Wspólnie z udziałami**
1. Klasy i grupy aktywów z punktu 14 (wbudowane w `advisor.js`) + „＋ Własna klasa” (`assetCls`) + pole `cls` w `hold` i `accsM` (puste = domyślne z `kind` / listy ETF-ów; ETF spoza listy = „do przypisania”, kotki pytają).
2. Lista 7 ETF-ów Matiego (punkt 13) z danymi i datą sprawdzenia; karta analizy instrumentu (kryteria, dublowanie „całych światów”, flagi). Nowy instrument spoza listy – śledzony automatycznie (automat już pobiera ceny po tickerze).
3. „＋ Dodaj inne aktywo” i „🏠 Dodaj nieruchomość” (`assetM`, punkty 14 i 15.1): wartość z datą, mieszkamy / wynajem / puste, czynsz (połączenie z `fixedM.najem`), kredyt z 🔻, właściciel + udział % (decyzja 18). Nie zmieniają sald, Budżetu ani `savFlow`; w 👛 Konta linijka obok zobowiązań.
4. Jeden główny wykres 🏠 / 📈 w 💰 Majątku → Oszczędności, stuknięcie = szczegóły (decyzja 16); PPK pominięte; widok Ja (swój udział) / Wspólnie.
5. Bez ankiety, widełek i porad – to D2+. Bez sugestii zakupu – to D5.
6. Jak każdy etap: `BACKUP_KEYS` + `restore.mjs`, `CACHE`, `NEWS`/`HELP`, `USAGE_CAT`, `SCREENS`, dane w `demo/demo.js` (przykładowa nieruchomość i inne aktywo), testy liczbowe w `calc.mjs`.

## 3. Jak pracować przy każdym etapie (z `CLAUDE.md`, w skrócie)
- Kod: czyste obliczenia w nowym `js/advisor.js` (bez importu UI; testowalne), interfejs w `js/advisorui.js`; nowe pliki do `SHELL` w `sw.js`; zasada modułów (na górze pliku tylko deklaracje, start w `wire…()`); funkcje z `onclick` wystawić na `window` na końcu `app.js`.
- Dane nowe, nigdy nie zmieniać starych wpisów; nowe ustawienia w `households/main` (np. `advM`, `advW`, `advLog`, `brok`, `assetCls`) → dopisać do `BACKUP_KEYS` i do porównań w `tests/restore.mjs`.
- Wykorzystać istniejące: `pay.js` (próg, ulga dla młodych), `inv.js` (`LIMITS`, `BONDS`, `bondYears`, `OKI_*`, `wrapOf`, `holdAt`, FIRE), `logic.js` (salda, `savFlow`), `isPod` (poduszka), `debts`/`rataP`, automat `market.mjs` (ceny posiadanych instrumentów już są).
- Każdy etap: `CACHE` +1 w `sw.js`, wpis na początku `NEWS` i w `HELP` (`guide.js`), `USAGE_CAT`, nowy ekran w `SCREENS` (`tests/screens.mjs`), dane przykładowe w `demo/demo.js`, okienko transakcji tylko gdy trzeba (wtedy oba `index.html`), wygląd: pastele, Nunito, zaokrąglenia, jedna przewijana kartka w okienkach.
- Testy przed wysyłką (lokalnie, jak w `CLAUDE.md` → Testowanie): eslint, `node --check`, `tests/calc.mjs` (dopisz przykłady liczbowe z `DORADCA-notatki.md`, policzone niezależnie), `tests/cache.mjs`, `tests/imports.mjs`, `tests/screens.mjs`.
- Po etapie: odhacz w `PLAN.md`, dopisz krótko do `CLAUDE.md` (architektura: co robi `advisor.js` itd.), commit z opisem dla innych okien, `git pull --no-rebase`, push na `main`, napisz Matiemu prosto, co sprawdzić w telefonie.

## 4. Kolejność etapów (punkt 10 planu)
D1a klasy aktywów + lista ETF-ów z analizą + auto-śledzenie + koło „jak jest” → D1b nieruchomości i inne aktywa, główny wykres → D2 ankieta, plan, widełki, kotki przy kole, diagnoza → D3 „gdzie” → D4 „w co” (XTB, transze, zapis porady) → D5 cele (emerytura, mieszkanie, test kryzysu, koszty) → D6 termometr, reguły na spadki, „Na dziś” → D7 piaskownica.

## 5. Czego nie robić
- Nie zaczynać etapu bez komendy Matiego. Nie robić kilku etapów naraz, jeśli Mati nie powie.
- Nie ruszać PPK. Nie pokazywać prognoz analityków. Nie polecać funduszy aktywnych, tematycznych, z dźwignią, CFD, polis inwestycyjnych.
- Nie zaszywać na sztywno rankingów brokerów ani stawek bez daty „stan na”.
- Nie wpisywać adresów e-mail do kodu (repo publiczne).
