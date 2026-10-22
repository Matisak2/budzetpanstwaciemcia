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
- [ ] „Zapisz” przyklejony na dole okienka transakcji + „Zapisz i dodaj kolejny”
- [ ] Przytrzymanie wpisu w Rejestrze: 📋 Duplikuj, ↩️ Zwrot, 🗑️ Usuń
- [ ] Przesunięcie palcem w lewo / prawo zmienia miesiąc
- [ ] Budżet krótszy: w kategorii tylko pozycje z planem lub wydatkami, pod nimi „＋ N pustych pozycji ›”; puste kategorie zebrane na dole w jednej linijce; filtr „Bez planu” pokazuje wszystko
- [ ] Mniej zakładek: Budżet · Rejestr · Stałe · Majątek (Oszczędności + Konta z przełącznikiem) · Analiza dostępna z Budżetu (📊); przycisk ➕ zostaje tam, gdzie jest teraz (zaokrąglony kwadrat)
- [ ] Lupa 🔍 w nagłówku: jedno wyszukiwanie po wpisach, pozycjach, kontach i instrumentach
- [ ] Większe liczby, krótsze opisy, szczegóły pod „więcej ›”
- [ ] ⚙️ „🎨 Wygląd” na każdym telefonie: kolor akcentu (pastelowe kółka; na start Wercia różowy, Mati miętowy) i rozmiar tekstu A / A+ / A++
- [ ] Płynniejsze przejścia (paski „rosną”, szkic ekranu zamiast „Wczytywanie…”)
- [ ] Większe pola do stukania (małe przyciski „Edytuj”, „⋯”)

## Etap F. Wersja demonstracyjna
- [ ] Osobny link `…/budzetpanstwaciemcia/demo/` do wysłania znajomym; bez połączenia z Firebase i bez dostępu do Waszych danych
- [ ] Na starcie „Jak masz na imię?” – imię oglądającego; druga osoba wymyślona (losowe imię, można zmienić)
- [ ] Wymyślone dane z całego roku (pensje, zakupy, opłaty, konta, ETF, obligacje, kredyt, cele, auto); zmiany tylko w przeglądarce oglądającego, przycisk „Zacznij od nowa”; pasek „Wersja demonstracyjna – dane są wymyślone”
- [ ] Imiona Mati / Wercia wyciągnięte z kodu do ustawień (w Waszej aplikacji bez zmian)

## Rezygnujemy
Wczytywanie wyciągów bankowych i historii z XTB, ulubione transakcje, przyciski „Dziś/Wczoraj”, kreska „gdzie powinniśmy być dziś”, przenoszenie niewydanego planu, rozliczenia Mati ↔ Wercia, symulator „Co jeśli?”, oznaczanie „zbędny”, Face ID, powiadomienia w kalendarzu, własna chmura zamiast Firebase, aplikacja ze sklepu, „Ile możemy dziś wydać”, własna klawiatura do kwot, przycisk ➕ na środku paska zakładek.

## Później
Kopia zapasowa na domowy NAS (5–10 TB) – Mati odezwie się, gdy kupi sprzęt.
