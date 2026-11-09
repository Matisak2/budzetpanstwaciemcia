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
- [ ] Do decyzji Matiego (z przeglądu 5.11): B – mocniejsze ostrzeżenie „Ujemne saldo” (wszystkie konta, pilne, codzienne powiadomienie), C – „Nie starczy na rachunki” 7 dni w przód z wydatkami rocznymi i ratami, D – ujemne saldo na czerwono w Kontach

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
- [ ] Etap 2 (na komendę Matiego): plan a rzeczywistość dla każdej osoby (czy ktoś nie zapłacił ze swojego konta za coś wspólnego), podpowiedź kwoty przelewu na wspólne (po połowie)

## Rezygnujemy
Wczytywanie wyciągów bankowych i historii z XTB, ulubione transakcje, przyciski „Dziś/Wczoraj”, kreska „gdzie powinniśmy być dziś”, przenoszenie niewydanego planu, rozliczenia Mati ↔ Wercia, symulator „Co jeśli?”, oznaczanie „zbędny”, Face ID, powiadomienia w kalendarzu, własna chmura zamiast Firebase, aplikacja ze sklepu, „Ile możemy dziś wydać”, własna klawiatura do kwot, przycisk ➕ na środku paska zakładek.

## Później
Kopia zapasowa na domowy NAS (5–10 TB) – Mati odezwie się, gdy kupi sprzęt.
