# Doradca inwestycyjny – notatki z analizy (robocze)

Plik roboczy dla Claude: wymagania Matiego + wnioski z lektury bloga marciniwuc.com (Marcin Iwuć, Kasia Iwuć, Maciek Pielok, Ania Mączka, Dawid Leszczyna). Na tej podstawie powstaje plan w `PLAN.md`. To nie jest część aplikacji.

Stan lektury: patrz sekcja „Dziennik czytania” na końcu.

## A. Wymagania Matiego (z rozmowy 13–14.11.2026)

1. Nowa pod-zakładka w Majątku / Oszczędnościach: **Doradca**. Wpisuję kwotę, którą chcę teraz zainwestować → doradca mówi **gdzie** (IKE / IKZE / OKI / PPK / zwykłe konto…) i **w co**.
2. Nie przewidywanie przyszłości, tylko **analiza zebranych danych**: czy obecnie warto coś kupić, czy lepiej nie.
3. ETF-y **i akcje** też.
4. Cele: emerytura, nieprzewidziane wydatki, nieruchomość (nieruchomość jako **cel**, nie jako inwestycja – wtedy doradza najlepszy na dziś fundusz / sposób odkładania).
5. Osobna zakładka; kto wejdzie, ma liczone **osobiście** (osoba telefonu), chyba że zaznaczy **wspólnie**.
6. IKZE: doradca **pyta o próg podatkowy**; przy 0% i 12% raczej IKE (IKZE dopiero po 65 r.ż., z IKE wyjście z mniejszą stratą).
7. **Ankieta** przed poradą: pierwsza szczegółowa (**30–40 pytań**), kolejne krótkie („co to za inwestycja” itp.).
8. **Dokładna analiza kwoty**: przeliczenie, co się bardziej opłaca; wynik typu „część tu, część tu”, „wszystko tu”, „**na pewno nie tu**”.
9. Konkretny ETF czy sam instrument? → chce konkretów, ale rzetelnie.
10. Analiza ma być **dokładna, rzetelna, skrupulatna**.
11. Źródło wiedzy: materiały Marcina Iwucia – czytać **w całości**, nie pomijać.
12. Niczego w aplikacji nie zmieniać do wyraźnej komendy; etapy dopiero po „start”; przed etapem kopia (⚙️ → Pobierz kopię).

Pytania otwarte do Matiego:
- (a) zgoda na: OKI głównie na polskie aktywa / poduszkę; rebalancing jako główna podpowiedź „co teraz”, termometr i własne reguły na spadki jako dodatek;
- (b) nieruchomości: tylko cel (plan zakupu 30/20/20) czy też coroczne porównanie najmu z obligacjami + wartość mieszkania w proporcjach majątku.

## B. Co aplikacja już ma (do wykorzystania)

- `inv.js`: instrumenty (`hold`: etf/tfi/akcje/obl/zloto/krypto/lokata), obligacje `BONDS` + `bondYears` (inflacja GUS `inflH`, marże), `LIMITS` IKE/IKZE/JDG, `OKI_FREE` 100 000 zł, `OKI_RATE` 0,85, Belka 19, `wrapOf` (ike/ikze/oki/ppk), FIRE, koperty.
- Automat `market.mjs`: kursy NBP, stopa NBP, inflacja GUS, złoto, ceny posiadanych instrumentów (Yahoo, Stooq), fundusze z analizy.pl, **bieżąca oferta obligacji** (obligacjeskarbowe.pl), propozycja limitów.
- `pay.js`: paski pensji (próg podatkowy, ulga dla młodych `youngLeft`, źródła `uop/zlec/dzielo/b2b`, `ryczRate`, `taxf`), `birth` (wiek).
- Budżet (wydatki miesięczne → poduszka), poduszka (`isPod`), cele-koperty, zobowiązania z oprocentowaniem (`debts`, `rataP`), przychód z najmu (`fixedM.najem`), stałe przelewy, „Na dziś”, `checkIgnore`.

## C. Zasady kont (stan na listopad 2026)

### IKE
- Limit 2026: 28 260 zł; **2027: 30 099 zł**. Jedno konto na osobę. Od 16 lat (niepełnoletni tylko z umową o pracę).
- Wypłata bez Belki: 60 lat (55 przy wcześniejszych uprawnieniach) ORAZ wpłaty w 5 dowolnych latach kalendarzowych albo ponad połowa wpłat ≥ 5 lat przed wnioskiem.
- Wcześniej: **zwrot częściowy lub całkowity**, jedyny koszt = Belka 19% od zysku (jak poza IKE), a i tak korzyść z odroczenia podatku. Po zwrocie całkowitym można założyć od nowa. Po WYPŁACIE (z ulgą) nie można już wpłacać.
- Transfer do innej instytucji bez podatku; opłata możliwa tylko w pierwszych 12 mies.
- „IKE opłaci się praktycznie każdemu”, pod warunkiem taniego prowadzenia. Nie opłaca się tylko przy drogich produktach / przenosinach w pierwszym roku.
- Przykład: 28 260 zł/rok, 5% → po 30 latach zysk > 1,1 mln, Belka poza IKE 213 492 zł; przy 7% po 30 latach Belka 381 620 zł.
- Wpłata na początku roku lepsza niż co miesiąc (dłużej pracuje).
- Poduszka w IKE: kompromisy – IKE-Obligacje wypłata części do 30 dni, brak IKE łączącego obligacje detaliczne i zagraniczne ETF-y.

