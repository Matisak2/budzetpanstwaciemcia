/* 🤖 Robot: czy obliczenia pieniędzy dalej dają dobre wyniki. Oczekiwane liczby policzone niezależnie (ręcznie / kalkulatorem), nie skopiowane z kodu.
   Uruchomienie: node tests/calc.mjs   (uruchamiany przez .github/workflows/test.yml). Kwoty w groszach. */
import {suggest,calcNet,totals,fromNet,youngUntil,youngLeft,baseOf} from '../js/pay.js';
import {bondYears,instValue,limitOf,fireMonths} from '../js/inv.js';
import {debtStateP,rataP,recurringP,savedP,todayItems,yearPayP,closeDueP,closeStateP,paydayP,payPatternP,nextCloseP,shortP} from '../js/today.js';
import {balance,actuals,agg,roundUp,status,savFlow,savIds,planOf,yearDueIn,fixedMatch,fixedTwin,yearMatch,yearDueNear,fixedPlanGap,upToDay} from '../js/logic.js';
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
  // „Podpowiedz z netto”: 7 147,39 zł na konto → z powrotem ok. 10 000 zł brutto, a rachunek paska zgadza się co do grosza
  {const back=(s,net,ded=0,ytd)=>{const r=fromNet(s,net,ded,ytd);return{b:r.b,net:calcNet(s,{comp:[{a:r.b}],...r,ded:[{a:ded}]})}};
    let r=back(src,714739);eq('Z netto – rachunek się zgadza',r.net,714739);eq('Z netto – brutto ok. 10 000 zł',Math.abs(r.b-1000000)<=2,true);
    // to samo, ale 147,39 zł potrąceń (np. Multisport) poszło od razu z pensji – na konto wpłynęło 7 000 zł
    r=back(src,700000,14739);eq('Z netto z potrąceniami – rachunek',r.net,700000);eq('Z netto z potrąceniami – brutto',Math.abs(r.b-1000000)<=2,true);
    // z PPK (2% moje): 10 000 zł brutto daje na konto 10 000 − składki, podatek i 200 zł PPK
    const sp={kind:'uop',ppk:true},np=calcNet(sp,{comp:[{a:1000000}],...suggest(sp,{comp:[{a:1000000}]})});
    r=back(sp,np);eq('Z netto z PPK – rachunek',r.net,np);eq('Z netto z PPK – brutto',Math.abs(r.b-1000000)<=2,true);
    // powyżej progu 32% i przy zleceniu też trafia
    r=back(src,500000,0,{brutto:0,base:11900000});eq('Z netto po progu 32% – rachunek',r.net,500000);
    const sz={kind:'zlec'};r=back(sz,312345);eq('Z netto – zlecenie',r.net,312345);
    eq('Z netto – JDG nie liczy',fromNet({kind:'b2b'},100000),null);
    // wiele kwot z rzędu: każda daje dokładnie tę kwotę netto (albo różnicę najwyżej 1 zł przy rzadkim skoku zaokrąglenia podatku)
    let worst=0;for(let x=300000;x<=1500000;x+=12347){const q=back(src,x);worst=Math.max(worst,Math.abs(q.net-x))}eq('Z netto – 100 kwot, różnica najwyżej 1 zł',worst<=100,true)}
  eq('Suma pasków',totals([{comp:[{a:100}],net:80},{comp:[{a:50}],net:40}]).net,120);
}
/* ---------- 📌 wpis z ＋ a opłata stała / wydatek roczny (bez podwójnego liczenia) ---------- */
{ const cfg={accs:[{id:'a',grp:'cur'}],cats:[{id:'c',type:'exp',name:'Dom',subs:[{id:'czy',name:'Czynsz'},{id:'net',name:'Netflix'},{id:'pr',name:'Prąd'},{id:'jed',name:'Jedzenie'},{id:'oc',name:'OC'}]}],
    fixed:[{id:'f1',name:'Czynsz',amount:185000,day:10,sub:'czy',acc:'a'},{id:'f2',name:'Netflix',amount:4300,day:20,sub:'net',acc:'a'},{id:'f3',name:'Prąd',amount:18000,day:15,sub:'pr',acc:'a',vary:true},{id:'f4',name:'Spotify',amount:2999,day:12,sub:'jed',acc:'a'}],
    years:[{id:'y1',name:'OC auta',amount:120000,month:11,day:5,every:12,sub:'oc'}]};
  const E=(sub,amount,date,note='')=>({type:'exp',sub,amount,date,note,acc:'a'});
  eq('Czynsz 1 850 → opłata stała',fixedMatch(cfg,[],E('czy',185000,'2026-10-09'))?.id,'f1');
  eq('Czynsz +10% → dalej ta sama',fixedMatch(cfg,[],E('czy',203500,'2026-10-09'))?.id,'f1');
  eq('Czynsz +20% → już nie',fixedMatch(cfg,[],E('czy',222000,'2026-10-09')),null);
  eq('Prąd (zmienna kwota) – każda kwota',fixedMatch(cfg,[],E('pr',31234,'2026-10-15'))?.id,'f3');
  eq('Notatka „Spotify” w innej pozycji',fixedMatch(cfg,[],E('net',2999,'2026-10-12','Spotify premium'))?.id,'f4');
  eq('Zakupy – nic',fixedMatch(cfg,[],E('jed',18500,'2026-10-12','Biedronka')),null);
  const paid=[{id:'t1',...E('czy',185000,'2026-10-10'),fixedId:'f1'}];
  eq('Już odhaczony w tym miesiącu → nie pyta',fixedMatch(cfg,paid,E('czy',185000,'2026-10-12')),null);
  eq('Odhaczony we wrześniu → w październiku pyta',fixedMatch(cfg,[{...paid[0],date:'2026-09-10'}],E('czy',185000,'2026-10-12'))?.id,'f1');
  const typed=[{id:'t2',...E('net',4300,'2026-10-05','Netflix')},{id:'t3',...E('net',4300,'2026-10-06'),fixedId:'f9'},{id:'t4',...E('net',4300,'2026-09-30')}];
  eq('Odhaczanie → jest wpis z ＋',fixedTwin(cfg,typed,cfg.fixed[1],'2026-10')?.id,'t2');
  eq('Odhaczanie → nic w tym miesiącu',fixedTwin(cfg,typed,cfg.fixed[0],'2026-10'),null);
  eq('Odhaczanie → usunięty się nie liczy',fixedTwin(cfg,[{...typed[0],deleted:true}],cfg.fixed[1],'2026-10'),null);
  // OC 1 200 zł do 5 listopada: zapłacone 28 października przez ＋ (1 180 zł) → to ten wydatek roczny; po zapłacie już nie pyta
  eq('OC zapłacone przez ＋',yearMatch(cfg,[],E('oc',118000,'2026-10-28'))?.id,'y1');
  eq('OC w lutym – za daleko od terminu',yearMatch(cfg,[],E('oc',118000,'2026-02-10')),null);
  eq('OC już zapłacone',yearMatch(cfg,[{id:'p',...E('oc',120000,'2026-10-20'),yearId:'y1'}],E('oc',118000,'2026-10-28')),null);
  eq('Termin najbliższy zapłacie – wcześniej',yearDueNear(cfg.years[0],'2026-10'),'2026-11');eq('Termin najbliższy zapłacie – po terminie',yearDueNear(cfg.years[0],'2026-12'),'2026-11');
  eq('Co miesiąc – ten miesiąc',yearDueNear({month:1,every:1},'2026-07'),'2026-07');
  // co kwartał (styczeń, kwiecień, lipiec, październik) 300 zł: zapłacone w lipcu → w październiku znowu w planie i znowu „To ta opłata?”
  {const q={id:'yq',name:'Ubezpieczenie',amount:30000,month:1,every:3,sub:'oc'},cq={...cfg,years:[q]},pd=[{id:'pq',...E('oc',30000,'2026-07-10'),yearId:'yq'}];
   eq('Co kwartał – po zapłacie w lipcu październik w planie',planOf(cq,{},pd,'2026-10').oc,30000);
   eq('Co kwartał – zapłacone 1 miesiąc wcześniej (wrzesień) → październik już nie',planOf(cq,{},[{...pd[0],date:'2026-09-28'}],'2026-10').oc,undefined);
   eq('Co kwartał – nowy wpis w październiku → pyta',yearMatch(cq,pd,E('oc',30000,'2026-10-08'))?.id,'yq');
   const m={id:'ym',name:'Abonament',amount:5000,month:1,every:1,sub:'oc'},cm={...cfg,years:[m]},pm=[{id:'pm',...E('oc',5000,'2026-09-10'),yearId:'ym'}];
   eq('Co miesiąc – zapłacone we wrześniu → październik w planie',planOf(cm,{},pm,'2026-10').oc,5000);
   eq('Co miesiąc – nowy wpis w październiku → pyta',yearMatch(cm,pm,E('oc',5000,'2026-10-08'))?.id,'ym');
   eq('Co miesiąc – już zapłacone w październiku → nie pyta',yearMatch(cm,[{...pm[0],date:'2026-10-02'}],E('oc',5000,'2026-10-08')),null);
   eq('Co rok – zapłacone 2 miesiące wcześniej → nie drugi raz',planOf(cfg,{},[{id:'p2',...E('oc',120000,'2026-09-15'),yearId:'y1'}],'2026-11').oc,undefined)}
  // plan niższy niż opłaty stałe: Czynsz plan 1 800 < 1 850; Netflix plan 43 = opłata → bez uwagi
  const g=fixedPlanGap(cfg,{czy:180000,net:4300,pr:20000,jed:100000});eq('Plan < opłaty stałe',g.map(x=>[x.sub.id,x.fix,x.plan]),[['czy',185000,180000]]);
  // „Na dziś”: Czynsz po terminie, ale jest podobny wpis → propozycja połączenia zamiast „po terminie”
  const D={cfg:{...cfg,years:[]},tx:[{id:'t5',...E('czy',185000,'2026-10-03','czynsz')}],slips:{},hold:{},debts:{},market:{},backup:{at:new Date('2026-10-20T12:00:00').getTime()},hraw:{}};
  const it=todayItems(D,{today:'2026-10-20',checks:false});eq('Na dziś – połącz zamiast po terminie',it.some(x=>x.icon=='💡'&&x.text.startsWith('Czynsz'))&&!it.some(x=>x.text.startsWith('Czynsz')&&x.k=='bad'),true);
}
/* ---------- ⏳ trwający miesiąc: poprzedni miesiąc do tego samego dnia ---------- */
{ const cfg={accs:[{id:'a',grp:'cur'}],cats:[{id:'c',type:'exp',name:'Dom',subs:[{id:'s',name:'Jedzenie'}]}]},E=(d,a)=>({id:d,type:'exp',sub:'s',acc:'a',amount:a,date:d});
  const tx=[E('2026-09-03',10000),E('2026-09-25',20000),E('2026-09-26',40000),E('2026-10-02',5000)];
  eq('Wrzesień do 25. dnia',agg(cfg,upToDay(tx,'2026-09',25),'2026-09').exp,30000);eq('Cały wrzesień',agg(cfg,tx,'2026-09').exp,70000);
}
/* ---------- 🗓️ zamknięcie miesiąca ---------- */
{ const tx=[{id:'x',type:'exp',amount:100,date:'2026-09-12',sub:'s',acc:'a'}];
  eq('Zamknięcie – 3 października czeka wrzesień',closeDueP({},tx,'2026-10-03'),{ym:'2026-09',n:0,start:'2026-10-01',pay:null});
  eq('Zamknięcie – kroki z obu telefonów',closeDueP({closeM:{'2026-09':{steps:{bank:{by:'Mati'},plan:{by:'Wercia'},prev:null}}}},tx,'2026-10-05').n,2);
  eq('Zamknięcie – po 10. dniu już nie',closeDueP({},tx,'2026-10-11'),null);
  eq('Zamknięcie – zrobione',closeDueP({closeM:{'2026-09':{done:{by:'Mati'}}}},tx,'2026-10-03'),null);
  eq('Zamknięcie – „Pomiń”',closeDueP({checkIgnore:{'close:2026-09':true}},tx,'2026-10-03'),null);
  eq('Zamknięcie – pusty miesiąc',closeDueP({},tx,'2026-11-03'),null);
  const D={cfg:{accs:[],cats:[],fixed:[],years:[]},tx,slips:{},hold:{},debts:{},market:{},backup:{at:new Date('2026-10-01T12:00:00').getTime()},hraw:{}};
  const c1=todayItems(D,{today:'2026-10-01',checks:false}).find(x=>x.k=='close'),c3=todayItems(D,{today:'2026-10-03',checks:false}).find(x=>x.k=='close');
  eq('Na dziś – zamknięcie, powiadomienie 1. dnia',!!c1&&!c1.quiet&&c3.quiet,true);
}
/* ---------- 💼 dzień wypłaty z pasków → 🗓️ zamknięcie dzień przed wypłatą, osobno dla każdego ---------- */
{ const inc=(id,date,src,amt=500000)=>({id,type:'inc',amount:amt,date,sub:'p',acc:'a',slip:src});
  const cfg={accs:[{id:'a',grp:'cur',owner:'Mati'}],cats:[],fixed:[],years:[],incs:[{id:'sM',who:'Mati',kind:'uop',day:10},{id:'sW',who:'Wercia',kind:'uop',day:28}]};
  /* Mati: 10. lipca (pt), 10. sierpnia (pn), 10. września (czw) → zwykle 10.; 10.10.2026 to sobota → piątek 9.10 */
  const tx=[inc('m7','2026-07-10','sM'),inc('m8','2026-08-10','sM'),inc('m9','2026-09-10','sM'),{id:'e',type:'exp',amount:100,date:'2026-09-12',sub:'s',acc:'a'},{id:'e2',type:'exp',amount:100,date:'2026-10-02',sub:'s',acc:'a'},
    /* Wercia: 31.07 (pt), 31.08 (pn), 30.09 (śr) – zawsze ostatni dzień → „koniec miesiąca”; 31.10.2026 to sobota → piątek 30.10 */
    inc('w7','2026-07-31','sW'),inc('w8','2026-08-31','sW'),inc('w9','2026-09-30','sW')];
  eq('Wypłata – Mati w październiku (sobota → piątek)',paydayP(cfg,tx,'Mati','2026-10').date,'2026-10-09');
  eq('Wypłata – wzór Werci: koniec miesiąca',payPatternP(tx,cfg.incs[1],'2026-10'),{end:true});
  eq('Wypłata – Wercia w październiku',paydayP(cfg,tx,'Wercia','2026-10').date,'2026-10-30');
  eq('Wypłata – Wercia w listopadzie (30.11 to poniedziałek)',paydayP(cfg,tx,'Wercia','2026-11').date,'2026-11-30');
  eq('Zamknięcie – Mati dzień przed wypłatą',closeDueP({},tx,'2026-10-08',cfg,'Mati'),{ym:'2026-09',n:0,start:'2026-10-08',pay:'2026-10-09'});
  eq('Zamknięcie – Mati jeszcze nie 7.10',closeDueP({},tx,'2026-10-07',cfg,'Mati'),null);
  eq('Zamknięcie – Mati ostatni dzień okna (9 dni po wypłacie)',closeDueP({},tx,'2026-10-18',cfg,'Mati')?.ym,'2026-09');
  eq('Zamknięcie – Mati po oknie',closeDueP({},tx,'2026-10-19',cfg,'Mati'),null);
  eq('Zamknięcie – Wercia 29.10 zamyka październik',closeDueP({},tx,'2026-10-29',cfg,'Wercia'),{ym:'2026-10',n:0,start:'2026-10-29',pay:'2026-10-30'});
  eq('Zamknięcie – Wercia 3.11 dalej październik',closeDueP({},tx,'2026-11-03',cfg,'Wercia')?.ym,'2026-10');
  eq('Zamknięcie – Wercia 9.10 jeszcze wrzesień (okno 29.09–9.10)',closeDueP({},tx,'2026-10-09',cfg,'Wercia')?.ym,'2026-09');
  eq('Zamknięcie – Wercia nie 10.10',closeDueP({},tx,'2026-10-10',cfg,'Wercia'),null);
  /* the salary came earlier than expected (7.10) → the real day counts */
  const tx2=[...tx,inc('m10','2026-10-07','sM')];
  eq('Wypłata – prawdziwy dzień, gdy już wpłynęła',paydayP(cfg,tx2,'Mati','2026-10'),{date:'2026-10-07',real:true,src:'sM'});
  eq('Zamknięcie – okno od dnia przed prawdziwą wypłatą',closeDueP({},tx2,'2026-10-06',cfg,'Mati')?.start,'2026-10-06');
  /* no payslip yet → the day typed at the source; no source → the first 10 days of a month */
  eq('Wypłata – bez pasków dzień ze źródła',paydayP(cfg,[],'Mati','2026-11').date,'2026-11-10');
  eq('Zamknięcie – bez źródła dochodu od 1. dnia',closeDueP({},tx,'2026-10-03',{...cfg,incs:[]},'Mati')?.ym,'2026-09');
  eq('Następne liczenie nadwyżki – Mati',nextCloseP(cfg,tx,'Mati','2026-10-20'),'2026-11-09');
  /* personal and shared steps; steps from before the split count for whoever ticked them */
  const old={closeM:{'2026-09':{steps:{bank:{by:'Mati'},prev:{by:'Wercia'},casc:{by:'Wercia'}}}}};
  eq('Zamknięcie – stare kroki: Mati (bank + wspólny „ponad plan”)',closeStateP(old,'2026-09','Mati').n,2);
  eq('Zamknięcie – stare kroki: Wercia (nadwyżka + wspólny „ponad plan”)',closeStateP(old,'2026-09','Wercia').n,2);
  const nw={closeM:{'2026-09':{steps:{bank:{by:'Mati'},plan:{by:'Mati'}},p:{Mati:{steps:{bank:null,goals:{by:'Mati'}}}}}}};
  eq('Zamknięcie – cofnięty krok nie wraca ze starych',closeStateP(nw,'2026-09','Mati').steps.bank,null);
  eq('Zamknięcie – wspólny plan liczy się Werci',closeStateP(nw,'2026-09','Wercia').n,1);
  eq('Zamknięcie – dawniej zamknięty miesiąc zamknięty u obojga',!!closeStateP({closeM:{'2026-09':{done:{by:'Mati'}}}},'2026-09','Wercia').done,true);
  eq('Zamknięcie – „Pomiń” jednej osoby',closeDueP({checkIgnore:{'close:2026-09:Mati':true}},tx,'2026-10-08',cfg,'Mati'),null);
  const D={cfg,tx,slips:{},hold:{},debts:{},market:{},backup:{at:new Date('2026-10-01T12:00:00').getTime()},hraw:{}};
  const L=todayItems(D,{today:'2026-10-08',checks:false}).filter(x=>x.k=='close');
  eq('Na dziś – 8.10 zamknięcie Matiego z powiadomieniem, Werci po cichu',L.map(x=>[x.who,x.quiet]),[['Mati',false],['Wercia',true]]);
}
/* ---------- ⚠️ nie starczy na rachunki (prognoza salda do końca miesiąca) ---------- */
{ const accs=[{id:'w',grp:'cur',owner:'Wspólne',open:30000},{id:'m',grp:'cur',owner:'Mati',open:500000}],czynsz={id:'fc',name:'Czynsz',amount:185000,day:10,acc:'w',kind:'exp',sub:'s'};
  /* 300 zł na wspólnym, czynsz 1 850 zł 10.11 → brakuje 1 550 zł */
  eq('Nie starczy – czynsz',shortP({accs,fixed:[czynsz]},[],'2026-11-03'),[{acc:'w',bal:30000,date:'2026-11-10',name:'Czynsz',amount:185000,miss:155000,fid:'fc'}]);
  /* stały przelew 3 000 zł z konta Matiego 5.11 → wystarczy; ten sam przelew dopiero 12.11 → dalej brakuje */
  eq('Nie starczy – zrzutka przed czynszem',shortP({accs,fixed:[czynsz,{id:'fz',name:'Na wspólne',amount:300000,day:5,acc:'m',to:'w',kind:'tr'}]},[],'2026-11-03'),[]);
  eq('Nie starczy – zrzutka po czynszu',shortP({accs,fixed:[czynsz,{id:'fz',name:'Na wspólne',amount:300000,day:12,acc:'m',to:'w',kind:'tr'}]},[],'2026-11-03')[0]?.miss,155000);
  /* czynsz już odhaczony → nic */
  eq('Nie starczy – zapłacone',shortP({accs,fixed:[czynsz]},[{id:'p',type:'exp',amount:185000,date:'2026-11-02',acc:'w',fixedId:'fc',sub:'s'}],'2026-11-03'),[]);
  /* pensja na to konto zwykle 8. (8.11 to niedziela → piątek 6.11), ostatnia 2 000 zł → pokryje czynsz */
  const sal=[{id:'s10',type:'inc',amount:200000,date:'2026-10-08',acc:'w',slip:'src'},{id:'e10',type:'exp',amount:200000,date:'2026-10-20',acc:'w',sub:'s'}];
  eq('Nie starczy – pensja przyjdzie przed czynszem',shortP({accs,fixed:[czynsz],incs:[{id:'src',who:'Mati',acc:'w',day:8}]},sal,'2026-11-03'),[]);
  const D={cfg:{accs,cats:[],fixed:[czynsz],years:[]},tx:[],slips:{},hold:{},debts:{},market:{},backup:{at:new Date('2026-11-01T12:00:00').getTime()},hraw:{}};
  const it=d=>todayItems(D,{today:d,checks:false}).find(x=>x.icon=='⚠️');
  eq('Na dziś – brak na czynsz, „Przelej” na brakującą kwotę',it('2026-11-03').go,{a:'tr',to:'w',amount:155000});
  eq('Na dziś – brak dla obojga (konto wspólne)',it('2026-11-03').who,null);
  eq('Na dziś – powiadomienie pierwszego dnia (1.11), potem cicho, znowu dzień przed',[it('2026-11-01').quiet,it('2026-11-03').quiet,it('2026-11-09').quiet],[false,true,false]);
  eq('Na dziś – w dniu czynszu pilne',it('2026-11-10').k,'bad');
}
/* ---------- 🔁 powtarzający się przelew → stały przelew ---------- */
{ const accs=[{id:'m',grp:'cur',name:'Konto Mati'},{id:'w',grp:'cur',name:'Konto wspólne'}],T=(id,d,a)=>({id,type:'tr',amount:a,date:d,acc:'m',to:'w',note:'na wspólne'});
  const tx=[T('t8','2026-08-02',300000),T('t9','2026-09-02',300000),T('t10','2026-10-02',310000)];
  const r=recurringP({accs,fixed:[]},tx,'2026-10-25').find(x=>x.kind=='tr');
  eq('Stały przelew – podpowiedź',r&&[r.key,r.name,r.amount,r.day],['rec:tr:m>w','Konto Mati → Konto wspólne',310000,2]);
  eq('Stały przelew – już jest w 📌 Stałe',recurringP({accs,fixed:[{id:'f',kind:'tr',acc:'m',to:'w',amount:300000,day:2}]},tx,'2026-10-25').filter(x=>x.kind=='tr'),[]);
  eq('Stały przelew – „Nie, dzięki”',recurringP({accs,fixed:[]},tx,'2026-10-25',{'rec:tr:m>w':true}).filter(x=>x.kind=='tr'),[]);
}
/* ---------- 🎓 ulga dla młodych (do 26 lat, limit 85 528 zł) ---------- */
{ // 10 000 zł brutto w całości w limicie: ZUS 1 371 i zdrowotna 776,61 jak zwykle, podatku 0 → na konto 7 852,39 zł
  const src={kind:'uop'},sl={comp:[{a:1000000}]},o=suggest(src,sl,undefined,8552800);
  eq('Młodzi – ZUS bez zmian',o.zus,137100);eq('Młodzi – zdrowotna bez zmian',o.health,77661);eq('Młodzi – podatek 0',o.tax,0);eq('Młodzi – zwolnione',o.young,1000000);
  eq('Młodzi – netto',calcNet(src,{...sl,...o}),785239);
  // w limicie zostało 4 000 zł: opodatkowane 6 000 zł, ZUS odliczany w 60% (822,60), koszty 250 → podstawa 4 927,40 → 4 927 zł,
  // 12% = 591,24 − 300 = 291,24 → 291 zł; na konto 10 000 − 1 371 − 776,61 − 291 = 7 561,39 zł
  const q=suggest(src,sl,undefined,400000);eq('Młodzi – część ponad limit, podstawa',q.base,492700);eq('Młodzi – część ponad limit, podatek',q.tax,29100);
  eq('Młodzi – część ponad limit, netto',calcNet(src,{...sl,...q}),756139);
  eq('Młodzi – brak ulgi = jak zwykle',suggest(src,sl,undefined,null).tax,70500);
  // podstawa zapisywana przy pasku (do progu 32% i PIT-11) – bez zwolnionej części
  eq('Młodzi – podstawa paska',baseOf(src,{...sl,zus:137100,kup:25000,young:400000}),492700);eq('Podstawa paska bez ulgi',baseOf(src,{...sl,zus:137100,kup:25000}),837900);
  // z netto: 7 852,39 zł na konto → ok. 10 000 zł brutto
  {const r=fromNet(src,785239,0,undefined,8552800);eq('Młodzi z netto – brutto',Math.abs(r.b-1000000)<=2,true);eq('Młodzi z netto – rachunek',calcNet(src,{comp:[{a:r.b}],...r}),785239)}
  // koniec ulgi: dzień 26. urodzin włącznie; 29 lutego → 28 lutego w zwykłym roku
  eq('26. urodziny',youngUntil('2001-05-12'),'2027-05-12');eq('26. urodziny – 29 lutego',youngUntil('2000-02-29'),'2026-02-28');eq('Bez daty',youngUntil(''),'');
  // limit liczony ze wszystkich pasków tej osoby w roku: 9 000 + 135 PPK pracodawcy (stary pasek bez „young”) + 5 000 zapisane = 14 135 zł → zostaje 71 393 zł
  const slips={'2025-12':{a:{who:'Wercia',kind:'uop',comp:[{a:900000}],date:'2025-12-10'}},'2026-01':{a:{who:'Wercia',kind:'uop',comp:[{a:900000}],ppkEmp:13500,date:'2026-01-10'},m:{who:'Mati',kind:'uop',comp:[{a:900000}],date:'2026-01-10'}},'2026-02':{a:{who:'Wercia',kind:'uop',comp:[{a:900000}],young:500000,date:'2026-02-10'}},'2026-04':{a:{who:'Wercia',kind:'uop',comp:[{a:900000}],date:'2026-04-10'}}};
  const incs=[{id:'a',who:'Wercia',kind:'uop'},{id:'b',who:'Wercia',kind:'zlec'},{id:'m',who:'Mati',kind:'uop'}];
  eq('Młodzi – limit z innych pasków',youngLeft(slips,incs,incs[1],'2001-05-12','2026-03','2026-03-10'),7139300);
  eq('Młodzi – po 26. urodzinach brak',youngLeft(slips,incs,incs[1],'2001-05-12','2027-05','2027-05-13'),null);
  eq('Młodzi – w dniu urodzin jeszcze tak',youngLeft({},incs,incs[1],'2001-05-12','2027-05','2027-05-12'),8552800);
  eq('Młodzi – dzieło bez ulgi',youngLeft(slips,incs,{id:'d',who:'Wercia',kind:'dzielo'},'2001-05-12','2026-03','2026-03-10'),null);
  eq('Młodzi – pasek po urodzinach nie zużywa limitu',youngLeft(slips,incs,incs[1],'2000-03-15','2026-05','2026-03-14'),8552800-900000-13500-500000);
  // „Na dziś” miesiąc przed 26. urodzinami: koniec ulgi i ok. 705 zł mniej (podatek z ostatniego paska 10 000 zł)
  const D={cfg:{accs:[],cats:[],fixed:[],years:[],incs:[{id:'a',who:'Wercia',kind:'uop',day:10}]},tx:[],slips:{'2027-04':{a:{comp:[{a:1000000}]}}},hold:{},debts:{},market:{},backup:null,hraw:{birth:{Wercia:'2001-05-12'}}};
  const yi=todayItems(D,{today:'2027-04-20',checks:false}).find(x=>x.k=='young');eq('Na dziś – koniec ulgi',!!yi&&yi.who=='Wercia'&&yi.text.includes('705,00'),true);
  eq('Na dziś – za wcześnie',todayItems(D,{today:'2027-03-20',checks:false}).some(x=>x.k=='young'),false);
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
  // konto 'a' bez właściciela i bez imienia w nazwie = wspólne: 200 − 50 zwrotu = 150 zł z konta wspólnego
  eq('Budżet – z czyjego konta (po zwrocie)',A.own['Wspólne'],15000);
}
/* ---------- 📅 wydatki roczne w planie miesiąca płatności ---------- */
{ const cfg={accs:[],cats:[],years:[{id:'oc',name:'OC',amount:120000,month:3,every:12,sub:'ub'},{id:'op',name:'Opony',amount:40000,month:4,every:6,sub:'op'},{id:'pr',name:'Przegląd',amount:20000,month:5,every:24,sub:'pr',last:'2026-05'}]};
  const plans={'2027-03':{ub:5000,jed:150000}},tx=[];
  eq('Roczne – marzec: plan pozycji + OC',planOf(cfg,plans,tx,'2027-03').ub,125000);eq('Roczne – reszta planu bez zmian',planOf(cfg,plans,tx,'2027-03').jed,150000);
  eq('Roczne – kwiecień bez OC',planOf(cfg,plans,tx,'2027-04').ub,undefined);
  eq('Roczne – co pół roku: kwiecień i październik',[yearDueIn(cfg.years[1],'2027-04'),yearDueIn(cfg.years[1],'2027-10'),yearDueIn(cfg.years[1],'2027-07')],[true,true,false]);
  eq('Roczne – co 2 lata od ostatniej zapłaty',[yearDueIn(cfg.years[2],'2027-05'),yearDueIn(cfg.years[2],'2028-05')],[false,true]);
  // OC zapłacone już w lutym (1 150 zł) – w lutym plan = zapłacone, w marcu nie drugi raz
  const paid=[{type:'exp',amount:115000,date:'2027-02-20',sub:'ub',yearId:'oc'}];
  eq('Roczne – zapłacone wcześniej: plan w miesiącu zapłaty',planOf(cfg,{},paid,'2027-02').ub,115000);eq('Roczne – zapłacone wcześniej: bez planu w terminie',planOf(cfg,{},paid,'2027-03').ub,undefined);
}
/* ---------- 📅 przypomnienia: termin wydatku rocznego, podatek od najmu, PIT ---------- */
{ const oc={id:'oc',name:'OC',amount:120000,month:3,day:15,every:12,sub:'ub'};
  eq('Termin rocznego – 10 dni przed',yearPayP(oc,[],'2027-03-05'),{m:'2027-03',due:'2027-03-15',n:10});
  eq('Termin rocznego – za wcześnie (23 dni)',yearPayP(oc,[],'2027-02-20'),null);
  eq('Termin rocznego – po terminie, niezapłacone',yearPayP(oc,[],'2027-04-10')?.n,-26);
  eq('Termin rocznego – zapłacone',yearPayP(oc,[{type:'exp',amount:120000,date:'2027-03-02',yearId:'oc'}],'2027-03-05'),null);
  const D=(fixed,tx,today)=>todayItems({cfg:{accs:[{id:'a',grp:'cur',owner:'Wercia'}],cats:[],fixed,years:[]},tx,slips:{},hold:{},debts:{},market:{},backup:{at:new Date(today+'T12:00:00').getTime()},hraw:{}},{today,checks:false});
  const naj={id:'fn',name:'Najem',kind:'inc',amount:300000,day:10,sub:'x',acc:'a',najem:'m'},rent=[{type:'inc',amount:300000,date:'2027-02-10',acc:'a',sub:'x',fixedId:'fn'}];
  const it=D([naj],rent,'2027-03-05').find(x=>x.icon=='🏠'&&/Ryczałt/.test(x.text));eq('Najem – ryczałt 8,5% z 3 000 zł',/255,00/.test(it?.text||''),true);eq('Najem – czyje (właściciel konta)',it?.who,'Wercia');
  eq('Najem co kwartał – w marcu nic',D([{...naj,najem:'q'}],rent,'2027-03-05').some(x=>/Ryczałt/.test(x.text)),false);
  // kwartał styczeń–marzec: 3 000 + 3 000 zł → 8,5% = 510 zł
  eq('Najem co kwartał – w kwietniu za styczeń–marzec',/510,00/.test(D([{...naj,najem:'q'}],[...rent,{...rent[0],date:'2027-01-10'}],'2027-04-05').find(x=>/Ryczałt/.test(x.text))?.text||''),true);
  eq('Najem – PIT-28 w lutym',D([naj],rent,'2027-02-03').some(x=>/PIT-28/.test(x.text)),true);
  const pit=D([],[],'2027-03-01').filter(x=>x.key?.startsWith('pit:'));eq('PIT – w marcu dla obojga',pit.map(x=>x.who),['Mati','Wercia']);eq('PIT – 1 marca powiadomienie',pit[0].quiet,false);
  eq('PIT – 5 marca bez powiadomienia (tylko w „Na dziś”)',D([],[],'2027-03-05').find(x=>x.key?.startsWith('pit:')).quiet,true);eq('PIT – w maju już nie',D([],[],'2027-05-02').some(x=>x.key?.startsWith('pit:')),false);
}
/* ---------- 🐷 odłożone = wpłaty, nie zmiana kursów ---------- */
{ const cfg={accs:[{id:'cur',grp:'cur',owner:'Mati',open:500000},{id:'sav',grp:'sav',owner:'Mati',open:0},{id:'ike',grp:'inv',owner:'Mati',wrap:'ike',open:0},
    {id:'ppk',grp:'inv',owner:'Wercia',wrap:'ppk',open:0},{id:'eur',grp:'sav',owner:'Mati',cur:'EUR',open:0}],cats:[]};
  const tx=[{type:'tr',amount:100000,date:'2026-10-02',acc:'cur',to:'sav'},          // +1 000 odłożone
    {type:'tr',amount:30000,date:'2026-10-03',acc:'sav',to:'ike'},                   // przesunięcie między oszczędnościami: 0
    {type:'adj',val:true,amount:50000,date:'2026-10-31',acc:'ike'},                   // kurs ETF +500: zysk, nie odłożone
    {type:'adj',val:true,amount:-8000,date:'2026-10-31',acc:'ppk'},                   // PPK −80: strata
    {type:'tr',amount:20000,date:'2026-10-20',acc:'sav',to:'cur'},                    // wypłata −200
    {type:'inc',amount:15000,date:'2026-10-10',acc:'ppk',ppk:'own'},                  // PPK z pensji +150
    {type:'tr',amount:43000,amount2:10000,date:'2026-10-05',acc:'cur',to:'eur'},     // na konto w euro – nie w złotych
    {type:'tr',amount:7000,date:'2026-11-02',acc:'cur',to:'sav'}];                   // listopad – nie liczy się w październiku
  const F=savFlow(cfg,tx,savIds(cfg),'2026-10');eq('Odłożone w miesiącu (bez kursów)',F.flow,95000);eq('Zmiana kursów osobno',F.gain,42000);
  eq('Odłożone – rok',savFlow(cfg,tx,savIds(cfg),'2026').flow,102000);
  eq('Odłożone – tylko Mati',savFlow(cfg,tx,savIds(cfg,'Mati'),'2026-10').flow,80000);eq('Odłożone – tylko Wercia (PPK)',savFlow(cfg,tx,savIds(cfg,'Wercia'),'2026-10').flow,15000);
  // wartość na koniec października − na początku = odłożone + zmiana kursów (bez konta w euro)
  const v=d=>savIds(cfg).reduce((a,id)=>a+balance(cfg,tx,id,d),0);eq('Odłożone + kursy = przyrost wartości',v('2026-11-01')-v('2026-10-01'),F.flow+F.gain);
  // drobne: 12,30 zł → do 15 zł = 2,70 zł × 2 = 5,40 zł; równe 15,00 zł z „pełnymi drobnymi” → 5 zł × 2
  eq('Drobne',roundUp(1230,{step:5,mult:2}),540);eq('Drobne – równa kwota',roundUp(1500,{step:5,mult:2,full:true}),1000);eq('Drobne – równa kwota bez pełnych',roundUp(1500,{step:5,mult:2}),0);
  eq('Stan pozycji – przekroczona',status('exp',10000,12000).k,'over');
}

