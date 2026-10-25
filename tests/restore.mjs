/* 🤖 Robot: czy kopia zapasowa naprawdę się wczytuje. Otwiera czystą wersję demo (bez przykładowych danych), wczytuje kopię
   przez ⚙️ → „Wczytaj kopię” i porównuje z plikiem: wpisy (id i kwoty), konta, pozycje, plany, paski, zobowiązania, instrumenty, cele i salda wszystkich kont.
   Wypisuje tylko liczby (dziennik GitHuba jest publiczny).
   node tests/restore.mjs plik.json[.gz]   – sprawdza ten plik (automat po comiesięcznej kopii, .github/workflows/mail.yml)
   node tests/restore.mjs --demo           – robi kopię z przykładowych danych demo i ją sprawdza (robot przy każdej zmianie) */
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import zlib from 'node:zlib';import {fileURLToPath} from 'node:url';
const pw=await import('playwright').catch(()=>import('/opt/node-tools/node_modules/playwright/index.mjs'));
const {chromium}=pw.default||pw;
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),OUT=path.join(ROOT,'tests','out');fs.mkdirSync(OUT,{recursive:true});
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(ROOT,p);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
  r.writeHead(200,{'Content-Type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,r));const BASE=`http://localhost:${srv.address().port}`;
const exe=['/opt/pw-browsers/chromium'].find(p=>fs.existsSync(p));const browser=await chromium.launch(exe?{executablePath:exe}:{});
let jsErr=0;
const page=async(clean)=>{const ctx=await browser.newContext({viewport:{width:390,height:800},locale:'pl-PL',acceptDownloads:true});const p=await ctx.newPage();
  p.on('pageerror',()=>jsErr++);
  await p.addInitScript(c=>{if(sessionStorage.getItem('robot'))return;sessionStorage.setItem('robot','1');localStorage.clear();
    localStorage.setItem('demo_people',JSON.stringify({me:'Mati',role:'Mati',partner:'Wercia'}));const t=new Date().toISOString().slice(0,10);
    for(const[k,v] of [['mw_tour','1'],['mw_news','999'],['mw_today',t],['mw_eve',t],['mw_kotki','off']])localStorage.setItem('demo_'+k,v);
    if(c)localStorage.setItem('demo_db',JSON.stringify({'households/main':{v:2}}))},clean);
  await p.goto(BASE+'/demo/');await p.waitForFunction(()=>window.S&&window.S.cfg,null,{timeout:20000});await p.waitForTimeout(500);return{ctx,p}};

let file=process.argv[2];
if(!file||file=='--demo'){const{ctx,p}=await page(false);
  const b=await p.evaluate(()=>({format:'budzet-mw-2',exported:new Date().toISOString(),cfg:S.cfg,savTarget:S.savTarget,tx:S.tx,plans:S.plans,inv:S.inv,goals:S.goals,slips:S.slips,hold:S.hold,debts:S.debts}));
  file=path.join(OUT,'demo-kopia.json');fs.writeFileSync(file,JSON.stringify(b));await ctx.close()}
let raw=fs.readFileSync(file);if(raw[0]==0x1f&&raw[1]==0x8b)raw=zlib.gunzipSync(raw);const B=JSON.parse(raw.toString('utf8'));

const{ctx,p}=await page(true);
await p.setInputFiles('#fileIn',file);
await p.waitForFunction(()=>!document.getElementById('dlg').hidden&&/Wczytać kopię/.test(document.getElementById('dlg').innerText),null,{timeout:20000});
await p.click('#dlg button:has-text("Wczytaj")');
const want=B.tx.filter(t=>/^\d{4}-\d\d-\d\d$/.test(t.date||'')).length;
await p.waitForFunction(n=>S.tx.length>=n,want,{timeout:120000}).catch(()=>{});await p.waitForTimeout(1500);
const R=await p.evaluate(async B=>{const{balance}=await import('/js/logic.js');const isD=d=>/^\d{4}-\d\d-\d\d$/.test(d||'');
  const bt=B.tx.filter(t=>isD(t.date)),byId=new Map(S.tx.map(t=>[t.id,t]));let miss=0,diff=0;
  for(const t of bt){const x=byId.get(t.id);if(!x)miss++;else if(x.amount!==t.amount||!!x.deleted!==!!t.deleted||x.date!==t.date||(x.acc||'')!==(t.acc||''))diff++}
  const n=o=>Object.keys(o||{}).length,live=o=>Object.values(o||{}).filter(x=>!x.deleted).length,subs=c=>c.cats.reduce((a,k)=>a+k.subs.length,0);
  const bTx=bt.map(t=>({...t}));let bal=0;for(const a of B.cfg.accs)if(balance(B.cfg,bTx,a.id,'9999-99-99')!==balance(S.cfg,S.tx,a.id,'9999-99-99'))bal++;
  return{tx:bt.length,txApp:S.tx.length,miss,diff,acc:[B.cfg.accs.length,S.cfg.accs.length],subs:[subs(B.cfg),subs(S.cfg)],fixed:[(B.cfg.fixed||[]).length,(S.cfg.fixed||[]).length],
    plans:[n(B.plans),n(S.plans)],slips:[n(B.slips),n(S.slips)],debts:[live(B.debts),live(S.debts)],hold:[live(B.hold),live(S.hold)],goals:[n(B.goals),n(S.goals)],bal,accN:B.cfg.accs.length}},B);
await ctx.close();await browser.close();srv.close();

const pairs=['acc','subs','fixed','plans','slips','debts','hold','goals'].filter(k=>R[k][0]!==R[k][1]);
const ok=!R.miss&&!R.diff&&R.txApp===R.tx&&!pairs.length&&!R.bal&&!jsErr;
console.log(`${ok?'✅':'❌'} Kopia: wpisy ${R.txApp} z ${R.tx}${R.miss?`, brakuje ${R.miss}`:''}${R.diff?`, różni się ${R.diff}`:''} · salda ${R.accN-R.bal} z ${R.accN} kont zgodne · konta ${R.acc[1]}/${R.acc[0]} · pozycje ${R.subs[1]}/${R.subs[0]} · plany ${R.plans[1]}/${R.plans[0]} · paski ${R.slips[1]}/${R.slips[0]} · zobowiązania ${R.debts[1]}/${R.debts[0]} · instrumenty ${R.hold[1]}/${R.hold[0]} · cele ${R.goals[1]}/${R.goals[0]}${jsErr?` · błędy JavaScript: ${jsErr}`:''}`);
if(pairs.length)console.log('❌ Nie zgadza się: '+pairs.join(', '));
process.exit(ok?0:1);
