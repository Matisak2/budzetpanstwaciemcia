# Plan rozwoju Budżetu M&W

Uzgodniony z Matim w październiku 2026. Etapy robimy po kolei; **każdy kolejny etap zaczynamy dopiero na komendę Matiego**.
Przed etapem: Mati pobiera kopię (⚙️ → Pobierz kopię). Dane nigdy nie znikają (migracje zamiast kasowania). Każdy etap = osobny push na `main`.
Strona z planem dla Werci: https://claude.ai/artifact/LxDu6XeH9GH9F1VSK3sSJL

## Zrobione wcześniej (szczegóły w `PLAN-archiwum.md`)
- [x] Etap 1. Poprawki i porządki
- [x] Etap 2. Wpisywanie transakcji
- [x] Etap 3. Wygląd, czytelność, konta osób
- [x] Etap 4. Bailey i Ivo (przewodnicy)
- [x] Etap 5. Drobne
- [x] Etap 6. Waluty
- [x] Etap 7. Pensje
- [x] Etap 8. Oszczędności i inwestycje
- [x] Etap 9. Zobowiązania i należności
- [x] Etap 10. Planowanie
- [x] Etap 11. Analiza
- [x] Etap 12. Okno „Na dziś”
- [x] Etap A. Automat bez przerw, prawdziwe powiadomienia, strażnik porządku
- [x] Etap B. Maile: kopia zapasowa i podsumowanie miesiąca
- [x] Etap C. Inwestycje i opłaty – automatycznie
- [x] Etap D. Wygoda na co dzień
- [x] Etap E. Wygląd i ergonomia
- [x] Etap F. Wersja demonstracyjna
- [x] Etap G. Robot i zasady dostępu
- [x] Etap H. Poprawki z przeglądu ekranów
- [x] Etap I. Bezpieczeństwo i dyskrecja
- [x] Etap J. Umowy, koszty roczne, sklepy
- [x] Etap K. Zdjęcia paragonów
- [x] Etap L. Porządek w kodzie
- [x] Etap M. Ulepszenia po części 3 (uzgodnione 25.10.2026)
- [x] Etap N. Pewność i szybkość (uzgodnione 25.10.2026)
- [x] Etap Q. Pensje i przychody
- [x] Etap O. Prawdziwe liczby
- [x] Etap P. Planowanie
- [x] Etap R. Roczne i terminy, porządki
- [x] Etap W. Urodziny i ulga dla młodych
- [x] Etap S. Opłaty stałe bez podwójnego liczenia
- [x] Etap T. Analiza trwającego miesiąca i Rejestr
- [x] Etap U. Zamknięcie miesiąca
- [x] Etap V. Zamknięcie przed wypłatą, prawdziwe nadwyżki, prostsze ekrany

# Część 7 – po przeglądzie kodu i pomysłach Matiego (uzgodnione 28.10.2026)
Mati zlecił wszystkie etapy po kolei (bez czekania na komendę między nimi). Nie robimy: ekranu „Gdzie odkładamy”, usuwania importu kopii z pierwszej wersji, przepisywania stylu kodu.

## Etap X1. Nagłówek
- [x] 🔍 🔔 ⚙️ w jednej linii i tej samej wielkości (dzwonek miał styl listy „Na dziś” – ta sama nazwa klasy); robot sprawdza położenie ikon

## Etap X2. Naprawy i pełna kopia
- [x] Jedna funkcja kopii dla ⚙️ i maila: kaskada, ukryte podpowiedzi (`checkIgnore`), subkonto kopert (`yearAcc`), inflacja (`macro`), limity IKE/IKZE, urodziny, zamknięcia, daty sald; wczytanie przywraca wszystko
- [x] Wydatki roczne co kwartał / co miesiąc: kolejny termin po zapłacie
- [x] Wpis z konta w archiwum: konto widoczne z dopiskiem, bez zapisu bez konta
- [x] Zmiana daty na inny miesiąc zachowuje powiązania (roczne, drobne, odsetki spłaty)
- [x] „Ostatnio usunięte”: wpis przeniesiony tam i z powrotem
- [x] Bezpieczna aktualizacja (komplet plików przed przełączeniem)
- [x] Testy robota

## Etap X3. Kotki
- [x] Wyraźniejsze dymki (konkret z kwotą, potem żart)
- [x] „Rozumiem, kociaki 🐾” przy uwagach → ciekawostka dnia
- [x] 366 ciekawostek (sprawdzonych), jedna na dzień roku, 29 lutego – nr 366
- [x] W święta i urodziny życzenia zamiast ciekawostki

