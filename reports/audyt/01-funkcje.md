# Etap 1 – Spis wszystkich funkcji

> Przegląd E1 (podagent): wersja demo w Playwright, `devices['iPhone 13']` (390×664, dotyk), pl-PL, Europe/Warsaw, „dziś” = 15.11.2026, rola Mati. Skrypt stukał **prawdziwe przyciski** i liczył stuknięcia (stuknięcie w pole się liczy, pisanie nie), każda ścieżka od świeżych danych demo i ekranu Budżet. Na żadnej ścieżce nie było błędu JavaScript ani elementu trwale poza ekranem. Zgłoszenia oznaczone ✅ naprawiłem (numery z `NAPRAWIONE.md`). Przewodnik HELP: 92 pozycje w 7 sekcjach, NEWS do v68. Zrzuty z ekranów demo: `reports/audyt/zrzuty/`.

## Dodanie wydatku 25 zł „Biedronka” → Jedzenie / Zakupy spożywcze (od Budżetu do zapisu)
| Ścieżka | Stuknięcia | Kolejność |
|---|---|---|
| Siri / skrót `#go=add&amount=25&note=Biedronka` (**najkrótsza**) | **1** | Zapisz (pozycja podpowiada się sama po notatce) |
| Notatka wpisana w całości | **4** (3, jeśli klawiatura otworzy się sama) | ＋ → pole kwoty → pole notatki („Biedronka” → pozycja ustawia się sama, „💡 podpowiedziane po notatce”) → Zapisz |
| Notatka „Bied” + podpowiedź | 5 | ＋ → kwota → notatka → chip „Biedronka” (83×34) → Zapisz |
| Bez notatki, „Ostatnio używane” | 5 | ＋ → kwota → Pozycja → chip „Zakupy spożywcze” (143×35) → Zapisz |
| Bez notatki, kafelek kategorii | 6 | ＋ → kwota → Pozycja → kafelek „Jedzenie” → wiersz pozycji → Zapisz |
| Z konta wspólnego (jak w danych demo) | 5 (+1 na iPhonie: „Gotowe” w kole wyboru) | ＋ → kwota → notatka → Konto → Zapisz |
Podpowiedź po notatce ustawia pozycję, ale nie konto (zapisane na „Konto Kuba”, choć wszystkie wcześniejsze „Biedronka” są na koncie wspólnym). Druga taka sama kwota tego dnia → okienko „Taki wpis już jest” (+1).

## Zgłoszenia
### ✅12 🟠 „Policz” (Gdzie wpłacić) i „Analizuj” (Piaskownica) nic nie pokazują, dopóki otwarta jest klawiatura
- Miejsce: js/advisorui.js:280–282 (`calcWhere`), :437–439 (`sandCalc`); js/app.js:62 (`render` wstrzymany, gdy fokus jest w polu w `#app` – `S.pend`); podobnie `saveValues` (js/savings.js:147 – „Zapisz” w 📈 Aktualizuj wartości)
- Opis: kwotę wpisuje się z klawiatury, potem stuka „🐾 Policz”. Przycisk nie zabiera fokusu z pola, więc `render()` czeka na `focusout` – wynik (`#wRes`, „W co”, „Zapisz poradę”) pojawia się dopiero po schowaniu klawiatury albo drugim stuknięciu. Wygląda, jakby przycisk nie działał. `slipSuggest`/`slipNetto`/`setF` robią `activeElement.blur()` właśnie z tego powodu – tu go brakuje. Po „Zapisz” w Aktualizuj wartości toast jest, ale strona zostaje otwarta.
- Dowód: j3.mjs – po stuknięciu „Policz”: `{ae:"wAmt", wRes:false, pend:true}`; po `blur()`: `{wRes:true}`; piaskownica: `{ae:"sAmt", res:true, sRes:false}`; wartości: `{values:false, ae:"INPUT"}` (strona dalej narysowana).
- Pewność: potwierdzone w emulacji iPhone 13 (Chromium); na prawdziwym Safari prawdopodobne (Safari nie przenosi fokusu na przycisk).
- Propozycja: `if(document.activeElement)document.activeElement.blur()` przed `render()` w `calcWhere`, `sandCalc`, `saveValues` (albo ogólnie w funkcjach wołanych z przycisków stron z polami). S, oczywisty drobny błąd: tak.

### 🟡 Małe cele dotyku w codziennych czynnościach (< 44 px)
- Miejsce: style.css / ekrany (zmierzone `boundingBox`)
- Opis: ✓ odhaczenie opłaty stałej **30×30** (📌 Stałe – najczęstsza czynność tam), kalkulator „+ / −” przy kwocie 30×30, chip „Płaci” w Budżecie 28 px wys., pole planu pozycji 32 px, nazwa pozycji `.subln` 32 px, ‹ › 40×44 i 🔍🔔⚙️ 38×44 w nagłówku, przyciski w „Na dziś” 34 px, podpowiedź notatki 34 px, chipy „Ostatnio używane” 35 px, osoby w Kontach 79×34, filtry Budżetu 36 px. Najgorsze: `summary` „🌡️ Termometr rynku” i „📋 Lista funduszy” **18 px** wysokości, „ⓘ” w Oszczędnościach 13×32. Na ekranach: Kategorie 81 z 83 elementów < 44 px, Oszczędności 33/38, Stałe 25/28.
- Dowód: j4.mjs, `res-jallmjs.json` (pola `small`, `smallHere`).
- Pewność: potwierdzone (pomiar). Propozycja: min-height 44 px dla ✓ stałych, summary termometru/listy funduszy i ⓘ (padding, bez zmiany wyglądu). S; oczywisty drobny: tak dla ✓/summary/ⓘ, reszta to decyzja o wyglądzie.

