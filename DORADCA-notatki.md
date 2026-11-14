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
### u07 – strategia 2/2, portfel odporny na inflację, krach na rynkach, które ETF-y (środki)
- Portfel pasywny = przegląd **raz na kwartał**, zmiany przemyślane przez cały kwartał. Portfel ofensywny: bez wag, okazje, horyzont do 3 lat. Aktywny trading przeliczyć na stawkę godzinową.
- **Inflacja a aktywa** (Fama/Schwert, Schwab, Goldman, MFW, Schroders): żadne pojedyncze aktywo nie chroni zawsze → **zdywersyfikowany portfel**. Akcje: krótko słabo, w 20 lat biły inflację w 100% przypadków (USA). Nieruchomości: ok. 90% przy 20 latach (+ czynsz). Złoto: słabe przy niskiej inflacji i krótko, lepsze w dekadach i przy wystrzale inflacji; dobra dywersyfikacja wobec akcji. Obligacje rynkowe stałokuponowe: słabo. **Surowce: krótko OK, długo coraz gorzej** (ujemny roll yield kontraktów) → tylko portfel ofensywny, nie długoterminowy.
- Polskie obligacje indeksowane inflacją (COI/EDO) kupuje się zawsze po nominale – **nie ma ryzyka „drogiego zakupu”**, inaczej niż TIPS-y notowane na rynku. → mocny argument, że doradca może je polecać niezależnie od „termometru”.
- Gotowe fundusze „antyinflacyjne” (Fidelity, SPDR RLY, VanEck RAAX) – nie przekonują; największe 12-mies. obsunięcia: surowce nawet −60%.
- Przykład portfela (współautor): akcje zagr. 45%, złoto 30%, obligacje stałokuponowe 10% (na deflację), gotówka 10%, surowce 5%. Ofensywny Iwucia (VI.2021): surowce 10, akcje PL 20, grunty 30, gotówka 40 („suchy proch”).
- **Ryzyko mierzyć maksymalnym obsunięciem**, nie odchyleniem. Strata w złotówkach działa mocniej niż w % (30% z 10 tys. = 3 tys.; z 1 mln = 300 tys.) → doradca pokazuje możliwą stratę **w złotych**.
- **Test kryzysu 2007–2009** (od szczytu do dołka): akcje USA −52,6%, rynki rozwinięte −54,0%, wschodzące −61,6%, złoto +20,6%, obligacje indeksowane inflacją +9,7%, obligacje rynkowe +5,1%, dolar do złotego **+46,1%**. W złotych: USA −30,7%, rozwinięte −32,8%, wschodzące −43,9%, złoto +76,2%. Portfel Iwucia: +2,6% (ostrożniej: −7%). Arkusz testuje 3 okresy: bańka internetowa 2000–2002, kryzys 2008, COVID 2020. Zastrzeżenia: dane miesięczne, wynik w PLN (osłabienie złotego amortyzuje), kolejny kryzys może być inny → dać też wariant ostrożny (złoto połowa zysku, złoty słabnie o połowę mniej).
  → moduł „test kryzysu”: tabela stałych spadków klas aktywów w 3 kryzysach × obecne proporcje użytkownika → „Twój portfel straciłby ok. X zł”. Porównać z odpowiedzią z ankiety o maksymalnej stracie.
- **Kryteria wyboru ETF-u** (na przykładzie SWDA / EIMI): dostawca (duży, np. BlackRock/iShares), indeks (MSCI World; MSCI EM IMI – też małe spółki), liczba spółek (1607 / 2653), dokładność naśladowania, koszt (TER 0,20% / 0,18%), replikacja fizyczna, **akumulujący (Acc)**, **rejestracja w Irlandii** (korzystny podatek od dywidend z USA), wielkość funduszu.
- Kiedy kupić? Nikt nie zna przyszłości; sposoby na rozterki: to element strategii; to tylko 1 z 3 portfeli; (dalej w kolejnej części).
### u08 – małe kwoty, jak zacząć, poduszka a inflacja, poduszka Q&A, poduszka czy wkład własny (środki)
- **Małe kwoty**: najpierw „projekt” (modelowy skład portfela), potem budowa cegła po cegle; możliwie szybko doprowadzić **wagi** do modelowych, bo tylko wtedy portfel zachowuje się jak zaprojektowany. Kolejne wpłaty przybliżają do wzorca. → doradca: każda wpłacona kwota idzie tam, gdzie największy niedobór względem docelowych proporcji.
- Kto planuje mieszkanie (na wynajem albo własne): pieniądze = **wkład własny na dobrym koncie oszczędnościowym**, nie na giełdzie; część rynkowa dopiero po zakupie.
- Błędy skrajności: 100% akcji (nie wytrzymasz −40–50%), 100% obligacji rynkowych (strata przy rosnących stopach), 100% gotówki (inflacja).
- Obligacje rynkowe (fundusze obligacji): cena rośnie, gdy rentowność spada; przy bardzo niskich rentownościach mało miejsca na zysk → Iwuć zmniejszył do 10%, nie do zera (scenariusz deflacji). → termometr dla obligacji stałokuponowych: rentowność 10-latek vs inflacja/stopa NBP.
- **Prosty portfel 3 składników** (tekst z 2026): obligacje detaliczne indeksowane inflacją (stabilizator) + tani ETF na globalny indeks akcji (wzrost) + niewielki dodatek złota (fizyczne lub ETC; „bramkarz”) = ok. 90% efektu. 19 lat: obligacje indeksowane +150%, globalne akcje ×5, złoto ×8, inflacja +92%, lokaty +76%.
- Błędy początkujących: komplikowanie; pogoń za „gwiazdą”; spółki dywidendowe to nie darmowy obiad (niższy wzrost, podatek od dywidend, koncentracja sektorowa); wiara w historie (druk 3D, metaverse, ESG, Rosja). **Jedyny darmowy obiad = dywersyfikacja. Nikt nie jest mądrzejszy od rynku.**
- **Piaskownica**: mały osobny portfel na eksperymenty (np. pojedyncze akcje), większość w prostych, nudnych inwestycjach. → doradca: akcje pojedynczych spółek tylko w „piaskownicy” z limitem % (pytanie w ankiecie).
- Kiedy zacząć: jak najszybciej (500 zł/mies. przez 10 lat od 25 r.ż. > 30 lat od 35 r.ż. przy 6,5%). Giełda USA od 1980: spadek w trakcie roku średnio ok. 14% (3% do 50%), a 35 z 46 lat na plusie.
- **Poduszka**: tylko na *nieprzewidziane* (choroba, naprawa auta, utrata dochodu), nie na komunię/wesele/wakacje. To „ubezpieczenie”, nie inwestycja – **nie mieszać z inwestowaniem** nawet przy 12 miesiącach. Obligacje indeksowane inflacją w poduszce mają sens (Belka dopiero na końcu przy EDO; po roku oprocentowanie = inflacja + marża).
- **Kolejność kroków**: 1) mały fundusz awaryjny ok. 2 000 zł, 2) spłata długów konsumpcyjnych (śnieżna kula), 3) pełna poduszka 6 mies. wydatków, 4) dopiero potem emerytura / nadpłata hipoteki. Powód: bez poduszki trzeba by się zadłużyć albo zerwać IKE (utrata zwolnienia, limit przepada) / IKZE (PIT wg skali od całości, nawet przy stracie) albo sprzedać akcje w bessie.
  → doradca: **bramki przed inwestowaniem** – kredyt konsumpcyjny? poduszka < 6 mies.? → „na pewno nie na giełdę; najpierw…” z kwotą.
