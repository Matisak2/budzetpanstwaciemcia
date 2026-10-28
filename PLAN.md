# Plan rozwoju Budżetu M&W

Uzgodniony z Matim w październiku 2026. Etapy robimy po kolei; **każdy kolejny etap zaczynamy dopiero na komendę Matiego**.
Przed etapem: Mati pobiera kopię (⚙️ → Pobierz kopię). Dane nigdy nie znikają (migracje zamiast kasowania). Każdy etap = osobny push na `main`.
Strona z planem dla Werci: https://claude.ai/artifact/LxDu6XeH9GH9F1VSK3sSJL

## Etap 1. Poprawki i porządki
- [x] Kwoty z kropką przy tysiącach (`1.234,56`) zapisywały się jako 1,23 zł
- [x] Wczytanie pełnej kopii kasowało `savTarget` i flagi migracji (kopia zawiera teraz `savTarget`)
- [x] Usunięcie pensji w Rejestrze zostawiało wpłaty PPK (teraz usuwa je razem, „Cofnij” przywraca)
- [x] Strzałki w widoku „Rok” przeskakiwały na styczeń
- [x] Import listy transakcji bez `id` dublował wpisy (teraz `id` z treści wiersza)
- [x] `sw.js`: błąd przy zapisie plików do cache; wszystkie pliki aplikacji w kopii offline
- [x] Sprawdzić z Matim w konsoli Firebase: wyłączone zakładanie nowych kont (Authentication → Settings)
- [x] Podział aplikacji na pliki (`index.html`, `style.css`, `js/*.js`)
- [x] Usunięty stary moduł inwestycji (zostaje lista „Starsze wpisy” z możliwością usunięcia)
- [x] Stały kolor każdej kategorii (`hue`), wybór koloru w edycji kategorii
- [x] Ten plan w repozytorium

## Etap 2. Wpisywanie transakcji
- [x] Nowy wybór pozycji: wyszukiwarka, „Ostatnio używane”, kafelki kategorii, podpowiedź po notatce (np. „Biedronka” → Zakupy spożywcze)
- [x] Liczenie w polu kwoty (przyciski + i − przy kwocie) (`12+8,50`)
- [x] Dzielenie paragonu na kilka pozycji
- [x] Pole „Kto” ustawia się samo według właściciela konta
- [x] ↩️ Oznacz zwrot (pełny/częściowy): zmniejsza wydatek w tej samej pozycji, nie zawyża przychodów; w Rejestrze „zwrócono X z Y zł”
- [x] Pozycja „Zwroty” → „Zwrot podatku (PIT) i inne zwroty urzędowe”

## Etap 3. Wygląd, czytelność, konta osób
- [x] Kategoria z ikonką i kolorem w Rejestrze
- [x] Paski budżetu: puste pole = 0 zł, pastelowe kolory stanów, „zostało / przekroczono o”, pozycje bez planu przygaszone ale widoczne (BEZ kreski „gdzie powinniśmy być dziś”)
- [x] Ten sam kolor kategorii wszędzie (Budżet, Rejestr, Analiza, filtry)
- [x] Lżejszy, spójny wygląd: jednakowe ramki/zaokrąglenia/odstępy, cieńsze paski, mocniejsze liczby, odstęp legendy w wykresie pierścieniowym
- [x] Większe drobne napisy (min. 12–13 px)
- [x] Filtr na Budżecie: Wszystko / Przekroczone / Bez planu
- [x] Szukanie po kwocie: `>200`, `<50`, `100-300`
- [x] Przycisk + jako koło – Mati wybrał: zostaje zaokrąglony kwadrat
- [x] Kolejność kont: strzałki ↑ ↓ w ⚙️ (w obrębie rodzaju konta)
- [x] Konta w ⚙️ w zakładkach: Konta bieżące / Subkonta / Oszczędności / Inwestycje; po zmianie rodzaju konto przechodzi na koniec nowej zakładki
- [x] Majątek według osób w 👛 Konta: pasek Mati / Wercia / Wspólne, przełącznik, rozbicie (bieżące, subkonta, oszczędności, inwestycje, zobowiązania); stuknięcie kafelka „Na kontach” na Budżecie pokazuje podział
- [x] Nowy rodzaj konta „Subkonto” (właściciel Mati / Wercia / Wspólne); „Subkonto Zwierzaki” i „Dzieciaczki” → subkonta wspólne; subkonta pokazywane osobno (nie wliczane do poduszki ani oszczędności)
- [x] Pełna edycja każdego konta: nazwa, rodzaj, właściciel, saldo początkowe (pole „waluta” dochodzi w etapie 6)

