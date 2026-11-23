/* 🤖 Wspólne dla testów w przeglądarce (flows.mjs): mały serwer plików repozytorium, Chromium i strona demo przygotowana jak w screens.mjs. */
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const pw=await import('playwright').catch(()=>import('/opt/node-tools/node_modules/playwright/index.mjs'));
const {chromium}=pw.default||pw;
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),OUT=path.join(ROOT,'tests','out');
fs.mkdirSync(OUT,{recursive:true});
const TYPES={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'};
export async function serve(){const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(ROOT,p);
    if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
    r.writeHead(200,{'Content-Type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
  await new Promise(r=>srv.listen(0,r));return{srv,BASE:`http://localhost:${srv.address().port}`}}
export async function launch(){const exe=['/opt/pw-browsers/chromium'].find(p=>fs.existsSync(p));return chromium.launch(exe?{executablePath:exe}:{})}
/* the demo with sample data, „today” = the 15th of this month at 12:00 (the demo data follow today's date), no tour / news / today window / cats;
   onErr gets every JavaScript error and console error */
export const MID=(d=>new Date(d.getFullYear(),d.getMonth(),15,12))(new Date());
export async function demoPage(browser,BASE,{role='Mati',w=390,onErr=()=>{}}={}){
  const ctx=await browser.newContext({viewport:{width:w,height:800},deviceScaleFactor:1,locale:'pl-PL',timezoneId:'Europe/Warsaw'});const p=await ctx.newPage();
  await p.clock.setFixedTime(MID);
  p.on('pageerror',e=>onErr('błąd JavaScript: '+e.message));
  p.on('console',m=>{if(m.type()=='error'&&!/Failed to load resource|net::|ERR_|CORS policy/.test(m.text()))onErr('błąd w konsoli: '+m.text())});
  await p.route('https://api.nbp.pl/**',r=>r.abort());
  await p.addInitScript(role=>{if(sessionStorage.getItem('robot'))return;sessionStorage.setItem('robot','1');localStorage.clear();
    localStorage.setItem('demo_people',JSON.stringify({me:role,role,partner:role=='Mati'?'Wercia':'Mati'}));const t=new Date().toISOString().slice(0,10);
    for(const[k,v] of [['mw_tour','1'],['mw_news','999'],['mw_today',t],['mw_eve',t],['mw_kotki','off'],['mw_oth',JSON.stringify({d:t,a:'aM aW aJ aG aS aP aI aK aO'.split(' ')})]])localStorage.setItem('demo_'+k,v)},role);
  await p.goto(BASE+'/demo/');
  await p.waitForFunction(()=>window.goTab&&window.S&&S.cfg&&document.querySelector('#app .kpis,#app .card'),null,{timeout:20000});
  await p.waitForTimeout(300);return{ctx,p}}
