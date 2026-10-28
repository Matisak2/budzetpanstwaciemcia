/* Budżet M&W – 💼 salaries and payslips, PIT reliefs, yearly cost of fixed payments, recently deleted, recent changes. Part of the former js/app.js (split into modules, same code). */
import {doc,updateDoc,deleteField} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {catsEmpty} from './art.js';
import {C_INC,barsSvg,chartBox} from './charts.js';
import {ULGI,pitSummaryP} from './today.js';
import {KINDS,TAXF,RULES_YEAR,brutto,calcNet,dedSum,fromNet,onHand,reserve,suggest,totals,ytdOf,youngLeft,youngUntil,youngPart,baseOf} from './pay.js';
import {liveOf,subsMap} from './logic.js';
import {$,MN,clone,daysIn,esc,f2,isDate,p2,pg,pnum,rid,td,zl,zl0,plu} from './util.js';
import {S,toast,ask,accCur,am,accOwner,accOpts,subOpts,H,SLIPS,w,merge,strip,putTx,guard} from './core.js';
import {txRowH} from './actions.js';
import {accN,render} from './app.js';

/* ---------- 💼 salaries (📌 Stałe → Pensje): income sources per person, a payslip per source and month ---------- */
export const incs=()=>S.cfg.incs||[],incById=id=>incs().find(s=>s.id==id);
export const slipOf=(ym,id)=>(S.slips[ym]||{})[id];
/* 🎓 ulga dla młodych: the limit left for this payslip (null = the relief does not apply – no date of birth, after the 26th birthday, other contract) */
const payDate=(src,ym,d)=>isDate(d?.date)&&d.date.startsWith(ym)?d.date:ym+'-'+p2(Math.min(+src.day||10,daysIn(ym)));
export const youngOf=(src,ym,d)=>youngLeft(S.slips,incs(),src,S.hraw?.birth?.[src.who],ym,payDate(src,ym,d));
export const putSlip=(ym,id,body)=>merge(doc(SLIPS(),ym),{s:{[id]:body}});
export const saveInc=x=>merge(H,{incM:{[x.id]:strip(x,incs().indexOf(x))}});
export const delIncDb=id=>w(updateDoc(H,{['incM.'+id]:deleteField()}));
export const gr=v=>{const x=pg(v||'0');return isFinite(x)?x:0};
export const segL=l=>l.replace(/^(\S+) /,'<i class="si">$1</i> ');
/* 📌 Stałe: payments · salaries · 📅 yearly expenses and other dates (the former „🔔 Przyp.” tab is part of it) */
export const fixSegH=()=>`<div class="seg seg3">${[['fix','📌 Opłaty'],['pay','💼 Pensje'],['year','📅 Roczne i terminy']].map(([k,l])=>`<button aria-pressed="${(S.fixSub=='rem'?'year':S.fixSub||'fix')==k}" onclick="setFixSub('${k}')">${segL(l)}</button>`).join('')}</div>`;
export function setFixSub(k){S.fixSub=k=='rem'?'year':k;S.slip=null;window.scrollTo(0,0);render()}
export function setPayView(k){S.payView=k;render()}
export const payTabH=T=>`<div class="ptbl">${[['Brutto / faktury',T.brutto],['ZUS (społeczne)',-T.zus],['Zdrowotna',-T.health],['Zaliczka na podatek',-T.tax],['PPK – moje wpłaty',-T.ppkOwn],['PPK – pracodawca (na PPK)',T.ppkEmp],['Potrącenia',-T.ded],['Netto na konto',T.net]].filter(([,v],i)=>v||i==0||i==7).map(([l,v],i,a)=>`<div class="r1${i==a.length-1?' tot':''}"><span>${l}</span><b class="num">${v<0?'−'+zl(-v):zl(v)}</b></div>`).join('')}${T.hours?`<div class="mini">${String(T.hours).replace('.',',')} h wpisanych godzin</div>`:''}</div>`;
export function payH(){const y=S.ym.slice(0,4);
  return`<div class="seg" style="align-self:center">${[['m','Miesiąc'],['y','Rok '+y]].map(([k,l])=>`<button aria-pressed="${(S.payView||'m')==k}" onclick="setPayView('${k}')">${l}</button>`).join('')}</div>`+(S.payView=='y'?payYearH():payMonthH())}
/* 📌 an old fixed income („Pensja …”) and an income source for the same budget position – linked, ticking it opens the payslip and the pay is never booked twice */
export function pensLinkH(){const linked=new Set(incs().map(x=>x.fixed).filter(Boolean));
  return(S.cfg.fixed||[]).filter(f=>f.kind=='inc'&&!linked.has(f.id)).map(f=>{const s=incs().find(x=>!x.fixed&&x.sub==f.sub&&x.kind!='b2b');if(!s)return'';
    return`<div class="note">💼 „${esc(f.name)}” w 📌 Stałe to pewnie ta sama pensja co źródło dochodu „${esc(s.name)}”. Połączyć? Odhaczenie otworzy wtedy pasek, a pensja nie wpisze się dwa razy. <button class="btn sm primary" onclick="linkInc('${s.id}','${f.id}')">Połącz</button></div>`}).join('')}
export function linkInc(sid,fid){const s=incById(sid);if(!s)return;s.fixed=fid;render();saveInc(s);toast('Połączono – odhaczenie otworzy pasek')}
/* ➕ income that is not from a payslip: selling things, a bonus outside the payslip, a tax refund, rent */
export function otherIncH(ym){const sm=subsMap(S.cfg),L=liveOf(S.tx).filter(t=>t.date.startsWith(ym)&&t.type=='inc'&&!t.slip&&sm[t.sub]?.cat.type=='inc').sort((a,b)=>b.date.localeCompare(a.date)||(b.ts||0)-(a.ts||0));
  const sum=L.filter(t=>accCur(t.acc)=='PLN').reduce((a,t)=>a+t.amount,0);
  return`<div class="r1" style="padding:0 4px"><span class="h2" style="margin:0">➕ Przychody spoza pasków</span><button class="btn sm dark" onclick="openTx(null,{type:'inc'})">+ Inny przychód</button></div>`+(sum?`<div class="mini" style="padding:0 6px">razem w tym miesiącu <b class="t-inc">${zl(sum)}</b></div>`:'')+
    (L.length?`<div class="list">${L.map(t=>txRowH(t,sm)).join('')}</div>`:`<div class="mini" style="padding:0 6px">Sprzedaż rzeczy, premia poza paskiem, zwrot PIT, najem – dodasz przyciskiem obok.</div>`)}
