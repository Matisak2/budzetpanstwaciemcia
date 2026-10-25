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
const SCREENS=[['budzet',"goTab('dash')"],['rejestr',"goTab('tx')"],['stale',"goTab('fix');setFixSub('fix')"],['pensje',"setFixSub('pay')"],['pit',"setPayView&&setPayView('year')"],
  ['roczne',"setFixSub('year')"],['przypomnienia',"setFixSub('rem')"],['oszczednosci',"goTab('sav')"],['konta',"goTab('acc');setAccView('acc')"],['my-winni',"setAccView('owe')"],
  ['nam-winni',"setAccView('lent')"],['analiza',"goTab('ana');setAna('m');setAnaMode('full')"],['analiza-podst',"setAnaMode('basic')"],['analiza-rok',"setAnaMode('full');setAna('y')"],
  ['ustawienia',"goTab('set')"],
  ['usuniete',"{const L=S.tx.filter(t=>!t.deleted&&t.type=='exp').slice(0,3);L.forEach((t,i)=>{t.deleted=true;t.dAt=Date.now()-i*1000;t.dby='Mati'});goTab('dash');goTab('set')}"],
  ['umowa-stale',"{const f=S.cfg.fixed.find(f=>(f.kind||'exp')=='exp');f.until=new Date(Date.now()+40*864e5).toISOString().slice(0,10);window.__umowa=f.id;goTab('fix');setFixSub('fix')}"],
  ['umowa-na-dzis',"closeAll();showToday()"],['umowa-edycja',"closeAll();editFixed(window.__umowa)"],['gdzie-wydajemy',"closeAll();goTab('ana');setAnaMode('full');setAna('m')"],
  ['podpowiedz-notatki',"closeAll();openTx();setTimeout(()=>{const m=$('mn');m.focus();m.value='bi';m.dispatchEvent(new Event('input'))},200)"],
  ['dyskretny-budzet',"setHide(1);goTab('dash')"],['dyskretny-analiza',"goTab('ana');setAna('m')"],['dyskretny-majatek',"goTab('sav')"],['dyskretny-koniec',"setHide(0);goTab('dash')"],['nowy-wpis',"goTab('dash');openTx()"],['na-dzis',"closeAll();showToday()"],['pomoc',"closeAll();openHelp()"]];
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
  await ctx.close();
}
await browser.close();srv.close();
console.log(fails.length?`\n❌ Robot znalazł ${fails.length} problem(ów).`:`\n✅ Wszystkie ekrany w porządku (${CASES.length} ustawienia telefonu × ${SCREENS.length} ekranów).`);
process.exit(fails.length?1:0);
