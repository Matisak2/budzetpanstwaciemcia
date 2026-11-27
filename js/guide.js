/* Bailey & Ivo as guides: what they say on the Budget screen, on special days, after treats, in the first-steps tour and in "Co nowego".
   Bailey – calm guardian of savings (bills, plan, safety cushion, deadlines). Ivo – cheerful foodie and party cat (goals, coins, celebrations).
   {n} in a text = the name of the person using this phone. */
import {zl0} from './util.js';
import {factOfDay} from './facts.js';

/* how many cats on this phone: lots (pictures + jokes), few (pictures, only useful messages), off (no pictures) */
export const kotki={mode:'lots'};
/* scenes drawn wider than tall (two cats, props) */
export const WIDE=new Set(['duo','happy','celebrate','wink','window','box','winter','christmas','spring','summer','autumn','halloween','valentine','birthdayB','birthdayI']);
const B='Bailey',I='Ivo';
const fill=(t,c)=>t.replace(/\{n\}/g,c.name).replace(/\{eś\}/g,c.name=='Wercia'?'aś':'eś');
const md=d=>d.slice(5);
const pickBy=(n,a)=>a[Math.abs(n)%a.length];
/* Easter Sunday (Gregorian computus) as MM-DD */
function easter(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=(h+l-7*m+114)%31+1;
  return String(mo).padStart(2,'0')+'-'+String(da).padStart(2,'0')}
/* the default picture for ordinary days follows the season */
function seasonScene(today){const m=+today.slice(5,7);return m==12||m<=2?'winter':m<=5?'spring':m<=8?'summer':'autumn'}