- Polisa na życie nie zmniejsza poduszki (inne zadanie).
- Poduszka czy wkład własny: drzewko decyzji (ceny w górę/w dół × praca jest/nie ma); najgorszy scenariusz = mieszkanie bez poduszki + utrata pracy → **nie zużywać poduszki na wkład własny**.
### u09 – cena złota (środek)
- Krótkoterminowej ceny złota nikt nie zna („czy opłaca się na rok–dwa?” – nie wiadomo); sens tylko długoterminowy (25–30 lat), po drodze spadki nawet o kilkadziesiąt %. 1980–1999: dwie dekady spadku.
- **Sprzyja złotu**: wysoka inflacja, niskie/ujemne realne stopy, panika na rynkach, słaby dolar, niepokoje i obawy o system. **Nie sprzyja**: szybko spadająca inflacja, wysokie realne stopy (wtedy lepsze lokaty i obligacje), mocny dolar. → termometr złota: realna stopa (stopa NBP − inflacja; dane już mamy) – tylko jako informacja.
- **Rebalancing wpłatami**: złoto urosło z 15% do 17,7% → nie sprzedaje, tylko **wstrzymuje zakupy**, nowe pieniądze idą w inne aktywa. → główna reguła doradcy: wyrównywać nowymi wpłatami, sprzedaż dopiero przy dużym odchyleniu.
- Złoto fizyczne: normalna marża 3–5% ponad kurs LBMA; w 2020 małe sztabki/monety 20–29% drożej → przy małych kwotach lepszy **ETC na złoto fizyczne** (np. iShares Physical Gold, IGLN, Irlandia, USD, Londyn; koszt zakupu ok. 1,3% ze spreadem i przewalutowaniem), wada: Belka przy sprzedaży i ok. 2% rozjazdu w 5 lat; fizyczne sprzedaje się ok. 2% poniżej spot. → doradca: przy kwocie na złoto poniżej ok. kilku tys. zł → ETC (najlepiej w IKE/IKZE – bez Belki); przy większej – fizyczne 1 oz, z ostrzeżeniem o marży (pytać, ile wynosi marża u dealera; > 6–7% = drogo).
### u10 – złoto, kompletny przewodnik (środek 1/2)
- Złoto = **dodatek** do portfela, nigdy 100%. Role: (1) w panice korelacje innych aktywów rosną, a złoto zwykle drożeje → mniejsza zmienność portfela, łatwiej wytrwać; (2) dewaluacja walut / wysoka inflacja; (3) nie jest niczyim zobowiązaniem (fizyczne); (4) dopiero na końcu – zysk. Traktować jak polisę AC.
- Ryzyko: zmienność jak akcje; IX.1980 698 USD → IX.2000 272 USD (po 20 latach 38% kapitału). Przez lata bez związku z inflacją; na **zwykłą inflację lepsze EDO/ROD**, złoto na skrajne scenariusze. Nie zawsze chroni w kryzysie (bańka internetowa – uciekano do obligacji USA).
- Ile: instytucje 2,5–5%; Iwuć 10% (2019), później 15%. → doradca: domyślnie 5–10%, górna granica 15%.
- Sposób zakupu: regularnie (np. 1 uncja co kilka miesięcy), bez patrzenia na kurs; wyjątek – „gorączka złota” (euforia w mediach).
- Papierowe: sens mają tylko **ETF/ETC z fizycznym złotem** (nie kontrakty, nie spółki wydobywcze); wada – podatek (PIT-8C), chyba że w IKE/IKZE.
- Fizyczne: tylko **monety bulionowe** (Krugerrand, Liść Klonowy, Filharmonik, Kangur, Orzeł) i **sztabki** znanych mennic LBMA (Heraeus, Umicore, PAMP, Valcambi, Perth Mint) w CertiCard; nie biżuteria, numizmaty, „pozłacane medale”. **Im mniejsza sztuka, tym drożej za gram** (1/10 oz = 115% ceny rynkowej) → kupować 1 oz lub więcej. Moneta czy sztabka – co tańsze. Porównywać dealerów, negocjować; płacić przy odbiorze albo kartą (chargeback); unikać „dostawy terminowej” po 45 dniach. Przechowywanie: sejf / skrytka bankowa (ok. 600 zł rocznie – koszt do uwzględnienia).
  → w aplikacji: instrument `zloto` już jest (cena z automatu zł/g) – doradca przy złocie fizycznym pokazuje bieżącą cenę 1 oz i dopuszczalną marżę.
