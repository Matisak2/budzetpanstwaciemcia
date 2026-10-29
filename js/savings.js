/* Budżet M&W – 📈 savings and investments, limits, FIRE, 📅 yearly expenses. Part of the former js/app.js (split into modules, same code). */
import {doc,updateDoc,deleteField} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {catsEmpty} from './art.js';
import {kotki} from './guide.js';
import {gainSvg} from './charts.js';
import {BONDS,IICON,IKINDS,LIMITS,OKI_FREE,OKI_RATE,bondRates,bondYears,fundFromUrl,fundHouse,fundName,instDiffP,macroP,fireMonths,flowSeries,instValue,limitOf,paidInYear,position,taxFree,wrapOf,yearDue,intOf,intPeriod,intCalc,intTax,intMonthly,intLabel} from './inv.js';
import {limitPropP,maturitiesP,yearStateP} from './today.js';
import {seasonal,agg,balance,liveOf,carStats,yearDueNear} from './logic.js';
import {$,MN,MNG,addDays,addMonths,clone,esc,f2,isDate,pnum,rid,td,zl,zl0,money,curSym,plu} from './util.js';
import {S,toast,ask,CUR,isP,CUR_OPTS,accOwner,accOpts,subOpts,H,HOLD,w,merge,strip,saveAcc,putTx,guard} from './core.js';
import {openTx} from './sheet.js';
import {gr} from './salary.js';
import {remsH,warrantiesH,rems,saveRem,projs} from './debts.js';
import {accN,render} from './app.js';

/* ---------- 📈 savings & investments: instruments, values on one screen, limits, paid vs value, FIRE ---------- */
export const accById=id=>S.cfg.accs.find(a=>a.id==id);
export const macro=()=>macroP(S.hraw,S.market?.rates);
export const mkt=()=>S.market?.rates||null;
export const instsOf=accId=>Object.entries(S.hold).filter(([,x])=>x.acc==accId&&!x.deleted).map(([id,x])=>({id,...x}));
export const nf=(x,d=2)=>(+x||0).toLocaleString('pl-PL',{minimumFractionDigits:d,maximumFractionDigits:Math.max(d,4)});
export const pn=v=>{const x=pnum(v);return isFinite(x)?x:0};
/* value adjustment that makes the account balance show its instruments at today's value */
export function instDiff(a,hold){const L=Object.entries(hold||S.hold).filter(([,x])=>x.acc==a.id&&!x.deleted).map(([id,x])=>({id,...x}));return instDiffP(a,L,liveOf(S.tx),td(),macro(),mkt())}
export function addVal(a,d,note){if(!d)return null;const ym=td().slice(0,7),id='t'+rid();putTx(ym,id,{type:'adj',val:true,amount:d,date:td(),sub:'',acc:a.id,to:'',who:S.who,note,deleted:false,ts:Date.now()});return[ym,id]}
/* bonds and deposits that end soon */
export function maturities(days){return maturitiesP(S.cfg,S.hold,td(),days)}
export const matH=()=>maturities(30).map(m=>`<div class="note">${IICON[m.it.kind]} ${m.it.kind=='obl'?'Wykup obligacji':'Koniec lokaty'} <b>${esc(m.it.name)}</b> (${esc(m.a.name)}): ${m.end.split('-').reverse().join('.')}${m.days?` – za ${m.days} ${plu(m.days,'dzień','dni','dni')}`:' – dziś'}. Zdecydujcie, co dalej z pieniędzmi.</div>`).join('');
export function openInst(id){S.instAcc=id;S.values=false;window.scrollTo(0,0);render()}
export function closeInst(){S.instAcc=null;S.values=false;render()}
export function instPageH(){const a=accById(S.instAcc);if(!a){S.instAcc=null;return''}const cur=CUR(a),M=v=>money(v,cur),L=instsOf(a.id),today=td(),mc=macro();
  const vals=L.map(it=>({it,v:instValue(it,a,today,mc,mkt())})),T=vals.reduce((s,x)=>({value:s.value+x.v.value,cost:s.cost+x.v.cost,net:s.net+x.v.net}),{value:0,cost:0,net:0});
  const bal=balance(S.cfg,liveOf(S.tx),a.id,addDays(today,1)),diff=instDiff(a),w=wrapOf(a);
  let h=`<button class="btn sm" style="align-self:flex-start" onclick="closeInst()">‹ Oszczędności</button>
    <div class="worth"><div class="l">${esc(a.name)}${w?` · <span class="curtag">${w.toUpperCase()}</span>`:''}${isP(a)?'':` · <span class="curtag">${cur}</span>`}</div><div class="v num">${M(T.value)}</div>
    <div class="s">instrumenty · wpłacono ${M(T.cost)} · ${T.value-T.cost>=0?'+':''}${M(T.value-T.cost)}${T.cost?` (${((T.value-T.cost)/T.cost*100).toFixed(1).replace('.',',')}%)`:''}</div>
    <div class="s">na rękę ${taxFree(a)?'(bez podatku Belki)':'po podatku Belki 19%'}: <b>${M(T.net)}</b> · saldo konta w aplikacji: ${M(bal)}</div></div>`;
  if(mkt()?.date&&L.some(it=>it.ticker||it.kind=='zloto'||it.kind=='tfi'))h+=`<div class="mini" style="padding:0 4px">🤖 Ceny z automatu z ${mkt().date.split('-').reverse().join('.')} (gdy są nowsze niż wpisane ręcznie).</div>`;
  if(diff)h+=`<button class="btn primary" onclick="saveInstVal('${a.id}')">⚖️ Zapisz wycenę w saldzie konta (${diff>0?'+':''}${M(diff)})</button>`;
  h+=matH();
  h+=vals.map(({it,v})=>{const mk=it.kind!='obl'&&it.kind!='lokata',ic=it.cur||cur,lots=Object.entries(it.lots||{}).filter(([,l])=>!l.deleted).sort((x,y)=>x[1].date.localeCompare(y[1].date));
    const br=it.kind=='obl'?bondRates(it.bond||{},mc,lots[0]?.[1].date):null,yi=it.kind=='obl'&&lots.length?Math.min(br.length-1,Math.floor((new Date(today)-new Date(lots[0][1].date))/(365.25*864e5))):0;
    return`<div class="inst"><div class="r1"><b>${IICON[it.kind]} ${esc(it.name)}${it.ticker?` <span class="mini">${esc(it.ticker)}</span>`:''}</b><b class="num">${M(v.value)}</b></div>
      <div class="mini">${IKINDS[it.kind]}${mk?` · ${it.kind=='tfi'?nf(v.qty,2)+' j.u.':nf(v.qty,0)+' szt.'} × ${nf(v.px)} ${curSym(ic)}${ic!=cur?` · kurs ${nf(v.fx,4)}`:''}${it.priceDate?` · cena z ${it.priceDate.split('-').reverse().join('.')}`:''}`:''}${it.kind=='obl'?` · ${esc(BONDS[it.bond?.type]?.n||'')} · w tym roku ${nf(br[yi])}%`:''}${it.kind=='lokata'?` · ${nf(it.dep?.rate)}% na ${it.dep?.months} mies.`:''}${v.next?` · koniec ${v.next.split('-').reverse().join('.')}`:''}</div>
      <div class="mini">zysk <b class="${v.gain>=0?'t-inc':'t-exp'}">${v.gain>=0?'+':''}${M(v.gain)}</b>${mk&&ic!=cur?` (z ceny ${v.gPx>=0?'+':''}${M(v.gPx)} · z kursu ${v.gFx>=0?'+':''}${M(v.gFx)})`:''}${v.real?` · zrealizowany ${M(v.real)}`:''} · na rękę ${M(v.net)}</div>
      <div class="lots">${lots.map(([,l])=>`<span>${l.kind=='sell'?'↗️ sprzedaż':'🛒'} ${l.date.split('-').reverse().join('.')} · ${it.kind=='lokata'?M(Math.round(l.price*100)):`${nf(l.qty,0)} × ${nf(l.price)} ${curSym(ic)}`}</span>`).join('')}</div>
      <div class="btns" style="gap:6px"><button class="chip" onclick="addLot('${it.id}')">+ ${it.kind=='lokata'?'Lokata':'Zakup'}</button>${mk?`<button class="chip" onclick="addLot('${it.id}',1)">Sprzedaż</button><button class="chip" onclick="setPrice('${it.id}')">✎ Cena</button>`:''}${it.kind=='tfi'?`<button class="chip" onclick="setUnits('${it.id}')">✎ Liczba jednostek</button>`:''}${it.kind=='obl'?`<button class="chip" onclick="bondRatesDlg('${it.id}')">📅 Oprocentowanie</button>`:''}<button class="chip" onclick="editInst('${it.id}')">⋯</button></div></div>`}).join('');
  if(!L.length)h+=catsEmpty('Dodaj ETF-y, akcje, obligacje, złoto, krypto albo lokaty. Aplikacja policzy zysk i kwotę „na rękę”.',1,'lupa');
  h+=`<button class="btn dark" onclick="editInst(null,'${a.id}')">+ Dodaj instrument</button>
    <details class="more mini" style="padding:0 4px"><summary>Jak to liczę? więcej ›</summary>Ceny z symbolem i fundusze pobiera automat w dni robocze; inne wpisujesz ręcznie (✎ Cena albo „📈 Aktualizuj wartości”). Obligacje i lokaty liczą się same według zasad. „Zapisz wycenę” przenosi wynik do salda konta – nie wpływa na wydatki. Na koniec miesiąca automat zapisuje wycenę sam.</details>`;
  return h}
