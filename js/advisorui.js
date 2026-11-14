/* 🧭 Doradca – screens (D1a): 🥧 „Z czego składa się majątek” in 💰 Majątek → Oszczędności (groups → classes → instruments and accounts,
   tap = change the class), 🔎 the analysis of held funds and the list of known ETFs. Calculations in advisor.js. */
import {doc} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {ANK,ANK_SEC,ankList,ankDone,planP,bandOf,jointPlan,crisisP,devP,diagP,PLAN_G,AGRP,AGRP_ORDER,RISKS,COV,ETFS,ETF_AT,REAL_USE,realP,allocP,clsAll,clsOf,accClsOf,etfCheck,etfDup,etfOf,etfSym,guessCls} from './advisor.js';
import {donutSvg} from './charts.js';
import {liveOf,ownerOf,agg,balance} from './logic.js';
import {youngUntil} from './pay.js';
import {debtStateP} from './today.js';
import {goalAlloc} from './actions.js';
import {kotki} from './guide.js';
import {scene} from './cats.js';
import {wrapOf} from './inv.js';
import {esc,rid,td,zl0,dmy,pg,addDays,addMonths} from './util.js';
import {S,ask,toast,H,HOLD,merge,saveAcc,guard,infoH,isP} from './core.js';
import {macro,mkt} from './savings.js';
import {render} from './app.js';
import {use} from './usage.js';

const custom=()=>S.hraw?.assetCls||{};
const pct=(v,t)=>t?(v/t*100).toFixed(1).replace('.',',')+'%':'—';
/* class colour: an own class has its hue, a built-in one a shade of its group colour */
function clsCol(c,i){const k=clsAll(custom())[c];if(k?.hue!=null)return`hsl(${k.hue} 55% 74%)`;const g=AGRP[k?.g||'todo'].c;if(i==0)return g;
  return g.replace(/(\d+)% (\d+)%\)/,(m,s,l)=>`${s}% ${Math.min(90,+l+((i%2?1:-1)*Math.ceil(i/2)*6))}%)`)}
const assets=()=>S.hraw?.assetM||{};
const ownF=owner=>owner&&owner!='all'?owner:null;
export const allocNow=owner=>allocP(S.cfg,liveOf(S.tx),S.hold,td(),macro(),mkt(),{owner:ownF(owner),custom:custom(),assets:assets(),debts:S.debts});
export const realNow=owner=>realP(assets(),S.debts,liveOf(S.tx),td(),{owner:ownF(owner),custom:custom()});
export function advGrp(g){S.advG=g||null;render()}
const btnsH=`<div class="g2"><button class="btn sm" onclick="editAsset(null,1)">🏠 ＋ Nieruchomość</button><button class="btn sm" onclick="editAsset(null,0)">✨ ＋ Inne aktywo</button></div>`;
const grpRows=A=>A.groups.map(x=>`<button class="arow" onclick="advGrp('${x.g}')"><i style="background:${AGRP[x.g].c}"></i><span class="an">${AGRP[x.g].i} ${esc(AGRP[x.g].n)}</span><span class="num">${zl0(x.v)}</span><em class="num">${pct(x.v,A.total)}</em><span class="ar">›</span></button>`).join('');
const homeH=R=>R.home.value?`<button class="arow asub" onclick="advGrp('real')"><span class="an">🏡 Nasz dom – nie zarabia, poza proporcjami</span><span class="num">${zl0(R.home.net)}</span><span class="ar">›</span></button>${R.home.debt?`<div class="mini">wartość ${zl0(R.home.value)} − kredyt ${zl0(R.home.debt)}</div>`:''}`:'';