### u11 – złoto 2/2, 10 zasad (Bogleheads), wyciskać każdy grosz, strach, panika (FFP10), drobne środki
- Złoto – sprzedaż: skup płaci ok. **LBMA −4%** (Mennica Polska −2% za własne), bez różnicy moneta/sztabka/waga/producent; kupno +3% → **natychmiastowa strata ok. 6,7%** → złoto fizyczne nie na krótko. Złoto inwestycyjne bez VAT (sztabki ≥ 995, monety ≥ 900 po 1800 r.). Gotówką do 10 000 EUR.
- Bogleheads: (5) **nigdy timing** – inwestorzy indywidualni wypadają gorzej niż fundusze, bo kupują po wzrostach i sprzedają po spadkach; (6) fundusze/ETF-y indeksowe, np. ETF na FTSE All-World, **akumulujący – zwłaszcza poza IKE/IKZE**; (7) koszty: 0,15% vs 1,5% – „1% opłat = 10 lat oszczędności emerytalnych”; (8) **minimalizuj podatki** – IKE, IKZE, PPE, PPK; (9) prostota.
- „Wyciskać każdy grosz?”: trzy ścieżki do wyższego zysku – timing (brak powtarzalnej metody), perełki (z 24 tys. spółek USA w 90 lat tylko **4% dało całą nadwyżkę ponad depozyty, 6 na 10 gorsze niż depozyt**), większe ryzyko (większy rozrzut). Luka zachowania (Morningstar 2011–2021): strategie 11%, inwestorzy 9,31% → **−1,7 pp przez emocje**. 
- **+2% wpłat rocznie + IKE ≈ +2 pp zwrotu** – a pewniejsze i mniej pracy („ROE – zwrot z wysiłku”). → doradca: zamiast gonić zysk, podpowiada „zwiększ stałą wpłatę o X zł” i „najpierw wykorzystaj IKE”; pokazuje efekt w złotych.
- Skupiać się na tym, na co mamy wpływ: wpłaty, koszty, podatki, proporcje, zachowanie. Sparing partner (u Matiego i Werci – druga osoba; tryb „wspólnie”).
- Strach/panika: oceniać **portfel jako całość**, nie wycinać „losera” po spadkach; długi termin = pełny cykl, min. **10 lat**; większość informacji to szum; nie skakać między klasami (co roku inny zwycięzca; każda klasa kiedyś straci 1/5–2/3).
- Skład części rynkowej Iwucia w czasie: 2021: obligacje indeksowane 50 / złoto 15 / rozwinięte 15 / wschodzące 20; 2024: obligacje (EDO i ROD) 50 / złoto 15 / rozwinięte 22,5 / wschodzące 12,5. Wynik 10 lat: 8,74% rocznie (ok. 7 pp ponad inflację przy niskiej inflacji). Wyniki liczy w PLN (kurs dolara zmienia wynik).
- Klasy aktywów: gotówka, dłużne, akcje, nieruchomości, surowce, alternatywne; „opakowania”: fundusze, ETF, UFK – **najpierw co, potem opakowanie**. 100 zł: konto maklerskie bez prowizji i opłat (XTB) z ostrzeżeniem przed CFD/dźwignią.
### u12 – wyniki portfela 1Q i 2Q 2026, „W co inwestować w 2025” (środki) – NAJŚWIEŻSZY WZORZEC
- **Aktualne wagi modelowe części rynkowej (2026): 50% obligacje indeksowane inflacją (EDO, ROD z 800+) / 30% akcje rynków rozwiniętych / 15% złoto fizyczne / 5% akcje rynków wschodzących.** Akcje razem 35%, w proporcji zbliżonej do globalnego indeksu („niech decyduje rynek” – bez zakładów EM vs DM; dojście z 20% EM stopniowo po 2,5 pp na kwartał). Tylko **3 aktywa** – obligacje rynkowe usunięte dla prostoty (rodzina ma to umieć prowadzić).
- 4 założenia: ok. **inflacja + 3 pp w 10 lat**; obsunięcie ≤ 20–25%; obsługa 3–6 godzin **raz na kwartał** (styczeń, kwiecień, lipiec, październik – wpłaty, transakcje, przegląd); minimalne koszty i **pokrowce podatkowe**.
- **Rozmieszczenie w pokrowcach**: akcje (ETF-y akumulujące iShares/Vanguard na szerokie indeksy) prawie w całości w **IKE + IKZE** (obie osoby); obligacje indeksowane w dużej części w **IKE-Obligacje** drugiej osoby (ok. 300 tys.) – wtedy nawet przy wysokiej inflacji biją inflację (bez Belki); złoto fizyczne poza kontami. → wzorzec dla algorytmu „gdzie”: para ma 2×IKE i 2×IKZE – jedno IKE maklerskie (ETF-y), drugie IKE-Obligacje.
- **Rebalancing w praktyce** (2Q 2026): rozwinięte 32,89% (cel 30), wschodzące 6,03 (5), złoto 12,71 (15), obligacje 48,23 (50) → dopłata + sprzedaż części akcji + zakup obligacji i złota. Czyli raz na kwartał, także sprzedażą (w IKE/IKZE bez podatku).
- Wyniki: od 17.09.2020 do 30.06.2026 część rynkowa +67,86% wobec inflacji 48,17% (średnio 9,38% rocznie przy inflacji 7,04% → **+2,34 pp**), maks. obsunięcie na danych dziennych **5,93%**; w 2022–23 portfel był nawet 20,75 pp poniżej inflacji – **nie zmienił strategii** i nadrobił (3 lata do VI.2026: +46,45% vs 10,14%). 2024: część rynkowa +16,09%. Mały portfel (10 tys. + 500→550→650 zł/mies.) zachowuje się tak samo (+59%).
- Strata w złotych: „50% na minusie = 2 275 000 zł – po co takie emocje?” Akcje globalne: historycznie 5–8% ponad inflację, ale po drodze kilkadziesiąt % w dół.
- **Fundusze aktywne przegrywają**: 2025 – 79% funduszy akcji dużych spółek USA gorsze od S&P 500; w 20 lat 92,9%. → doradca nie poleca funduszy aktywnych ani typowania spółek jako trzonu.
- Waluty: akcje i złoto = twarde waluty bez zabezpieczenia do PLN (ok. połowy części rynkowej), obligacje w PLN – świadoma dywersyfikacja walutowa. → doradca pokazuje „ile % w złotych / ile w walutach”.
- Nieruchomości wycenia co 3 lata, ostrożnie (najniższa z 3 wycen − 5%); wartość netto = po odjęciu kredytu. Mieszkanie: centrum dużego miasta (demografia).
- Prognozy banków na dany rok (7 raportów) – „nie mam zielonego pojęcia, analitycy też”; dwa lata wcześniej pesymizm się nie sprawdził. Raporty najwyżej jako pomysł „do głębszej analizy” w portfelu ofensywnym, z **adwokatem diabła** (pułapka potwierdzenia). → doradca **nie pokazuje prognoz**; przy analizie spółki pokazuje też argumenty przeciw.
- Koncentracja: 6 spółek ≈ 30% S&P 500 (2025) – informacja do „termometru”/ostrzeżeń o koncentracji w ETF-ach na USA.
### u13 – jak odkładać na przyszłość, wahania rynkowe (3 stany), niepewne czasy (środki)
- **Automat**: stałe zlecenie pierwszego dnia po wypłacie („najpierw zapłać sobie”) – siła woli niepotrzebna. → doradca na końcu porady proponuje: „ustaw stały przelew X zł” (aplikacja ma stałe przelewy `fixedM kind:'tr'`).
- **Oznaki okolic szczytu**: gospodarka pędzi, ale zwalnia tempo, niskie bezrobocie, bank centralny podnosi stopy; ceny akcji wysoko ponad długoterminowe średnie; nastroje bardzo dobre. **Okolice dołka**: gospodarka słaba, ale pogarsza się coraz wolniej; ceny nisko wobec średnich; nastroje fatalne. Szczytu ani dołka nie da się trafić – wiadomo po fakcie.
- **Trzy stany portfela** (IKE Plus): ostrożny / neutralny / ofensywny – z góry określone proporcje akcji; zmiana **najwyżej ok. 3 razy na cały cykl** (kilka–kilkanaście lat); większość czasu neutralny; ofensywny, gdy tanio i strach; powrót do neutralnego, gdy wyceny wrócą do średnich. Nigdy 0% ↔ 100%. Porównywać wynik z „siedzę na rękach” i zrezygnować, jeśli gorzej po dwóch cyklach. Iwuć sam zaznacza, że gra alokacją prawie nikomu nie wychodzi i w głównym portfelu jej nie stosuje.
  → termometr w doradcy: tylko 3 stany, małe odchylenia (np. ±10 pp akcji), pokazane jako informacja; domyślnie wyłączony wpływ na kwoty (decyzja Matiego – pytanie 2).
