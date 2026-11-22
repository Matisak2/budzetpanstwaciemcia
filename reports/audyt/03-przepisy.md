# Etap 3 – Pieniądze i przepisy 2026

> Przegląd: podagent L3, sprawdzony przeze mnie wyrywkowo (pasek UoP 8 000 zł policzony ręcznie = `suggest()` co do grosza; limity IKE/IKZE 2027 w `inv.js:17` zgodne z obwieszczeniem). **Ograniczenie:** sieć tej sesji nie wpuszczała na gov.pl i obligacjeskarbowe.pl – część linków prowadzi do serwisów branżowych powołujących się na obwieszczenia. Wartości na 2027 r. oznaczone „wyliczenie” trzeba potwierdzić w komunikatach ZUS/MF w styczniu.

## Wynik ogólny
Nie znalazłem błędu krytycznego. Pasek UoP, zlecenie, JDG, ulga dla młodych, obligacje, IKE/IKZE 2026–2027 i OKI są zgodne z przepisami. Sprawdziłem to ręcznie i skryptem.
Kontrola UoP dla 8 000 zł brutto (bez PPK, z PIT-2), policzona ręcznie:
- emerytalna 780,80 + rentowa 120,00 + chorobowa 196,00 = ZUS 1 096,80 zł
- zdrowotna 9% × 6 903,20 = 621,29 zł
- podstawa opodatkowania 8 000 − 1 096,80 − 250 = 6 653 zł
- zaliczka 12% × 6 653 − 300 = 498 zł
- netto 5 783,91 zł

`suggest()` daje dokładnie 578391 gr. Z PPK 2%/1,5% wychodzi 5 608,91 zł, co też jest zgodne z ręcznym rachunkiem.