/* 🥧 the wheel card; owner = the Oszczędności tab (all / Mati / Wercia / Wspólne); levels: top (🏠 / 📈 when there is real estate, else the groups) → 'real' / 'assets' → a group */
export function allocH(owner){const A=allocNow(owner),R=realNow(owner),all=clsAll(custom()),hasReal=R.list.length>0;
  let lvl=S.advG;if(lvl&&lvl!='real'&&lvl!='assets'&&!A.groups.some(x=>x.g==lvl))lvl=null;if(lvl=='real'&&!hasReal)lvl=null;if(lvl=='assets'&&!hasReal)lvl=null;
  const who=ownF(owner);let h=`<section class="chart alloc"><div class="ct"><b>🥧 Z czego składa się majątek</b><span class="mini">${who?esc(who)+(who!='Wspólne'?' (z udziałem we wspólnych nieruchomościach i aktywach)':''):'razem'} · wycena na dziś · bez PPK</span></div>`;
  if(!A.rows.length&&!hasReal)return h+`<div class="mini">Gdy na kontach oszczędnościowych i inwestycyjnych będą pieniądze, zobaczysz tu, z czego składa się majątek.</div>${btnsH}</section>`;
  const todo=A.rows.filter(r=>r.cls=='todo'),old=[...A.rows.filter(r=>r.old),...R.list.filter(r=>r.old)];
  if(!lvl&&hasReal){const tot=R.work.net+A.total,segs=[{l:'🏠 Nieruchomości (netto)',v:Math.max(0,R.work.net),c:AGRP.real.c},{l:'📈 Aktywa',v:A.total,c:AGRP.stock.c}].filter(x=>x.v>0);
    h+=`<div class="dwrap">${donutSvg(segs,zl0(tot),'pracuje')}<div class="arows">
      ${R.work.value?`<button class="arow" onclick="advGrp('real')"><i style="background:${AGRP.real.c}"></i><span class="an">🏠 Nieruchomości</span><span class="num">${zl0(R.work.net)}</span><em class="num">${pct(Math.max(0,R.work.net),tot)}</em><span class="ar">›</span></button>`:''}
      <button class="arow" onclick="advGrp('assets')"><i style="background:${AGRP.stock.c}"></i><span class="an">📈 Aktywa</span><span class="num">${zl0(A.total)}</span><em class="num">${pct(A.total,tot)}</em><span class="ar">›</span></button>${homeH(R)}</div></div>
      <div class="mini">Razem z domem: <b style="color:var(--fg)">${zl0(tot+R.home.net)}</b>. Proporcje liczę z tego, co pracuje – bez mieszkania, w którym mieszkacie.</div>`;
    const P=planFor(owner);if(P?.real!=null&&tot>0){const now=Math.max(0,R.work.net)/tot*100,lo=Math.max(0,P.real-10),hi=Math.min(100,P.real+10);
      h+=`<div class="mini">🎯 Nieruchomości ${now.toFixed(0)}% · plan ${lo}–${hi}%${now<lo?' – poniżej planu (zakup podsuną kotki w etapie celów, gdy Was stać)':now>hi?' – ponad plan: nowe pieniądze kierujcie do aktywów, mieszkania nie sprzedajemy':' ✓'}</div>`}}
  else if(lvl=='real'){h+=`<button class="btn sm" style="align-self:flex-start" onclick="advGrp()">‹ Wróć</button><div class="r1"><b>🏠 Nieruchomości</b><span class="num">netto ${zl0(R.work.net+R.home.net)}</span></div>`;
    h+=R.list.map(x=>`<button class="arow asub areal" onclick="editAsset('${x.id}')"><span class="an">${all[x.cls].i} ${esc(x.name)}<small>${x.home?'🏡 mieszkamy – nie zarabia':REAL_USE[x.use]||esc(all[x.cls].n)}${x.rent?' · czynsz '+zl0(x.rent)+'/mies.':''}${x.share<1?' · Twój udział '+Math.round(x.share*100)+'%':''}<br>wartość ${zl0(x.value)}${x.debt?' − kredyt '+zl0(x.debt):''}${x.valAt?' · wycena z '+dmy(x.valAt):''}</small></span><span class="num">${zl0(x.net)}</span><span class="ar">✎</span></button>`).join('')}
  else if(!lvl||lvl=='assets'){const segs=A.groups.map(x=>({l:AGRP[x.g].n,v:x.v,c:AGRP[x.g].c}));
    if(lvl)h+=`<button class="btn sm" style="align-self:flex-start" onclick="advGrp()">‹ Wróć</button><div class="r1"><b>📈 Aktywa</b><span class="num">${zl0(A.total)}</span></div>`;
    h+=A.rows.length?`<div class="dwrap">${donutSvg(segs,zl0(A.total),'razem')}<div class="arows">${grpRows(A)}</div></div>`:'<div class="mini">Brak aktywów poza nieruchomościami.</div>';
    const P=planFor(owner);if(P&&A.rows.length)h+=planBarsH(A,P);else if(!P&&A.rows.length)h+=`<div class="mini">🎯 Widełki planu pojawią się po ankiecie doradcy (karta „🧭 Doradca” wyżej).</div>`}
  else{const g=A.groups.find(x=>x.g==lvl),segs=g.cls.map((k,i)=>({l:all[k.c].n,v:k.v,c:clsCol(k.c,i)}));
    h+=`<button class="btn sm" style="align-self:flex-start" onclick="advGrp('${hasReal?'assets':''}')">‹ Wróć</button><div class="r1"><b>${AGRP[g.g].i} ${esc(AGRP[g.g].n)}</b><span class="num">${zl0(g.v)} · ${pct(g.v,A.total)} aktywów</span></div>
      <div class="dwrap">${donutSvg(segs,zl0(g.v),AGRP[g.g].n.toLowerCase())}<div class="arows">${g.cls.map((k,i)=>`<div class="acls"><div class="r1"><span class="an"><i style="background:${clsCol(k.c,i)}"></i>${all[k.c].i} ${esc(all[k.c].n)}</span><span class="num">${zl0(k.v)} <em>${pct(k.v,g.v)}</em></span></div>
        ${k.rows.map(r=>`<button class="arow asub" onclick="${r.kind=='x'?`editAsset('${r.id}')`:`pickCls('${r.key}')`}"><span class="an">${r.kind=='h'?'📊':r.kind=='x'?'✨':'🏦'} ${esc(r.name)}${r.kind=='h'?` <small>${esc(r.accName)}</small>`:''}</span><span class="num">${zl0(r.v)}</span><span class="ar">✎</span></button>`).join('')}</div>`).join('')}</div></div>
      <div class="mini">Stuknij pozycję, żeby zmienić jej klasę (np. gdy fundusz to coś innego, niż podpowiedziałem).</div>`}
  if(todo.length)h+=`<div class="note">🐾 Kotki pytają: co to za ${todo.length>1?'fundusze':'fundusz'}? ${todo.map(r=>`<button class="chip" onclick="${r.kind=='x'?`editAsset('${r.id}')`:`pickCls('${r.key}')`}">❓ ${esc(r.name)}</button>`).join(' ')}</div>`;
  if(old.length)h+=`<div class="mini">🐾 Stara wycena: ${old.map(r=>`<button class="chip" onclick="editAsset('${r.id}')">${esc(r.name)}</button>`).join(' ')} – stuknij i wpisz aktualną wartość.</div>`;
  if(A.neg.length)h+=`<div class="mini t-exp">⚠️ ${esc(A.neg.join(', '))}: instrumenty są warte więcej niż saldo konta – sprawdź saldo albo zakupy (gotówki liczę 0 zł).</div>`;
  if(A.skipped.length)h+=`<div class="mini">Bez kursu waluty (pominięte): ${esc(A.skipped.map(x=>x.name+' ('+x.cur+')').join(', '))}.</div>`;
  h+=btnsH+infoH('alloc',`Liczę konta oszczędnościowe i inwestycyjne${who?' tej osoby':''} – bez PPK (doradca go nie liczy), bez kont bieżących i subkont – oraz wpisane ręcznie nieruchomości i inne aktywa (wartość minus kredyt; we wspólnych liczy się udział osoby). Instrumenty według dzisiejszej wyceny, gotówka na koncie inwestycyjnym osobno, inne waluty po średnim kursie NBP. Mieszkanie, w którym mieszkacie, jest w majątku, ale nie w proporcjach – nie zarabia i nie da się go „wyrównać”. Klasy przypisuję sam; zawsze możesz zmienić. W następnym etapie dojdzie plan z widełkami.`)+'</section>';
  return h}