- **Niepewne czasy (wojna 2022)**: spisać obawy; 3 scenariusze z prawdopodobieństwem (bazowy / zły / bardzo zły); „**jaki scenariusz obstawiasz obecnym portfelem?**” – 100% w złotówkach w banku to też zakład (że złoty i inflacja będą OK); pytania: gotówka w PLN czy udziały w tysiącach firm? cały majątek w PLN czy część w twardych walutach?
- 3 linie obrony: poduszka (min. 6 mies.; **więcej, gdy oboje „na swoim”/JDG**; skład Iwucia: 25% konta i lokaty + 75% obligacje indeksowane), portfel długoterminowy (nie zrywać IKE/IKZE w panice – duży błąd), ofensywny (**nie każdy go potrzebuje**; tylko pieniądze, bez których rodzina się obejdzie; rezerwa na okazje trzymana w EDO).
  → ankieta: forma zatrudnienia każdej osoby (aplikacja zna `incM.kind`) → zalecana wielkość poduszki 6 vs 9–12 mies.
### u14 – rynki wschodzące (środek)
- Indeksy do rozróżniania: **MSCI ACWI** (rozwinięte + wschodzące = „cały świat”; odpowiednik FTSE All-World), **MSCI World** (wbrew nazwie tylko 23 kraje rozwinięte), **MSCI EM** (24 kraje wschodzące, w tym **Polska**; ok. 77% Azja: Chiny, Indie, Tajwan, Korea). Udziały w kapitalizacji świata: USA ponad 60%, reszta rozwiniętych ok. 29%, wschodzące ok. 11%, graniczne 0,16%.
  → doradca przy ETF-ie pokazuje „co jest w środku”: ACWI/All-World = wystarczy jeden; MSCI World + EM = dwa (ok. 89/11); ostrzega, że „World” nie zawiera rynków wschodzących.
- Argumenty za przeważeniem EM: udział w PKB dużo większy niż w kapitalizacji; niższe wyceny (CAPE: rozwinięte ok. 25, EM ok. 14, Chiny 9,9, Polska 7,1, Indie > 30 – stan z 2022); cykliczność liderów (EM i DM zmieniają się co kilka–kilkanaście lat); słabszy dolar sprzyja EM. Przeciw: PKB ≠ giełda (USA: waluta rezerwowa, dojrzały rynek, firmy globalne – ACWI i tak daje ok. 40% przychodów z EM); geopolityka (USA–Chiny, Tajwan; Rosja wykluczona z indeksów w 2022 = strata 100%); autorytaryzm, słabsza ochrona inwestora; **rynek sam waży kraje** (indeks ważony kapitalizacją zwiększy udział EM, jeśli będą rosły).
- Wniosek Iwucia: nie timing; z czasem przeszedł na wagi jak w indeksie globalnym, odchylenia tylko w portfelu ofensywnym. CAPE „tanio” nie znaczy „zaraz zdrożeje” – potrzebna cierpliwość bez gwarancji.
  → doradca: domyślnie akcje wg wag globalnych (jeden ETF na cały świat); opcja „więcej Polski/EM” tylko jako świadomy wybór w ankiecie z limitem; CAPE regionów jako informacja w termometrze (dane: trzeba znaleźć darmowe źródło – do sprawdzenia przy budowie).