## Tabela reguł
| Reguła | Kod (plik:linia) | Oficjalnie (link) | Zgodne? | Test calc.mjs |
|---|---|---|---|---|
| Emerytalna 9,76% / rentowa 1,5% / chorobowa 2,45% (pracownik) | pay.js:63 | zus.pl, wysokość składek: https://www.zus.pl/baza-wiedzy/skladki-wskazniki-odsetki/skladki/wysokosc-skladek-na-ubezpieczenia-spoleczne | ✅ (chorobowa bez limitu – poprawnie) | „UoP …” l.22–28 |
| Limit 30-krotności 2026: 282 600 zł (9 420 × 30) | pay.js:5 `ZUS_LIMIT=28260000` | https://www.zus.pl/en/baza-wiedzy/skladki-wskazniki-odsetki/wskazniki/minimalne-i-przecietne-wynagrodzenie , https://bezprawnik.pl/zus-od-stycznia/ | ✅ | „UoP – limit 30-krotności” l.28 |
| Zdrowotna 9% od (brutto − ZUS), bez odliczenia od podatku | pay.js:64 | podatki.gov.pl (Polski Ład) | ✅ | l.22 |
| KUP 250 / 300 zł | pay.js:68 | ustawa o PIT art. 22 ust. 2 | ✅ | 250 tak; **300 – brak testu** |
| PIT-2: 300 zł miesięcznie (1/12 × 3 600) | pay.js:75 | https://podatki.gov.pl/poradniki-i-informatory/pit-2-pit-2a-pit-3-zasady-skladania-oswiadczen-o-stosowaniu-pomniejszenia-zaliczki-o-kwote-zmniejszajaca-podatek-112-124-lub-136 | ✅ UoP i zlecenie; ⚠️ dzieło – zob. Z1 | l.22 |
| Próg 120 000 zł, 12% / 32%, miesiąc przekroczenia dzielony | pay.js:5,34 | ustawa o PIT art. 27 | ✅ (sprawdzone dla 118 000 zł: 1 429 zł) | „UoP – próg 32%” l.26 |
| Zlecenie: KUP 20%/50% od (przychód + PPK prac. − ZUS) | pay.js:68 | art. 22 ust. 9 pkt 4 i ust. 9a | ✅ (3 000 zł → 249 zł) | l.56; **50% – brak testu** |
| Zlecenie: zaliczka 12% także po progu, 32% tylko na wniosek | pay.js:75 | art. 41 ust. 1 / 1b | ✅ | l.748–749 |
| Student do 26 lat: bez ZUS i zdrowotnej | pay.js:60–64 | zus.pl | ✅ | l.53–54 |
| Umowa do 200 zł: ryczałt 12% przychodu, bez kosztów (ZUS zostaje) | pay.js:74,76 | art. 30 ust. 1 pkt 5a | ✅ | l.750–751 |
| Dzieło: KUP 20%/50%, 12%, bez ZUS | pay.js:76 | art. 22 ust. 9 | ✅ (brak PIT-2 – Z1) | l.32 |
| PPK 2% / 1,5%; wpłata pracodawcy = przychód, poza podstawą ZUS i zdrowotnej | pay.js:65,68 | ustawa o PPK art. 26–27 | ✅ | l.30 |
| Ulga dla młodych: limit 85 528 zł, do 26. urodzin włącznie, z PPK pracodawcy, ZUS i zdrowotna bez zmian | pay.js:39–57 | https://www.podatki.gov.pl/pit/ulgi-odliczenia-i-zwolnienia/ulga-dla-mlodych/ | ✅ | l.261–282 |
| JDG preferencyjny: podstawa 1 441,80 zł (30% × 4 806) | pay.js:27 `pref:144180` | https://www.zus.pl/-/nowe-wysokości-składek-na-ubezpieczenia-społeczne-w-2026-r. | ✅ (420,86 zł; z chorobowym 456,18 zł) | l.39 |
| JDG pełny: podstawa 5 652 zł, FP 2,45% tylko przy pełnym | pay.js:27,32 | j.w. (1 926,76 zł z chorobowym i FP) | ✅ (192 676 gr) | l.37–38 |
| Stawki 19,52 / 8 / 1,67 / 2,45 (chorobowe dobrowolne) | pay.js:32 | j.w. | ✅ | l.37–40 |
| Zdrowotna skala 9% / liniowy 4,9%, minimum 432,54 zł od lutego 2026, 314,96 zł w styczniu | pay.js:27,33,78,82 | https://pit.pl/skladki-zus/ ; money.pl (100% płacy minimalnej od II 2026) | ✅ | l.44–45 |
| Limit odliczenia zdrowotnej na liniowym 2026: 14 100 zł | pay.js:27 `linLimit` | https://www.ifirma.pl/blog/limit-odliczenia-skladki-zdrowotnej-na-podatku-liniowym-2026/ (obwieszczenie MF, MP 17.12.2025) | ✅ | l.46–47 |
| Ryczałt – zdrowotna 498,35 / 830,58 / 1 495,04 zł, progi 60 000 / 300 000 zł | pay.js:27,79 | https://www.zus.pl/-/informacja-w-sprawie-podstawy-wymiaru-składki-oraz-kwoty-składki-na-ubezpieczenie-zdrowotne-w-2026-r. | ✅ (progi „≤” – poprawnie) | l.49–52 |
| Ryczałt: podstawa = przychód − ZUS społeczny (bez FP) − 50% zdrowotnej | pay.js:81 | ustawa o ryczałcie art. 11 ust. 1a | ✅ | l.49 |
| Podatek Belki 19% (obligacje: od odsetek po opłacie) | inv.js:18,81,87 | art. 30a | ✅ | l.293–294, 760 |
| Obligacje – marże COI 1,5 / EDO 2 / ROS 2 / ROD 2,5 / DOR 0,15 / ROR 0 | inv.js:6–14 | https://www.pkobp.pl/klient-indywidualny/oszczedzanie-inwestycje/obligacje-skarbowe (październik 2026; komunikatu na listopad nie znalazłem) | ✅ | l.293–296, 754 |
| Pierwszy okres (X 2026): OTS 2%, ROR 4%, DOR 4,15%, TOS 4,40%, COI 4,75%, EDO 5,35%, ROD 5,60% | wpisywane ręcznie / automat `market.bonds` | j.w. | ✅ (kod nie ma ich na stałe) | l.677–679 – te same liczby |
| Inflacja: wskaźnik z miesiąca 2 przed początkiem roku odsetkowego, przy deflacji 0 + marża | inv.js:40–41 | listy emisyjne MF | ✅ (EDO 2. rok: 1 053,50 → 1 106,18) | l.293 |
| Opłata za wcześniejszy wykup: OTS 0 (traci odsetki), ROR 0,50, DOR 0,70, TOS 1, COI 2, ROS 2, EDO 3, ROD 3 zł; najwyżej odsetki | inv.js:46,81 | https://www.pkobp.pl/klient-indywidualny/oszczedzanie-inwestycje/obligacje-skarbowe | ✅ | EDO l.760; **COI, TOS, ROR – brak testu** |
| IKE 2026: 28 260 zł; IKZE 11 304 / JDG 16 956 zł | inv.js:17 | https://www.gov.pl/web/rodzina/ike-limit-wplat | ✅ | IKE l.301; IKZE-JDG 2026 bez testu |
| IKE 2027: 30 099 zł; IKZE 12 039,60 / 18 059,40 zł | inv.js:17 | obwieszczenie MRPiPS 30.10.2026: https://czasopismo.legeartis.org/2026/11/limit-ike-2027-wysokosc-kwoty-wplat-30099-zlotych-obwieszczenie-monitor-polski/ , https://www.money.pl/emerytury/ikze-z-wyzszymi-limitami-w-2027-r-wplacisz-wiecej-7346729536879040a.html | ✅ | l.742 |
| OKI: ustawa z 3.07.2026 (Dz.U. 2026 poz. 1098), od 1.01.2027, bez limitu wpłat, zwolnienie do 100 tys. zł (w tym do 25 tys. zł lokaty, konta, obligacje), powyżej 0,85% od nadwyżki w 2027 | inv.js:15,18; advisor.js:193,292,303,308 | https://eli.gov.pl/api/acts/DU/2026/1098/text/I/D20261098.pdf | ✅ – uchwalone i opublikowane, kod nie zakłada nic nieuchwalonego | brak testu (karta savings.js:173) |
| Ryczałt od najmu 8,5% do 100 000 zł, 12,5% od nadwyżki | today.js:208; advisor.js:382 | https://www.podatki.gov.pl/pit/osoba-nieprowadzaca-dzialalnosci-gospodarczej/rozliczenie-osob-26-60/rozliczenie-dochodow-z-najmu-ryczalt-ewidencjonowany/ | ✅ (100 000 → 8 500; 120 000 → 11 000) | 8,5% l.359–363, 710; **12,5% – brak testu** |
| Najem: wpłata do 20. następnego miesiąca / po kwartale, grudzień do 20 stycznia; PIT-28 do 30 kwietnia | today.js:279–287 | j.w. ; https://www.ifirma.pl/blog/najem-prywatny-kiedy-skladac-pit-28-i-jak.html | ✅ | l.359–363 |
| Ulgi: internet 760 zł, termomodernizacja 53 000 zł, rehabilitacja (leki ponad 100 zł/mies.), darowizny 6% | today.js:128–134 | podatki.gov.pl, ulgi | ✅ | brak (same teksty) |
| Emerytura netto: zdrowotna 9%, PIT 12% minus 3 600 zł rocznie | advisor.js:365 | podatki.gov.pl | ✅ (4 000 → 3 460) | l.699 |
| Raty równe `L·r/(1−(1+r)^−n)` i malejące `L/n + L·r`; r = nominalne/12 | today.js:24–58 | wzór standardowy | ✅ (120 000 zł, 6%, 121 rat → 1 324,21 / 1 591,74 zł) | l.308–309 |

