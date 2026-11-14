/* 🧭 Doradca – screens (D1a): 🥧 „Z czego składa się majątek” in 💰 Majątek → Oszczędności (groups → classes → instruments and accounts,
   tap = change the class), 🔎 the analysis of held funds and the list of known ETFs. Calculations in advisor.js. */
import {doc} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {sandP,sandCheckP,wishHitP,SAND_KIND,SAND_REG,symOf,thermoP,THERMO_TXT,advRemindP,crisesP,pensionNet,retireP,homeP,rentP,buyCheckP,costsP,fillP,pickEtf,unitsP,tranchesP,bondPickP,adviceDoneP,XTB,taxOf,ikzeRank,wrapCompare,whereP,ANK,ANK_SEC,ankList,ankDone,planP,bandOf,jointPlan,crisisP,devP,diagP,PLAN_G,AGRP,AGRP_ORDER,RISKS,COV,ETFS,ETF_AT,REAL_USE,realP,allocP,clsAll,clsOf,accClsOf,etfCheck,etfDup,etfOf,etfSym,guessCls} from './advisor.js';
import {donutSvg} from './charts.js';
import {liveOf,ownerOf,agg,balance} from './logic.js';
import {youngUntil} from './pay.js';
import {debtStateP} from './today.js';
import {goalAlloc} from './actions.js';
import {kotki} from './guide.js';
import {scene} from './cats.js';
import {wrapOf,LIMITS,limitOf,paidInYear,BONDS} from './inv.js';
import {esc,rid,td,zl0,dmy,pg,addDays,addMonths} from './util.js';
import {S,ask,toast,H,HOLD,merge,saveAcc,guard,infoH,isP} from './core.js';
import {macro,mkt,bondOffer} from './savings.js';
import {editFixedTr} from './actions.js';
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
  const lim=D.lim.length?D.lim.map(l=>`${l.w.toUpperCase()} ${zl0(l.left)}`).join('<br>'):'brak IKE/IKZE';
  const tile=(c,l,v,s,k)=>`<button class="kpi ${c}" onclick="advTile('${k}')"><div class="l">${l}</div><div class="v num">${v}</div><div class="s">${s}</div><span class="kmore">›</span></button>`;
  let h=`<section class="chart adv"><div class="ct"><b>🧭 Doradca</b><span class="mini">${esc(who)} · kotki liczą, nie zgadują przyszłości</span></div><div class="kpis advk">
    ${tile(D.pod.st=='ok'?'k-em':D.pod.st=='low'?'k-ro':'k-am','🛟 Poduszka',D.pod.m==null?'—':D.pod.m.toFixed(1).replace('.',',')+' mies.',`cel ${D.pod.target} mies.`,'pod')}
    ${tile(D.debts.n?'k-ro':'k-em','🔻 Długi najpierw',D.debts.n?zl0(D.debts.sum):'brak',D.debts.n?'spłać przed inwestowaniem':'bez kart i rat – super','debt')}
    ${tile('k-sk','📅 Limity '+td().slice(0,4),lim,`do końca roku ${D.days} dni`,'lim')}
    ${tile(plan?'k-em':'k-am','🎯 Plan',plan?`akcje ${plan.g.stock}%`:open?`${dn.n}/${dn.of}`:'—',plan?`obligacje ${plan.g.bond}% · złoto ${plan.g.gold}%`:open?'odpowiedzi w ankiecie':'najpierw ankieta Matiego','plan')}</div>`;
  if(open)h+=`<button class="btn primary" onclick="openWhere()">💸 Chcę zainwestować… – gdzie wpłacić?</button><div class="g2"><button class="btn sm" onclick="openGoals()">🎯 Cele, kryzys, koszty</button><button class="btn sm" onclick="openSand()">🧪 Piaskownica</button></div>`;
  if(open)h+=`<div class="g2"><button class="btn ${plan?'':'primary'} sm" onclick="openAnk()">📝 ${dn.n?dn.n<dn.of?'Dokończ ankietę':'Popraw odpowiedzi':'Zacznij ankietę z kotkami'}</button><button class="btn ${plan?'primary':''} sm" onclick="openPlan()">📄 ${plan?'Mój plan':'Propozycja planu'}</button></div>`;
  else h+=`<div class="mini">🐾 Ankietę najpierw wypełnia Mati. Gdy skończy, odblokuje ją dla Ciebie w swoim planie.</div>`;
  if(D.debts.n)h+=`<div class="mini">🐾 Najpierw spłata długów: ich oprocentowanie to więcej, niż da jakakolwiek pewna inwestycja.</div>`;
  return h+thermoH()+'</section>'}
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

/* ======================= D3: kafelki ze szczegółami, „💸 gdzie wpłacić” ======================= */
/* a details window over the page (one scrolling sheet, „Zamknij” at the bottom) */
function infoDlg(title,html){const d=document.getElementById('dlg');document.getElementById('dlgBody').innerHTML=`<h2>${esc(title)}</h2>${html}<div class="stfoot"><button class="btn primary" style="width:100%" onclick="advClose()">Zamknij</button></div>`;d.hidden=false;d.onclick=e=>{if(e.target===d)advClose()}}
export function advClose(){document.getElementById('dlg').hidden=true}
const yr=()=>td().slice(0,4);
/* each person's IKE / IKZE: accounts in the app (limit − paid this year); none → the full limit, „do założenia” */
function wrapsOf(who){const tx=liveOf(S.tx),y=yr(),L={...(LIMITS[y]||LIMITS[Math.max(...Object.keys(LIMITS).map(Number))]),...(S.hraw?.limits?.[y]||{})},out={};
  for(const w of ['ike','ikze']){const acc=S.cfg.accs.filter(a=>!a.archived&&wrapOf(a)==w&&ownerOf(a)==who);
    if(acc.length)out[w]={has:true,accs:acc.map(a=>({name:a.name,lim:limitOf(a,y,S.hraw?.limits),paid:paidInYear(tx,a.id,y)})),left:acc.reduce((s,a)=>s+Math.max(0,limitOf(a,y,S.hraw?.limits)-paidInYear(tx,a.id,y)),0)};
    else{const jdg=(S.cfg.incs||[]).some(x=>x.who==who&&x.kind=='b2b'),lim=w=='ike'?L.ike:jdg?L.ikzeB:L.ikze;out[w]={has:false,accs:[],left:lim,lim}}}
  return out}