### u15 – ETF-y dywidendowe (rozmowa z Inwestomat.eu, środek)
- Dywidenda jest nieoptymalna podatkowo (podatek przy każdej wypłacie); spółki zagraniczne poza IKE/IKZE = żmudne rozliczenie (kurs z dnia poprzedzającego, każda wypłata osobno). GPW: dywidendę płaci ok. 40% spółek, polityka niestabilna; „arystokraci” (25 lat rosnącej dywidendy) praktycznie tylko w USA (ok. 65 spółek).
- **Acc vs Dist**: akumulujący sam reinwestuje (mniej podatków, prowizji, czasu) → domyślny wybór w fazie budowania. Dystrybuujący przerzuca na nas reinwestowanie.
- ETF-y dywidendowe: „high dividend yield” = często słabe spółki, duża rotacja, dywidenda nie rośnie (**nie kierować się nazwą ani samą stopą dywidendy**); „dividend aristocrats” USA – sensowniejsze; koszt ok. 0,34% vs 0,16–0,17% dla szerokiego rynku. ETF na cały świat typu Dist daje ok. 1% dywidendy brutto.
- Kiedy dywidendy mają sens: (1) motywacja początkującego, (2) **okres wypłat na emeryturze** – ETF Dist w IKE/IKZE + wypłata ratalna (IKE od 60, IKZE od 65). Uwaga: zamiana Acc → Dist poza IKE/IKZE po latach = duży podatek Belki → kto chce żyć z dywidend, niech ma je w IKE/IKZE.
- **ISIN zaczyna się od IE** (Irlandia) = najlepsze podatkowo dla ETF-ów; miejsce notowania nie ma znaczenia.
  → doradca: w kryteriach ETF-u pole „Acc/Dist” i „kraj rejestracji z ISIN”; w ankiecie pytanie o etap: budowanie czy wypłaty (wiek / lata do emerytury) – przy wypłatach dopuszcza Dist w IKE/IKZE.
### u16 – upadek dolara? (2025), co to jest ETF (środki)
- Dolar: status ≠ kurs. Udział w rezerwach spadł z 64% do 48% w 25 lat, ale wciąż dominuje wszędzie; waluta rezerwowa traci pozycję **dziesięcioleciami** (średnio ok. 80 lat po szczycie imperium); scenariusz bazowy = powolna erozja. Kursu walut nie da się prognozować („astrologia”): w 2022 straszono 8 zł za dolara, w IV.2025 było 3,80 (−20% w 3 lata).
- Wnioski praktyczne: (1) ostudzić emocje, nie zero-jedynkowo („unikam dolara”); (2) **nie trzymać oszczędności w gotówce w żadnej walucie**; (3) **dywersyfikacja walutowa**: część w PLN (obligacje indeksowane – „suchy proch” do rebalancingu, gdy dolar tanieje), część w globalnym ETF-ie (ok. 1/3 akcji globalnych to waluty inne niż USD); (4) **liczy się, w co ETF inwestuje, a nie w jakiej walucie jest notowany**.
  → doradca: przy ETF-ie nie straszy „walutą notowania”; pokazuje podział majątku PLN / waluty; nie robi prognoz kursów.
