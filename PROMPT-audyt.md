# Pełny audyt aplikacji „Budżet M&W”

Zrób pełny, uczciwy audyt naszej aplikacji budżetowej: przejrzyj każdy ekran, funkcję, moduł i plik. Nie szukasz pochwał – szukasz błędów, rzeczy zbędnych, przekombinowanych i brakujących. Cel: perfekcyjna, wielofunkcyjna, szybka i prosta w codziennym użyciu aplikacja budżetowa dla dwojga.

**To jest audyt, a nie przebudowa.** Prawdziwych danych w Firebase nie dotykasz nigdy. Wolno Ci:
- czytać wszystko, uruchamiać testy, wersję demo i własne skrypty pomiarowe (w katalogu tymczasowym, nie w repo),
- zapisywać raporty w `reports/audyt/` (commit + push na `main` według zasad z `CLAUDE.md`: przed push `git pull --no-rebase origin main`),
- **od razu naprawiać oczywiste drobne błędy** – ale tylko takie, które spełniają WSZYSTKIE warunki:
  - to na pewno błąd (odtworzony testem albo w demo), a nie kwestia gustu czy innego pomysłu na działanie,
  - poprawka jest mała (kilka linijek), naprawia tylko ten błąd i nie zmienia niczego innego w działaniu ani wyglądzie,
  - nie zmienia modelu danych, nie usuwa funkcji, nie przestawia ekranów, nie zmienia zasad obliczeń podatków/ZUS/obligacji,
  - przechodzą wszystkie testy z `CLAUDE.md` uruchomione lokalnie; gdy się da, dopisz test, który ten błąd łapie.

  Każda poprawka to osobny commit z jasnym opisem („Audyt: naprawa – …”). Przy wysyłce zmian w plikach aplikacji podbij `CACHE` w `sw.js` (raz na push). Każdą poprawkę wpisz do `reports/audyt/NAPRAWIONE.md` (co było źle, dowód, co zmienione, commit).
- **Wszystko inne tylko proponujesz** – większe błędy, porządki w kodzie, przyspieszenia, uproszczenia, usunięcia, nowe funkcje. Bez zgody Matiego tego nie zmieniasz. Masz wątpliwość, czy coś jest „oczywiste i drobne” → nie naprawiaj, opisz w raporcie.

## Kontekst
- Najpierw przeczytaj `CLAUDE.md` (architektura, model danych, zasady), `PLAN.md`, `DORADCA-START.md`, `DORADCA-stan.md`, a w razie potrzeby `PLAN-archiwum.md` i `DORADCA-plan.md` (tam są decyzje Matiego). Zrób `git pull origin main` i przeczytaj `git log -20`.
- Właściciel (Mati) jest lekarzem i nie programuje. Z aplikacji korzystają codziennie dwie osoby (Mati i Wercia) na iPhone'ach, jako PWA. Ważna jest estetyka: delikatne pastele, zaokrąglenia, Nunito, kotki Bailey i Ivo.
- Kod to ok. 1,2 MB w długich liniach – **nie czytaj go „na raz”**, czytaj modułami i fragmentami.
- **Nic nie jest święte** – możesz zaproponować uproszczenie albo usunięcie czegokolwiek (także kotków, Doradcy, zamknięcia miesiąca, ciekawostek), jeśli uczciwie uważasz, że tak będzie lepiej. Ale to tylko propozycja – decyzję podejmuje Mati.
- W kodzie i planach są zapisane wcześniejsze decyzje (notatki typu „Mati 13.11”, „decyzja 25”). Gdy proponujesz coś, co je zmienia, napisz to wprost i podaj powód.
- Pytania kieruj tylko do Matiego.

## Sposób pracy (żeby nic nie umknęło i żebyś się nie przeciążył)
1. Pracuj **etapami, po kolei**. Każdy etap kończy się zapisanym plikiem `reports/audyt/NN-nazwa.md` i aktualizacją `reports/audyt/POSTEP.md` (co zrobione, co dalej, lista przejrzanych plików z odhaczeniem). Commit i push po każdym etapie.
2. Jeśli kontekst się zapełni albo sesja się przerwie – wznów od `POSTEP.md`, nie zaczynaj od nowa.
3. Do przeglądu wielu modułów naraz możesz użyć podagentów (każdy dostaje 1–3 pliki i listę rzeczy do sprawdzenia z etapu 2). **Każde ich zgłoszenie sprawdź sam w kodzie**, zanim trafi do raportu.
4. Każde zgłoszenie musi mieć: miejsce (`plik:linia` albo ekran), opis, dowód (fragment kodu, wynik testu, zrzut ekranu, kroki odtworzenia), wagę i pewność:
   - waga: 🔴 krytyczne (utrata/zła wartość pieniędzy, dane, bezpieczeństwo) · 🟠 ważne · 🟡 drobne · 💡 pomysł,
   - pewność: **potwierdzone** (odtworzone testem / w demo) · **prawdopodobne** · **do sprawdzenia**.
   Błąd w obliczeniach potwierdzaj małym skryptem Node wołającym funkcję z `js/` (moduły są czyste) albo w demo przez Playwright – nie zgaduj.