export function advTile(k){use('f:kafelek');const who=S.who,ctx=ankCtx(who),A=ankOf(who),tx=liveOf(S.tx),tom=addDays(td(),1);
  if(k=='pod'){const L=S.cfg.accs.filter(a=>a.grp=='sav'&&!a.archived&&isP(a)),goals=Object.values(S.goals||{}).reduce((s,g)=>s+Math.max(0,goalAlloc(g)),0),tg=+(A.q17||6)||6,need=Math.round(ctx.exp*tg);
    return infoDlg('🛟 Poduszka bezpieczeństwa',`<div class="mini">Konta oszczędnościowe (bez IKE, IKZE, PPK i inwestycji – tych nie da się szybko wypłacić bez straty):</div>${L.map(a=>`<div class="r1 mini"><span>${esc(a.name)}</span><b class="num">${zl0(balance(S.cfg,tx,a.id,tom))}</b></div>`).join('')||'<div class="mini">brak kont oszczędnościowych</div>'}
      ${goals?`<div class="r1 mini"><span>− przydzielone do celów</span><b class="num">${zl0(goals)}</b></div>`:''}<div class="r1"><b>Poduszka</b><b class="num">${zl0(ctx.cush)}</b></div>
      <div class="mini">Średnie wydatki domu (6 mies.): <b>${zl0(ctx.exp)}</b> → starczy na <b>${ctx.podMTxt}</b>.</div><div class="mini">Cel z ankiety: ${tg} mies. = ${zl0(need)}. ${need>ctx.cush?`<b class="t-exp">Brakuje ${zl0(need-ctx.cush)}.</b> Najpierw poduszka, potem giełda.`:'<b class="t-inc">✓ Cel osiągnięty.</b>'}</div>
      <div class="mini">Skład według lektury: ok. ¼ na koncie oszczędnościowym, reszta w obligacjach skarbowych (EDO / COI); 2–3 tygodnie wydatków w gotówce. Co rok dopłata o inflację.</div>`)}
  if(k=='debt'){const L=ctx.debtList,cons=L.filter(d=>d.kind!='hip'),mort=L.filter(d=>d.kind=='hip'),row=d=>`<div class="r1 mini"><span>${esc(d.name)}${d.rate?` · ${String(d.rate).replace('.',',')}%`:''}</span><b class="num">${zl0(d.left)}</b></div>`;
    return infoDlg('🔻 Długi',`${cons.length?`<div class="mini"><b>Do spłaty przed inwestowaniem</b> (karty, raty, pożyczki):</div>${cons.map(row).join('')}<div class="mini">Spłata długu oprocentowanego np. na 10% to pewny zysk 10% – żadna bezpieczna inwestycja tyle nie da.</div>`:'<div class="mini">✓ Brak kart, rat i pożyczek – można inwestować.</div>'}
      ${mort.length?`<div class="mini" style="margin-top:8px"><b>Kredyt hipoteczny</b> (nie blokuje inwestowania – nadpłata albo inwestycje według planu):</div>${mort.map(row).join('')}`:''}<div class="mini">Długi wpisujesz w 💰 Majątek → 👛 Konta → 🔻 My winni.</div>`)}
  if(k=='lim'){const t=taxOf(A),W=wrapsOf(who),days=Math.round((Date.parse(yr()+'-12-31')-Date.parse(td()))/864e5);
    const blk=(w,n)=>{const x=W[w];return`<div class="lim"><div class="r1"><b>${n}</b><b class="num">zostało ${zl0(x.left)}</b></div>${x.has?x.accs.map(a=>`<div class="mini">${esc(a.name)}: limit ${zl0(a.lim)} · wpłacono ${zl0(a.paid)}</div>`).join(''):`<div class="mini">Nie masz jeszcze ${n} w aplikacji – limit ${zl0(x.lim)} (np. w XTB, za darmo).</div>`}</div>`};
    return infoDlg(`📅 Limity ${yr()} – ${who}`,blk('ike','IKE')+blk('ikze','IKZE')+`<div class="mini">Do 31 grudnia zostało <b>${days} dni</b> – wpłata musi dotrzeć do instytucji przed końcem roku (najlepiej do ok. 20.12). Limit liczy się od wpłaty, nie od zakupu – można wpłacić i kupić później.</div>
      ${ikzeRank(t)=='first'?`<div class="note">🐾 Przy progu ${t=='19'?'liniowym 19%':t+'%'} pełne IKZE (${zl0(W.ikze.left)}) da w PIT zwrot ok. <b>${zl0(Math.round(W.ikze.left*tNumUI(t)/100))}</b>.</div>`:ikzeRank(t)=='no'?`<div class="mini">Przy progu ${t}% IKZE się nie opłaca – najpierw IKE.</div>`:''}
      <div class="mini">📦 OKI ruszy 1 stycznia 2027 (bez limitu wpłat, bez podatku do 100 tys. zł majątku).</div>`)}
  const P=planOfWho(who);if(!P)return openPlan();
  return infoDlg('🎯 Plan – '+who,PLAN_G.map(g=>{const[lo,hi]=bandOf(P.g[g]);return`<div class="r1 mini"><span>${GN(g)}</span><b class="num">${P.g[g]}% <em>(${String(lo).replace('.',',')}–${String(hi).replace('.',',')}%)</em></b></div>`}).join('')+`<div class="mini">Stan i paski „jest / ma być” są pod kołem majątku.</div><button class="btn" onclick="advClose();openPlan()">📄 Cały plan</button>`)}
const tNumUI=t=>t=='?'?0:+t;

/* 💸 „Chcę zainwestować … zł” – a short survey (plan 4.2) and the answer „gdzie” */
export function openWhere(){if(guard())return;use('f:gdzie');S.adv='where';S.advRes=null;window.scrollTo(0,0);render()}
function whereCtx(mode){const who=S.who,A=ankOf(who),ctx=ankCtx(who),people=mode=='both'?['Mati','Wercia']:[who],W=advW().ank||{};
  const P=people.map(p=>{const w=wrapsOf(p),b=S.hraw?.birth?.[p];return{who:p,t:taxOf(ankOf(p)),ike:w.ike,ikze:w.ikze,age:b?+td().slice(0,4)-+b.slice(0,4):null}});
  const cons=ctx.debtList.filter(d=>d.kind!='hip'&&d.left>0),mort=ctx.debtList.find(d=>d.kind=='hip'&&d.left>0),tg=+(W.q17||A.q17||6)||6,plan=planFor(mode=='both'?'all':who);
  return{P,ctx:{debt:{sum:cons.reduce((s,d)=>s+d.left,0),rate:Math.max(0,...cons.map(d=>+d.rate||0))||null,name:cons.map(d=>d.name).join(', ')},podGap:Math.max(0,Math.round(ctx.exp*tg-ctx.cush)),
    mort:W.q20=='yes'&&mort?{rate:+mort.rate||0,fee:W.q20c=='yes'}:null,overpay:W.q20=='yes'&&mort?+(W.q59||0):0,today:td(),okiOk:td()>='2027-01-01'&&['yes','maybe'].includes(A.q40),
    sandLeft:plan?.sand?sandNow(mode=='both'?'all':who).sand.left:null},A,W}}
export function calcWhere(){const v=id=>document.getElementById(id)?.value,amt=pg(v('wAmt')||'0');if(!(amt>0))return toast('Wpisz kwotę','bad');
  S.advIn={amt,src:v('wSrc'),goal:v('wGoal'),need3:v('wNeed')=='1',mode:v('wMode'),chg:v('wChg')};const{P,ctx,W}=whereCtx(S.advIn.mode);
  S.advRes=whereP({...S.advIn,homeSoon:+(W.q32a||99)<=3},P,ctx);S.advRes.P=P;use('f:policz');render();setTimeout(()=>document.getElementById('wRes')?.scrollIntoView({behavior:'smooth'}),60)}