### ✅13 🟡 Przelew z kaskady ma tytuł „Wypłata na konto bieżące”
- Miejsce: js/sheet.js:187 (`pre?.from?'Wypłata na konto bieżące':…`)
- Opis: każdy przelew otwierany z `from` dostaje ten tytuł – także kaskada nadwyżek (krok 3 zamknięcia, „→ 12 197,92 zł” w Oszczędnościach osoby), czyli przelew Z bieżącego NA IKE. Myli przy zamknięciu miesiąca.
- Dowód: ścieżki „Zamknięcie: krok 3 kaskada przelew” i „Oszczędności: kaskada → przelew” – nagłówek okienka „Wypłata na konto bieżące”, konto Z = Konto Kuba, Na = IKE Kuba.
- Pewność: potwierdzone. Propozycja: tytuł wg grupy konta `to` („Wpłata” gdy cel to sav/inv). S, tak.

### 🟡 Kwota nie dostaje klawiatury na iPhonie (fokus w `setTimeout`)
- Miejsce: js/sheet.js:188 (`setTimeout(()=>$('ma').focus(),80)`)
- Opis: iOS Safari otwiera klawiaturę tylko przy `focus()` w trakcie gestu; po 80 ms pole dostaje fokus bez klawiatury → przy każdym wpisie dodatkowe stuknięcie w pole kwoty (4 zamiast 3).
- Dowód: w Chromium `activeElement=ma` od razu; na iOS nie da się tego sprawdzić w tym środowisku.
- Pewność: prawdopodobne. Propozycja: `focus()` synchronicznie w obsłudze ＋ (bez timeoutu, ew. z `preventScroll`). S; tak, ale wymaga sprawdzenia na telefonie.

### ✅14 🟡 HELP nieaktualny (opisane inaczej niż działa)
- Miejsce: js/guide.js – HELP „🥧 Z czego składa się majątek”: „To pierwszy krok doradcy… potem (w kolejnych etapach) – jak ma być” – doradca D1–D7 jest gotowy (plan, widełki pod kołem). HELP „🧹 Strażnik porządku”: „ujemne saldo konta bieżącego” – od 22.11 dotyczy kont bieżących, subkont i oszczędności i jest pilnym punktem codziennie (`neg:`).
- Pewność: potwierdzone (tekst + demo: widełki pod kołem są). S, tak.

### 💡 Pomysły
- Podpowiedź po notatce mogłaby ustawiać też konto z ostatnich wpisów tej notatki (Biedronka → konto wspólne) – oszczędza 1–2 stuknięcia przy wspólnych zakupach.
- Edycja celu na „Razem” nie ma przycisku (tylko w zakładce osoby/Wspólne – „Edytuj”); instrument nie otwiera się stuknięciem nazwy (przyciski „+ Zakup / Sprzedaż / ✎ Cena / ⋯”) – spójniej byłoby stuknąć wiersz.

## Porównanie z HELP (92 pozycje) i CLAUDE.md
(a) Istnieją w aplikacji, brak osobnego opisu w HELP: 🗑️ przywracanie usuniętego **celu** (decyzja 22.11 – sprawdzone w demo: usuń → ⚙️ Bezpieczeństwo → „Przywróć”, toast „Przywrócono cel 🎯”; HELP „Ostatnio usunięte” mówi tylko o wpisach), 🌊 kaskada nadwyżek (tylko wzmianka w „Zamknięcie” i „Oszczędności”, brak opisu, jak liczy i kiedy), 🔀 „Połącz z inną pozycją” (menu pozycji w ⚙️ Kategorie), 🔢 Diagnostyka / numer wersji (⚙️ Bezpieczeństwo), kolory nagłówka wg pór roku, „Kto korzysta” (osobny przełącznik w ⚙️ Ten telefon – tylko jednym słowem w „Ustawienia – kafelki”), „📊 Czego używamy” nie wymienione w opisie kafelka 📖 Pomoc (HELP „Ustawienia – kafelki”).
(b) Opisane, a działa inaczej: dwa punkty wyżej (🥧 „kolejne etapy”, 🧹 „konto bieżące”). Reszta sprawdzonych opisów zgodna z demo: podpowiedź notatki → pozycja, „Zapisz i dodaj kolejny”, podwójny wpis, gwarancja od 300 zł, kalkulator + / − (= 15,00 zł), dzielenie paragonu, przytrzymanie (Duplikuj / Zwrot / Otwórz / Usuń), zmiana miesiąca palcem, Rejestr `>100`, filtry, 6 kafelków ⚙️, „Płaci” przy pozycji, „Czy starczy?”, 5 kroków zamknięcia (stan „1 z 5”), Na dziś + ⏳ Wkrótce, lupa, Wrapped, podsumowanie roku, ankieta (61 pytań), plan, cele doradcy, piaskownica, termometr, koło majątku, analiza funduszy, odsetki, Ostatnio usunięte (wpis przywrócony w 6 stuk.).
Nie dało się sprawdzić w demo (wyłączone w `DEMO` albo brak danych): ⚙️ Automaty (powiadomienia, maile, Siri – w demo tylko „Imię drugiej osoby”), 🎂 urodziny i 🔒 przypisanie loginu, wylogowanie, „📷 Pobierz kopię ze zdjęciami”, prawdziwe zdjęcie (otwiera wybór pliku), 🔻 spłata i 🏷️ projekt w okienku wpisu (demo nie ma zobowiązań ani projektów – przyciski ukryte), 🪙 drobne (demo nie ma reguł, `round:[]`), JDG, pożyczki dla kogoś.