export async function editInst(id,accId){if(guard())return;const it0=id?S.hold[id]:null,a=accById(it0?.acc||accId);if(!a)return;
  const r=await ask({title:it0?'Instrument':'Nowy instrument – '+a.name,fields:[{id:'k',label:'Rodzaj',type:'select',value:it0?.kind||'etf',options:Object.entries(IKINDS)},
    {id:'n',label:'Nazwa',value:it0?.name||'',ph:'np. MSCI World, EDO0336, Lokata 6 mies.'},{id:'t',label:'Symbol dla automatu (jak w stooq.pl)',value:it0?.ticker||'',ph:'np. IWDA.UK, VWCE.DE, CDR, AAPL.US, BTC'}],ok:'Dalej',alt:it0?'Usuń instrument':null});
  if(!r)return;
  if(r=='alt'){if(!await ask({title:'Usunąć instrument?',text:it0.name+'\nWycenę konta zapisz potem ponownie.',ok:'Usuń',danger:true}))return;merge(doc(HOLD(),id),{deleted:true});return toast('Usunięto instrument')}
  if(!r.n.trim()&&r.k!='tfi')return toast('Podaj nazwę','bad');const k=r.k,isNew=!it0,f=[];let text='';
  if(k=='obl'){const b=it0?.bond||{},off=bondOffer();f.push({id:'bt',label:'Rodzaj obligacji',type:'select',value:b.type||'EDO',options:Object.entries(BONDS).map(([c,x])=>[c,x.n])},
      {id:'b1',label:'Oprocentowanie w 1. okresie (%)',type:'decimal',value:b.first!=null?nf(b.first):'',ph:off?'puste = z serii w sprzedaży':'z potwierdzenia zakupu'},
      {id:'bm',label:'Marża ponad inflację / stopę NBP (%)',type:'decimal',value:b.margin!=null?nf(b.margin):'',ph:'puste = jak w serii w sprzedaży'});
    if(off)text='🏛️ W sprzedaży w tym miesiącu: '+Object.values(off).map(x=>`${x.series} ${nf(x.first)}%${x.margin!=null&&x.margin>0?` (potem marża ${nf(x.margin)}%)`:''}`).join(' · ')}
  else if(k=='tfi'){const L=fundList();f.push({id:'fd',label:'Fundusz',type:'select',value:it0?.fund?.id&&L.some(x=>x[0]==it0.fund.id)?it0.fund.id:it0?.fund?'url':'',options:[['','— wybierz fundusz —'],...fundGroups(L),['url','Inny fundusz – wkleję adres z analizy.pl']]},
      {id:'fu',label:'Adres strony funduszu na analizy.pl (tylko „Inny fundusz”)',value:it0?.fund?.path&&!L.some(x=>x[0]==it0.fund.id)?'https://www.analizy.pl/'+it0.fund.path:'',ph:'https://www.analizy.pl/fundusze-…'});
    text=L.length?'Wybierz fundusz z listy PPK. Wartość jednostki automat pobiera w każdy dzień roboczy wieczorem.':'Lista funduszy PPK pojawi się po pierwszym działaniu automatu (dzień roboczy wieczorem). Na razie możesz wkleić adres strony funduszu z analizy.pl albo dodać fundusz później.'}
  else if(k=='lokata')f.push({id:'dr',label:'Oprocentowanie roczne (%)',type:'decimal',value:it0?.dep?.rate!=null?nf(it0.dep.rate):''},{id:'dm',label:'Na ile miesięcy',type:'int',value:it0?.dep?.months||6});
  else if(k!='tfi')f.push({id:'c',label:'Waluta notowań',type:'select',value:it0?.cur||CUR(a),options:CUR_OPTS});
  if(isNew){f.push({id:'ld',label:k=='lokata'?'Data założenia':k=='tfi'?'Stan na dzień':'Data zakupu',type:'date',value:td()});
    if(k=='obl')f.push({id:'lq',label:'Liczba obligacji (1 szt. = 100 zł)',type:'int',value:''});
    else if(k=='tfi')f.push({id:'lq',label:'Liczba jednostek (z aplikacji PPK / TFI)',type:'decimal',value:''},{id:'lp',label:'Wartość jednostki (zł)',type:'decimal',value:'',ph:'puste = pobierze automat'});
    else if(k=='lokata')f.push({id:'lp',label:`Kwota (${curSym(CUR(a))})`,type:'decimal',value:''});
    else f.push({id:'lq',label:'Liczba sztuk / jednostek / gramów',type:'decimal',value:''},{id:'lp',label:'Cena zakupu za sztukę (w walucie notowań)',type:'decimal',value:''},{id:'lx',label:'Kurs waluty przy zakupie (puste = 1)',type:'decimal',value:'',ph:'np. 3,9850 – tylko gdy waluta inna niż konta'},{id:'lf',label:`Prowizja (${curSym(CUR(a))})`,type:'decimal',value:''})}
  const r2=await ask({title:r.n.trim()||IKINDS[k],text,fields:f,ok:isNew?'Dodaj':'Zapisz'});if(!r2)return;
  const body={acc:a.id,kind:k,name:r.n.trim(),ticker:k=='tfi'?'':r.t.trim(),deleted:false,ts:Date.now()};
  if(k=='obl'){const o=bondOffer()?.[r2.bt],now=isNew&&r2.ld?.slice(0,7)==td().slice(0,7);
    const first=r2.b1.trim()?pn(r2.b1):now&&o?o.first:0,mg=r2.bm.trim()?pn(r2.bm):now&&o&&o.margin!=null?o.margin:null;
    body.bond={...(it0?.bond||{}),type:r2.bt,first,...(mg!=null?{margin:mg}:{})};if(!r2.bm.trim()&&mg==null)delete body.bond.margin;body.cur=CUR(a);
    if(!first)toast('Wpisz oprocentowanie 1. okresu z potwierdzenia zakupu – bez niego wartość nie urośnie','bad')}
  else if(k=='tfi'){let fu=null;if(r2.fd&&r2.fd!='url'){const x=fundList().find(x=>x[0]==r2.fd);fu={id:r2.fd,path:`fundusze-ppk/${r2.fd}/${x?.[1]||'x'}`,name:fundName(x?.[1])}}
    else if(r2.fd=='url'){fu=fundFromUrl(r2.fu);if(!fu)return toast('Wklej adres strony funduszu z analizy.pl','bad');fu.name=fundName(fu.path.split('/')[2])}
    if(fu)body.fund=fu;else if(it0?.fund)body.fund=it0.fund;if(!body.name)body.name=fu?.name||'Fundusz';body.cur=CUR(a)}
  else if(k=='lokata'){body.dep={rate:pn(r2.dr),months:Math.max(1,Math.round(pn(r2.dm))||6)};body.cur=CUR(a)}
  else body.cur=r2.c;
  const iid=id||'h'+rid();
  if(isNew){if(!isDate(r2.ld))return toast('Wybierz datę','bad');const lot={date:r2.ld,kind:'buy',fee:0};
    if(k=='obl'){lot.qty=Math.round(pn(r2.lq));lot.price=100}else if(k=='tfi'){lot.qty=pn(r2.lq);lot.price=pn(r2.lp)||mkt()?.funds?.[body.fund?.id]?.p||0;lot.fx=1;if(lot.price){body.price=lot.price;body.priceDate=r2.ld}
      if(!lot.price)return toast('Podaj wartość jednostki (automat jeszcze jej nie zna)','bad')}else if(k=='lokata'){lot.qty=1;lot.price=pn(r2.lp)}else{lot.qty=pn(r2.lq);lot.price=pn(r2.lp);lot.fx=pn(r2.lx)||1;lot.fee=gr(r2.lf);body.price=lot.price;body.fxNow=lot.fx;body.priceDate=r2.ld}
    if(!(lot.qty>0)||!(lot.price>0))return toast('Podaj liczbę i cenę','bad');body.lots={['l'+rid()]:lot}}
  merge(doc(HOLD(),iid),body);toast(isNew?'Dodano instrument':'Zapisano instrument')}