export function wherePageH(){const I=S.advIn||{amt:0,src:'surplus',goal:'plan',need3:false,mode:'me',chg:'no'},R=S.advRes,sel=(id,val,o)=>`<select id="${id}">${o.map(([k,l])=>`<option value="${k}"${k==val?' selected':''}>${esc(l)}</option>`).join('')}</select>`;
  let h=`<button class="btn sm" style="align-self:flex-start" onclick="closeAdv()">‹ Oszczędności</button><section class="chart where"><div class="ct"><b>💸 Gdzie wpłacić?</b><span class="mini">kotki liczą według Waszego planu, progu podatkowego i limitów</span></div>
    <label class="fld"><span>Chcę teraz zainwestować (zł)</span><input id="wAmt" inputmode="decimal" value="${I.amt?String(I.amt/100):''}" placeholder="np. 5000"></label>
    <label class="fld"><span>Skąd te pieniądze?</span>${sel('wSrc',I.src,[['surplus','nadwyżka z miesiąca'],['bonus','premia, zwrot podatku'],['sale','sprzedaż czegoś'],['pod','z poduszki']])}</label>
    <label class="fld"><span>Na jaki cel?</span>${sel('wGoal',I.goal,[['plan','zgodnie z planem'],['ret','tylko emerytura'],['home','mieszkanie'],['pod','poduszka'],['sand','piaskownica (pojedyncze spółki)']])}</label>
    <label class="fld"><span>Czy możesz ich potrzebować w ciągu 3 lat?</span>${sel('wNeed',I.need3?'1':'0',[['0','nie'],['1','tak']])}</label>
    <label class="fld"><span>Czy coś się zmieniło od ankiety (praca, próg, kredyt, dziecko)?</span>${sel('wChg',I.chg,[['no','nie'],['yes','tak']])}</label>
    <label class="fld"><span>Dla kogo liczyć?</span>${sel('wMode',I.mode,[['me','dla mnie ('+S.who+')'],['both','wspólnie – podziel między nas dwoje']])}</label>
    <button class="btn primary" onclick="calcWhere()">🐾 Policz</button></section>`;
  if(I.chg=='yes'&&R)h+=`<div class="note">🐾 Coś się zmieniło? Popraw odpowiedzi w ankiecie (📝), wtedy wynik będzie dokładniejszy. <button class="chip" onclick="openAnk()">📝 Ankieta</button></div>`;
  if(!R)return h;const sum=R.rows.reduce((s,x)=>s+x.a,0);
  h+=`<section class="chart" id="wRes"><div class="ct"><b>📍 Gdzie</b><span class="mini">${zl0(sum)} · ${R.P.map(p=>`${p.who}: próg ${p.t=='?'?'nieznany':p.t=='19'?'liniowy':p.t+'%'}`).join(' · ')}</span></div>`+
    R.rows.map((x,i)=>`<details class="wrow"${i==0?' open':''}><summary><span class="an">${esc(x.where)}</span><b class="num">${zl0(x.a)}</b></summary><div class="mini">${esc(x.why)}</div></details>`).join('')+
    (R.noStocks?`<div class="note bad">🐾 Akcje nie teraz – najpierw bezpieczne miejsca.</div>`:'')+`</section>`+wherePlusH(R);
  const me=R.P.find(p=>p.who==S.who)||R.P[0],wr=R.rows.find(x=>(x.kind=='ike'||x.kind=='ikze')&&x.who==me.who)||R.rows.find(x=>x.kind=='ike'||x.kind=='ikze');
  if(wr){const p=R.P.find(q=>q.who==wr.who)||me,years=Math.max(5,65-(p.age||35)),C=wrapCompare(wr.a,years,p.t);
    h+=`<section class="chart"><div class="ct"><b>⚖️ IKE, IKZE czy zwykłe konto?</b><span class="mini">${zl0(wr.a)} na ${years} lat (do 65. roku życia) · założenie 5% rocznie, to nie prognoza</span></div>
      <div class="r1"><span>🛡️ IKE (bez podatku)</span><b class="num">${zl0(C.ike)}</b></div><div class="r1"><span>🛡️ IKZE (10% przy wypłacie, zwrot z PIT ${zl0(C.back)} też zainwestowany)</span><b class="num">${zl0(C.ikze)}</b></div><div class="r1"><span>📂 Zwykły rachunek (19% od zysku)</span><b class="num">${zl0(C.reg)}</b></div>
      <div class="mini">Ten sam wzór dla wszystkich trzech – różnicę robią tylko podatki. IKZE wygrywa tylko wtedy, gdy zwrot podatku naprawdę inwestujesz.</div></section>`}
  h+=`<section class="chart"><div class="ct"><b>🚫 Na pewno nie tu</b></div>${R.no.map(x=>`<div class="mini"><b>${esc(x.t)}</b> – ${esc(x.why)}</div>`).join('')}</section>`;
  return h}

/* ======================= D4: 🛒 „W co”, kalkulator obligacji, zapisane porady ======================= */
const advLog=()=>S.hraw?.advLog||{};
function priceOf(e){const m=mkt(),sym=etfSym(e),q=m?.prices?.[sym]||m?.prices?.[e.t+'.'+e.ex];if(q?.p)return{p:q.p,cur:q.cur||e.cur,d:q.d};
  const h=Object.values(S.hold||{}).find(x=>!x.deleted&&etfOf(x)?.isin==e.isin&&x.price);return h?{p:+h.price,cur:h.cur||e.cur,d:h.priceDate}:null}
const fxOfCur=c=>!c||c=='PLN'?1:mkt()?.fx?.[c]||null;
/* the purchase list for the long-term part of the answer: fills what is missing in the plan */
export function buyListP(R,mode){const owner=mode=='both'?'all':S.who,plan=planFor(owner);const L=R.rows.filter(x=>['ike','ikze','reg'].includes(x.kind)).reduce((s,x)=>s+x.a,0);
  if(!plan||!L)return{plan,L,buys:[]};
  if(R.noStocks)return{plan,L,safe:true,tr:[],after:[],buys:[{g:'bond',name:'Na razie bezpiecznie: obligacje skarbowe EDO albo gotówka na IKE / IKZE',a:L,units:Math.floor(L/10000),where:'IKE/IKZE w XTB – wpłata zostaje jako gotówka; poza IKE – obligacjeskarbowe.pl',why:'Poduszka jeszcze niedokończona albo pieniądze mogą być potrzebne wcześniej – akcje dokupicie później. Limit IKE/IKZE liczy się od wpłaty, nie od zakupu.'}]};const A=allocNow(owner),D=devP(A,plan),F=fillP(L,D,plan),held=Object.values(S.hold||{}).filter(h=>!h.deleted),buys=[];
  if(F.stock>0)for(const[c,pc]of Object.entries(plan.split||{s_world:100})){const a=Math.round(F.stock*pc/100);if(a<=0)continue;const e=pickEtf(c,held);
    if(!e){buys.push({g:'stock',name:clsAll(custom())[c]?.n||c,a,where:'XTB – wybierz tani, szeroki ETF tego regionu',why:'Nie mam go na liście – kryteria jak w „🔎 Analiza funduszy”.'});continue}
    const pr=priceOf(e),fx=pr?fxOfCur(pr.cur):null,u=unitsP(a,pr?.p,pr?.cur||e.cur,fx);
    buys.push({g:'stock',name:e.n,ticker:etfSym(e),isin:e.isin,a,fee:u.fee,units:u.units,price:pr?.p,cur:pr?.cur||e.cur,where:'XTB – na IKE / IKZE z listy wyżej',why:`${COV[e.cov]} · koszt ${String(e.ter).replace('.',',')}% rocznie · ISIN ${e.isin}${held.some(h=>etfOf(h)?.isin==e.isin)?' · już go macie – dokupcie ten sam':''}`})}
  if(F.bond>0)buys.push({g:'bond',name:'Obligacje skarbowe EDO (10-letnie, inflacja + marża)',a:F.bond,units:Math.floor(F.bond/10000),where:'obligacjeskarbowe.pl / PKO BP (rachunek obligacji albo IKE-Obligacje)',why:'Chronią przed inflacją, nie spadają z giełdą. W IKE w XTB obligacji detalicznych nie kupisz – na IKE trzymajcie akcje, obligacje obok.'});
  if(F.gold>0)buys.push({g:'gold',name:'Złoto: ETC na złoto fizyczne (w IKE/IKZE) albo moneta 1 uncja',a:F.gold,where:F.gold<1000000?'XTB – ETC na złoto fizyczne (sprawdź w XTB nazwę i koszt)':'mennica / dealer – moneta 1 oz (marża do ok. 5%)',why:`Polisa na kryzys i słabego złotego.${mkt()?.gold?` Uncja dziś ok. ${zl0(Math.round(mkt().gold*31.1035*100))}.`:''}`});
  if(F.cash>0)buys.push({g:'cash',name:'Gotówka – „suchy proch” na konto oszczędnościowe',a:F.cash,where:'konto oszczędnościowe',why:'Zgodnie z planem – na okazje w czasie przeceny.'});
  const st=F.stock,tr=tranchesP(st,D.base,td()),after=D.G.map(x=>({g:x.g,t:x.t,now:D.base+L?Math.round((x.now*D.base/100+F[x.g])/(D.base+L)*1000)/10:0}));
  return{plan,L,buys,tr,after,D}}
