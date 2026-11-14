# Doradca inwestycyjny – STAN PRACY (czytaj to najpierw)

Ten plik wystarczy, żeby wznowić pracę w dowolnym oknie. Szczegóły merytoryczne: `DORADCA-notatki.md`.

## Polecenia Matiego (obowiązują)
- **W aplikacji nic nie zmieniać** (kod, `sw.js`) aż do wyraźnej komendy. Wolno tylko pliki `.md`.
- Czytać materiały Marcina Iwucia **w całości** – nic nie pomijać, nie skracać do początku i końca.
- Wynik: **kompletny plan doradcy** (rzetelnie, bez pośpiechu, można etapami).
- Po wyczerpaniu limitu – wrócić do pracy po jego resecie.
- Nie uruchamiać pomocników (subagentów) bez prośby.

## Czego chce Mati (skrót; pełne w notatkach, sekcja A)
- Pod-zakładka w Majątku: wpisuję kwotę → doradca mówi **gdzie** (IKE / IKZE / OKI / PPK / obligacje / zwykłe konto) i **w co** (konkretne instrumenty: ETF-y, akcje, obligacje, fundusze).
- Rozbicie kwoty: „część tu, część tu”, „wszystko tu”, „**na pewno nie tu**” + wyliczenie dlaczego.
- Analiza zebranych danych (czy teraz warto kupić), **bez przewidywania przyszłości**.
- Cele: emerytura, nieprzewidziane wydatki, nieruchomość (**jako cel odkładania, nie inwestycja**).
- Liczone osobiście dla osoby telefonu; przełącznik „wspólnie”.
- IKZE: pytać o próg podatkowy (0% i 12% → raczej IKE).
- Ankieta: pierwsza 30–40 pytań, kolejne krótkie.

## Do rozstrzygnięcia z Matim (zapytać przy oddaniu planu)
1. OKI głównie na poduszkę i polskie aktywa, ETF-y zagraniczne najpierw do IKE/IKZE – zgoda?
2. Główna podpowiedź „co teraz” = rebalancing (wyrównanie proporcji); termometr rynku (3 stany, P/E, CAPE) jako dodatek – zgoda?
3. Nieruchomości: tylko cel (plan zakupu, zasada 30/20/20) czy też coroczne porównanie najmu z obligacjami?

## Proponowane etapy budowy (do rozpisania w planie)
1. Ankieta + „gdzie” z rozbiciem kwoty i wyliczeniem.
2. „W co”: lista ETF/obligacji/funduszy z kryteriami, proporcje, rebalancing.
3. Termometr rynku i własne reguły na spadki.
4. Analiza wpisanej spółki.
Moduły dodatkowe: test kryzysu, luka emerytalna (z FIRE), cel „mieszkanie”, strażnik kosztów, przypomnienia w „Na dziś” (limit do 31.12, ulga IKZE w PIT, dopłata poduszki o inflację), list do siebie na spadki.

## Postęp czytania (runda 4 – pełna lektura pominiętych fragmentów)
- Rundy 1–3: ok. 88 artykułów (część tylko początek i koniec – stąd runda 4).
- Runda 4: 37 paczek `u00`–`u36` (1,3 mln znaków). **Przeczytane i zanotowane: u00–u30.** Następna: **u31**.
- Po każdej paczce: dopisać wnioski do sekcji G w `DORADCA-notatki.md`, zmienić numer w tej linijce, co kilka paczek commit + push.
- Po u36: napisać plan (`DORADCA-plan.md` + skrót w `PLAN.md`), commit, push, pytania do Matiego.

## Jak czytać / odtworzyć materiały
- Paczki: `<scratchpad>/iw/u/uNN.txt`, czytać narzędziem Read z `allow_large:true` (jedna paczka na raz).
- Jeśli scratchpad zniknął: host `marciniwuc.com` jest dozwolony w środowisku; artykuł = `https://marciniwuc.com/<slug>/` (curl, wyciąć treść z `entry-content`, usunąć znaczniki). Pobrać artykuły z listy niżej **w całości** i czytać całe (prościej niż odtwarzać „środki”). Slugi w liście są ucięte do 50 znaków – pełny adres znaleźć na stronie spisu treści bloga.
- Teksty artykułów są cudze – **nie wrzucać ich do repozytorium**, tylko własne notatki.