## Tabela funkcji (stuknięcia od ekranu Budżet, zmierzone skryptem)
Kolumna „Uwagi” = elementy < 44 px stuknięte po drodze. Dodatkowo: odhaczenie opłaty z potwierdzeniem = 3; usunięcie wpisu → przywrócenie z ⚙️ = 6; usunięcie celu → przywrócenie = 8; przytrzymanie wpisu = 1 stuk. + przytrzymanie (550 ms).
| Funkcja | Gdzie | Stuk. | Co otwiera / robi (ekran po ostatnim stuknięciu) | Uwagi (cele < 44 px na ścieżce) |
|---|---|---|---|---|
| Budżet: filtr ▲ Ponad plan | Budżet | 1 | Budżet – zmiana na miejscu | setBF |
| Budżet: filtr Bez planu | Budżet | 1 | Budżet – zmiana na miejscu | setBF |
| Budżet: rozwinięcie kategorii | Budżet | 1 | Budżet – zmiana na miejscu |  |
| Budżet: pozycja → wpisy pozycji (subTx) | Budżet → kategoria → nazwa pozycji | 2 | 🛒 Zakupy spożywcze Listopad · plan 1 400,00 zł · wydano 952,72 zł · 6  | #app .subln 130×32 |
| Budżet: subTx → ＋ Dodaj z pozycją | subTx | 3 | Nowa transakcja Wydatek Przychód Przelew Kwota (zł) + − Data Notatka P | #app .subln 130×32, ＋ Dodaj 163×42 |
| Budżet: 👥 Płaci (kto płaci) | Budżet → kategoria → chip Płaci | 2 | 👥 Kto płaci: Zakupy spożywcze Listopad: plan 1 400,00 zł. Kuba Ola Wsp | #app setPay |
| Budżet: pusta pozycja „＋ N pustych” | Budżet → kategoria | 2 | Budżet – zmiana na miejscu | #app [onclick*="showEmpty"], |
| Budżet: wpis planu pozycji (pole planu) | Budżet → kategoria | 2 | Budżet – zmiana na miejscu | #app .sub input 101×32 |
| Budżet: kategoria pusta (chip na dole) | Budżet | 1 | Budżet – zmiana na miejscu | showCat |
| Budżet: Na kontach › (majątek) | Budżet kafelek | 1 | 👛 Konta – Salda |  |
| Budżet: Odłożone w tym miesiącu › | Budżet | 1 | Oszczędności – zmiana na miejscu |  |
| Budżet: 👥 Czy starczy – szczegóły osoby | Budżet dół | 1 | Budżet – zmiana na miejscu |  |
| Budżet: ⓘ Jak to liczę (Czy starczy) | Budżet dół | 1 | Budżet – zmiana na miejscu | #pbud details.info summary 8 |
| Budżet: 🗓️ Zamknięcie miesiąca | Budżet dół | 1 | strona zamknięcia (stan kroku zmieniony) | openClose |
| Zamknięcie: krok 1 ✓ Zgadza się | Zamknięcie | 2 | strona zamknięcia (stan kroku zmieniony) | openClose, reconOk |
| Zamknięcie: krok 1 Wyrównaj wszystkie | Zamknięcie | 2 | Bieżące i subkonta Oszczędności ⚖️ Konta bieżące i subkonta · stan na  | openClose, closeRecAll |
| Zamknięcie: krok 1 ✓ Gotowe | Zamknięcie | 2 | strona zamknięcia (stan kroku zmieniony) | openClose, closeStep |
| Zamknięcie: krok 2 plan z ponad planu | Zamknięcie | 2 | strona zamknięcia (stan kroku zmieniony) | openClose, closePlan |
| Zamknięcie: krok 2 ✓ Przejrzane | Zamknięcie | 2 | strona zamknięcia (stan kroku zmieniony) | openClose, closeStep |
| Zamknięcie: krok 3 kaskada przelew | Zamknięcie | 2 | Wypłata na konto bieżące Wydatek Przychód Przelew Kwota (zł) + − Data  | openClose, #app openTx |
| Zamknięcie: krok 3 ✓ Gotowe | Zamknięcie | 2 | strona zamknięcia (stan kroku zmieniony) | openClose, closeStep |
| Zamknięcie: krok 4 ✓ Plan gotowy | Zamknięcie | 2 | strona zamknięcia (stan kroku zmieniony) | openClose, closeStep |
| Zamknięcie: krok 5 Przydziel do celu | Zamknięcie | 2 | Przydziel do: Wakacje Do przydzielenia: 36 500,00 zł Kwota (zł) Anuluj | openClose, allocGoal |
| Zamknięcie: krok 5 ✓ Gotowe | Zamknięcie | 2 | strona zamknięcia (stan kroku zmieniony) | openClose, closeStep |
| Budżet: + Projekt | Budżet dół | 1 | Nowy projekt Projekt nie odkłada pieniędzy – liczy, ile coś kosztuje ( | editProj |
| Budżet: Analiza | Budżet | 1 | ‹ Budżet Miesiąc Rok Podstawowa Pełna PRZYCHODY 7 828,63 zł = jak popr |  |
| Nagłówek: ‹ poprzedni miesiąc | nagłówek | 1 | PRZYCHODY 14 811,88 zł plan 14 300 zł · 104% planu WYDATKI 5 806,78 zł | #prevM 40×44 |
| Nagłówek: › następny miesiąc (planowanie) | nagłówek | 1 | PRZYCHODY 0,00 zł plan 14 300 zł · 0% planu WYDATKI 0,00 zł plan 7 495 | #nextM 40×44 |
| Planowanie: Skopiuj plan z poprzedniego | › następny ×2 | 3 | Skopiować plan? Plan z miesiąca Grudzień zastąpi plan na Styczeń. Anul | #nextM 40×44, Skopiuj plan 255×36 |
| Nagłówek: 🔔 Na dziś | nagłówek | 1 | 🔔 Na dziś Kilka rzeczy na dziś. Spokojnie, po kolei. 📅 Wydatki roczne: | #todayBtn 38×44 |
| Na dziś: ⏳ Wkrótce | Na dziś | 2 | 🔔 Na dziś Kilka rzeczy na dziś. Spokojnie, po kolei. 📅 Wydatki roczne: | #todayBtn 38×44 |
| Na dziś: punkt → Zacznij (zamknięcie) | Na dziś | 2 | strona zamknięcia (stan kroku zmieniony) | #todayBtn 38×44, Zacznij 63×34 |
| Na dziś: Pomiń | Na dziś | 2 | 🔔 Na dziś Kilka rzeczy na dziś. Spokojnie, po kolei. 📅 Wydatki roczne: | #todayBtn 38×44, Pomiń 63×34 |
| Nagłówek: 🔍 Szukaj | nagłówek | 2 | 🔍 Szukaj Zamknij WPISY (7) 🛒 Zakupy spożywcze Biedronka · Konto wspóln | #findBtn 38×44 |
| Szukaj → otwórz wynik | lupa | 3 | Edytuj transakcję Wydatek Przychód Przelew Kwota (zł) + − Data Notatka | #findBtn 38×44 |
| Nagłówek: ⚙️ Ustawienia | nagłówek | 1 | 🏦 Konta dodaj, zmień, oprocentowanie, archiwum 🗂️ Kategorie i drobne p |  |
| Wpis: Przychód | ＋ | 2 | Nowa transakcja Wydatek Przychód Przelew Kwota (zł) + − Data Notatka P | #mt [data-v=inc] 119×39 |
| Wpis: Przelew | ＋ | 2 | Nowa transakcja Wydatek Przychód Przelew Kwota (zł) + − Data Notatka Z | #mt [data-v=tr] 119×39 |
| Wpis: kalkulator + (sumowanie) | ＋ | 3 | Nowa transakcja Wydatek Przychód Przelew Kwota (zł) + − = 15,00 zł Dat | .cop[data-op="+"] 30×30 |
| Wpis: data | ＋ | 2 | Nowa transakcja Wydatek Przychód Przelew Kwota (zł) + − Data Notatka P |  |
| Wpis: ✂️ Podziel paragon | ＋ | 2 | Nowa transakcja Wydatek Przychód Przelew Kwota (zł) + − Data Notatka P | #splitBtn 231×36 |
| Wpis: ✂️ + Kolejna pozycja | ＋ | 3 | Nowa transakcja Wydatek Przychód Przelew Kwota (zł) + − Data Notatka P | #splitBtn 231×36, #splitAdd 336×36 |
| Wpis: konto (select) | ＋ | 2 | Nowa transakcja Wydatek Przychód Przelew Kwota (zł) + − Data Notatka P |  |
| Wpis: Kto (select) | ＋ | 2 | Nowa transakcja Wydatek Przychód Przelew Kwota (zł) + − Data Notatka P |  |
| Wpis: 🌍 obca waluta | ＋ → dodatki | 2 | Nowa transakcja Wydatek Przychód Przelew Kwota (zł) + − Data Notatka P | #fxBtn 199×36 |
| Wpis: 🧾 ulga w PIT | ＋ → dodatki | 2 | Nowa transakcja Wydatek Przychód Przelew Kwota (zł) + − Data Notatka P | #mulgaBtn 128×36 |
| Wpis: 📷 zdjęcie paragonu | ＋ → dodatki | 2 | Nowa transakcja Wydatek Przychód Przelew Kwota (zł) + − Data Notatka P | #mphBtn 150×36 |
| Wpis: 🛡️ gwarancja (≥300 zł) | ＋ | 2 | Nowa transakcja Wydatek Przychód Przelew Kwota (zł) + − Data Notatka K |  |
| Wpis: 🪙 drobne (konto z regułą) | ＋ | 1 | Nowa transakcja Wydatek Przychód Przelew Kwota (zł) + − Data Notatka P |  |
| Wpis: 🏷️ projekt / 🔻 spłata (przyciski) | ＋ | 1 | Nowa transakcja Wydatek Przychód Przelew Kwota (zł) + − Data Notatka P |  |
| Wpis: Anuluj | ＋ | 2 | Budżet – zmiana na miejscu |  |
| Wpis: pozycja – szukaj w oknie wyboru | ＋ → pozycja | 4 | Nowa transakcja Wydatek Przychód Przelew Kwota (zł) + − Data Notatka P |  |
| Wpis: pozycja – Zamknij okno wyboru | ＋ → pozycja | 3 | Nowa transakcja Wydatek Przychód Przelew Kwota (zł) + − Data Notatka P | #pkClose 73×36 |
| Rejestr | pasek | 1 | Ten miesiąc Cały rok 2026 Wszystko ⚙️ Filtry ▾ NIEDZIELA, 15 LISTOPADA |  |
| Rejestr: okres Cały rok | Rejestr | 2 | Ten miesiąc Cały rok 2026 Wszystko ⚙️ Filtry ▾ ✕ Wyczyść filtry 161 wp | select okres 258×38 |
| Rejestr: ⚙️ Filtry | Rejestr | 2 | Ten miesiąc Cały rok 2026 Wszystko ⚙️ Filtry ▴ Wszystkie rodzaje Wydat | togF |
| Rejestr: szukaj po kwocie >100 | Rejestr | 2 | Ten miesiąc Cały rok 2026 Wszystko ⚙️ Filtry ▾ 14 wpisów · wydatki 3 3 |  |
| Rejestr: otwórz wpis | Rejestr | 2 | Edytuj transakcję Wydatek Przychód Przelew Kwota (zł) + − Data Notatka |  |
| Rejestr: wpis → ↩️ Oznacz zwrot | Rejestr → wpis | 3 | ↩️ Zwrot: Karma Wydatek 91,82 zł z 15.11.2026. Zwrot zmniejszy wydatek | #shRef 127×36 |
| Rejestr: wpis → Usuń transakcję | Rejestr → wpis | 3 | Ten miesiąc Cały rok 2026 Wszystko ⚙️ Filtry ▾ NIEDZIELA, 15 LISTOPADA | #shDel 122×36 |
| Rejestr: ✋ przytrzymanie | Rejestr | 2 | Sklep zoologiczny 91,82 zł · 15.11.2026 · Karma 📋 Duplikuj ↩️ Zwrot ✏️ |  |
| Rejestr: ✋ → Duplikuj | Rejestr | 3 | Nowa transakcja Wydatek Przychód Przelew Kwota (zł) + − Data Notatka P |  |
| Rejestr: ✋ → Zwrot | Rejestr | 3 | ↩️ Zwrot: Karma Wydatek 91,82 zł z 15.11.2026. Zwrot zmniejszy wydatek |  |
| Rejestr: przesunięcie palcem = miesiąc | Rejestr | 1 | Ten miesiąc Cały rok 2026 Wszystko ⚙️ Filtry ▾ Brak transakcji w tym m |  |
| Stałe: 📌 Opłaty | pasek | 1 | 📌 Opłaty 💼 Pensje 📅 Roczne i terminy Wszystkie Kuba 2 Ola 2 Wspólne 4  |  |
| Stałe: odhacz opłatę | Stałe | 2 | Zapłacono: Netflix Kwotę możesz zmienić, jeśli w tym miesiącu rachunek | toggleFixed |
| Stałe: edycja opłaty | Stałe | 2 | Edytuj opłatę stałą Nazwa Kwota (zł) Termin – dzień miesiąca (1–31) Po | editFixed |
| Stałe: + Opłata | Stałe | 2 | Nowa opłata stała Nazwa Kwota (zł) Termin – dzień miesiąca (1–31) Pozy | editFixed |
| Stałe: + Przelew stały | Stałe | 2 | Nowy stały przelew Na oszczędności, na konto wspólne, na konto drugiej | editFixed |
| Stałe: + Przychód stały | Stałe | 2 | Nowy przychód stały Np. najem mieszkania albo świadczenie. Pensje wpis | editFixed |
| Stałe: filtr osoby | Stałe | 2 | 📌 Opłaty 💼 Pensje 📅 Roczne i terminy Wszystkie Kuba 2 Ola 2 Wspólne 4  | setFixWho |
| Stałe: 📋 Przejrzyj subskrypcje | Stałe | 2 | 📋 Przegląd subskrypcji Razem 29,99 zł miesięcznie, czyli 360 zł roczni | openSubs |
| Pensje | Stałe | 2 | 📌 Opłaty 💼 Pensje 📅 Roczne i terminy Miesiąc Rok 2026 💼 KUBA + Źródło  |  |
| Pensje: 📝 Pasek | Pensje | 3 | 💼 Biuro projektowe Umowa o pracę · Kuba · wypłata: listopad 2026 ⧉ Sko | openSlip |
| Pensje: + Wpisz pasek → Podpowiedz z brutto | Pensje | 4 | 💼 Agencja reklamowa Umowa o pracę · Ola · wypłata: listopad 2026 ⧉ Sko | openSlip, Podpowiedz z brutto 166×34 |
| Pensje: pasek → z netto | Pensje | 4 | 🧮 Podpowiedz z kwoty netto Wpisz, ile wpłynęło na konto (z aplikacji b | openSlip, z netto 161×34 |
| Pensje: pasek → Skopiuj z poprzedniego | Pensje | 4 | 💼 Agencja reklamowa Umowa o pracę · Ola · wypłata: listopad 2026 ⧉ Sko | openSlip, Skopiuj 230×34 |
| Pensje: Rok (PIT-11) | Pensje | 3 | 📌 Opłaty 💼 Pensje 📅 Roczne i terminy Miesiąc Rok 2026 NETTO 2026 50 73 | setPayView |
| Pensje: + Źródło dochodu | Pensje | 3 | Nowe źródło dochodu – Kuba Pracodawca albo zleceniodawca Rodzaj umowy  | editInc |
| Pensje: ⋯ edycja źródła | Pensje | 3 | Źródło dochodu Pracodawca albo zleceniodawca Rodzaj umowy Umowa o prac | editInc |
| Pensje: + Inny przychód | Pensje | 3 | Nowa transakcja Wydatek Przychód Przelew Kwota (zł) + − Data Notatka P | + Inny przychód 121×36 |
| Roczne i terminy | Stałe | 2 | 📌 Opłaty 💼 Pensje 📅 Roczne i terminy 📅 ROCZNE I TERMINY + Dodaj 💰 Z OD |  |
| Roczne: + Dodaj | Roczne | 3 | Roczne i terminy Z kwotą – policzę, ile odkładać co miesiąc na wspólne | addTerm |
| Roczne: ✓ Zapłacone | Roczne | 3 | Zapłacone: 🎁 Prezenty świąteczne Kwota (zł) Data Z konta Konto Kuba Ko | payYear |
| Roczne: Edytuj | Roczne | 3 | Wydatek roczny Nazwa Kwota (zł) Miesiąc płatności Styczeń Luty Marzec  | editYear |
| Roczne: zmień subkonto | Roczne | 3 | Subkonto na wydatki roczne Konto + Nowe: Subkonto – wydatki roczne Osz | setYearAcc |
| Roczne: 🐷 Odłóż | Roczne | 3 | Wpłata Wydatek Przychód Przelew Kwota (zł) + − Data Notatka Z konta Ko | openTx |
| Terminy: ✓ Zrobione | Roczne | 3 | 📌 Opłaty 💼 Pensje 📅 Roczne i terminy 📅 ROCZNE I TERMINY + Dodaj 💰 Z OD | doneRem |
| Terminy: Edytuj przypomnienie | Roczne | 3 | Przypomnienie Nazwa Termin Powtarzaj Jednorazowo Co miesiąc Co 3 miesi | editRem |
| Majątek: 🐷 Oszczędności Razem | pasek | 1 | Oszczędności – zmiana na miejscu |  |
| Oszczędności: Kuba | Majątek | 2 | Oszczędności – zmiana na miejscu | setSub |
| Oszczędności: Ola | Majątek | 2 | Oszczędności – zmiana na miejscu | setSub |
| Oszczędności: Wspólne | Majątek | 2 | Oszczędności – zmiana na miejscu | setSub |
| Oszczędności: 🐷 Odłóż | Majątek | 2 | Wpłata Wydatek Przychód Przelew Kwota (zł) + − Data Notatka Z konta Ko | odloz |
| Oszczędności: 📈 Aktualizuj wartości | Majątek | 2 | ‹ Oszczędności 📈 Aktualizuj wartości · 15.11.2026 Wpisz ceny i wartośc | openValues |
| Oszczędności: Zapisz wycenę (automat) | Majątek | 2 | Oszczędności – zmiana na miejscu | saveAutoVal |
| Oszczędności: Zmień cel miesięczny | Majątek | 2 | Ile chcecie odkładać co miesiąc? Liczą się wpłaty na konta oszczędnośc | setSavTarget |
| Oszczędności: cel → edycja | Majątek | 1 | Razem: brak przycisku – edycja celu tylko w zakładce osoby/Wspólne („Edytuj”, 3 stuk.) |  |
| Oszczędności: + Dodaj cel | Majątek → osoba | 3 | Nowy cel (koperta) Cel to „koperta”: przydzielacie do niej część oszcz | setSub, editGoal |
| Oszczędności: konto ⋯ | Majątek → osoba | 3 | Konto: IKE Kuba Nazwa Rodzaj Oszczędności (stała kwota) Inwestycje / I | setSub, editSavAcc |
| Oszczędności: ↓ Wpłać | Majątek → osoba | 3 | Wpłata Wydatek Przychód Przelew Kwota (zł) + − Data Notatka Z konta Ko | setSub, #app openTx |
| Oszczędności: 📊 Instrumenty | Majątek → osoba | 3 | ‹ Oszczędności IKE Kuba · IKE 10 775,98 zł instrumenty · wpłacono 10 0 | setSub, openInst |
| Instrumenty: dodaj instrument | Instrumenty | 4 | Nowy instrument – IKE Kuba 📋 Fundusze z Waszej listy (wpisz symbol – n | openInst, #app editHold |
| Instrumenty: otwórz instrument | Instrumenty | 3 | instrument nie otwiera się stuknięciem nazwy – są przyciski „+ Zakup / Sprzedaż / ✎ Cena / ⋯” (4 stuk.) |  |
| Oszczędności: kaskada → przelew | Majątek → osoba | 3 | Wypłata na konto bieżące Wydatek Przychód Przelew Kwota (zł) + − Data  | setSub |
| Oszczędności: + Dodaj konto | Majątek → osoba | 3 | Nowe konto – Kuba Nazwa Rodzaj Oszczędności (stała kwota) Inwestycje / | setSub, addSavAcc |
| Oszczędności: ✎ Limity IKE/IKZE | Majątek | 2 | Limity wpłat 2026 Ogłasza je co roku ministerstwo (obwieszczenie MRPiP | editLimits |
| Oszczędności: 💰 oprocentowanie Zmień | Majątek | 2 | 💰 Oprocentowanie: Oszczędności wspólne Aplikacja policzy odsetki dzień | editInt |
| Oszczędności: FIRE / wykres | Majątek | 1 | Oszczędności – zmiana na miejscu |  |
| Doradca: kafelek 🛟 Poduszka | Majątek → Doradca | 2 | 🛟 Poduszka bezpieczeństwa Konta oszczędnościowe (bez IKE, IKZE, PPK i  |  |
| Doradca: kafelek 🔻 Długi | Majątek → Doradca | 2 | 🔻 Długi ✓ Brak kart, rat i pożyczek – można inwestować. Długi wpisujes |  |
| Doradca: kafelek 📅 Limity | Majątek → Doradca | 2 | 📅 Limity 2026 – Kuba IKE zostało 28 260 zł IKE Kuba: limit 28 260 zł · |  |
| Doradca: kafelek 🎯 Plan | Majątek → Doradca | 2 | 🎯 Plan – Kuba 💵 Gotówka i bezpieczne 0% (0–2,5%) 🧾 Obligacje 40% (35–4 |  |
| Doradca: 💸 Gdzie wpłacić → Policz | Majątek → Doradca | 4 | ‹ Oszczędności 💸 Gdzie wpłacić? kotki liczą według Waszego planu, prog | openWhere, calcWhere |
| Doradca: 🛒 W co (po Policz) | Gdzie wpłacić | 4 | ‹ Oszczędności 💸 Gdzie wpłacić? kotki liczą według Waszego planu, prog | openWhere, calcWhere |
| Doradca: 💾 Zapisz poradę | Gdzie wpłacić | 4 | po „Policz” wynik się nie pokazuje (klawiatura otwarta) – zob. 🟠; po schowaniu klawiatury przycisk jest (5 stuk.) |  |
| Doradca: kalkulator obligacji | Gdzie wpłacić | 4 | jw. – widoczny dopiero po schowaniu klawiatury |  |
| Doradca: 🎯 Cele, kryzys, koszty | Majątek → Doradca | 2 | ‹ Oszczędności 🌴 Emerytura – Kuba w dzisiejszych złotych · bez PPK · z | openGoals |
| Doradca: ✎ Koszty najmu | Cele | 3 | 🏘️ Mieszkanie na wynajem – liczby do sprawdzenia Kotki sprawdzą, czy W | openGoals, setRentPrice |
| Doradca: 🧪 Piaskownica → Analizuj | Majątek → Doradca | 4 | ‹ Oszczędności 🧪 Piaskownica pojedyncze spółki, „tematy”, krypto, suro | openSand, sandCalc |
| Doradca: 📝 Ankieta → Dalej | Majątek → Doradca | 3 | ‹ Oszczędności 📝 Ankieta · Ty i Twoje dochody pytanie 2 z 61 · odpowie | openAnk, #app ankSet |
| Doradca: 📄 Mój plan | Majątek → Doradca | 2 | ‹ Oszczędności 📄 Mój plan – Kuba zatwierdzony 15.11.2026 Część długote | openPlan |
| Doradca: ✎ Zmień proporcje | Plan | 3 | ✎ Proporcje planu Obligacje = reszta do 100%. Teraz w kryzysie jak 200 | openPlan |
| Doradca: 👀 ankieta Oli (wspólne) | Plan | 3 | ‹ Oszczędności 📄 Mój plan – Kuba zatwierdzony 15.11.2026 Część długote | openPlan, toggleAnkW |
| Doradca: 🌡️ Termometr | Majątek → Doradca | 2 | Oszczędności – zmiana na miejscu | #app details.thermo summary  |
| Koło: 🏠 Nieruchomości | Majątek → koło | 2 | Oszczędności – zmiana na miejscu | advGrp |
| Koło: 📈 Aktywa → grupa | Majątek → koło | 3 | Oszczędności – zmiana na miejscu | advGrp, #app advGrp |
| Koło: ❓ zmień klasę instrumentu | Majątek → koło | 2 | Klasa: iShares Core S&P 500 (Acc) Z nazwy wygląda na: Akcje – USA. W c | pickCls |
| Koło: + Nieruchomość | Majątek → koło | 2 | 🏠 Dodaj nieruchomość Nieobowiązkowe. Wartość wpisz ostrożnie (najniższ | editAsset |
| Koło: + Inne aktywo | Majątek → koło | 2 | ＋ Inne aktywo Np. kolekcja, udziały w firmie, działka rekreacyjna. Nie | editAsset |
| Koło: stara wycena → edytuj aktywo | Majątek → koło | 2 | ✨ Kolekcja LEGO Nazwa Rodzaj 📜 Obligacje rynkowe / ETF obligacji 🏢 Obl | editAsset |
| 🔎 Analiza funduszy: Lista funduszy | Majątek | 2 | Oszczędności – zmiana na miejscu | #app summary:has-text("Lista |
| Majątek: 👛 Konta | Majątek | 2 | 👛 Konta – Salda | #app [onclick*="goTab('acc') |
| Konta: osoba (chip) | Konta | 3 | 👛 Konta – Salda | #app [onclick*="goTab('acc'), setAccSub |
| Konta: ⚖️ Wyrównaj wszystkie | Konta | 3 | Bieżące i subkonta Oszczędności ⚖️ Konta bieżące i subkonta · stan na  | #app [onclick*="goTab('acc'), openRecon |
| Konta: 🔻 My winni → + Dodaj | Konta | 4 | Nowe zobowiązanie Rodzaj 🏠 Kredyt hipoteczny 💳 Kredyt gotówkowy 🚗 Kred | setAccView, editDebt |
| Konta: 🔺 Nam winni | Konta | 3 | 👛 Konta – Salda | #app [onclick*="goTab('acc'), setAccView |
| Konta: stuknięcie konta | Konta | 4 | 👛 Konta – Salda | #app [onclick*="goTab('acc'), setAccSub |
| Analiza: Miesiąc Pełna | Budżet → Analiza | 2 | ‹ Budżet Miesiąc Rok Podstawowa Pełna PRZYCHODY 7 828,63 zł = jak popr | setAnaMode |
| Analiza: Miesiąc Podstawowa | Budżet → Analiza | 2 | ‹ Budżet Miesiąc Rok Podstawowa Pełna PRZYCHODY 7 828,63 zł = jak popr | setAnaMode |
| Analiza: Rok | Budżet → Analiza | 2 | ‹ Budżet Miesiąc Rok Podstawowa Pełna 🖨️ Podsumowanie roku 2026 jedna  | setAna |
| Analiza: 🖨️ Podsumowanie roku | Analiza → Rok | 3 | ‹ Analiza 🖨️ Zapisz jako PDF / drukuj Na telefonie: „Zapisz jako PDF”  | setAna |
| Analiza: 📥 Eksport CSV | Analiza → Rok | 3 | ‹ Budżet Miesiąc Rok Podstawowa Pełna 🖨️ Podsumowanie roku 2026 jedna  | setAna, #app exportCsv |
| Analiza: 🎁 Money Wrapped | Analiza → Rok | 3 | 🎁 Wasz rok 2026 Bailey i Ivo przejrzeli wszystkie 161 wpisów. Gotowi?  | setAna, #app wrapped |
| Analiza: Plan a rzeczywistość → Ustaw | Analiza → Rok | 3 | ‹ Budżet Miesiąc Rok Podstawowa Pełna 🖨️ Podsumowanie roku 2026 jedna  | setAna, #app fixPlan |
| ⚙️ Konta | ⚙️ | 2 | ‹ Ustawienia 🏦 Konta Konta + Konto 💳 Konta bieżące (4) 🗂️ Subkonta (1) |  |
| ⚙️ Kategorie i drobne | ⚙️ | 2 | ‹ Ustawienia 🗂️ Kategorie i drobne Kategorie i pozycje budżetu + Kateg |  |
| ⚙️ Ten telefon | ⚙️ | 2 | ‹ Ustawienia 📱 Ten telefon 🎨 Wygląd A A+ A++ 🙈 Tryb dyskretny – kwoty  |  |
| ⚙️ Bezpieczeństwo | ⚙️ | 2 | ‹ Ustawienia 🛡️ Bezpieczeństwo Kopia danych Pobierz kopię co jakiś cza |  |
| ⚙️ Automaty | ⚙️ | 2 | ‹ Ustawienia 🤖 Automaty Dane są przykładowe i zapisują się tylko w tej |  |
| ⚙️ Pomoc | ⚙️ | 2 | ‹ Ustawienia 📖 Pomoc 📖 Pomoc Każda funkcja aplikacji krok po kroku, z  |  |
| ⚙️ Konta: edycja konta | ⚙️ → Konta | 3 | Edytuj konto Nazwa Rodzaj Konto bieżące Subkonto Oszczędności Inwestyc | #app editAcc |
| ⚙️ Konta: + Konto | ⚙️ → Konta | 3 | Nowe konto Nazwa Rodzaj Konto bieżące Subkonto Oszczędności Inwestycje | #app editAcc |
| ⚙️ Kategorie: + Kategoria | ⚙️ → Kategorie | 3 | Nowa kategoria Nazwa Rodzaj Wydatki Przychody Anuluj Dodaj | addCat |
| ⚙️ Kategorie: pozycja (menu) | ⚙️ → Kategorie | 3 | Zakupy spożywcze 2. JEDZENIE · w użyciu: 33 wpisy ✏️ Zmień nazwę 🙈 Ukr | subMenu |
| ⚙️ Kategorie: + Reguła drobnych | ⚙️ → Kategorie | 3 | Nowa reguła drobnych Przykład: płacisz 12,34 zł → do pełnych 5 zł brak | editRound |
| ⚙️ Telefon: kolor | ⚙️ → Ten telefon | 3 | ‹ Ustawienia 📱 Ten telefon 🎨 Wygląd A A+ A++ 🙈 Tryb dyskretny – kwoty  | setLook |
| ⚙️ Telefon: tryb dyskretny | ⚙️ → Ten telefon | 4 | ‹ Ustawienia 📱 Ten telefon 🎨 Wygląd A A+ A++ 🙈 Tryb dyskretny – kwoty  | setHide, setHide |
| ⚙️ Telefon: urodziny | ⚙️ → Ten telefon | 2 | ‹ Ustawienia 📱 Ten telefon 🎨 Wygląd A A+ A++ 🙈 Tryb dyskretny – kwoty  |  |
| ⚙️ Bezpieczeństwo: Pobierz kopię | ⚙️ → Bezpieczeństwo | 3 | ‹ Ustawienia 🛡️ Bezpieczeństwo Kopia danych Pobierz kopię co jakiś cza | exportJson |
| ⚙️ Bezpieczeństwo: zdjęcia kopia | ⚙️ → Bezpieczeństwo | 2 | ‹ Ustawienia 🛡️ Bezpieczeństwo Kopia danych Pobierz kopię co jakiś cza |  |
| ⚙️ Pomoc: 📖 Co nowego i jak to działa | ⚙️ → Pomoc | 3 | ‹ Ustawienia 📖 Co nowego i jak to działa Stuknij funkcję, żeby zobaczy | openHelp |
| ⚙️ Pomoc: pozycja przewodnika | ⚙️ → Pomoc | 4 | ‹ Ustawienia 📖 Co nowego i jak to działa Stuknij funkcję, żeby zobaczy | openHelp |
| ⚙️ Pomoc: Pierwsze kroki | ⚙️ → Pomoc | 3 | Cześć, Kuba! Jesteśmy Bailey i Ivo 🐾 Oprowadzimy Cię po budżecie. Bail | showTour |
| ⚙️ Pomoc: 📊 Czego używamy | ⚙️ → Pomoc | 3 | 📊 Czego używamy Liczę od 11.2026. Poniżej ostatnie 3 miesiące. Po 2–3  | openUsage |
| ⚙️ Pomoc: 🧪 demo link | ⚙️ → Pomoc | 2 | ‹ Ustawienia 📖 Pomoc 📖 Pomoc Każda funkcja aplikacji krok po kroku, z  |  |