## Etap X4. Oprocentowanie kont
- [x] Oprocentowanie, promocja (do kiedy, limit), dopisywanie odsetek, podatek (bank / sam – PIT-38 / bez) przy koncie; historia stawek
- [x] Odsetki liczone dzień po dniu od salda; karta w „Na dziś” z kwotą; odsetki = zysk, nie „odłożone”
- [x] Przypomnienie o końcu promocji; prognoza w Oszczędnościach

## Etap X5. Porządki w kodzie
- [x] Nieużywane importy (42) usunięte, robot (eslint `no-unused-vars`) pilnuje, żeby nie wracały
- [x] Martwy kod: stara lista gotowych przypomnień (`REM_PRE`), `SCENE_NAMES`, pusty nagłówek, przesunięty komentarz; komunikat starego wpisu inwestycji (dało się go tylko usunąć – ekranu już nie ma)
- [x] Wspólne pomocniki `plu` i `dmy` w `util.js`
- [x] Usunięte jednorazowe migracje przy starcie (konta IKE/PPK/wspólne, „Zwroty”, subkonta) – zbędne, `seed()` ma te konta
- [x] Krótszy `PLAN.md` (zakończone etapy w `PLAN-archiwum.md`, bez zmian treści)

## Etap X6. Szybkość
- [x] Mniej przerysowań: zmiany z Firestore rysowane raz na klatkę (`renderSoon`), potwierdzenie zapisu z serwera zmienia tylko napis synchronizacji (bez przebudowy listy wpisów); pomiar: 15 000 wpisów – jedno przerysowanie < 30 ms na komputerze

## Etap X7. Każde ma swoje (uzgodnione 29.10.2026)
- [x] 📌 Opłaty: przełącznik Wszystkie · Mati · Wercia · Wspólne (`fixedWho` = „Dotyczy” `f.who` albo właściciel konta), pole „👥 Dotyczy” w opłacie, przychodzie i przelewie stałym
- [x] 🔒 Osoba przypisana do loginu: `users/{uid}` `{who,lock}` (bez adresów e-mail w kodzie), jedno pytanie przy starcie (`askWhoLock`), w ⚙️ „Zalogowano jako…”, `setWho` zablokowane
- [x] 🙀 Wpis z konta drugiej osoby: pytanie kotków (`otherAccOk` w `sheet.js`), „Tak, wiem” = bez pytań o to konto do końca dnia (`mw_oth`); wspólne i przelewy NA konto – bez pytania

## Etap X8. Każde ma swoje – część 2 (uzgodnione 29.10.2026)
- [x] Na Budżecie („Do odhaczenia”), w „Na dziś”, w dymku kotków i w powiadomieniach – tylko swoje i wspólne sprawy (`seenBy` w `logic.js`; opłaty stałe, umowa, najem, „nie starczy” według `fixedWho`)
- [x] „👥 Dotyczy” w wydatkach rocznych i przypomnieniach (`who`, puste = wspólne)
- [x] Sprawy techniczne (kopia, automat, limity IKE/IKZE, zasady pensji) – tylko Mati

## Etap X9. Ustawienia jako kafelki (uzgodnione 29.10.2026)
- [x] ⚙️ = 6 kafelków (Konta · Kategorie i drobne · Ten telefon · Bezpieczeństwo · Automaty · Pomoc), po stuknięciu osobny ekran z „‹ Ustawienia”, nic nie rozwinięte samo

## Etap X10. Kwiatki dla Werci (uzgodnione 29.10.2026)
- [x] Tylko Wercia + różowy kolor (`body.wf`): gałązka przy powitaniu, kwiatek przy miesiącu, pod zakładką i w komunikatach, doniczka na pustych ekranach, kwiatki w kafelkach ⚙️, girlanda w okienku wpisu, kwiatki na kartach Analizy i w slajdach (Wrapped), cele jako łodyżki zakwitające na 100%, płatki wiśni zamiast konfetti (paski budżetu bez zmian)

## Etap X11. Wszystko w dzwoneczku (uzgodnione 30.10.2026)
- [x] 🔔 Budżet i Stałe bez ramek z uwagami: „Do odhaczenia”, zamknięcie miesiąca, koperty roczne, kopia, „Do zaplanowania”, „Plan niższy niż opłaty stałe”, podpowiedzi stałych opłat, przekroczony plan – tylko w „Na dziś” (`planTodo`); kotki na Budżecie bez ostrzeżeń (`calm`)
- [x] 🪙 „W tym z drobnych” liczy tylko drobne na kontach oszczędnościowych/inwestycyjnych i pokazuje resztę wpłat