export function wherePlusH(R){const mode=S.advIn?.mode||'me',B=buyListP(R,mode);let h='';
  if(!B.plan)h+=`<div class="note">🐾 „W co” policzę, gdy będzie zatwierdzony plan (📄 Plan → ✓ Zatwierdzam).</div>`;
  else if(B.buys.length){h+=`<section class="chart"><div class="ct"><b>🛒 W co</b><span class="mini">${zl0(B.L)} na część długoterminową – dokupujemy to, czego brakuje w planie</span></div>`+
    (thermoNow().lvl=='hot'&&!B.tr.length&&B.buys.some(b=>b.g=='stock'&&b.a>=200000)?`<div class="note">🌡️ Termometr: akcje drogo – rozważ podzielenie zakupu akcji na 2–4 części w kolejnych miesiącach.</div>`:'')+
    B.buys.map(b=>`<div class="buy"><div class="r1"><b>${esc(b.name)}</b><b class="num">${zl0(b.a)}</b></div>${b.ticker?`<div class="mini">🔤 ${esc(b.ticker)} · ${b.units!=null?`ok. <b>${String(b.units).replace('.',',')} j.</b> po ${String(b.price).replace('.',',')} ${esc(b.cur)}`:'liczba jednostek – według ceny w XTB'}${b.fee?` · wymiana waluty 0,5% ≈ ${zl0(b.fee)}`:' · bez prowizji'}</div>`:''}${b.g=='bond'?`<div class="mini">🧾 ${b.units} szt. po 100 zł</div>`:''}
      <div class="mini">📍 ${esc(b.where)}</div><div class="mini">${esc(b.why)}</div></div>`).join('')+
    (B.tr.length?`<div class="note">🐾 To duża kwota w akcje (ponad 10% części długoterminowej) – rozłóżcie ją na ${B.tr.length} równe zakupy, raz w miesiącu: ${B.tr.map(t=>`${dmy(t.date)} ${zl0(t.a)}`).join(' · ')}. Kupujcie zleceniem z limitem ceny.</div>`:`<div class="mini">💡 Kupujcie zleceniem z limitem ceny. W XTB prowizja 0 zł, każda wymiana waluty 0,5% (stan na ${dmy(XTB.at)}).</div>`)+
    (B.safe?'':`<div class="mini"><b>Po zakupie:</b> ${B.after.map(x=>`${AGRP[x.g].i} ${String(x.now).replace('.',',')}% (plan ${x.t}%)`).join(' · ')}</div>`)+`
    <div class="g2"><button class="btn primary" onclick="saveAdvice()">💾 Zapisz poradę</button>${B.plan.save?`<button class="btn" onclick="advFixed()">📌 Stały przelew ${zl0(B.plan.save)}/mies.</button>`:''}</div></section>`}
  /* 🧮 bond calculator */
  const off=bondOffer(),M=S.bondM||36,amt=R.rows.filter(x=>['pod','safe'].includes(x.kind)).reduce((s,x)=>s+x.a,0)||1000000;
  h+=`<section class="chart"><div class="ct"><b>🧮 Która obligacja da najwięcej?</b><span class="mini">${zl0(amt)} · obecna oferta, inflacja i stopa NBP jak dziś – porównanie, nie prognoza</span></div>
    <div class="seg seg5">${[12,24,36,48,120].map(m=>`<button aria-pressed="${M==m}" onclick="setBondM(${m})">${m<24?'1 rok':m<120?m/12+' lata':'10 lat'}</button>`).join('')}</div>`;
  if(!off)h+=`<div class="mini">Oferta obligacji na ten miesiąc jeszcze nie pobrana – automat sprawdza ją wieczorem.</div>`;
  else{const L=bondPickP(M,amt,off,macro(),false);h+=L.map((x,i)=>`<div class="r1 mini"><span>${i==0?'🏆 ':''}<b>${x.t}</b> – ${esc(BONDS[x.t].n.split(' – ')[1]||'')}</span><b class="num">${zl0(x.v)} <em>(+${zl0(x.v-amt)})</em></b></div>`).join('')+`<div class="mini">Po podatku Belki i opłacie za wcześniejszy wykup (gdy obligacja dłuższa niż okres). Rodzinne ROS/ROD – tylko z 800+.</div>`}
  h+='</section>';
  const L=Object.entries(advLog()).filter(([,x])=>x&&!x.deleted&&(x.who==S.who||x.mode=='both')).sort((a,b)=>b[1].at-a[1].at).slice(0,5);
  if(L.length)h+=`<section class="chart"><div class="ct"><b>📋 Zapisane porady</b><span class="mini">odhaczam same, gdy wpiszesz zakup albo przelew</span></div>${L.map(([id,x])=>{const d=adviceDoneP(x,S.hold,liveOf(S.tx),S.cfg);
    return`<details class="wrow"><summary><span class="an">${dmy(new Date(x.at).toISOString().slice(0,10))} · ${zl0(x.amt)}</span><b class="num">${d.n==d.of&&d.of?'✅':`${d.n}/${d.of}`}</b></summary>${[...d.rows.filter(r=>r.kind=='ike'||r.kind=='ikze'),...d.buys].map(r=>`<div class="mini">${r.done?'✅':'⬜'} ${esc(r.where&&!r.g?r.where:r.name)} – ${zl0(r.a)}</div>`).join('')}<button class="chip" onclick="delAdvice('${id}')">🗑️ Usuń poradę</button></details>`}).join('')}</section>`;
  return h}
export function setBondM(m){S.bondM=m;render()}
export function saveAdvice(){if(guard())return;const R=S.advRes;if(!R)return;const B=buyListP(R,S.advIn?.mode||'me'),id='av'+rid();
  const x={at:Date.now(),who:S.who,mode:S.advIn?.mode||'me',amt:S.advIn.amt,rows:R.rows.map(({a,where,kind,who})=>({a,where,kind,who})),buys:B.buys.map(({g,name,ticker,isin,a,units})=>({g,name,a,...(ticker?{ticker,isin}:{}),...(units!=null?{units}:{})})),tr:B.tr||[],deleted:false};
  S.hraw={...S.hraw,advLog:{...advLog(),[id]:x}};merge(H,{advLog:{[id]:x}});use('f:porada');toast('💾 Porada zapisana – odhaczę ją, gdy wpiszesz zakup');render()}
export function delAdvice(id){if(guard())return;const x=advLog()[id];if(!x)return;S.hraw={...S.hraw,advLog:{...advLog(),[id]:{...x,deleted:true}}};merge(H,{advLog:{[id]:{deleted:true}}});toast('Usunięto poradę');render()}
export function advFixed(){const who=S.who,P=planFor(who)||planFor('all'),to=S.cfg.accs.find(a=>!a.archived&&['ike','ikze'].includes(wrapOf(a))&&ownerOf(a)==who)||S.cfg.accs.find(a=>!a.archived&&a.grp=='inv'&&wrapOf(a)!='ppk');
  editFixedTr(null,{name:'Inwestycje co miesiąc',amount:P?.save||0,day:10,...(to?{to:to.id}:{})})}