export async function addLot(id,sell){if(guard())return;const it=S.hold[id],a=accById(it?.acc);if(!a)return;const k=it.kind,fx=it.cur&&it.cur!=CUR(a);
  const f=[{id:'d',label:'Data',type:'date',value:td()}];
  if(k=='obl')f.push({id:'q',label:'Liczba obligacji (1 szt. = 100 zł)',type:'int',value:''});
  else if(k=='lokata')f.push({id:'p',label:`Kwota (${curSym(CUR(a))})`,type:'decimal',value:''});
  else{f.push({id:'q',label:'Liczba sztuk',type:'decimal',value:''},{id:'p',label:`Cena za sztukę (${curSym(it.cur||CUR(a))})`,type:'decimal',value:it.price?nf(it.price):''});
    if(fx)f.push({id:'x',label:'Kurs waluty',type:'decimal',value:it.fxNow?nf(it.fxNow,4):''});f.push({id:'f',label:`Prowizja (${curSym(CUR(a))})`,type:'decimal',value:''})}
  const r=await ask({title:(sell?'Sprzedaż: ':k=='lokata'?'Nowa lokata: ':'Zakup: ')+it.name,fields:f,ok:'Zapisz'});if(!r)return;
  if(!isDate(r.d))return toast('Wybierz datę','bad');
  const lot={date:r.d,kind:sell?'sell':'buy',qty:k=='lokata'?1:pn(r.q),price:k=='obl'?100:pn(r.p),fx:fx?pn(r.x)||1:1,fee:gr(r.f||'')};
  if(!(lot.qty>0)||!(lot.price>0))return toast('Podaj liczbę i cenę','bad');
  if(sell&&lot.qty>position(it).qty+1e-9)return toast('Nie masz tylu sztuk','bad');
  merge(doc(HOLD(),id),{lots:{['l'+rid()]:lot},...(k!='obl'&&k!='lokata'?{price:lot.price,fxNow:lot.fx,priceDate:lot.date}:{})});toast(sell?'Zapisano sprzedaż':'Zapisano zakup')}
export async function setPrice(id){if(guard())return;const it=S.hold[id],a=accById(it?.acc);if(!a)return;const fx=it.cur&&it.cur!=CUR(a);
  const r=await ask({title:'Cena: '+it.name,text:'Wpisz aktualną cenę z aplikacji brokera.',fields:[{id:'p',label:`Cena za sztukę (${curSym(it.cur||CUR(a))})`,type:'decimal',value:it.price?nf(it.price):''},...(fx?[{id:'x',label:`Kurs ${it.cur} (${curSym(CUR(a))})`,type:'decimal',value:it.fxNow?nf(it.fxNow,4):''}]:[])],ok:'Zapisz'});
  if(!r)return;const p=pn(r.p),x=fx?pn(r.x)||it.fxNow||1:1;if(!(p>0))return toast('Podaj cenę','bad');
  merge(doc(HOLD(),id),{price:p,fxNow:x,priceDate:td(),hist:{[td()]:{p,fx:x}}});toast('Zapisano cenę')}
/* bonds on sale this month (the automat reads obligacjeskarbowe.pl) */
export const bondOffer=()=>{const b=mkt()?.bonds;if(!b?.date||b.date.slice(0,7)!=td().slice(0,7))return null;const{date,...r}=b;return Object.keys(r).length?r:null};
/* PPK funds to choose from: [[id, slug]] sorted by name; grouped by institution for the select */
export const fundList=()=>Object.entries(S.market?.funds?.list||{}).sort((a,b)=>a[1].localeCompare(b[1]));
export const fundGroups=L=>{const g={};L.forEach(([id,s])=>(g[fundHouse(s)]=g[fundHouse(s)]||[]).push([id,fundName(s)]));return Object.entries(g).map(([n,items])=>({group:n,items}))};
/* PPK / TFI: the number of units now (from the fund's app); the difference becomes a purchase (or a sale) at today's unit value */
export async function setUnits(id){if(guard())return;const it=S.hold[id],a=accById(it?.acc);if(!a)return;const p0=position(it),q=mkt()?.funds?.[it.fund?.id];
  const r=await ask({title:'Jednostki: '+it.name,text:'Wpisz liczbę jednostek z aplikacji PPK / TFI. Nowe wpłaty kupują kolejne jednostki – wystarczy poprawiać to raz na jakiś czas.',
    fields:[{id:'q',label:'Liczba jednostek teraz',type:'decimal',value:nf(p0.qty,4)},{id:'p',label:'Wartość jednostki (zł)',type:'decimal',value:nf(q?.p??it.price??p0.avgPx)}],ok:'Zapisz'});if(!r)return;
  const qty=pn(r.q),p=pn(r.p),d=Math.round((qty-p0.qty)*1e6)/1e6;if(!(p>0))return toast('Podaj wartość jednostki','bad');if(qty<0)return toast('Liczba jednostek nie może być ujemna','bad');
  if(!d){merge(doc(HOLD(),id),{price:p,priceDate:td()});return toast('Zapisano wartość jednostki')}
  merge(doc(HOLD(),id),{lots:{['l'+rid()]:{date:td(),kind:d>0?'buy':'sell',qty:Math.abs(d),price:p,fx:1,fee:0,units:true}},price:p,priceDate:td()});toast(`Zapisano: ${nf(qty,4)} j.u.`)}
