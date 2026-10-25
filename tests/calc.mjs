/* 🤖 Robot: czy obliczenia pieniędzy dalej dają dobre wyniki. Oczekiwane liczby policzone niezależnie (ręcznie / kalkulatorem), nie skopiowane z kodu.
   Uruchomienie: node tests/calc.mjs   (uruchamiany przez .github/workflows/test.yml). Kwoty w groszach. */
import {suggest,calcNet,totals} from '../js/pay.js';
import {bondYears,instValue,limitOf,fireMonths} from '../js/inv.js';
import {debtStateP,rataP,recurringP,savedP} from '../js/today.js';
import {balance,actuals,agg,roundUp,status} from '../js/logic.js';
import {pg,pnum,zl,zl0,fmtN,priv,money,addDays} from '../js/util.js';

let n=0,bad=0;
const eq=(name,got,exp)=>{n++;const ok=JSON.stringify(got)===JSON.stringify(exp);if(!ok){bad++;console.log(`❌ ${name}: jest ${JSON.stringify(got)}, powinno być ${JSON.stringify(exp)}`)}};
const N=' ';

/* ---------- 💼 pensje (zasady 2026) ---------- */
{ // umowa o pracę 10 000 zł brutto, bez PPK, koszty 250 zł, PIT-2 (−300 zł): ZUS 13,71% = 1 371 zł, zdrowotna 9% od 8 629 = 776,61 zł,
  // podstawa 8 379 zł, zaliczka 12% − 300 = 705,48 → 705 zł, netto 7 147,39 zł
  const src={kind:'uop'},sl={comp:[{n:'Pensja',a:1000000}]},o=suggest(src,sl);
  eq('UoP 10 000 – ZUS',o.zus,137100);eq('UoP 10 000 – zdrowotna',o.health,77661);eq('UoP 10 000 – podstawa',o.base,837900);eq('UoP 10 000 – zaliczka',o.tax,70500);
  eq('UoP 10 000 – netto',calcNet(src,{...sl,...o}),714739);
  // ten sam pasek, ale w tym roku już 119 000 zł podstawy: 1 000 zł po 12%, reszta (7 379 zł) po 32% → 120 + 2 361,28 − 300 = 2 181 zł
  eq('UoP – próg 32%',suggest(src,sl,{brutto:0,base:11900000}).tax,218100);
  // limit 30-krotności: do limitu (282 600 zł) zostało 2 600 zł → emerytalna i rentowa tylko od 2 600 zł, chorobowa od całości: 253,76 + 39 + 245
  eq('UoP – limit 30-krotności',suggest(src,sl,{brutto:28000000,base:0}).zus,53776);
  // PPK 2% / 1,5%: moje 200 zł, pracodawcy 150 zł – wpłata pracodawcy podnosi podstawę podatku
  const p=suggest({kind:'uop',ppk:true},sl);eq('PPK – moje',p.ppkOwn,20000);eq('PPK – pracodawcy',p.ppkEmp,15000);eq('PPK – podstawa',p.base,852900);
  // dzieło 1 000 zł, koszty 20%: podstawa 800 zł, podatek 12% = 96 zł
  eq('Dzieło 1 000 – podatek',suggest({kind:'dzielo'},{comp:[{a:100000}]}).tax,9600);
  // JDG liniowy: faktury 20 000, koszty 2 000, ZUS 1 600 → dochód 16 400, zdrowotna 4,9% = 803,60, podstawa 15 596, podatek 19% = 2 963,24 → 2 963
  const j=suggest({kind:'b2b',taxf:'liniowy',zusAmt:160000},{comp:[{a:2000000}],costs:200000});eq('JDG liniowy – zdrowotna',j.health,80360);eq('JDG liniowy – podatek',j.tax,296300);
  eq('Suma pasków',totals([{comp:[{a:100}],net:80},{comp:[{a:50}],net:40}]).net,120);
}