/* ======================= D5: 🎯 cele – emerytura, mieszkanie, kryzysy, koszty, najem, zakup ======================= */
export function openGoals(){use('f:cele');S.adv='goals';window.scrollTo(0,0);render()}
/* net income a month: from payslips of the last 6 months (person or both); without payslips – household income from the budget */
function netInc(who){const from=addMonths(td().slice(0,7),-6);let s=0;const ms=new Set();for(const[ym,sl]of Object.entries(S.slips||{})){if(ym<from)continue;for(const x of Object.values(sl||{}))if(x&&(!who||x.who==who)&&x.net){s+=x.net;ms.add(ym)}}
  if(ms.size)return Math.round(s/ms.size);const tx=liveOf(S.tx),cur=td().slice(0,7);let inc=0,n=0;for(let k=1;k<=6;k++){const g=agg(S.cfg,tx,addMonths(cur,-k));if(g.inc){inc+=g.inc;n++}}return n?Math.round(inc/n/(who?2:1)):0}
const mRate=()=>Math.round(((+macro().nbp||4)+2)*100)/100;
function buyCtx(){const A=allocNow('all'),W=advW().ank||{},ctx=ankCtx(S.who),liquid=A.rows.filter(r=>{const a=S.cfg.accs.find(x=>x.id==r.acc);return!a||!['ike','ikze','oki'].includes(wrapOf(a))}).reduce((s,r)=>s+r.v,0);
  const y=+td().slice(0,4),gl=[...(ankOf('Mati').q27||[]),...(ankOf('Wercia').q27||[])].filter(g=>g&&g.a&&g.y&&g.y<=y+3).reduce((s,g)=>s+g.a,0);
  return{A,W,ctx,liquid,near:gl,income:netInc(null),cons:ctx.debtList.filter(d=>d.kind!='hip'&&d.left>0).length,podM:+(W.q17||6)||6}}
/* 🏠 the purchase checks for a flat for yourselves (no home yet) and for rent – only when the survey does not say „no” (decision 20) */
export function buyChecks(){const B=buyCtx(),W=B.W,R=realNow('all'),out=[],loan=W.q20!='no';
  if(!R.list.some(x=>x.home)&&['yes','maybe'].includes(W.q32)&&W.q33>0)out.push({kind:'home',price:+W.q33,...buyCheckP({price:+W.q33,kind:'home',liquid:B.liquid,near:B.near,exp:B.ctx.exp,podM:B.podM,income:B.income,surplus:B.ctx.surplus,consDebt:B.cons,rate:mRate(),loanOk:loan,downPct:+(W.q33b||20)||20,first:W.q32c!='no',stay:W.q32b})});
  if(['yes','maybe'].includes(W.q29)&&['yes','maybe'].includes(W.q34)&&W.rentPrice>0)out.push({kind:'rent',price:+W.rentPrice,...buyCheckP({price:+W.rentPrice,kind:'rent',liquid:B.liquid,near:B.near,exp:B.ctx.exp,podM:B.podM,income:B.income,surplus:B.ctx.surplus,consDebt:B.cons,rate:mRate(),loanOk:loan&&W.q34c!='cash',downPct:20,first:false,rent:+(W.rentRent||0),costs:+(W.q35||0)})});
  return{B,out}}
/* 🔔 „może warto pomyśleć o zakupie” – a quiet point in Na dziś, at most once a half-year (checkIgnore real:RRRR-H1|H2) */
export function advTodo(){try{if(!S.cfg||!S.hraw?.advM)return[];const ig=S.hraw?.checkIgnore||{},t=td(),key='real:'+t.slice(0,4)+'-H'+(+t.slice(5,7)<=6?1:2),mine=advTodoMine().filter(x=>!ig[x.key]);if(ig[key]||!S.hraw?.advW)return mine;
  const ok=buyChecks().out.filter(x=>x.ok);if(!ok.length)return mine;return[...mine,{key,icon:'🏠',text:`Kotki policzyły: stać Was na ${ok[0].kind=='home'?'mieszkanie dla siebie':'mieszkanie na wynajem'} (${zl0(ok[0].price)}) bez ruszania poduszki. Może warto pomyśleć o zakupie – zobacz liczby, za i przeciw.`,go:{a:'goals'},label:'Zobacz',k:'plan',who:null,quiet:true}]}catch(e){return[]}}
export async function setRentPrice(){if(guard())return;const W=advW().ank||{};const r=await ask({title:'🏘️ Mieszkanie na wynajem – liczby do sprawdzenia',text:'Kotki sprawdzą, czy Was stać, i policzą rentowność. Wpisz ceny z ogłoszeń w Waszej okolicy.',fields:[
  {id:'p',label:'Cena mieszkania (zł)',type:'decimal',value:W.rentPrice?String(W.rentPrice/100):''},{id:'r',label:'Czynsz najmu miesięcznie (zł)',type:'decimal',value:W.rentRent?String(W.rentRent/100):''},{id:'c',label:'Koszty miesięcznie (administracja, fundusz remontowy, podatki, ubezpieczenie) (zł)',type:'decimal',value:W.q35?String(W.q35/100):''}],ok:'Zapisz'});
  if(!r)return;const x={rentPrice:pg(r.p||'0'),rentRent:pg(r.r||'0'),q35:pg(r.c||'0')};S.hraw={...S.hraw,advW:{...advW(),ank:{...W,...x}}};merge(H,{advW:{ank:x}});render()}