/* 🏠 / ✨ add or change a property or another asset (two short steps; real estate asks about use, rent and the loan) */
export async function editAsset(id,isReal){if(guard())return;const x0=id?assets()[id]:null;if(id&&!x0)return;const all=clsAll(custom());
  const real=x0?all[x0.cls]?.g=='real':!!isReal,cl=Object.entries(all).filter(([c,k])=>c!='todo'&&(real?k.g=='real':k.g!='real'&&!['cash','deposit','mmf','b_fix','b_idx'].includes(c)));
  const r=await ask({title:x0?(real?'🏠 ':'✨ ')+x0.name:real?'🏠 Dodaj nieruchomość':'＋ Inne aktywo',text:x0?'':real?'Nieobowiązkowe. Wartość wpisz ostrożnie (najniższa z kilku wycen minus ok. 5%) i aktualizuj co 1–3 lata – kotki przypomną.':'Np. kolekcja, udziały w firmie, działka rekreacyjna. Nie zmienia sald kont ani budżetu.',fields:[
    {id:'n',label:'Nazwa',value:x0?.name||'',ph:real?'np. Mieszkanie Kraków':'np. Kolekcja LEGO'},{id:'c',label:'Rodzaj',type:'select',value:x0?.cls||(real?'r_home':'x_coll'),options:cl.map(([c,k])=>[c,k.i+' '+k.n])},
    {id:'v',label:'Szacowana wartość (zł)',type:'decimal',value:x0?String(x0.value/100).replace('.',','):''},{id:'d',label:'Wycena z dnia',type:'date',value:x0?.valAt||td()},
    {id:'o',label:'Właściciel',type:'select',value:x0?.owner||'Wspólne',options:[['Wspólne','Wspólne'],['Mati','Mati'],['Wercia','Wercia']]},
    {id:'p',label:'Udział Matiego przy wspólnym (%) – jak w akcie notarialnym',type:'int',value:String(x0?.mp??50)},
    {id:'e',label:'Przypomnienie o nowej wycenie',type:'select',value:String(x0?.every||(real?24:12)),options:[['12','co rok'],['24','co 2 lata'],['36','co 3 lata']]}],ok:real?'Dalej':'Zapisz',alt:x0?'Usuń':null});
  if(!r)return;
  if(r=='alt'){if(!await ask({title:'Usunąć „'+x0.name+'”?',text:'Zniknie z majątku. Wpisy na kontach się nie zmieniają.',ok:'Usuń',danger:true}))return;
    S.hraw={...S.hraw,assetM:{...assets(),[id]:{...x0,deleted:true}}};merge(H,{assetM:{[id]:{deleted:true}}});render();return toast('Usunięto')}
  const v=pg(r.v);if(!r.n.trim())return toast('Podaj nazwę','bad');if(!(v>0))return toast('Podaj wartość','bad');
  const mp=Math.min(100,Math.max(0,Math.round(+r.p)||50)),body={name:r.n.trim().slice(0,50),cls:r.c,value:v,valAt:r.d||td(),owner:r.o,mp,every:+r.e,o:x0?.o??Object.keys(assets()).length,deleted:false};
  if(real){const R0=x0?.real||{},debts=Object.entries(S.debts).filter(([,d])=>!d.deleted&&d.dir=='owe');
    const r2=await ask({title:'🏠 '+body.name,text:'Kredyt odejmuję od wartości (we wspólnym – w tej samej proporcji). Czynsz to tylko informacja – wpływy wpisujesz jak dotąd (📌 Stałe → przychód stały).',fields:[
      {id:'u',label:'Do czego służy',type:'select',value:R0.use||(r.c=='r_home'?'my':r.c=='r_rent'?'rent':'other'),options:Object.entries(REAL_USE)},
      {id:'r',label:'Czynsz miesięcznie przy wynajmie (zł)',type:'decimal',value:R0.rent?String(R0.rent/100).replace('.',','):''},
      {id:'k',label:'Kredyt na tej nieruchomości',type:'select',value:R0.debt||'',options:[['','— brak —'],...debts.map(([i,d])=>[i,d.name])]},
      {id:'b',label:'Cena zakupu (zł, nieobowiązkowo)',type:'decimal',value:R0.buy?String(R0.buy/100).replace('.',','):''},{id:'y',label:'Rok zakupu',type:'int',value:R0.buyY||''},
      {id:'m',label:'Metraż (m²)',type:'decimal',value:R0.m2||''}],ok:'Zapisz'});
    if(!r2)return;body.real={use:r2.u,rent:r2.u=='rent'?pg(r2.r||'0'):0,debt:r2.k||'',buy:pg(r2.b||'0'),buyY:+r2.y||0,m2:+String(r2.m||'').replace(',','.')||0}}
  const nid=id||'as'+rid();S.hraw={...S.hraw,assetM:{...assets(),[nid]:body}};merge(H,{assetM:{[nid]:body}});use('f:aktywo');render();toast(id?'Zapisano':'Dodano do majątku')}

/* ✎ choose the class of an instrument (h:id) or of an account's own money (a:id); „＋ Własna klasa” makes a new one */
function clsOptions(cur,auto){const all=clsAll(custom()),opts=[['','↺ automatycznie: '+(all[auto]?.n||'')]];
  for(const g of AGRP_ORDER){if(g=='todo')continue;const L=Object.entries(all).filter(([,k])=>k.g==g);if(L.length)opts.push({group:AGRP[g].i+' '+AGRP[g].n,items:L.map(([id,k])=>[id,k.i+' '+k.n])})}
  opts.push(['__new','＋ Własna klasa…']);return opts}