/* ---------- 🏛️ obligacje i podatek Belki ---------- */
{ // EDO: 1. rok 6%, 2. rok = inflacja ze stycznia 2025 (4,9%) + marża 2% = 6,9%; po 2 latach 10 000 zł × 1,06 × 1,069 = 11 331,40 zł; Belka 19% od 1 331,40 = 252,97 zł
  const b={type:'EDO',first:6},macro={inflH:{'2025-01':4.9}},it={kind:'obl',bond:b,lots:{a:{date:'2024-03-15',qty:100,price:100}}};
  eq('EDO – oprocentowanie lat',bondYears(b,macro,'2024-03-15').slice(0,2).map(x=>x.r),[6,6.9]);
  const v=instValue(it,{name:'Konto maklerskie'},'2026-03-15',macro);eq('EDO – wartość po 2 latach',v.value,1133140);eq('EDO – podatek Belki',v.tax,25297);eq('EDO – na rękę',v.net,1107843);
  eq('EDO na IKE – bez podatku',instValue(it,{name:'IKE',wrap:'ike'},'2026-03-15',macro).tax,0);
  // COI (odsetki wypłacane co roku): 6,5% i 4,9% + 1,5% = 6,4% → po 2 latach wypłacono 650 + 640 = 1 290 zł, wartość = nominał
  const c=instValue({kind:'obl',bond:{type:'COI',first:6.5},lots:{a:{date:'2024-03-15',qty:100,price:100}}},{name:'Konto'},'2026-03-15',macro);
  eq('COI – wypłacone odsetki',c.paid,129000);eq('COI – wartość',c.value,1000000);
  // akcje: 10 szt. po 100 zł, teraz 130 zł → zysk 300 zł, Belka 57 zł
  const s=instValue({kind:'akcje',price:130,lots:{a:{date:'2026-01-02',kind:'buy',qty:10,price:100,fx:1,fee:0}}},{name:'Konto'},'2026-10-01');
  eq('Akcje – wartość',s.value,130000);eq('Akcje – zysk',s.gain,30000);eq('Akcje – Belka',s.tax,5700);
  eq('Limit IKE 2026',limitOf({name:'IKE',wrap:'ike'},'2026'),2826000);
  eq('FIRE – cel osiągnięty',fireMonths(200,100,10),0);
}

/* ---------- 🔻 zobowiązania i raty ---------- */
{ // kredyt 100 000 zł, 7,2% rocznie, 120 rat równych → 1 171,42 zł (wzór na annuitet, jak w kalkulatorach banków)
  const d={id:'k',dir:'owe',start:10000000,rate:7.2,until:'2036-09-25',mode:'auto'};
  const r=rataP(d,[],'2026-10-25');eq('Rata równa',r.amt,117142);eq('Rata równa – odsetki 1. raty',r.int,60000);
  eq('Rata malejąca',rataP({...d,amort:'dec'},[],'2026-10-25').amt,143333); // 100 000/120 = 833,33 + odsetki 600 zł
  // pożyczka 10 000 zł na 12%: rata 1 000 zł → 100 zł odsetek, 900 zł kapitału; druga wpłata w tym samym miesiącu (500 zł) – cała na kapitał; spłata całości 1 000 zł – sam kapitał
  const p={id:'p',dir:'owe',start:1000000,rate:12,mode:'auto'};
  const T=[{debt:'p',amount:100000,date:'2026-01-10'},{debt:'p',amount:50000,date:'2026-01-20'},{debt:'p',amount:100000,date:'2026-02-10',payoff:true}];
  eq('Pozostało do spłaty',debtStateP(p,T,'2026-03-01').left,760000);
  eq('Pożyczka bez odsetek',debtStateP({id:'z',dir:'owe',start:500000,mode:'auto'},[{debt:'z',amount:100000,date:'2026-01-01'}],'2026-02-01').left,400000);
  eq('Odłożone na spłatę',savedP('p',[{save:{p:30000}},{save:{p:-10000}},{save:{x:5}}]),20000);
}