- ETF – podstawy: pasywne > aktywne (ok. 90% funduszy aktywnych przegrywa z indeksem w 10 lat; opłata 2,5% rocznie = trzeba pobić indeks o 28% w 10 lat). Przykład kosztów: ETF S&P 500 0,07% vs polski fundusz akcji amerykańskich 3,67% (52×).
- **Indeks cenowy vs dochodowy (Total Return)** – różnica kolosalna po latach; sensowny ETF naśladuje TR albo wypłaca dywidendy. Porównując z indeksem, używać TR.
- Koszty transakcji: prowizja maklerska + spread (bid-ask) + przewalutowanie → przy małych kwotach i częstych zakupach bolą (przykład: 38 zł prowizji = −0,83 pp). **Zlecenia z limitem, nie PKC.** → doradca: przy „w co” liczy koszt zakupu dla danej kwoty (prowizja minimalna domu maklerskiego – pole w ustawieniach) i ostrzega, gdy koszt > ok. 0,5–1% kwoty („zbierz 2–3 wpłaty i kup raz”).
- **Replikacja fizyczna** (też sampling) bezpieczniejsza niż **syntetyczna** (swap → ryzyko kontrahenta). → kryterium na liście ETF-ów.
### u17 – jak kupić ETF, mój portfel 1,7 mln (FFP06), skład po 2021 (środki)
- **Home bias**: Polska to ok. 0,13% światowego rynku akcji → ograniczanie się do GPW odcina 99,87% świata. Iwuć dopuszcza ok. 5% Polski jako świadomą słabość. → doradca: ostrzeżenie, gdy polskie akcje > ok. 10–20% części akcyjnej.
- „Cały świat jednym ETF-em”: ETF na MSCI ACWI lub FTSE All-World (iShares / Vanguard) – wynik prawie jak MSCI World (USA ok. 54–60%).
- **Ryzyko walutowe**: liczy się waluta aktywów w środku, nie waluta wyceny/notowania ETF-u (PLN→USD→CNY = PLN→CNY). W długim terminie (≥ 10 lat) hedging nie zmienia istotnie wyniku, kosztuje 0,2–0,3% rocznie; w krachach złoty słabnie i **łagodzi spadki** (2008: S&P −39%, dolar +20,5% → ok. −26% w PLN); waluty obce = zabezpieczenie przed słabnięciem złotego. Wniosek: **akcje globalne bez hedgingu do PLN**. (Dla obligacji zagranicznych – odwrotnie; tam hedging ma sens – z wcześniejszych notatek.)
- Dostawcy: najwięksi (iShares, Vanguard, SPDR). Dostępność w Polsce zależy od dokumentów KID (UCITS). Źródła danych o ETF-ie: strona dostawcy (KID, factsheet: replikacja, Acc/Dist, TER), screenery. → przy budowie: lista ETF-ów w kodzie ze sprawdzonymi polami + link do strony dostawcy; cena z automatu (Yahoo/Stooq już są).
- Koszty brokerów (2019): prowizje minimalne bolą przy małych kwotach; arkusz dla wpłat 200 / 1 000 / 4 000 / 10 000 / 20 000 / 50 000 / 100 000 zł → doradca liczy koszt dla kwoty użytkownika z jego cennika.
- **Wejście większą kwotą w akcje**: 250 tys. zł rozłożone na **14 równych zakupów** (wtorki i czwartki, ok. 7 tygodni) – sposób na strach przed „kupnem na górce”. → reguła doradcy: kwota na akcje większa niż X (np. > 10% portfela lub > 3 mies. wpłat) → propozycja rozłożenia na 4–12 transz w ustalonych terminach; małe kwoty – od razu.
- Wpłata na IKZE w akcje podnosi wagę akcji → **równolegle dokupić obligacje** poza IKZE, by utrzymać proporcje (pokrowiec decyduje „gdzie”, proporcje – „w co”; liczyć łącznie po wszystkich kontach).
- Strategia od 1995: średnio 9,88% rocznie przy inflacji 5,11%. 2020: indeksy 10,17%, realne instrumenty po kosztach 9,98% (koszt wdrożenia tylko 0,19 pp). Marzec 2020: obsunięcie portfela −8,74% vs WIG −37%.
- Obligacje indeksowane: pierwszy rok niskie stałe oprocentowanie (wtedy 1,7%), dopiero od 2. roku inflacja + marża → świeże zakupy zaniżają wynik – normalne. Wycięcie obligacji rynkowych w IV.2021 nie było timingiem, tylko oceną rentowności (zbyt niskie, by cokolwiek zarobić).
- Najem: rentowność netto 4,8% (zakładał 3%) + zmiana wartości; nieruchomości 56% / rynek 44% całego portfela długoterminowego.
### u18 – podsumowanie 2022, wycinam obligacje (FFP07) z tabelą rebalancingu, „jak NIE być świetnym inwestorem” (środki)
- 2022: najgorszy rok dla 60/40 od 1937 (akcje globalne ok. −20%, obligacje globalne ok. −15% naraz). W PLN: rozwinięte −11,2%, wschodzące −13,1%, złoto +8,9%, EDO/ROD +7,6%, polskie obligacje rynkowe (TBSP) −5,0%. Portfel Iwucia **+0,70%** przy inflacji 14,4% (największa przegrana z inflacją od 1995), maks. obsunięcie 5,7%. Mimo to 10 lat: 5,67% rocznie vs inflacja 2,65% (≈ +3 pp). **Długi termin = pełny cykl = 7–10 lat** – oceniać strategię dopiero w tej skali.
- „Czy portfel jest optymalny? Nie. Czy wystarczająco dobry dla mojej rodziny? Tak” (Munger). „Nic nie jest wyryte w kamieniu” – strategię wolno zmienić w wyjątkowych okolicznościach, rzadko i z uzasadnieniem (jedyna duża zmiana w 6 lat: wycięcie obligacji rynkowych).
- **Algorytm rebalancingu (tabela w Excelu) – wzorzec dla doradcy:**
  1. wartość każdej klasy aktywów teraz + nowa wpłata jako „gotówka”;
  2. waga po wpłacie = wartość ÷ (cały portfel po wpłacie);
  3. waga docelowa;
  4. odchylenie = docelowa − faktyczna;
  5. kwota transakcji = odchylenie × wartość całego portfela;
  6. decyzja: **małe odchylenia pomijać** (koszty transakcji, minimalna kwota zlecenia – np. 100 USD); wpłata idzie w klasy z największym niedoborem; sprzedaż tylko gdy trzeba.
  Efekt uboczny: nie dokupuje się tego, co zdrożało, dokupuje to, co staniało („kupuj tanio” bez zgadywania).
- Rytm: co miesiąc odkładać na osobny rachunek, **inwestować raz na kwartał** (I, IV, VII, X); wyjątek – paniczna wyprzedaż (kilkadziesiąt % spadku) = wcześniejsze uzupełnienie akcji.
- Złoto: przy kwocie > ok. 8 tys. zł – fizyczna 1 oz; mniejsze – ETC. Mały portfel = mniej dokładne wagi – akceptowalne.
- Ray Dalio o obligacjach przy bardzo niskich rentownościach („po co je mieć…”) – argument pod termometr obligacji stałokuponowych: rentowność realna < 0 → nie polecać funduszy obligacji długoterminowych; **historyczne wyniki funduszu obligacji nie mówią nic o przyszłych** (ludzie uciekali z lokat do funduszy obligacji patrząc wstecz – błąd).
- **Skuteczny, nie świetny**: pobicie rynku wymaga przewagi nad zawodowcami, wielokrotnie i latami – nierealne; cel = pobić inflację bez zbędnego ryzyka i mieć święty spokój. Pytanie „w co zainwestować TERAZ?” jest źle postawione – właściwe: „czego brakuje w moim portfelu względem planu?”.
  → to powinno być motto ekranu doradcy i odpowiedź na wymaganie Matiego „czy teraz warto”: doradca odpowiada przez plan (niedobory) + fakty o wycenach, nie przez typowanie.