## Etap 4. Bailey i Ivo (przewodnicy)
- Bailey (kotka, ur. 13.10.2025): ragdoll, biała z kremowym grzbietem, ciemnobrązowe uszy, brązowa łata na połowie pyszczka i czoła, niebieskie oczy, duży ciemnobrązowy ogon, dostojna mina. Kocha churu INABA i spanie pod kocem. Rola: spokojna strażniczka oszczędności (rachunki, plan, poduszka, terminy).
- Ivo (kocur, ur. 16.03.2026): prawie biały, morelowo-różowe uszy, kremowe cieniowanie na czole, niebieskie oczy, ogon z kremową końcówką, lekko naburmuszona mina. Śpi we wrzosach, kocha piłeczki z dzwoneczkiem, naśladuje Bailey. Rola: wesoły łasuch i mistrz świętowania (cele, drobne, konfetti, podsumowania).
- Oba: wskakują do kartonów, bawią się w kociego berka. Zwracają się do Matiego i Werci po imieniu.
- [x] Styl B (bardziej realistyczny, zaakceptowany): 5 póz (siedzi, leży, tyłem, śpi pod kocem, wygląda z kartonu) × 6 min × 13 dodatków → 31 gotowych scen w `js/cats.js`. Pierwotnie: ok. 40 póz z „klocków” (pozy + miny + dodatki + stroje sezonowe), wiernie według zdjęć; m.in. parapet tyłem, balon „1”, za kierownicą, na stosie kartek, we wrzosach, za liściem, naburmuszony Ivo, koc, karton, piłeczka, churu, berek, skarbonka, moneta, dzwoneczek, lupa, kalkulator, koperta, puchar, tort, czapeczki; dodatki sezonowe (zima, wiosna, lato, jesień, święta, walentynki, Halloween)
- [x] Miejsca: powitanie, pierwsze kroki, „Co nowego” po każdym etapie, puste ekrany, ładowanie, „Na dziś”, podsumowania, delikatne ostrzeżenia, objaśnienia ⓘ
- [x] Ok. 100 komunikatów (`js/guide.js`) (urodziny, święta, żarty przy smaczkach dla kotów)
- [x] Najwyżej jeden dymek na ekran; ustawienie „Kotki: dużo / mało / wyłączone”

## Etap 5. Drobne
- [x] Reguły w ⚙️: z jakiego konta, na jakie, zaokrąglenie do 5 albo 10 zł, mnożnik ×1/×2/×3/×4/×5/×10, ☑️ „pełne drobne przy równej kwocie” (np. 15,00 zł → 5 zł × mnożnik); kilka reguł
- [x] Przy wydatku z konta z regułą: złota moneta 🪙 z wyliczoną kwotą, **domyślnie zaznaczona**
- [x] Zapis jako przelew „🪙 drobne”; po edycji lub usunięciu wydatku drobne zostają bez zmian; liczone od dnia włączenia
- (Revolut Matiego: zaokrąglenie do 5 zł, ×2, pełne drobne włączone)

## Etap 6. Waluty
- [x] Każda waluta z tabeli NBP (EUR, USD, GBP i inne)
- [x] Każde konto i transakcja w swojej walucie, **bez przeliczania na zł**
- [x] Sumy osobno dla każdej waluty; w budżecie „wydano 820 zł + 45 €”, plan w zł
- [x] Wymiana walut = przelew z dwiema kwotami, kurs sam w notatce; płatność kartą złotówkową za granicą: kwota w zł, kurs w notatce

## Etap 7. Pensje
- [x] Osobne listy źródeł dochodu Matiego i Werci, kilku pracodawców, każde źródło z kontem wpływu
- [x] Rodzaje: umowa o pracę, zlecenie, dzieło, kontrakt/JDG (faktura, ZUS własny, zdrowotna, forma podatku, rezerwa na podatek i ZUS, przypomnienie o płatnościach)
- [x] Pasek: składniki, ZUS, zdrowotna, zaliczka, PPK (moje/pracodawca), potrącenia, netto; „Skopiuj z poprzedniego miesiąca”, „Podpowiedz z brutto” (szacunek), sprawdzanie rachunku, opcjonalne godziny → stawka za godzinę
- [x] Potrącenia trafiają do budżetu w swoich podkategoriach z notatką; przychód w budżecie = netto + potrącenia; PPK na konto PPK; ZUS/zdrowotna/podatek tylko w pasku
- [x] Suma miesiąca i podsumowanie roku (do PIT-11)

## Etap 8. Oszczędności i inwestycje
- [x] Grupy kont z sumami, „🐷 Odłóż”, stały przelew na oszczędności w 📌 Stałe
- [x] Aktualizacja wartości wszystkich kont na jednym ekranie
- [x] Instrumenty na kontach: ETF, akcje, obligacje (zasady wg typu EDO/COI/TOS/ROS/ROD/OTS/DOR, edytowalne), złoto, krypto, lokaty; zysk z ceny, zysk z kursu, „na rękę” po Belce; wpisywane ręcznie
- [x] Automat na GitHubie (Actions, za darmo): codziennie kursy i inflacja do Firestore; raz w miesiącu szuka nowych limitów i pyta przed zmianą (`.github/workflows/market.yml`, `scripts/market.mjs`; działa po dodaniu sekretu `FIREBASE_SA` – instrukcja niżej)