## Zgłoszenia

### 🟡 Z1. Umowa o dzieło nie uwzględnia PIT-2 (300 zł)
- Miejsce: js/pay.js:76
- Opis: od 2023 r. zamawiający dzieło może pomniejszać zaliczkę o 300 zł na podstawie PIT-2, tak jak przy zleceniu. Kod dzieła ignoruje `src.pit2`. Przy dzieło 3 000 zł z PIT-2 aplikacja podpowiada 288 zł podatku zamiast 0 zł, więc netto wychodzi o 288 zł za niskie. To tylko podpowiedź, a kwoty z paska i tak wygrywają.
- Dowód: check.mjs: wiersze „dzielo 3000” i „dzielo 3000 pit2” dają ten sam podatek 28800 gr. Źródło: przewodnik MF PIT-2 (link w tabeli).
- Pewność: potwierdzone
- Propozycja i wysiłek: w gałęzi dzieła `tax=Math.max(0,r0(pct(base,12)-(src.pit2?30000:0)))`, ale nie przy umowie do 200 zł (ryczałt), plus test. S, nie jest to oczywisty drobny błąd, bo w okienku źródła dzieła (salary.js:156–179) w ogóle nie ma pola PIT-2 i trzeba je dodać (zmiana wyglądu).

### 🟡 Z2. Próg 100 000 zł z najmu liczony osobno dla każdego przychodu stałego
- Miejsce: js/today.js:283 (`before` i `got` liczone tylko dla `fixedId===f.id`)
- Opis: limit 100 000 zł dotyczy wszystkich przychodów z najmu podatnika w roku. Gdy osoba ma dwa mieszkania jako dwa przychody stałe, każde liczy próg od zera, więc 12,5% od nadwyżki nie pojawi się w ogóle. Przy jednym mieszkaniu wszystko jest dobrze.
- Pewność: prawdopodobne, z czytania kodu (nie odtwarzałem)
- Propozycja i wysiłek: sumować wpływy wszystkich `najem` tej samej osoby (`fixedWho`). S, nie jest to oczywisty drobny błąd (dotyka zasady podziału przy małżonkach).