### IKZE
- Limit 2026: 11 304 zł (JDG 16 956 zł); **2027: 12 039,60 zł (JDG 18 059,40 zł)**. Wyższy limit: wystarczy prowadzić działalność w dniu wpłaty + oświadczenie.
- Ulga: wpłata odliczana od dochodu (skala 12/32%, liniowy 19%, ryczałt – od przychodu, ulga = wpłata × stawka). Kilka źródeł dochodu → ulgę stosuje się na PIT z najwyższą stawką (można dzielić).
- Wypłata: 65 lat + wpłaty w 5 latach kalendarzowych (da się w 3 lata i kilka dni) → **10% ryczałtu od całości**, jednorazowo lub w ratach; po wypłacie nie można już odkładać.
- Zwrot przed 65: **tylko całość**, dopisana do dochodu i opodatkowana **zawsze wg skali** (0 do 30 000 zł, 12%, 32%), niezależnie od liniowego/ryczałtu. Rozliczenie: PIT-11 od instytucji, PIT-37/PIT-36 („inne źródła”), nie PIT-38.
- Pułapka: ulga 12%, a zwrot wpycha w 32% (przykład Wieśka: zaoszczędził 1 440 zł, przy zwrocie 16 000 zł zapłacił 4 720 zł).
- Kiedy zwrot wychodzi korzystnie: rok bez dochodów na skali (do 30 000 zł – 0 podatku); ulga była 32%, zwrot przy 12%; **JDG na liniowym / ryczałcie bez dochodów na skali** (przykład Justyny: 300 tys. przychodu na ryczałcie, zwrot 35 000 zł → 600 zł podatku). Zwrot bez innych dochodów na skali jest tańszy niż 10% do ok. **125 000 zł**; potem można otworzyć nowe IKZE.
- Kiedy IKZE nie ma sensu: brak dochodu do opodatkowania (ulga dla młodych, urlop wychowawczy, dochód < 30 000 zł, strata w firmie), niski ryczałt (3%, 5,5%, 8,5% – słabo), plan wypłaty przed 65 przy niskim progu.
- Kalkulator Iwucia (30-latek, 35 lat, 5%, ulga reinwestowana poza IKZE z Belką):
  - 12% ulga / zwrot 32%: po 20 latach IKZE 227 428 < zwykły 258 684 < IKE 265 660; po 30 latach IKZE 453 539 < zwykły 488 224 < IKE 580 549; po 35 latach IKE 789 228 ≈ IKZE 787 807 > zwykły 641 857.
  - 32%: IKZE najlepsze od początku (po 10 latach 107 776 vs IKE 104 836 vs zwykły 104 102); po 35 latach IKZE 916 997 (o 127 tys. > IKE, o 275 tys. > zwykły). Między 60 a 65 r.ż. chwilowo lepsze IKE.
  - 8,5% ryczałt: gorzej od IKE, ale po 65 lepiej od zwykłego rachunku (odroczenie Belki).
  - Bez reinwestowania ulgi (12%): 1 012 304 zamiast 1 070 100 zł – „bez reinwestycji ulg IKZE wypada znacznie słabiej od IKE”.
- Reguła kciuka (moja, zgodna z jego liczbami): IKZE vs IKE ≈ (0,9 + stawka ulgi) vs 1,0 przy dotrzymaniu do 65 i reinwestowaniu zwrotu.
- IKZE nie nadaje się na poduszkę.

### OKI (Osobiste Konto Inwestycyjne) – start 1.01.2027
- Ustawa z 3.07.2026 (Dz.U. 2026 poz. 1098). Od 18 lat, PESEL. Dowolna liczba kont, **jeden limit na osobę**. Brak wspólnych.
- Bez limitu wpłat, wypłata kiedy się chce, bez warunku wieku. Wpłaty **tylko gotówką** (nie da się przenieść posiadanych papierów).
- Limit zwolnienia liczony od **średniej rocznej wartości aktywów**: 100 000 zł łącznie, w tym **sublimit 25 000 zł** na część oszczędnościową (limity się nie sumują). Waloryzacja od 2030.
- Grupa 1 (do 25 000 zł): konta i lokaty w zł, **detaliczne obligacje skarbowe**, bony, fundusze/ETF-y o ryzyku SRI 1 z ≥ 70% aktywów kwalifikowanych.
- Grupa 2 (do 100 000 zł): notowane akcje spółek z kapitałem zakładowym w zł (Pepco, Żabka odpadają – kapitał w EUR), notowane obligacje i listy zastawne w zł, fundusze/ETF-y z ≥ 70% takich aktywów w statucie (np. Beta ETF TBSP – ryzyko 2 → grupa 2).
- Grupa 3 (bez zwolnienia, podatek od 1. złotówki): **ETF-y na akcje zagraniczne (MSCI ACWI, FTSE All-World, S&P 500)**, akcje zagraniczne, dług w walutach, fundusze z > 30% zagranicy, lokaty walutowe.
- Podatek od nadwyżki: 19% × stopa referencyjna NBP z końca października poprzedniego roku, min 0,1%; **na 2027 sztywno 0,85%**. Płacony także w roku straty; rozliczany samodzielnie (dane przez e-Urząd Skarbowy).
- Kiedy nadwyżka na OKI lepsza od Belki (stawka 0,85%): zysk roczny powyżej 4,58% (1 rok), 4,96% (5 lat), 5,59% (10 lat), 8,29% (20 lat); przy 30 latach prawie zawsze lepiej Belka.
- Symulacje 22 lata: EDO w limicie – OKI 3 159 zł z 1 000 zł vs bez pokrowca 2 695, IKE 3 211; 25 000 zł ponad limit: OKI 73 535, bez 67 686, IKE 80 281. WIG 100 000 zł: OKI 545 673, bez 476 335, IKE 564 611.
- Wniosek: OKI = pierwszy wybór dla małych oszczędności / budujących poduszkę (20–50 tys.), elastyczne; dla pełnych limitów IKE/IKZE – dodatkowy pokrowiec. Wada: premiuje Polskę (ryzyko koncentracji, WIG w zaawansowanej hossie).
- XTB deklaruje OKI od 1.01.2027; mBank niepewny; PKO BP/Pekao (obligacje) – pytanie otwarte.

