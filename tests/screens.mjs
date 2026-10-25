/* 🤖 Robot: otwiera wersję demo (bez prawdziwych danych) w niewidocznej przeglądarce jak na telefonie i przechodzi przez wszystkie ekrany.
   Sprawdza: błędy JavaScript, napisy / przyciski wychodzące poza ekran, czy okienko transakcji jest takie samo w index.html i demo/index.html.
   Uruchomienie: node tests/screens.mjs   (zrzuty ekranów lądują w tests/out/)   Uruchamiany przez .github/workflows/test.yml */
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const pw=await import('playwright').catch(()=>import('/opt/node-tools/node_modules/playwright/index.mjs'));
const {chromium}=pw.default||pw;
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),OUT=path.join(ROOT,'tests','out');
fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
const fails=[],warns=[];const fail=m=>{fails.push(m);console.log('❌ '+m)};

/* 1. the transaction sheet must be the same in the app and in the demo (CLAUDE.md: „zmieniaj oba”) */
const body=f=>{const s=fs.readFileSync(path.join(ROOT,f),'utf8').replaceAll('../','');const a=s.indexOf('<body');return s.slice(a,s.slice(a).search(/<script|<!-- demo/)+a)};
if(body('index.html')!==body('demo/index.html'))fail('index.html i demo/index.html różnią się w treści strony (okienko transakcji trzeba zmieniać w obu)');

/* every file of the app must be in the offline copy (sw.js SHELL), otherwise the app breaks without internet */
{const sw=fs.readFileSync(path.join(ROOT,'sw.js'),'utf8');for(const f of fs.readdirSync(path.join(ROOT,'js')).filter(f=>f.endsWith('.js')))if(!sw.includes(`'./js/${f}'`))fail(`sw.js: brak js/${f} na liście SHELL (kopia offline)`)}

