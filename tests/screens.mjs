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
    try{await p.evaluate(code)}catch(e){fail(`${tag}: ekran „${name}” – ${e.message.split('\n')[0]}`);continue}
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
    if(name=='usuniete'&&!await p.evaluate(()=>/Ostatnio usunięte/.test(document.getElementById('app').innerText)))fail(`${tag}: brak karty „Ostatnio usunięte”`);
    await p.screenshot({path:path.join(OUT,`${tag}-${name}.png`),fullPage:true});
  }
  await ctx.close();
}
await browser.close();srv.close();
console.log(fails.length?`\n❌ Robot znalazł ${fails.length} problem(ów).`:`\n✅ Wszystkie ekrany w porządku (${CASES.length} ustawienia telefonu × ${SCREENS.length} ekranów).`);
process.exit(fails.length?1:0);