### OIPE (europejska emerytura)
- Limit jak IKE (28 260 zł w 2026). Zysk bez Belki po 60 r.ż. + 5 lat wpłat. Można mieć równolegle z IKE i IKZE.
- Nie da się prowadzić samodzielnie w domu maklerskim – musi zarządzać firma. W Polsce: **Finax** (i Life Goals z Cypru). Limit kosztów 1% rocznie; Finax ok. 0,9%, strategie 100% akcji albo 80/20, 10 lat przed emeryturą schodzi do 60/40. Transakcje raz w tygodniu.
- Wynik Iwucia po 2 latach: +25,33% (inflacja 7,13%), obsunięcie 16,65%; ok. 0,74 pp rocznie gorzej niż samodzielny ETF; odchylenie wag od indeksu globalnego.
- Werdykt: „jeszcze nie polecam”; sens dla: klientów Finaxa, posiadaczy drogich IKE w TFI, „łowców limitów” (po wyczerpaniu IKE i IKZE).

### PPK
- Własna 2% (do 4%), pracodawca 1,5% (do 4%; od wpłaty pracodawcy pracownik płaci PIT), państwo 240 zł rocznie + 250 zł powitalne. Przykład 5 000 zł brutto: koszt pracownika 1 308 zł/rok, dopłaty 2 340 zł/rok.
- Fundusze zdefiniowanej daty (wg roku urodzenia), można zmieniać; głównie polskie akcje i obligacje → liczyć w proporcjach (fałszywa dywersyfikacja).
- Zwrot przed 60: własne wpłaty – Belka od zysku; z wpłat pracodawcy 30% idzie do ZUS; dopłaty państwa przepadają. Bez potrąceń: 25% przy poważnej chorobie; **do 100% na wkład własny (do 45 r.ż.), ze zwrotem bez odsetek**.
- Po 60: 25% od razu + 75% w ratach ≥ 10 lat → bez Belki; jednorazowo – Belka.
- Werdykt: zostać („dopłaty robią robotę”), ale to nie jedyny plan. Uczestnicy mają 145–228% więcej niż wpłacili (biuletyn PPK 07.2026).

### Konto mieszkaniowe (artykuł z 2023 – sprawdzić aktualne warunki przed budową)
- 3–10 lat, min. 11 wpłat rocznie; wpłaty miesięczne w widełkach (wg gov.pl od 2026: 300–2 000 zł).
- Premia państwa = wyższe z: inflacja / wzrost cen mieszkań, min 1%, max 15% rocznie, od wpłat; wypłacana przy zakupie na rachunek sprzedającego; 1% premii dla banku.
- Bez Belki. Oprocentowanie banku słabe (min. 75% standardowego konta oszczędnościowego).
- Wypłata przed 3 latami = brak premii. Przez 3 lata po premii nie wolno sprzedać ani wynająć (zwrot proporcjonalny). Od 13 lat. Przeniesienie do innego banku po 12 mies.

## D. Aktywa – wnioski

### Obligacje detaliczne (oferta listopad 2026)
| Seria | Okres | 1. rok | Potem | Opłata za wykup |
|---|---|---|---|---|
| ROR | 1 rok | 4,00% | stopa ref. NBP | 0,50 zł |
| DOR | 2 lata | 4,15% | stopa ref. + 0,15% | 0,70 zł |
| TOS | 3 lata | 4,40% | stałe | 1 zł |
| COI | 4 lata | 4,75% | inflacja + 1,50% | 2 zł |
| EDO | 10 lat | 5,35% | inflacja + 2,00% | 3 zł |
| ROS | 6 lat (800+) | 5,00% | inflacja + 2,00% | 2 zł |
| ROD | 12 lat (800+) | 5,60% | inflacja + 2,50% | 3 zł |
- Cena zamiany 99,90 zł. Wykup w 5 dni roboczych, można częściowo. Inflacja do indeksacji = odczyt z miesiąca 2 przed rocznicą.
- EDO lepsze od COI przy trzymaniu > 4 lat, także przy poszarpanej inflacji. ROD > ROS. ROD/ROS tylko do kwoty 800+ (9 600 zł rocznie na dziecko), nie da się w IKE.
- TOS vs EDO: liczyć inflację zrównania (dla oferty z 04.2024 ok. 5,5%). TOS dobre na pieniądze potrzebne za 2–3 lata.
- Zamiana starych obligacji (niska marża) na nowe – liczyć kalkulatorem.
- Obawa „za miesiąc lepsza oferta” → kupować w transzach.
- EDO w IKE: najlepsza ochrona przed wysoką inflacją (przy inflacji 50% i marży 2 pp poza IKE Belka zjada realną wartość). IKE-Obligacje: opłata 0,1–0,16% rocznie, tylko PKO BP; transfer na IKE maklerskie bez opłaty po 12 mies. (150 zł wcześniej).
- 20 lat (04.2006–04.2026, PLN): inflacja ×2,008; EDO ×2,782; MSCI ACWI ×5,024 (MDD −42%); 50/50 → +295%, MDD ok. −20%; 25/75 → +236%.
- Obligacje notowane / fundusze obligacji długoterminowych: Iwuć wyciął je z portfela (2021); ryzyko stopy procentowej (inPZU Obligacje Polskie −21% od szczytu).