# Część 8 – po czwartym przeglądzie aplikacji (uzgodnione 31.10.2026)
Mati wybrał z listy „co bym zmienił”: 2, 6, 7, 8, z „co bym dodał”: wszystko (1–4). Nie robimy (na razie): bilans z podziałem na odłożone, krótszy Budżet, krótsza Analiza, jeden przełącznik osób w Kontach, usuwanie funkcji – wrócimy do tego z licznikiem użycia.

## Etap X12. Porządek: najpilniejsze na górze
- [x] 🔔 „Na dziś” według pilności (po terminie → dziś → jutro → reszta), rzeczy na za kilka dni zwinięte pod „⏳ Wkrótce”, liczba na dzwonku tylko na dziś
- [x] 🐷 Oszczędności: „Ile odłożyliście” i cele na górze, FIRE i „Wpłacone a wartość” na dole; w zakładkach osób cele pod przyciskami; odsetki w jednej linijce
- [x] 📌 Stałe: opłaty na górze, przychody stałe na dole (bez nich – mały przycisk)
- [x] 🐾 Kotki na Budżecie nie powtarzają paska 🐷
- [x] 🧪 Demo: przykładowe wydatki roczne, subkonto kopert i terminy bez kwoty

## Etap X13. Rok temu, przegląd subskrypcji, licznik użycia
- [x] 📅 Analiza → Miesiąc: karta „Rok temu” (przychody, wydatki, odłożone i 3 kategorie z największą zmianą; w trwającym miesiącu do tego samego dnia)
- [x] 📋 Raz w roku przegląd subskrypcji w „Na dziś”: lista z kosztem rocznym, „Zostaje” / „Zmień” / „Rezygnuję”
- [x] 📊 Licznik „Czego używamy” (ekrany, okienka, dodatki, karty widoczne 2 s) w ⚙️ → Pomoc

## Etap X14. Poprawki z drugiego przeglądu (uzgodnione 31.10.2026)
- [x] 🗓️ Zamknięcie miesiąca: plan na miesiąc po zamykanym (wypłata od 20. → następny miesiąc), kopia ostatniego planu przy pierwszej zmianie
- [x] 🔢 Kwoty w kafelkach nie są ucinane „…” przy A++ (dopasowanie bez zapasu 1 px, ponownie po wczytaniu czcionki)
- [x] 👥 Podpowiedzi stałych opłat / przelewów tylko dla właściciela konta źródłowego
- [x] 🤖 Robot sprawdza widok roku w Pensjach (PIT), plan w zamknięciu, ucięte kwoty, „ⓘ” i wpisy pozycji
- [x] „Skopiuj plan z poprzedniego miesiąca” tylko, gdy miesiąc nie ma planu
- [x] ⓘ Długie objaśnienia zwinięte (poduszka, FIRE, odsetki, kaskada, koperty roczne, konta inwestycyjne, zamknięcie)
- [x] 🔎 Stuknięcie pozycji w Budżecie → jej wpisy z miesiąca
- [x] 🔎 Poprawka: lista wpisów pozycji przewija się w okienku (wcześniej `.list` ją ucinał), a otwarte okienko nie przesuwa strony pod spodem

## Etap X15. Poprawki z trzeciego przeglądu (uzgodnione 1.11.2026)
- [x] 🏠 PIT-28 za najem: termin 30 kwietnia (przypomnienie od 1 marca)
- [x] 📅 Edycja wydatku rocznego zachowuje „co miesiąc”; strażnik pokazuje wydatek bez częstotliwości; usunięcie zapłaty cofa kopertę, przywrócenie przesuwa
- [x] 🖨️ Podsumowanie roku liczy majątek z kontami z archiwum
- [x] 🏦 Kolejność kont nie przeskakuje po usunięciu konta; usuwane konto, którego coś używa → okno „przenieś na konto”; strażnik: ustawienia na nieistniejące konto
- [x] ✓ Odznaczenie opłaty stałej pyta „Usunąć wpis?” (9c)
- [x] 🔁 Stały przelew na konto wspólne = „Przelano”, 🐷 tylko oszczędności
- [x] 📧 Szczegółowy mail z podsumowaniem miesiąca (porównania z poprzednim miesiącem, średnią i rokiem temu, plan, kategorie, sklepy, oszczędności, nowy miesiąc)
- [x] ⚖️ Okienka wyrównania i PPK: waluta konta, data DD.MM.RRRR, czytelny tytuł
- [x] Drobne: autor po przeniesieniu pożyczek, pasek przy wypłacie 31., „Pokaż starsze” w Rejestrze, licznik kart, automat kursów 18:23 cały rok, odmiana imion w demo, Pomoc
- [x] 🧹 Porządek w kodzie (martwe „Rozumiem, kociaki”, nieużywane style i funkcje, powtórzony kod, demo bez cache aplikacji); 🌸 bez kwiatka przy nazwie miesiąca

