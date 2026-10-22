/* Bailey & Ivo as guides: what they say on the Budget screen, on special days, after treats, in the first-steps tour and in "Co nowego".
   Bailey – calm guardian of savings (bills, plan, safety cushion, deadlines). Ivo – cheerful foodie and party cat (goals, coins, celebrations).
   {n} in a text = the name of the person using this phone. */
import {zl0} from './util.js';

/* how many cats on this phone: lots (pictures + jokes), few (pictures, only useful messages), off (no pictures) */
export const kotki={mode:'lots'};
/* scenes drawn wider than tall (two cats, props) */
export const WIDE=new Set(['duo','happy','celebrate','wink','window','box','winter','christmas','spring','summer','autumn','halloween','valentine','birthdayB','birthdayI']);
const B='Bailey',I='Ivo';
const fill=(t,c)=>t.replace(/\{n\}/g,c.name).replace(/\{eś\}/g,c.name=='Wercia'?'aś':'eś');
const md=d=>d.slice(5);
/* Easter Sunday (Gregorian computus) as MM-DD */
function easter(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=(h+l-7*m+114)%31+1;
  return String(mo).padStart(2,'0')+'-'+String(da).padStart(2,'0')}
/* the default picture for ordinary days follows the season */
export function seasonScene(today){const m=+today.slice(5,7);return m==12||m<=2?'winter':m<=5?'spring':m<=8?'summer':'autumn'}

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
  [B,'','Kiedy coś się nie zgadza z bankiem, nie martw się. W 👛 Kontach jest „Wyrównaj” – ja zawsze tak robię z kocem.'],
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
  if(d=='10-13')return{who:B,scene:'birthdayB',arg:String(y-2025),text:`Dziś moje urodziny – kończę ${y-2025}! 🎂 {n}, w prezencie poproszę churu i drzemkę na kocu.`};
  if(d=='03-16')return{who:I,scene:'birthdayI',arg:String(y-2026),text:`Dziś moje urodziny – mam ${y-2026}! 🎉 Bailey obiecała, że nie zje mojego tortu. Zobaczymy.`};
  if(d>='12-24'&&d<='12-26')return{who:B,scene:'christmas',text:'Wesołych Świąt, {n}! 🎄 Niech pod choinką będzie dużo ciepła i ani jednego zbędnego paragonu.'};
  if(d=='12-31')return{who:I,scene:'celebrate',text:'Ostatni dzień roku! Bailey robi podsumowanie, a ja szukam czapeczki na sylwestra 🎆'};
  if(d=='01-01')return{who:B,scene:'celebrate',text:'Szczęśliwego Nowego Roku, {n}! Nowy rok, nowy plan – zaczynamy razem ✨'};
  if(d=='02-14')return{who:I,scene:'valentine',text:'Walentynki! 💕 Pozycja „Prezenty dla drugiej połówki” czeka. My dostajemy mruczenie gratis.'};
  if(d=='02-17')return{who:I,scene:'happy',text:'Dziś Dzień Kota! 🐱 Uprzejmie przypominamy o smaczkach. To tradycja, nie my ją wymyśliliśmy.'};
  if(d=='03-08')return c.name=='Wercia'?{who:B,scene:'spring',text:'Wercia, wszystkiego najlepszego z okazji Dnia Kobiet! 💐 Od Bailey, Ivo i całego budżetu.'}:{who:I,scene:'spring',text:'Mati, dziś Dzień Kobiet. Kwiaty dla Werci to wydatek, który zawsze się zwraca 💐'};
  if(d=='10-31')return{who:I,scene:'halloween',text:'Halloween! 🎃 Najstraszniejsze są tylko nieodhaczone rachunki. Na szczęście mamy 📌 Stałe.'};
  const e=easter(y);if(d==e)return{who:B,scene:'spring',text:'Wesołych Świąt Wielkanocnych, {n}! 🐣 Ivo szuka pisanek pod kanapą.'};
  return null}

/* the message on the Budget screen: special day > something needs attention > useful news > everyday line (rotates twice a day) */
export function greeting(c){const sp=special(c);if(sp)return{...sp,text:fill(sp.text,c)};
  const doy=Math.floor((new Date(c.today+'T12:00:00')-new Date(c.today.slice(0,4)+'-01-01T12:00:00'))/864e5),slot=doy*2+(c.hour<12?0:1),pick=a=>a[slot%a.length];
  const urgent=[],info=[];
  if(c.late.length)urgent.push([B,'bell',c.late.length==1?`{n}, opłata „${c.late[0]}” jest już po terminie. Zajrzyj do 📌 Stałe – odhaczenie zajmie chwilę.`:`{n}, ${c.late.length} opłaty są po terminie. Zajrzyj do 📌 Stałe, razem szybko to ogarniemy.`]);
  if(c.plan>0&&c.left<0)urgent.push([I,'grumpy',`Hmpf. Plan wydatków przekroczony o ${zl0(-c.left)}. Jestem oburzony… ale wierzę, że w przyszłym miesiącu pójdzie lepiej 💪`]);
  if(urgent.length)return mk(pick(urgent),c);
  if(c.soon.length)info.push([B,'bell',c.soon.length==1?`W ciągu kilku dni termin opłaty „${c.soon[0]}”. Przypominam z dzwoneczkiem 🔔`:`W ciągu kilku dni terminy ${c.soon.length} opłat stałych – zerknij do 📌`]);
  if(c.plan>0&&c.left>=0)info.push(c.left<c.plan*.15?[B,'lupa',`Do końca miesiąca ${c.dl} ${c.dl==1?'dzień':'dni'}, a w budżecie zostało ${zl0(c.left)}. Ostrożnie, {n} – jesteśmy blisko limitu.`]:[B,'',`Do końca miesiąca ${c.dl} ${c.dl==1?'dzień':'dni'} – w budżecie zostało jeszcze ${zl0(c.left)} 💚`]);
  if(c.coins>0)info.push([I,'coin',`Z drobnych w tym miesiącu odłożyło się już ${zl0(c.coins)} 🪙 Moneta do monety, {n}!`]);
  if(c.saved>0)info.push([I,'coin',`W tym miesiącu odłożyliście już ${zl0(c.saved)} 🐷 Brawo! Ja odłożyłem jedną monetę. Też się liczy.`]);
  if(c.goal&&c.goal.pct>0)info.push([I,'envelope',`Cel „${c.goal.name}” jest już w ${Math.floor(c.goal.pct)}%. Coraz bliżej! ✨`]);
  if(c.backupDays>=30)info.push([B,'',`Ostatnia kopia danych była ${c.backupDays} dni temu. Zrobisz nową? Ja zawsze mam zapasowy koc.`]);
  if(c.treats>0)info.push([I,'churu',`W tym miesiącu na nasze smaczki poszło ${zl0(c.treats)}. Uważamy, że to rozsądna kwota. Bardzo rozsądna 😼`]);
  if(kotki.mode!='lots'||!GENERAL.length)return info.length?mk(pick(info),c):mk([B,'',`Wszystko spokojnie, {n}. Miłego dnia 💛`],c);
  return mk(info.length&&slot%2==0?pick(info):pick(GENERAL),c)}