### 🤖 Włączenie automatu (jednorazowo)
1. Firebase → ⚙️ Ustawienia projektu → Konta usługi → „Wygeneruj nowy klucz prywatny” → pobierze się plik `.json`.
2. GitHub → repozytorium → Settings → Secrets and variables → Actions → „New repository secret”: nazwa `FIREBASE_SA`, wartość = cała zawartość pliku `.json`.
3. GitHub → Actions → „Automat – kursy i ceny” → „Run workflow”. Zielony ✓ = działa. Potem plik `.json` usuń z urządzenia.
4. GitHub wyłącza zaplanowane automaty w repozytoriach bez zmian przez 60 dni – wtedy wystarczy kliknąć „Enable workflow” w zakładce Actions.
- [x] Przypomnienia o wykupie obligacji
- [x] Limity IKE, IKZE i OKI (od 1.01.2027): wpłaty liczone same, styczeń – nowe limity, grudzień – IKZE, OKI – szacunek podatku od aktywów
- [x] Wykres „wpłacone a wartość” (pole zielone/różowe, 3 mies./rok/wszystko, całość/osoba/konto/instrument, osobno dla każdej waluty)
- [x] Wydatki roczne: jedno wspólne subkonto z kopertami, ile odkładać co miesiąc, przypomnienie miesiąc wcześniej, linijka na Budżecie
- [x] Poduszka bezpieczeństwa i FIRE

## Etap 9. Zobowiązania i należności
- [x] W 👛 Konta: „🔻 my winni” i „🔺 nam winni”
- [x] Kategoria, od kogo/komu, warunki, kto spłaca, pasek spłaty, szacowany koniec, termin zwrotu; kredyt bankowy – wpisywane „pozostało”, pożyczka prywatna liczy się sama
- [x] Raty łączą się z zobowiązaniem (kategoria w Budżecie zostaje prawdziwa); „Udzielone pożyczki” → należności

## Etap 10. Planowanie
- [x] „Do zaplanowania” i podpowiedź planu (średnia z 3 mies.) z „Wypełnij średnimi”
- [x] Projekty i etykiety: stałe (auto, koty, mieszkanie) liczą się do budżetu, jednorazowe (wyjazd, remont) domyślnie poza; opcjonalny budżet z paskiem
- [x] Pojazd: litry i stan licznika przy tankowaniu, spalanie, zł/km, struktura kosztów; kilka aut
- [x] 🔔 Przypomnienia w 📌 Stałe (OC, przegląd, opony, serwis co X km, szczepienia kotów)
- [x] Anomalie i automatyczna sezonowość (po roku danych)
- [x] Kaskada nadwyżek: tylko propozycja, osobno Mati / Wercia / Wspólne; źródło: konta bieżące bez subkont, zapas 0 zł (do zmiany); cel: tylko oszczędności i inwestycje

## Etap 11. Analiza
- [x] Przełącznik „Podstawowa | Pełna” (tylko w Analizie, domyślnie Pełna)
- [x] Podsumowanie miesiąca (zmieściło się / przekroczone / mniej / poza planem)
- [x] Mati ↔ Wercia, wykres majątku, kategorie przez 12 mies., Sankey
- [x] Inflacja osobista: kategorie rok do roku + „Wasza inflacja” obok GUS
- [x] Eksport do Excela, Money Wrapped

## Etap 12. Okno „Na dziś”
- [x] Opłaty, pensje, przypomnienie po 20:00 (gdy danego dnia nic nie wpisano), wydatki roczne, auto, należności, obligacje, limity, kopia – tylko w aplikacji, bez kalendarza

# Część 2 – automatyzacja, wygoda i wersja demo (uzgodnione z Matim)
Zasady jak dotąd: każdy etap osobno, kopia przed etapem, start tylko na komendę Matiego, dane nigdy nie znikają. Wszystko w darmowych limitach (GitHub Actions w publicznym repo bez limitu minut, Firestore Spark, Gmail).

## Etap A. Automat bez przerw, prawdziwe powiadomienia, strażnik porządku
- [x] Ochrona przed wyłączeniem automatu po 60 dniach: raz w miesiącu automat dopisuje mały plik z datą (zeruje licznik GitHuba)
- [x] Gdy automat kilka dni roboczych nic nie pobierze → powiadomienie „🤖 Automat nie działa” z przyciskiem do GitHuba
- [x] Prawdziwe powiadomienia (Web Push) na iPhone'ach obojga (aplikacja na ekranie głównym, iOS 16.4+): ⚙️ „Włącz powiadomienia” na każdym telefonie; klucze generuje automat sam (bez nowych sekretów)
- [x] Rano ok. 7:30 „🔔 Na dziś” (tylko gdy coś czeka), wieczorem ok. 20:00 tylko gdy danego dnia nic nie wpisano; najwyżej 2 dziennie; stuknięcie otwiera właściwe miejsce (godziny mogą się spóźnić do ok. 40 min – ograniczenie GitHuba)
- [x] Wspólne sprawy (opłaty, wydatki roczne, auto, kopia, strażnik) do obojga; osobiste (pasek pensji, IKZE, JDG) tylko do właściciela
- [x] Telefon z włączonymi powiadomieniami nie pokazuje już okienek „Na dziś” ani dymka o 20:00 (dzwonek 🔔 zostaje); pilne sprawy w małym pasku na górze Budżetu; gdy powiadomienia przestaną działać (albo stanie automat) – okienka wracają same, a ⚙️ podpowiada „Włącz ponownie”
- [x] Logika „Na dziś” w osobnym pliku, wspólnym dla aplikacji i automatu
- [x] Strażnik porządku co tydzień: zdublowane wpisy, wpisy bez pozycji, ujemne saldo konta bieżącego, niezgodne paski pensji – w „Na dziś” i w porannym powiadomieniu; sam niczego nie zmienia