## Etap X16. Poprawki z czwartego przeglądu (uzgodnione 1.11.2026)
- [x] 📅 Przypomnienie o wydatku rocznym płaconym co kwartał / co miesiąc (wcześniejsza zapłata ukrywała następny termin)
- [x] 📈 Automat kursów zachowuje ostatnią znaną cenę, kurs NBP, stopę i złoto, gdy źródło nie odpowie (wycena nie spada do ceny zakupu); „Automat nie pobiera danych” liczy od ostatnich kursów NBP
- [x] 🌍 Zwrot: waluta konta, tylko konto tej samej waluty; okienka odhaczania w walucie konta
- [x] ✍️ Jedna reguła „czy dziś coś wpisano” (Na dziś, dymek o 20:00, powiadomienie)
- [x] 🧹 Porządek: nieużywane `parseEurostat`, zmienne kolorów, pola stanu `S.inv`/`S.ro`, zdublowany import, przesunięty komentarz, literówka `--mut`

## Poprawka: bez minusa na koncie (uzgodnione 5.11.2026)
- [x] 🚫 Wydatek / przelew, po którym konto (bieżące, subkonto, oszczędności) zeszłoby poniżej zera w dniu wpisu albo później, się nie zapisuje – tylko informacja „przeanalizuj konta” (bez przycisku przelewu i bez „zapisz mimo to”); też odhaczanie opłat i stałych przelewów, wydatek roczny, spłata długu, pożyczka dla kogoś; 🪙 drobne bez pieniędzy – pominięte
- [x] (22.11, „zrób wszystkie”) B, C, D zrobione: ujemne saldo = pilny punkt i powiadomienie codziennie (`neg:`), „nie starczy” min. 7 dni + wydatki roczne z `yearAcc` (`SHORT_DAYS`), czerwone saldo w Kontach (`.t-neg`). Było do decyzji (z przeglądu 5.11): B – mocniejsze ostrzeżenie „Ujemne saldo” (wszystkie konta, pilne, codzienne powiadomienie), C – „Nie starczy na rachunki” 7 dni w przód z wydatkami rocznymi i ratami, D – ujemne saldo na czerwono w Kontach

## Poprawki z piątego przeglądu (uzgodnione 5.11.2026)
- [x] 🚫 Bez minusa także „od drugiej strony”: zmniejszenie / usunięcie / przesunięcie wpływu, odznaczenie przychodu stałego, „Przywróć” i „Cofnij” wydatku (`txOk` w `core.js`, `balDrop` przyjmuje `deleted`)
- [x] 📈 „Wasza inflacja” w trwającym roku: te same dni w obu latach (`ytdSpanP`)
- [x] 🖨️ Podsumowanie trwającego roku: wydatki wobec tych samych dni poprzedniego roku
- [x] 🧹 Drobiazgi w kodzie (przecinek zamiast klamer w `actions.js`, zbędny blok w testach); testy calc (12 nowych)