/* interest of every year of a bond: where it comes from; started years can be corrected by hand (empty = automatic) */
export async function bondRatesDlg(id){if(guard())return;const it=S.hold[id];if(!it)return;const b=it.bond||{},start=Object.values(it.lots||{}).filter(l=>!l.deleted&&l.kind!='sell').map(l=>l.date).sort()[0];
  const Y=bondYears(b,macro(),start),today=td(),mon=ym=>ym?MN[+ym.slice(5)-1].toLowerCase()+' '+ym.slice(0,4):'';
  const why=(y,i)=>i==0?'z potwierdzenia zakupu':y.src=='manual'?'wpisane ręcznie':y.src=='gus'?`marża ${nf(y.mg)}% + inflacja ${nf(y.infl,1)}% (GUS, ${mon(y.ref)})`:y.src=='est'?`szacunek: marża ${nf(y.mg)}% + ostatnia inflacja ${nf(y.infl,1)}%`:y.src=='nbp'?`stopa NBP + marża ${nf(y.mg)}%`:'stałe';
  const fields=Y.map((y,i)=>({y,i})).filter(({y,i})=>i>0&&(!y.from||y.from<=today)).map(({y,i})=>({id:'y'+i,label:`${i+1}. rok${y.from?` (od ${y.from.split('-').reverse().join('.')})`:''} – ${why(y,i)}`,type:'decimal',value:y.src=='manual'?nf(y.r):'',ph:nf(y.r)}));
  const r=await ask({title:'📅 Oprocentowanie: '+it.name,text:Y.map((y,i)=>`${i+1}. rok: ${nf(y.r)}% – ${why(y,i)}`).join('\n')+(fields.length?'\n\nPoniżej możesz poprawić rok, który już trwa (np. według tabeli odsetkowej z obligacjeskarbowe.pl). Puste pole = liczę sam.':''),fields,ok:fields.length?'Zapisz':'OK',cancel:'Zamknij'});
  if(!r||!fields.length)return;const rates={};fields.forEach(f=>{const v=r[f.id].trim();if(v)rates[f.id.slice(1)]=pn(v)});
  w(updateDoc(doc(HOLD(),id),{'bond.rates':rates}));toast('Zapisano oprocentowanie')}
export function saveInstVal(accId){const a=accById(accId),d=instDiff(a);if(!d)return toast('Wycena jest aktualna');const u=addVal(a,d,'Wycena instrumentów');
  toast(`Zapisano wycenę: ${d>0?'+':''}${money(d,CUR(a))}`,'',{label:'Cofnij',fn:()=>putTx(u[0],u[1],{deleted:true})})}
/* one screen for the values of all investment accounts */
export function openValues(){if(guard())return;S.values=true;S.instAcc=null;window.scrollTo(0,0);render()}
export function valuesH(){const today=td(),mc=macro(),tx=liveOf(S.tx),accs=S.cfg.accs.filter(a=>a.grp=='inv'&&!a.archived);
  let h=`<button class="btn sm" style="align-self:flex-start" onclick="closeInst()">‹ Oszczędności</button><div class="worth"><div class="l">📈 Aktualizuj wartości · ${today.split('-').reverse().join('.')}</div><div class="s">Wpisz ceny i wartości z aplikacji brokerów. Puste pole = bez zmian. Różnice zapiszę jako zmianę wartości (nie wpływa na wydatki).</div></div>
    <div class="card"><h3>Do obliczeń obligacji</h3>${mkt()?.date?`<div class="mini">🤖 Automat z ${mkt().date.split('-').reverse().join('.')}${mkt().infl!=null?` · inflacja ${nf(mkt().infl,1)}% (${esc(mkt().inflPer||'')})`:''}${mkt().nbp!=null?` · stopa NBP ${nf(mkt().nbp,2)}%`:''}${Object.keys(mkt().inflH||{}).length?` · historia inflacji: ${Object.keys(mkt().inflH).length} mies. (każdy rok obligacji liczę z właściwego miesiąca)`:''}. Wpisz własną wartość tylko, gdy chcesz ją zmienić.</div>`:''}<label class="srow2"><span>Inflacja r/r (%)<small>GUS, ostatni odczyt</small></span><input class="planin" id="vInfl" value="" inputmode="decimal" placeholder="${mc.infl!=null?nf(mc.infl,1):'np. 3,5'}"></label><label class="srow2"><span>Stopa referencyjna NBP (%)</span><input class="planin" id="vNbp" value="" inputmode="decimal" placeholder="${mc.nbp!=null?nf(mc.nbp,2):'np. 4,50'}"></label></div>`;
  h+=accs.map(a=>{const L=instsOf(a.id),bal=balance(S.cfg,tx,a.id,addDays(today,1)),M=v=>money(v,CUR(a));
    return`<div class="card"><div class="r1"><h3>${esc(a.name)}</h3><span class="num mini">${M(bal)}</span></div>${L.length?L.map(it=>{const mk=it.kind!='obl'&&it.kind!='lokata',v=instValue(it,a,today,mc,mkt()),fx=it.cur&&it.cur!=CUR(a);
      return mk?`<label class="srow2"><span>${IICON[it.kind]} ${esc(it.name)}<small>${nf(v.qty,0)} szt. · cena (${curSym(it.cur)})</small></span><input class="planin" data-ip="${it.id}" placeholder="${it.price?nf(it.price):''}" inputmode="decimal" autocomplete="off"></label>${fx?`<label class="srow2"><span><small>kurs ${it.cur}</small></span><input class="planin" data-if="${it.id}" placeholder="${it.fxNow?nf(it.fxNow,4):''}" inputmode="decimal" autocomplete="off"></label>`:''}`
        :`<div class="r1 mini"><span>${IICON[it.kind]} ${esc(it.name)} – liczy się samo</span><b>${M(v.value)}</b></div>`}).join('')
      :`<label class="srow2"><span>Wartość dziś<small>z aplikacji brokera</small></span><input class="planin" data-av="${a.id}" placeholder="${f2(bal)}" inputmode="decimal" autocomplete="off"></label>`}</div>`}).join('');
  if(!accs.length)h+=catsEmpty('Nie ma jeszcze kont inwestycyjnych.',1,'lupa');
  return h+`<div class="g2"><button class="btn" onclick="closeInst()">Anuluj</button><button class="btn primary" onclick="saveValues()">Zapisz wszystko</button></div>`}
export function saveValues(){if(guard())return;const today=td(),q=s=>[...document.querySelectorAll(s)];
  const mi=$('vInfl').value.trim(),mn=$('vNbp').value.trim(),m0=macro();
  if((mi&&pn(mi)!==m0.infl)||(mn&&pn(mn)!==m0.nbp)){const m={...m0};if(mi){m.infl=pn(mi);m.inflAt=today}if(mn){m.nbp=pn(mn);m.nbpAt=today}S.hraw={...S.hraw,macro:m};merge(H,{macro:m})}
  const hold=clone(S.hold),ch=new Set();
  q('[data-ip]').forEach(el=>{if(!el.value.trim())return;const id=el.dataset.ip,p=pn(el.value);if(p>0){hold[id].price=p;ch.add(id)}});
  q('[data-if]').forEach(el=>{if(!el.value.trim())return;const id=el.dataset.if,x=pn(el.value);if(x>0){hold[id].fxNow=x;ch.add(id)}});
  ch.forEach(id=>{const it=hold[id];merge(doc(HOLD(),id),{price:it.price,fxNow:it.fxNow||1,priceDate:today,hist:{[today]:{p:it.price,fx:it.fxNow||1}}})});
  const undo=[];let n=0;
  S.cfg.accs.filter(a=>a.grp=='inv'&&!a.archived).forEach(a=>{let d=null;const el=document.querySelector(`[data-av="${a.id}"]`);
    if(el&&el.value.trim())d=gr(el.value)-balance(S.cfg,liveOf(S.tx),a.id,addDays(today,1));else d=instDiff(a,hold);
    if(d){undo.push(addVal(a,d,el?'Zmiana wartości':'Wycena instrumentów'));n++}});
  S.values=false;render();toast(n?`Zapisano wartości ${n} ${plu(n,'konta','kont','kont')}`:'Nic się nie zmieniło',n?'':'',n?{label:'Cofnij',fn:()=>undo.forEach(u=>putTx(u[0],u[1],{deleted:true}))}:null)}