5. Wysiłek każdej propozycji oceń: S (godzina), M (dzień), L (kilka dni).

## Etapy

**Etap 0 – Przygotowanie.** Uruchom wszystkie testy z sekcji „Testowanie” w `CLAUDE.md` i zapisz wynik (punkt odniesienia). Zrób mapę plików: rozmiar, za co odpowiada, kto go importuje. Utwórz `POSTEP.md`.

**Etap 1 – Spis wszystkich funkcji (co aplikacja w ogóle umie).** Uruchom wersję demo w Playwright (telefon, np. iPhone 13) i przejdź każdą zakładkę, każde okienko, każdy przycisk, każdą stronę ⚙️, Doradcę, zamknięcie miesiąca, „Na dziś”. Zrób zrzuty. Dla każdej funkcji jedna linijka: co robi, gdzie jest, ile kliknięć od Budżetu. Porównaj z `HELP` w `guide.js` i z `CLAUDE.md` – czego brakuje w opisie, a co jest opisane, a nie istnieje.

**Etap 2 – Przegląd kodu moduł po module.** Kolejno: `util, data, pay, inv, logic, today, close` → `core, sheet, actions, app` → `salary, savings, debts, analysis, todayui, usage, report` → `advisor, advisorui` → `guide, facts, cats, art, charts` → `style.css, index.html, demo/`, `sw.js`, `manifest.json`. W każdym szukaj:
- błędów logicznych, przypadków brzegowych (koniec miesiąca, 29 lutego, zmiana czasu, strefa czasowa / `toISOString`, ujemne kwoty, grosze i zaokrąglenia, inne waluty, puste dane, usunięte konta/pozycje, wpisy `deleted`),
- martwego kodu: funkcje/eksporty/klasy CSS/klucze `localStorage`/pola danych, których nic nie używa; pozostałości po usuniętych funkcjach (np. stary moduł `inv`, `recon`, kalendarz),
- powtórzeń (ta sama logika napisana 2× – zwłaszcza między aplikacją a `scripts/`), funkcji za długich lub o niejasnych nazwach,
- niezgodności z zasadami z `CLAUDE.md` (np. zmiana wpisów w miejscu, kod wykonywany przy starcie poza `wire…()`, `index.html` ≠ `demo/index.html`),
- miejsc, gdzie `CLAUDE.md` opisuje coś inaczej, niż działa kod.

**Etap 3 – Poprawność pieniędzy i przepisów (2026).** Sprawdź z oficjalnymi źródłami (gov.pl, ZUS, podatki.gov.pl, obligacjeskarbowe.pl, NBP – podaj linki): pasek pensji (UoP, zlecenie, dzieło, JDG liniowy/ryczałt, PPK, ulga dla młodych, KUP, progi), Belka, obligacje (EDO, COI, ROR/DOR, opłata za wcześniejszy wykup), limity IKE/IKZE/OKI, ryczałt od najmu, raty równe/malejące. Do każdej reguły: czy kod jest zgodny, czy test w `tests/calc.mjs` to pokrywa. Co się zmieni w 2027 i co trzeba będzie zaktualizować (lista „na styczeń”).

**Etap 4 – Dane, bezpieczeństwo i niezawodność.** Ryzyko utraty danych: dwa telefony naraz, tryb offline, konflikty zapisu, import kopii, kopia mailowa i jej test (`tests/restore.mjs`), migracje. Reguły Firestore (`firebase/`), co jest w publicznym repo (sekrety, dane osobowe, e-maile), XSS (wstawianie tekstu użytkownika do HTML), zdjęcia paragonów, service worker (czy telefon może utknąć na starej wersji), automaty w `.github/workflows` i `scripts/` (co, jeśli źródło danych padnie).