## Etap B. Maile: kopia zapasowa i podsumowanie miesiąca
- [x] Wysyłka z Gmaila Matiego (weryfikacja dwuetapowa włączona → „hasło do aplikacji” w sekretach GitHuba; poprowadzić krok po kroku)
- [x] Adresy odbiorców = adresy logowania z Firebase (automat odczytuje je sam); aplikacja zapamiętuje, który adres to Mati, a który Wercia
- [x] Kopia zapasowa **raz w miesiącu** (pierwsza niedziela miesiąca ok. 21:00), spakowana, **tylko do Matiego**; wczytuje się przez ⚙️ „Wczytaj kopię”; nigdy do repozytorium
- [x] Podsumowanie miesiąca 1. dnia miesiąca **do obojga**: plan a wydatki, przekroczone, odłożone – pastelowo, z kotkami

## Etap C. Inwestycje i opłaty – automatycznie
- [x] Obligacje dokładnie: historia inflacji miesiąc po miesiącu, rok odsetkowy = marża + inflacja z miesiąca 2 miesiące przed jego początkiem (EDO, COI, ROS, ROD); próba pobrania inflacji z GUS (zapasowo Eurostat); oprocentowanie każdego roku można poprawić ręcznie; podpowiedź oprocentowania nowej serii
- [x] PPK i fundusze TFI: przy koncie wybór instytucji i funduszu z listy (do wyboru, bo jeszcze nie wiadomo), wpisuje się liczbę jednostek, automat codziennie pobiera wycenę jednostki
- [x] Wycena kont z instrumentami sama na koniec miesiąca (wpis „(automat)”, przy weekendzie w pierwszy dzień roboczy z datą ostatniego dnia miesiąca; można usunąć w Rejestrze)
- [x] Wykrywanie stałych opłat spoza 📌 Stałe: podobna kwota i notatka 3 miesiące z rzędu → „Dodać do opłat stałych?”

## Etap D. Wygoda na co dzień
- [x] Siri / Skróty na iPhone'ach: „Hej Siri, wydatek” otwiera okienko nowego wydatku; skróty z gotową kwotą i notatką (adres z parametrami); instrukcja krok po kroku
- [x] Skróty na ikonie aplikacji (przytrzymanie ikony: ➕ Wydatek, 🔔 Na dziś, 📊 Budżet – na iPhonie mogą się nie pokazać, wtedy zostaje Siri)
- [x] „Kto co zmienił”: przy każdym wpisie zapisuje się, z czyjego telefonu dodano / zmieniono; widać po otwarciu wpisu i na liście ostatnich zmian w ⚙️ (nie w wierszach Rejestru)
- [x] Gwarancje: przy zakupie od 300 zł pytanie o gwarancję (domyślnie 2 lata – rękojmia); przypomnienie miesiąc przed końcem; lista „co ma jeszcze gwarancję”
- [x] Pomocnik PIT osobno dla Matiego i Werci: oznaczanie wydatków „do ulgi” z prostymi objaśnieniami każdej ulgi (co to, kto może, ile – jako podpowiedź, nie porada podatkowa); w styczniu zestawienie z sumami do zeznania

## Etap E. Wygląd i ergonomia
- [x] „Zapisz” przyklejony na dole okienka transakcji + „Zapisz i dodaj kolejny”
- [x] Przytrzymanie wpisu w Rejestrze: 📋 Duplikuj, ↩️ Zwrot, 🗑️ Usuń
- [x] Przesunięcie palcem w lewo / prawo zmienia miesiąc
- [x] Budżet krótszy: w kategorii tylko pozycje z planem lub wydatkami, pod nimi „＋ N pustych pozycji ›”; puste kategorie zebrane na dole w jednej linijce; filtr „Bez planu” pokazuje wszystko
- [x] Mniej zakładek: Budżet · Rejestr · Stałe · Majątek (Oszczędności + Konta z przełącznikiem) · Analiza dostępna z Budżetu (📊); przycisk ➕ zostaje tam, gdzie jest teraz (zaokrąglony kwadrat)
- [x] Lupa 🔍 w nagłówku: jedno wyszukiwanie po wpisach, pozycjach, kontach i instrumentach
- [x] Większe liczby, krótsze opisy, szczegóły pod „więcej ›”
- [x] ⚙️ „🎨 Wygląd” na każdym telefonie: kolor akcentu (pastelowe kółka; na start Wercia różowy, Mati miętowy) i rozmiar tekstu A / A+ / A++
- [x] Płynniejsze przejścia (paski „rosną”, szkic ekranu zamiast „Wczytywanie…”)
- [x] Większe pola do stukania (małe przyciski „Edytuj”, „⋯”)

## Etap F. Wersja demonstracyjna
- [x] Osobny link `…/budzetpanstwaciemcia/demo/` do wysłania znajomym; bez połączenia z Firebase i bez dostępu do Waszych danych
- [x] Na starcie „Jak masz na imię?” – imię oglądającego; druga osoba wymyślona (losowe imię, można zmienić)
- [x] Wymyślone dane z całego roku (pensje, zakupy, opłaty, konta, ETF, obligacje, kredyt, cele, auto); zmiany tylko w przeglądarce oglądającego, przycisk „Zacznij od nowa”; pasek „Wersja demonstracyjna – dane są wymyślone”
- [x] Imiona Mati / Wercia wyciągnięte z kodu do ustawień (w Waszej aplikacji bez zmian)