/* IKE / IKZE / OKI: payments this year against the limit */
export function autoValH(){const r=mkt();if(!r?.date)return'';const L=S.cfg.accs.filter(a=>a.grp=='inv'&&!a.archived&&instsOf(a.id).length).map(a=>({a,d:instDiff(a)})).filter(x=>x.d);
  if(!L.length)return'';const sum=L.filter(x=>isP(x.a)).reduce((s,x)=>s+x.d,0);
  return`<div class="note">🤖 Automat pobrał ceny z ${r.date.split('-').reverse().join('.')}. Wycena ${L.length} ${plu(L.length,'konta','kont','kont')} zmieni się o ${sum>=0?'+':''}${zl(sum)}. <button class="btn sm primary" onclick="saveAutoVal()">Zapisz wycenę</button></div>`}
export function saveAutoVal(){if(guard())return;const undo=[];S.cfg.accs.filter(a=>a.grp=='inv'&&!a.archived).forEach(a=>{const d=instDiff(a);if(d)undo.push(addVal(a,d,'Wycena instrumentów (automat)'))});
  render();toast(`Zapisano wycenę ${undo.length} ${plu(undo.length,'konta','kont','kont')}`,'',{label:'Cofnij',fn:()=>undo.forEach(u=>putTx(u[0],u[1],{deleted:true}))})}
/* a limits proposal found by the automat – used only after a yes */
export function limitPropH(){const L=limitPropP(S.market,S.hraw);if(!L)return'';
  return`<div class="note">🛡️ ${kotki.mode=='off'?'':'<b>Bailey:</b> '}Znalazłem limity na ${L.year}: IKE ${zl0(L.ike)}, IKZE ${zl0(L.ikze)} (przy działalności ${zl0(L.ikzeB)}). Źródło: ${esc(L.src||'')}. Zaktualizować?<div class="btns" style="gap:6px;margin-top:6px"><button class="btn sm primary" onclick="acceptLimits(1)">Tak, zaktualizuj</button><button class="btn sm" onclick="acceptLimits(0)">Nie teraz</button></div></div>`}
export function acceptLimits(yes){const L=S.market?.limits;if(!L)return;if(yes){const v={ike:L.ike,ikze:L.ikze,ikzeB:L.ikzeB};S.hraw={...S.hraw,limits:{...(S.hraw?.limits||{}),[L.year]:v}};merge(H,{limits:{[L.year]:v}});toast('Zaktualizowano limity '+L.year+' ✓')}
  S.hraw={...S.hraw,limitsSeen:{...(S.hraw?.limitsSeen||{}),[L.year]:L.found}};merge(H,{limitsSeen:{[L.year]:L.found}});render()}
export function limitsH(){const y=td().slice(0,4),tx=liveOf(S.tx),over=S.hraw?.limits,mo=+td().slice(5,7);
  const L=S.cfg.accs.filter(a=>a.grp=='inv'&&!a.archived&&['ike','ikze','oki'].includes(wrapOf(a)));if(!L.length)return'';
  const rows=L.map(a=>{const w=wrapOf(a);
    if(w=='oki'){const v=balance(S.cfg,tx,a.id,addDays(td(),1)),ex=Math.max(0,v-OKI_FREE);
      return`<div class="lim"><div class="r1"><b>${esc(a.name)} <span class="curtag">OKI</span></b><span class="num">${zl(v)}</span></div><div class="gbar"><i style="width:${Math.min(100,v/OKI_FREE*100).toFixed(1)}%"></i></div><div class="mini">bez podatku do ${zl0(OKI_FREE)} średniej wartości w roku${ex?` · ponad limit ${zl(ex)} → szacunek podatku ${OKI_RATE.toString().replace('.',',')}%: ok. ${zl(Math.round(ex*OKI_RATE/100))} rocznie`:''}</div></div>`}
    const lim=limitOf(a,y,over),p=paidInYear(tx,a.id,y),left=Math.max(0,lim-p);
    return`<div class="lim"><div class="r1"><b>${esc(a.name)} <span class="curtag">${w.toUpperCase()}</span></b><span class="num">${zl(p)} <span class="mini">z ${zl0(lim)}</span></span></div><div class="gbar"><i style="width:${lim?Math.min(100,p/lim*100).toFixed(1):0}%"></i></div><div class="mini">${p>lim?'<b class="t-exp">⚠️ Wpłaty przekraczają limit – nadwyżkę trzeba wycofać</b>':`można jeszcze wpłacić ${zl(left)}`}${w=='ikze'?' · ulga w PIT':''}</div></div>`}).join('');
  const notes=(mo==12&&L.some(a=>wrapOf(a)=='ikze')?`<div class="note">🗓️ Grudzień: wpłaty na IKZE do 31.12 obniżą podatek za ${y}.</div>`:'')+(mo==1?`<div class="note">🗓️ Nowy rok – nowe limity. Sprawdź kwoty na ${y} („✎ Limity”).</div>`:'');
  return`<section class="chart"><div class="ct"><b>🛡️ Limity ${y}</b><button class="btn sm" onclick="editLimits()">✎ Limity</button></div>${notes}${rows}</section>`}
export async function editLimits(){if(guard())return;const y=td().slice(0,4),L={...(LIMITS[y]||LIMITS[Math.max(...Object.keys(LIMITS).map(Number))]),...((S.hraw?.limits||{})[y]||{})};
  const r=await ask({title:'Limity wpłat '+y,text:'Ogłasza je co roku ministerstwo (obwieszczenie MRPiPS). OKI nie ma limitu wpłat.',fields:[{id:'i',label:'IKE (zł)',type:'decimal',value:f2(L.ike)},{id:'z',label:'IKZE (zł)',type:'decimal',value:f2(L.ikze)},{id:'b',label:'IKZE przy działalności (zł)',type:'decimal',value:f2(L.ikzeB)}]});
  if(!r)return;const v={ike:gr(r.i),ikze:gr(r.z),ikzeB:gr(r.b)};S.hraw={...S.hraw,limits:{...(S.hraw?.limits||{}),[y]:v}};merge(H,{limits:{[y]:v}});render();toast('Zapisano limity')}
/* paid in vs value: one chart per currency */
export function setGain(k,v){S[k]=v;render()}
export function gainH(accs,key){if(!accs.length)return'';const R=S.gRange||'y',today=td(),from=R=='3m'?addDays(today,-92):R=='y'?addDays(today,-365):'0000',sel=S.gAcc&&accs.some(a=>a.id==S.gAcc)?accs.filter(a=>a.id==S.gAcc):accs;
  const groups={};sel.forEach(a=>(groups[CUR(a)]=groups[CUR(a)]||[]).push(a.id));const tx=liveOf(S.tx);
  const charts=Object.entries(groups).map(([cur,ids])=>{const all=flowSeries(S.cfg,tx,ids);if(!all.length)return'';
    const before=all.filter(p=>p.d<from).at(-1),pts=all.filter(p=>p.d>=from);if(before&&R!='all')pts.unshift({...before,d:from});
    if(!pts.length&&before)pts.push({...before,d:from});const last=pts.at(-1);if(last&&last.d<today)pts.push({...last,d:today});
    if(pts.length<2)return'';const gn=last.value-last.paid;
    return`<div class="mini">${Object.keys(groups).length>1?`<b>${cur}</b> · `:''}wpłacono ${money(last.paid,cur)} · wartość ${money(last.value,cur)} · <b class="${gn>=0?'t-inc':'t-exp'}">${gn>=0?'+':''}${money(gn,cur)}</b></div>`+gainSvg(pts,{money:v=>money(v,cur)})}).join('');
  if(!charts)return'';
  return`<section class="chart"><div class="ct"><b>Wpłacone a wartość</b><span class="mini">przerywana – wpłaty · fioletowa – wartość · pole: zielone zysk, różowe strata</span></div>
    <div class="frow"><select aria-label="Zakres" onchange="setGain('gRange',this.value)">${[['3m','3 miesiące'],['y','Rok'],['all','Wszystko']].map(([k,l])=>`<option value="${k}"${R==k?' selected':''}>${l}</option>`).join('')}</select><select aria-label="Konto" onchange="setGain('gAcc',this.value)"><option value="">${key}</option>${accs.map(a=>`<option value="${a.id}"${S.gAcc==a.id?' selected':''}>${esc(a.name)}</option>`).join('')}</select></div>${charts}<div class="tip mini">Dotknij wykresu, żeby zobaczyć kwoty.</div></section>`}
