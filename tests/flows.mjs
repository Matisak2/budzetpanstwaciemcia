/* 🤖 Robot: zapis i usuwanie wpisów naprawdę działa (audyt 23.11, raport 07-testy.md p. 1). W wersji demo, przez prawdziwe okienko transakcji:
   wydatek → saldo konta i dokument miesiąca; zmiana daty na poprzedni miesiąc i z powrotem (wpis zawsze raz); usunięcie i „Cofnij”;
   paragon na dwie pozycje; zwrot (usuwany razem z wydatkiem); przelew; 🪙 drobne; „Taki wpis już jest”; 🚫 za mało na koncie;
   📌 odhaczenie, odznaczenie i „Przywróć” opłaty stałej (bez drugiego wpisu). Wypisuje tylko wynik.
   Uruchomienie: node tests/flows.mjs   (.github/workflows/test.yml) */
import {serve,launch,demoPage} from './web.mjs';
const fails=[];const fail=m=>{fails.push(m);console.log('❌ '+m)};
const {srv,BASE}=await serve();const browser=await launch();
const {ctx,p}=await demoPage(browser,BASE,{onErr:m=>fail(m)});
let n=0;
const step=async(name,fn)=>{n++;try{const r=await fn();if(r!==true)fail(`${name}: ${typeof r=='string'?r:'wynik się nie zgadza'}`)}catch(e){fail(`${name}: ${e.message.split('\n')[0]}`)}};
const wait=(ms=250)=>p.waitForTimeout(ms);
const E=(f,a)=>p.evaluate(f,a);

