# Etap 1 – Spis wszystkich funkcji (23–24.11.2026)

> Jak powstał: wersja demo w Playwright (390 px, pl-PL, Europe/Warsaw, „dziś” = 15. dzień miesiąca, jak robot), zrzuty wszystkich **103 ekranów robota w 4 ustawieniach telefonu** (`tests/out/`, lokalnie – nie w repo), własny skrypt sprawdzający nowe funkcje, porównanie z `HELP` (92 pozycje, 7 sekcji) i `NEWS` (do v73). Tabela stuknięć pochodzi z poprzedniego audytu (zmierzona skryptem 22.11) – sprawdziłem, które wiersze zmieniły się przez etapy A–E, i poprawiłem je. Na żadnym z 103 ekranów nie było błędu JavaScript ani napisu poza ekranem (robot).

## Nowe lub zmienione od poprzedniego audytu (przejrzane dokładniej)
| Funkcja | Gdzie / stuknięcia od Budżetu | Sprawdzone | Uwagi |
|---|---|---|---|
| 👥 „Czy starczy?” jako zwinięta karta w stylu kategorii (pigułka ✅/🟡/⚠️, 3 kwoty, jedno zdanie) | dół Budżetu, 0 (widać od razu), szczegóły 1 | zrzut 390/320 px, A++ | czytelne; na 320 px w pigułce sama ikonka (zgodnie z założeniem) |
| 🔔 „💡 Podpowiedzi” zwinięte w Na dziś (plan, „Czy starczy?”, doradca, wycena aktywa) | 🔔 → „💡 Podpowiedzi (4)” = 2 | demo: 4 sprawy na górze, 2 w „Wkrótce”, 4 w „Podpowiedziach” | dobrze – na górze zostały tylko sprawy do zrobienia |
| 👆 Cele stuknięcia ok. 44 px (`::after`) przy ✓, + / −, „Płaci”, ⓘ, rozwijanych napisach | wszędzie | robot (ekrany), CSS | bez zmiany wyglądu |
| ⚡ Kotki rysowane raz na każdym ekranie (`mountCats`), szybsze `fitNums` | – | robot | patrz etap 5 |
| 💾 Trwała pamięć telefonu (`persist`), wynik w Diagnostyce | ⚙️ → 🛡️ → Diagnostyka = 3 | demo: w demo wyłączone (zgodnie z założeniem) | **brak w HELP** (jest tylko w NEWS v73) |
| 📲 „Przycisk na ekranie” (instrukcja widżetu Skrótów) | ⚙️ → 🤖 → 🗣️ Siri i skróty = 3–4 | robot na prawdziwej stronie | w demo karty Siri nie ma (wyłączona) – zgodnie z założeniem |
| 🔁 Odmowa „Przywróć”/„Cofnij”, gdy opłata stała jest już w miesiącu (`fixedDupStop`) | 🗑️ / toast | robot (`flows.mjs`) | – |
| 📅 „Co 2 lata” z pierwszym terminem przy edycji (`yearLastFor`) | 📌 → 📅 Roczne i terminy | `calc.mjs` | – |
| 🧹 Strażnik: `twin:` (wpis żywy 2×), `slip2:` (pensja poza paskiem), `ref:yl:` | 🔔 | `calc.mjs` | – |
| 🛟 Jedna poduszka w karcie, doradcy i mailu | Majątek | `calc.mjs` | – |
| 🌡️ Termometr – bez stałej subskrypcji | Majątek → Doradca | robot | nadal w euro na prawdziwych danych (W12) |

## Dodanie wydatku 25 zł „Biedronka” (bez zmian od 22.11 – decyzja Matiego 23.11: nie przyspieszamy)
| Ścieżka | Stuknięcia |
|---|---|
| Siri / skrót / nowy widżet Skrótów `#go=add&amount=25&note=Biedronka` | **1** |
| ＋ → kwota → notatka „Biedronka” (pozycja sama) → Zapisz | **4** (na iPhonie klawiatura nie otwiera się sama – świadomie zostaje) |
| ＋ → kwota → „Ostatnio używane” → Zapisz | 5 |
| ＋ → kwota → kafelek kategorii → pozycja → Zapisz | 6 |

## Porównanie z HELP i CLAUDE.md
**(a) Jest w aplikacji, brak w HELP** (wszystkie 🟡, do dopisania przy najbliższej zmianie `guide.js`):
- 💾 trwała pamięć telefonu i „Diagnostyka” w ogóle (wersja vN, pamięć, liczba wpisów) – w HELP brak słowa „Diagnostyka” (🔁 z poprzedniego audytu, nadal brak);
- 🗑️ przywracanie usuniętego **celu** – wpis HELP „Ostatnio usunięte” (`guide.js`, sekcja ⚙️) mówi tylko o wpisach (🔁, nadal);
- 🌸 zmiana koloru nagłówka i tła co miesiąc (pory roku) – brak (🔁, kosmetyka);
- 🌊 kaskada – są tylko 2 wzmianki, bez wyjaśnienia „nadwyżkę policzę dzień przed wypłatą” (🔁).

**(b) Opisane, a działa inaczej / niepewne:**
- HELP „Siri i skróty”: „Przytrzymanie ikony aplikacji na ekranie telefonu też pokazuje skróty (Nowy wydatek, Na dziś)” – na iPhonie skróty z `manifest.json` (`shortcuts`) **nie są obsługiwane przez Safari** dla aplikacji z ekranu głównego (Android/Chrome – tak). Poprzedni audyt oznaczył to jako niesprawdzone; w dokumentacji WebKit nie ma obsługi `shortcuts` (sprawdzę w etapie 8). Na iPhonie Mati i Wercia tego nie zobaczą. 🟡 prawdopodobne.

**(c) CLAUDE.md:** opis zgodny z kodem we wszystkich sprawdzonych miejscach nowych funkcji (`pbudH` zwinięta karta, `isHint`, `persist`, `widgetHelp`, `fixedDupStop`, `yearLastFor`, `twin:`/`slip2:`). Rozbieżności w kodzie – etap 2.

**Nie da się sprawdzić w demo** (bez zmian): powiadomienia, maile, Siri, urodziny przy starcie, 🔒 przypisanie loginu, wylogowanie, „📷 kopia ze zdjęciami”, prawdziwe zdjęcie, JDG, pożyczki dla kogoś, drobne (demo nie ma reguł).

## Tabela funkcji (stuknięcia od ekranu Budżet; zmierzone 22.11, poprawione o zmiany z etapów A–E)
Zmiany od 22.11: „Czy starczy?” – szczegóły osoby = 2 (najpierw rozwinąć kartę); Na dziś – „💡 Podpowiedzi” = 2; kolumna „Uwagi” podawała elementy < 44 px – po etapie D mają niewidoczne pole stuknięcia ~44 px (✓, + / −, „Płaci”, ⓘ, `summary`), więc te uwagi są nieaktualne poza 🔔 (38×44, wystarczy).
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
| Budżet: 👥 Czy starczy – szczegóły osoby | Budżet dół | 2 (rozwiń kartę → osoba) | Budżet – zmiana na miejscu |  |
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
| Na dziś: 💡 Podpowiedzi (nowe) | Na dziś | 2 | plan, „Czy starczy?”, doradca, wycena aktywa – zwinięte |  |
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