# Część 3 – po przeglądzie aplikacji (uzgodnione z Matim 25.10.2026)
Zasady jak dotąd. Mati wybrał: wszystko poniżej. Odrzucone: notatka do miesiąca. Na później: nowe świąteczne sceny kotków (lampki, bombka, choinka, prezenty, Sylwester).

## Etap G. Robot i zasady dostępu
- [x] 🤖 Robot na GitHubie (`.github/workflows/test.yml`, `tests/`): po każdej zmianie eslint (brakujące importy), składnia, wersja demo w niewidocznej przeglądarce – wszystkie ekrany w 4 ustawieniach telefonu (320/360/390 px, A/A+/A++), błędy JavaScript, napisy poza ekranem, okienko transakcji takie samo w `index.html` i `demo/index.html`; zrzuty ekranów przy błędzie
- [x] Publikacja dopiero po zielonym sprawdzeniu – Mati przełączył 25.10.2026: Settings → Pages → Source → „GitHub Actions” (sprawdzone: robot publikuje sam)
- [x] Kopia zasad dostępu Firebase w `firebase/` (bez adresów e-mail – repozytorium jest publiczne)

## Etap H. Poprawki z przeglądu ekranów
- [x] Średnie „/mies.” w Analizie → Rok liczone tylko z miesięcy z wpisami
- [x] Tabela „Miesiąc po miesiącu” mieści się na wąskim telefonie z dużym tekstem
- [x] ⚙️ „Kto korzysta z tego telefonu?” – przyciski na całą szerokość
- [x] „+ Przelew” i filtr „▲ Przekroczone” w jednej linijce; pełna podpowiedź w szukaniu Rejestru
- [x] Kolor akcentu telefonu także w ramce pola i podpowiedziach okienka transakcji
- [x] Jedna ikonka 👛 dla „Konta”; jednakowe przyciski propozycji „Dodać do opłat stałych?”; „+ …” zawsze wielką literą
- [x] Kwoty od 1000 zł zawsze z odstępem („5 449,18 zł”)
- [x] Drobiazgi: „✓ wszystko wpłynęło”, napis o strzałkach tylko gdy są strzałki, jeden kolor pasków „z”, kotek przy pustych Pensjach, procent przy „Pozostałe”, napisy w „Przepływie pieniędzy” nie nachodzą na siebie, „✎ Limity” obok tytułu
- [x] Nowy wpis na telefonie bez historii – konto osoby telefonu
- [x] Oko Bailey na brązowej łacie widoczne przy uśmiechu

## Etap I. Bezpieczeństwo i dyskrecja
- [x] 🗑️ ⚙️ „Ostatnio usunięte” – usunięte wpisy z przyciskiem „Przywróć”
- [x] 🙈 Tryb dyskretny – kwoty jako „•••” (stuknięcie w nagłówku / ⚙️)
- [x] 🚫 Bez przybliżania podwójnym stuknięciem (prośba Matiego): `*{touch-action:manipulation}` + w `app.js` drugie szybkie stuknięcie zatrzymane, przycisk dostaje kliknięcie; dwa palce dalej przybliżają

## Etap J. Umowy, koszty roczne, sklepy
- [x] „Umowa do…” przy opłacie stałej – przypomnienie 2 miesiące przed końcem (w „Na dziś” i w powiadomieniu)
- [x] 📌 Stałe: ile opłaty stałe kosztują rocznie (w tym subskrypcje)
- [x] 🏪 „Gdzie wydajemy” w Analizie – sklepy i miejsca z notatek (miesiąc i rok)

## Etap K. Zdjęcia paragonów
- [x] 📷 Zdjęcie paragonu / gwarancji przy wpisie: zmniejszone w telefonie (~100 KB), w bazie Firebase w darmowym limicie, wczytywane dopiero po stuknięciu; licznik miejsca w ⚙️; „Pobierz kopię ze zdjęciami”; bez zdjęć w mailu z kopią

## Etap L. Porządek w kodzie
- [x] `js/app.js` podzielony na mniejsze pliki (bez zmian na ekranie), sprawdzony przez robota

## Etap M. Ulepszenia po części 3 (uzgodnione 25.10.2026)
- [x] 🤖 Robot liczy na przykładach (`tests/calc.mjs`): pensje, obligacje i Belka, raty, salda, budżet, drobne, zapis kwot
- [x] ✍️ Podpowiadanie notatki przy wpisywaniu (te same nazwy sklepów → lepsze „Gdzie wydajemy”)
- [x] 📷 Przy gwarancji podpowiedź o zdjęciu paragonu; na liście gwarancji widać, co ma zdjęcie
- [x] 🙈 Szybkie włączanie trybu dyskretnego – przytrzymanie nazwy miesiąca
- [x] 🔍 Świeży przegląd wszystkich ekranów i poprawki (przyciski w kolorze telefonu, „Przelane”, pusta karta „My winni”, średnia przy „Zostało w roku”, „% planu” bez łamania)