export function goalsPageH(){const who=S.who,A=ankOf(who),W=advW().ank||{},ctx=ankCtx(who),y=+td().slice(0,4),birth=S.hraw?.birth?.[who],age=birth?y-+birth.slice(0,4):null,P=planFor(who);
  let h=`<button class="btn sm" style="align-self:flex-start" onclick="closeAdv()">‹ Oszczędności</button>`;
  /* 🌴 retirement */
  h+=`<section class="chart"><div class="ct"><b>🌴 Emerytura – ${esc(who)}</b><span class="mini">w dzisiejszych złotych · bez PPK · założenie: 2,5% ponad inflację przed emeryturą, 1% w czasie</span></div>`;
  if(!(A.q23||[]).includes('ret')||!(A.q24>0)||!(A.q24b>0)||age==null)h+=`<div class="mini">🐾 Do policzenia potrzebuję: daty urodzenia, wieku przejścia na emeryturę i kwoty „na rękę” (ankieta, dział „Cele” – zaznacz emeryturę).</div><button class="chip" onclick="openAnk()">📝 Ankieta</button>`;
  else{const zusB=A.q25>0?+A.q25:null,inc=netInc(who),zusNet=zusB?pensionNet(zusB):Math.round(inc*0.25),cap=devP(allocNow(who),{g:{cash:0,bond:0,stock:0,gold:0}}).base,Rt=retireP({age,retAge:+A.q24,want:+A.q24b,zusNet,until:+(A.q26||95)||95,cap,save:P?.save||0});
    h+=`<div class="r1 mini"><span>Chcesz mieć na rękę</span><b class="num">${zl0(+A.q24b)}/mies.</b></div><div class="r1 mini"><span>ZUS ${zusB?`(prognoza ${zl0(zusB)} brutto → netto)`:'(nie wiem – ostrożnie 25% dzisiejszych dochodów)'}</span><b class="num">− ${zl0(zusNet)}</b></div>
      <div class="r1"><b>Luka</b><b class="num">${zl0(Rt.gap)}/mies.</b></div><div class="mini">Od ${A.q24} do ${A.q26||95} roku życia (${Rt.m} lat) to kapitał ok. <b>${zl0(Rt.need)}</b>. To, co macie dziś (${zl0(cap)}), urośnie do ok. ${zl0(Rt.fv)} za ${Rt.n} lat.</div>
      <div class="note ${Rt.ok?'':'bad'}">🐾 Trzeba odkładać ok. <b>${zl0(Rt.pmt)} miesięcznie</b>${P?.save?` – w planie masz ${zl0(P.save)}, co da ok. ${zl0(Rt.saveFv)} (${Rt.ok?'starczy ✓':'za mało'})`:''}. Odkładanie przez IKE/IKZE daje więcej, bo bez podatku.</div>
      <div class="mini">Prognozę ZUS znajdziesz na PUE/eZUS → „Kalkulator emerytalny”. Każde 5 lat później to dużo mniejsza miesięczna kwota – ale i wcześniej warto zacząć.</div>`}
  h+='</section>';
  /* 🏡 a flat for yourselves */
  const R=realNow('all');
  if(!R.list.some(x=>x.home)&&['yes','maybe'].includes(W.q32)){h+=`<section class="chart"><div class="ct"><b>🏡 Mieszkanie dla siebie</b><span class="mini">zasada 30/20/20 · kredyt: stopa NBP + 2 pkt = ${String(mRate()).replace('.',',')}% (założenie)</span></div>`;
    if(!(W.q33>0))h+=`<div class="mini">🐾 Wpisz w ankiecie szacowaną cenę (dział „Nieruchomości”).</div>`;
    else{const Hm=homeP({price:+W.q33,downPct:+(W.q33b||20)||20,first:W.q32c!='no',saved:+(W.q33c||0),surplus:Math.max(0,ctx.surplus),income:netInc(null),rate:mRate(),exp:ctx.exp,podM:+(W.q17||6)||6,loanOk:W.q20!='no'});
      h+=`<div class="r1 mini"><span>Cena</span><b class="num">${zl0(+W.q33)}</b></div><div class="r1 mini"><span>${W.q20=='no'?'Cała cena (bez kredytu)':`Wkład ${W.q33b||20}%`}</span><b class="num">${zl0(Hm.down)}</b></div><div class="r1 mini"><span>Koszty zakupu (notariusz, opłaty${W.q32c=='no'?', PCC 2%':''})</span><b class="num">${zl0(Hm.costs)}</b></div>
        <div class="r1"><b>Brakuje</b><b class="num">${zl0(Hm.missing)}</b></div><div class="mini">${Hm.missing?Hm.months?`Przy obecnej nadwyżce (${zl0(Math.max(0,ctx.surplus))}/mies.) ok. <b>${Hm.months} mies.</b> (${(Hm.months/12).toFixed(1).replace('.',',')} roku).`:'Bez nadwyżki w budżecie – trzeba ją najpierw zbudować.':'✓ Wkład i koszty już są.'}</div>
        ${Hm.loan?`<div class="mini">Kredyt ${zl0(Hm.loan)} na 20 lat: rata ok. ${zl0(Hm.rata)}, z buforem banku (+2,5 pkt) ${zl0(Hm.stress)}${Hm.share!=null?` = <b class="${Hm.ok30?'t-inc':'t-exp'}">${String(Hm.share).replace('.',',')}% dochodów</b> (bezpiecznie do 30%)`:''}.</div>`:''}
        <div class="mini">Poduszka po zakupie (z ratą): ok. ${zl0(Hm.pod)}. Wkład trzymajcie bezpiecznie – przy terminie do 3 lat konto, lokata, obligacje 3-letnie; od 2027 OKI.</div>`}
    h+='</section>'}
  /* ⚡ crises */
  const AA=allocNow('all'),C=crisesP(AA.rows,custom());
  h+=`<section class="chart"><div class="ct"><b>⚡ Test kryzysu w złotych</b><span class="mini">Wasze dzisiejsze aktywa (${zl0(AA.total)}) w trzech historycznych kryzysach · nieruchomości bez zmiany wyceny</span></div>${C.map(c=>`<div class="r1"><span>${esc(c.n)}</span><b class="num ${c.zl<0?'t-exp':'t-inc'}">${c.zl<0?'−':'+'}${zl0(Math.abs(c.zl))} <em>(${String(c.pct).replace('.',',')}%)</em></b></div><div class="mini">${esc(c.note)}</div>`).join('')}
    <div class="mini">Ostrożnie: złoto liczę za połowę jego zysku z 2008, pojedyncze spółki i krypto ×1,4 spadku akcji. Akcje odrabiały takie spadki od kilku miesięcy (2020) do kilkunastu lat (2000).${P?` Wasz plan w kryzysie 2008: ${zl0(Math.abs(crisisP(P.g,devP(AA,P).base).zl))}.`:''}</div></section>`;
  /* 💸 costs */
  const K=costsP(AA.rows,S.hold,A.q38>0?+A.q38:null);
  h+=`<section class="chart"><div class="ct"><b>💸 Strażnik kosztów</b><span class="mini">ile rocznie kosztują Wasze fundusze (opłata za zarządzanie)</span></div>${K.list.length?K.list.map(x=>`<div class="r1 mini"><span>${esc(x.name)}${x.pct!=null?` · ${String(x.pct).replace('.',',')}%`:''}</span><b class="num ${x.pct>1?'t-exp':''}">${x.zl!=null?zl0(x.zl)+'/rok':'koszt nieznany'}</b></div>`).join('')+`<div class="r1"><b>Razem</b><b class="num">${zl0(K.year)}/rok</b></div><div class="mini">Przez 20 lat to co najmniej ${zl0(K.year*20)}.${K.bad.length?` 🚩 Ponad 1% rocznie: ${esc(K.bad.map(x=>x.name).join(', '))} – warto przenieść (wypłata transferowa IKE/IKZE nie traci ulg).`:' ✓ Nic drogiego.'}${K.unknown?' Koszt funduszy spoza listy wpiszesz w ankiecie (pytanie o KID).':''} W XTB: prowizja 0 zł, wymiana waluty 0,5%.</div>`:'<div class="mini">Brak funduszy na kontach (poza PPK) – obligacje skarbowe i konta nie mają opłat za zarządzanie.</div>'}</section>`;
  /* 🏘️ rentals */
  const rents=R.list.filter(x=>x.use=='rent'&&x.rent>0);
  if(rents.length){const edo=(+macro().infl||0)+2;h+=`<section class="chart"><div class="ct"><b>🏘️ Najem – liczby</b><span class="mini">fakty, nie prognozy · 10,5 miesiąca najmu w roku · ryczałt 8,5%</span></div>`+rents.map(x=>{const N=rentP({value:x.value,rent:x.rent,costs:+(W.q35||0),debt:x.debt});
    return`<div class="mini"><b>${esc(x.name)}</b>: czynsz ${zl0(x.rent)}/mies. → po kosztach i ryczałcie ${zl0(N.net)}/rok = <b>${String(N.yld).replace('.',',')}%</b> wartości${N.own!=null&&x.debt?` (na własnym wkładzie ${String(N.own).replace('.',',')}%)`:''}. Dla porównania EDO dziś ok. ${String(edo.toFixed(1)).replace('.',',')}% (inflacja + 2 pkt), bez pracy i pustostanów.</div>`}).join('')+`<div class="mini">Odkładajcie na remont co 5–7 lat. ${W.q35?'':'Koszty miesięczne dopisz przyciskiem niżej.'}</div><button class="chip" onclick="setRentPrice()">✎ Koszty i liczby najmu</button></section>`}
  /* 🏠 can you afford a purchase */
  const BC=buyChecks();if(['yes','maybe'].includes(W.q29)&&['yes','maybe'].includes(W.q34)||BC.out.length){
    h+=`<section class="chart"><div class="ct"><b>🏠 Czy stać Was na zakup?</b><span class="mini">kotki sprawdzają warunki, nie przewidują cen</span></div>`;
    if(!BC.out.some(x=>x.kind=='rent')&&['yes','maybe'].includes(W.q34))h+=`<div class="mini">🐾 Mieszkanie na wynajem: wpisz cenę i czynsz z ogłoszeń, a sprawdzę warunki.</div><button class="chip" onclick="setRentPrice()">✎ Wpisz liczby</button>`;
    for(const x of BC.out){const work=R.work.value+x.price,after=Math.round(work/(work+Math.max(0,AA.total-x.H.need))*100);
      h+=`<div class="mini" style="margin-top:6px"><b>${x.kind=='home'?'🏡 Dla siebie':'🔑 Na wynajem'} – ${zl0(x.price)}</b></div>${x.c.map(c=>`<div class="mini">${c.ok?'✅':'⛔'} ${esc(c.t)}</div>`).join('')}
        <div class="note ${x.ok?'':'bad'}">🐾 ${x.ok?`Stać Was. Może warto pomyśleć o zakupie – po zakupie nieruchomości to ok. ${after}% majątku, który pracuje.`:`Na razie nie – blokuje: ${esc(x.c.filter(c=>!c.ok).map(c=>c.s).join('; '))}.`}</div>`}
    h+=`<details class="info"><summary>⚖️ Za i przeciw (z lektury)</summary><div class="mini">➕ realnie 3–4% netto z najmu + wzrost wartości; czynsz rośnie z inflacją; dźwignia kredytu.<br>➖ koszty zakupu i remontów, czas (najemcy, naprawy), 1–2 miesiące pustostanu w roku, brak płynności (sprzedaż trwa miesiące), dźwignia działa w obie strony, nieruchomości nie zawsze rosną (cykl ok. 16–17 lat). Na mieszkaniu dla siebie nie spekulować.</div></details></section>`}
  return h}