**Etap 5 – Szybkość.** Zmierz, nie zgaduj (Playwright: czas do pierwszego ekranu, czas `render` na dużych danych – wygeneruj np. 3 lata wpisów w demo, liczba odczytów Firestore przy starcie, rozmiar pobieranych plików, pamięć). Wskaż konkretne wąskie gardła (np. `guide.js` i `facts.js` ładowane przy starcie, przerysowywanie całego ekranu, ciężkie rysunki kotków) i oszacuj zysk każdej poprawki. Bez build stepu i frameworków – propozycje muszą pasować do tej architektury (lub uczciwie uzasadnij, czemu warto ją zmienić).

**Etap 6 – Sens funkcji i wygoda (UX).** Dla każdej funkcji z etapu 1: ✅ zostaje · ✂️ uprościć · 🔀 połączyć z inną · 🗑️ usunąć · 📦 schować głębiej. Kryteria: jak często będzie używana przez dwie zwykłe osoby, ile kosztuje utrzymanie kodu, czy dubluje inną. Poproś Matiego o zrzut ⚙️ → 📖 Pomoc → „📊 Czego używamy” (prawdziwe dane użycia są tylko w Firebase) i uwzględnij go. Sprawdź też: szybkość dodania wydatku (liczba stuknięć), czytelność na małym ekranie, dostępność (kontrast pasteli, wielkość przycisków, VoiceOver), spójność tekstów i kotków, przeładowanie Budżetu i „Na dziś”.

**Etap 7 – Testy.** Czego testy nie pokrywają (najważniejsze obliczenia i ekrany bez testu), które testy są kruche lub wolne. Lista brakujących testów w kolejności ważności.

**Etap 8 – Porównanie z najlepszymi (badanie w internecie).** Do tego etapu użyj skilla `deep-research`. Porównaj z: YNAB, Monarch Money, Copilot Money, Actual Budget, Goodbudget, Spendee, Wallet (BudgetBakers), Money Manager, polskie aplikacje banków i agregatory (np. Kontomierz/Finanteq, Revolut Budget). Tabela: funkcja → czy mamy → czy warto dla nas. Szczególnie: import wyciągów z banku (CSV/MT940 z polskich banków, PSD2/open banking – realne dla prywatnej aplikacji?), reguły automatycznej kategoryzacji, współdzielenie kosztów, prognozy, widżety iOS, cele.

**Etap 9 – Sztuczna inteligencja: czy i gdzie ma sens.** Oceń sam, bez entuzjazmu na zapas. Kandydaci: odczyt paragonu ze zdjęcia, podpowiedź pozycji z notatki/sklepu, pytania zwykłym językiem („ile wydaliśmy na jedzenie w wakacje?”), komentarz kotków do miesiąca w mailu, wykrywanie nietypowych wydatków, pomoc w zamknięciu miesiąca, import wyciągu PDF. Dla każdego: realna korzyść, czy da się to zrobić bez AI prostą regułą (często tak – wtedy to lepsze), koszt miesięczny, prywatność (dane finansowe idą do zewnętrznej firmy), **gdzie trzymać klucz API** (aplikacja nie ma serwera, repo jest publiczne – klucza nie wolno dać do przeglądarki; opcje: Firebase Functions / AI Logic, GitHub Actions jak przy mailach, Cloudflare Worker), działanie offline. Werdykt: robić / może później / nie robić.

**Etap 10 – Raport końcowy (`reports/audyt/00-RAPORT.md`).**
1. Podsumowanie dla Matiego po polsku, prosto, bez żargonu (1 strona): stan aplikacji, 5 najważniejszych rzeczy do zrobienia, 5 rzeczy do usunięcia/uproszczenia.
2. Co już naprawiłeś w trakcie audytu (skrót z `NAPRAWIONE.md`) – tak, żeby Mati wiedział, co się zmieniło w aplikacji.
3. Wszystkie pozostałe 🔴 i 🟠 błędy z dowodami.
4. Tabela wszystkich propozycji: obszar · problem/pomysł · waga · wysiłek · korzyść · rekomendacja.
5. Plan wdrożenia w etapach w stylu `PLAN.md` (A: pilne błędy, B: porządki w kodzie, C: szybkość, D: uproszczenia UX, E: nowe funkcje, F: AI) – każdy etap mały, z kryterium „gotowe”, z kolejnością uwzględniającą pracę w wielu oknach (które etapy dotykają tych samych plików).
6. Lista otwartych pytań do Matiego (decyzje, których nie możesz podjąć sam).

Nie dopisuj etapów do `PLAN.md` – to zrobimy po przeczytaniu raportu. Na koniec napisz w czacie krótko, po polsku, co znalazłeś, co już naprawiłeś i gdzie jest raport.