/* ---------- 👛 salda, budżet, drobne ---------- */
{ const cfg={accs:[{id:'a',open:100000},{id:'b',open:0},{id:'e',open:0,cur:'EUR'}],
    cats:[{id:'ci',type:'inc',subs:[{id:'pen',name:'Pensja'}]},{id:'ce',type:'exp',subs:[{id:'jed',name:'Zakupy'},{id:'kot',name:'Karma'}]}]};
  const tx=[{type:'exp',amount:20000,date:'2026-10-02',acc:'a',sub:'jed',who:'Mati'},{type:'inc',amount:500000,date:'2026-10-10',acc:'a',sub:'pen'},
    {type:'tr',amount:10000,date:'2026-10-11',acc:'a',to:'b'},{type:'adj',amount:5000,date:'2026-10-12',acc:'a'},
    {type:'inc',amount:5000,date:'2026-10-13',acc:'a',sub:'jed',refundOf:'x',who:'Mati'},
    {type:'tr',amount:43000,amount2:10000,date:'2026-10-14',acc:'a',to:'e'},{type:'exp',amount:2000,date:'2026-10-15',acc:'e',sub:'kot'},
    {type:'exp',amount:9900,date:'2026-11-01',acc:'a',sub:'jed'}];
  // 1 000 − 200 + 5 000 − 100 + 50 + 50 (zwrot) − 430 = 5 370 zł do końca października
  eq('Saldo konta',balance(cfg,tx,'a','2026-11-01'),537000);eq('Saldo konta – przelew przychodzący',balance(cfg,tx,'b','2026-11-01'),10000);
  eq('Saldo konta w euro (kwota, która wpłynęła)',balance(cfg,tx,'e','2026-11-01'),8000);
  eq('Wydane na pozycji (zwrot zmniejsza)',actuals(cfg,tx,'2026-10').jed,15000);
  const A=agg(cfg,tx,'2026-10');eq('Budżet – przychody',A.inc,500000);eq('Budżet – wydatki tylko w zł',A.exp,15000);eq('Budżet – euro osobno',A.fx.exp.EUR,2000);
  eq('Budżet – kto wydał (po zwrocie)',A.who.Mati,15000);
  // drobne: 12,30 zł → do 15 zł = 2,70 zł × 2 = 5,40 zł; równe 15,00 zł z „pełnymi drobnymi” → 5 zł × 2
  eq('Drobne',roundUp(1230,{step:5,mult:2}),540);eq('Drobne – równa kwota',roundUp(1500,{step:5,mult:2,full:true}),1000);eq('Drobne – równa kwota bez pełnych',roundUp(1500,{step:5,mult:2}),0);
  eq('Stan pozycji – przekroczona',status('exp',10000,12000).k,'over');
}

/* ---------- 📌 wykrywanie stałych opłat ---------- */
{ const cfg={accs:[{id:'a'}],cats:[{id:'c',type:'exp',subs:[{id:'s',name:'Chmura'}]}],fixed:[]};
  const tx=['2026-07-05','2026-08-05','2026-09-06','2026-10-05'].map((date,i)=>({type:'exp',amount:1199+i,date,acc:'a',sub:'s',note:'Chmura 200 GB'}));
  eq('Podpowiedź stałej opłaty',recurringP(cfg,tx,'2026-10-20').map(r=>r.name),['Chmura 200 GB']);
  eq('Podpowiedź – „Nie, dzięki”',recurringP(cfg,tx,'2026-10-20',{'rec:chmura gb':true}).length,0);
}

/* ---------- 🔢 wpisywanie i pokazywanie kwot ---------- */
{ eq('Kwota „1.234,56”',pg('1.234,56'),123456);eq('Kwota „1 234,56 zł”',pg('1 234,56 zł'),123456);eq('Kwota „12,5”',pg('12,5'),1250);eq('Kwota „1,234.56”',pg('1,234.56'),123456);
  eq('Kwota ujemna',pg('-20'),-2000);eq('Liczba',pnum('3,5'),3.5);
  eq('Zapis 5 449,18 zł',zl(544918),'5'+N+'449,18'+N+'zł');eq('Zapis 14 109 zł',zl0(1410900),'14'+N+'109'+N+'zł');eq('Zapis 999,99 zł',zl(99999),'999,99'+N+'zł');
  eq('Zapis w euro',money(450000,'EUR'),'4'+N+'500,00'+N+'€');eq('Liczba z odstępem',fmtN(1234567.8,1),'1'+N+'234'+N+'567,8');
  priv.on=true;eq('Tryb dyskretny',zl(544918),'•••'+N+'zł');priv.on=false;
  eq('Data + 1 dzień (koniec roku)',addDays('2026-12-31',1),'2027-01-01');
}

console.log(bad?`\n❌ Obliczenia: ${bad} z ${n} sprawdzeń się nie zgadza.`:`✅ Obliczenia w porządku (${n} sprawdzeń).`);
process.exit(bad?1:0);