/* FIRE: 25 × yearly spending, progress and an estimate of the time to get there */
export function fireH(savNow,monthlySave){const tx=liveOf(S.tx),cur=td().slice(0,7),ex=[];for(let k=1;k<=12;k++){const e=agg(S.cfg,tx,addMonths(cur,-k)).exp;if(e>0)ex.push(e)}
  if(!ex.length)return'';const yearly=Math.round(ex.reduce((a,v)=>a+v,0)/ex.length*12),target=yearly*25,pc=savNow/target*100,m=fireMonths(savNow,target,Math.max(0,monthlySave));
  return`<section class="chart"><div class="ct"><b>🔥 Niezależność finansowa (FIRE)</b><span class="mini">25 × roczne wydatki (${zl0(yearly)}) – zasada 4%</span></div><div class="cush"><span class="num">${pc.toFixed(1).replace('.',',')}%</span><span>z ${zl0(target)}</span></div><div class="gbar"><i style="width:${Math.min(100,pc).toFixed(1)}%"></i></div>
    <div class="mini">Z obecnych oszczędności bezpiecznie ok. <b style="color:var(--fg)">${zl0(savNow*0.04/12)}</b> miesięcznie (4% rocznie).</div>
    <div class="mini">${monthlySave>0?(m===0?'🎉 Cel FIRE osiągnięty!':m?`Przy odkładaniu ok. ${zl0(monthlySave)}/mies. i 4% realnego zysku: ok. <b style="color:var(--fg)">${(m/12).toFixed(1).replace('.',',')} lat</b> (${+td().slice(0,4)+Math.ceil(m/12)}).`:'Przy obecnym tempie to ponad 100 lat.'):'Gdy zaczniecie odkładać co miesiąc, policzę, ile lat zostało.'} Szacunek, nie prognoza.</div></section>`}
/* 🐷 put money aside: a transfer to the person's savings account */
export function odloz(owner){const o=owner&&owner!='all'?owner:S.who,a=S.cfg.accs.find(x=>x.grp=='sav'&&!x.archived&&accOwner(x)==o&&!/poduszk/i.test(x.name))||S.cfg.accs.find(x=>x.grp=='sav'&&!x.archived);
  openTx(null,{type:'tr',to:a?.id})}
/* ---------- 📅 yearly expenses: one shared subaccount with envelopes (📌 Stałe → Roczne) ---------- */
export const years=()=>S.cfg.years||[];
export const saveYear=x=>merge(H,{yearM:{[x.id]:strip(x,years().indexOf(x))}});
export const delYearDb=id=>w(updateDoc(H,{['yearM.'+id]:deleteField()}));
export const yearAccId=()=>{const id=S.hraw?.yearAcc;return id&&accById(id)?id:null};
export function yearState(ym){return yearStateP(S.cfg,liveOf(S.tx),S.hraw,ym,td())}
export function yearLineH(){const st=yearState(td().slice(0,7));if(!st||S.ym!=td().slice(0,7))return'';
  return`<button class="alert info" onclick="goYear()"><b>📅 Wydatki roczne: ${st.left?`w tym miesiącu odłóż jeszcze ${zl(st.left)}`:'✓ w tym miesiącu odłożone'}</b><span class="mini">${st.dep?`odłożono ${zl(st.dep)} z ${zl(st.need)} · `:''}na subkoncie ${zl(st.now)}${st.soon.length?' · ⏰ wkrótce: '+st.soon.map(x=>esc(x.it.name)).join(', '):''}</span></button>`}
export function goYear(){S.tab='fix';S.fixSub='year';S.slip=null;window.scrollTo(0,0);render()}
/* 📅 Roczne i terminy: yearly expenses with money put aside (an envelope on one shared subaccount) + dates without money + warranties; one „+ Dodaj” */
export function yearH(){const ym=S.ym,st=yearState(ym),id=yearAccId();let h='';
  const sea=seasonal(S.cfg,liveOf(S.tx),td().slice(0,7)).filter(x=>!years().some(y=>y.sub==x.sub.id)).slice(0,3);
  const seaH=sea.map(x=>`<div class="note">💡 Zeszłego roku w miesiącu ${MN[x.month-1].toLowerCase()}: <b>${esc(x.sub.name)} ${zl0(x.v)}</b> – dużo więcej niż zwykle. <button class="btn sm primary" onclick="editYear(null,${esc(JSON.stringify({name:x.sub.name,amount:x.v,month:x.month,sub:x.sub.id}))})">Dodać do wydatków rocznych?</button></div>`).join('');
  h+=`<div class="r1" style="padding:0 4px"><span class="h2" style="margin:0">📅 Roczne i terminy</span><button class="btn sm dark" onclick="addTerm()">+ Dodaj</button></div>`;
  if(!years().length&&!rems().length)return h+seaH+catsEmpty('OC, ubezpieczenie mieszkania, przegląd, opony, szczepienie kotów, prezenty.<br>Z kwotą – policzę, ile odkładać co miesiąc na wspólne subkonto. Bez kwoty – tylko przypomnę.<br>Zawsze ok. 2 tygodnie przed terminem.',0,'envelope')+warrantiesH();
  if(!years().length)return h+remsH()+seaH+warrantiesH();
  h+=`<div class="h2" style="padding:0 4px">💰 Z odkładaniem</div><div class="worth wsp"><div class="l">Subkonto: ${id?esc(accN(id)):'—'} <button class="btn sm" style="padding:2px 8px" onclick="setYearAcc()">zmień</button></div><div class="v num">${zl(st?.now||0)}</div><div class="s">${st?`w tym miesiącu odłóż ${zl(st.need)}${st.dep?` · odłożono ${zl(st.dep)}`:''}`:''}</div>${st&&st.left?`<button class="btn sm primary" style="align-self:flex-start" onclick="openTx(null,{type:'tr',to:'${id}',amount:${st.left}})">🐷 Odłóż ${zl(st.left)}</button>`:''}</div>`;
  h+=`<div class="list">${(st?.list||[]).map(x=>{const it=x.it,pc=it.amount?x.fill/it.amount*100:0,dn=MN[+x.due.slice(5)-1].toLowerCase()+' '+x.due.slice(0,4);
    const dd=it.day?`${it.day} ${MNG[+x.due.slice(5)-1]} ${x.due.slice(0,4)}`:dn;
    return`<div class="acc"><div style="min-width:0;flex:1"><div class="r1"><b>${esc(it.name)}</b><b class="num">${zl(it.amount)}</b></div><div class="gbar"><i style="width:${Math.min(100,pc).toFixed(1)}%"></i></div>
      <div class="mini">${x.months<=2&&x.fill<it.amount?'⏰ ':''}termin: ${dd}${+it.every!=12?` · co ${it.every} mies.`:''} · w kopercie ${zl(x.fill)}${x.need?` · odkładaj ok. ${zl(x.need)}/mies.`:' · ✓ uzbierane'}${it.who?` · 👤 ${esc(it.who)}`:''}</div>
      <div class="btns" style="gap:6px;margin-top:6px"><button class="chip" onclick="payYear('${it.id}')">✓ Zapłacone</button><button class="chip" onclick="editYear('${it.id}')">Edytuj</button></div></div></div>`}).join('')}</div>`;
  h+=`<div class="mini" style="padding:0 4px">Pieniądze na subkoncie wypełniają koperty od najbliższego terminu. Po zapłacie odliczanie rusza od nowa. Ok. 2 tygodnie przed terminem przypomnę o zapłacie.</div>`;
  return h+remsH()+seaH+warrantiesH()}