### Akcje / ETF-y
- Trzon: jeden ETF na szeroki indeks globalny (MSCI ACWI albo FTSE All-World), **akumulujący (Acc), UCITS**, tani (ok. 0,2%), **bez zabezpieczenia do PLN**. Identyfikacja po **ISIN**. Uwaga na CFD w XTB.
- Jego portfel: SWDA/IWDA (MSCI World) + EMIM/EIMI (MSCI EM IMI); wagę EM zmniejszał z 20% do 5%, żeby zbliżyć się do indeksu (lekcja: nie przeważać).
- ETF-y na GPW na zagranicę: niszowe, droższe, mniej płynne.
- ETF-y tematyczne / „lepsze ETF-y”: nie (46% nowych ma 1–10 składników, 4× droższe, powstają po trendzie).
- ETF-y dywidendowe: nieoptymalne podatkowo; ewentualnie na obrzeżach.
- Pojedyncze akcje: błąd nr 6 dla początkujących (ok. 90% aktywnych funduszy przegrywa z indeksem). Miejsce: „piaskownica” 5–10% / portfel ofensywny.
- MDD akcji globalnych: −50% (2000), −58% (2008, USD), −34% (COVID). Po −50% trzeba +100%.
- USA: 12 lat 9 mies. pod wodą realnie od 08.2000; złoto od 01.1980 – 44 lata 9 mies.; obligacje USA od 11.1940 – 45 lat 8 mies.; mieszkania USA – 6 lat 8 mies.; portfel 4×25% – 5 lat 10 mies.
- Wyceny (ostrzeżenie, nie sygnał): forward P/E świat ok. 17, USA ok. 21 (02.2024); CAPE USA 37,04 (01.2025). Bańka = wysokie wyceny + nieracjonalne oczekiwania + powszechny optymizm.
- Realne stopy zwrotu długoterminowo: bony +0,8%, obligacje ok. +2%, akcje ok. +4,5% (do 7% dla 100% akcji), nieruchomości ok. +6,6% („Rate of Return on Everything”).

### Złoto
- Rola: polisa na dewaluację waluty / hiperinflację / głęboką recesję, nie na zwykłą inflację. 10–15% u niego.
- Fizyczne: bez VAT; bez PIT po 6 mies. posiadania; PCC 2% płaci kupujący (skup). ETC (np. iShares Physical Gold): Belka, ryzyko kontrahenta, koszt ok. 1,3% przy zakupie małej kwoty.
- Nie do poduszki. Długie okresy słabości (koniec lat 80. – 2002).

### Surowce, krypto, inne
- Surowce: dodatek, najlepiej szeroki indeks; roczne obsunięcia ok. −60%.
- Krypto: Iwuć nie ma; tylko część spekulacyjna u Pieloka.
- Portfel ofensywny Iwucia: gotówka („suchy proch”), polskie mWIG40/sWIG80, grunty, surowce, pojedyncze zakłady (−30% chiński ETF, −40% Alibaba).

### Gotówka, lokaty, konta, fundusze krótkoterminowe
- Lokaty/konta: tylko pieniądze na najbliższe pół roku + 1/5 poduszki. Promocje krótkie, limity kwot.
- Krótki termin (< 3 lat): lokaty/konta → TOS/COI → fundusze krótkoterminowych papierów skarbowych.
- Kryteria funduszu (analizy.pl): dłużne, Polska, ryzyko 1–2, PLN, opłata ≤ 0,5%, „dobre praktyki”, indeksowy/tani; **odrzucić długoterminowe i z obligacjami firm**; sprawdzić politykę, kartę, KID (koszty realne np. 0,59% + 0,12%), skład. Przykłady: inPZU Inwestycji Ostrożnych, Goldman Sachs Konserwatywny, Beta ETF Obligacji 6M.
- Fundusze dłużne zarabiają przy spadku stóp, tracą przy wzroście.

### Nieruchomości
- Własne mieszkanie = konsumpcja; zasada **30/20/20** (rata ≤ 30% dochodu netto, wkład ≥ 20%, okres ≤ 20 lat); przy gotówce – kupować za gotówkę; stałe oprocentowanie = spokojny sen.
- Pierwsze mieszkanie (750 tys., Warszawa): wkład 10% 75 tys. + koszty ok. 6 tys. (PCC 2% – zwolnienie dla pierwszego) + poduszka 6 mies. → ok. 120 tys.; dochód 10–11 tys. netto. Wkład 10% zamiast 20%: marża +0,35–0,45 pp, rata +600 zł, odsetki +142 tys. w 30 lat.
- Kredyt 20 vs 30 lat: po 10 latach o 15 386 zł mniej odsetek i dług mniejszy o 57 463 zł.
- Najem: rentowność realnie 3–4% netto + wzrost wartości; 10–10,5 mies. w roku; remont co 5–7 lat; nie pasywny; wycena co 3 lata (najniższa z 3 minus 5%).
- Cykl nieruchomości ok. 16–17 lat; czynniki: ceny do zarobków, kredyty, stopy, podaż, demografia. „Na mieszkaniu dla siebie nie spekulować.”
- Poduszka vs wkład własny: poduszka pierwsza; kompromis 3 mies.; plan na czarny scenariusz.

## E. Zasady postępowania (strategia)