export function payMonthH(){const ym=S.ym,live=new Set(liveOf(S.tx).map(t=>t.id));let h=pensLinkH();
  const b2b=incs().filter(s=>s.kind=='b2b');
  if(b2b.length&&ym==td().slice(0,7)){const res=b2b.reduce((a,s)=>a+(slipOf(ym,s.id)?reserve(slipOf(ym,s.id)):0),0);
    h+=`<div class="note">📅 JDG: do 20. dnia miesiąca zapłać ZUS, zdrowotną i zaliczkę na podatek${res?` – według pasków ok. <b>${zl(res)}</b>`:''}.</div>`}
  const none=!incs().length;
  for(const who of ['Mati','Wercia']){const list=incs().filter(s=>s.who==who);
    h+=`<div class="r1" style="padding:0 4px"><span class="h2" style="margin:0">💼 ${who}</span><button class="btn sm dark" onclick="editInc(null,'${who}')">+ Źródło dochodu</button></div>`;
    if(!list.length){if(!none)h+=`<div class="mini" style="padding:0 6px">Brak źródła dochodu – dodaj pracodawcę albo zleceniodawcę.</div>`;continue}
    h+=`<div class="list">${list.map(s=>{const sl=slipOf(ym,s.id),ok=sl&&sl.booked&&live.has(sl.booked),b=s.kind=='b2b';
      return`<div class="acc"><div style="min-width:0;flex:1"><div class="r1"><b>${esc(s.name)}</b><button class="btn sm" style="padding:3px 9px" aria-label="Edytuj źródło dochodu" onclick="editInc('${s.id}')">⋯</button></div><div class="mini">${KINDS[s.kind]} · ${esc(accN(s.acc))}${s.ppk?' · PPK':''}</div>
        ${sl?`<div class="mini">${b?'faktury':'brutto'} <b style="color:var(--fg)">${zl(brutto(sl))}</b> · ${b?'na rękę':'netto'} <b style="color:var(--fg)">${zl(b?onHand(sl):sl.net)}</b> · ${ok?'<span class="t-inc">✓ w budżecie</span>':'<span class="t-exp">nie zaksięgowano</span>'}${sl.est?` · 🧮 szacunek${sl.estNet?' z netto':''}`:''}</div>`:`<div class="mini">Brak paska w tym miesiącu${s.day?` · wypłata zwykle do ${s.day}.`:''}</div>`}
        <div class="btns" style="gap:6px;margin-top:6px"><button class="chip" onclick="openSlip('${s.id}')">${sl?'📝 Pasek':'+ Wpisz pasek'}</button></div></div></div>`}).join('')}</div>`}
  if(none)h+=catsEmpty('Dodaj pracodawcę albo zleceniodawcę. Co miesiąc wpiszesz pasek (albo samą kwotę netto), a potrącenia i PPK same trafią do budżetu.',0,'calc');
  h+=otherIncH(ym);
  const T=totals(Object.values(S.slips[ym]||{}));
  if(T.n)h+=`<section class="chart"><div class="ct"><b>Razem w miesiącu</b><span class="mini">${T.n} ${plu(T.n,'pasek','paski','pasków')} · ZUS, zdrowotna i podatek nie są wydatkami w budżecie</span></div>${payTabH(T)}</section>`;
  return h}
export function payYearH(){const y=S.ym.slice(0,4),ms=Array.from({length:12},(_,i)=>y+'-'+p2(i+1)),rows=[];
  ms.forEach(m=>Object.entries(S.slips[m]||{}).forEach(([id,sl])=>rows.push({m,id,sl})));
  if(!rows.length)return catsEmpty(`Brak pasków w roku ${y}.<br>Wpisz pierwszy w widoku „Miesiąc”.`,0,'papers')+pitH(y);
  const T=totals(rows.map(r=>r.sl)),nm=new Set(rows.map(r=>r.m)).size;
  let h=`<div class="kpis"><div class="kpi k-em"><div class="l">Netto ${y}</div><div class="v num">${zl(T.net)}</div><div class="s">średnio ${zl0(T.net/nm)}/mies.</div></div><div class="kpi k-sk"><div class="l">Brutto ${y}</div><div class="v num">${zl(T.brutto)}</div><div class="s">${nm} mies. z paskami</div></div></div>`;
  h+=chartBox('Netto miesiąc po miesiącu','wszystkie źródła razem',barsSvg(['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'],[{name:'Netto',color:C_INC,values:ms.map(m=>rows.filter(r=>r.m==m).reduce((a,r)=>a+(r.sl.net||0),0))}],{tipLabel:i=>MN[i]}));
  h+=`<section class="chart"><div class="ct"><b>Cały rok ${y}</b></div>${payTabH(T)}</section><div class="h2">Do sprawdzenia PIT-11</div>`;
  h+=[...new Set(rows.map(r=>r.id))].map(id=>{const list=rows.filter(r=>r.id==id).map(r=>r.sl),last=list[list.length-1],src=incById(id)||last,t=totals(list),b2b=src.kind=='b2b';
    const L=b2b?[['Przychód (faktury)',t.brutto],['Składki ZUS',t.zus],['Zdrowotna',t.health],['Podatek',t.tax]]
      :[['Przychód'+(t.ppkEmp?' (z PPK pracodawcy)':''),t.brutto+t.ppkEmp],...(t.young?[['🎓 w tym zwolniony (ulga dla młodych)',t.young]]:[]),['Koszty uzyskania',t.kup],['Składki ZUS',t.zus],['Zdrowotna',t.health],['Zaliczka na podatek',t.tax]];
    return`<section class="chart"><div class="ct"><b>${esc(src.name||'?')}</b><span class="mini">${KINDS[src.kind]||''} · ${esc(src.who||'')} · ${t.n} ${plu(t.n,'pasek','paski','pasków')}</span></div><div class="ptbl">${L.map(([l,v])=>`<div class="r1"><span>${l}</span><b class="num">${zl(v)}</b></div>`).join('')}</div>${b2b?'<div class="mini">JDG rozliczasz we własnym zeznaniu (PIT-36, PIT-36L albo PIT-28), nie z PIT-11.</div>':''}</section>`}).join('');
  return h+`<div class="mini" style="padding:0 4px">Liczone według miesiąca wypłaty. Porównaj z PIT-11 od pracodawcy – drobne różnice mogą wynikać z zaokrągleń.</div>`+pitH(y)}