## Zawartość paczek (plik → część)
u00 wszystko-ikze-kalkulator.txt środek 1/1
u00 wszystko-o-ike.txt środek 1/1
u00 zwrot-z-ikze-jak-rozliczyc-podatek.txt środek 1/1
u01 jak-przeniesc-ike-ikze-czyli-wyplata-transferowa-k.txt środek 1/1
u01 obligacje-indeksowane-inflacja-kalkulator.txt środek 1/1
u02 jakie-obligacje-skarbowe-wybrac-kalkulator.txt środek 1/1
u02 rodzinne-obligacje-skarbowe.txt środek 1/1
u03 ikze-obligacje-vs-ike-obligacje-kalkulator.txt środek 1/1
u04 oipe-zasady-czy-warto-wyliczenia-kalkulator-europe.txt środek 1/1
u04 ppk-2023-autozapis.txt środek 1/1
u05 jak-obliczyc-emeryture.txt środek 1/1
u05 sprawdz-ile-odkladac-na-emeryture-kalkulator-emery.txt środek 1/1
u06 twoja-strategia-inwestycyjna.txt środek 1/2
u07 twoja-strategia-inwestycyjna.txt środek 2/2
u07 jak-zbudowac-dobra-strategie-inwestycyjna-poczatek.txt środek 1/1
u07 portfel-odporny-na-inflacje.txt środek 1/1
u07 krach-na-rynkach.txt środek 1/1
u07 ktore-etfy.txt środek 1/1
u08 w-co-inwestowac-male-kwoty.txt środek 1/1
u08 jak-zaczac-inwestowac-i-nie-popelnic-kosztownych-b.txt środek 1/1
u08 jak-ochronic-poduszke-bezpieczenstwa-przed-inflacj.txt środek 1/1
u08 poduszka-bezpieczenstwa-pytania-i-odpowiedzi.txt środek 1/1
u08 poduszka-bezpieczenstwa-czy-wklad-wlasny.txt środek 1/1
u09 cena-zlota.txt środek 1/1
u10 jak-inwestowac-w-zloto-kompletny-przewodnik.txt środek 1/2
u11 jak-inwestowac-w-zloto-kompletny-przewodnik.txt środek 2/2
u11 jak-inwestowac-pieniadze-10-skutecznych-zasad.txt środek 1/1
u11 wyciskac-z-inwestycji-kazdy-grosz.txt środek 1/1
u11 jak-pokonac-strach-przed-inwestowaniem.txt środek 1/1
u11 jak-nie-dac-sie-panice-na-gieldzie-ffp10.txt środek 1/1
u11 fbo-064-jak-analizowac-fundusze-inwestycyjne-pieni.txt środek 1/1
u11 od-czego-zaczac-inwestowanie.txt środek 1/1
u11 w-co-zainwestowac-100-zl.txt środek 1/1
u12 wyniki-portfela-po-1q-2026.txt środek 1/1
u12 wyniki-portfela-po-2q-2026.txt środek 1/1
u12 w-co-inwestowac-w-2025-ffp25.txt środek 1/1
u13 jak-skutecznie-odkladac-pieniadze-na-przyszlosc.txt środek 1/1
u13 jak-budowac-portfel-inwestycyjny-wahania-rynkowe.txt środek 1/1
u13 jak-inwestowac-w-niepewnych-czasach.txt środek 1/1
u14 rynki-wschodzace.txt środek 1/1
u15 jak-inwestowac-w-etf-y-dywidendowe.txt środek 1/1
u16 jak-zabezpieczyc-sie-przed-upadkiem-dolara.txt środek 1/1
u16 co-to-jest-etf.txt środek 1/1
u17 jak-kupic-etf.txt środek 1/1
u17 moj-portfel-inwestycyjny.txt środek 1/1
u17 sklad-portfela-po-2021r.txt środek 1/1
u18 podsumowanie-portfela-2022.txt środek 1/1
u18 wycinam-obligacje-skarbowe.txt środek 1/1
u18 jak-nie-byc-swietnym-inwestorem-wyniki-i-sklad-por.txt środek 1/1
u19 4-mln-zl-w-portfelu-inwestycyjnym-ale-zbliza-sie-b.txt środek 1/1
u19 5-zasad-inwestycyjnych.txt środek 1/1
u19 87-w-5-lat-zero-stresu-moj-portfel-inwestycyjny-po.txt środek 1/1
u19 czy-potrzebujesz-lepszego-etf.txt środek 1/1
u19 czy-to-juz-akcyjna-banka.txt środek 1/1
u20 90-na-plusie-i-43-mln-zl-w-portfelu-wyniki-plany-n.txt całość 1/1
u20 czy-warto-nadplacac-kredyt-hipoteczny.txt całość 1/1
u21 europejska-emerytura-oipe-finax-wyniki-szczera-opi.txt całość 1/1
u21 fbo-057-w-co-inwestowac-podrecznik-swiadomego-inwe.txt całość 1/1
u21 fbo-060-psychologiczne-pulapki-w-inwestowaniu-jak-.txt całość 1/1
u22 fbo-066-5-bolesnych-bledow-finansowych.txt całość 1/1
u22 finansowa-forteca-audio-21.txt całość 1/1
u22 finansowa-forteca-audio-27.txt całość 1/1
u22 finansowa-forteca-audio-28.txt całość 1/1
u22 finansowa-forteca-audio-30.txt całość 1/1
u22 finansowa-forteca-audio-4.txt całość 1/1
u22 finansowa-forteca-audio-5.txt całość 1/1
u22 finansowa-forteca-audio-6.txt całość 1/1
u22 jak-odczarowac-etf-i-zaczac-inwestowac.txt całość 1/1
u23 moj-sysystem-zarzadzania-pieniedzmi.txt całość 1/1
u24 nadplacac-kredyt-hipoteczny-czy-inwestowac.txt całość 1/2
u25 nadplacac-kredyt-hipoteczny-czy-inwestowac.txt całość 2/2
u25 nawyki-finansowe.txt całość 1/1
u26 ppk-pracownicze-plany-kapitalowe-2019-zasady.txt całość 1/2
u27 ppk-pracownicze-plany-kapitalowe-2019-zasady.txt całość 2/2
u28 ranking-ike-i-ikze.txt całość 1/3
u29 ranking-ike-i-ikze.txt całość 2/3
u30 ranking-ike-i-ikze.txt całość 3/3
u30 wszystko-o-nadplacie-kredytu-hipotecznego.txt całość 1/1
u30 zacznij-tutaj.txt całość 1/1
u30 R2:co-z-cenami-nieruchomosci-kiedy-bedzie-najtaniej.txt środek 1/1
u30 R2:czy-wlasne-mieszkanie-to-dobra-inwestycja.txt środek 1/1
u31 R2:finanse-osobiste-kredyt-hipoteczny-30-lat.txt środek 1/1
u31 R2:fundusze-dluzne.txt środek 1/1
u31 R2:jak-inwestowac-surowce.txt środek 1/1
u32 R2:jak-kupic-mieszkanie-na-wynajem.txt środek 1/1
u32 R2:jak-wycenic-mieszkanie-na-wynajem-ffp11.txt środek 1/1
u32 R2:konto-mieszkaniowe.txt środek 1/1
u33 R2:lokaty-i-konta-oszczednosciowe-wszystko-co-musisz-.txt środek 1/1
u33 R2:mieszkanie-lepiej-kupic-czy-wynajac-finanse-osobis.txt środek 1/1
u33 R2:mieszkanie-na-wynajem-dobra-inwestycja.txt środek 1/1
u34 R2:obligacje-skarbowe.txt środek 1/1
u35 R2:pierwsze-mieszkanie.txt środek 1/1
u35 R2:rynek-nieruchomosci-w-2023.txt środek 1/1
u35 R2:uwaga-na-oprocentowanie.txt środek 1/1
u36 R2:w-co-inwestowac-w-2024.txt środek 1/1