- Kolejność: długi konsumenckie → (mały fundusz awaryjny ok. 2 000 zł, gdy są długi) → poduszka → inwestowanie długoterminowe i/lub nadpłata hipoteki.
- Poduszka: 6 mies. wydatków (3–4 przy niskim ryzyku, 8–12 rodzina z kredytem); 20–25% konto oszczędnościowe, reszta EDO/COI; 2–3 tygodnie wydatków w gotówce; co roku dopłata o inflację; przegląd po zmianach życiowych; definicja „awarii” (niezbędny i nieprzewidziany).
- Strategia 3 portfeli: poduszka / długoterminowy / ofensywny.
- Horyzonty: < 3 lat krótki, 3–10 średni, 10+ długi.
- Budowa strategii – część „o mnie”: cel i horyzont, płynność, czas na zarządzanie (u niego 3–6 h na kwartał), częstotliwość wpłat i transze, podatki/pokrowce, **zdolność** i **skłonność** do ryzyka (wybrać niższą; MDD w % i w zł), doświadczenia, wiedza, oczekiwana stopa. Część „o portfelu”: klasy aktywów (trzon: gotówka, obligacje detaliczne, akcje globalne), wagi (start 50/50, iteracja wg MDD), instrumenty, instytucje. Część „o działaniu”: monitoring, rebalancing, list do siebie na spadki, kiedy zmieniać strategię.
- Rebalancing: głównie wpłatami, raz na kwartał; sprzedaż dopiero przy dużym rozjeździe (01.2026 sprzedał złoto za 90 tys.).
- Reguła zapisana z góry: „przy przecenie akcji ≥ 20–30% zmniejszę złoto do 10% i dokupię akcji do 40%”.
- Stany ostrożny / neutralny / agresywny (2018, część portfela): wg gospodarki, wycen, nastrojów; zmiana raz na kilka lat.
- Timing = błąd: koszt ok. 1,2 pp rocznie (Morningstar: 7% zamiast 8,2%). Obawa przed górką → transze i harmonogram.
- W spadkach: nie przerywać wpłat, nie sprawdzać codziennie, patrzeć na cały portfel, „zestaw uspokajający”.
- Koszty: +1 pp opłat = −21 tys. zł w przykładzie 200 zł/mies. przez 30 lat; 3 z 4 kont IKE/IKZE w Polsce za drogie.
- 9 błędów: nierealistyczne oczekiwania; przekroczenie punktu spokojnego snu; timing; kopiowanie innych; drogie produkty; pojedyncze akcje; fałszywa dywersyfikacja; płacenie za wysokich podatków i odmowa dopłat; zwlekanie.
- Nadpłata hipoteki vs inwestowanie: porównać oprocentowanie kredytu z zyskiem po podatku (w IKE bez pomniejszania); historycznie nadpłata > lokaty i zwykle > EDO, akcje > nadpłata ale z ryzykiem; prowizja za nadpłatę (kredyty po 21.07.2017: zmienna stopa – tylko 3 lata); przy niskim oprocentowaniu (2% / stała niska) – inwestować; podział np. 80/20; nadpłata traci limity IKE/IKZE.
- Emerytura: luka = potrzeby w dzisiejszych zł − prognoza ZUS; kapitał docelowy; miesięczna kwota; opóźnienie o 5 lat: 3 180 → 3 777 zł/mies.; z pokrowcami 2 677 zł. Bogleheads: 20% dochodu.
- Limity roczne przepadają 31.12 – można wpłacić gotówkę na IKE/IKZE maklerskie albo kupić IKE/IKZE-Obligacje i zdecydować później.
- Najważniejsze dla majątku: zarobki i stopa oszczędności, nie wyciskanie stopy zwrotu.

## F. Dziennik czytania

- Runda 1 (13.11): 12 artykułów w całości.
- Runda 2 (14.11): 52 artykuły – początek i koniec, środek pominięty; 13 odłożonych.
- Runda 3 (14.11): 18 artykułów (nieruchomości i inne aktywa) – początek i koniec.
- Runda 4 (naprawa, w toku): pominięte środki 71 artykułów + 13 odłożonych w całości = 37 paczek (`u00`–`u36`). Postęp i nowe wnioski poniżej w sekcji G.

## G. Uzupełnienia z rundy 4 (pełna lektura)