/* 🧾 tax reliefs of each person for the year (marked payments, IKZE payments) – a hint, not tax advice */
export function pitH(y){const tx=liveOf(S.tx);
  return`<div class="h2">🧾 Pomocnik PIT ${y}</div>`+['Mati','Wercia'].map(w=>{const p=pitSummaryP(S.cfg,tx,y,w,S.hraw),rows=Object.entries(p.by);
    return`<section class="chart"><div class="ct"><b>${w}</b><span class="mini">rozliczenie osobne</span></div>
      ${rows.length?rows.map(([k,v])=>{const u=ULGI[k]||ULGI.inne,cap=u.lim&&v.sum>u.lim;return`<div class="r1"><span>${esc(u.n)} <button class="ib" onclick="ulgaInfo('${k}')" aria-label="Co to jest">ⓘ</button><span class="mini"> ${v.n} ${plu(v.n,'wpis','wpisy','wpisów')}</span></span><b class="num">${zl(cap?u.lim:v.sum)}</b></div>${cap?`<div class="mini">wydano ${zl(v.sum)}, odliczyć można najwyżej ${zl0(u.lim)}</div>`:''}`}).join(''):'<div class="mini">Brak wydatków oznaczonych „🧾 do ulgi” – oznaczysz je w okienku wydatku.</div>'}
      ${p.ikze.map(x=>`<div class="r1"><span>IKZE – wpłaty (${esc(x.a.name)})</span><b class="num">${zl(Math.min(x.paid,x.lim))}</b></div>`).join('')}
      <div class="mini">Do zeznania potrzebne będą faktury i potwierdzenia. Ulgi niezależne od wydatków (np. na dzieci, 1,5% dla OPP) sprawdzicie w objaśnieniach do PIT.</div></section>`}).join('')}
/* 📆 what the fixed payments cost in a year (złoty accounts only), subscriptions separately, plus yearly expenses */
export function fixYearH(all){const sm=subsMap(S.cfg),ex=all.filter(f=>(f.kind||'exp')=='exp'&&accCur(f.acc)=='PLN');if(!ex.length)return'';
  const m=ex.reduce((a,f)=>a+(+f.amount||0),0),isSub=f=>/subskryp|abonament|aplikacj|streaming/i.test(sm[f.sub]?.cat?.name||''),subs=ex.filter(isSub),ms=subs.reduce((a,f)=>a+(+f.amount||0),0);
  const yr=(S.cfg.years||[]).reduce((a,it)=>a+(+it.amount||0)*12/Math.max(1,+it.every||12),0);
  return`<div class="card yfix"><div class="r1"><b>📆 Opłaty stałe w roku</b><b class="num">${zl0(m*12)}</b></div><div class="mini">czyli ok. ${zl0(m)} co miesiąc${subs.length?` · w tym subskrypcje ${zl0(ms*12)} rocznie (${subs.map(f=>esc(f.name)).join(', ')})`:''}${yr?` · do tego wydatki roczne ok. ${zl0(yr)}`:''}.</div>${subs.length?`<div class="mini">Raz na jakiś czas warto sprawdzić, czy wszystkich subskrypcji nadal używacie.</div>`:''}</div>`}
/* 🗑️ recently deleted (60 days): a deleted entry is only marked deleted:true, so it can always come back.
   Entries deleted together with their parent (PPK, refunds, interest, paystub deductions) come back with it; paystub entries replaced by a re-saved paystub are not listed. */
export const DEL_DAYS=60,parOf=t=>t.ppkOf||t.refundOf||t.payOf||t.slipOf;
export const withParent=(t,p)=>p&&p.deleted===true&&Math.abs((p.dAt||0)-(t.dAt||0))<15000;
export function deletedList(){const byId=new Map(S.tx.map(t=>[t.id,t])),cut=Date.now()-DEL_DAYS*864e5;
  const replaced=t=>{if(t.slip){const sl=slipOf(t.date.slice(0,7),t.slip);return!!(sl&&sl.booked&&sl.booked!==t.id)}const p=parOf(t)&&byId.get(parOf(t));return!!(p&&p.slip&&replaced(p))};
  return S.tx.filter(t=>t.deleted===true&&!t.moved&&t.dAt>cut&&isDate(t.date)&&!withParent(t,byId.get(parOf(t)))&&!replaced(t)).sort((a,b)=>b.dAt-a.dAt)}