/* page helpers: modules (the same instances as the app), balances, the stored month document, dialogs */
await E(async()=>{const L=await import('/js/logic.js'),Sh=await import('/js/sheet.js'),Sa=await import('/js/salary.js');
  const own=S.cfg.accs.filter(a=>a.grp=='cur'&&!a.archived&&!a.cur);
  const T=window.T={L,Sh,Sa,bal:id=>L.balance(S.cfg,L.liveOf(S.tx),id,'9999'),live:id=>L.liveOf(S.tx).filter(t=>t.id===id),
    doc:ym=>(MW_DEMO.store['households/main/months/'+ym]||{}).tx||{},dlg:()=>document.getElementById('dlg').hidden?'':document.getElementById('dlg').innerText,
    ym:S.ym,prev:L.addMonths?L.addMonths(S.ym,-1):null,acc:(own.find(a=>a.owner==S.who)||own[0]).id,acc2:(own.find(a=>a.owner=='Wspólne')||own.find(a=>a.owner!=S.who)).id,
    sav:S.cfg.accs.find(a=>a.grp=='sav'&&!a.archived&&!a.cur&&!a.wrap)?.id,
    subs:S.cfg.cats.filter(c=>c.type=='exp'&&!c.hidden).flatMap(c=>c.subs.filter(s=>!s.hidden)).map(s=>s.id),
    /* a new entry through the sheet: amount as typed, position, account, date, note */
    add:async({a,sub,acc,date,note,type='exp',to})=>{openTx(null,{type});await new Promise(r=>setTimeout(r,120));
      document.getElementById('mc').value=acc;document.getElementById('mc').dispatchEvent(new Event('change'));if(to)document.getElementById('mto').value=to;
      const ma=document.getElementById('ma');ma.value=a;ma.dispatchEvent(new Event('input'));
      if(sub)document.getElementById('ms').value=sub;document.getElementById('md').value=date;document.getElementById('mn').value=note;document.getElementById('md').dispatchEvent(new Event('change'))},
    find:note=>L.liveOf(S.tx).filter(t=>t.note===note)};
  if(!T.prev){const[y,m]=S.ym.split('-').map(Number),d=new Date(y,m-2,1);T.prev=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
  T.day=S.ym+'-15';T.pday=T.prev+'-10'});
const save=async()=>{await E(()=>document.getElementById('shSave').click());await wait(350)};
const ok=async()=>{await E(()=>document.getElementById('dlgOk').click());await wait(350)};
const no=async()=>{await E(()=>document.getElementById('dlgNo').click());await wait(300)};
const undo=async()=>{await E(()=>document.querySelector('#toast .tbtn').click());await wait(350)};

/* 1. an expense: one live entry, the account goes down by exactly the amount, the month document has it with „by” */
let b0;
await step('Wydatek – zapis',async()=>{b0=await E(()=>T.bal(T.acc));
  await E(()=>T.add({a:'12,34',sub:T.subs[0],acc:T.acc,date:T.day,note:'robot wydatek'}));await save();
  return E(b0=>{const L=T.find('robot wydatek');if(L.length!==1)return 'wpisów: '+L.length;const t=L[0];window.__id=t.id;
    if(t.amount!==1234||t.sub!==T.subs[0]||t.acc!==T.acc||t.date!==T.day)return 'pola: '+JSON.stringify(t);
    if(T.bal(T.acc)!==b0-1234)return `saldo ${T.bal(T.acc)} zamiast ${b0-1234}`;const d=T.doc(T.ym)[t.id];
    return !!d&&d.deleted===false&&d.by===S.who&&d.amount===1234||'dokument miesiąca: '+JSON.stringify(d)},b0)});

/* 2. the date moved to the previous month: still one live entry, now in the other month's document; the old one says „moved” and is not in 🗑️ */
await step('Zmiana daty na poprzedni miesiąc',async()=>{await E(()=>{openTx(__id)});await wait(150);
  await E(()=>{document.getElementById('md').value=T.pday});await save();
  return E(b0=>{const L=T.live(__id);if(L.length!==1)return 'żywych wpisów: '+L.length;if(L[0].date!==T.pday)return 'data '+L[0].date;
    const a=T.doc(T.prev)[__id],b=T.doc(T.ym)[__id];if(!a||a.deleted!==false||a.amount!==1234)return 'nowy miesiąc: '+JSON.stringify(a);
    if(!b||b.deleted!==true||b.moved!==true)return 'stary miesiąc: '+JSON.stringify(b);
    if(T.Sa.deletedList().some(t=>t.id===__id))return 'przeniesiony wpis jest w „Ostatnio usunięte”';
    return T.bal(T.acc)===b0-1234||'saldo '+T.bal(T.acc)},b0)});
await step('Zmiana daty z powrotem',async()=>{await E(()=>{openTx(__id)});await wait(150);await E(()=>{document.getElementById('md').value=T.day});await save();
  return E(b0=>{const L=T.live(__id);if(L.length!==1||L[0].date!==T.day)return 'żywych wpisów: '+L.length;
    const a=T.doc(T.ym)[__id],b=T.doc(T.prev)[__id];if(a.deleted!==false||a.moved!==false)return 'bieżący miesiąc: '+JSON.stringify(a);
    if(b.deleted!==true||b.moved!==true)return 'poprzedni miesiąc: '+JSON.stringify(b);
    if(T.Sa.deletedList().some(t=>t.id===__id))return 'wpis w „Ostatnio usunięte”';return T.bal(T.acc)===b0-1234||'saldo'},b0)});

/* 3. a duplicate is asked about; „Nie zapisuj” saves nothing */
await step('Taki wpis już jest',async()=>{const n0=await E(()=>S.tx.length);await E(()=>T.add({a:'12,34',sub:T.subs[0],acc:T.acc,date:T.day,note:'robot wydatek'}));await save();
  if(!/Taki wpis już jest/.test(await E(()=>T.dlg())))return 'brak pytania o duplikat';await no();await E(()=>T.Sh.closeSheet());
  return await E(n0=>S.tx.length===n0&&T.find('robot wydatek').length===1,n0)||'zapisało drugi raz'});

/* 4. a refund: income on the expense's position, the account up; deleting the expense deletes the refund too; „Cofnij” brings both back */
await step('Zwrot i usunięcie razem z wydatkiem',async()=>{await E(()=>{T.Sh.closeSheet();T.Sh.markRefund(__id)});await wait(200);
  await E(()=>{document.getElementById('f_a').value='4,34'});await ok();
  const r=await E(b0=>{const R=T.L.liveOf(S.tx).filter(t=>t.refundOf===__id);if(R.length!==1||R[0].amount!==434||R[0].type!=='inc'||R[0].sub!==T.subs[0])return 'zwrot: '+JSON.stringify(R);window.__rf=R[0].id;
    return T.bal(T.acc)===b0-800||'saldo po zwrocie '+T.bal(T.acc)},b0);if(r!==true)return r;
  await E(()=>T.Sh.delTx(__id));await wait(350);
  const d=await E(b0=>T.live(__id).length===0&&T.live(__rf).length===0&&T.bal(T.acc)===b0||`po usunięciu: wydatek ${T.live(__id).length}, zwrot ${T.live(__rf).length}, saldo ${T.bal(T.acc)}`,b0);if(d!==true)return d;
  if(!await E(()=>T.Sa.deletedList().some(t=>t.id===__id)))return 'brak w „Ostatnio usunięte”';
  await undo();return E(b0=>T.live(__id).length===1&&T.live(__rf).length===1&&T.bal(T.acc)===b0-800||'„Cofnij” nie przywróciło obu wpisów',b0)});

/* 5. a receipt split into two positions: two entries with one split id, the account down by the whole receipt */
await step('Paragon na dwie pozycje',async()=>{const b1=await E(()=>T.bal(T.acc));
  await E(()=>T.add({a:'100',sub:T.subs[0],acc:T.acc,date:T.day,note:'robot paragon'}));
  await E(()=>{document.getElementById('splitBtn').click();const i=document.querySelector('#splitRows input');i.value='30';i.dispatchEvent(new Event('input',{bubbles:true}));
    document.querySelector('#splitRows .pickbtn').click();T.Sh.P.cb(T.subs[1]);T.Sh.closePick()});await save();
  return E(b1=>{const L=T.find('robot paragon');if(L.length!==2)return 'wpisów: '+L.length;const g=L[0].split;if(!g||L[1].split!==g)return 'bez wspólnego split';
    const m=Object.fromEntries(L.map(t=>[t.sub,t.amount]));if(m[T.subs[0]]!==7000||m[T.subs[1]]!==3000)return 'kwoty części: '+JSON.stringify(m);
    return T.bal(T.acc)===b1-10000||'saldo '+T.bal(T.acc)},b1)});

/* 6. a transfer: one account down, the other up by the same amount; the budget does not count it */
await step('Przelew między kontami',async()=>{const[x,y]=await E(()=>[T.bal(T.acc),T.bal(T.acc2)]);
  await E(()=>T.add({type:'tr',a:'50',acc:T.acc,to:T.acc2,date:T.day,note:'robot przelew'}));await save();
  return E(([x,y])=>{const L=T.find('robot przelew');if(L.length!==1||L[0].type!=='tr'||L[0].to!==T.acc2)return 'wpis: '+JSON.stringify(L);
    return T.bal(T.acc)===x-5000&&T.bal(T.acc2)===y+5000||`salda ${T.bal(T.acc)-x} / ${T.bal(T.acc2)-y}`},[x,y])});

/* 7. 🪙 drobne: a rule „round up to 10 zł” – 12,34 zł → a 7,66 zł transfer to savings linked to the expense (roundOf) */
await step('Drobne',async()=>{const has=await E(()=>!!T.sav);if(!has)return 'demo bez konta oszczędnościowego';
  await E(()=>{S.cfg.round=[{id:'rr',from:T.acc,to:T.sav,step:10,mult:1,since:'2000-01-01',o:0}]});
  await E(()=>T.add({a:'12,34',sub:T.subs[2]||T.subs[0],acc:T.acc,date:T.day,note:'robot drobne'}));await save();
  return E(()=>{const e=T.find('robot drobne')[0];if(!e)return 'brak wydatku';const c=T.L.liveOf(S.tx).filter(t=>t.roundOf===e.id);S.cfg.round=[];
    return c.length===1&&c[0].amount===766&&c[0].acc===T.acc&&c[0].to===T.sav||'drobne: '+JSON.stringify(c)})});

/* 8. 🚫 more than the account has: not saved, „Za mało na koncie” */
await step('Za mało na koncie',async()=>{const n0=await E(()=>S.tx.length);
  await E(()=>T.add({a:'999 999',sub:T.subs[0],acc:T.acc,date:T.day,note:'robot za dużo'}));await save();
  const t=await E(()=>T.dlg());await ok();await E(()=>{document.getElementById('sheet').hidden=true});
  return /Za mało na koncie/.test(t)&&await E(n0=>S.tx.length===n0&&!T.find('robot za dużo').length,n0)||'zapisało albo bez okienka'});

/* 9. 📌 a fixed payment: tick → one entry; untick („Tak, usuń”) → deleted; tick again → „Przywróć” the old one is refused (no second payment) */
await step('Opłata stała – odhacz, odznacz, Przywróć',async()=>{
  const fid=await E(()=>{const f=S.cfg.fixed.find(f=>(f.kind||'exp')=='exp'&&!T.L.liveOf(S.tx).some(t=>t.fixedId===f.id&&t.date.startsWith(S.ym))&&T.bal(f.acc)>f.amount*3);return f?.id});
  if(!fid)return 'demo bez nieodhaczonej opłaty';
  const tick=async()=>{await E(f=>{toggleFixed(f)},fid);await wait(200);const t=await E(()=>T.dlg());if(/już wpisany/.test(t)){await E(()=>document.getElementById('dlgAlt').click());await wait(200)}await ok()};
  const paid=()=>E(f=>T.L.liveOf(S.tx).filter(t=>t.fixedId===f&&t.date.startsWith(S.ym)).map(t=>t.id),fid);
  await tick();const a=await paid();if(a.length!==1)return 'po odhaczeniu wpisów: '+a.length;
  await E(f=>{toggleFixed(f)},fid);await wait(200);if(!/Odznaczyć/.test(await E(()=>T.dlg())))return 'odznaczenie nie pyta';await ok();
  if((await paid()).length!==0)return 'odznaczenie nie usunęło wpisu';
  await tick();const b=await paid();if(b.length!==1||b[0]===a[0])return 'drugie odhaczenie: '+b.length;
  await E(id=>{restoreTx(id)},a[0]);await wait(400);const c=await paid();
  return c.length===1||`„Przywróć” starego wpisu dało ${c.length} żywe wpisy tej opłaty`});

/* 10. ⚙️ „Wczytaj kopię” – a list of entries (format budzet-mw-tx, here as .json.gz from the backup e-mail): new position and account added,
   loading the same file again adds nothing and does not bring back an entry deleted in the meantime */
const file=async(name,obj,gz)=>{const zlib=await import('node:zlib');const b=Buffer.from(JSON.stringify(obj));
  await p.setInputFiles('#fileIn',{name,mimeType:gz?'application/gzip':'application/json',buffer:gz?zlib.gzipSync(b):b});await wait(500)};
await step('Wczytanie listy wpisów (.json.gz) dwa razy',async()=>{
  const I=await E(()=>{const a=S.cfg.accs.find(x=>x.id==T.acc),c=S.cfg.cats.find(c=>c.subs.some(s=>s.id==T.subs[0]));return{acc:a.name,cat:c.name,sub:c.subs.find(s=>s.id==T.subs[0]).name,day:T.day}});
  const o={format:'budzet-mw-tx',tx:[{id:'imx1',date:I.day,type:'exp',amount:1500,cat:I.cat,sub:I.sub,acc:I.acc,note:'robot import 1',who:'Mati'},
    {id:'imx2',date:I.day,type:'inc',amount:2000,cat:'Przychody',sub:'Pozycja robota',acc:'Konto robota',note:'robot import 2',who:'Mati'}]};
  await file('lista.json.gz',o,true);if(!/Wczytać transakcje/.test(await E(()=>T.dlg())))return 'brak pytania „Wczytać transakcje?” (gzip?)';await ok();await wait(300);
  const r=await E(()=>{const a=T.live('imx1')[0],b=T.live('imx2')[0],acc=S.cfg.accs.find(x=>x.name=='Konto robota');
    if(!a||a.amount!==1500||a.sub!==T.subs[0]||a.acc!==T.acc)return 'wpis 1: '+JSON.stringify(a);if(!b||!acc||b.acc!==acc.id||!b.sub)return 'wpis 2 / nowe konto: '+JSON.stringify(b);
    return T.L.subsMap(S.cfg)[b.sub]?.name=='Pozycja robota'||'brak nowej pozycji'});if(r!==true)return r;
  await E(()=>T.Sh.delTx('imx1'));await wait(300);
  await file('lista.json',o,false);const t=await E(()=>T.dlg());await ok();
  return /już są/.test(t)&&await E(()=>T.live('imx1').length===0&&T.live('imx2').length===1)||'drugie wczytanie coś dopisało albo wskrzesiło usunięty wpis'});

/* 11. a backup of the first version of the app (categories / transactions): account with its opening balance, position, „[Wercia]” → Kto; twice = once */
await step('Wczytanie kopii ze starej wersji aplikacji dwa razy',async()=>{const day=await E(()=>T.day);
  const o={categories:[{nazwa:'Jedzenie',typ:'WYDATEK',podkategorie:['Robot stary']},{nazwa:'Konta',typ:'BILANS_KONTA',podkategorie:['Stare konto robota']}],
    transactions:[{id:7,date:day,type:'Wydatek',amount:-12.5,subcategory:'Robot stary',account:'Stare konto robota',note:'[Wercia] robot stary'}],openingBalancesBase:{'Stare konto robota':100},plansByYear:{[day.slice(0,4)]:{[String(+day.slice(5,7)-1)]:{'Robot stary':40}}}};
  await file('stara.json',o,false);if(!/Wczytać kopię/.test(await E(()=>T.dlg())))return 'brak pytania „Wczytać kopię?”';await ok();await wait(500);
  const r=await E(()=>{const t=T.live('imp_7')[0],a=S.cfg.accs.find(x=>x.name=='Stare konto robota');
    if(!t||!a)return 'brak wpisu albo konta';if(t.amount!==1250||t.who!=='Wercia'||t.note!=='robot stary'||t.acc!==a.id||t.type!=='exp')return 'wpis: '+JSON.stringify(t);
    return a.open===10000&&T.L.subsMap(S.cfg)[t.sub]?.name=='Robot stary'||'saldo początkowe / pozycja: '+a.open});if(r!==true)return r;
  /* poprawki po pierwszym wczytaniu (saldo początkowe, plan) zostają przy drugim; toast mówi, że nic nowego (audyt 2) */
  const sub=await E(async()=>{const C=await import('/js/core.js'),F=await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js'),a=S.cfg.accs.find(x=>x.name=='Stare konto robota'),sub=T.live('imp_7')[0].sub;
    if(S.plans?.[T.ym]?.[sub]!==4000)return 'plan z pliku: '+S.plans?.[T.ym]?.[sub];C.merge(C.H,{accsM:{[a.id]:{open:20000}}});C.merge(F.doc(C.PLC(),T.ym),{[sub]:5000});return sub});
  if(!/^s/.test(sub))return sub;await wait(400);
  await file('stara.json',o,false);await ok();await wait(500);
  return await E(sub=>{if(S.tx.filter(t=>t.id==='imp_7').length!==1||S.cfg.accs.filter(x=>x.name=='Stare konto robota').length!==1)return 'drugie wczytanie zdublowało';
    const a=S.cfg.accs.find(x=>x.name=='Stare konto robota');if(a.open!==20000||S.plans[T.ym][sub]!==5000)return `drugie wczytanie nadpisało: saldo ${a.open}, plan ${S.plans[T.ym][sub]}`;
    return /nic nowego/.test(document.getElementById('toast')?.innerText||'')||'toast: '+document.getElementById('toast')?.innerText},sub)});

/* 👥 „Czy starczy?”: rozwinięta karta i rozwinięta osoba zostają otwarte po przerysowaniu (np. zapis z drugiego telefonu) – audyt 24.11 */
await step('Czy starczy – osoba zostaje rozwinięta',async()=>E(async()=>{goTab('dash');await new Promise(r=>setTimeout(r,200));
  const w=document.querySelector('#pbud details.pbw');if(!w)return 'brak karty';w.open=true;await new Promise(r=>setTimeout(r,80));
  const d=document.querySelector('#pbud details.pbr');if(!d)return 'brak osoby';d.open=true;await new Promise(r=>setTimeout(r,80));render();await new Promise(r=>setTimeout(r,80));
  return document.querySelector('#pbud details.pbr')?.open===true||'osoba zwinęła się po przerysowaniu'}));

/* 📈 konto inwestycyjne po usunięciu ostatniego instrumentu: wycena instrumentów schodzi raz, a wartość wpisana ręcznie zostaje
   przy kolejnym „Zapisz wszystko” z pustym polem (audyt 24.11 – wcześniej znikała za każdym razem) */
await step('Wycena po usunięciu instrumentów',async()=>E(async()=>{const wait=ms=>new Promise(r=>setTimeout(r,ms));goTab('sav');await wait(150);
  const ids=Object.entries(S.hold).filter(([,x])=>!x.deleted);const a=S.cfg.accs.find(a=>a.grp=='inv'&&!a.archived&&ids.some(([,x])=>x.acc==a.id));if(!a)return 'brak konta z instrumentami';
  const vs=()=>T.L.liveOf(S.tx).filter(t=>t.acc===a.id&&t.type=='adj'&&t.val).reduce((s,t)=>s+t.amount,0);
  saveInstVal(a.id);await wait(400);const v0=vs();if(!v0)return 'brak wyceny instrumentów';
  const C=await import('/js/core.js'),F=await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js');
  for(const[id,x]of ids)if(x.acc==a.id)C.merge(F.doc(C.HOLD(),id),{deleted:true});await wait(500);
  openValues();await wait(150);saveValues();await wait(500);if(vs()!==0)return 'wycena instrumentów nie zeszła: '+vs();
  openValues();await wait(150);const el=document.querySelector(`[data-av="${a.id}"]`);if(!el)return 'brak pola wartości';
  const b=T.bal(a.id);el.value='1 000';saveValues();await wait(500);const v1=vs();
  openValues();await wait(150);saveValues();await wait(500);
  return vs()===v1&&T.bal(a.id)===100000||`ręczna wartość zmieniona: ${v1} → ${vs()}, saldo ${b} → ${T.bal(a.id)}`}));

/* 📊 „Czego używamy”: każda karta (section.chart) na głównych ekranach ma swój klucz w katalogu USAGE_CAT – inaczej wyszłaby jako nieużywana (audyt 2) */
await step('Czego używamy – karty w katalogu',async()=>E(async()=>{const U=await import('/js/usage.js'),wait=ms=>new Promise(r=>setTimeout(r,ms)),miss=new Set();
  const look=()=>document.querySelectorAll('#app section.chart:not([data-nouse])').forEach(el=>{const k=U.cardKey(el.querySelector('.ct b')?.textContent);if(k&&!U.LABEL['k:'+k])miss.add(k)});
  for(const f of [()=>goTab('dash'),()=>goTab('sav'),()=>goTab('acc'),()=>goTab('ana'),()=>{goTab('ana');setAna('y')},()=>goTab('fix')]){f();await wait(250);look()}
  return !miss.size||'brak w katalogu: '+[...miss].join(', ')}));

/* no JS errors on the way; the whole store is still valid for the real SDK (the demo stand-in throws like the SDK) */
await ctx.close();await browser.close();srv.close();
console.log(fails.length?`\n❌ Zapis wpisów: ${fails.length} problem(ów) w ${n} scenariuszach.`:`✅ Zapis i usuwanie wpisów działa (${n} scenariuszy).`);
process.exit(fails.length?1:0);