export async function pickCls(key){if(guard())return;const[kind,id]=key.split(':');let name,cur,auto,hint='';
  if(kind=='h'){const it=S.hold[id];if(!it)return;name=it.name;cur=it.cls||'';auto=clsOf({...it,cls:''},custom());
    const e=etfOf(it);if(e)hint=`Na liście: ${e.n} (${COV[e.cov]}).`;else if(it.kind=='etf'||it.kind=='tfi'){const gs=guessCls(it.name||'',it.ticker||'');hint=gs?`Z nazwy wygląda na: ${clsAll(custom())[gs].n}.`:'Nie znam tego funduszu – wybierz, w co inwestuje (zobaczysz to w karcie funduszu u brokera).'}}
  else{const a=S.cfg.accs.find(x=>x.id==id);if(!a)return;name=a.name;cur=a.cls||'';auto=accClsOf({...a,cls:''},custom());hint='Pieniądze na koncie (to, co nie jest w instrumentach).'}
  let pre=cur;if(!pre&&kind=='h'&&auto=='todo')pre=guessCls(S.hold[id]?.name||'',S.hold[id]?.ticker||'')||'';
  const r=await ask({title:'Klasa: '+name,text:hint,fields:[{id:'c',label:'W co to jest zainwestowane',type:'select',value:pre,options:clsOptions(cur,auto)}],ok:'Zapisz'});if(!r)return;
  let c=r.c;if(c=='__new'){c=await newCls();if(!c)return}use('f:klasa');
  if(kind=='h')merge(doc(HOLD(),id),{cls:c});else{const a=S.cfg.accs.find(x=>x.id==id);a.cls=c;saveAcc(a)}
  toast('Zapisano klasę');render()}
export async function newCls(){if(guard())return null;
  const r=await ask({title:'＋ Własna klasa',text:'Np. „Zegarki”, „Wino”, „Udziały w gabinecie”. Do testu kryzysu ważne jest, jak się zachowuje w złych czasach.',fields:[
    {id:'n',label:'Nazwa',value:'',ph:'np. Zegarki'},{id:'i',label:'Ikonka (emoji)',value:'✨'},
    {id:'g',label:'Grupa na kole',type:'select',value:'own',options:AGRP_ORDER.filter(g=>g!='todo').map(g=>[g,AGRP[g].i+' '+AGRP[g].n])},
    {id:'r',label:'W kryzysie zachowuje się',type:'select',value:'stock',options:RISKS}],ok:'Dodaj klasę'});
  if(!r)return null;if(!r.n.trim()){toast('Podaj nazwę','bad');return null}
  const C=custom(),id='u'+rid(),hues=[200,20,120,300,50,250,160,340],x={name:r.n.trim().slice(0,40),icon:[...(r.i.trim()||'✨')].slice(0,2).join(''),grp:r.g,risk:r.r,hue:hues[Object.keys(C).length%hues.length],o:Object.keys(C).length};
  S.hraw={...S.hraw,assetCls:{...C,[id]:x}};merge(H,{assetCls:{[id]:x}});use('f:wlasnaklasa');toast('Dodano klasę „'+x.name+'”');return id}

/* 🔎 held ETFs and funds (no PPK): list criteria, flags, doubling; and the list itself */
export function etfCardH(owner){const accs=new Map(S.cfg.accs.filter(a=>!a.archived&&wrapOf(a)!='ppk'&&(!owner||owner=='all'||ownerOf(a)==owner)).map(a=>[a.id,a]));
  const held=Object.entries(S.hold).map(([id,x])=>({id,...x})).filter(x=>!x.deleted&&accs.has(x.acc)&&(x.kind=='etf'||x.kind=='tfi'));
  const dup=etfDup(held);let h=`<section class="chart"><div class="ct"><b>🔎 Analiza funduszy</b><span class="mini">fakty, nie prognozy · lista z XTB, stan na ${dmy(ETF_AT)}</span></div>`;
  if(!held.length)h+=`<div class="mini">Nie macie jeszcze funduszy na kontach inwestycyjnych (poza PPK). Gdy dodacie ETF (📊 Instrumenty → + Dodaj instrument), automat zacznie śledzić jego cenę, a tu pojawi się analiza.</div>`;
  h+=held.map(it=>{const A=etfCheck(it),c=clsOf(it,custom()),k=clsAll(custom())[c];
    return`<div class="aetf"><div class="r1"><b>${esc(it.name)}${it.ticker?` <small>${esc(it.ticker)}</small>`:''}</b><span class="pill ${A.known?'ok':'low'}">${A.known?'z listy':'spoza listy'}</span></div>
      <div class="mini">${k.i} ${esc(k.n)} · ${esc(accs.get(it.acc)?.name||'')}${it.ticker?' · 🤖 cena z automatu':' · bez symbolu – cenę wpisujesz sam'}</div>
      ${A.checks.map(([ok,t])=>`<div class="mini">${ok?'✅':'⚠️'} ${esc(t)}</div>`).join('')}
      ${A.known?'':`<div class="mini">📝 Nie mam danych tego funduszu. Sprawdź u brokera (Szczegóły / KID): ISIN zaczyna się od IE lub LU (UCITS), „akumulujący”, koszt roczny do ok. 0,25%, duży (ponad 1 mld USD), szeroki indeks.</div>`}
      ${A.flags.map(f=>`<div class="mini t-exp">🚩 ${esc(f)}</div>`).join('')}${c=='todo'?`<button class="chip" onclick="pickCls('h:${it.id}')">❓ W co inwestuje?</button>`:''}</div>`}).join('');
  if(dup.length)h+=dup.map(t=>`<div class="note">🐾 ${esc(t)}</div>`).join('');
  h+=`<details class="more"><summary class="mini">📋 Lista funduszy (${ETFS.length}) ›</summary><div class="mini" style="margin:6px 0">Wszystkie: UCITS z Irlandii, akumulujące. To trzy „rodziny” tego samego: <b>cały świat w jednym</b> albo <b>para</b> rozwinięte + wschodzące (ok. 88/12). Wystarczy jeden fundusz świata albo jedna para z tej samej rodziny indeksów.</div>
    ${['world','dev','em'].map(cv=>`<div class="mini" style="margin-top:6px"><b>${COV[cv]}</b></div>`+ETFS.filter(e=>e.cov==cv).map(e=>`<div class="erow mini"><b>${etfSym(e)}</b><span>${esc(e.n)}</span><span class="num">${String(e.ter).replace('.',',')}%</span></div>`).join('')).join('')}
    <div class="mini" style="margin-top:6px">W XTB każda wymiana waluty kosztuje 0,5%, niezależnie od waluty notowania. Instrument spoza listy po dodaniu też jest śledzony przez automat i analizowany.</div></details></section>`;
  return h}