const mk=([who,scene,text],c)=>({who,scene:scene||seasonScene(c.today),text:fill(text,c)});

/* short messages for celebrations */
export const CELEBRATE={
  allPaid:n=>({scene:'celebrate',title:'Wszystkie opłaty zapłacone! 🎉',text:`${n}, wszystkie opłaty stałe w tym miesiącu odhaczone. Bailey odetchnęła z ulgą, a Ivo już tańczy.`}),
  goal:(n,g)=>({scene:'celebrate',title:`Cel „${g}” osiągnięty! 🎉`,text:`Udało się, ${n}! Ivo proponuje świętowanie, Bailey – kolejny cel. Obie rzeczy brzmią dobrze.`}),
  saving:n=>({scene:'happy',title:'Cel oszczędzania na ten miesiąc osiągnięty! 🐷',text:`Brawo, ${n}! Odłożyliście tyle, ile planowaliście. Bailey jest dumna, Ivo też (choć udaje, że nie).`}),
};

/* first steps on a new phone */
export const TOUR=n=>[
  {scene:'duo',title:`Cześć, ${n}! Jesteśmy Bailey i Ivo 🐾`,text:'Będziemy Was oprowadzać po budżecie. Bailey pilnuje rachunków i oszczędności, Ivo – celów, drobnych i świętowania.'},
  {scene:'coin',title:'Dodawanie wydatków',text:'Kwadratowy przycisk ＋ w prawym dolnym rogu dodaje transakcję. Pozycję znajdziesz wyszukiwarką albo wśród ostatnio używanych.'},
  {scene:'lupa',title:'📊 Budżet',text:'Wpisz plan na każdą pozycję. Paski pokażą, ile zostało, a filtr „Przekroczone” – gdzie trzeba uważać.'},
  {scene:'bell',title:'📌 Stałe',text:'Tu są pensje i opłaty stałe. Co miesiąc odhaczasz je jednym stuknięciem, a wpisy same trafiają do Rejestru.'},
  {scene:'envelope',title:'🐷 Oszczędności i 👛 Konta',text:'Oszczędności, inwestycje i cele-koperty – osobno dla Ciebie, dla drugiej osoby i wspólne. W Kontach zobaczysz cały majątek.'},
  {scene:'heather',title:'Gotowe!',text:'W ⚙️ ustawisz, ile nas ma być w aplikacji: dużo, mało albo wcale. Ale chyba nas lubisz? 😺'},
];
/* what changed – shown once per phone after an update; the newest entry first */
export const NEWS=[
  {v:6,title:'Waluty 🌍',scene:'happy',items:['Każde konto może mieć swoją walutę (⚙️ → Konta → Edytuj → Waluta) – euro, dolar, funt i każda inna z tabeli NBP. Kwoty nie są przeliczane na złote.','Wymiana walut to przelew z dwiema kwotami – kurs policzę sam i dopiszę do notatki.','Płacisz kartą złotówkową za granicą? Wpisz kwotę w zł, stuknij „🌍 Płatność w obcej walucie” i podaj kwotę w walucie.','W budżecie zobaczysz np. „wydano 820 zł + 45 €” – plan zostaje w złotych.']},
  {v:5,title:'Drobne 🪙',scene:'coin',items:['W ⚙️ → „🪙 Drobne” ustawisz regułę: z którego konta, na które, zaokrąglenie do 5 albo 10 zł i mnożnik.','Przy wydatku z tego konta pojawi się złota moneta z kwotą drobnych. Odznacz ją, gdy bank ich nie liczy (np. BLIK).','Drobne widać pod wydatkiem w Rejestrze i w Oszczędnościach.']},
  {v:4,title:'Poznajcie nas! 🐾',scene:'happy',items:['Bailey i Ivo zamieszkali w aplikacji – witają na Budżecie i podpowiadają, co warto zrobić.','Pamiętamy o urodzinach, świętach i Dniu Kota.','W ⚙️ → „Bailey i Ivo” ustawisz, ile nas ma być: dużo, mało albo wcale.']},
];
export const NEWS_V=NEWS[0].v;