## Etap X17. Każde ma swój budżet (uzgodnione 9.11.2026)
Mati: wspólne konto = osobny, trzeci budżet; podział domyślnie 50/50; „kto płaci” na stałe z możliwością zmiany w miesiącu; przelew na własne oszczędności = wydane; oboje widzą wszystkie trzy budżety; karta na dole Budżetu.
- [x] 👥 „Płaci” przy każdej pozycji wydatków w Budżecie: Mati / Wercia / Wspólne / po połowie / inny podział (suwak); na stałe albo tylko w tym miesiącu; bez ustawienia – podpowiedź z ostatnich 3 miesięcy (z czyich kont szły wydatki)
- [x] 📌 Opłaty stałe liczą się same temu, z czyjego konta schodzą; „Płaci” dotyczy reszty planu pozycji; 📅 wydatki roczne płaci subkonto kopert (liczy się przelew na nie)
- [x] 👥 Karta „Czy starczy?” na dole Budżetu: Mati, Wercia, Wspólne – wpływa (pensje, przychody stałe, przelewy od innych) / wychodzi (opłaty stałe, część planu, przelewy na wspólne, do drugiej osoby, na oszczędności) / zostaje; szczegóły po stuknięciu
- [x] 🔔 Cichy punkt w „Na dziś”, gdy według planu komuś zabraknie; to samo zestawienie w kroku „Plan” zamknięcia miesiąca
- [x] 🧪 Demo: przelewy „Na wspólne” jako stałe przelewy; robot: ekrany „kto płaci” i „czy starczy”, testy obliczeń, kopia z `payM`
- [x] 💰 „Czy starczy?” od tego, co na kontach (wariant B, 9.11): saldo kont bieżących i subkont teraz + to, co jeszcze wpłynie − to, co jeszcze wyjdzie (reszta planu minus to, co dana osoba już wydała); zapas jak w kaskadzie (250 zł na konto bieżące); „najmniej” – dzień z najniższym stanem (np. przed wypłatą); przyszły miesiąc od przewidywanego końca bieżącego
- [x] 🟡 Bez zapasu (13.11): prawdziwy przewidywany stan kont; ✅ powyżej 300 zł, 🟡 na styk (mniej niż 300 zł w którymś dniu, bez „Na dziś”), ⚠️ poniżej zera
- [x] Etap 2 (13.11): ile każdy wydał ze swojej części planu i pozycje ponad nią; zapłacone ze swojego konta za wspólne / za drugą osobę – zmniejsza resztę wspólnych, 💡 podpowiedź „można oddać”; gdy wspólnym brakuje – 💡 po połowie (też w Na dziś); same podpowiedzi, bez przycisków

## Rezygnujemy
Wczytywanie wyciągów bankowych i historii z XTB, ulubione transakcje, przyciski „Dziś/Wczoraj”, kreska „gdzie powinniśmy być dziś”, przenoszenie niewydanego planu, rozliczenia Mati ↔ Wercia, symulator „Co jeśli?”, oznaczanie „zbędny”, Face ID, powiadomienia w kalendarzu, własna chmura zamiast Firebase, aplikacja ze sklepu, „Ile możemy dziś wydać”, własna klawiatura do kwot, przycisk ➕ na środku paska zakładek.

## Później
Kopia zapasowa na domowy NAS (5–10 TB) – Mati odezwie się, gdy kupi sprzęt.

# Część 8 – 🧭 Doradca inwestycyjny (plan zaakceptowany 14.11.2026)
**Nowe okno: najpierw przeczytaj `DORADCA-START.md`.** Pełny plan: `DORADCA-plan.md` (punkt 0 = decyzje Matiego, nadrzędne). Wiedza: `DORADCA-notatki.md`.
Każdy etap dopiero na komendę Matiego, po kopii.

- [x] Analiza, pełna lektura źródeł, kompletny plan, odpowiedzi Matiego (PPK poza doradcą, XTB, lista 8 ETF-ów, koło z widełkami)
- [x] Etap D1a. Klasy aktywów (każdy rodzaj + własne klasy), lista ETF-ów z analizą, auto-śledzenie nowych instrumentów, wykres kołowy „jak jest” dla kont i instrumentów
- [x] Etap D1b. 🏠 „Dodaj nieruchomość”, „＋ Dodaj inne aktywo”, udziały %, jeden główny wykres 🏠 / 📈 ze szczegółami
- [x] Etap D2. Ankieta i plan: proporcje z widełkami na kole, kotki podpowiadają wyrównanie, diagnoza (poduszka, długi, limity)
- [x] Etap D3. „Gdzie”: kwota → bramki → pokrowce z wyliczeniem (IKE/IKZE wg progu, OKI, nadpłata), „na pewno nie tu”, „wspólnie”; **+ kafelki karty 🧭 Doradca do stuknięcia** (Mati 14.11): każdy z 4 (poduszka, długi, limity, plan) otwiera okienko z pełnymi szczegółami – np. limity: IKE i IKZE osobno, limit, wpłacone, zostało, dni do 31.12 (dziś tekst limitów jest ucięty)
- [x] Etap D4. „W co”: niedobory, konkretne ETF-y/obligacje, koszty XTB, transze, zapis porady
- [x] Etap D5. Cele: emerytura, mieszkanie (+ wartość w majątku, najem, proporcje nieruchomości, sugestia zakupu tylko gdy stać), test kryzysu, strażnik kosztów
- [x] Etap D6. Termometr, reguły na spadki, przypomnienia w „Na dziś”
- [x] Etap D7. Piaskownica: analiza wpisanej spółki / ETF-u

