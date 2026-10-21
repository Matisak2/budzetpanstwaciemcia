# Budżet M&W – kontekst projektu dla Claude

Wspólna aplikacja budżetu domowego Matiego i Werci (Weroniki). Działa na telefonach obojga.
Adres: https://matisak2.github.io/budzetpanstwaciemcia/

## Jak pracować z właścicielem
- Mati jest lekarzem, **nie programuje**. Pisz po polsku, prosto, krok po kroku („za rączkę”) przy każdej czynności technicznej.
- Zmiany robisz sam: edytujesz pliki, testujesz, robisz commit i **push na `main`** – GitHub Pages publikuje w 1–2 min. Mati tylko odświeża aplikację.
- Przed większą zmianą krótko zaproponuj plan; drobne poprawki rób od razu.
- **Plan rozwoju jest w `PLAN.md`** (12 etapów uzgodnionych z Matim). Przed pracą przeczytaj go, a po skończeniu etapu odhacz zrobione punkty. Kolejny etap zaczynaj dopiero na wyraźną komendę Matiego. Przed każdym etapem poproś o pobranie kopii (⚙️ → Pobierz kopię).
- Dane wpisane przez Matiego i Wercię nigdy nie mogą zniknąć: zmiany w modelu danych rób jako migrację istniejących wpisów.
- Estetyka jest ważna (szczególnie dla Werci): **delikatne pastele**, zaokrąglone kształty, czcionka Nunito, czytelność. Unikaj ciemnych, mocnych kolorów.

## Architektura
- Bez build stepu i bez frameworków. `index.html` (sam HTML), `style.css`, moduły ES w `js/`:
  `util.js` (formatowanie, kwoty, daty), `data.js` (domyślne kategorie i konta, kolory pór roku i kategorii), `art.js` (rysunki kotów, ikonki kategorii), `logic.js` (czyste obliczenia: salda, plan, opłaty stałe, agregaty), `charts.js` (wykresy SVG), `cats.js` (Bailey i Ivo: pozy, miny, dodatki, sceny; rysunki generowane w kodzie, cache, każda kopia z własnymi id gradientów), `guide.js` (komunikaty kotków, święta i urodziny, „Pierwsze kroki”, „Co nowego” – przy każdym etapie dopisz wpis na początek `NEWS`), `app.js` (stan, Firebase, ekrany, akcje). Funkcje wywoływane z `onclick` są wystawione na `window` na końcu `app.js`.
- **Firebase** (projekt `budzet-panstwa-ciemcia`): Auth e-mail/hasło + **Firestore** z trwałym cache offline. SDK z gstatic, wersja zamrożona 10.14.1.
- Reguły Firestore (ustawione w konsoli Firebase, nie w repo): odczyt/zapis tylko dla dwóch zalogowanych adresów e-mail właścicieli w ścieżce `households/main/**`.
- Stara „Realtime Database” z pierwszej wersji aplikacji **nie jest używana** – reguły ustawione na `false`.
- PWA: `manifest.json`, `sw.js` (pliki aplikacji: sieć najpierw, kopia offline; SDK Firebase i fonty: cache). **Przy każdej zmianie podbij `CACHE` w `sw.js`** (`budzet-mw-vN`), a nowy plik dopisz do listy `SHELL`.
- Bailey (kotka, ur. 13.10.2025, ciemne uszy, brązowa łata na połowie pyszczka, ciemny ogon) i Ivo (kocur, ur. 16.03.2026, prawie biały, morelowe uszy, rude nad oczami, na co dzień spokojna mina, naburmuszony tylko przy irytacji). Ustawienie na telefonie: `mw_kotki` = lots / few / off.
- Ikony: `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` – żółty domek z dwoma ragdollami (ciemny: brązowe uszy, czoło i łata na jednej połowie pyszczka; jasny: biały z morelowymi uszami).

## Model danych (Firestore, wszystko pod `households/main`)
- `households/main` – ustawienia jako mapy (żeby dwa telefony nie nadpisywały sobie zmian):
  `accsM{id:{name,grp:'cur'|'sub'|'sav'|'inv' (`sub` = subkonto, osobno od oszczędności i poduszki),owner:'Mati'|'Wercia'|'Wspólne',open,archived?,o}}`,
  `catsM{id:{name,type:'inc'|'exp',icon?,hue,o,subsM{id:{name,o}}}}` (`hue` = stały pastelowy kolor kategorii),
  `fixedM{id:{name,amount,day,sub,acc,kind:'exp'|'inc',vary?,ppk?}}`, `roundM{id:{from,to,step:5|10,mult,full,since:'YYYY-MM-DD',o}}` (reguły drobnych: jedna na konto źródłowe; liczone od `since`), `savTarget` (cel oszczędzania; zapis ustawień przez `saveCfg` zachowuje go razem z innymi polami), flagi migracji (`invAcc`, `ikeAcc`, `wspAcc`, `ppkAcc`, `zwrotyRen`, `subAcc`).
