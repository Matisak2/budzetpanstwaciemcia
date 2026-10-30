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

## Rezygnujemy
Wczytywanie wyciągów bankowych i historii z XTB, ulubione transakcje, przyciski „Dziś/Wczoraj”, kreska „gdzie powinniśmy być dziś”, przenoszenie niewydanego planu, rozliczenia Mati ↔ Wercia, symulator „Co jeśli?”, oznaczanie „zbędny”, Face ID, powiadomienia w kalendarzu, własna chmura zamiast Firebase, aplikacja ze sklepu, „Ile możemy dziś wydać”, własna klawiatura do kwot, przycisk ➕ na środku paska zakładek.

## Później
Kopia zapasowa na domowy NAS (5–10 TB) – Mati odezwie się, gdy kupi sprzęt.