/* everyday lines (rotate by day); [speaker, scene or '' for the season picture, text] */
const GENERAL=[
  [B,'','{n}, mała rada ode mnie: najpierw plan, potem zakupy. Wtedy koc jest cieplejszy.'],
  [I,'','Ja tylko przypominam: każda wpisana kawa to krok do porządku. A każdy porządek to smaczek 😼'],
  [B,'','Spokojnie, {n}. Budżet to nie dieta – to mapa. Ja pilnuję, żebyśmy się nie zgubili.'],
  [I,'box','Karton po zakupach? Zajęty. Ale paragon z niego warto wpisać, {n}!'],
  [B,'sleep','Wpisuję drzemkę do planu. Zero złotych, sto procent zadowolenia.'],
  [I,'heather','Leżę we wrzosach i liczę: im więcej wpisów, tym mniej niespodzianek na koniec miesiąca.'],
  [B,'','Najlepsze rzeczy w życiu są za darmo – drzemka, słońce na parapecie i dobrze domknięty budżet.'],
  [I,'bell','Dzyń, dzyń! To moja piłeczka. I przypomnienie, żeby dziś wpisać wydatki 🔔'],
  [B,'lupa','Zaglądam w Analizę, {n}. Czasem jedna kategoria mówi więcej niż cały miesiąc.'],
  [I,'','Bailey mówi, że oszczędzanie jest ważne. Ja mówię, że ważne są też smaczki. Zgadzamy się w połowie.'],
  [B,'','Małe kroki, duże oszczędności. Trzymam kciuki – a właściwie łapki.'],
  [I,'wink','Dzień bez zbędnych wydatków? Brzmi jak dzień, z którego byłbym dumny. I Bailey też.'],
  [B,'window','Patrzymy przez okno i myślimy o przyszłości. Wasze cele też tam są, {n} ✨'],
  [I,'','Bawiliśmy się w berka. Wygrała Bailey. Za to ja wygrywam w wpisywaniu wydatków – bo Ty mi pomagasz!'],
  [B,'churu','Nagroda za systematyczność? Churu. Dla Ciebie, {n}, coś równie miłego – spokój w portfelu.'],
  [I,'','Naśladuję Bailey: siadam, patrzę mądrze i… zapominam, co miałem zrobić. Ty nie zapomnij o wpisach!'],
  [B,'','Plan to obietnica dla przyszłej siebie i przyszłego siebie. Dotrzymujemy jej razem.'],
  [I,'coin','Znalazłem monetę! Bailey kazała ją odłożyć. Chyba ma rację, ale to nadal moja moneta 🪙'],
  [B,'','Nie każdy wydatek jest zły, {n}. Ważne, żeby był wybrany, a nie przypadkowy.'],
  [I,'papers','Siedzę na papierach, więc są ważne. Paski wypłat też będą ważne – zobaczysz!'],
  [B,'loaf','Leżę jak bochenek i jestem z Was dumna. To wszystko na dziś.'],
  [I,'','Wskoczyłem do kartonu i znalazłem w nim… poczucie, że wszystko jest pod kontrolą. Dobra robota, {n}!'],
  [B,'','Poduszka bezpieczeństwa jest jak mój ulubiony koc – lepiej mieć ją za dużą niż za małą.'],
  [I,'','Jeśli wydatek ma ogon i miauczy, to na pewno do kategorii „Zwierzęta”. Pozdrawiam, Ivo.'],
  [B,'','Każdy wpis to mała kropka. Na koniec miesiąca z kropek robi się obrazek, {n}.'],
  [I,'ivoHappy','Dziś jestem w dobrym humorze. Jutro też będę, jeśli budżet się zmieści 😺'],
  [B,'envelope','Koperty z celami to moje ulubione pudełka. Zaraz po kartonie, rzecz jasna.'],
  [I,'calc','Liczę, liczę… 2 + 2 = smaczek. Może lepiej Ty policz, {n}.'],
  [B,'','Spokojna głowa zaczyna się od jednego spojrzenia na Budżet. Właśnie je zrobił{eś} 💛'],
  [I,'','Bailey drzemie, więc to ja pilnuję budżetu. Na razie wszystko gra… chyba.'],
  [B,'baileyHappy','Lubię, gdy plan i wydatki idą łapka w łapkę.'],
  [I,'','Mam pomysł: Wy oszczędzacie, a ja zajmuję się mruczeniem. Podział obowiązków idealny.'],
  [B,'','Rachunki lubią porządek, {n}. Ja też. Dlatego tak dobrze się rozumiemy.'],
  [I,'bell','Słyszałem dzwoneczek! Okazało się, że to moja piłeczka. Ale skoro już tu jestem – zajrzyj do 📌 Stałe.'],
  [B,'window','Z parapetu widać więcej. Z Analizy też – polecam zerknąć raz w tygodniu.'],
  [I,'','Bailey mówi „poduszka bezpieczeństwa”. Ja słyszę „poduszka” i idę spać. Ale ona ma rację.'],
  [B,'sleep','Drzemka pod kocem to mój sposób na stres. Twój może być prostszy: jeden rzut oka na plan.'],
  [I,'box','Każdy karton to nowa przygoda. Każdy nowy miesiąc też – zacznij go od planu, {n}!'],
  [B,'','Wydatki stałe to fundament. Kiedy są odhaczone, reszta miesiąca jest spokojniejsza.'],
  [I,'coin','Drobne do drobnych, a zbierze się na… wiesz na co. Na smaczki. Albo na Wasz cel. Też może być.'],
  [B,'lupa','Najwięcej mówią małe wydatki, które się powtarzają. Sprawdź „Największe pozycje” w Analizie.'],
  [I,'heather','Wrzosy pachną jesienią, a budżet pachnie porządkiem. Oba zapachy lubię.'],
  [B,'','Cel bez planu to marzenie. Cel z planem to koperta, która się napełnia, {n}.'],
  [I,'ivoHappy','Dziś znowu wygrałem w berka. Bailey twierdzi, że dała mi fory. Ty też dziś wygrywasz – wpisując wydatki!'],
  [B,'envelope','Każda złotówka przydzielona do celu pracuje na Waszą przyszłość. Nawet gdy śpi – jak ja.'],
  [I,'','Wiesz, co jest lepsze od smaczka? Dwa smaczki. Wiesz, co jest lepsze od wydatku? Wydatek w planie.'],
  [B,'','Kiedy coś się nie zgadza z bankiem, nie martw się. W 👛 Kontach jest „Wyrównaj wszystkie salda naraz” – ja zawsze tak robię z kocem.'],
  [I,'papers','Pilnuję papierów. Jeśli zginie paragon, to nie ja. Prawdopodobnie.'],
  [B,'baileyHappy','Lubię spokojne wieczory i spokojne konta. Dziś mamy jedno i drugie, {n}.'],
  [I,'calc','Policzyłem: im częściej wpisujesz, tym mniej liczenia na końcu miesiąca. Matematyka jest prosta.'],
  [B,'','Przekroczony plan to nie porażka, tylko informacja. Następny miesiąc zaplanujemy mądrzej.'],
  [I,'wink','Mrugam do Ciebie, {n}. To znaczy: „dobra robota”. Albo: „gdzie są smaczki”. Zgadnij.'],
  [B,'loaf','Siedzę jak bochenek, bo wszystko jest pod kontrolą. Prawie wszystko. Ivo jest w kartonie.'],
  [I,'','Naśladuję Bailey: patrzę mądrze na wykres. Wygląda ładnie. Bailey mówi, że to dobrze.'],
  [B,'','Raz w miesiącu kopia danych – jak raz w tygodniu czesanie. Nikt tego nie lubi, ale się opłaca.'],
  [I,'bell','Dzyń! To nie jest przypomnienie o płatności. Albo jest. Na wszelki wypadek sprawdź 📌.'],
  [B,'window','Wypatrujemy wypłaty. Kiedy przyjdzie, odhacz ją w 📌 Stałe – razem z PPK.'],
  [I,'','Nie wiem, co to inflacja, ale smaczki podrożały. Bailey mówi, że to właśnie to.'],
  [B,'churu','Mała przyjemność raz na jakiś czas jest w porządku, {n}. Ważne, żeby była w planie.'],
  [I,'heather','Leżę tu i myślę o celach. Głównie o celu „drzemka”. Wasze są ambitniejsze – i dobrze!'],
];
/* treats for the cats: a joke after adding such an expense */
const TREATS=[
  [I,'Tylko tyle na smaczki? Bailey i ja składamy oficjalną skargę 😼'],
  [B,'Dziękuję za smaczki. Ivo prosi o dokładkę, ale ja mówię: z umiarem.'],
  [I,'Smaczki wpisane! Proponuję podnieść plan tej pozycji. Tak tylko mówię…'],
  [B,'Churu to inwestycja w nasze dobre humory. Zwrot gwarantowany.'],
  [I,'Mruczę z wdzięczności. Następnym razem większe opakowanie? 🐾'],
  [B,'Odnotowano. Ivo już stoi pod szafką.'],
  [I,'To był najlepszy wydatek w tym miesiącu. Nie dyskutuję 😸'],
  [B,'Smaczki dla kotów to wydatek stały – jak miłość. Tylko odrobinę droższy.'],
];
export function treatJoke(seed){const t=TREATS[Math.abs(seed)%TREATS.length];return`🐾 ${t[0]}: ${t[1]}`}
export const isTreat=name=>/przysmak|smacz|churu/i.test(name||'');