/* ======================= D2: 🧭 doradca – ankieta, plan, widełki, diagnoza ======================= */
const advM=()=>S.hraw?.advM||{},advW=()=>S.hraw?.advW||{};
export const ankOf=who=>({...(advW().ank||{}),...(advM()[who]?.ank||{})});
/* the survey is first only on Mati's phone (decision 19) until he unlocks it for Wercia */
export const ankOpen=who=>who=='Mati'||!!advW().showW;
export const planOfWho=who=>advM()[who]?.plan||null;
/* the plan for a view: a person – theirs; Razem / Wspólne – the joint one (the more cautious person's), unless they chose separate parts */
export function planFor(owner){const o=ownF(owner);if(o=='Mati'||o=='Wercia')return planOfWho(o);if(advW().ank?.q64=='sep'&&o!='Wspólne')return null;return jointPlan(planOfWho('Mati'),planOfWho('Wercia'))}
/* what the app already knows for the survey ([A]) */
function ankCtx(who){const tx=liveOf(S.tx),today=td(),cur=today.slice(0,7),A=allocNow(who),R=realNow(who);let inc=0,exp=0,n=0;
  for(let k=1;k<=6;k++){const g=agg(S.cfg,tx,addMonths(cur,-k));if(g.inc||g.exp){inc+=g.inc;exp+=g.exp;n++}}
  const incs=(S.cfg.incs||[]).filter(x=>x.who==who),kinds=[...new Set(incs.map(x=>x.kind))],birth=S.hraw?.birth?.[who]||'';
  let taxHint='';if(birth&&youngUntil(birth)>today&&kinds.some(k=>k=='uop'||k=='zlec'))taxHint='0';
  else if(kinds.some(k=>k=='uop'||k=='zlec')){let b=0,m=0;for(const[ym,sl]of Object.entries(S.slips||{})){if(!ym.startsWith(today.slice(0,4)))continue;let any=0;for(const x of Object.values(sl||{}))if(x?.who==who){b+=+x.base||0;any=1}m+=any}
    if(m)taxHint=b/m*12>12000000?'32':'12'}
  const pool=S.cfg.accs.filter(a=>a.grp=='sav'&&!a.archived&&isP(a)).reduce((s,a)=>s+balance(S.cfg,tx,a.id,addDays(today,1)),0),inGoals=Object.values(S.goals||{}).reduce((s,g)=>s+Math.max(0,goalAlloc(g)),0),cush=Math.max(0,pool-inGoals);
  const avgE=n?exp/n:0,dl=Object.entries(S.debts||{}).filter(([,d])=>!d.deleted&&d.dir=='owe').map(([id,d])=>({id,...d,left:debtStateP({id,...d},tx,today).left}));
  const cons=dl.filter(d=>d.kind!='hip'),mort=dl.filter(d=>d.kind=='hip'),wrapTxt=w=>{const L=S.cfg.accs.filter(a=>!a.archived&&wrapOf(a)==w&&ownerOf(a)==who);return L.length?'W aplikacji: '+L.map(a=>a.name).join(', ')+'.':''};
  const base=devP(A,{g:{cash:0,bond:0,stock:0,gold:0}}).base;
  return{birth,kinds,taxHint,wealth:A.total+R.work.net+R.home.net,base:base||A.total,wealthTxt:zl0(A.total+R.work.net+R.home.net)+(R.list.length?' (z nieruchomościami)':''),surplus:n?(inc-exp)/n:0,surplusTxt:n?`${zl0((inc-exp)/n)} miesięcznie (${inc?Math.round((inc-exp)/inc*100):0}% przychodów)`:'za mało danych',
    exp:avgE,expTxt:zl0(avgE),podM:avgE?cush/avgE:0,podMTxt:avgE?(cush/avgE).toFixed(1).replace('.',',')+' mies.':'—',cush,debtsTxt:cons.map(d=>`${d.name} ${zl0(d.left)}`).join(', '),mortTxt:mort.map(d=>`${d.name} ${zl0(d.left)}`).join(', '),
    ikeTxt:wrapTxt('ike'),ikzeTxt:wrapTxt('ikze'),realTxt:R.list.map(x=>x.name).join(', '),hasHome:R.list.some(x=>x.home),hasRent:R.list.some(x=>x.use=='rent'),zl:zl0,debtList:dl}}
function saveAns(q,v,who=S.who){const k=q.w?'advW':'advM';
  if(q.w){const W=advW();S.hraw={...S.hraw,advW:{...W,ank:{...(W.ank||{}),[q.id]:v},at:Date.now()}};merge(H,{advW:{ank:{[q.id]:v},at:Date.now()}})}
  else{const M=advM(),me=M[who]||{};S.hraw={...S.hraw,advM:{...M,[who]:{...me,ank:{...(me.ank||{}),[q.id]:v},at:Date.now()}}};merge(H,{advM:{[who]:{ank:{[q.id]:v},at:Date.now()}}})}
  return k}

/* 🧭 the card on Oszczędności: diagnosis + the survey / the plan */
export function advCardH(owner){const who=S.who,ctx=ankCtx(who),A=ankOf(who),dn=ankDone(A,ctx),plan=planOfWho(who),open=ankOpen(who);
  const D=diagP({cushion:ctx.cush,exp:ctx.exp,podTarget:+(A.q17||6)||6,debts:ctx.debtList,accs:S.cfg.accs,tx:liveOf(S.tx),limits:S.hraw?.limits,today:td(),owner:who});
  const lim=D.lim.length?D.lim.map(l=>`${l.w.toUpperCase()} ${zl0(l.left)}`).join(' · '):'brak IKE/IKZE';
  const tile=(c,l,v,s)=>`<div class="kpi ${c}"><div class="l">${l}</div><div class="v num">${v}</div><div class="s">${s}</div></div>`;
  let h=`<section class="chart adv"><div class="ct"><b>🧭 Doradca</b><span class="mini">${esc(who)} · kotki liczą, nie zgadują przyszłości</span></div><div class="kpis advk">
    ${tile(D.pod.st=='ok'?'k-em':D.pod.st=='low'?'k-ro':'k-am','🛟 Poduszka',D.pod.m==null?'—':D.pod.m.toFixed(1).replace('.',',')+' mies.',`cel ${D.pod.target} mies.`)}
    ${tile(D.debts.n?'k-ro':'k-em','🔻 Długi najpierw',D.debts.n?zl0(D.debts.sum):'brak',D.debts.n?'spłać przed inwestowaniem':'bez kart i rat – super')}
    ${tile('k-sk','📅 Limity '+td().slice(0,4),lim,`zostało ${D.days} dni · OKI od 2027`)}
    ${tile(plan?'k-em':'k-am','🎯 Plan',plan?`akcje ${plan.g.stock}%`:open?`${dn.n}/${dn.of}`:'—',plan?`obligacje ${plan.g.bond}% · złoto ${plan.g.gold}%`:open?'odpowiedzi w ankiecie':'najpierw ankieta Matiego')}</div>`;
  if(open)h+=`<div class="g2"><button class="btn ${plan?'':'primary'} sm" onclick="openAnk()">📝 ${dn.n?dn.n<dn.of?'Dokończ ankietę':'Popraw odpowiedzi':'Zacznij ankietę z kotkami'}</button><button class="btn ${plan?'primary':''} sm" onclick="openPlan()">📄 ${plan?'Mój plan':'Propozycja planu'}</button></div>`;
  else h+=`<div class="mini">🐾 Ankietę najpierw wypełnia Mati. Gdy skończy, odblokuje ją dla Ciebie w swoim planie.</div>`;
  if(D.debts.n)h+=`<div class="mini">🐾 Najpierw spłata długów: ich oprocentowanie to więcej, niż da jakakolwiek pewna inwestycja.</div>`;
  return h+'</section>'}