/* ---------- ⚡ szybkie liczenie (zapamiętane wyniki) daje to samo co liczenie po kolei ---------- */
{ let seed=7;const R=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648},pick=L=>L[Math.floor(R()*L.length)];
  const cfg={accs:['a','b','c','d'].map((id,i)=>({id,open:i*1000})),cats:[{id:'ci',type:'inc',subs:[{id:'p'}]},{id:'ce',type:'exp',subs:[{id:'x'},{id:'y'}]}]};
  const tx=[];for(let i=0;i<3000;i++){const y=2020+Math.floor(R()*7),m=1+Math.floor(R()*12),d=1+Math.floor(R()*28),date=R()<0.01?undefined:`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const type=pick(['exp','exp','inc','tr','adj']),acc=pick(['a','b','c','d']),to=type=='tr'?pick(['a','b','c','d']):'';
    tx.push({id:'t'+i,type,date,acc,to,amount:Math.floor(R()*50000)-(type=='adj'?20000:0),amount2:type=='tr'&&R()<0.2?Math.floor(R()*9000):undefined,sub:type=='exp'?pick(['x','y']):type=='inc'?'p':'',deleted:R()<0.05})}
  const naiveBal=(id,before)=>{let b=cfg.accs.find(a=>a.id===id)?.open||0;for(const t of tx){if(t.date>=before)continue;if(t.acc===id){if(t.type=='inc'||t.type=='adj'||t.type=='invs')b+=t.amount;else b-=t.amount}if(t.type=='tr'&&t.to===id)b+=t.amount2??t.amount}return b};
  let badB=0;for(const id of ['a','b','c','d','zz'])for(const before of ['2019-01-01','2021-06-15','2023-01-01','2024-07-31','9999-99-99'])if(balance(cfg,tx,id,before)!==naiveBal(id,before))badB++;
  eq('Szybkie salda = liczone po kolei',badB,0);
  const live=tx.filter(t=>!t.deleted&&/^\d{4}-\d\d-\d\d$/.test(t.date||''));let badA=0;
  for(const pre of ['2021','2022-03','2026-12','2019']){const a=agg(cfg,live,pre),n=live.filter(t=>t.date.startsWith(pre)&&(t.type=='exp'||t.type=='inc'));
    const inc=n.filter(t=>t.type=='inc').reduce((s,t)=>s+t.amount,0),exp=n.filter(t=>t.type=='exp').reduce((s,t)=>s+t.amount,0);if(a.inc!==inc||a.exp!==exp)badA++}
  eq('Szybkie sumy miesiąca i roku = liczone po kolei',badA,0);
}

/* ---------- 📌 wykrywanie stałych opłat ---------- */
{ const cfg={accs:[{id:'a'}],cats:[{id:'c',type:'exp',subs:[{id:'s',name:'Chmura'}]}],fixed:[]};
  const tx=['2026-07-05','2026-08-05','2026-09-06','2026-10-05'].map((date,i)=>({type:'exp',amount:1199+i,date,acc:'a',sub:'s',note:'Chmura 200 GB'}));
  eq('Podpowiedź stałej opłaty',recurringP(cfg,tx,'2026-10-20').map(r=>r.name),['Chmura 200 GB']);
  eq('Podpowiedź – „Nie, dzięki”',recurringP(cfg,tx,'2026-10-20',{'rec:chmura gb':true}).length,0);
}

/* ---------- 🧾 nowy rok: przypomnienie o zasadach pensji ---------- */
{ const D=h=>({cfg:{accs:[],cats:[],fixed:[],incs:[{id:'i',who:'Mati',kind:'uop'}]},tx:[],slips:{},hold:{},debts:{},market:{},backup:{at:Date.now()},hraw:h||{}});
  const has=(d,today)=>todayItems(d,{today,checks:false}).some(x=>x.k=='rules');
  eq('Zasady pensji – styczeń 2027 przypomina',has(D(),'2027-01-05'),true);eq('Zasady pensji – w roku zasad nie przypomina',has(D(),'2026-01-05'),false);
  eq('Zasady pensji – „Załatwione” chowa',has(D({checkIgnore:{'rules:2027':true}}),'2027-01-05'),false);eq('Zasady pensji – w marcu już nie',has(D(),'2027-03-05'),false);
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