/* special days: birthdays, holidays, cat day */
function special(c){const d=md(c.today),y=+c.today.slice(0,4);
  /* 🎂 Mati's and Wercia's birthdays (dates from „Kiedy masz urodziny?”; 29 February → 28 February in a common year) */
  const bday=w=>{const b=c.births?.[w];if(!b)return false;const m=md(b);return m==d||(m=='02-29'&&d=='02-28'&&!(y%4==0&&(y%100!=0||y%400==0)))};
  if(bday(c.name))return{who:I,scene:'celebrate',bday:true,text:pickBy(y,[`Wszystkiego najlepszego, {n}! 🎂 Dużo zdrowia, spokoju i pełnej skarbonki. Bailey upiekła tort (wirtualny), ja zjadłem świeczkę.`,`Sto lat, {n}! 🎉 Dziś żadnego liczenia – dziś świętujemy. Bailey i Ivo mruczą życzenia najpiękniej, jak umieją.`,`{n}, wszystkiego najlepszego! 🎂 Niech wszystkie plany się spełniają, a paragony będą tylko miłe. Twoje kotki 🐾`])};
  for(const w of ['Mati','Wercia'])if(w!=c.name&&bday(w))return{who:B,scene:'celebrate',bday:true,text:`Dziś urodziny ${w=='Wercia'?'Werci':'Matiego'}! 🎂 Ivo pilnuje tortu, ja – niespodzianki. Pamiętasz o życzeniach, {n}? 💝`};
  if(d=='10-13')return{who:B,scene:'birthdayB',arg:String(y-2025),text:`Dziś moje urodziny – kończę ${y-2025}! 🎂 {n}, w prezencie poproszę churu i drzemkę na kocu.`};
  if(d=='03-16')return{who:I,scene:'birthdayI',arg:String(y-2026),text:`Dziś moje urodziny – mam ${y-2026}! 🎉 Bailey obiecała, że nie zje mojego tortu. Zobaczymy.`};
  if(d=='12-24')return{who:B,scene:'christmas',text:'Dziś Wigilia! 🎄 Wesołych Świąt, {n} – dużo ciepła, spokoju i ani jednego zbędnego paragonu. Ivo czeka na pierwszą gwiazdkę (i na rybkę).'};
  if(d=='12-25'||d=='12-26')return{who:B,scene:'christmas',text:`Dziś ${d=='12-25'?'pierwszy':'drugi'} dzień Świąt Bożego Narodzenia 🎄 Wesołych Świąt, {n}! Odpoczywamy – budżet poczeka.`};
  if(d=='12-06')return{who:I,scene:'christmas',text:'Dziś Mikołajki! 🎅 Sprawdziłem buty – w moich był smaczek. Wiem, kto go tam włożył, {n} 😸'};
  if(d=='11-11')return{who:B,scene:'autumn',text:'Dziś Narodowe Święto Niepodległości 🇵🇱 Spokojnego, wolnego dnia, {n}!'};
  if(d=='05-03')return{who:B,scene:'spring',text:'Dziś Święto Konstytucji 3 Maja 🇵🇱 Majówka to dobry czas na odpoczynek – i na zerknięcie, czy wyjazd mieści się w planie.'};
  if(d=='06-01')return{who:I,scene:'summer',text:'Dziś Dzień Dziecka! 🎈 W każdym z nas siedzi trochę dziecka – we mnie całe. Należy się lody, {n}.'};
  if(d=='12-31')return{who:I,scene:'celebrate',text:'Ostatni dzień roku! Bailey robi podsumowanie, a ja szukam czapeczki na sylwestra 🎆'};
  if(d=='01-01')return{who:B,scene:'celebrate',text:'Dziś Nowy Rok! Szczęśliwego Nowego Roku, {n} – nowy rok, nowy plan, zaczynamy razem ✨'};
  if(d=='02-14')return{who:I,scene:'valentine',text:'Walentynki! 💕 Pozycja „Prezenty dla drugiej połówki” czeka. My dostajemy mruczenie gratis.'};
  if(d=='02-17')return{who:I,scene:'happy',text:'Dziś Dzień Kota! 🐱 Uprzejmie przypominamy o smaczkach. To tradycja, nie my ją wymyśliliśmy.'};
  if(d=='03-08')return c.name=='Wercia'?{who:B,scene:'spring',text:'Wercia, wszystkiego najlepszego z okazji Dnia Kobiet! 💐 Od Bailey, Ivo i całego budżetu.'}:{who:I,scene:'spring',text:'Mati, dziś Dzień Kobiet. Kwiaty dla Werci to wydatek, który zawsze się zwraca 💐'};
  if(d=='10-31')return{who:I,scene:'halloween',text:'Dziś Halloween 🎃 i Światowy Dzień Oszczędzania 🐷 Najstraszniejsze są tylko nieodhaczone rachunki – na szczęście mamy 📌 Stałe.'};
  const e=easter(y),ep=k=>{const t=new Date(Date.UTC(y,+e.slice(0,2)-1,+e.slice(3)+k));return String(t.getUTCMonth()+1).padStart(2,'0')+'-'+String(t.getUTCDate()).padStart(2,'0')};
  if(d==e)return{who:B,scene:'spring',text:'Wesołych Świąt Wielkanocnych, {n}! 🐣 Ivo szuka pisanek pod kanapą.'};
  if(d==ep(1))return{who:I,scene:'spring',text:'Lany Poniedziałek! 💦 Ja się chowam, Bailey udaje, że nie widzi wiadra. Spokojnego świętowania, {n}.'};
  if(d==ep(49))return{who:B,scene:'spring',text:'Dziś Zielone Świątki 🌿 Spokojnej niedzieli, {n}.'};
  if(d==ep(60))return{who:B,scene:'summer',text:'Dziś Boże Ciało – wolny dzień 🌼 Odpocznijcie, {n}.'};
  if(d=='11-01')return{who:B,scene:'autumn',text:'Dziś Wszystkich Świętych 🕯️ Dzień zadumy i wspomnień. Spokojnego dnia, {n}.'};
  if(d=='11-02')return{who:B,scene:'autumn',text:'Dziś Zaduszki 🕯️ Ciepłe myśli o tych, których z nami nie ma.'};
  if(d=='05-01')return{who:I,scene:'spring',text:'Dziś Święto Pracy – wolne! 🌷 Majówka czas zacząć, {n}.'};
  if(d=='08-15')return{who:B,scene:'summer',text:'Dziś Wniebowzięcie NMP i Święto Wojska Polskiego 🇵🇱 Spokojnego, wolnego dnia, {n}.'};
  if(d=='01-06')return{who:I,scene:'christmas',text:'Dziś Trzech Króli 👑 Ja przyniosłem w darze… mruczenie. Bailey – drzemkę. Spokojnego dnia, {n}.'};
  return null}