export function openAnk(){if(guard())return;if(!ankOpen(S.who))return toast('🐾 Ankietę najpierw wypełnia Mati – potem ją odblokuje');use('f:ankieta');const ctx=ankCtx(S.who),A=ankOf(S.who),L=ankList(A,ctx);S.ankQ=(L.find(q=>A[q.id]===undefined)||L[0]).id;S.ankTmp=null;S.adv='ank';window.scrollTo(0,0);render()}
export function openPlan(){use('f:plan');S.adv='plan';window.scrollTo(0,0);render()}
export function closeAdv(){S.adv=null;render()}

/* 📝 one question per screen, the kotki ask; answers are saved at once (you can stop and come back) */
export function ankPageH(){const who=S.who,ctx=ankCtx(who),A=ankOf(who),L=ankList(A,ctx);let i=L.findIndex(q=>q.id==S.ankQ);if(i<0)i=0;const q=L[i],dn=ankDone(A,ctx);
  let h=`<button class="btn sm" style="align-self:flex-start" onclick="closeAdv()">‹ Oszczędności</button><section class="chart ank"><div class="ct"><b>📝 Ankieta · ${esc(ANK_SEC[q.s])}</b><span class="mini">pytanie ${i+1} z ${L.length} · odpowiedzi ${dn.n}${q.w?' · 👥 wspólne – druga osoba też je widzi':''}</span></div>
    <div class="gbar"><i style="width:${(dn.n/Math.max(1,dn.of)*100).toFixed(1)}%"></i></div>${kotki.mode=='off'?'':`<div class="ankcat">${scene(i%2?'duo':'calc','kot')}</div>`}
    <div class="ankq">${esc(q.t)}</div>${q.hint&&q.hint(ctx)?`<div class="note">🐾 ${esc(q.hint(ctx))}</div>`:''}${q.why?`<div class="mini">ⓘ Po co pytamy: ${esc(q.why)}</div>`:''}`;
  const cur=A[q.id],opts=typeof q.o=='function'?q.o(ctx):q.o||[];
  if(q.type=='one')h+=`<div class="ankopts">${[...opts,...(q.nq?[]:[['?','🤷 Nie wiem']])].map(([v,l])=>`<button class="btn ${String(cur)===String(v)?'primary':''}" onclick="ankSet('${q.id}','${esc(String(v))}')">${esc(l)}</button>`).join('')}</div>`;
  else if(q.type=='multi'){const sel=S.ankTmp??((Array.isArray(cur)?cur:q.def?q.def(ctx):[])||[]);S.ankTmp=sel;
    h+=`<div class="ankopts">${opts.map(([v,l])=>`<button class="btn ${sel.includes(v)?'primary':''}" onclick="ankTog('${v}')">${sel.includes(v)?'✓ ':''}${esc(l)}</button>`).join('')}</div><button class="btn dark" onclick="ankSet('${q.id}',null)">Dalej ›</button>`}
  else if(q.type=='goals'){const gl=(A.q23||[]).filter(g=>!['ret','home','rent'].includes(g)),lab=Object.fromEntries(ANK.find(x=>x.id=='q23').o),G=Array.isArray(cur)?cur:[];
    h+=gl.map(g=>{const x=G.find(y=>y.g==g)||{};return`<div class="anrow"><b>${esc(lab[g])}</b><input id="ag_a_${g}" inputmode="decimal" placeholder="kwota zł" value="${x.a?String(x.a/100):''}"><input id="ag_y_${g}" inputmode="numeric" placeholder="rok" value="${x.y||''}"><select id="ag_f_${g}"><option value="0"${x.f?'':' selected'}>elastyczny</option><option value="1"${x.f?' selected':''}>sztywny</option></select></div>`}).join('')+`<button class="btn dark" onclick="ankSet('${q.id}',null)">Dalej ›</button>`}
  else h+=`${q.type=='text'?`<textarea id="ankIn" rows="3" placeholder="${esc(q.ph?q.ph(ctx):'')}">${esc(cur&&cur!='?'?cur:'')}</textarea>`:`<label class="fld"><span>${esc(q.unit||'')}</span><input id="ankIn" inputmode="decimal" value="${cur!=null&&cur!='?'?esc(String(q.unit=='zł'?cur/100:cur)):''}" placeholder="${esc(q.ph?q.ph(ctx):'')}"></label>`}
    <div class="g2"><button class="btn" onclick="ankSet('${q.id}','?')">🤷 Nie wiem / pomiń</button><button class="btn dark" onclick="ankSet('${q.id}',null)">Dalej ›</button></div>`;
  h+=`<div class="g2"><button class="btn sm" ${i?'':'disabled'} onclick="ankGo(-1)">‹ Wróć</button><button class="btn sm" onclick="${i<L.length-1?'ankGo(1)':'openPlan()'}">${i<L.length-1?'Pomiń ›':'📄 Zobacz plan'}</button></div></section>`;
  return h}