## Etap N. Pewność i szybkość (uzgodnione 25.10.2026)
- [x] 👯 Ostrzeżenie przed podwójnym wpisem (ta sama kwota, ±1 dzień, ta sama notatka / pozycja)
- [x] 💾 Co miesiąc robot sprawdza, czy kopia z maila się wczytuje (wpisy, konta, salda – tylko liczby w dzienniku); przy każdej zmianie to samo na danych demo
- [x] 🧾 Przypomnienie w styczniu o zasadach pensji na nowy rok (`RULES_YEAR` w `pay.js`)
- [x] 🤖 Robot sprawdza też prawdziwą stronę startową (logowanie, pusty budżet) i powiązania między plikami
- [x] ⚡ Szybkość przy wielu latach danych: zamiast wczytywać tylko 2 lata (zepsułoby salda i kopie) – zapamiętane obliczenia (salda, miesiące, lista wpisów); 18 000 wpisów: Ustawienia 471 → 45 ms, Analiza roku 273 → 72 ms, Budżet 81 → 12 ms
- [ ] Kopia zapasowa także do Werci – na razie nie (decyzja Matiego)

# Część 4 – po analizie przydatności (uzgodnione z Matim 25.10.2026)
Zasady jak dotąd: każdy etap osobno, kopia przed etapem, start tylko na komendę Matiego, dane nigdy nie znikają. Kolejność: Q → O → P → R (pensje gotowe przed pierwszą listopadową wypłatą).

## Etap Q. Pensje i przychody
- [x] Pasek z kwoty netto: „Podpowiedz z netto” – kwota na konto → orientacyjnie brutto, ZUS, zdrowotna, podatek, PPK (PPK do odhaczenia); oznaczone jako szacunek
- [x] Potrącenia z pensji: przy zakładaniu źródła pytanie „Czy coś jest potrącane od razu?” (ubezpieczenie grupowe, karta sportowa, związki, kasa zapomogowa…) z pozycją budżetu; co miesiąc wpisują się same z poprzedniego miesiąca; w trybie „z netto” liczone od netto + potrącenia
- [x] „+ Inny przychód” w 💼 Pensje (sprzedaż rzeczy, premia poza paskiem, zwrot PIT) i lista innych przychodów miesiąca pod pensjami
- [x] Pensje tylko z paska: obecne przychody stałe zostają bez zmian; po założeniu źródła dochodu (listopad) aplikacja proponuje połączenie starej „Pensji…” ze źródłem (odhaczenie otwiera pasek, historia zostaje); ostrzeżenie, gdy ta sama pensja miałaby wejść dwa razy
- [x] „Przychody stałe” na inne stałe przychody (np. najem mieszkania), nowe bez pól PPK

## Etap O. Prawdziwe liczby
- [x] „Odłożone” = tylko wpłaty na oszczędności i inwestycje (z PPK) minus wypłaty; zmiana kursów i wycen osobno („inwestycje zarobiły / straciły”) – Oszczędności (cel miesięczny, konfetti), Mati ↔ Wercia, mail miesięczny, podsumowanie roku, FIRE
- [x] Analiza: „Odkładacie %” → „Zostaje z przychodów” + prawdziwy procent odłożony
- [x] Budżet: wiersz „🐷 odłożone w tym miesiącu X z Y zł”
- [x] Analiza Roku: wykres oszczędności z liniami „wpłacone” i „wartość”
- [x] Jedna karta poduszki: tylko konta oszczędnościowe (bez IKE, IKZE, PPK, OKI)
- [x] Cele-koperty: „do przydzielenia” bez IKE, IKZE, PPK, OKI (przydzielone kwoty zostają)
- [x] FIRE: tempo odkładania z prawdziwych wpłat
- [x] Mati ↔ Wercia według właściciela konta (Mati / Wercia / Wspólne); bez zdublowanej karty „Kto wydawał”

## Etap P. Planowanie
- [x] Wydatki roczne same w planie miesiąca płatności (nie kopiują się na kolejny miesiąc)
- [x] Analiza Roku → „Plan a rzeczywistość”: pozycje często ponad plan + „Popraw plan od następnego miesiąca”
- [x] Ukrywanie pozycji i całych kategorii (⚙️ → Kategorie: Zmień nazwę / 🙈 Ukryj / Usuń; ukryte w szarej linijce z ↺); ukryta pozycja z wpisem w danym miesiącu i tak widoczna w Budżecie
- [x] Usuwanie tylko pustych pozycji; z wpisami – ukrycie; „Połącz z inną” jako rzadka opcja, przenosi też wydatki roczne, źródła dochodu i zobowiązania; jednorazowe sprawdzenie danych

