/* 🧭 Doradca – screens (D1a): 🥧 „Z czego składa się majątek” in 💰 Majątek → Oszczędności (groups → classes → instruments and accounts,
   tap = change the class), 🔎 the analysis of held funds and the list of known ETFs. Calculations in advisor.js. */
import {doc} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {AGRP,AGRP_ORDER,RISKS,COV,ETFS,ETF_AT,REAL_USE,realP,allocP,clsAll,clsOf,accClsOf,etfCheck,etfDup,etfOf,etfSym,guessCls} from './advisor.js';
import {donutSvg} from './charts.js';
import {liveOf,ownerOf} from './logic.js';
import {wrapOf} from './inv.js';
import {esc,rid,td,zl0,dmy,pg} from './util.js';
import {S,ask,toast,H,HOLD,merge,saveAcc,guard,infoH} from './core.js';
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
      <div class="mini">Razem z domem: <b style="color:var(--fg)">${zl0(tot+R.home.net)}</b>. Proporcje liczę z tego, co pracuje – bez mieszkania, w którym mieszkacie.</div>`}
  else if(lvl=='real'){h+=`<button class="btn sm" style="align-self:flex-start" onclick="advGrp()">‹ Wróć</button><div class="r1"><b>🏠 Nieruchomości</b><span class="num">netto ${zl0(R.work.net+R.home.net)}</span></div>`;
    h+=R.list.map(x=>`<button class="arow asub areal" onclick="editAsset('${x.id}')"><span class="an">${all[x.cls].i} ${esc(x.name)}<small>${x.home?'🏡 mieszkamy – nie zarabia':REAL_USE[x.use]||esc(all[x.cls].n)}${x.rent?' · czynsz '+zl0(x.rent)+'/mies.':''}${x.share<1?' · Twój udział '+Math.round(x.share*100)+'%':''}<br>wartość ${zl0(x.value)}${x.debt?' − kredyt '+zl0(x.debt):''}${x.valAt?' · wycena z '+dmy(x.valAt):''}</small></span><span class="num">${zl0(x.net)}</span><span class="ar">✎</span></button>`).join('')}
  else if(!lvl||lvl=='assets'){const segs=A.groups.map(x=>({l:AGRP[x.g].n,v:x.v,c:AGRP[x.g].c}));
    if(lvl)h+=`<button class="btn sm" style="align-self:flex-start" onclick="advGrp()">‹ Wróć</button><div class="r1"><b>📈 Aktywa</b><span class="num">${zl0(A.total)}</span></div>`;
    h+=A.rows.length?`<div class="dwrap">${donutSvg(segs,zl0(A.total),'razem')}<div class="arows">${grpRows(A)}</div></div>`:'<div class="mini">Brak aktywów poza nieruchomościami.</div>'}
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
