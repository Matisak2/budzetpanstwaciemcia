# Budżet M&W – kontekst projektu dla Claude

Wspólna aplikacja budżetu domowego Matiego i Werci (Weroniki). Działa na telefonach obojga.
Adres: https://matisak2.github.io/budzetpanstwaciemcia/

## Jak pracować z właścicielem
- Mati jest lekarzem, **nie programuje**. Pisz po polsku, prosto, krok po kroku („za rączkę”) przy każdej czynności technicznej.
- Zmiany robisz sam: edytujesz pliki, testujesz, robisz commit i **push na `main`** – GitHub Pages publikuje w 1–2 min. Mati tylko odświeża aplikację.
- Przed większą zmianą krótko zaproponuj plan; drobne poprawki rób od razu.
- Estetyka jest ważna (szczególnie dla Werci): **delikatne pastele**, zaokrąglone kształty, czcionka Nunito, czytelność. Unikaj ciemnych, mocnych kolorów.

## Architektura
- Jeden plik `index.html` (HTML + CSS + JS jako `<script type="module">`), bez build stepu i bez frameworków.
- **Firebase** (projekt `budzet-panstwa-ciemcia`): Auth e-mail/hasło + **Firestore** z trwałym cache offline. SDK z gstatic, wersja zamrożona 10.14.1.
- Reguły Firestore (ustawione w konsoli Firebase, nie w repo): odczyt/zapis tylko dla dwóch zalogowanych adresów e-mail właścicieli w ścieżce `households/main/**`.
- Stara „Realtime Database” z pierwszej wersji aplikacji **nie jest używana** – reguły ustawione na `false`.
- PWA: `manifest.json`, `sw.js` (index.html: sieć najpierw; SDK Firebase i fonty: cache). **Przy każdej zmianie podbij `CACHE` w `sw.js`** (`budzet-mw-vN`).
- Ikony: `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` – żółty domek z dwoma ragdollami (ciemny: brązowe uszy, czoło i łata na jednej połowie pyszczka; jasny: biały z morelowymi uszami).

## Model danych (Firestore, wszystko pod `households/main`)
- `households/main` – ustawienia jako mapy (żeby dwa telefony nie nadpisywały sobie zmian):
  `accsM{id:{name,grp:'cur'|'sav'|'inv',owner:'Mati'|'Wercia'|'Wspólne',open,archived?,o}}`,
  `catsM{id:{name,type:'inc'|'exp',icon?,o,subsM{id:{name,o}}}}`,
  `fixedM{id:{name,amount,day,sub,acc,kind:'exp'|'inc',vary?,ppk?}}`, `savTarget`, flagi migracji (`invAcc`, `ikeAcc`, `wspAcc`, `ppkAcc`).
- `households/main/months/{YYYY-MM}` → `{tx:{id:{type,amount,date,sub,acc,to,who,note,deleted,ts,...}}}`
  - `type`: `exp`, `inc`, `tr` (przelew), `adj` (wyrównanie; `val:true` = zmiana wartości inwestycji), `inv`/`invs` (stary moduł inwestycji).
  - Kwoty w **groszach** (int). Usuwanie = `deleted:true` (umożliwia „Cofnij”).
  - Dodatkowe pola: `fixedId` (odhaczona opłata/przychód stały), `ppk:'own'|'emp'` + `ppkOf` (wpłaty PPK powiązane z pensją).
- `households/main/plans/{YYYY-MM}` → `{subId: grosze}`
- `households/main/goals/{id}` → cele-koperty `{name,target,alloc,deadline,owner}`
- `households/main/inv/{id}` → stary moduł inwestycji (zakupy/sprzedaże) – tylko do odczytu/usunięcia.
- `households/main/meta/backup` → data ostatniej kopii.

## Zakładki aplikacji
Budżet (plan / wydano / % z pastelowymi kategoriami, powitanie) · Rejestr (wyszukiwarka, filtry) · Stałe (przychody i opłaty stałe, PPK) · Analiza (miesiąc / rok) · Oszczędności (Razem / Mati / Wercia (różowa, kwiatki) / Wspólne; konta, IKE, IKZE, PPK, cele-koperty, poduszka) · Konta (salda, wyrównanie wszystkich sald naraz) · ⚙️ Ustawienia (kto korzysta z telefonu, konta, kategorie, kopia .json, import).
Kolor nagłówka i tło zmieniają się co miesiąc (pastele pór roku, tablica `SEASON`).

## Import danych
⚙️ → „Wczytaj kopię (.json)” obsługuje: pełną kopię (`format:'budzet-mw-2'`), starą wersję aplikacji oraz listę transakcji `format:'budzet-mw-tx'` (`{tx:[{id,date,type,amount(grosze),cat,sub,acc,to,note,who}]}`) z dopasowaniem nazw pozycji i kont. Stałe `id` zapobiegają duplikatom.

## Testowanie
Brak testów w repo. Sprawdzaj w przeglądarce headless (Playwright) z podmienionymi modułami Firebase (stub `firebase-app/auth/firestore`), na szerokości 390 px. Przed push: `node --check` na wyciętym skrypcie modułu.