## Etap R. Roczne i terminy, porządki
- [x] Jedna zakładka „📅 Roczne i terminy” zamiast Roczne + Przyp.: kwota opcjonalna (z kwotą – odkładanie na subkonto, bez – samo przypomnienie), opcjonalnie „co X km”, przypomnienie zawsze ok. 14 dni przed terminem (także przy pełnej kopercie), gotowe szablony (OC, ubezpieczenie mieszkania, przegląd, opony, serwis, szczepienie i odrobaczanie kotów), lista 🛡️ gwarancji na dole; obecne przypomnienia przeniesione automatycznie
- [x] Podatek od najmu: przy przychodzie stałym z najmu przypomnienie o ryczałcie do 20. (co miesiąc / co kwartał – do wyboru)
- [x] PIT: 1 marca „Czas na PIT” z zestawieniem ulg i IKZE osobno dla Matiego i Werci, powtórka 1 i 20 kwietnia do „✓ Złożone” (każde osobno), termin 30 kwietnia
- [x] Kaskada nadwyżek: zapas 250 zł na każdym koncie bieżącym (do zmiany) + niezapłacone opłaty stałe, informacja o planie do końca miesiąca, nigdy na PPK / OKI ani z gotówki, pilnuje limitów IKE i IKZE
- [x] Usunięcie „Dodaj opłaty do kalendarza”
- [x] Wartość inwestycji: automat + jeden ekran „📈 Aktualizuj wartości” (bez przycisków przy kontach i bez inwestycji w „Wyrównaj wszystkie salda”)
- [x] Usunięcie starego modułu inwestycji i filtra „Inwestycje” w Rejestrze (u Matiego i Werci pusty)
- [x] ⚙️ Ustawienia w grupach: Ten telefon / Budżet / Bezpieczeństwo / Automaty / Pomoc
- [x] Przewodnik „Która koperta do czego” (Cel / Roczne / odkładanie na spłatę / Projekt) + podpowiedź przy zakładaniu

# Część 5 – po drugiej analizie przydatności (uzgodnione z Matim 25.10.2026)
Mati wybrał: punkty 1–4, Rejestr i ulgę dla młodych; wszystkie etapy po kolei bez pytania o kolejny. Kolejność: W → S → T → U. Kopia zrobiona przed startem.

## Etap W. Urodziny i ulga dla młodych
- [x] 🎂 Bailey i Ivo pytają przy starcie o datę urodzenia osoby telefonu („Nie teraz” – znowu za 60 dni); zmiana w ⚙️ → „Kto korzysta z tego telefonu?”; data w kopii zapasowej
- [x] 🎂 W dniu urodzin życzenia na Budżecie (konfetti) i rano w powiadomieniu; drugiej osobie przypomnienie o życzeniach
- [x] 🎓 Ulga dla młodych (Wercia): umowa o pracę i zlecenie bez podatku do dnia 26. urodzin włącznie, limit 85 528 zł w roku ze wszystkich umów (z PPK pracodawcy); ZUS i zdrowotna bez zmian; przy przekroczeniu limitu podatek od nadwyżki
- [x] 🎓 „Podpowiedz z brutto” i „z netto” liczą z ulgą, w pasku informacja o limicie, w widoku roku przychód zwolniony (do PIT-11)
- [x] 🎓 Miesiąc przed 26. urodzinami w „Na dziś”: koniec ulgi i o ile mniej będzie na konto

## Etap S. Opłaty stałe bez podwójnego liczenia
- [x] Wydatek wpisany przez ＋ podobny do niezapłaconej opłaty stałej albo wydatku rocznego → pytanie „To … z opłat stałych? Odhaczyć?”
- [x] Odhaczanie w 📌 Stałe, gdy podobny wpis już jest w miesiącu → „Połącz z wpisem z …” zamiast drugiego wydatku
- [x] Budżet: uwaga, gdy plan pozycji jest niższy niż jej opłaty stałe, z przyciskiem do poprawy

## Etap T. Analiza trwającego miesiąca i Rejestr
- [x] W trwającym miesiącu porównanie z poprzednim miesiącem do tego samego dnia („miesiąc jeszcze trwa”)
- [x] „Zmieściło się” i „wyraźnie mniej niż plan” dopiero po końcu miesiąca
- [x] Rejestr: filtry schowane pod jednym przyciskiem „Filtry”, suma wydatków przy każdym dniu

## Etap U. Zamknięcie miesiąca
- [x] Jeden ekran z krokami: salda z bankiem (data ostatniego sprawdzenia, „✓ zgadza się” / „Wyrównaj”), co było ponad plan, nadwyżka (kaskada), plan na nowy miesiąc, cele
- [x] Karta na Budżecie w pierwszych dniach miesiąca, w „Na dziś” i powiadomienie 1. dnia; odhaczone kroki wspólne dla obu telefonów

# Część 6 – po trzeciej analizie przydatności (uzgodnione z Matim 25.10.2026)
Mati wybrał: A1 (w nowej formie), A2, A3, B2, B3, B5, C1, C2, C4. Nie robimy: A4, B1, B4, B6, C3. Pensja z końca miesiąca zostaje w budżecie miesiąca wpływu (wersja 1 – do „Do budżetu: następny miesiąc” wrócimy, gdy będą znane dni wypłat).