- `households/main/months/{YYYY-MM}` → `{tx:{id:{type,amount,date,sub,acc,to,who,note,deleted,ts,...}}}`
  - `type`: `exp`, `inc`, `tr` (przelew), `adj` (wyrównanie; `val:true` = zmiana wartości inwestycji), `inv`/`invs` (stary moduł inwestycji).
  - Kwoty w **groszach** (int). Usuwanie = `deleted:true` (umożliwia „Cofnij”).
  - Dodatkowe pola: `fixedId` (odhaczona opłata/przychód stały), `ppk:'own'|'emp'` + `ppkOf` (wpłaty PPK powiązane z pensją), `refundOf` (zwrot: `type:'inc'` na pozycji wydatku → zmniejsza wydatek, nie jest przychodem), `split` (wspólny identyfikator części jednego paragonu; każda część to osobna transakcja), `roundOf` (drobne: przelew `tr` z notatką „🪙 drobne” powiązany z wydatkiem; edycja ani usunięcie wydatku go nie zmienia, w Rejestrze pokazany pod wydatkiem). Usunięcie wydatku usuwa też jego zwroty i wpłaty PPK.
- `households/main/plans/{YYYY-MM}` → `{subId: grosze}`
- `households/main/goals/{id}` → cele-koperty `{name,target,alloc,deadline,owner}`
- `households/main/inv/{id}` → stary moduł inwestycji (zakupy/sprzedaże) – tylko do odczytu/usunięcia.
- `households/main/meta/backup` → data ostatniej kopii.

## Zakładki aplikacji
Okienko transakcji: kwota z + / − (sumowanie), notatka, wybór pozycji w osobnym oknie (wyszukiwarka, „Ostatnio używane”, podpowiedź po notatce, kafelki kategorii), dzielenie paragonu, „Kto” według właściciela konta (osoba telefonu tylko z ⚙️), ↩️ zwrot.
Budżet (plan / wydano / % z pastelowymi kategoriami, puste pole planu = 0 zł → wydatek bez planu jest „poza planem”; filtr Wszystko / Przekroczone / Bez planu; powitanie) · Rejestr (kategoria w jej kolorze, wyszukiwarka także po kwocie `>200`, `100-300`, filtry) · Stałe (przychody i opłaty stałe, PPK) · Analiza (miesiąc / rok) · Oszczędności (Razem / Mati / Wercia (różowa, kwiatki) / Wspólne; konta, IKE, IKZE, PPK, cele-koperty, poduszka) · Konta (Wszyscy / Mati / Wercia / Wspólne, grupy: bieżące, subkonta, oszczędności, inwestycje; wyrównanie wszystkich sald naraz) · ⚙️ Ustawienia (🪙 reguły drobnych, kotki, kto korzysta z telefonu, konta, kategorie, kopia .json, import). Drobne: złota moneta w okienku wydatku (domyślnie zaznaczona) przy koncie z regułą; obliczenie `roundUp` w `logic.js`.
Kolor nagłówka i tło zmieniają się co miesiąc (pastele pór roku, tablica `SEASON`). Każda kategoria ma jeden kolor (`hue`) używany wszędzie: tło w Budżecie (`pastel`), ikonki w Rejestrze i oknie wyboru, wykresy w Analizie (`catMark`). Kolory osób: `OWN_COL` w `data.js`.

## Import danych
⚙️ → „Wczytaj kopię (.json)” obsługuje: pełną kopię (`format:'budzet-mw-2'`), starą wersję aplikacji oraz listę transakcji `format:'budzet-mw-tx'` (`{tx:[{id,date,type,amount(grosze),cat,sub,acc,to,note,who}]}`) z dopasowaniem nazw pozycji i kont. Stałe `id` zapobiegają duplikatom.

## Testowanie
Brak testów w repo. Sprawdzaj w przeglądarce headless (Playwright) z podmienionymi modułami Firebase (stub `firebase-app/auth/firestore`), na szerokości 390 px. Przed push: `eslint` z regułą `no-undef` na `js/` (wyłapuje brakujące importy między modułami) i `node --check` na plikach.