export function deletedH(){const L=deletedList();if(!L.length)return'';const sm=subsMap(S.cfg),n=S.delAll?50:5,
    f=x=>new Date(x).toLocaleString('pl-PL',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
  return`<div class="card"><h3>🗑️ Ostatnio usunięte</h3><div class="mini">Wpisy usunięte w ostatnich ${DEL_DAYS} dniach. „Przywróć” wstawia wpis z powrotem (razem z jego zwrotami, PPK i odsetkami).</div><div class="chg2">${L.slice(0,n).map(t=>{
    const nm=t.note||sm[t.sub]?.name||(t.type=='tr'?'Przelew':'Wpis'),sg=t.type=='inc'?'+':t.type=='exp'||t.type=='lend'?'−':'';
    return`<div class="r1 delr"><span><b>${esc(nm)}</b> · <span class="num ${t.type=='inc'?'t-inc':t.type=='exp'?'t-exp':''}">${sg}${am(Math.abs(t.amount||0),t.acc)}</span><small class="mini" style="display:block">${t.date.split('-').reverse().join('.')} · usunięto ${f(t.dAt)}${t.dby?' ('+esc(t.dby)+')':''}</small></span><button class="btn sm" onclick="restoreTx('${t.id}')">↩️ Przywróć</button></div>`}).join('')}</div>${L.length>5?`<button class="btn sm" onclick="S.delAll=!S.delAll;render()">${S.delAll?'Pokaż mniej':`Pokaż wszystkie (${L.length})`}</button>`:''}</div>`}
export async function restoreTx(id){if(guard())return;const t=S.tx.find(x=>x.id===id&&x.deleted===true&&!x.moved);if(!t)return; // an entry moved to another month has a „moved” copy with the same id
  const kids=S.tx.filter(x=>x.deleted===true&&parOf(x)===id&&withParent(x,t)),ym=t.date.slice(0,7);
  if(!await putTx(ym,id,{deleted:false}))return;kids.forEach(x=>putTx(x.date.slice(0,7),x.id,{deleted:false}));
  toast('Przywrócono '+am(Math.abs(t.amount||0),t.acc)+(kids.length?` (razem z ${kids.length} ${plu(kids.length,'powiązanym wpisem','powiązanymi wpisami','powiązanymi wpisami')})`:''),'',{label:'Cofnij',fn:()=>{putTx(ym,id,{deleted:true});kids.forEach(x=>putTx(x.date.slice(0,7),x.id,{deleted:true}))}})}
/* 🕑 recent changes: who added, changed or deleted what (from either phone) */
export function changesH(){const sm=subsMap(S.cfg),ev=[];
  /* the name and amount are written only for the few events shown (formatting thousands of amounts was slow) */
  const nmOf=t=>(t.note||sm[t.sub]?.name||(t.type=='tr'?'Przelew':'Wpis'))+' · '+am(Math.abs(t.amount||0),t.acc);
  for(const t of S.tx){const nm=t;
    const V=(m,f,w)=>w=='Wercia'?f:m;if(t.by&&t.ts)ev.push({at:t.ts,ic:'➕',v:V('dodał','dodała',t.by),w:t.by,nm,id:t.id,live:!t.deleted});if(t.eby&&t.eAt)ev.push({at:t.eAt,ic:'✏️',v:V('zmienił','zmieniła',t.eby),w:t.eby,nm,id:t.id,live:!t.deleted});if(t.dby&&t.dAt)ev.push({at:t.dAt,ic:'🗑️',v:V('usunął','usunęła',t.dby),w:t.dby,nm,id:t.id,live:false})}
  ev.sort((a,b)=>b.at-a.at);if(!ev.length)return'';const n=S.chgAll?40:6,f=x=>new Date(x).toLocaleString('pl-PL',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
  return`<div class="card"><h3>🕑 Ostatnie zmiany</h3><div class="chg2">${ev.slice(0,n).map(e=>`<button class="r1" ${e.live?`onclick="openTx('${e.id}')"`:'disabled'}><span>${e.ic} <b>${esc(e.w)}</b> ${e.v}: ${esc(nmOf(e.nm))}</span><span class="mini">${f(e.at)}</span></button>`).join('')}</div>${ev.length>6?`<button class="btn sm" onclick="S.chgAll=!S.chgAll;render()">${S.chgAll?'Pokaż mniej':'Pokaż więcej'}</button>`:''}</div>`}
export function siriHelp(){ask({title:'🗣️ „Hej Siri, wydatek”',text:'Na każdym iPhonie (raz, ok. 2 minuty):\n1. Otwórz aplikację Skróty → „+” (nowy skrót).\n2. Dodaj czynność „Zapytaj o dane wejściowe”: pytanie „Ile?”, typ „Liczba”.\n3. Dodaj drugą „Zapytaj o dane wejściowe”: pytanie „Co to było?”, typ „Tekst”, a pod nią czynność „Zakoduj URL” (żeby spacje i polskie litery przeszły).\n4. Dodaj czynność „Adres URL” i wpisz: '+location.origin+location.pathname+'#go=add&amount=  – wstaw tu zmienną z kroku 2, potem dopisz  &note=  i wstaw „Zakodowany URL” z kroku 3.\n5. Dodaj czynność „Otwórz adresy URL”.\n6. Nazwij skrót „Wydatek” i stuknij Gotowe.\n\nOd teraz: „Hej Siri, wydatek” → podajesz kwotę i notatkę → otwiera się okienko z gotowym wydatkiem, wystarczy wybrać pozycję i Zapisz. Skrót otwiera się w Safari – za pierwszym razem zaloguj się tam do aplikacji.',ok:'Rozumiem',cancel:'Zamknij'})}
export function ulgaInfo(k){const u=ULGI[k]||ULGI.inne;ask({title:'🧾 '+u.n,text:u.d+'\n\nTo podpowiedź, a nie porada podatkowa.',ok:'OK',cancel:'Zamknij'})}
/* income source: name, person, kind of contract, account, budget position, PPK; then details used by the estimate */
export async function editInc(id,who){if(guard())return;const s0=id?incById(id):null;who=s0?.who||who||S.who;
  const fixedInc=(S.cfg.fixed||[]).filter(f=>f.kind=='inc'),invAccs=S.cfg.accs.filter(a=>a.grp=='inv'&&!a.archived);
  const defSub=S.cfg.cats.filter(c=>c.type=='inc').flatMap(c=>c.subs).find(x=>new RegExp('pensja\\s+'+who,'i').test(x.name))?.id||'';
  const defPpk=S.cfg.accs.find(a=>a.grp=='inv'&&!a.archived&&/ppk/i.test(a.name)&&accOwner(a)==who)?.id||'';
  const linked=new Set(incs().filter(x=>x!==s0).map(x=>x.fixed).filter(Boolean)),defFix=fixedInc.find(f=>!linked.has(f.id)&&(f.sub==defSub||new RegExp('pensja\\s+'+who,'i').test(f.name)))?.id||'';
  const r=await ask({title:s0?'Źródło dochodu':'Nowe źródło dochodu – '+who,fields:[
    {id:'n',label:'Pracodawca albo zleceniodawca',value:s0?.name||'',ph:'np. Szpital Wojewódzki'},
    {id:'k',label:'Rodzaj umowy',type:'select',value:s0?.kind||'uop',options:Object.entries(KINDS)},
    {id:'c',label:'Wpływa na konto',type:'select',value:s0?.acc||S.cfg.accs.find(a=>a.grp=='cur'&&accOwner(a)==who)?.id||'',options:accOpts()},
    {id:'s',label:'Pozycja budżetu (przychód)',type:'select',value:s0?.sub||defSub,options:[['','— wybierz —'],...subOpts('inc')]},
    {id:'d',label:'Wypłata zwykle do dnia (1–31)',type:'int',value:s0?.day||10},
    {id:'p',label:'PPK',type:'select',value:s0?s0.ppk||'':defPpk,options:[['','Bez PPK'],...invAccs.map(a=>[a.id,'Wpłaty na: '+a.name])]},
    {id:'f',label:'Połącz z przychodem stałym (📌) – odhaczenie otworzy pasek',type:'select',value:s0?s0.fixed||'':defFix,options:[['','— bez połączenia —'],...fixedInc.filter(f=>!linked.has(f.id)).map(f=>[f.id,f.name])]}],
    ok:'Dalej',alt:s0?'Usuń źródło':null});
  if(!r)return;
  if(r=='alt'){if(!await ask({title:'Usunąć źródło dochodu?',text:s0.name+'\nZapisane paski i wpisy w rejestrze zostaną.',ok:'Usuń',danger:true}))return;
    S.cfg.incs=incs().filter(x=>x!==s0);render();delIncDb(s0.id);return toast('Usunięto źródło dochodu')}
  if(!r.n.trim())return toast('Podaj nazwę pracodawcy','bad');if(!r.s)return toast('Wybierz pozycję budżetu','bad');if(!r.c)return toast('Wybierz konto','bad');
  const day=Math.round(pnum(r.d))||10,k=r.k,P=v=>{const x=pnum(v);return isFinite(x)?x:0};
  const f2p=x=>String(x).replace('.',',');
  const det=k=='uop'?[{id:'kup',label:'Koszty uzyskania przychodu',type:'select',value:String(s0?.kup||250),options:[['250','Standardowe – 250 zł'],['300','Podwyższone (dojazd z innej miejscowości) – 300 zł']]},{id:'pit2',label:'PIT-2 złożony (ulga 300 zł miesięcznie)',type:'select',value:s0?.pit2===false?'0':'1',options:[['1','Tak'],['0','Nie']]}]
    :k=='zlec'?[{id:'kup',label:'Koszty uzyskania',type:'select',value:String(s0?.kup||20),options:[['20','20%'],['50','50% (prawa autorskie)']]},{id:'zus',label:'Składki ZUS',type:'select',value:s0?.zusOn===false?'0':'1',options:[['1','Tak, płacone ze zlecenia'],['0','Nie (np. student, inny tytuł)']]},{id:'pit2',label:'PIT-2 złożony u zleceniodawcy',type:'select',value:s0?.pit2?'1':'0',options:[['0','Nie'],['1','Tak']]}]
    :k=='dzielo'?[{id:'kup',label:'Koszty uzyskania',type:'select',value:String(s0?.kup||20),options:[['20','20%'],['50','50% (prawa autorskie)']]}]
    :[{id:'tf',label:'Forma podatku',type:'select',value:s0?.taxf||'skala',options:Object.entries(TAXF)},{id:'za',label:'Twój ZUS społeczny miesięcznie (zł)',type:'decimal',value:s0?.zusAmt?f2(s0.zusAmt):'',ph:'z PUE ZUS, np. 1926,76'},{id:'rr',label:'Stawka ryczałtu (%, tylko ryczałt)',type:'decimal',value:s0?.ryczRate?f2p(s0.ryczRate):'',ph:'np. 14'},{id:'ha',label:'Zdrowotna miesięcznie (zł, tylko ryczałt)',type:'decimal',value:s0?.healthAmt?f2(s0.healthAmt):'',ph:'np. 830,58'}];
  if(r.p&&k!='b2b'&&k!='dzielo')det.push({id:'po',label:'PPK – moja wpłata (% brutto)',type:'decimal',value:f2p(s0?.ppkOwnPct??2)},{id:'pe',label:'PPK – pracodawca (% brutto)',type:'decimal',value:f2p(s0?.ppkEmpPct??1.5)});
  const r2=await ask({title:'Szczegóły: '+r.n.trim(),text:'Służą tylko do podpowiedzi z brutto i z netto (szacunek). Zawsze możesz wpisać kwoty z paska.',fields:det,ok:'Dalej'});
  if(!r2)return;
  /* ✂️ deductions taken from the pay every month (they come back by themselves in every new payslip) */
  let deds=s0?.deds||[];
  if(k!='b2b'){const D=[0,1,2].map(i=>deds[i]||{n:'',a:0,sub:''}),es=S.cfg.cats.filter(c=>c.type=='exp').flatMap(c=>c.subs);
    const guess=n=>(/multisport|sport|karnet/i.test(n)?es.find(x=>/karnet|sport/i.test(x.name)):/ubezp/i.test(n)?es.find(x=>/na życie/i.test(x.name))||es.find(x=>/ubezp/i.test(x.name)):/zwi[aą]z|oil|izb/i.test(n)?es.find(x=>/składk|oil/i.test(x.name)):null)?.id||'';
    const r3=await ask({title:'✂️ Potrącenia z pensji',text:'Czy coś jest potrącane od razu z wypłaty? Np. ubezpieczenie grupowe, karta sportowa (Multisport), składka związkowa, kasa zapomogowa.\nWpisz to, co jest co miesiąc – w każdym nowym pasku wpisze się samo i trafi do budżetu jako wydatek w wybranej pozycji. Nic nie potrącają? Zostaw puste.',
      fields:D.flatMap((x,i)=>[{id:'n'+i,label:`${i+1}. Co potrącają`,value:x.n||'',ph:['np. Ubezpieczenie grupowe','np. Multisport','np. Składka związkowa'][i]},{id:'a'+i,label:'Kwota miesięcznie (zł)',type:'decimal',value:x.a?f2(x.a):'',ph:'0,00'},{id:'s'+i,label:'Pozycja budżetu',type:'select',value:x.sub||'',options:[['','— wybierz (podpowiem po nazwie) —'],...subOpts('exp')]}]),ok:s0?'Zapisz':'Dodaj'});
    if(!r3)return;deds=[0,1,2].map(i=>({n:r3['n'+i].trim(),a:gr(r3['a'+i]),sub:r3['s'+i]||guess(r3['n'+i])})).filter(x=>x.n||x.a);
    if(deds.some(x=>x.a>0&&!x.sub))setTimeout(()=>toast('Pozycję budżetu potrącenia wybierzesz w pasku'),900)}
  const body={id:s0?.id||'i'+rid(),name:r.n.trim(),who,kind:k,acc:r.c,sub:r.s,day:Math.min(31,Math.max(1,day)),ppk:k=='b2b'||k=='dzielo'?'':r.p,fixed:r.f,dedSub:{...(s0?.dedSub||{})},deds:k=='b2b'?[]:deds};deds.forEach(x=>{if(x.n&&x.sub)body.dedSub[x.n.toLowerCase()]=x.sub});
  if(k=='uop'){body.kup=+r2.kup;body.pit2=r2.pit2=='1'}
  if(k=='zlec'){body.kup=+r2.kup;body.zusOn=r2.zus=='1';body.pit2=r2.pit2=='1'}
  if(k=='dzielo')body.kup=+r2.kup;
  if(k=='b2b'){body.taxf=r2.tf;body.zusAmt=gr(r2.za);body.ryczRate=P(r2.rr);body.healthAmt=gr(r2.ha)}
  if(body.ppk){body.ppkOwnPct=P(r2.po)||2;body.ppkEmpPct=P(r2.pe)||1.5}
  S.cfg.incs=incs();let x=s0;if(x)Object.assign(x,body);else{x=body;S.cfg.incs.push(x)}
  render();saveInc(x);toast(s0?'Zapisano źródło dochodu':'Dodano źródło dochodu 💼')}
/* the payslip editor (a page in 📌 Stałe) */
export function openSlip(id,ym){if(guard())return;const src=incById(id);if(!src)return toast('Nie ma już tego źródła dochodu','bad');ym=ym||S.ym;
  const old=slipOf(ym,id),day=ym+'-'+p2(Math.min(src.day||10,daysIn(ym)));
  /* ✂️ a new payslip starts with the deductions of the last one (or the ones given when the source was added) – they repeat every month */
  const prev=Object.keys(S.slips).filter(m=>m<ym&&S.slips[m][id]).sort().pop(),ded0=src.kind=='b2b'?[]:clone(prev?S.slips[prev][id].ded||[]:src.deds||[]);
  const d=old?clone(old):{comp:[{n:src.kind=='b2b'?'Faktura':'Wynagrodzenie zasadnicze',a:0,h:0}],zus:0,health:0,kup:0,tax:0,ppkOwn:0,ppkEmp:0,costs:0,ded:ded0,net:0,date:td().startsWith(ym)&&td()<day?td():day};
  d.comp=d.comp||[];d.ded=d.ded||[];
  S.slip={id,ym,d,isNew:!old};S.ym=ym;S.tab='fix';S.fixSub='pay';window.scrollTo(0,0);render()}
export function closeSlip(){S.slip=null;render()}
export function slipRead(){const d=S.slip.d,root=document.querySelector('.slip');if(!root)return d;
  root.querySelectorAll('[data-k]').forEach(el=>d[el.dataset.k]=gr(el.value));
  root.querySelectorAll('[data-c]').forEach(el=>{const c=d.comp[+el.dataset.c];if(!c)return;const f=el.dataset.f;c[f]=f=='a'?gr(el.value):f=='h'?(pnum(el.value)||0):el.value});
  root.querySelectorAll('[data-d]').forEach(el=>{const x=d.ded[+el.dataset.d];if(!x)return;const f=el.dataset.f;x[f]=f=='a'?gr(el.value):el.value});
  const dt=$('slDate');if(dt)d.date=dt.value;return d}
export function slipCalc(){if(!S.slip||!$('slB'))return;const d=slipRead(),src=incById(S.slip.id);if(!src)return;
  const b=brutto(d),calc=calcNet(src,d);$('slB').textContent=zl(b);$('slNet').placeholder=f2(Math.max(0,calc));
  /* remembered budget position of a deduction with this name */
  document.querySelectorAll('.slip select[data-d]').forEach(el=>{const x=d.ded[+el.dataset.d],m=(src.dedSub||{})[(x?.n||'').trim().toLowerCase()];if(x&&!el.value&&m){el.value=m;x.sub=m}});
  let chk;
  if(src.kind=='b2b')chk=`Do odłożenia na ZUS, zdrowotną i podatek: <b>${zl(reserve(d))}</b><br>Na rękę po kosztach i daninach: <b>${zl(onHand(d))}</b>`;
  else if(d.net){const df=d.net-calc;chk=df==0?'<span class="t-inc">✓ Rachunek się zgadza</span>':`<span class="t-exp">⚠️ Różnica ${df>0?'+':'−'}${zl(Math.abs(df))}</span> – brutto minus składki, podatek, PPK i potrącenia daje ${zl(calc)}. Sprawdź kwoty z paska.`}
  else chk=`Wyliczone netto: <b>${zl(calc)}</b> – wpisz kwotę z banku, a sprawdzę rachunek.`;
  $('slChk').innerHTML=chk;
  {const yl=youngOf(src,S.slip.ym,d),un=youngUntil(S.hraw?.birth?.[src.who]),dm=x=>x.split('-').reverse().join('.'),e=$('slYg');
   const t=yl==null?(un&&(src.kind=='uop'||src.kind=='zlec')&&payDate(src,S.slip.ym,d).slice(0,4)==un.slice(0,4)?`🎓 Ulga dla młodych skończyła się ${dm(un)} (26. urodziny) – ta wypłata już z podatkiem.`:'')
     :`🎓 <b>Ulga dla młodych</b> (do ${dm(un)}): ${yl?`bez podatku ${zl(youngPart(d,yl))} z tej wypłaty · w ${S.slip.ym.slice(0,4)} r. zostało ${zl(yl)} limitu.`:`limit 85 528 zł w ${S.slip.ym.slice(0,4)} r. już wykorzystany – podatek jak zwykle.`} ZUS i zdrowotna bez zmian.`;if(e){e.innerHTML=t;e.style.display=t?'':'none'}}
  const net=d.net||calc,ratio=b>0?net/b:0,hc=d.comp.filter(c=>+c.h>0&&c.a>0);
  $('slHr').innerHTML=hc.map(c=>`⏱️ ${esc(c.n||'Składnik')} (${String(c.h).replace('.',',')} h): ${zl(Math.round(c.a/c.h))} brutto · ok. ${zl(Math.round(c.a*ratio/c.h))} netto za godzinę`).join('<br>')}
export function slipRow(kind,i){slipRead();const L=S.slip.d[kind];if(i==null)L.push(kind=='comp'?{n:'',a:0,h:0}:{n:'',a:0,sub:''});else L.splice(i,1);
  if(document.activeElement)document.activeElement.blur();render()}
export function slipCopy(){const {id,ym}=S.slip,prev=Object.keys(S.slips).filter(m=>m<ym&&S.slips[m][id]).sort().pop();
  if(!prev)return toast('Brak wcześniejszego paska tego źródła','bad');
  const p=clone(S.slips[prev][id]),d=slipRead();
  Object.assign(d,{comp:p.comp||[],zus:p.zus||0,health:p.health||0,kup:p.kup||0,tax:p.tax||0,ppkOwn:p.ppkOwn||0,ppkEmp:p.ppkEmp||0,costs:p.costs||0,ded:p.ded||[],net:0,est:false,estNet:false});
  if(document.activeElement)document.activeElement.blur();render();toast('Skopiowano pasek z miesiąca: '+MN[+prev.slice(5)-1].toLowerCase()+'. Wpisz kwotę z banku.')}
export function slipSuggest(){const {id,ym}=S.slip,src=incById(id),d=slipRead();if(brutto(d)<=0)return toast(src.kind=='b2b'?'Najpierw wpisz kwotę faktury':'Najpierw wpisz składniki brutto','bad');
  Object.assign(d,suggest(src,d,ytdOf(S.slips,id,ym),youngOf(src,ym,d)),{est:true,estNet:false});if(document.activeElement)document.activeElement.blur();render();toast('🧮 Wpisałem szacunek – sprawdź go z paskiem')}
export function slipReal(){slipRead();Object.assign(S.slip.d,{est:false,estNet:false});render()}
/* 🧮 „Podpowiedz z netto”: only the amount from the bank is known (no payslip yet) – brutto, contributions, tax and PPK are estimated back from it;
   deductions taken from the pay are added first, PPK can be switched off for this month */
export async function slipNetto(){const {id,ym}=S.slip,src=incById(id),d=slipRead();if(!src||src.kind=='b2b')return;
  const ded=dedSum(d),many=d.comp.filter(c=>c.a>0).length>1;
  const r=await ask({title:'🧮 Podpowiedz z kwoty netto',text:`Wpisz, ile wpłynęło na konto (z aplikacji banku). Policzę z tego orientacyjnie brutto, ZUS, zdrowotną, podatek${src.ppk?' i PPK':''}.${ded?`\n✂️ Potrącenia z pensji (${zl(ded)}) doliczę – są w pasku poniżej, zmienisz je tam.`:'\n✂️ Jeśli coś jest potrącane od razu z pensji (np. ubezpieczenie grupowe, Multisport), dodaj to najpierw w pasku w „Potrącenia”.'}${many?'\nSkładniki brutto zastąpię jedną kwotą.':''}`,
    fields:[{id:'n',label:'Wpłynęło na konto (zł)',type:'decimal',value:d.net?f2(d.net):'',ph:'np. 7 147,39'},...(src.ppk?[{id:'p',label:'PPK w tej wypłacie',type:'select',value:d.ppkOwn||!d.est?'1':'0',options:[['1','Tak – odliczam moją wpłatę na PPK'],['0','Nie – bez PPK w tym miesiącu']]}]:[])],ok:'Policz'});
  if(!r)return;const net=gr(r.n);if(net<=0)return toast('Podaj kwotę, która wpłynęła','bad');
  const ppkOn=!!src.ppk&&r.p!='0',o=fromNet({...src,ppk:ppkOn?src.ppk:''},net,ded,ytdOf(S.slips,id,ym),youngOf(src,ym,d));if(!o)return toast('Nie udało się policzyć – wpisz brutto z paska','bad');
  const hrs=d.comp.reduce((a,c)=>a+(+c.h||0),0);
  Object.assign(d,{comp:[{n:'Wynagrodzenie (z netto)',a:o.b,h:hrs}],zus:o.zus,health:o.health,kup:o.kup,tax:o.tax,ppkOwn:o.ppkOwn,ppkEmp:o.ppkEmp,net,est:true,estNet:true});
  if(document.activeElement)document.activeElement.blur();render();toast('🧮 Policzyłem z netto – brutto ok. '+zl(o.b))}
export function slipH(){const {id,ym,d}=S.slip,src=incById(id);if(!src){S.slip=null;return''}
  const b2b=src.kind=='b2b',V=v=>v?f2(v):'';
  const inp=(k,label,hint)=>`<label class="srow2"><span>${label}${hint?`<small>${hint}</small>`:''}</span><input class="planin" data-k="${k}" value="${V(d[k])}" placeholder="0,00" inputmode="decimal" autocomplete="off"></label>`;
  const sopt=sel=>subOpts('exp').map(g=>`<optgroup label="${esc(g.group)}">${g.items.map(([v,l])=>`<option value="${v}"${v==sel?' selected':''}>${esc(l)}</option>`).join('')}</optgroup>`).join('');
  let h=`<div class="slip" oninput="slipCalc()" onchange="slipCalc()"><div class="sl-h"><b>💼 ${esc(src.name)}</b><span class="mini">${KINDS[src.kind]} · ${src.who} · wypłata: ${MN[+ym.slice(5)-1].toLowerCase()} ${ym.slice(0,4)}</span></div>
    <div class="btns" style="gap:6px"><button class="chip" onclick="slipCopy()">⧉ Skopiuj z poprzedniego miesiąca</button><button class="chip" onclick="slipSuggest()">🧮 Podpowiedz z brutto</button>${b2b?'':'<button class="chip" onclick="slipNetto()">🧮 Podpowiedz z netto</button>'}</div><div class="mini">Podpowiedź liczy według zasad ${RULES_YEAR} r. – zawsze sprawdź z paskiem.</div><div class="note" id="slYg" style="display:none"></div>
    ${d.est?(d.estNet?`<div class="note">🧮 To <b>szacunek z kwoty netto</b>${dedSum(d)?` (z potrąceniami ${zl(dedSum(d))})`:''}. Dodatki od pracodawcy (np. karta sportowa, część ubezpieczenia) bywają doliczane do przychodu – wtedy prawdziwy pasek różni się o kilka–kilkanaście zł. Gdy dostaniesz pasek, przepisz z niego brutto. <button class="btn sm" onclick="slipReal()">✓ To już kwoty z paska</button></div>`:'<div class="note">🧮 To <b>szacunek</b> wyliczony z brutto. Sprawdź i popraw kwoty według paska z wypłaty. <button class="btn sm" onclick="slipReal()">✓ To już kwoty z paska</button></div>'):''}
    <div class="sl-sec">${b2b?'FAKTURY':'SKŁADNIKI (BRUTTO)'}</div>
    ${d.comp.map((c,i)=>`<div class="sl-row"><input data-c="${i}" data-f="n" value="${esc(c.n||'')}" placeholder="${b2b?'np. Faktura za październik':'np. Dyżury'}" aria-label="Nazwa składnika" autocomplete="off"><input class="planin" data-c="${i}" data-f="a" value="${V(c.a)}" placeholder="0,00" inputmode="decimal" aria-label="Kwota" autocomplete="off">${b2b?'':`<input class="planin hrs" data-c="${i}" data-f="h" value="${c.h?String(c.h).replace('.',','):''}" placeholder="godz." inputmode="decimal" aria-label="Godziny (opcjonalnie)" autocomplete="off">`}<button type="button" class="x" onclick="slipRow('comp',${i})" aria-label="Usuń składnik">×</button></div>`).join('')}
    <button class="btn sm" style="align-self:flex-start" onclick="slipRow('comp')">+ ${b2b?'Faktura':'Składnik'}</button>
    <div class="r1 sl-tot"><span>${b2b?'Razem faktury':'Brutto'}</span><b class="num" id="slB"></b></div>
    <div class="sl-sec">${b2b?'ZAPŁACISZ SAM':'SKŁADKI I PODATEK'}</div>
    ${b2b?inp('costs','Koszty firmy','np. leasing, sprzęt, księgowa')+inp('zus','Twój ZUS (społeczny)')+inp('health','Zdrowotna')+inp('tax','Podatek (zaliczka)')
      :inp('zus','ZUS (emerytalna, rentowa, chorobowa)')+inp('health','Zdrowotna')+inp('tax','Zaliczka na podatek')+inp('kup','Koszty uzyskania','tylko do PIT – nie zmniejszają wypłaty')}
    ${src.ppk&&!b2b?`<div class="sl-sec">PPK → ${esc(accN(src.ppk))}</div>${inp('ppkOwn','Moja wpłata','odejmuje się od wypłaty')}${inp('ppkEmp','Wpłata pracodawcy','dodatkowo, na konto PPK')}`:''}
    ${b2b?'':`<div class="sl-sec">POTRĄCENIA</div><div class="mini">Np. Multisport, ubezpieczenie grupowe. Trafią do budżetu jako wydatki w wybranej pozycji.</div>
    ${d.ded.map((x,i)=>`<div class="sl-ded"><div class="sl-row"><input data-d="${i}" data-f="n" value="${esc(x.n||'')}" placeholder="np. Multisport" aria-label="Nazwa potrącenia" autocomplete="off"><input class="planin" data-d="${i}" data-f="a" value="${V(x.a)}" placeholder="0,00" inputmode="decimal" aria-label="Kwota potrącenia" autocomplete="off"><button type="button" class="x" onclick="slipRow('ded',${i})" aria-label="Usuń potrącenie">×</button></div><select data-d="${i}" data-f="sub" aria-label="Pozycja budżetu"><option value="">— pozycja budżetu —</option>${sopt(x.sub)}</select></div>`).join('')}
    <button class="btn sm" style="align-self:flex-start" onclick="slipRow('ded')">+ Potrącenie</button>`}
    <div class="sl-sec">WPŁYW</div>
    <label class="srow2"><span>Data wpływu</span><input type="date" id="slDate" value="${esc(d.date||'')}"></label>
    <label class="srow2"><span>Wpłynęło na konto<small>${esc(accN(src.acc))} – kwota z aplikacji banku</small></span><input class="planin" data-k="net" id="slNet" value="${V(d.net)}" inputmode="decimal" autocomplete="off"></label>
    <div class="note" id="slChk"></div><div class="mini" id="slHr"></div>
    <div class="g2"><button class="btn" onclick="closeSlip()">Anuluj</button><button class="btn primary" onclick="saveSlip()">Zapisz i zaksięguj</button></div>
    ${S.slip.isNew?'':'<button class="btn sm" style="align-self:center;background:none;color:var(--exp)" onclick="delSlip()">Usuń pasek</button>'}</div>`;
  return h}
/* earlier booking of a payslip: the income and everything linked to it (deductions, PPK) */
export const slipTxs=iid=>iid?liveOf(S.tx).filter(t=>t.id===iid||t.slipOf===iid||t.ppkOf===iid):[];
export async function saveSlip(){if(guard())return;const {id,ym}=S.slip,src=incById(id),d=slipRead();
  d.comp=d.comp.filter(c=>c.a||String(c.n||'').trim());d.ded=src.kind=='b2b'?[]:d.ded.filter(x=>x.a||String(x.n||'').trim());
  if(!src.ppk||src.kind=='b2b'){d.ppkOwn=0;d.ppkEmp=0}
  const b=brutto(d);if(b<=0)return toast(src.kind=='b2b'?'Wpisz kwotę faktury':'Wpisz składniki brutto','bad');
  if(!isDate(d.date)||!d.date.startsWith(ym))return toast('Data wpływu musi być w miesiącu: '+MN[+ym.slice(5)-1].toLowerCase(),'bad');
  if(d.ded.some(x=>x.a>0&&!x.sub))return toast('Wybierz pozycję budżetu dla każdego potrącenia','bad');
  const calc=calcNet(src,d),net=d.net||calc;if(net<=0)return toast('Kwota na konto musi być większa od zera','bad');
  const twice=liveOf(S.tx).find(t=>t.type=='inc'&&t.date.startsWith(ym)&&!t.slip&&t.fixedId&&(t.fixedId==src.fixed||t.sub==src.sub));
  if(twice&&!await ask({title:'Ta pensja już jest w tym miesiącu?',text:`W ${MN[+ym.slice(5)-1].toLowerCase()} jest już wpływ „${twice.note||'przychód stały'}” ${zl(twice.amount)} (odhaczony w 📌 Stałe).\nJeśli to ta sama wypłata, najpierw odznacz go w 📌 Stałe – inaczej pensja policzy się dwa razy.`,ok:'Zapisz mimo to',cancel:'Nie zapisuj'}))return;
  const old=slipOf(ym,id);slipTxs(old?.booked).forEach(t=>putTx(t.date.slice(0,7),t.id,{deleted:true}));
  const iid='t'+rid(),ts=Date.now(),dd=d.ded.filter(x=>x.a>0),inc=net+dd.reduce((a,x)=>a+x.a,0);
  if(!await putTx(ym,iid,{type:'inc',amount:inc,date:d.date,sub:src.sub,acc:src.acc,to:'',who:src.who,note:'💼 '+src.name,slip:id,...(src.fixed?{fixedId:src.fixed}:{}),deleted:false,ts}))return;
  dd.forEach(x=>putTx(ym,'t'+rid(),{type:'exp',amount:x.a,date:d.date,sub:x.sub,acc:src.acc,to:'',who:src.who,note:`potrącenie z pensji – ${src.name}: ${x.n||'potrącenie'}`,slipOf:iid,deleted:false,ts}));
  const pb={date:d.date,sub:'',acc:src.ppk,to:'',who:src.who,deleted:false,ts,ppkOf:iid,...(src.fixed?{fixedRef:src.fixed}:{})};
  if(d.ppkOwn>0)putTx(ym,'t'+rid(),{...pb,type:'inc',amount:d.ppkOwn,note:'PPK – moja wpłata',ppk:'own'});
  if(d.ppkEmp>0)putTx(ym,'t'+rid(),{...pb,type:'inc',amount:d.ppkEmp,note:'PPK – wpłata pracodawcy',ppk:'emp'});
  const yl=youngOf(src,ym,d),young=yl==null?null:youngPart(d,yl),base=baseOf(src,{...d,young});
  putSlip(ym,id,{comp:d.comp.map(c=>({n:String(c.n||''),a:c.a||0,h:+c.h||0})),zus:d.zus||0,health:d.health||0,kup:d.kup||0,tax:d.tax||0,ppkOwn:d.ppkOwn||0,ppkEmp:d.ppkEmp||0,costs:d.costs||0,
    ded:d.ded.map(x=>({n:String(x.n||''),a:x.a||0,sub:x.sub||''})),net,date:d.date,base,young,booked:iid,name:src.name,kind:src.kind,who:src.who,est:!!d.est,estNet:!!d.estNet,ts});
  if(dd.length){src.dedSub={...(src.dedSub||{})};dd.forEach(x=>{if(x.n)src.dedSub[x.n.trim().toLowerCase()]=x.sub});saveInc(src)}
  S.slip=null;render();toast(`Zaksięgowano: ${src.name} · ${zl(net)} na konto${dd.length?` · ${dd.length} ${plu(dd.length,'potrącenie','potrącenia','potrąceń')} w budżecie`:''}`)}
export async function delSlip(){const {id,ym}=S.slip,old=slipOf(ym,id);if(!old)return closeSlip();
  if(!await ask({title:'Usunąć pasek?',text:`${old.name||''} – ${MN[+ym.slice(5)-1].toLowerCase()}\nUsunę też wpływ, potrącenia i wpłaty PPK z tego paska.`,ok:'Usuń',danger:true}))return;
  slipTxs(old.booked).forEach(t=>putTx(t.date.slice(0,7),t.id,{deleted:true}));w(updateDoc(doc(SLIPS(),ym),{['s.'+id]:deleteField()}));
  S.slip=null;render();toast('Usunięto pasek')}