### u00 – IKZE (środek), IKE (środek), zwrot z IKZE (środek)
- **Ulga IKZE liczona „od góry”**: jeśli dochód tylko trochę przekracza II próg, po 32% odlicza się tylko część spadającą z II progu, resztę po 12%. Przykład 2026: podstawa 122 000 zł, wpłata 11 304 zł → 2 000 zł × 32% + 9 304 zł × 12% = **1 756,48 zł**, nie 3 617,28 zł. → doradca musi liczyć z podstawy opodatkowania (próg 120 000 zł), nie z samego „progu”.
- **Ulga dla młodych**: IKZE ma sens dopiero dla przychodu ponad 85 528 zł (nadwyżka opodatkowana normalnie). Ulgi 0%: też pracujący seniorzy, powrót z zagranicy.
- **Wspólne rozliczenie małżonków**: każde odlicza IKZE od WŁASNEGO dochodu (musi mieć dochód ≥ wpłata), dopiero potem suma / 2; osoba z niskim dochodem może dzięki temu zyskać 32%, jeśli po podzieleniu są w II progu. Brak własnego dochodu = brak ulgi.
- Kilka ryczałtów: odliczenie proporcjonalnie do przychodów z każdej stawki. Etat + JDG: wyższy limit, a odliczyć można na dowolnym zeznaniu (KIS), także dzieląc; decyzja co roku inna. PPK + wyższy limit IKZE – można.
- IKZE opłaca się: 32% – nawet przy zwrocie przed 65; średnie stawki (12%, ryczałt 14–17%, liniowy 19%) – gdy czekasz do 65 albo zwrot wyjdzie na 0%/12%; pracujący emeryt (unika II progu); aktywny inwestor (brak PIT-38). Ryczałt 3% / 5,5% – bez sensu; 8,5% – tylko do 65 i przy solidnych zyskach.
- Ryzyko: wzrost stawek skali w przyszłości przy zwrocie.
- Wpłata nie musi być zainwestowana, liczy się wpływ w danym roku; nie czekać do sylwestra (przelewy nie dochodzą). Odliczenia nie przenosi się na kolejne lata. Nadpłata ponad limit wraca. Zyski/dywidendy nie zmniejszają limitu. **Ulgę trzeba samemu wpisać w PIT** (nie trafia automatycznie) → przypomnienie w „Na dziś” przy PIT.
- **Osoby uposażone** (IKE i IKZE): wskazać w umowie – środki bez postępowania spadkowego, bez podatku od spadków; z IKZE wypłata 10% albo transfer na własne IKZE bez potrąceń. → punkt kontrolny doradcy „czy wskazałeś uposażonych”.
- IKE: **zakaz dwóch IKE naraz** – utrata zwolnienia i 75% podatku od zysków. Zwrot częściowy – przykład: 100 tys. (80 wpłat + 20 zysku), wypłata 10 tys. → podatek od 2 tys. = 380 zł. Zwrot częściowy nie obejmuje środków z PPE (przy zwrocie całkowitym 30% składek PPE do ZUS).
- IKE-Obligacje: opłata 0,16–0,10% nominału, **maks. 200 zł rocznie**, w roku założenia 0; zwrot częściowy 100 zł.
- W IKE można zmieniać inwestycje (sprzedaż/kupno ETF-ów) bez Belki. Dywidendy zagraniczne: podatek u źródła i tak pobierany.
- Belka a inflacja: 4% zysku przy inflacji 2,5% → z 400 zł realnie zostaje 74 zł; przy 10% zysku i inflacji 8,5% – realnie −40 zł (podatek od zysku nominalnego).
- Prawdopodobieństwo „nacjonalizacji” IKE wg Iwucia ok. 5%; realne ryzyko to zmiana zasad dla nowych wpłat.
- Zwrot z IKZE: neutralny, gdy ten sam próg przy wpłatach i zwrocie („neutralny ze skłonnością do pozytywnego” – wartość pieniądza w czasie, odroczenie).
### u01 – transfer IKE/IKZE (środek), kalkulator obligacji (środek)
- Sensowne IKE/IKZE wg Kasi Iwuć tylko dwa: **IKE/IKZE-Obligacje (PKO BP)** albo **rachunek maklerski z zagranicznymi ETF-ami**. Odrzucone: TFI (566 tys. IKE i 308 tys. IKZE w tej formie – „za drogie”), DFE, UFK, konto oszczędnościowe IKE (słabe oprocentowanie).
- Koszt: 100 000 zł przez 30 lat przy 8% → 1 006 266 zł; z opłatą 3% rocznie → 403 520 zł (206 597 zł opłat + 396 149 zł niezarobione). Jej maklerskie IKZE ok. 100 tys.: ok. 250 zł rocznie (16 zł różnic kursowych + 0,2% ETF) vs 3 000 zł w TFI.
- Transfer: 4 kroki (nowa umowa z zaznaczeniem „mam IKE/IKZE – transfer” → „Potwierdzenie zawarcia umowy” → dyspozycja wypłaty transferowej w starej instytucji → do 14 dni → zakup instrumentów). Formy: poczta/zwykły podpis (PZU), mail (XTB), infolinia (Bossa), **tylko oddział (PKO TFI, IKE/IKZE-Obligacje PKO BP)**, czasem podpis notarialny.
- Między rachunkami maklerskimi można przenieść **papiery bez sprzedaży** (dodatkowa „dyspozycja przelewu papierów wartościowych”) – zostaje się na rynku, brak kosztów.
- Opłata za transfer tylko w pierwszych 12 mies.: PTE NN 50% wpłat maks. 300 zł, PKO (IKE/IKZE-Obligacje) 150 zł, XTB 200 zł, Bossa 150 zł; po 12 mies. tylko koszty KDPW (instrumenty z GPW). Przy transferze z IKE-Obligacji **brak opłaty za przedterminowy wykup**.
- W trakcie transferu nie można wpłacać – pod koniec roku najpierw wpłacić do starej instytucji (limit), potem transfer.
- **Super IKE (PKO BP)**: obligacje detaliczne + GPW, 60 zł rocznie + 0,1% obligacji (maks. 200 zł); przejście IKE-Obligacje ↔ Super IKE darmowe (aneks).
- Ranking FBO: eMakler (mBank) 1. miejsce drugi rok, Bossa 3.; argument: warunki w stałej tabeli opłat, nie w promocji. Sprawdzać opłatę za transfer PRZED założeniem konta.
- Kalkulator obligacji – 4 scenariusze dla 1 000 zł na 10 lat (oferta 2026):
  1. inflacja 1,5% (próg 1 161 zł): TOS 1 412 > ROD 1 383 > EDO 1 353 > ROS 1 340 > COI 1 302 > DOR/ROR ok. 1 245 > lokata 1 176.
  2. inflacja rośnie do 4–6% (śr. 4,58%, próg 1 564): ROD 1 739 > EDO 1 695 > ROS 1 625 > DOR 1 565; poniżej progu: ROR 1 551, COI 1 518, lokata 1 439, TOS 1 417.
  3. szok (12% i 14% w latach 5–6, śr. 5,4%, próg 1 680): tylko ROD 1 897 i EDO 1 846 biją inflację; ROS 1 641, COI 1 637, DOR 1 565, ROR 1 551, lokata 1 439, TOS 1 417.
  4. to samo w IKE: EDO 2 034 (+188), COI 1 820, DOR 1 701 (przebijają próg), ROR 1 674, TOS 1 508.
  → wniosek do doradcy: pokazywać wynik obligacji w **3 scenariuszach inflacji** + próg „dogonienia inflacji” po Belce; nie ma jednej najlepszej serii.