### 🟡 Z3. Stałe przepisów 2026 bez roku działają też w 2027 bez ostrzeżenia w obliczeniach
- Miejsce: pay.js:5 (`ZUS_LIMIT`, `TAX_THR` – bez roku), pay.js:28 (`jdgT` dla 2027 cicho zwraca 2026), inv.js:109 (`limitOf` dla 2028 → 2027)
- Opis: od stycznia 2027 podpowiedź paska liczy limit ZUS 282 600 zł zamiast 300 990 zł, a JDG podstawy z 2026 (np. pełny ZUS o ok. 70 zł/mies. za nisko). Zabezpieczeniem jest punkt „Na dziś” `rules:2027` (today.js:264) i to działa, ale tylko gdy są źródła dochodu.
- Pewność: potwierdzone (`jdgT('2027-02')` = wartości 2026)
- Propozycja i wysiłek: zrobić aktualizację z listy niżej w styczniu 2027. Na przyszłość `ZUS_LIMIT` jako mapa po roku. S.

### 💡 Pozostałe
- OKI: `taxFree` (inv.js:20) traktuje całe OKI jako bez podatku, choć powyżej 100 tys. zł obowiązuje 0,85% od aktywów, a lokaty i obligacje są zwolnione tylko do 25 tys. zł. Wystarcza dla obecnych kwot. Warto dodać notę albo ostrzeżenie przy saldzie > 100 tys. zł. `OKI_FREE`/`OKI_RATE` są używane w karcie limitów (savings.js:173), która pokazuje nadwyżkę ponad 100 tys. zł, więc nie są martwe.
- Brak testów: KUP 300 zł, KUP 50% przy zleceniu, ryczałt najmu 12,5%, IKZE-JDG 2026, opłata wykupu COI/TOS/ROR, dzieło z PIT-2.
- Limit ZUS liczony na jedno źródło (`ytdOf` per srcId) – tak samo liczy płatnik. Przy dwóch pracodawcach osoba nadpłaca do zwrotu przez ZUS. To świadome uproszczenie.
- Komunikatu MF z oprocentowaniem obligacji na listopad 2026 nie znalazłem (ostatni potwierdzony to październik 2026). Kod nie zapisuje stóp na stałe, więc to bez znaczenia.

## Na styczeń 2027 – co zmienić i gdzie
| Co | 2027 | Źródło | Gdzie w kodzie |
|---|---|---|---|
| Prognozowane przeciętne wynagrodzenie | 10 033 zł (obwieszczenie 3.11.2026) | https://bezprawnik.pl/przecietne-wynagrodzenie-w-2027-roku-ma-przekroczyc-10-tys-zl/ | – |
| Limit 30-krotności ZUS | 300 990 zł | j.w., https://bezprawnik.pl/duzy-zus-2027/ | pay.js:5 `ZUS_LIMIT=30099000`; test calc.mjs l.28 |
| Płaca minimalna | 4 950 zł (rozporządzenie Dz.U. 2026 poz. 1213) | https://www.money.pl/praca/placa-minimalna-w-2027-roku-jest-projekt-7315961016870976a.html | pośrednio niżej |
| JDG pełny ZUS: podstawa 60% × 10 033 | 6 019,80 zł → `full:601980` | https://www.infakt.pl/blog/zus-2027-duzy-i-maly-zus-w-gore/ | pay.js:27 nowa linijka `2027:{…}` |
| JDG preferencyjny: 30% × 4 950 | 1 485,00 zł → `pref:148500` | wyliczenie | pay.js:27 |
| Zdrowotna min. skala/liniowy (9% × 4 950) od lutego 2027 | 445,50 zł → `hmin:44550`, styczeń 2027 `hminJan:43254` | wyliczenie, potwierdzić w komunikacie ZUS | pay.js:27 |
| Ryczałt – zdrowotna 2027 | z przeciętnego wynagrodzenia IV kw. 2026 (GUS ok. 20.01.2027) | komunikat ZUS w styczniu | pay.js:27 `rycz` |
| Limit odliczenia zdrowotnej na liniowym 2027 | obwieszczenie MF w grudniu 2026 | MP | pay.js:27 `linLimit` |
| IKE / IKZE / IKZE-JDG | 30 099 / 12 039,60 / 18 059,40 zł | linki w tabeli | inv.js:17 – **już wpisane** ✅ |
| OKI start | 1.01.2027; 0,85% od nadwyżki ponad 100 tys. | eli.gov.pl (j.w.) | advisor.js:308 (napis „Ruszy 1 stycznia 2027” zniknie sam po dacie) |
| Próg PIT 120 000, 12/32%, kwota wolna 30 000, KUP 250/300, PIT-2 300 zł, ulga młodych 85 528 zł | bez zmian (nie znalazłem zapowiedzi zmian na 2027) | – | pay.js:5,39 – bez zmian |
| RULES_YEAR | 2027 | – | pay.js:7, oczekiwane liczby w tests/calc.mjs (ZUS, JDG, `rules:`) |
| Emerytura netto | bez zmian | – | advisor.js:365 |

Nie sprawdzałem: tekstu ustaw w źródle (brak dostępu do gov.pl), ekranów aplikacji (tylko czyste funkcje).