/* the message on the Budget screen: special day > a friendly line (what is left in the plan, coins, a goal, treats) or an everyday line > 🐾 the fact of the day
   (every afternoon). Warnings and to-dos (late payments, plan exceeded, little left, backup) are only in 🔔 „Na dziś” – the cats only chat.
   c = {name, today, hour, plan, left, dl, coins, goal, treats, births}; **text** = bold. */
export function greeting(c){const sp=special(c);if(sp)return{...sp,text:fill(sp.text,c)};
  const doy=Math.round((Date.UTC(+c.today.slice(0,4),+c.today.slice(5,7)-1,+c.today.slice(8))-Date.UTC(+c.today.slice(0,4),0,1))/864e5), /* UTC – the clock change does not shift the days */slot=doy*2+(c.hour<12?0:1),pick=a=>a[slot%a.length],info=[];
  if(c.plan>0&&c.left>=c.plan*.15)info.push([B,'',`**W budżecie zostało ${zl0(c.left)}** na ${c.dl} ${c.dl==1?'dzień':'dni'} do końca miesiąca 💚`]);
  if(c.coins>0)info.push([I,'coin',`**Z drobnych uzbierało się już ${zl0(c.coins)}** w tym miesiącu 🪙 Moneta do monety, {n}!`]);
  if(c.goal&&c.goal.pct>0)info.push([I,'envelope',`**Cel „${c.goal.name}” jest już w ${Math.floor(c.goal.pct)}%.** Coraz bliżej! ✨`]);
  if(c.treats>0)info.push([I,'churu',`**Na nasze smaczki w tym miesiącu: ${zl0(c.treats)}.** Uważamy, że to rozsądna kwota. Bardzo rozsądna 😼`]);
  /* every afternoon: the fact of the day (the same on both phones) */
  if(slot%2&&kotki.mode=='lots')return factMsg(c); // „Mało kotków” – no afternoon fact (as the help says)
  if(kotki.mode!='lots'||!GENERAL.length)return info.length?mk(pick(info),c):mk([B,'',`Wszystko spokojnie, {n}. Miłego dnia 💛`],c);
  return mk(info.length&&doy%2==0?pick(info):pick(GENERAL),c)}