## Poprawki z przeglądu 14.11.2026 (uzgodnione z Matim)
Nie robimy: rozliczeń Mati ↔ Wercia (zostają w „Rezygnujemy”); przycisk ＋ niczego nie zasłania (chowa się przy przewijaniu, na dole jest miejsce) – bez zmian.
- [x] ⚖️ „Wyrównaj wszystkie salda”: konta sprawdzone dopiero po „Zapisz”, „Cofnij” przywraca daty
- [x] 🧭 Nieaktualne napisy w doradcy („w następnym etapie…”, „w etapie celów”)
- [x] 🕐 Daty porad doradcy w czasie polskim (`plDay`)
- [x] 💼 JDG wg zasad 2026: warianty ZUS (start / preferencyjny / pełny / z chorobowym / własna kwota), zdrowotna minimalna, limit odliczenia na liniowym, progi ryczałtu; zlecenie studenta do 26 lat; koszty zlecenia z PPK; testy
- [x] 🐷 Oszczędności: Ile odłożyliście i cele przed Doradcą i kołem majątku
- [x] 🥧 „Nieruchomości” nieucinane przy dużej czcionce
- [x] 👛 Konta: wybór osoby jako guziki w karcie z sumą, „Wyrównaj” pod listą


## Poprawki z dużego przeglądu 21.11.2026 (na polecenie Matiego 22.11, raport `reports/` tylko lokalnie)
- [x] 🗓️ Zamknięcie miesiąca wg zwykłego dnia wypłaty (weekend), „Zgadza się” od początku okna, pensja z 31. nie 2× w „Czy starczy?”
- [x] 🛡️ Limity IKE/IKZE 2027 + przypomnienie o braku limitów; 🧭 plan doradcy = 100%
- [x] 💷 ETF z Londynu (pensy, waluta innych linii notowań); 🧾 paski: usuwanie z kopią, potrącenia tylko przez pasek; 🔻 spłata całości (bank)
- [x] 📱📱 Dwa telefony: zapis po id, `saveCfg` z `mergeFields`, plan i cele bez gubienia zmian
- [x] 🤖 Automaty: zapasowe terminy, limit czasu, wycena końca miesiąca z cen ostatniej sesji, push bez „Wkrótce”
- [x] 💼 Zlecenie (12% po progu, ryczałt do 200 zł, chorobowe dobrowolne); 🏦 obligacje i lokaty (ROR/DOR co miesiąc, kupony i wykup jako gotówka, wcześniejszy wykup); 🧭 doradca (tanie długi, poduszka, OKI 25 tys., najem 12,5%)
- [x] 🎨 Kontrast, druk PDF, „Rok temu”, „Wspólne” bez wspólnego konta; 🐾 drobiazgi (święta, kwoty, Kto, wykresy, testy, dokumentacja)
- [x] Decyzje Matiego 22.11 („zrób wszystkie”): wyjątek grudniowy IKE w doradcy, termometr w zł, ryczałt 17% → IKZE najpierw, miękkie usuwanie celów (🗑️), kotki rysowane raz (`mountCats`), 10 nowych ekranów w teście robota
- [x] 🔐 Zasady Firebase (telefony bez dostępu do `secret/`) – zrobione 23.11 drogą A: Mati nadał rolę „Firebase Rules Admin”, `rules.yml` „sprawdz” (39/39 prób) → „publikuj” ✅ (poprzednie zasady zapisane, tryb „cofnij” je przywraca). Opis dróg (dla historii): Droga A: Mati w Google Cloud → IAM nadaje kontu `firebase-adminsdk-…` rolę „Firebase Rules Admin”, potem okno Claude uruchamia `.github/workflows/rules.yml` (`scripts/rules.mjs`): najpierw tryb `sprawdz` (próby dostępu), przy zielonym – `publikuj`, awaryjnie `cofnij`; 22.11 próba skończyła się 403 (brak roli), odczyt zasad działa. Droga B: Mati w konsoli Firebase → Firestore → Rules zamienia blok `match /households/main/{document=**}` na dwa bloki z `firebase/firestore.rules` (adresy zostają) → Publish. Po wszystkim Mati może usunąć rolę.

# Część 9 – po audycie 23.11.2026 (raport `reports/audyt/00-RAPORT.md`, plan A–F)
Każdy etap dopiero na komendę Matiego, po kopii.