/* a new yearly expense from a date (the shared subaccount is made the first time); every 24 months is counted from that date */
export function newYear(name,amount,date,every,sub,who=''){const ym=date.slice(0,7),body={id:'y'+rid(),name,amount,month:+date.slice(5,7),day:+date.slice(8),every,sub,who,...(12%every?{last:addMonths(ym,-every)}:{})};
  S.cfg.years=years();S.cfg.years.push(body);if(!yearAccId()){const a={id:'a'+rid(),name:'Subkonto – wydatki roczne',grp:'sub',owner:'Wspólne',open:0};S.cfg.accs.push(a);saveAcc(a);S.hraw={...S.hraw,yearAcc:a.id};merge(H,{yearAcc:a.id});toast('Założyłem wspólne subkonto na wydatki roczne')}
  render();saveYear(body);return body}
/* „+ Dodaj” in 📅 Roczne i terminy: a ready template or your own; with an amount → a yearly expense (money put aside every month),
   without → just a date to remember (also every X km for a car) */
export const TERM_PRE=[['oc','🛡️ OC samochodu',12,1],['ac','🚗 AC samochodu',12,1],['mieszk','🏠 Ubezpieczenie mieszkania',12,1],['podatek','🏛️ Podatek od nieruchomości',12,1],['prezenty','🎁 Prezenty świąteczne',12,1],
  ['przeglad','🔧 Przegląd techniczny',12,0],['opony','🛞 Wymiana opon',6,0],['serwis','🧰 Serwis / olej',12,0],['szczep','💉 Szczepienie kotów',12,0],['odrob','🐾 Odrobaczenie kotów',3,0]];
export async function addTerm(){if(guard())return;const cars=projs().filter(p=>p.kind=='car');
  const r=await ask({title:'Roczne i terminy',text:'Z kwotą – policzę, ile odkładać co miesiąc na wspólne subkonto. Bez kwoty – tylko przypomnę. Zawsze ok. 2 tygodnie przed terminem.\nJednorazowy duży zakup (np. wakacje)? Lepszy będzie 🎯 Cel w Oszczędnościach.',fields:[
    {id:'p',label:'Gotowe',type:'select',value:'',options:[['','— własne —'],...TERM_PRE.map(([k,n])=>[k,n])]},
    {id:'n',label:'Nazwa (gdy własne)',value:'',ph:'np. Ubezpieczenie na życie'},
    {id:'a',label:'Kwota (zł, opcjonalnie)',type:'decimal',value:'',ph:'puste = samo przypomnienie'},
    {id:'d',label:'Najbliższy termin',type:'date',value:''},
    {id:'e',label:'Powtarzaj',type:'select',value:'',options:[['','Według gotowego (zwykle co rok)'],['0','Jednorazowo'],['1','Co miesiąc'],['3','Co 3 miesiące'],['6','Co pół roku'],['12','Co rok'],['24','Co 2 lata']]},
    {id:'s',label:'Pozycja budżetu (gdy jest kwota)',type:'select',value:'',options:[['','— wybierz —'],...subOpts('exp')]},
    ...(cars.length?[{id:'c',label:'Pojazd',type:'select',value:'',options:[['','— nie dotyczy —'],...cars.map(p=>[p.id,p.name])]},{id:'k',label:'Albo co ile km (np. serwis)',type:'int',value:''}]:[]),
    {id:'wh',label:'👥 Dotyczy – komu przypominać',type:'select',value:'',options:[['','Wspólne – oboje'],['Mati','Mati'],['Wercia','Wercia']]},
    {id:'t',label:'Notatka',value:''}],ok:'Dodaj'});
  if(!r)return;const pre=TERM_PRE.find(x=>x[0]==r.p),name=r.n.trim()||(pre?pre[1]:''),every=r.e!==''?+r.e:pre?pre[2]:12,amount=gr(r.a),km=Math.round(pnum(r.k||''))||0;
  if(!name)return toast('Podaj nazwę albo wybierz gotowe','bad');
  if(amount>0){if(!isDate(r.d))return toast('Podaj najbliższy termin płatności','bad');if(!every)return toast('Wydatek z kwotą musi się powtarzać – jednorazowy zakup zaplanuj jako 🎯 Cel','bad');if(km)return toast('Przy „co ile km” zostaw kwotę pustą','bad');
    if(!r.s)return toast('Wybierz pozycję budżetu – tam trafi wydatek','bad');
    newYear(name,amount,r.d,every,r.s,r.wh||'');return toast('Dodano: '+name+' 📅')}
  if(!isDate(r.d)&&!km)return toast('Podaj termin albo liczbę km','bad');
  const car=r.c?projs().find(p=>p.id==r.c):null,body={id:'r'+rid(),name,next:isDate(r.d)?r.d:'',every,proj:r.c||'',km,note:r.t.trim(),who:r.wh||'',lastOdo:car&&km?carStats(S.cfg,liveOf(S.tx),car.id,car.odo0).odo:0};
  S.cfg.rems=rems();S.cfg.rems.push(body);render();saveRem(body);toast('Dodano przypomnienie 🔔')}
export async function setYearAcc(){if(guard())return;const subs=S.cfg.accs.filter(a=>(a.grp=='sub'||a.grp=='sav')&&!a.archived);
  const r=await ask({title:'Subkonto na wydatki roczne',fields:[{id:'a',label:'Konto',type:'select',value:yearAccId()||'',options:[['new','+ Nowe: Subkonto – wydatki roczne'],...subs.map(a=>[a.id,a.name])]}]});if(!r)return;
  let id=r.a;if(id=='new'){const a={id:'a'+rid(),name:'Subkonto – wydatki roczne',grp:'sub',owner:'Wspólne',open:0};S.cfg.accs.push(a);saveAcc(a);id=a.id}
  S.hraw={...S.hraw,yearAcc:id};merge(H,{yearAcc:id});render()}
export async function editYear(id,pre){if(guard())return;const y0=id?years().find(x=>x.id==id):null;pre=pre||{};
  const r=await ask({title:y0?'Wydatek roczny':'Nowy wydatek roczny',text:y0?'':'Co roku (albo co kilka miesięcy) – policzę, ile odkładać co miesiąc na wspólne subkonto. Jednorazowy duży zakup? Lepszy 🎯 Cel w Oszczędnościach.',fields:[{id:'n',label:'Nazwa',value:y0?.name||pre.name||'',ph:'np. OC samochodu, Prezenty świąteczne'},{id:'a',label:'Kwota (zł)',type:'decimal',value:y0?f2(y0.amount):pre.amount?f2(pre.amount):''},
    {id:'m',label:'Miesiąc płatności',type:'select',value:String(y0?.month||pre.month||+td().slice(5,7)),options:MN.map((n,i)=>[String(i+1),n])},
    {id:'dy',label:'Dzień płatności (1–31, opcjonalnie)',type:'int',value:y0?.day||'',ph:'przypomnę ok. 2 tygodnie wcześniej'},
    {id:'e',label:'Jak często',type:'select',value:String(y0?.every||12),options:[['12','Co rok'],['6','Co pół roku'],['3','Co kwartał'],['24','Co 2 lata']]},
    {id:'s',label:'Pozycja budżetu',type:'select',value:y0?.sub||pre.sub||'',options:[['','— wybierz —'],...subOpts('exp')]},
    {id:'wh',label:'👥 Dotyczy – komu przypominać',type:'select',value:y0?.who||pre.who||'',options:[['','Wspólne – oboje'],['Mati','Mati'],['Wercia','Wercia']]}],ok:y0?'Zapisz':'Dodaj',alt:y0?'Usuń':null});
  if(!r)return;if(r=='alt'){S.cfg.years=years().filter(x=>x!==y0);render();delYearDb(y0.id);return toast('Usunięto')}
  const amount=gr(r.a);if(!r.n.trim()||amount<=0)return toast('Podaj nazwę i kwotę','bad');if(!r.s)return toast('Wybierz pozycję budżetu','bad');
  const dy=Math.round(pnum(r.dy||''))||0,body={id:y0?.id||'y'+rid(),name:r.n.trim(),amount,month:+r.m,day:dy>=1&&dy<=31?dy:0,every:+r.e,sub:r.s,who:r.wh||'',...(y0?.last?{last:y0.last}:{})};
  S.cfg.years=years();let x=y0;if(x)Object.assign(x,body);else{x=body;S.cfg.years.push(x)}
  if(!yearAccId()){const a={id:'a'+rid(),name:'Subkonto – wydatki roczne',grp:'sub',owner:'Wspólne',open:0};S.cfg.accs.push(a);saveAcc(a);S.hraw={...S.hraw,yearAcc:a.id};merge(H,{yearAcc:a.id});toast('Założyłem wspólne subkonto na wydatki roczne')}
  render();saveYear(x)}
