# Naprawione w trakcie audytu 2 (24.11.2026)

Każda poprawka: kilka linijek, osobny commit, test robota, który łapie błąd (sprawdzone: bez poprawki test jest czerwony), pełny zestaw testów zielony. Telefony dostały je w 2 wysyłkach: **v110** i **v111**.

## 1. Plan doradcy nie mówił, że akcje obciął z powodu reakcji na spadek
- **Było:** `js/advisor.js:233` – przy porządkach w etapie B linijka `if(eqR<100)why.push('reakcja na spadek → akcje do …%')` trafiła na koniec komentarza `// …` i przestała działać. Plan liczył się dobrze (np. 20% akcji), ale w „dlaczego” brakowało powodu.
- **Dowód:** `planP({q42:'10-20',q44:'0.5',q43:'all'})` → akcje 20%, a `why` miało tylko 2 linijki (horyzont, spadek).
- **Zmiana:** komentarz zamknięty w `/* */`. Test w `calc.mjs`.
- **Commit:** `2f3f61f` (v110).

## 2. Rozwinięta osoba w „Czy starczy?” zwijała się sama
- **Było:** `js/actions.js:599` – sama karta pamiętała, że jest otwarta (`S.infoOpen.pbudw`), ale wiersz osoby w środku (`details.pbr`) zwijał się przy każdym przerysowaniu, np. gdy drugi telefon coś zapisał.
- **Dowód:** demo – otwarta karta i osoba, `render()` → karta otwarta, osoba zwinięta.
- **Zmiana:** to samo zapamiętanie co przy karcie (`infoTog('pbr'+osoba)`). Test w `flows.mjs`.
- **Commit:** `2a1d2af` (v110).

## 3. 🟠 „📈 Aktualizuj wartości” kasowało ręcznie wpisaną wartość konta inwestycyjnego
- **Było:** `js/savings.js:26–29` (`instDiff`, dodane w etapie B) – gdy konto nie ma już żadnego instrumentu, sumowało **wszystkie** zmiany wartości konta i proponowało ich zdjęcie. Każde „Zapisz wszystko” z pustym polem („Puste pole = bez zmian”) zdejmowało więc także wartość wpisaną ręcznie. To samo robiło „Zapisz wycenę” automatu.
- **Dowód:** demo (skrypt podagenta, powtórzony): wpisane 12 345,67 zł → „Zmiana wartości +2 321,67”; drugie „Zapisz wszystko” bez wpisywania → sama „Zmiana wartości −2 321,67”.
- **Zmiana:** zdejmowane są tylko wyceny zrobione przez instrumenty (notatka „Wycena instrumentów…” albo wpis automatu) – raz, potem suma jest 0. Wycena liczona z instrumentów w „Aktualizuj wartości” dostaje teraz notatkę „Wycena instrumentów” (wcześniej „Zmiana wartości”, jak wpis ręczny). Test w `flows.mjs` (wycena schodzi raz, ręczna wartość zostaje).
- **Uwaga:** wyceny zrobione przed dziś przez „Aktualizuj wartości” mają starą notatkę „Zmiana wartości” – po usunięciu ostatniego instrumentu aplikacja ich nie zdejmie sama; wystarczy wtedy wpisać prawdziwą wartość konta w „Wartość dziś”.
- **Commit:** `f971c0f` (v110).

## 4. „Czego używamy” nie widziało karty „Czy starczy?”
- **Było:** `js/usage.js:39` – od 23.11 tytuł karty to „CZY STARCZY?” (wielkie litery w tekście), a katalog ma „Czy starczy?”. Licznik zbierał się pod innym kluczem, więc w „nieużywane od 3 miesięcy” karta wyszłaby jako nieużywana – a na tych danych mają zapaść decyzje o chowaniu funkcji.
- **Dowód:** demo – tytuły wszystkich kart `section.chart`: jedyna wielkimi literami to „CZY STARCZY?”.
- **Zmiana:** `cardKey` zamienia tytuł pisany w całości wielkimi literami na zwykły. Liczniki z 23–24.11 zostają pod starym kluczem (jeden dzień).
- **Commit:** `b8d5581` (v110).

## 5. Zapisanie paska pensji wyciszało wieczorne „Wpiszcie dzisiejsze wydatki”
- **Było:** `js/today.js:215` `typedToday` – po zmianie w etapie A („dopisane dziś” po `ts`) liczył się też wpływ i potrącenia z paska zapisanego dziś. Wpisanie paska wieczorem = brak przypomnienia o wydatkach (w aplikacji i w powiadomieniu o 20:00). Do tego wpis z uszkodzonym `ts` (np. z ręcznie poprawionej kopii) wywracał listę „Na dziś” i powiadomienie (`RangeError`).
- **Dowód:** test – pasek z dzisiejszym `ts` → `true`; `ts:'abc'` → wyjątek.
- **Zmiana:** pomijane `slip`/`slipOf` (jak odhaczone stałe i PPK), `ts` sprawdzany przed odczytem daty. Testy w `calc.mjs`.
- **Commit:** `ef8a5c8` (v111).

## 6. Poduszka w mailu inna niż w aplikacji
- **Było:** `scripts/mail-lib.mjs:45` – mail z podsumowaniem października liczył średnie wydatki z kwietnia–września (bez października), a aplikacja 1.11 – z maja–października. Komentarz obiecywał „tę samą poduszkę co w aplikacji”.
- **Dowód:** test – mail 0,29 mies., aplikacja 0,25 mies. na tych samych danych.
- **Zmiana:** mail podaje `ym` = miesiąc po podsumowanym. Test w `calc.mjs`.
- **Commit:** `68db7b5` (v111).

## 7. „Czego używamy” nie znało karty planu doradcy
- **Było:** `js/usage.js:24` – karta „📄 Mój plan / Propozycja planu” nie była w katalogu `USAGE_CAT`, więc nie pokazałaby się jako nieużywana.
- **Zmiana:** dopisana jako „Mój plan” (obie nazwy = jedna karta).
- **Commit:** `5b6a98c` (v111).

## 8. Przewodnik obiecywał skróty po przytrzymaniu ikony na iPhonie
- **Było:** `js/guide.js:252` (HELP „Siri i skróty”): „Przytrzymanie ikony aplikacji na ekranie telefonu też pokazuje skróty (Nowy wydatek, Na dziś)”. Safari na iOS nie obsługuje `shortcuts` z manifestu (caniuse / MDN: brak w iOS do 26.6 i 27.0; działa na Macu od Safari 17.4 i na Androidzie) – na Waszych iPhone'ach to nie działa.
- **Zmiana:** tekst mówi, że skróty z przytrzymania są na Androidzie i Macu, a na iPhonie służy do tego „📲 Przycisk na ekranie”. Wpis `shortcuts` w `manifest.json` zostaje (nie szkodzi).
- **Commit:** `621c303` (v112).

## Wysyłki
| Wersja | Poprawki |
|---|---|
| v110 | 1, 2, 3, 4 |
| v111 | 5, 6, 7 |
| v112 | 8 |