export function ankTog(v){const s=new Set(S.ankTmp||[]);if(v=='none'){S.ankTmp=s.has('none')?[]:['none']}else{s.delete('none');s.has(v)?s.delete(v):s.add(v);S.ankTmp=[...s]}render()}
export function ankGo(d){const ctx=ankCtx(S.who),L=ankList(ankOf(S.who),ctx),i=L.findIndex(q=>q.id==S.ankQ);const n=L[Math.max(0,Math.min(L.length-1,i+d))];S.ankQ=n.id;S.ankTmp=null;window.scrollTo(0,0);render()}
export function ankSet(id,v){if(guard())return;const q=ANK.find(x=>x.id==id);if(!q)return;
  if(v===null){if(q.type=='multi')v=S.ankTmp||[];else if(q.type=='goals'){const gl=(ankOf(S.who).q23||[]).filter(g=>!['ret','home','rent'].includes(g));
      v=gl.map(g=>({g,a:pg(document.getElementById('ag_a_'+g)?.value||'0'),y:+(document.getElementById('ag_y_'+g)?.value||0)||0,f:document.getElementById('ag_f_'+g)?.value=='1'}))}
    else{const raw=(document.getElementById('ankIn')?.value||'').trim();if(!raw)return toast('Wpisz odpowiedź albo stuknij „Nie wiem”','bad');
      if(q.type=='text')v=raw.slice(0,500);else{const n=+raw.replace(/\s/g,'').replace(',','.');if(!isFinite(n))return toast('Wpisz liczbę','bad');
        if(q.min!=null&&n<q.min||q.max!=null&&n>q.max)return toast(`Od ${q.min} do ${q.max}`,'bad');v=q.unit=='zł'?Math.round(n*100):n}}}
  saveAns(q,v);S.ankTmp=null;const ctx=ankCtx(S.who),L=ankList(ankOf(S.who),ctx),i=L.findIndex(x=>x.id==id);
  if(i>=L.length-1){S.adv='plan';toast('🐾 Gotowe! Oto propozycja planu')}else S.ankQ=L[i+1].id;window.scrollTo(0,0);render()}

/* 📄 „Wasz plan na jednej kartce” – the proposal from the answers, approved = advM[who].plan */
const GN=g=>AGRP[g].i+' '+AGRP[g].n;
export function planPageH(){const who=S.who,A=ankOf(who),ctx=ankCtx(who),saved=planOfWho(who),prop=planP(A),P=saved||prop,base=ctx.base,cr=crisisP(P.g,base);
  const other=who=='Mati'?'Wercia':'Mati',op=planOfWho(other),J=jointPlan(saved,op);
  let h=`<button class="btn sm" style="align-self:flex-start" onclick="closeAdv()">‹ Oszczędności</button><section class="chart plan"><div class="ct"><b>📄 ${saved?'Mój plan':'Propozycja planu'} – ${esc(who)}</b><span class="mini">${saved?'zatwierdzony '+dmy(new Date(saved.at).toISOString().slice(0,10)):'z Twoich odpowiedzi – zatwierdź albo zmień'}</span></div>`;
  h+=`<div class="mini"><b>Część długoterminowa</b> (bez poduszki) – proporcje i widełki:</div>`+PLAN_G.map(g=>{const t=P.g[g],[lo,hi]=bandOf(t);return`<div class="pg"><div class="r1"><span>${GN(g)}</span><b class="num">${t}% <em>(${String(lo).replace('.',',')}–${String(hi).replace('.',',')}%)</em></b></div><div class="pbar"><span class="band" style="left:${lo}%;width:${hi-lo}%"></span><span class="tgt" style="left:${t}%"></span></div></div>`}).join('');
  const sp=Object.entries(P.split||{}).map(([c,v])=>`${(clsAll(custom())[c]?.n||c).replace(/^Akcje – /,'')} ${v}%`).join(' · ');
  h+=`<div class="mini">📈 Akcje: ${esc(sp)}${P.sand?` · 🧪 piaskownica do ${P.sand}%`:''}. 🧾 Obligacje: skarbowe indeksowane inflacją (EDO, w IKE też).</div>`;
  h+=`<div class="note ${cr.zl<0?'bad':''}">⚡ Kryzys jak 2008 (wariant ostrożny, w złotych): ten portfel ${base?`(${zl0(base)})`:''} mógłby ${cr.zl<0?'stracić':'zyskać'} ok. <b>${zl0(Math.abs(cr.zl))}</b> (${String(cr.pct).replace('.',',')}%). Akcje −35%, złoto +38%, obligacje i gotówka bez zmian.</div>`;
  const L=[];if(P.real!=null)L.push(`🏠 Nieruchomości (bez domu) docelowo ok. ${P.real}% majątku, który pracuje (${Math.max(0,P.real-10)}–${Math.min(100,P.real+10)}%) – wyrównujemy tylko nowymi pieniędzmi, nigdy sprzedażą mieszkania.`);
  L.push(`🛟 Poduszka: ${P.pod} miesięcy wydatków${ctx.exp?` ≈ ${zl0(ctx.exp*P.pod)}`:''} (teraz ${ctx.podMTxt}).`);
  if(P.save)L.push(`🐷 Odkładam ${zl0(P.save)} miesięcznie${A.q14=='q'?', kupuję raz na kwartał':A.q14=='m'?', co miesiąc':''}.`);
  if(A.q61&&A.q61!='?')L.push(`📉 Reguła na spadki: ${A.q61=='r25'?'gdy akcje spadną o 25%, dokupię akcji ze złota / obligacji':A.q61=='none'?'bez reguły – trzymam plan':esc(A.q61t||'własna')}.`);
  if(A.q62&&A.q62!='?')L.push(`🔒 Plan zmieniam: ${{life:'tylko przy zmianie w życiu',year:'raz w roku',cycle:'po pełnym cyklu 7–10 lat'}[A.q62]}.`);
  const gl=(A.q27||[]).filter(x=>x.a);if(gl.length){const lab=Object.fromEntries(ANK.find(x=>x.id=='q23').o);L.push('🎯 Cele: '+gl.map(x=>`${lab[x.g]} ${zl0(x.a)}${x.y?' w '+x.y:''}${x.f?' (sztywno)':''}`).join(', ')+'.')}
  if(A.q60&&A.q60!='?')L.push(`💌 List do siebie: „${esc(A.q60)}”`);
  h+=L.map(x=>`<div class="mini">${x}</div>`).join('');
  h+=`<details class="info"><summary>ⓘ Dlaczego takie proporcje</summary><div class="mini">${prop.why.map(esc).join('<br>')}<br>Do planu trafia najniższa z granic. Wzorzec z lektury dla porównania (nie nakaz): 50% obligacje indeksowane / 35% akcje świata / 15% złoto. Doradca nie przewiduje przyszłości – pilnuje planu.</div></details>`;
  h+=`<div class="g2"><button class="btn primary" onclick="approvePlan()">✓ ${saved?'Zatwierdź jeszcze raz':'Zatwierdzam plan'}</button><button class="btn" onclick="editPlan()">✎ Zmień proporcje</button></div><button class="btn sm" onclick="openAnk()">📝 Popraw odpowiedzi w ankiecie</button>`;
  if(saved&&JSON.stringify(saved.g)!=JSON.stringify(prop.g))h+=`<div class="mini">Z obecnych odpowiedzi wychodzi: akcje ${prop.g.stock}% · obligacje ${prop.g.bond}% · złoto ${prop.g.gold}% · gotówka ${prop.g.cash}%. <button class="chip" onclick="approvePlan(1)">Weź tę propozycję</button></div>`;
  if(J&&op)h+=`<div class="mini">👥 Wspólny portfel liczę według ostrożniejszej osoby: akcje ${J.g.stock}%${advW().ank?.q64=='sep'?' (wybraliście osobne części – Razem pokazuje wtedy tylko stan)':''}.</div>`;
  if(who=='Mati')h+=`<button class="btn sm" onclick="toggleAnkW()">${advW().showW?'🙈 Schowaj ankietę Werci':'👀 Pokaż ankietę Werci'}</button>`;
  return h+'</section>'}