## Etap A. Pilne błędy (Mati: „zrób etap a”, 23.11.2026)
- [x] Rejestracja nowych kont w Firebase wyłączona (Mati 23.11: „Enable create (sign-up)” było już odznaczone)
- [x] 📧 Maile tylko na adresy z `users/{uid}` (konta bez dokumentu – tylko liczba w dzienniku), `sendMail` w try/catch (w publicznym dzienniku sam kod błędu)
- [x] 🔁 Bez dublowania: „Przywróć” / „Cofnij” opłaty stałej odhaczonej w międzyczasie (`fixedDupStop`), ponowny import listy wpisów i starej wersji pomija istniejące id (też usunięte), usuwane konto przepina powiązania dopiero po „Usuń” (`reassignAcc` zwraca funkcję)
- [x] 📅 „Co 2 lata” z `last` przy dodaniu/zmianie w „Edytuj” (pierwszy termin = najbliższy taki miesiąc, `yearLastFor`); strażnik `ref:yl:` dla starych bez `last`
- [x] 🔄 Przeładowanie po aktualizacji nie przy otwartym pasku / wyrównaniu / zamknięciu
- [x] 📈 Automat: cena różna od ostatniej o > 40% czeka na potwierdzenie następnego dnia (`dropJumps`, `rates.sus`)
- [x] 🗓️ Drobne daty: wypłata 30. dnia ≠ koniec miesiąca, `typedToday` też po `ts`, PIT-28 na osobę (`pit28:rok:osoba`), klucz strażnika `ref:i:` z każdą brakującą pozycją, strażnik: wpis żywy dwa razy (`twin:`), pensja poza paskiem (`slip2:`)
- [x] 🤖 Automaty: `npm install --ignore-scripts`, w `market.yml` zapis do repozytorium tylko w osobnym zadaniu „znak życia” (bez sekretów)
- [x] Testy w `calc.mjs` (dropJumps, yearLastFor, payPatternP 30., typedToday, PIT-28, checksP)


## Etap B. Porządki i testy (Mati: „Zacznij robić etap b”, 23.11.2026)
- [x] 🤖 Nowe testy robota: `tests/sdk.mjs` (atrapa demo = prawdziwe SDK Firebase 10.14.1 – 28 przypadków; atrapa poprawiona w 10 miejscach), `tests/flows.mjs` (zapis, zmiana miesiąca, usuwanie i „Cofnij”, paragon, zwrot, przelew, drobne, opłata stała, import starych formatów i `.json.gz`), `calc.mjs` 452 → 508 sprawdzeń (strażnik `checksP`, wycena `marketQuote`/`holdAt`/`instDiffP`, daty wypłat i okno zamknięcia, `plDay`/`addMonths`/`daysIn`/zmiana czasu, roczne w planie, średnie, nietypowe, wykupy, ulgi, kopia obejmuje każde ustawienie, „kiedy wysłać” automatów), `restore.mjs` pole po polu
- [x] ⏱️ `screens.mjs` – 4 ustawienia telefonu naraz (3:33 → 1:12)
- [x] 🛟 Jedna poduszka (`cushionP`) dla karty, doradcy i maila; 📧 mail = aplikacja (sklepy `shopsP`, plan przez `planOf`, opłaty bez zakończonych umów, roczne bez zapłaconych wcześniej); 🏦 wspólne zasady obligacji (`bondMonRate`, `bondFee`, `bondRates` w `bondAfter`); ryczałt najmu jedną funkcją
- [x] 🟡 Drobne: przyszły miesiąc bez „Zmieściło się”, Mati ↔ Wercia i Wrapped bez projektów spoza budżetu i innych walut, CSV (formuły Excela, kwota w drugiej walucie), „Majątek – teraz” i średnia w podsumowaniu roku, pusty pasek przy ujemnej kwocie; karta Limity z IKE na koncie `sav`, partia z przyszłą datą, wycena po usunięciu ostatniego instrumentu, kaskada przy wypłacie 1. dnia; doradca (brak odpowiedzi q43 = ostrożnie, emerytura po wieku emerytalnym, termometr bez danych, „Gdzie wpłacić” nie zmienia danych, „(do założenia)” w grudniu, nadwyżka ponad piaskownicę); zapis (przeniesienie wpisu jednym `writeBatch`, `posOf` w projektach i przypomnieniach, „Cofnij” usunięcia zobowiązania, „Ta pensja już jest?” tylko dla tej samej osoby, „kto płaci” przy łączeniu pozycji, dwie reguły drobnych przy przenoszeniu konta, tekst przy usuwaniu paska bez wpływu); kwoty „1e3”, „1,2,3”, „Infinity” = 0, bez „-0,00”; czcionka offline (`crossorigin`); „Czego używamy” – brakujące karty
- [x] 🧹 150 zbędnych `export`, 6 nadpisanych reguł CSS scalonych, `tNumUI` = `tNum`
- Zostawione świadomie (rzadkie, opis w `reports/audyt/02-kod.md`): przeniesienie IKE→IKE w limicie, `putTx` zawsze `true`, pasek na dwóch telefonach offline (pilnuje strażnik `slip2:`), usunięcie konta używanego tylko przez wpisy w 🗑️ (pilnuje strażnik `acc:`)