/* 📅 paid: the next date counts from the due month closest to the payment (paid early or a little late – the same term) */
export function markYearPaid(it,date){const ym=date.slice(0,7),due=yearDueNear(it,ym)||yearDue(it,ym);it.last=due;saveYear(it);render();return due}
export async function payYear(id){if(guard())return;const it=years().find(x=>x.id==id);if(!it)return;
  /* already typed through ＋ (the same position, a similar amount, the last 2 months, not linked to anything) → link that entry instead of a second expense */
  {const from=addDays(td(),-62),tw=liveOf(S.tx).filter(t=>t.type=='exp'&&t.sub==it.sub&&!t.yearId&&!t.fixedId&&!t.slipOf&&!t.roundOf&&t.date>=from&&Math.abs(t.amount-it.amount)<=it.amount*.25).sort((a,b)=>b.date.localeCompare(a.date))[0];
   if(tw){const r=await ask({title:'Ten wydatek już jest wpisany?',text:`W Rejestrze jest ${tw.note?'„'+tw.note+'” ':''}${zl(tw.amount)} z ${tw.date.split('-').reverse().join('.')}. Jeśli to zapłata za „${it.name}”, połączę ten wpis – bez drugiego wydatku.`,ok:'Połącz z tym wpisem',cancel:'Anuluj',alt:'To inny – wpisz nową zapłatę'});
     if(!r)return;if(r!=='alt'){if(await putTx(tw.date.slice(0,7),tw.id,{yearId:id})){const due=markYearPaid(it,tw.date);toast('Zapłacone: '+it.name+' ✓ – kolejny termin: '+MN[+yearDue(it,due).slice(5)-1].toLowerCase())}return}}}
  const r=await ask({title:'Zapłacone: '+it.name,fields:[{id:'a',label:'Kwota (zł)',type:'decimal',value:f2(it.amount)},{id:'d',label:'Data',type:'date',value:td()},{id:'c',label:'Z konta',type:'select',value:yearAccId()||'',options:accOpts()}],ok:'Zapisz'});
  if(!r)return;const amt=gr(r.a);if(amt<=0||!isDate(r.d))return toast('Podaj kwotę i datę','bad');
  if(await putTx(r.d.slice(0,7),'t'+rid(),{type:'exp',amount:amt,date:r.d,sub:it.sub,acc:r.c,to:'',who:S.who,note:'📅 '+it.name,yearId:id,deleted:false,ts:Date.now()})){
    const due=markYearPaid(it,r.d);toast('Zapłacone: '+it.name+' ✓ – kolejny termin: '+MN[+yearDue(it,due).slice(5)-1].toLowerCase())}}/* 💰 interest: book what the bank added (the estimate filled in – correct it from the statement); one id per account and period, so two phones never book it twice */
export async function bookInt(accId,key){if(guard())return;const a=accById(accId);const I=a&&intOf(a);if(!I)return;const P=intPeriod(I,key),tx=liveOf(S.tx);
  const c=intCalc(S.cfg,tx,a,P.from,P.to,balance),self=intTax(a)=='self',id='in'+key.replace('-','')+accId;
  const r=await ask({title:'💰 Odsetki: '+a.name,text:`Szacunek za ${P.from.split('-').reverse().join('.')}–${P.to.split('-').reverse().join('.')}: ${money(c.book,CUR(a))}${self?' (bez podatku – podatek 19% ≈ '+money(c.tax,CUR(a))+' rozliczysz w PIT-38)':intTax(a)=='bank'?` (przed podatkiem ${money(c.gross,CUR(a))}, podatek ${money(c.tax,CUR(a))})`:''}.\nJeśli w banku jest inna kwota, popraw ją.`,
    fields:[{id:'a',label:`Kwota z banku (${curSym(CUR(a))})`,type:'decimal',value:f2(c.book)},{id:'d',label:'Data',type:'date',value:P.to<=td()?P.to:td()}],ok:'Zapisz odsetki'});
  if(!r)return;const v=Math.round((pnum(r.a)||0)*100),d=isDate(r.d)?r.d:td();if(v<=0)return toast('Podaj kwotę odsetek','bad');
  if(await putTx(d.slice(0,7),id,{type:'adj',val:true,int:true,intP:key,amount:v,date:d,sub:'',acc:a.id,to:'',who:accOwner(a)=='Wspólne'?S.who:accOwner(a),note:'💰 odsetki '+key,deleted:false,ts:Date.now()}))toast('Zapisano odsetki: '+money(v,CUR(a))+' 💰')}
/* the line under an account: its rate and about how much a month */
export function intMini(a,tx){const I=intOf(a);if(!I)return'';const b=balance(S.cfg,tx,a.id,addDays(td(),1)),m=intMonthly(a,b,td());
  return`<div class="mini">💰 ${esc(intLabel(I,td()))}${m>0?` · ok. ${money(m,CUR(a))}/mies.${intTax(a)=='bank'?' na rękę':''}`:''}</div>`}
/* Oszczędności: interest of the year – booked and about how much more a month */
export function intCardH(owner){const tx=liveOf(S.tx),y=td().slice(0,4),L=S.cfg.accs.filter(a=>!a.archived&&intOf(a)&&(!owner||accOwner(a)==owner));
  const cand=S.cfg.accs.filter(a=>!a.archived&&(a.grp=='sav'||a.grp=='sub')&&!intOf(a)&&(!owner||accOwner(a)==owner));
  if(!L.length)return cand.length?`<div class="note">💰 Konta oszczędnościowe mają oprocentowanie? Wpisz je przyciskiem „💰 Oprocentowanie” przy koncie, a policzę odsetki i przypomnę o nich.</div>`:'';
  const got=a=>tx.filter(t=>t.int&&t.acc===a.id&&t.date.startsWith(y)).reduce((x,t)=>x+t.amount,0),sum=L.filter(isP).reduce((x,a)=>x+got(a),0),mon=L.filter(isP).reduce((x,a)=>x+intMonthly(a,balance(S.cfg,tx,a.id,addDays(td(),1)),td()),0);
  return`<section class="chart"><div class="ct"><b>💰 Odsetki z kont ${y}</b><span class="mini">wpisane w tym roku · szacunek miesięczny z dzisiejszego salda</span></div>
    <div class="kpis" style="gap:8px"><div class="kpi k-em"><div class="l">Wpisane w ${y}</div><div class="v num">${zl(sum)}</div></div><div class="kpi k-sk"><div class="l">Ok. miesięcznie</div><div class="v num">${zl(mon)}</div><div class="s">do końca roku ok. ${zl0(mon*(12-+td().slice(5,7))+sum)}</div></div></div>
    ${L.map(a=>`<div class="r1"><span><b>${esc(a.name)}</b>${intMini(a,tx)}</span><button class="btn sm" onclick="editInt('${a.id}')">Zmień</button></div>`).join('')}
    <div class="mini">Odsetki to zysk – nie liczą się do „odłożonych”, tak jak zmiana kursów inwestycji.</div></section>`}