export async function approvePlan(fresh){if(guard())return;const who=S.who,P=fresh||!planOfWho(who)?planP(ankOf(who)):planOfWho(who),x={g:P.g,split:P.split,real:P.real,pod:P.pod,save:P.save,sand:P.sand,at:Date.now()};
  const M=advM();S.hraw={...S.hraw,advM:{...M,[who]:{...(M[who]||{}),plan:x}}};merge(H,{advM:{[who]:{plan:x}}});use('f:planok');toast('🐾 Plan zapisany – na kole pojawią się widełki');render()}
export async function editPlan(){if(guard())return;const who=S.who,P=planOfWho(who)||planP(ankOf(who)),base=ankCtx(who).base;
  const r=await ask({title:'✎ Proporcje planu',text:`Obligacje = reszta do 100%. Teraz w kryzysie jak 2008: ${zl0(Math.abs(crisisP(P.g,base).zl))}. Po zmianie zobaczysz nową kwotę na kartce.`,fields:[
    {id:'s',label:'📈 Akcje (%)',type:'int',value:String(P.g.stock)},{id:'g',label:'🥇 Złoto (%)',type:'int',value:String(P.g.gold)},{id:'c',label:'💵 Gotówka – suchy proch (%)',type:'int',value:String(P.g.cash)}],ok:'Zapisz plan'});
  if(!r)return;const s=Math.round(+r.s),g=Math.round(+r.g),c=Math.round(+r.c);if(![s,g,c].every(v=>v>=0&&v<=100)||s+g+c>100)return toast('Procenty od 0 do 100, razem najwyżej 100','bad');
  const x={...P,g:{stock:s,gold:g,cash:c,bond:100-s-g-c},at:Date.now()};delete x.why;const M=advM();S.hraw={...S.hraw,advM:{...M,[who]:{...(M[who]||{}),plan:x}}};merge(H,{advM:{[who]:{plan:x}}});toast('Zapisano plan');render()}
export function toggleAnkW(){if(guard())return;const v=!advW().showW;S.hraw={...S.hraw,advW:{...advW(),showW:v}};merge(H,{advW:{showW:v}});toast(v?'Werci pokaże się ankieta':'Schowano ankietę Werci');render()}

/* 🎯 under the koło: bars „jest / ma być” with the bands and the kotki's hint (only new money – no selling here) */
export function planBarsH(A,plan){const D=devP(A,plan);if(!D.base)return'';
  let h=`<div class="pbars"><div class="mini"><b>🎯 Jest / ma być</b> · część długoterminowa bez poduszki (${zl0(D.base)})</div>`+D.G.map(x=>`<div class="pg ${x.st}"><div class="r1"><span>${GN(x.g)}</span><b class="num">${x.now.toFixed(0)}% <em>plan ${String(x.lo).replace('.',',')}–${String(x.hi).replace('.',',')}%</em></b></div><div class="pbar"><span class="band" style="left:${x.lo}%;width:${x.hi-x.lo}%"></span><span class="now ${x.st}" style="left:${Math.min(100,x.now)}%"></span></div></div>`).join('');
  if(D.other>=0.5)h+=`<div class="mini">Poza planem (nieruchomości w funduszach, alternatywne, własne, do przypisania): ${D.other.toFixed(0)}%.</div>`;
  const tip=D.ok?`Wszystko w widełkach planu 💚 Kolejne wpłaty dzielcie według planu: ${PLAN_G.filter(g=>plan.g[g]).map(g=>AGRP[g].n.toLowerCase()+' '+plan.g[g]+'%').join(', ')}.`
    :[D.low.length?`Przy następnej wpłacie dokupcie: ${D.low.map(x=>`${GN(x.g)} (do planu brakuje ok. ${zl0(x.gap)})`).join(', ')}.`:'',D.high.length?`${D.high.map(x=>`${GN(x.g)} ${x.now.toFixed(0)}% – ponad plan (${String(x.lo).replace('.',',')}–${String(x.hi).replace('.',',')}%)`).join(', ')}: na razie tego nie dokupujcie.`:''].filter(Boolean).join(' ');
  return h+`<div class="note">🐾 ${esc(tip)}</div></div>`}