/* ======================= D6: 🌡️ termometr i przypomnienia ======================= */
export const thermoNow=()=>thermoP(S.market?.thermo,mkt(),{today:td(),rule:ankOf(S.who).q61});
export function thermoH(){const T=thermoNow(),A=ankOf(S.who),pc=v=>String(v).replace('.',',');let b='';
  b+=T.stock?`<div class="mini">📈 <b>Akcje świata</b> (VWCE): ${pc(T.stock.dd)}% od szczytu z ${dmy(T.stock.peakD)}, ${T.stock.vs>=0?'+':''}${pc(T.stock.vs)}% względem średniej z 3 lat.</div>`:`<div class="mini">📈 Akcje: automat zbiera historię ceny funduszu świata (${T.n} dni) – termometr ruszy, gdy będzie jej więcej.</div>`;
  if(T.bond)b+=`<div class="mini">🧾 <b>Obligacje</b>: EDO dziś ${pc(T.bond.first)}% w 1. roku, potem inflacja + ${pc(T.bond.real)} pkt (inflacja ${pc(T.bond.infl)}%). Obligacje detaliczne kupuje się zawsze po 100 zł – nie mają „złego momentu”.</div>`;
  if(T.gold)b+=`<div class="mini">🥇 <b>Złoto</b>: realna stopa (NBP − inflacja) ${T.gold.real>=0?'+':''}${pc(T.gold.real)} pkt${T.gold.real>2?' – wysoka, złoto zwykle ma wtedy pod górkę':T.gold.real<0?' – ujemna, dla złota to zwykle sprzyjające tło':''}.</div>`;
  if(T.pln)b+=`<div class="mini">💵 <b>Złoty</b>: dolar ${pc(T.pln.usd)} zł, ${T.pln.vs>=0?'+':''}${pc(T.pln.vs)}% względem średniej z ${T.pln.n} dni.</div>`;
  if(T.lvl=='sale')b+=`<div class="note">🐾 ${A.q60&&A.q60!='?'?`Twój list do siebie: „${esc(A.q60)}”. `:''}${T.ruleHit?'Twoja reguła zadziałała: dokup akcji ze złota / obligacji do planu.':'Trzymaj plan – wpłaty dalej według niego.'}</div>`;
  b+=`<div class="mini">Termometr tylko informuje: przy „drogo” radzi transze dużych zakupów, przy „przecenie” przypomina Twoją regułę. Nie mówi, czy realizować plan – plan realizuje się zawsze.</div>`;
  return`<details class="more thermo"${S.infoOpen?.thermo?' open':''} ontoggle="infoTog('thermo',this.open)"><summary>🌡️ Termometr rynku: ${THERMO_TXT[T.lvl]}</summary>${b}</details>`}
export function advTodoMine(){const who=S.who,A=ankOf(who),plan=planOfWho(who),ctx=ankCtx(who),y=+td().slice(0,4),tx=liveOf(S.tx);
  const ikz=S.cfg.accs.filter(a=>!a.archived&&wrapOf(a)=='ikze'&&ownerOf(a)==who).reduce((s,a)=>s+paidInYear(tx,a.id,String(y-1)),0),w=wrapsOf(who);
  const trs=Object.entries(advLog()).filter(([,x])=>x&&!x.deleted&&x.who==who&&x.tr?.length).flatMap(([id,x])=>x.tr.map(t=>({...t,id,of:x.tr.length,at:new Date(x.at).toISOString().slice(0,10)})));
  const hits=wishHitP(wishes(),mkt()?.prices).filter(w=>!w.who||w.who==who).map(w=>({key:`sandw:${w.id}:${td().slice(0,7)}`,icon:'⭐',text:`${w.name}: cena ${String(w.q.p).replace('.',',')} – doszła do Twojego celu (${String(w.target).replace('.',',')}). Twój powód: „${w.why}”. Sprawdź limit piaskownicy przed zakupem.`,go:{a:'sand'},label:'Piaskownica',k:'plan',who,quiet:true}));
  return [...hits,...advRemindP({who,today:td(),plan,dev:plan?devP(allocNow(who),plan):null,ikeLeft:w.ike.has?w.ike.left:0,ikzePrevPaid:ikz,t:taxOf(A),podAmt:Math.round(ctx.exp*(+(A.q17||6)||6)),infl:+macro().infl||0,trs,planAt:plan?.at,thermo:thermoNow(),letter:A.q60&&A.q60!='?'?A.q60:'',rule:A.q61})]}

/* ======================= D7: 🧪 piaskownica ======================= */
const wishes=()=>S.hraw?.advSand||{};
export function sandNow(owner){const o=owner||'all',P=planFor(o==S.who?S.who:o)||planFor('all'),A=allocNow(o),base=P?devP(A,P).base:A.total;return{P,A,base,sand:sandP(A.rows,P,base,custom())}}
export function openSand(){use('f:piaskownica');S.adv='sand';S.sandRes=null;window.scrollTo(0,0);render()}
export function sandCalc(){const v=id=>document.getElementById(id)?.value||'',amt=pg(v('sAmt')||'0');if(!(amt>0))return toast('Wpisz kwotę','bad');if(!v('sName').trim())return toast('Wpisz nazwę','bad');
  S.sandIn={name:v('sName').trim().slice(0,60),ticker:v('sTick').trim().toUpperCase().slice(0,20),amt,kind:v('sKind'),region:v('sReg'),why:v('sWhy').trim().slice(0,400),sell:v('sSell').trim().slice(0,300),target:+String(v('sTgt')).replace(',','.')||0};
  const N=sandNow('all'),world=N.A.rows.filter(r=>r.cls=='s_world').reduce((s,r)=>s+r.v,0);S.sandRes=sandCheckP({amt,kind:S.sandIn.kind,region:S.sandIn.region,sand:N.sand,base:N.base,worldVal:world});use('f:analiza');render();setTimeout(()=>document.getElementById('sRes')?.scrollIntoView({behavior:'smooth'}),60)}