### u19 – 4 mln i cykl długu (2Q 2025), 5 zasad (Buffett), 87% w 5 lat (3Q 2025), „czy potrzebujesz lepszego ETF-u”, „czy to już bańka” (środki)
- Koniec długoterminowego cyklu długu (USA): scenariusze od złego do dobrego – Iwuć **niczego nie zmienia w portfelu długoterminowym**, bo był projektowany na takie czasy: mieszkania („mury to mury”), złoto 15% (dodruk, odwrót od dolara), obligacje indeksowane 50% (wyższa inflacja = wyższe odsetki, w IKE bez podatku), akcje 35% (spadki = okazja zakupowa przy rebalancingu). Odpowiedzią na niepewność jest **dywersyfikacja**, nie prognoza.
- Portfel ofensywny (VII.2025) stał się defensywny: ok. 30% akcje globalne, 18% działki, 16% obligacje detaliczne (głównie **TOS 3-letnie**), 6% złoto, 5% krótkie zakłady, **25% gotówka** w EUR/USD/PLN – rezerwa na okazje („okazje są jak autobusy”; nie upychać gotówki na siłę).
- Buffett: nie kierować się prognozami (prognozy z 2019 nie przewidziały pandemii ani wojny); spółki to **prawdziwe biznesy**, cena ≠ wartość; „nie liczy się, czy przewidziałeś deszcz, tylko czy zbudowałeś arkę”; kupować jakość na przecenie – mieć listę z góry; zawsze trochę gotówki. → moduł spółki (etap 4): „lista życzeń” z ceną, przy której chcę kupić (własna reguła zapisana z góry).
- Wyniki 5 lat (do IX.2025): duży +51,6%, mały +50,3% (10 tys. + 500–550 zł/mies. → 51 388 zł, w tym 12 738 zł zysku); maks. strata −5,93%; w V.2023 portfel był 20 pp pod inflacją, po 5 latach 7,2 pp nad. Stopa zwrotu **ważona czasem (TWR)** – jedyna porównywalna z funduszami (prosta stopa myli przez wpłaty). → aplikacja ma „wpłacone a wartość”; przy budowie rozważyć TWR.
- Rebalancing także **między częścią nieruchomościową a rynkową** (rezerwy z najmu przerzucone do części rynkowej).
- **ETF-y tematyczne** (AI, zbrojenia, energia, z opcjami, z lewarem): średnio **−8,5 pp rocznie** względem szerokiego indeksu w 5 lat (Morningstar); 68% tematycznych funduszy w Europie nie przetrwało 15 lat; szansa, że tematyczny ETF pobije rynek i przetrwa 5 lat ≈ **1 na 10**; do tego luka behawioralna **7,5 pp rocznie** (zwykle 1–2 pp). Dobra historyjka ≠ dobra inwestycja (jak się rozegra trend, kto wygra, ile się płaci, moda).
  → doradca: kategoria „na pewno nie tu” – ETF-y tematyczne, lewarowane, z opcjami, fundusze aktywne o wysokich opłatach, produkty strukturyzowane/UFK; pokazuje liczby.
- Recepta: (1) garstka prostych elementów – **ETF na najszerszy indeks globalny bez hedgingu do PLN** + **detaliczne obligacje indeksowane inflacją** (unikat na świecie: nienotowane, cena się nie waha) + ewentualnie złoto (fizyczne; ETC zanim uzbiera się na sztabkę); (2) **spisana strategia** zasypuje lukę behawioralną.
- Ocena „bańki” – 3 składniki: **wyceny** (TOP 10 S&P 500 ≈ 1/3 kapitalizacji, ale ≈ 1/4 zysków – drożej, bo szybciej rosną), **oczekiwania** (wyśrubowane/optymistyczne), **nastroje** (ankieta AAII byki–niedźwiedzie; ankieta zarządzających BofA). Wniosek z 2024: „rezerwa paliwa, nie syrena alarmowa”. → termometr = 3 wskaźniki opisane słowami (wycena, koncentracja, nastroje), z wnioskiem w 3 stopniach; nigdy „sprzedaj wszystko”.
### u20 – „90% na plusie” (wyniki 2025 i plany 2026, całość), „Czy warto nadpłacać kredyt hipoteczny?” (całość)
- 2025: akcje USA +16,4% (USD), akcje poza USA ponad +31%, złoto +65% w USD (+44% w PLN), dolar −12% do PLN. Od IX.2020 część rynkowa +56,8% (ok. 12 pp nad inflacją), cały portfel +90,9% vs inflacja ok. 45%. Wyniki liczy **po wszystkich kosztach** (200 zł za IKE-Obligacje, kurier za złoto, prowizje, podatki).
- **Rebalancing sprzedażą, gdy rozjazd za duży**: po rajdzie złota sprzedaż ok. 5 oz (90 tys. zł) + dopłata 30 tys. → ETF rynków rozwiniętych 46 tys. + EDO/ROD 86 tys.; całość 30–60 minut. „Mam strategię, więc nie szukam co kwartał odpowiedzi, co robić.”
- **Własna reguła na bessę zapisana z góry**: przy solidnych spadkach akcji (20–30%) – zmniejszyć złoto z 15% do 10% i zwiększyć akcje z 35% do 40%. → wzorzec dla modułu „reguły na spadki” (próg spadku od szczytu → przesunięcie o 5 pp).
- **Nadpłata kredytu hipotecznego = inwestycja o gwarantowanej stopie „oprocentowanie kredytu ÷ 0,81”** (bo zysk z inwestycji jest po Belce): kredyt 5% ⇒ trzeba zarabiać > 6,17% brutto, pewnie i latami. Każda nadpłata dodatkowo **zmniejsza ryzyko**. Sztuczka sprzedawców („odkładając zarobisz 106 tys., nadpłacając zaoszczędzisz 57 tys.”) jest błędna: pomija krótszy okres (187 zamiast 240 wpłat), niższe raty, które też można odkładać, i Belkę.
- Test: „mając 100 tys. oszczędności i mieszkanie bez długu – wziąłbyś 200 tys. kredytu, żeby trzymać je na koncie?” (to samo co 300 tys. oszczędności + 200 tys. kredytu).
- **Kolejność (kiedy NIE nadpłacać)**: 1) najpierw poduszka 6 mies.; 2) potem **limit IKE** (emerytura); 3) nie kosztem życia (tylko nadwyżki); 4) dopiero dalsze nadwyżki → nadpłata. Kredyt na nieruchomość inwestycyjną – inna logika.
- Prowizja za wcześniejszą spłatę: tylko pierwsze 36 mies. (zmienna stopa), maks. 3% i nie więcej niż roczne odsetki; przykład: 5% kredyt, 3% prowizji → zysk 1,85% w pierwszym roku ⇒ lokata musiałaby dawać > 2,28%. Po 3 latach: nadpłacać od razu, małe kwoty co miesiąc. Skrócenie okresu matematycznie lepsze; obniżenie raty – lepsza motywacja i bezpieczeństwo.
  → doradca („gdzie”): jeśli w aplikacji jest zobowiązanie z oprocentowaniem – liczy „próg opłacalności” = oprocentowanie ÷ 0,81 (poza IKE/IKZE; w IKE = samo oprocentowanie) i porównuje z ostrożnym oczekiwanym zwrotem portfela (inflacja + 3 pp) oraz z bieżącym oprocentowaniem obligacji; kredyt konsumpcyjny/karta → zawsze „najpierw spłać”; hipoteka → po poduszce i limicie IKE: część kwoty na nadpłatę, gdy próg > oczekiwany zwrot. Ankieta: czy bank pobiera prowizję za nadpłatę, stopa stała czy zmienna.
