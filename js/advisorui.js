/* 🧭 Doradca – screens (D1a): 🥧 „Z czego składa się majątek” in 💰 Majątek → Oszczędności (groups → classes → instruments and accounts,
   tap = change the class), 🔎 the analysis of held funds and the list of known ETFs. Calculations in advisor.js. */
import {doc} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {AGRP,AGRP_ORDER,RISKS,COV,ETFS,ETF_AT,allocP,clsAll,clsOf,accClsOf,etfCheck,etfDup,etfOf,etfSym,guessCls} from './advisor.js';
import {donutSvg} from './charts.js';
import {liveOf,ownerOf} from './logic.js';
import {wrapOf} from './inv.js';
import {esc,rid,td,zl0,dmy} from './util.js';
import {S,ask,toast,H,HOLD,merge,saveAcc,guard,infoH} from './core.js';
import {macro,mkt} from './savings.js';
import {render} from './app.js';
import {use} from './usage.js';

const custom=()=>S.hraw?.assetCls||{};
const pct=(v,t)=>t?(v/t*100).toFixed(1).replace('.',',')+'%':'—';
/* class colour: an own class has its hue, a built-in one a shade of its group colour */
function clsCol(c,i){const k=clsAll(custom())[c];if(k?.hue!=null)return`hsl(${k.hue} 55% 74%)`;const g=AGRP[k?.g||'todo'].c;if(i==0)return g;
  return g.replace(/(\d+)% (\d+)%\)/,(m,s,l)=>`${s}% ${Math.min(90,+l+((i%2?1:-1)*Math.ceil(i/2)*6))}%)`)}
export const allocNow=owner=>allocP(S.cfg,liveOf(S.tx),S.hold,td(),macro(),mkt(),{owner:owner&&owner!='all'?owner:null,custom:custom()});
export function advGrp(g){S.advG=g||null;render()}

/* 🥧 the wheel card; owner = the Oszczędności tab (all / Mati / Wercia / Wspólne) */
export function allocH(owner){const A=allocNow(owner),all=clsAll(custom());if(!A.rows.length)return'';
  const g=S.advG&&A.groups.find(x=>x.g==S.advG);let h=`<section class="chart alloc"><div class="ct"><b>🥧 Z czego składa się majątek</b><span class="mini">oszczędności i inwestycje ${owner&&owner!='all'?'· '+esc(owner):'razem'} · wycena na dziś · bez PPK</span></div>`;
  const todo=A.rows.filter(r=>r.cls=='todo');
  if(!g){const segs=A.groups.map(x=>({l:AGRP[x.g].n,v:x.v,c:AGRP[x.g].c}));
    h+=`<div class="dwrap">${donutSvg(segs,zl0(A.total),'razem')}<div class="arows">${A.groups.map(x=>`<button class="arow" onclick="advGrp('${x.g}')"><i style="background:${AGRP[x.g].c}"></i><span class="an">${AGRP[x.g].i} ${esc(AGRP[x.g].n)}</span><span class="num">${zl0(x.v)}</span><em class="num">${pct(x.v,A.total)}</em><span class="ar">›</span></button>`).join('')}</div></div>`}
  else{const segs=g.cls.map((k,i)=>({l:all[k.c].n,v:k.v,c:clsCol(k.c,i)}));
    h+=`<button class="btn sm" style="align-self:flex-start" onclick="advGrp()">‹ Wróć</button><div class="r1"><b>${AGRP[g.g].i} ${esc(AGRP[g.g].n)}</b><span class="num">${zl0(g.v)} · ${pct(g.v,A.total)} majątku</span></div>
      <div class="dwrap">${donutSvg(segs,zl0(g.v),AGRP[g.g].n.toLowerCase())}<div class="arows">${g.cls.map((k,i)=>`<div class="acls"><div class="r1"><span class="an"><i style="background:${clsCol(k.c,i)}"></i>${all[k.c].i} ${esc(all[k.c].n)}</span><span class="num">${zl0(k.v)} <em>${pct(k.v,g.v)}</em></span></div>
        ${k.rows.map(r=>`<button class="arow sub" onclick="pickCls('${r.key}')"><span class="an">${r.kind=='h'?'📊':'🏦'} ${esc(r.name)}${r.kind=='h'?` <small>${esc(r.accName)}</small>`:''}</span><span class="num">${zl0(r.v)}</span><span class="ar">✎</span></button>`).join('')}</div>`).join('')}</div></div>
      <div class="mini">Stuknij pozycję, żeby zmienić jej klasę (np. gdy fundusz to coś innego, niż podpowiedziałem).</div>`}
  if(todo.length)h+=`<div class="note">🐾 Kotki pytają: co to za ${todo.length>1?'fundusze':'fundusz'}? ${todo.map(r=>`<button class="chip" onclick="pickCls('${r.key}')">❓ ${esc(r.name)}</button>`).join(' ')}</div>`;
  if(A.neg.length)h+=`<div class="mini t-exp">⚠️ ${esc(A.neg.join(', '))}: instrumenty są warte więcej niż saldo konta – sprawdź saldo albo zakupy (gotówki liczę 0 zł).</div>`;
  if(A.skipped.length)h+=`<div class="mini">Bez kursu waluty (pominięte): ${esc(A.skipped.map(x=>x.name+' ('+x.cur+')').join(', '))}.</div>`;
  h+=infoH('alloc',`Liczę konta oszczędnościowe i inwestycyjne${owner&&owner!='all'?' tej osoby':''} – bez PPK (doradca go nie liczy), bez kont bieżących i subkont. Instrumenty według dzisiejszej wyceny (ceny z automatu albo wpisane), gotówka na koncie inwestycyjnym osobno, inne waluty po średnim kursie NBP. Klasy przypisuję sam (z listy funduszy, rodzaju instrumentu, obligacje stałe / indeksowane); zawsze możesz zmienić. W następnym etapie dojdzie plan z widełkami.`)+'</section>';
  return h}

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
