/* income position for tax refunds; refunds for purchases lower the expense itself (↩️ in the transaction) */
export const ZWROT_PIT='Zwrot podatku (PIT) i inne zwroty urzędowe';
export const DEF=[ ["ZAROBKI I WPŁYWY","inc",["Pensja Wercia","Pensja Mati","Premia Mati","Premia Wercia","Sprzedaż rzeczy",ZWROT_PIT,"Odsetki i cashback","Dodatkowe przychody"]],
 ["KREDYTY I POŻYCZKI","exp",["Pożyczka Tomalka","Pożyczka Dziadkowie","Pożyczka Mama","Spłata sprzętu na raty","Allegro Pay/raty"]],
 ["JEDZENIE I GASTRONOMIA","exp",["Zakupy spożywcze do domu","Restauracje i wyjścia na miasto","Kawa, lunch w pracy i przekąski na mieście","Jedzenie z dowozem","Słodycze i wypieki","Alkohol i napoje"]],
 ["ZDROWIE","exp",["Badania i wizyty lekarskie","Lekarstwa","Witaminy i suplementy","Stomatolog","Optyk","Ubezpieczenie zdrowotne"]],
 ["UBRANIA I OBUWIE","exp",["Ubrania i buty Wercia","Ubrania i buty Mati","Dodatki i biżuteria"]],
 ["MIESZKANIE / DOM","exp",["Czynsz i fundusz remontowy","Prąd","Gaz","Woda i kanalizacja","Ogrzewanie","Wywóz śmieci","Rata kredytu hipotecznego","Środki czystości","Wyposażenie i naprawy","Balkon i rośliny","Podatki od nieruchomości","Ubezpieczenie mieszkania","Rozliczenie ze wspólnotą"]],
 ["SUBSKRYPCJE I TELEKOMUNIKACJA","exp",["Pakiet Orange","Telefon Wercia","Spotify","Apple One + iCloud","Disney+ / Netflix / VOD","Plan Revolut","Subskrypcje aplikacji"]],
 ["AUTO I TRANSPORT","exp",["Paliwo","Serwis i naprawy","Przegląd techniczny","Ubezpieczenie OC/AC","Opony i akcesoria","Myjnia","Parkingi i autostrady","Komunikacja miejska","Taxi / Bolt / Uber"]],
 ["DBANIE O SIEBIE I SPORT","exp",["Kosmetyki i higiena","Fryzjer / Barber","Kosmetyczka i zabiegi","Masaże","Karnety i wejścia sportowe","Odżywki treningowe","Sprzęt sportowy"]],
 ["PRACA I ROZWÓJ","exp",["Składki OIL","Kursy i szkolenia","Certyfikaty i egzaminy","Literatura medyczna","Odzież medyczna i sprzęt"]],
 ["ROZRYWKA, HOBBY I WAKACJE","exp",["Drobne przyjemności Wercia","Drobne przyjemności Mati","Hobby i DIY","Gry planszowe i wideo","Imprezy i spotkania","Kino, teatr, koncerty","Książki i audiobooki","Wakacje i wyjazdy","Loterie i zakłady"]],
 ["ZWIERZĘTA (KOTY)","exp",["Karma","Przysmaki i suplementy","Żwirek i higiena","Weterynarz","Zabawki i akcesoria"]],
 ["PREZENTY I OKAZJE","exp",["Prezenty dla drugiej połówki","Prezenty dla rodziny","Prezenty dla znajomych","Wesela i uroczystości","Święta","Kwiaty i upominki"]],
 ["DODATKOWE UBEZPIECZENIA","exp",["Ubezpieczenie na życie","Ubezpieczenie NNW / OC zawodowe","Ubezpieczenie podróżne","Ubezpieczenie kredytu"]],
 ["INNE WYDATKI","exp",["Opłaty bankowe","Poczta i przesyłki","Urząd i opłaty","Kary i mandaty","Udzielone pożyczki"]],
 ["DZIECI (PRZYSZŁOŚĆ)","exp",["Żłobek/przedszkole","Wyprawka","Ubranka i zabawki","Zajęcia dodatkowe"]]];
export const seed=()=>({v:1,fixed:[],cats:DEF.map((c,i)=>({id:'c'+i,name:c[0],type:c[1],hue:HUES[i%HUES.length],subs:c[2].map((s,j)=>({id:'c'+i+'s'+j,name:s}))})),
accs:[["Revolut Mati","cur"],["ING Wercia","cur"],["ING Mati","cur"],["PKO Mati","cur"],["Konto Wspólne","cur"],["Revolut Wercia","cur"],["Subkonto Zwierzaki","cur"],["Gotówka","cur"],["Oszczędności Mati","sav"],["Oszczędności Wercia","sav"],["Inwestycje Mati","inv"],["Inwestycje Wercia","inv"],["IKE Mati","inv"],["IKZE Mati","inv"],["IKE Wercia","inv"],["IKZE Wercia","inv"],["PPK Mati","inv"],["PPK Wercia","inv"],["Oszczędności wspólne","sav"],["Poduszka bezpieczeństwa","sav"]].map((a,i)=>({id:'a'+i,name:a[0],grp:a[1],open:0}))});

/* pastel colour per category: --c header, --c2 rows, --c3 dark text/bar of the same hue */
export const HUES=[150,205,28,340,265,48,185,12,295,95,228,320,62,168,245,0];
/* header colour of the shown month – soft pastels that follow the seasons */
export const SEASON=[
  ['#e4eef9','#cbdcf0','❄️'],  // styczeń – mroźny błękit
  ['#ebe7f6','#d6cfee','❄️'],  // luty – szronowy liliowy
  ['#e2f4e4','#c5e6c9','🌱'],  // marzec – pierwsza zieleń
  ['#fbe5ee','#f3c9d9','🌸'],  // kwiecień – kwitnące wiśnie
  ['#efe4f7','#dccbee','💜'],  // maj – bzy
  ['#fdf4cf','#f3e3a0','☀️'],  // czerwiec – słońce
  ['#fde6d6','#f6cbae','🍑'],  // lipiec – brzoskwinia
  ['#fbeccb','#f0d79f','🌾'],  // sierpień – żniwa
  ['#eef0d6','#dadfb0','🍐'],  // wrzesień – babie lato
  ['#fce1cf','#f2c2a3','🍂'],  // październik – złota jesień
  ['#ede5e0','#d9cbc3','🍁'],  // listopad – mglista jesień
  ['#e1efe7','#c3dece','🎄']   // grudzień – zimowa jodła
];
export const tint=(hex,k)=>{const n=parseInt(hex.slice(1),16),f=v=>Math.round(255-(255-v)*k);return'#'+[f(n>>16),f(n>>8&255),f(n&255)].map(v=>v.toString(16).padStart(2,'0')).join('')};
/* each category keeps its own hue (cat.hue), so moving it on the list never changes its colour */
export const catHue=(c,i)=>c.hue??HUES[i%HUES.length];
export const freeHue=cats=>{const used=new Set(cats.map((c,i)=>catHue(c,i)));return HUES.find(h=>!used.has(h))??HUES[cats.length%HUES.length]};
export const pastel=h=>`--c:hsl(${h} 72% 89%);--c2:hsl(${h} 70% 97%);--c3:hsl(${h} 50% 26%);--c4:hsl(${h} 58% 68%)`;