### u21 – OIPE po 2 latach testu (XI.2025, całość), dwa krótkie wpisy do podcastów (całość)
- OIPE: limit jak IKE (2026: **28 260 zł**), zwolnienie z Belki po 60 r.ż. i wpłatach w 5 latach; **nie da się prowadzić samodzielnie w domu maklerskim** – tylko firma zarządzająca; ustawowy limit kosztów **1% rocznie** (z ETF-ami i VAT). Dostawcy w Polsce: Finax (od 2023; strategie 100% akcji albo 80/20, od 10 lat przed emeryturą schodzi do 60/40), drugi – Life Goals (Cypr).
- Test 2 lata (70 445 zł w 12 wpłatach): OIPE +25,33% vs ten sam ETF (Vanguard FTSE All-World Acc) na zwykłym rachunku +30,96% → różnica 5,63 pp: opłata ok. **0,74% rocznie** (1,48 pp), poślizg zakupów raz w tygodniu (0,93 pp, losowe), **odchylenie składu od indeksu globalnego** (3,22 pp: mniej USA, brak Japonii, więcej Europy/EM/małych spółek). Nawet po uwzględnieniu zwolnienia z podatku zwykły rachunek wypadł lepiej (10 276 zł po Belce vs 9 737 zł).
- Ocena: **jeszcze nie poleca**. Sens ma dla: (a) obecnych klientów Finaxa, (b) osób z drogim IKE w TFI, dla których konto maklerskie jest barierą, (c) **„łowców limitów”** – IKE i IKZE wykorzystane pod korek, a chcą odkładać więcej bez podatku (limit „zbiera się” i można później zrobić transfer).
  → doradca: OIPE dopiero **po** wyczerpaniu IKE i IKZE, z pokazanym kosztem (0,74–0,9% rocznie) i porównaniem „OIPE vs zwykłe konto / OKI” dla horyzontu użytkownika; domyślnie „raczej nie teraz”, chyba że horyzont długi i limity pełne.
- Koszty ukryte brokera: brak prowizji ≠ brak kosztu – **przewalutowanie 0,5%** (XTB) to realna prowizja; inne domy: minimalna prowizja (np. 14 zł → przy 100 zł to 14%). **Udziały ułamkowe** pozwalają inwestować małe kwoty. → pola w ustawieniach doradcy: prowizja min., prowizja %, koszt przewalutowania, czy są ułamki; doradca liczy koszt zakupu i minimalną sensowną kwotę zlecenia.
- Spadki w fazie budowania są korzystne (taniej kupujemy); obsunięcie 100% akcji wiosną 2025: −16,65%.
- Psychologia (podcast z prof. Zielonką – tylko spis tematów): teoria perspektywy (strata boli mocniej niż zysk cieszy), błędy poznawcze, księgowanie mentalne. → w ankiecie pytania o reakcję na stratę zadawać **w złotych** i sytuacyjnie („portfel 100 tys. spada do 70 tys. – co robisz?”).
### u22 – „5 bolesnych błędów” (całość), krótkie zapowiedzi odcinków Finansowej Fortecy Audio i rozmowy o ETF-ach (całość)
- Błędy Iwucia: życie na kredyt (4 karty, limit w koncie), wiara w doradców na prowizji (kredyt we frankach, polisa inwestycyjna – 14 tys. zł opłaty likwidacyjnej), **dźwignia** („działa w obie strony – zwielokrotnia skutki błędów”), mit „nieruchomości zawsze rosną” (kupno w obcym mieście, strata 30 tys.), brak odpowiedzialności. „Poduszką” była możliwość wzięcia kolejnego kredytu.
- 10 kroków (kolejność): 1) wartość netto, 2) budżet, 3) 2 000 zł funduszu awaryjnego, 4) spłata długów konsumenckich (śnieżna kula), 5) poduszka 6 mies., 6) nagroda, 7) emerytura, 8) edukacja dzieci, 9) nadpłata hipoteki, 10) inwestowanie/majątek. → aplikacja ma już 1–2 (majątek netto, budżet); doradca prowadzi przez 3–9 jako „bramki” przed kwotą na giełdę.
- → „na pewno nie tu” (stała lista ostrzeżeń): inwestowanie za pożyczone, dźwignia/CFD, polisy inwestycyjne (UFK), produkty od doradcy na prowizji, kredyt w obcej walucie.
- Zapowiedzi audio (bez treści merytorycznej – sama treść jest w książce/nagraniach): obligacje indeksowane (dłużnikiem państwo), złoto (Dalio vs Buffett), surowce, przedmioty kolekcjonerskie i „najważniejsze aktywo = Ty” (inwestycja w siebie i zarobki), jakość prognoz, portfel długoterminowy. Rozmowa o ETF-ach: tematy – kryteria wyboru, czy ETF może zbankrutować (aktywa wydzielone), udziały ułamkowe, **core–satellite** (rdzeń + satelity – ile % rdzeń).
  → doradca: model **rdzeń + piaskownica**: rdzeń (ETF globalny + obligacje + złoto) domyślnie ≥ 90% części długoterminowej; piaskownica (pojedyncze akcje, tematy) ≤ 10% – próg do ustawienia w ankiecie.
- UWAGA: treści odcinków audio i YouTube nie mam w formie tekstu (są tylko zapowiedzi) – w planie zaznaczyć jako źródło nieprzeczytane (nie da się pobrać z tej sesji).