- Lipiec 2026: inflacja CPI 3,0% r/r.
### u02 – zamiana obligacji (środek)
- Zamiana starych EDO na nowe: koszty = opłata za wykup + **przyspieszenie Belki** (pracuje mniejsza kwota). Opłaca się tym bardziej, im **niższa** przyszła inflacja (liczy się różnica marż), im większa kwota; przy wysokiej inflacji (10%) i długim trzymaniu stara bywa lepsza; stara odrabia w roku zapadalności (brak opłaty). Zysk zwykle mały (przykład: po 8 latach 101 zł przy sporej kwocie) → doradca: liczyć, ale pokazywać kwotę zysku i sugerować tylko przy wyraźnej korzyści.
- Pewny wynik tylko dla obligacji z **tego samego miesiąca** (ta sama indeksacja); różne miesiące = różne odczyty inflacji. COI – korzyść większa (podatek i tak co roku). ROD/ROS – zamiana zużywa limit 800+. W IKE brak podatku przy wykupie, ale operacji nie da się zrobić online.
- TOS: oprocentowanie nowych emisji idzie za stopą NBP i inflacją; znane są warunki tylko bieżącego (i pod koniec miesiąca – następnego) miesiąca → „zacementowanie” stawki przed obniżkami stóp.
- Detaliczne: odroczenie Belki do wykupu (EDO 10 lat, ROD 12) = mocniejszy procent składany; COI wypłaca odsetki co roku (Belka co roku).
### u03 – IKE-Obligacje vs IKZE-Obligacje (środek)
- EDO: opłata za wykup 3 zł/szt., ale **nie więcej niż narosłe odsetki**; przykład 1 000 zł po 2 latach: 110,37 − 30 = 80,37 zł zysku przed Belką. Gwarancja Skarbu Państwa bez limitu 100 tys. EUR (lepiej niż BFG przy dużych kwotach). Min. 100 zł.
- EDO przy stałej inflacji 10%: 1 000 → 2 565 zł netto, a próg inflacji 2 594 (brak 29 zł): winne stałe oprocentowanie 1. roku i Belka (367 zł). **Z 251 emisji EDO 56 nie pobiło inflacji poza IKE; w IKE – wszystkie 251 pobiły.**
- IKE-Obligacje: opłata roczna wg roku oszczędzania: 0 / 0,16 / 0,15 / 0,14 / 0,13 / 0,12 / 0,11 / od 8. roku 0,10% nominału, maks. 200 zł; płatna do 20 lutego na osobny rachunek (inaczej PKO sprzeda obligacje). Zwrot całkowity do 14 dni, 50 zł; częściowy do 30 dni, 100 zł za ratę; zwrot w pierwszych 12 mies. 150 zł. **Nie opłaca się przy planie wyjścia po ok. 5 latach** (np. wkład własny) – EDO kapitalizuje, więc odroczenie i tak jest, a dochodzą opłaty.
- IKZE-Obligacje: opłata stała **80 zł rocznie** (1. rok 0), pobierana z konta (zjada limit); przy wpłacie 1 000 zł rocznie – nieopłacalne. Zwrot całkowity w 12 mies. 150 zł. Przy dużych portfelach tańsze niż IKE-Obligacje (80 vs 200 zł).
- Zakładanie: online tylko z kontem osobistym PKO BP + iPKO; inaczej oddział / POK DM PKO BP (ok. 1 h); uważać, żeby nie wyjść z droższym funduszem. **DNOS** – dyspozycja automatycznego kupowania obligacji z każdej wpłaty (stałe zlecenie = pełna automatyzacja).
- Dziedziczenie: IKE – bez Belki i bez podatku od spadków; IKZE – 10%, bez podatku od spadków; opłata 50 zł od spadkobiercy.
- Wyniki realne: IKE Kasi od 2019 – 7,7% rocznie. 100 zł: 5 lat EDO 148 / akcje 162; 10 lat EDO 179 (6,1%) / akcje 274 (10,8%), inflacja 4,9% → 159; 20 lat EDO 286 (5,4%) / akcje 537 (8,9%), inflacja 3,5%. 2022: akcje −18%, EDO +8,5%. MDD akcji −56,79% (2009), −30,70% (2020).
- Co pakować do IKE/IKZE: podatkowo – akcje (większy zysk = większa oszczędność); ale „dwa rodzaje żalu” (nie zarabiam w hossie / tracę w bessie). W Polsce w II progu ok. 2 mln osób, kont IKZE ok. 600 tys.
- IKE/IKZE-Obligacje pasują też, gdy **wypłata ma konkretną datę** (np. za 10 lat emerytura / zakup domu) – ryzyko bessy w dniu wypłaty nieakceptowalne.
### u04 – OIPE (środek), PPK 2023 (środek)
- OIPE: konto 18–55 lat (po 55 tylko bez praw emerytalnych); **zwrot tylko całkowity** (gorzej niż IKE), kara = Belka; **dwa OIPE = 75% podatku**; zmiana dostawcy raz na 5 lat, koszt transferu maks. 0,5%. IKE + IKZE + OIPE razem w 2026 ok. 70 tys. zł limitu. Subkonto tylko w kraju zamieszkania.
- Finax OIPE: zarządzanie 0,6% + VAT ≈ 0,74% + ETF-y ≈ 0,9% rocznie; min. wpłata 50 zł; przewalutowanie ±0,0045 zł; wariant podstawowy 80/20, obowiązkowa redukcja akcji do 60%. Odchylenia: niedoważa USA, brak Japonii, przeważa Europę/EM, małe spółki; obligacje bez hedgingu, trochę high yield.
- Kalkulator OIPE (akcje 7%, obligacje 3%, 25 lat): **100 zł/mies.** → 1. IKE w XTB, 2. OIPE Finax, potem IKE w innych DM (prowizja min. 14 zł = 14% wpłaty), nawet zwykły rachunek XTB lepszy od IKE z prowizją minimalną. **Pełny limit kwartalnie** → 1. eMakler (0,29% + spread), 2. IKE XTB (0,5% przewalutowania), OIPE i zwykły XTB w tyle. Samodzielne IKE ≈ 0,5% kosztu rocznie (0,29% prowizji + 0,2% ETF).
  → doradca: **wybór instytucji zależy od wielkości pojedynczej wpłaty** (prowizja minimalna vs % przewalutowania); reguła: prowizja min. 14–19 zł = 0,29% dopiero od ok. 4 800–6 550 zł na transakcję → małe kwoty kumulować albo broker bez prowizji minimalnej.