/* 2. a tiny static server */
const TYPES={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
  r.writeHead(200,{'Content-Type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,r));const BASE=`http://localhost:${srv.address().port}`;

const exe=['/opt/pw-browsers/chromium'].find(p=>fs.existsSync(p));
const browser=await chromium.launch(exe?{executablePath:exe}:{});

/* every screen: [name, code run in the page] */
const SCREENS=[['budzet',"goTab('dash')"],['rejestr',"goTab('tx')"],['rejestr-filtry',"togF()"],['stale',"goTab('fix');setFixSub('fix')"],['pensje',"setFixSub('pay')"],['pit',"setPayView&&setPayView('year')"],
  ['roczne',"setFixSub('year')"],['przypomnienia',"setFixSub('rem')"],['oszczednosci',"goTab('sav')"],['konta',"goTab('acc');setAccView('acc')"],['my-winni',"setAccView('owe')"],
  ['nam-winni',"setAccView('lent')"],['analiza',"goTab('ana');setAna('m');setAnaMode('full')"],['analiza-podst',"setAnaMode('basic')"],['analiza-rok',"setAnaMode('full');setAna('y')"],
  ['ustawienia',"S.setOpen={bud:1,tel:1,bez:1,auto:1,pom:1};goTab('set')"],
  ['usuniete',"{const L=S.tx.filter(t=>!t.deleted&&t.type=='exp').slice(0,3);S.tx=S.tx.map(t=>{const i=L.indexOf(t);return i<0?t:{...t,deleted:true,dAt:Date.now()-i*1000,dby:'Mati'}});S.setOpen={bez:1};goTab('dash');goTab('set')}"],
  ['umowa-stale',"{const f=S.cfg.fixed.find(f=>(f.kind||'exp')=='exp');f.until=new Date(Date.now()+40*864e5).toISOString().slice(0,10);window.__umowa=f.id;goTab('fix');setFixSub('fix')}"],
  ['umowa-na-dzis',"closeAll();showToday()"],['umowa-edycja',"closeAll();editFixed(window.__umowa)"],['gdzie-wydajemy',"closeAll();goTab('ana');setAnaMode('full');setAna('m')"],
  ['podpowiedz-notatki',"closeAll();openTx();setTimeout(()=>{const m=$('mn');m.focus();m.value='bi';m.dispatchEvent(new Event('input'))},200)"],
  ['dyskretny-budzet',"setHide(1);goTab('dash')"],['dyskretny-analiza',"goTab('ana');setAna('m')"],['dyskretny-majatek',"goTab('sav')"],['dyskretny-koniec',"setHide(0);goTab('dash')"],['nowy-wpis',"goTab('dash');openTx()"],['na-dzis',"closeAll();showToday()"],['pomoc',"closeAll();openHelp()"],
  ['urodziny',"closeAll();askBirth(true)"],
  ['stale-polacz',"closeAll();{const f=S.cfg.fixed.find(f=>(f.kind||'exp')=='exp'&&f.name=='Netflix')||S.cfg.fixed.find(f=>(f.kind||'exp')=='exp');window.__tw=f.id;S.tx=S.tx.map(t=>t.fixedId===f.id&&t.date.startsWith(S.ym)?{...t,deleted:true}:t).concat([{id:'ttw',type:'exp',amount:f.amount,date:S.ym+'-03',sub:f.sub,acc:f.acc,note:f.name,who:'Wercia',by:'Wercia',ts:1,deleted:false}]);goTab('fix');setFixSub('fix')}"],
  ['stale-polacz-pytanie',"toggleFixed(window.__tw)"],
  ['plan-oplaty',"closeAll();{const f=S.cfg.fixed.find(f=>(f.kind||'exp')=='exp'&&f.sub);S.plans={...S.plans,[S.ym]:{...(S.plans[S.ym]||{}),[f.sub]:Math.max(0,f.amount-5000)}};goTab('dash')}"],
  ['wpis-oplata-pytanie',"closeAll();{const f=S.cfg.fixed.find(x=>x.id==window.__tw);S.tx=S.tx.map(t=>t.id=='ttw'?{...t,deleted:true}:t);openTx();setTimeout(()=>{$('ma').value=String(f.amount/100).replace('.',',');$('ms').value=f.sub;$('shSave').click()},150)}"],
  ['pasek-mlodzi',"closeAll();{S.hraw={...S.hraw,birth:{Mati:'2001-05-12',Wercia:'2001-05-12'}};if(!S.cfg.incs.some(x=>x.id=='iy'))S.cfg.incs.push({id:'iy',name:'Szpital',who:S.who,kind:'uop',acc:S.cfg.accs[0].id,sub:'',day:10});goTab('fix');setFixSub('pay');openSlip('iy');setTimeout(()=>{document.querySelector('.slip [data-c=\"0\"][data-f=\"a\"]').value='8000';slipSuggest()},100)}"],
  ['urodziny-powitanie',"closeAll();S.slip=null;{const t=new Date().toISOString().slice(0,10);S.hraw={...S.hraw,birth:{Mati:'1995'+t.slice(4),Wercia:'1996'+t.slice(4)}};goTab('dash')}"]];
const CASES=[{w:390,size:'0',role:'Wercia'},{w:360,size:'2',role:'Mati'},{w:320,size:'0',role:'Mati'},{w:390,size:'1',role:'Wercia'}];

for(const C of CASES){
  const tag=`${C.w}px-A${['','+','++'][C.size]}-${C.role}`;
  const ctx=await browser.newContext({viewport:{width:C.w,height:800},deviceScaleFactor:1,locale:'pl-PL',timezoneId:'Europe/Warsaw'});
  const p=await ctx.newPage();
  p.on('pageerror',e=>fail(`${tag}: błąd JavaScript: ${e.message}`));
  p.on('console',m=>{if(m.type()=='error'&&!/Failed to load resource|net::|ERR_/.test(m.text()))fail(`${tag}: błąd w konsoli: ${m.text()}`)});
  await p.addInitScript(([C])=>{if(sessionStorage.getItem('robot'))return;sessionStorage.setItem('robot','1');localStorage.clear();
    localStorage.setItem('demo_people',JSON.stringify({me:C.role=='Mati'?'Kuba':'Ania',role:C.role,partner:C.role=='Mati'?'Ola':'Tomek'}));
    const t=new Date().toISOString().slice(0,10);for(const[k,v] of [['mw_tour','1'],['mw_news','999'],['mw_today',t],['mw_eve',t],['mw_size',C.size]])localStorage.setItem('demo_'+k,v)},[C]);
  await p.goto(BASE+'/demo/');
  await p.waitForFunction(()=>window.goTab&&document.querySelector('#app .kpis,#app .card'),null,{timeout:20000}).catch(()=>fail(`${tag}: aplikacja się nie wczytała`));
  await p.evaluate(()=>{window.closeAll=()=>{document.querySelectorAll('.ov').forEach(o=>o.hidden=true)}});
  for(const [name,code] of SCREENS){
    /* run without waiting: a dialog (ask) returns a promise that settles only when someone closes it */
    try{await p.evaluate(c=>{(0,eval)(c)},code)}catch(e){fail(`${tag}: ekran „${name}” – ${e.message.split('\n')[0]}`);continue}
    await p.waitForTimeout(350);
    const bad=await p.evaluate(()=>{const W=document.documentElement.clientWidth,out=[];
      if(document.documentElement.scrollWidth>W+1)out.push(`cała strona szersza niż ekran (${document.documentElement.scrollWidth} > ${W})`);
      const clipped=e=>{for(let a=e.parentElement;a&&a!=document.body;a=a.parentElement){const s=getComputedStyle(a);if(/auto|scroll/.test(s.overflowX)&&a.getBoundingClientRect().right<=W+1)return true}return false};
      const vis=e=>{const s=getComputedStyle(e);return s.visibility!='hidden'&&s.display!='none'&&e.offsetParent!==null};
      const roots=[document.getElementById('app'),...[...document.querySelectorAll('.ov')].filter(o=>!o.hidden)];
      for(const r of roots)for(const e of r.querySelectorAll('*')){const b=e.getBoundingClientRect();
        if(b.width>0&&b.right>W+1&&vis(e)&&getComputedStyle(e).position!='fixed'&&!clipped(e)){out.push(`wychodzi poza ekran: <${e.tagName.toLowerCase()} class="${e.className.baseVal??e.className}"> „${(e.textContent||'').trim().slice(0,40)}” (prawa krawędź ${Math.round(b.right)} > ${W})`);if(out.length>5)break}}
      return out});
    bad.forEach(m=>fail(`${tag}: ekran „${name}” – ${m}`));
    if(/^dyskretny-(budzet|analiza|majatek)/.test(name)){const leak=await p.evaluate(()=>(document.getElementById('app').innerText.match(/\d[\d\u00a0 ]*(,\d+)?\s?(zł|€|\$|£|tys\.)/g)||[]).slice(0,5));
      if(leak.length)fail(`${tag}: tryb dyskretny – widać kwoty: ${leak.join(' | ')}`)}
    if(name=='umowa-na-dzis'&&!await p.evaluate(()=>/umowa kończy się/.test(document.body.innerText)))fail(`${tag}: „Na dziś” nie przypomina o końcu umowy`);
    if(name=='gdzie-wydajemy'&&!await p.evaluate(()=>/Gdzie wydajemy/.test(document.getElementById('app').innerText)))fail(`${tag}: brak „Gdzie wydajemy” w Analizie`);
    if(name=='podpowiedz-notatki'&&!await p.evaluate(()=>!document.getElementById('mnSug').hidden&&document.querySelectorAll('#mnSug .chip').length>0))fail(`${tag}: brak podpowiedzi notatki`);
    if(name=='podpowiedz-notatki')await p.evaluate(()=>{document.getElementById('mn').blur();document.getElementById('sheet').hidden=true});
    if(name=='usuniete'&&!await p.evaluate(()=>/Ostatnio usunięte/.test(document.getElementById('app').innerText)))fail(`${tag}: brak karty „Ostatnio usunięte”`);
    await p.screenshot({path:path.join(OUT,`${tag}-${name}.png`),fullPage:true});
  }
  /* 🙈 holding the month name switches the discreet mode on and off */
  if(C===CASES[0]){await p.evaluate(()=>closeAll());const box=await p.locator('.mlab').boundingBox();
    for(const want of [true,false]){await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.waitForTimeout(800);await p.mouse.up();await p.waitForTimeout(300);
      if(await p.evaluate(()=>document.body.classList.contains('hidev'))!==want)fail(`${tag}: przytrzymanie nazwy miesiąca nie ${want?'włącza':'wyłącza'} trybu dyskretnego`)}}
  /* 👯 the same receipt typed twice: a question before saving, „Nie zapisuj” keeps everything as it was */
  if(C===CASES[0]){try{await p.evaluate(()=>closeAll());
    const n0=await p.evaluate(()=>{const t=S.tx.find(t=>!t.deleted&&t.type=='exp'&&t.note&&!t.fixedId&&!t.split);openTx();
      $('ma').value=String(t.amount/100).replace('.',',');$('md').value=t.date;$('mn').value=t.note;$('ms').value=t.sub;return S.tx.length});
    await p.waitForTimeout(200);await p.click('#shSave');await p.waitForTimeout(400);
    if(!await p.evaluate(()=>!document.getElementById('dlg').hidden&&/Taki wpis już jest/.test(document.getElementById('dlg').innerText)))fail(`${tag}: brak ostrzeżenia przed podwójnym wpisem`);
    else{await p.click('#dlg button:has-text("Nie zapisuj")');await p.waitForTimeout(400);
      if(await p.evaluate(()=>S.tx.length)!==n0||await p.evaluate(()=>document.getElementById('sheet').hidden))fail(`${tag}: „Nie zapisuj” nie zostawia okienka bez zmian`)}
    await p.evaluate(()=>closeAll());
  }catch(e){fail(`${tag}: test podwójnego wpisu – ${e.message.split('\n')[0]}`)}}
  /* 📷 receipt photo: add (a generated picture), save, open again, remove – only in the first phone setting */
  if(C===CASES[0]){try{
    const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGP8z8DAwMDAxMDAwMDAAAANHQEDasKb6QAAAABJRU5ErkJggg==','base64');
    const id=await p.evaluate(()=>{closeAll();goTab('tx');const t=S.tx.find(t=>!t.deleted&&t.type=='exp'&&!t.fixedId&&!t.split);openTx(t.id);return t.id});await p.waitForTimeout(300);
    await p.setInputFiles('#mphIn',{name:'paragon.png',mimeType:'image/png',buffer:png});await p.waitForTimeout(800);
    if(await p.$$eval('#mph .phi img',x=>x.length)!=1)fail(`${tag}: zdjęcie paragonu nie pojawiło się w okienku`);
    await p.screenshot({path:path.join(OUT,`${tag}-zdjecie.png`)});
    await p.click('#shSave');await p.waitForTimeout(600);
    const r=await p.evaluate(id=>({rcpt:(S.tx.find(t=>t.id==id).rcpt||[]).length,meta:S.rcptMeta?.n||0}),id);if(r.rcpt!=1||r.meta!=1)fail(`${tag}: zdjęcie nie zapisało się przy wpisie (${JSON.stringify(r)})`);
    await p.evaluate(id=>openTx(id),id);await p.waitForTimeout(700);if(await p.$$eval('#mph .phi img',x=>x.length)!=1)fail(`${tag}: zapisane zdjęcie nie wczytuje się po otwarciu wpisu`);
    await p.click('#mph [data-phx]');await p.click('#shSave');await p.waitForTimeout(600);
    if(await p.evaluate(()=>S.rcptMeta?.n||0))fail(`${tag}: po usunięciu zdjęcia licznik się nie zmniejszył`);
  }catch(e){fail(`${tag}: test zdjęcia – ${e.message.split('\n')[0]}`)}}
  /* 🙈 hiding a position: it leaves the position picker and comes back with ↺; „Plan a rzeczywistość” in Analiza → Rok; a yearly expense due this month is in the plan */
  if(C===CASES[0]){try{
    const r=await p.evaluate(()=>{closeAll();const ci=S.cfg.cats.findIndex(c=>c.type=='exp'&&c.subs.length>1),s=S.cfg.cats[ci].subs[1];hideSub(ci,1,true);
      goTab('set');const inSet=/Ukryte:/.test(document.getElementById('app').innerText);openTx();$('pq').value='';window.__hid=s;return{ci,id:s.id,inSet}});
    await p.waitForTimeout(300);await p.evaluate(()=>{$('msBtn').click();$('pq').value=window.__hid.name.slice(0,6);$('pq').dispatchEvent(new Event('input'))});await p.waitForTimeout(200);
    const inPick=await p.evaluate(id=>!!document.querySelector(`#pkBody [data-sid="${id}"]`),r.id);
    await p.screenshot({path:path.join(OUT,`${tag}-ukryta-pozycja.png`),fullPage:true});
    if(!r.inSet)fail(`${tag}: brak linijki „Ukryte” w ⚙️ → Kategorie`);if(inPick)fail(`${tag}: ukryta pozycja dalej jest w oknie wyboru`);
    await p.evaluate(ci=>{closeAll();hideSub(ci,1,false)},r.ci);await p.waitForTimeout(200);
    if(await p.evaluate(ci=>!!S.cfg.cats[ci].subs[1].hidden,r.ci))fail(`${tag}: ↺ nie przywraca ukrytej pozycji`);
    await p.evaluate(()=>{goTab('ana');setAnaMode('full');setAna('y')});await p.waitForTimeout(300);
    if(!await p.evaluate(()=>/plan a rzeczywisto/i.test(document.getElementById('app').innerText)))fail(`${tag}: brak „Plan a rzeczywistość” w Analizie roku`);
    await p.screenshot({path:path.join(OUT,`${tag}-plan-a-rzeczywistosc.png`),fullPage:true});
    const y=await p.evaluate(()=>{const sub=S.cfg.cats.find(c=>c.type=='exp').subs.at(-1);S.cfg.years=[{id:'yT',name:'OC (test)',amount:120000,month:+S.ym.slice(5),every:12,sub:sub.id}];
      setAna('m');goTab('dash');S.open[S.cfg.cats.find(c=>c.subs.includes(sub)).id]=true;S.showEmpty={};render();return/OC \(test\)/.test(document.getElementById('app').innerText)});
    if(!y)fail(`${tag}: wydatek roczny z terminem w tym miesiącu nie doliczył się do planu w Budżecie`);
    await p.evaluate(()=>{S.cfg.years=[];render()});
  }catch(e){fail(`${tag}: test ukrywania / planu – ${e.message.split('\n')[0]}`)}}
  /* 📅 „+ Dodaj” in Roczne i terminy: with an amount → a yearly expense, without → a reminder; 💧 the cascade never proposes PPK */
  if(C===CASES[0]){try{
    const d=new Date(Date.now()+20*864e5).toISOString().slice(0,10);
    await p.evaluate(()=>{closeAll();goTab('fix');setFixSub('year');addTerm()});await p.waitForTimeout(300);
    await p.selectOption('#f_p','oc');await p.fill('#f_a','1 200');await p.fill('#f_d',d);await p.evaluate(()=>{const x=document.getElementById('f_s');x.value=[...x.options].find(o=>o.value).value});await p.click('#dlgOk');await p.waitForTimeout(400);
    await p.evaluate(()=>{addTerm()});await p.waitForTimeout(300);await p.selectOption('#f_p','szczep');await p.fill('#f_d',d);await p.click('#dlgOk');await p.waitForTimeout(400);
    const t=await p.evaluate(()=>({y:(S.cfg.years||[]).map(x=>x.name+'|'+x.amount+'|'+x.day),r:(S.cfg.rems||[]).map(x=>x.name),txt:document.getElementById('app').innerText}));
    if(!t.y.some(x=>/OC samochodu\|120000\|\d+/.test(x)))fail(`${tag}: „+ Dodaj” z kwotą nie dodał wydatku rocznego (${t.y})`);
    if(!t.r.some(x=>/Szczepienie/.test(x)))fail(`${tag}: „+ Dodaj” bez kwoty nie dodał przypomnienia`);
    if(!/Z odkładaniem/i.test(t.txt)||!/Terminy bez odkładania/i.test(t.txt))fail(`${tag}: brak obu części „Roczne i terminy”`);
    await p.screenshot({path:path.join(OUT,`${tag}-roczne-i-terminy.png`),fullPage:true});
    const k=await p.evaluate(()=>{const out=[];for(const o of ['Mati','Wercia','Wspólne']){goTab('sav');setSub(o);const x=document.getElementById('app').innerText,i=x.indexOf('Kaskada');if(i>=0)out.push(x.slice(i,i+400))}return out.join(' || ')});
    if(/PPK/.test(k.split('Konta „inwest.”')[0]))fail(`${tag}: kaskada proponuje PPK: ${k.slice(0,200)}`);
    if(/Gotówka\s*→/.test(k))fail(`${tag}: kaskada proponuje przelew z gotówki`);
  }catch(e){fail(`${tag}: test „Roczne i terminy” / kaskady – ${e.message.split('\n')[0]}`)}}
  /* 💼 payslip from the net amount: a test income source with a deduction (Multisport 150 zł) – the deduction is in the new payslip by itself,
     „Podpowiedz z netto” 7 000 zł gives a payslip that adds up, saving books 7 150 zł income + 150 zł expense; „Przychody spoza pasków” is shown */
  if(C===CASES[0]){try{
    /* a position no fixed income uses (the demo pay from 📌 Stałe would rightly trigger „Ta pensja już jest w tym miesiącu?”) */
    await p.evaluate(()=>{closeAll();const used=new Set(S.cfg.fixed.map(f=>f.sub)),inc=S.cfg.cats.filter(c=>c.type=='inc').flatMap(c=>c.subs).find(x=>!used.has(x.id)).id,exp=S.cfg.cats.find(c=>c.type=='exp').subs[0].id;
      S.cfg.incs=[{id:'iT',name:'Szpital (test)',who:'Mati',kind:'uop',acc:S.cfg.accs.find(a=>a.grp=='cur').id,sub:inc,day:10,ppk:'',fixed:'',deds:[{n:'Multisport',a:15000,sub:exp}]}];
      goTab('fix');setFixSub('pay');openSlip('iT')});await p.waitForTimeout(300);
    if(await p.evaluate(()=>S.slip?.d.ded?.[0]?.n)!=='Multisport')fail(`${tag}: potrącenie ze źródła dochodu nie wpisało się samo do nowego paska`);
    await p.evaluate(()=>{slipNetto()});await p.waitForTimeout(300);await p.fill('#f_n','7 000,00');await p.click('#dlgOk');await p.waitForTimeout(400);
    const s=await p.evaluate(()=>({net:S.slip.d.net,b:S.slip.d.comp[0]?.a||0,chk:document.getElementById('slChk')?.innerText||''}));
    if(s.net!==700000||!(s.b>900000)||!/zgadza/.test(s.chk))fail(`${tag}: pasek z netto się nie zgadza (${JSON.stringify(s)})`);
    await p.screenshot({path:path.join(OUT,`${tag}-pasek-netto.png`),fullPage:true});
    await p.evaluate(()=>{saveSlip()});await p.waitForTimeout(800);
    const t=await p.evaluate(()=>{const i=S.tx.find(t=>!t.deleted&&t.slip=='iT');return{inc:i?.amount,ded:i?S.tx.filter(t=>!t.deleted&&t.slipOf==i.id).map(t=>t.amount):[]}});
    if(t.inc!==715000||JSON.stringify(t.ded)!=='[15000]')fail(`${tag}: pasek z netto zaksięgował się źle (${JSON.stringify(t)})`);
    if(!await p.evaluate(()=>/spoza pasków/i.test(document.getElementById('app').innerText)))fail(`${tag}: brak „Przychody spoza pasków” w 💼 Pensje`);
    await p.screenshot({path:path.join(OUT,`${tag}-pensje-po-pasku.png`),fullPage:true});
    /* the same pay twice: a source on the position of the demo „Pensja” already ticked in 📌 Stałe → a question before saving, „Nie zapisuj” books nothing */
    const n0=await p.evaluate(()=>{const f=S.cfg.fixed.find(f=>f.kind=='inc');S.cfg.incs.push({...S.cfg.incs[0],id:'iT2',sub:f.sub,deds:[]});openSlip('iT2');return S.tx.length});await p.waitForTimeout(300);
    await p.evaluate(()=>{slipNetto()});await p.waitForTimeout(300);await p.fill('#f_n','5 000');await p.click('#dlgOk');await p.waitForTimeout(300);
    await p.evaluate(()=>{saveSlip()});await p.waitForTimeout(400);
    if(!await p.evaluate(()=>!document.getElementById('dlg').hidden&&/już jest w tym miesiącu/.test(document.getElementById('dlg').innerText)))fail(`${tag}: brak ostrzeżenia przed podwójną pensją`);
    else{await p.click('#dlg button:has-text("Nie zapisuj")');await p.waitForTimeout(400);if(await p.evaluate(()=>S.tx.length)!==n0)fail(`${tag}: „Nie zapisuj” mimo to zapisało pensję`)}
  }catch(e){fail(`${tag}: test paska z netto – ${e.message.split('\n')[0]}`)}}
  await ctx.close();
}
/* 3. the real start page (index.html, not the demo): Firebase replaced by small stand-ins with no data –
   a) nobody logged in → the login screen, b) logged in to an empty household → the app starts with the default budget */
const FB={
  'firebase-app.js':`export const initializeApp=()=>({});`,
  'firebase-auth.js':`export const getAuth=()=>({currentUser:window.__TEST_USER||null});export const setPersistence=async()=>{};export const browserLocalPersistence={};
    export const onAuthStateChanged=(a,cb)=>{setTimeout(()=>cb(window.__TEST_USER||null),20);return()=>{}};export const signInWithEmailAndPassword=async()=>{throw new Error('test')};export const signOut=async()=>{};`,
  'firebase-firestore.js':`const meta={fromCache:false,hasPendingWrites:false};export const initializeFirestore=()=>({});export const persistentLocalCache=()=>({});export const persistentMultipleTabManager=()=>({});
    export const doc=(b,...s)=>({p:[b&&b.p,...s].filter(Boolean).join('/'),doc:true});export const collection=(b,n)=>({p:[b&&b.p,n].filter(Boolean).join('/'),col:true});
    export const onSnapshot=(ref,a,b)=>{const cb=typeof a=='function'?a:b;setTimeout(()=>cb(ref.doc?{exists:()=>false,data:()=>undefined,id:ref.p.split('/').pop(),metadata:meta}:{docs:[],metadata:meta}),30);return()=>{}};
    export const setDoc=async()=>{};export const updateDoc=async()=>{};export const deleteDoc=async()=>{};export const deleteField=()=>({});export const increment=n=>n;export const waitForPendingWrites=async()=>{};
    export const getDoc=async()=>({exists:()=>false,data:()=>undefined});export const getDocs=async()=>({docs:[]});`};
for(const [tag,user] of [['prawdziwa strona – logowanie',null],['prawdziwa strona – pusty budżet',{uid:'test',email:'test@example.com'}]]){
  const ctx=await browser.newContext({viewport:{width:390,height:800},serviceWorkers:'block'});const p=await ctx.newPage();
  p.on('pageerror',e=>fail(`${tag}: błąd JavaScript: ${e.message}`));
  p.on('console',m=>{if(m.type()=='error'&&!/Failed to load resource|net::|ERR_/.test(m.text()))fail(`${tag}: błąd w konsoli: ${m.text()}`)});
  await p.route('https://www.gstatic.com/firebasejs/**',r=>{const f=Object.keys(FB).find(k=>r.request().url().endsWith(k));return f?r.fulfill({contentType:'text/javascript',body:FB[f]}):r.abort()});
  await p.addInitScript(u=>{window.__TEST_USER=u},user);
  await p.goto(BASE+'/');await p.waitForTimeout(1500);
  if(!user&&!await p.isVisible('#loginBtn'))fail(`${tag}: nie widać ekranu logowania`);
  if(user&&!await p.evaluate(()=>!!document.querySelector('#app .kpis,#app .card')))fail(`${tag}: aplikacja nie pokazała budżetu`);
  await p.screenshot({path:path.join(OUT,`${tag.replace(/\W+/g,'-')}.png`),fullPage:true});await ctx.close()}

await browser.close();srv.close();
console.log(fails.length?`\n❌ Robot znalazł ${fails.length} problem(ów).`:`\n✅ Wszystkie ekrany w porządku (${CASES.length} ustawienia telefonu × ${SCREENS.length} ekranów).`);
process.exit(fails.length?1:0);