function factMsg(c){const f=factOfDay(c.today);return{who:f.n%2?B:I,scene:f.n%2?'lupa':seasonScene(c.today),fact:true,text:'**🐾 Ciekawostka dnia:** '+f.text}}const mk=([who,scene,text],c)=>({who,scene:scene||seasonScene(c.today),text:fill(text,c)});

/* short messages for celebrations */
export const CELEBRATE={
  allPaid:n=>({scene:'celebrate',title:'Wszystkie opłaty zapłacone! 🎉',text:`${n}, wszystkie opłaty stałe w tym miesiącu odhaczone. Bailey odetchnęła z ulgą, a Ivo już tańczy.`}),
  goal:(n,g)=>({scene:'celebrate',title:`Cel „${g}” osiągnięty! 🎉`,text:`Udało się, ${n}! Ivo proponuje świętowanie, Bailey – kolejny cel. Obie rzeczy brzmią dobrze.`}),
  saving:n=>({scene:'happy',title:'Cel oszczędzania na ten miesiąc osiągnięty! 🐷',text:`Brawo, ${n}! Odłożyliście tyle, ile planowaliście. Bailey jest dumna, Ivo też (choć udaje, że nie).`}),
};

/* first steps on a new phone */
export const TOUR=n=>[
  {scene:'duo',title:`Cześć, ${n}! Jesteśmy Bailey i Ivo 🐾`,text:'Oprowadzimy Cię po budżecie. Bailey pilnuje rachunków i oszczędności, Ivo – celów, drobnych i świętowania. To zajmie minutę.'},
  {scene:'coin',title:'＋ Dodawanie wydatków',text:'Kwadratowy ＋ w prawym dolnym rogu. Kwoty możesz sumować przyciskami + i −, pozycję znajdziesz wyszukiwarką. „Zapisz” jest zawsze na dole, a „Zapisz i dodaj kolejny” przyspiesza paragony.'},
  {scene:'lupa',title:'📊 Budżet',text:'Plan na każdą pozycję i paski, ile zostało. Puste pozycje chowają się pod „＋ pustych pozycji”. Przesuń palcem w bok, żeby zmienić miesiąc. Przycisk 📈 Analiza pokazuje wykresy i podsumowanie.'},
  {scene:'papers',title:'🧾 Rejestr i 🔍',text:'Wszystkie wpisy z filtrami. Przytrzymaj wpis palcem: 📋 Duplikuj, ↩️ Zwrot, 🗑️ Usuń. Lupa 🔍 na górze szuka wszędzie – po notatce, pozycji, koncie albo kwocie (np. >200).'},
  {scene:'bell',title:'📌 Stałe',text:'Opłaty i pensje odhaczasz jednym stuknięciem. Są tu też 💼 paski pensji, 📅 wydatki roczne oraz 🔔 przypomnienia i gwarancje. Gdy coś płacisz co miesiąc, a nie ma tego w Stałych – podpowiem.'},
  {scene:'envelope',title:'💰 Majątek',text:'🐷 Oszczędności: konta, IKE, IKZE, PPK, obligacje, fundusze i cele-koperty – osobno i wspólnie. 👛 Konta: salda, „My winni” i „Nam winni”. Kursy, ceny i wyceny automat uzupełnia sam.'},
  {scene:'wink',title:'🔔 Na dziś',text:'Dzwonek w nagłówku zbiera to, co czeka: opłaty, paski pensji, przypomnienia, końce gwarancji. Prawdziwe powiadomienia na telefon włączysz w ⚙️.'},
  {scene:'heather',title:'Gotowe!',text:'W ⚙️ zmienisz kolor i wielkość tekstu (🎨 Wygląd), ustawisz, ile nas ma być w aplikacji, i zrobisz kopię danych. Ale chyba nas lubisz? 😺'},
];
/* ⚡ the number of the newest „Co nowego” entry – the entries themselves (NEWS) and the guide (HELP) are in help.js, loaded only when
   needed (C2: ~41 kB gzip less at the start). A new entry in NEWS → raise this number too (the robot checks NEWS[0].v == NEWS_V). */
export const NEWS_V=77;