- PPK – wady: niższa pensja; brak wpływu na wybór instytucji (rozrzut wyników 2020–2023: fundusze 2025 od −0,8% do +12,5%, fundusze 2060 od +9,2% do +42,6%); polityka narzucona (min. 40% części akcyjnej w WIG20, maks. 30% w walutach; w połowie 2022: 1/3 polskie akcje, 22% obligacje skarbowe, 21,6% quasi-skarbowe, tylko 15% akcje zagraniczne, prawie wszystko w PLN); **realny koszt ok. 0,97–1,2% rocznie** (nie 0,35%).
- PPK – zalety: dopłaty (przykład PKO Emerytura 2025: stopa funduszu −0,1%, a pracownik wpłacił 4 254 zł i miał 7 382 zł, +70%); prywatne, dziedziczone; wypłata w każdej chwili. Można przenosić środki między funduszami zdefiniowanej daty (więcej/mniej akcji).
  → doradca: PPK liczyć jako „polskie akcje + polskie obligacje w PLN” wg roku funduszu; resztę portfela ustawiać tak, by wyrównać brak zagranicy i walut.
### u05 – emerytura (2 artykuły, środki)
- Prognoza emerytury: **kalkulator na koncie ZUS (PUE/eZUS)** – składki zwaloryzowane + subkonto + OFE, data przejścia, % przeciętnego wynagrodzenia (przedsiębiorca: 60%). Wynik brutto → odjąć PIT i zdrowotną. → pytanie ankiety: „prognoza z kalkulatora ZUS (kwota brutto)” z instrukcją, gdzie ją znaleźć.
- Stopa zastąpienia: 2018 ok. 56%; prognoza 2050 ok. 25% (nawet 18,7%). Pracujący na emeryta: 2,6 dziś → ok. 1,3 w 2050. Emerytury kobiet niższe o ok. 1 000 zł (2018: 1 695 vs 2 724 zł).
- Szansa dożycia wieku emerytalnego: kobiety 96%, mężczyźni 83–86% → ryzykiem jest **długowieczność**, nie śmierć. Oszczędności seniorów zaczynają spadać ok. 75 r.ż. (ING).
- Założenia kalkulatora FBO (przykład): cel = dzisiejsze 4 750 zł netto, ZUS 2 200 zł netto, 30 lat do emerytury, inflacja 3,5%, przed emeryturą +3 pp (6,5%), na emeryturze +1 pp (4,5%), start 30 tys. zł, z Belką, **wynik zależny od liczby lat emerytury** (do 100 lat = 35 lat): 3 180,80 zł/mies., kapitał docelowy ok. 2,9 mln zł nominalnie.
  → doradca: moduł „emerytura” = cel w dzisiejszych zł, prognoza ZUS, lata do emerytury, lata na emeryturze (domyślnie do 90–100), realne stopy przed/po, Belka/pokrowce; wynik: kwota miesięczna + kapitał docelowy + ile już jest (PPK, IKE, IKZE).
- Wyobrażenie siebie w przyszłości pomaga odkładać (element UX: krótka zachęta od kotków).
### u06 – „Twoja strategia inwestycyjna” (rozmowa z System Traderem), środek 1/2
- Strategia musi pasować do czasu i wiedzy: dla większości = **portfel pasywny z ETF-ów** (albo robodoradca); aktywne zarządzanie to margines. Realne oczekiwania; inwestuje się **nadwyżki**, nie „żeby podreperować budżet”.
- **Trzymaj kurs** (Bogle): najtrudniejszy jest rebalancing w czasie krachu (dokupić akcje, gdy spadły) – strategia ma być do wytrzymania także psychicznie.
- **Test historyczny** portfela przed startem: stopa zwrotu, zmienność i przede wszystkim **maksymalne obsunięcie**; patrzeć na długie okresy, nie ostatnie 10 lat. Liczby: S&P 500 2011–2020 ok. 13% rocznie (obsunięcie 33%), 2001–2010 niecałe 2% (realnie ok. −1%, obsunięcie 55%); 120 lat: realnie ok. 6,5%, obsunięcie > 80% (Wielki Kryzys). Globalne akcje ok. 100 lat: realnie ok. 6% (nominalnie ok. 9%), obsunięcie ok. 70%. Japonia/Grecja/Włochy – słabo nawet długo.
- Złoto 1980–2021: realnie **−0,6%** rocznie (nominalnie ok. 2%) – „pytaj dane, nie ludzi”. Obligacje 10-letnie USA 1940–1981 (rosnące stopy): realnie ok. −0,2% rocznie.
- Portfel długoterminowy Iwucia (część rynkowa; druga połowa to nieruchomości): akcje 35% (rozwinięte 15, wschodzące 20), obligacje rynkowe 10% (duration ok. 4 lata), obligacje indeksowane inflacją 40%, złoto 15%. Cel: **3% ponad inflację**, obsunięcie ≤ 25%, kilka godzin pracy na kwartał. Test 1973–2020: 9% nominalnie, 5% realnie, obsunięcie 24%, odchylenie 9,2% (połowa S&P 500).
- Wariant 80% akcji / 10% złoto / 10% obligacje inflacyjne: realnie 6,3%, obsunięcie ok. 47%. Portfel 80/20 w latach 1940–1981: 8,3% nominalnie, tylko 3,5% realnie.
- Prognozy (Credit Suisse Yearbook 2021): 100% akcji ok. 3% realnie, 70/30 ok. 2% realnie → **studzić oczekiwania**; drogie wyceny = niższe przyszłe zwroty.
- Zmienność nie jest ryzykiem, gdy pieniędzy nie potrzeba przez dekady; **bliżej emerytury więcej obligacji**, żeby nie sprzedawać akcji w dołku.
- Liczba składników: 2–3 = łatwy rebalancing, 10 = trudny. „Tax alfa” – najpierw wykorzystać konta emerytalne. Dywersyfikacja globalna zamiast samych USA. Księgowanie mentalne: 3 portfele (poduszka / długoterminowy / ofensywny – tam można stracić nawet 80%).
  → doradca: pokazuje dla wybranych proporcji historyczne „najgorsze obsunięcie” i realny zwrot (tabela stała w kodzie), pyta w ankiecie o maksymalną stratę do zniesienia; domyślne założenie zwrotu ostrożne (2–3% realnie).