export function saveWish(){if(guard())return;const I=S.sandIn;if(!I)return;if(!I.why)return toast('🐾 Najpierw zapisz, dlaczego chcesz to kupić – to najważniejsze pole','bad');
  const id='sw'+rid(),x={...I,who:S.who,at:Date.now(),deleted:false};S.hraw={...S.hraw,advSand:{...wishes(),[id]:x}};merge(H,{advSand:{[id]:x}});use('f:zyczenie');toast('⭐ Na liście życzeń'+(I.ticker&&I.target?' – automat będzie pilnował ceny':''));S.sandRes=null;render()}
export function wishSet(id,k){if(guard())return;const x=wishes()[id];if(!x)return;const p=k=='del'?{deleted:true}:{bought:!x.bought};S.hraw={...S.hraw,advSand:{...wishes(),[id]:{...x,...p}}};merge(H,{advSand:{[id]:p}});render()}
export function sandPageH(){const N=sandNow('all'),Sd=N.sand,I=S.sandIn||{kind:'single',region:'usa'},R=S.sandRes,pc=v=>String(v).replace('.',','),sel=(id,val,o)=>`<select id="${id}">${Object.entries(o).map(([k,l])=>`<option value="${k}"${k==val?' selected':''}>${esc(l)}</option>`).join('')}</select>`;
  let h=`<button class="btn sm" style="align-self:flex-start" onclick="closeAdv()">‹ Oszczędności</button><section class="chart"><div class="ct"><b>🧪 Piaskownica</b><span class="mini">pojedyncze spółki, „tematy”, krypto, surowce – mały kawałek na eksperymenty, reszta w prostym planie</span></div>`;
  h+=`<div class="r1"><span>Limit z planu (${pc(N.P?.sand||0)}% części długoterminowej)</span><b class="num">${zl0(Sd.limit)}</b></div><div class="r1"><span>Teraz w piaskownicy</span><b class="num">${zl0(Sd.now)} <em>(${pc(Sd.pct)}%)</em></b></div>
    <div class="gbar"><i style="width:${Sd.limit?Math.min(100,Sd.now/Sd.limit*100).toFixed(1):0}%;${Sd.over?'background:#fb7185':''}"></i></div>
    <div class="mini">${Sd.over?`🐾 Ponad limit o ${zl0(Sd.over)} – nie dokupujcie; zyski stąd możecie przenieść do rdzenia planu.`:Sd.limit?`Zostało miejsca: <b>${zl0(Sd.left)}</b>.`:'🐾 W planie piaskownica ma 0% – w ankiecie bez pojedynczych spółek. Analiza niżej działa, ale doradca nic tu nie proponuje.'}</div>`;
  if(Sd.rows.length)h+=Sd.rows.map(r=>{const w=Object.values(wishes()).find(x=>x&&!x.deleted&&x.ticker&&symOf(x.ticker)==symOf(r.ticker));return`<div class="mini">• ${esc(r.name)} – ${zl0(r.v)}${w?`<br>&nbsp;&nbsp;💭 powód: „${esc(w.why)}”${w.sell?` · 🚪 sprzedam, gdy: „${esc(w.sell)}”`:''}`:''}</div>`}).join('');
  h+=`</section><section class="chart where"><div class="ct"><b>🔎 Co chcesz kupić?</b><span class="mini">fakty i pytania – bez „kup / sprzedaj”</span></div>
    <label class="fld"><span>Nazwa</span><input id="sName" value="${esc(I.name||'')}" placeholder="np. Nvidia, ETF na obronność, Bitcoin"></label>
    <label class="fld"><span>Symbol (nieobowiązkowo – automat będzie pilnował ceny)</span><input id="sTick" value="${esc(I.ticker||'')}" placeholder="np. NVDA.US, CDR, BTC"></label>
    <label class="fld"><span>Kwota (zł)</span><input id="sAmt" inputmode="decimal" value="${I.amt?I.amt/100:''}" placeholder="np. 2000"></label>
    <label class="fld"><span>Co to jest?</span>${sel('sKind',I.kind,SAND_KIND)}</label><label class="fld"><span>Gdzie na świecie?</span>${sel('sReg',I.region,SAND_REG)}</label>
    <label class="fld"><span>💭 Dlaczego chcesz to kupić? (Twoimi słowami)</span><textarea id="sWhy" rows="2">${esc(I.why||'')}</textarea></label>
    <label class="fld"><span>🚪 Kiedy sprzedasz? (cena albo warunek – zapisany z góry)</span><textarea id="sSell" rows="2" placeholder="np. gdy spadnie o 40% albo gdy przestanie rosnąć sprzedaż">${esc(I.sell||'')}</textarea></label>
    <label class="fld"><span>⭐ Kupię, gdy cena spadnie do (w walucie notowania, nieobowiązkowo)</span><input id="sTgt" inputmode="decimal" value="${I.target||''}"></label>
    <button class="btn primary" onclick="sandCalc()">🐾 Analizuj</button></section>`;
  if(R)h+=`<section class="chart" id="sRes"><div class="ct"><b>📋 ${esc(S.sandIn.name)} – fakty</b><span class="mini">${zl0(S.sandIn.amt)} = ok. ${pc(R.pctP)}% części długoterminowej</span></div>
    ${R.flags.map(f=>`<div class="note bad">⚠️ ${esc(f)}</div>`).join('')}${R.facts.map(f=>`<div class="mini">• ${esc(f)}</div>`).join('')}
    <div class="mini" style="margin-top:6px"><b>😈 Adwokat diabła – odpowiedz sobie szczerze:</b></div>${R.devil.map(q=>`<div class="mini">❓ ${esc(q)}</div>`).join('')}
    <div class="mini">Kupujesz w XTB na zwykłym rachunku (piaskownicy nie mieszamy z IKE/IKZE, gdzie jest rdzeń). Po zakupie wpisz go w 📊 Instrumenty.</div>
    <button class="btn primary" onclick="saveWish()">⭐ Zapisz na liście życzeń (z powodem i warunkiem sprzedaży)</button></section>`;
  const L=Object.entries(wishes()).filter(([,x])=>x&&!x.deleted).sort((a,b)=>b[1].at-a[1].at);
  if(L.length)h+=`<section class="chart"><div class="ct"><b>⭐ Lista życzeń</b><span class="mini">automat pilnuje ceny, gdy jest symbol – kotki dadzą znać w 🔔</span></div>${L.map(([id,x])=>{const q=x.ticker&&mkt()?.prices?.[x.ticker];
    return`<div class="buy"><div class="r1"><b>${x.bought?'✅ ':''}${esc(x.name)}${x.ticker?` <small>${esc(x.ticker)}</small>`:''}</b><b class="num">${zl0(x.amt)}</b></div>${q?.p?`<div class="mini">cena ${pc(q.p)} ${esc(q.cur||'')}${x.target?` · cel ${pc(x.target)}${q.p<=x.target?' – <b class="t-inc">osiągnięta</b>':''}`:''}</div>`:x.target?`<div class="mini">cel ${pc(x.target)} – cena pojawi się po wieczornym działaniu automatu</div>`:''}
      <div class="mini">💭 ${esc(x.why)}</div>${x.sell?`<div class="mini">🚪 ${esc(x.sell)}</div>`:''}<div class="btns" style="gap:6px"><button class="chip" onclick="wishSet('${id}','bought')">${x.bought?'↺ Jednak nie kupione':'✓ Kupione'}</button><button class="chip" onclick="wishSet('${id}','del')">🗑️ Usuń</button></div></div>`}).join('')}</section>`;
  return h}