## Etap C. Szybkość (Mati: „Zacznij etap c”, 23.11.2026)
- [x] ⚡ `fitNums` (dopasowanie dużych kwot w kafelkach): jeden odczyt wszystkich kafelków, rozmiar z proporcji, jeden zapis – zamiast układu całej strony przy każdej próbie (wynik identyczny, sprawdzony na dużych kwotach przy A++)
- [x] 🐱 Kotki rysowane raz na każdym ekranie (`catSlot` + `mountCats` w `art.js`: Budżet, Analiza, puste ekrany, zamknięcie, ankieta) – w Analizie rysunek budowany od nowa zabierał ok. ⅓ przerysowania
- [x] 🔔 „Na dziś” z przypomnieniami doradcy liczone od nowa tylko po zmianie danych (W14); błąd w przypomnieniach doradcy widać w konsoli zamiast cichego zniknięcia (W13); wiek z ankiety (q1), gdy nie ma daty urodzin (W15)
- [x] 🌡️ Termometr rynku bez stałej subskrypcji (przy starcie i po 6 h przerwy), `market/eom` w ogóle niepobierane przez telefony
- Pomiar (demo, procesor spowolniony 4×, mediana 25 przerysowań, stara i nowa wersja na zmianę): Budżet ok. 58 → 45 ms (−23 do −30%), Analiza 67 → 48 ms (−28%); przy dużych kwotach i A++: Budżet 63 → 44 ms (−30%), Analiza 77 → 50 ms (−35%)
- Niezrobione (niski priorytet w audycie): HELP/NEWS i doradca ładowane dopiero na żądanie (–35–40 kB, ok. 10–15 ms startu na iPhonie)

## Etap D. Mniej na wierzchu (Mati: „do dzieła”, 23.11.2026)
Decyzje Matiego: szybsze dodawanie wydatku i „Pomiń resztę” w zamknięciu – nie robimy; Projekty zostają na Budżecie; VoiceOver – nie robimy; chowanie części Doradcy i połączenie Wrapped z Podsumowaniem roku – może później, po danych z „Czego używamy”.
- [x] 👥 „Czy starczy?” na dole Budżetu jako zwinięta zakładka w stylu karty kategorii (pastel, ▸, pigułka, kwoty w kolumnach) z jednym zdaniem (✅ wszystkim starczy + ile zostanie / 🟡 na styk / ⚠️ komu zabraknie); po stuknięciu szczegóły jak wcześniej, otwarte zostają po przerysowaniu (`S.infoOpen.pbudw`), „Pokaż” z Na dziś otwiera ją sama
- [x] 🔔 Na dziś: rady o planie, „Czy starczy?”, Doradcy i wycenie nieruchomości zwinięte w „💡 Podpowiedzi” na dole, bez liczby na dzwonku (ostrzeżenia „nie starczy na rachunek” i koniec umowy zostają na górze)
- [x] 👆 Większe pole stuknięcia (ok. 44 px, bez zmiany wyglądu): ✓ przy opłatach, + / − przy kwocie, „Płaci”, „ⓘ”, rozwijane napisy (Termometr, Lista funduszy); sprawdzone, że nie zasłaniają sąsiednich przycisków

## Etap E. Nowe funkcje – wybór Matiego (23.11.2026: „zrób 2 i 3”)
- [–] Liczba „Na dziś” na ikonie aplikacji – na razie nie (Mati)
- [x] 💾 Trwałe przechowywanie: przy starcie `navigator.storage.persist()`, wynik w ⚙️ → Bezpieczeństwo → Diagnostyka („pamięć telefonu: trwała ✓ / zwykła”, `S.persist`)
- [x] 📲 Instrukcja „Dodaj wydatek” jednym stuknięciem: skrót w aplikacji Skróty (`#go=add`) jako widżet na ekranie głównym / blokady – ⚙️ → 🤖 Automaty → 🗣️ Siri i skróty → „📲 Przycisk na ekranie” (`widgetHelp` w `salary.js`); robot sprawdza na prawdziwej stronie