## Etap V. Zamknięcie przed wypłatą, prawdziwe nadwyżki, prostsze ekrany
- [x] 🗓️ Zamknięcie miesiąca osobno dla Matiego i Werci: karta dzień przed najwcześniejszą wypłatą osoby (dzień uczony sam z pasków z ostatnich 3 miesięcy, „koniec miesiąca” rozpoznany, weekend → piątek; bez pasków – dzień ze źródła dochodu, bez źródła – od 1. dnia), do ok. 10 dni, „Pomiń”, powiadomienie rano tylko do tej osoby; wypłata od 20. → zamyka się bieżący miesiąc
- [x] 🗓️ Kroki: salda (swoje + wspólne konta), nadwyżka (swoje konta), cele (swoje + wspólne) – osobno; „Co było ponad plan” i „Plan” – wspólne (odhaczenie przez jedno = u obojga); dawne odhaczenia przeniesione do osoby, która je zrobiła
- [x] 💧 Kaskada liczy „do jutrzejszej wypłaty” (saldo − zapas − opłaty stałe przed wypłatą); pensja już wpisana nie jest nadwyżką; w inne dni „Nadwyżkę policzę dzień przed wypłatą”
- [x] 🛟 Poduszka nie liczy się do puli celów; karta poduszki odejmuje pieniądze przydzielone do celów (A2)
- [x] 📝 „Co było ponad plan”: propozycja planu = średnia z 3 miesięcy; gdy nie wyższa niż plan – „jednorazowo” (A3)
- [x] 👥 Bez karty „Czyje oszczędności”; „Na kontach ›” otwiera Majątek → Konta (B2)
- [x] ⚖️ Salda tylko wszystkie naraz: bez „Wyrównaj” i „Aktualizuj wartości” przy każdym koncie; w zamknięciu „✓ Zgadza się” + „Wyrównaj wszystkie salda naraz” (B3)
- [x] 🧾 Rejestr w 2 linijkach: pozycja, pod nią notatka · konto · osoba (B5)
- [x] 🔁 Stały przelew na dowolne konto (wspólne, drugiej osoby, subkonto) + podpowiedź powtarzających się przelewów (C2)
- [x] ⚠️ „Nie starczy na rachunki”: prognoza salda kont bieżących do końca miesiąca (opłaty stałe, stałe przelewy, raty; wpływy przed terminem) w „Na dziś” z „Przelej” i w powiadomieniu (C1)
- [x] 🧪 Demo z paskami pensji obu osób (4 miesiące, PPK, potrącenie, inny przychód, widok roku) (C4)

# Część 7 – po przeglądzie kodu i pomysłach Matiego (uzgodnione 28.10.2026)
Mati zlecił wszystkie etapy po kolei (bez czekania na komendę między nimi). Nie robimy: ekranu „Gdzie odkładamy”, usuwania importu kopii z pierwszej wersji, przepisywania stylu kodu.

## Etap X1. Nagłówek
- [x] 🔍 🔔 ⚙️ w jednej linii i tej samej wielkości (dzwonek miał styl listy „Na dziś” – ta sama nazwa klasy); robot sprawdza położenie ikon

## Etap X2. Naprawy i pełna kopia
- [ ] Jedna funkcja kopii dla ⚙️ i maila: kaskada, ukryte podpowiedzi (`checkIgnore`), subkonto kopert (`yearAcc`), inflacja (`macro`), limity IKE/IKZE, urodziny, zamknięcia, daty sald; wczytanie przywraca wszystko
- [ ] Wydatki roczne co kwartał / co miesiąc: kolejny termin po zapłacie
- [ ] Wpis z konta w archiwum: konto widoczne z dopiskiem, bez zapisu bez konta
- [ ] Zmiana daty na inny miesiąc zachowuje powiązania (roczne, drobne, odsetki spłaty)
- [ ] „Ostatnio usunięte”: wpis przeniesiony tam i z powrotem
- [ ] Bezpieczna aktualizacja (komplet plików przed przełączeniem)
- [ ] Testy robota

## Etap X3. Kotki
- [ ] Wyraźniejsze dymki (konkret z kwotą, potem żart)
- [ ] „Rozumiem, kociaki 🐾” przy uwagach → ciekawostka dnia
- [ ] 366 ciekawostek (sprawdzonych), jedna na dzień roku, 29 lutego – nr 366
- [ ] W święta i urodziny życzenia zamiast ciekawostki

## Etap X4. Oprocentowanie kont
- [ ] Oprocentowanie, promocja (do kiedy, limit), dopisywanie odsetek, podatek (bank / sam – PIT-38 / bez) przy koncie; historia stawek
- [ ] Odsetki liczone dzień po dniu od salda; karta w „Na dziś” z kwotą; odsetki = zysk, nie „odłożone”
- [ ] Przypomnienie o końcu promocji; prognoza w Oszczędnościach

## Etap X5. Porządki w kodzie
- [ ] Nieużywane importy, martwy kod, wspólne pomocniki, ekran starego modułu inwestycji, zbędne migracje, krótsze notatki

## Etap X6. Szybkość
- [ ] Mniej przerysowań ekranu przy zapisie

## Rezygnujemy
Wczytywanie wyciągów bankowych i historii z XTB, ulubione transakcje, przyciski „Dziś/Wczoraj”, kreska „gdzie powinniśmy być dziś”, przenoszenie niewydanego planu, rozliczenia Mati ↔ Wercia, symulator „Co jeśli?”, oznaczanie „zbędny”, Face ID, powiadomienia w kalendarzu, własna chmura zamiast Firebase, aplikacja ze sklepu, „Ile możemy dziś wydać”, własna klawiatura do kwot, przycisk ➕ na środku paska zakładek.

## Później
Kopia zapasowa na domowy NAS (5–10 TB) – Mati odezwie się, gdy kupi sprzęt.
