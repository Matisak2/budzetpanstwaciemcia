/* Budżet M&W – 🔔 „Na dziś” and notifications. Part of the former js/app.js (split into modules, same code). */
import {doc,deleteDoc} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {scene} from './cats.js';
import {kotki} from './guide.js';
import {recurringP,automatStale,todayItems as todayItemsP,todayRank} from './today.js';
import {liveOf,seenBy,agg,planOf,avgActuals,yearSubs,fixedPlanGap} from './logic.js';
import {$,esc,ls,pg,td,zl0,plu,daysIn} from './util.js';
import {DEMO,S,toast,err,ask,H,PUSH,w,merge,liveById,guard} from './core.js';
import {openTx} from './sheet.js';
import {editFixed,goFixed,exportJson,editInt,planToFixed} from './actions.js';
import {openSlip} from './salary.js';
import {openClose} from './close.js';
import {fillAvg} from './debts.js';
import {openInst,editLimits,goYear,bookInt} from './savings.js';
import {render,goTab} from './app.js';

/* ---------- 🔔 real notifications (Web Push); the automat sends them, keys are made by the automat ---------- */
export const pushCan=()=>!DEMO&&'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
export const standalone=()=>navigator.standalone===true||matchMedia('(display-mode: standalone)').matches;
export const isIOS=()=>/iPhone|iPad|iPod/.test(navigator.userAgent);
export const b64u=s=>{const b=window.atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4));return Uint8Array.from(b,c=>c.charCodeAt(0))};
export const hashStr=s=>{let h=5381;for(const c of s)h=(h*33^c.charCodeAt(0))>>>0;return h.toString(36)};
export async function checkPush(){const id=ls.get('mw_push');S.pushOk=false;S.pushLost=false;if(!id||!pushCan())return;
  try{const reg=await navigator.serviceWorker.ready,sub=await reg.pushManager.getSubscription();S.pushOk=window.Notification.permission=='granted'&&!!sub;S.pushLost=!S.pushOk;
    if(S.pushOk&&S.cfg)merge(doc(PUSH(),id),{sub:sub.toJSON(),who:S.who,seen:td(),on:true})}catch(e){S.pushLost=true}
  if(S.cfg)render()}
export async function enablePush(){if(guard())return;
  if(!pushCan()||(isIOS()&&!standalone()))return ask({title:'Powiadomienia',text:isIOS()?'Na iPhonie powiadomienia działają, gdy aplikacja jest dodana do ekranu głównego (Safari → Udostępnij → „Do ekranu początkowego”) i otwierana z ikonki. Potrzebny jest iOS 16.4 lub nowszy.':'Ta przeglądarka nie obsługuje powiadomień.',ok:'OK',cancel:'Zamknij'});
  const pub=S.market?.vapid?.pub;if(!pub)return ask({title:'Jeszcze chwila',text:'Klucze powiadomień tworzy automat przy najbliższym uruchomieniu. Na GitHubie: Actions → „Powiadomienia” → Run workflow, a po minucie spróbuj ponownie.',ok:'OK',cancel:'Zamknij'});
  let perm=window.Notification.permission;if(perm!='granted')perm=await window.Notification.requestPermission();
  if(perm!='granted')return ask({title:'Brak zgody',text:'Telefon nie pozwolił na powiadomienia. Włączysz je w Ustawieniach telefonu → Powiadomienia → Budżet M&W.',ok:'OK',cancel:'Zamknij'});
  try{const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();
    if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(pub)});
    const j=sub.toJSON(),id='p'+hashStr(j.endpoint);merge(doc(PUSH(),id),{sub:j,who:S.who,ua:navigator.userAgent.slice(0,140),ts:Date.now(),seen:td(),on:true});
    ls.set('mw_push',id);S.pushOk=true;S.pushLost=false;render();
    reg.showNotification('Powiadomienia włączone ✓',{body:'Rano „Na dziś”, wieczorem przypomnienie o wpisaniu wydatków. 🐾',icon:'./icon-192.png',tag:'mw-test'});toast('Powiadomienia włączone ✓')}
  catch(e){err(e);toast('Nie udało się włączyć powiadomień ('+(e.message||e)+')','bad')}}
export async function disablePush(){const id=ls.get('mw_push');try{const reg=await navigator.serviceWorker.ready,sub=await reg.pushManager.getSubscription();if(sub)await sub.unsubscribe()}catch(e){}
  if(id)w(deleteDoc(doc(PUSH(),id)));ls.set('mw_push','');S.pushOk=false;S.pushLost=false;render();toast('Powiadomienia wyłączone – okienka „Na dziś” wracają do aplikacji')}
export async function shareDemo(){const url=new URL('./demo/',location.href).href;try{if(navigator.share){await navigator.share({title:'Budżet M&W – demo',text:'Zobacz, jak działa nasz domowy budżet 🐾',url});return}await navigator.clipboard.writeText(url);toast('Skopiowano link: '+url)}catch(e){if(e?.name!='AbortError')toast(url)}}
export const demoCardH=()=>`<div class="card"><h3>🧪 Wersja demonstracyjna</h3><div class="mini">Dane są przykładowe i zapisują się tylko w tej przeglądarce. Kursy walut są prawdziwe (z NBP), ceny akcji i funduszy – przykładowe (w prawdziwej aplikacji wszystko pobiera automat).</div><div class="btns"><button class="btn sm" onclick="MW_DEMO.rename()">✎ Imię drugiej osoby</button><button class="btn sm" onclick="MW_DEMO.reset()">↺ Zacznij od nowa</button></div></div>`;
export const pushCardH=()=>`<div class="card"><h3>🔔 Powiadomienia</h3><div class="mini">${S.pushOk?'✓ Włączone na tym telefonie: rano ok. 7:30 „Na dziś” (gdy coś czeka), o 20:00 przypomnienie, gdy dziś nic nie wpisano. Okienka „Na dziś” nie wyskakują już same – dzwonek 🔔 zostaje.':S.pushLost?'⚠️ Powiadomienia na tym telefonie przestały działać (wyłączone w ustawieniach telefonu albo cofnięta zgoda). Do czasu ponownego włączenia okienka „Na dziś” pokazują się w aplikacji.':'Prawdziwe powiadomienia na telefon, także gdy aplikacja jest zamknięta. Każde z Was włącza je na swoim telefonie.'}</div>
  <div class="btns" style="gap:6px">${S.pushOk?'<button class="btn sm" onclick="disablePush()">Wyłącz</button>':`<button class="btn sm primary" onclick="enablePush()">${S.pushLost?'Włącz ponownie':'Włącz powiadomienia'}</button>`}</div></div>`;
export const todayD=()=>({cfg:S.cfg,tx:liveOf(S.tx),slips:S.slips,hold:S.hold,debts:S.debts,market:S.market,backup:S.backup,hraw:S.hraw});
/* 🗓️ the closing of the month is personal – each phone shows only its own person's; the most urgent first (late → today → tomorrow → the rest), „Wkrótce” (later) at the end */
export function todayItems(){if(!S.cfg)return[];const L=[...todayItemsP(todayD(),{today:td(),hour:new Date().getHours()}),...planTodo()].filter(x=>seenBy(x.who,S.who)).map((x,i)=>({x,i,r:todayRank(x)}));
  return L.sort((a,b)=>(!!a.x.later-!!b.x.later)||a.r-b.r||a.i-b.i).map(y=>y.x)}
export const todayNow=()=>todayItems().filter(x=>!x.later);
/* 📊 the plan of the current month (only in the app – plans are not read by the automat, so no phone notification): it used to be banners and cats' warnings on Budżet */
export function planTodo(){const today=td(),ym=today.slice(0,7),tx=liveOf(S.tx),pl=planOf(S.cfg,S.plans,tx,ym),ig=S.hraw?.checkIgnore||{},out=[];
  const add=(key,icon,text,go,label)=>{if(!ig[key])out.push({key,icon,text,go,label,k:'plan',who:null,quiet:true})};
  const pexp=S.cfg.cats.filter(c=>c.type=='exp').reduce((a,c)=>a+c.subs.reduce((b,x)=>b+(pl[x.id]||0),0),0),left=pexp-agg(S.cfg,tx,ym).exp,dl=daysIn(ym)-(+today.slice(8))+1;
  if(pexp>0&&left<0)add('over:'+ym,'📊',`Plan wydatków na ten miesiąc przekroczony o ${zl0(-left)}.`,{a:'dash',bf:'over'},'Co przekroczone');
  else if(pexp>0&&left<pexp*.15)add('near:'+ym,'📊',`W budżecie zostało ${zl0(left)} na ${dl} ${plu(dl,'dzień','dni','dni')} – mniej niż 15% planu.`,{a:'dash'},'Budżet');
  const{avg}=avgActuals(S.cfg,tx,ym,3),YS=yearSubs(S.cfg),L=S.cfg.cats.filter(c=>!c.hidden).flatMap(c=>c.subs.filter(x=>!x.hidden&&!pl[x.id]&&avg[x.id]>0&&!YS.has(x.id)).map(x=>({c,x})));
  if(L.length){const tot=L.filter(y=>y.c.type=='exp').reduce((a,y)=>a+avg[y.x.id],0);add('toplan:'+ym,'📝',`Do zaplanowania: ${L.length} ${plu(L.length,'pozycja','pozycje','pozycji')} bez planu, które w ostatnich miesiącach miały wpisy${tot?` (wydatki średnio ${zl0(tot)}/mies.)`:''}.`,{a:'fillAvg'},'Wypełnij średnimi')}
  const G=fixedPlanGap(S.cfg,pl).filter(y=>!y.sub.hidden&&!y.sub.cat.hidden);
  if(G.length)add('gap:'+ym,'📌',`Plan niższy niż opłaty stałe: ${G.map(y=>`${y.sub.name} – plan ${zl0(y.plan)}, opłaty ${zl0(y.fix)}`).join(' · ')}.`,{a:'planFix'},'Podnieś plan');
  return out}
/* where a tap on an item (or on a notification) leads */
/* ---------- 🔔 „Na dziś”: everything that needs attention, only inside the app (no calendar, no card) ---------- */
export function runGo(g){if(!g||!S.cfg)return;closeToday();const a=g.a;
  if(a=='today')return showToday();if(a=='add')return openTx(null,{type:['exp','inc','tr'].includes(g.type)?g.type:'exp',...(g.amount?{amount:pg(g.amount)}:{}),...(g.note?{note:g.note}:{})});
  if(a=='pit'){S.fixSub='pay';S.payView='y';S.ym=(g.y||String(+td().slice(0,4)-1))+'-12';return goTab('fix')}if(a=='fixed')return goFixed();if(a=='slip')return openSlip(g.id,g.ym);
  if(a=='pay'){S.fixSub='pay';return goTab('fix')}if(a=='year')return goYear();if(a=='rem'){S.fixSub='year';return goTab('fix')}
  if(a=='lent'||a=='owe'){S.accView=a;return goTab('acc')}if(a=='rata')return openTx(null,{type:'exp',debt:g.id});if(a=='acc'){S.accView='acc';return goTab('acc')}if(a=='inst'){goTab('sav');return openInst(g.acc)}
  if(a=='tr')return openTx(null,{type:'tr',to:g.to,...(+g.amount>0?{amount:+g.amount}:{})});if(a=='sav'){S.sub='all';return goTab('sav')}if(a=='limits'){goTab('sav');return editLimits()}
  if(a=='backup')return exportJson();if(a=='automat')return window.open('https://github.com/Matisak2/budzetpanstwaciemcia/actions','_blank');
  if(a=='recFix')return addRecFixed(g.key);if(a=='fixEdit'){S.fixSub='fix';goTab('fix');return editFixed(g.id)}
  if(a=='close')return openClose();
  if(a=='dash'||a=='fillAvg'||a=='planFix'){S.ym=td().slice(0,7);if(g.bf)S.bf=g.bf;goTab('dash');if(a=='fillAvg')return fillAvg();if(a=='planFix')return planToFixed();return}
  if(a=='int')return bookInt(g.acc,g.key);if(a=='accInt')return editInt(g.id);
  if(a=='tx'){const t=liveById(g.id);if(t){S.ym=t.date.slice(0,7);openTx(g.id)}}}
export const goFromHash=h=>{const m=/go=([^&]+)(.*)/.exec(h||'');if(!m)return null;const g={a:decodeURIComponent(m[1])};new window.URLSearchParams(m[2].replace(/^&/,'')).forEach((v,k)=>g[k]=v);return g};
export function todayGo(i){runGo((S.todayL||[])[i]?.go)}
/* the second button of an item in „Na dziś” – by the kind of its key */
const GHOST={over:'Wiem',near:'Wiem',toplan:'Nie teraz',gap:'Wiem',rec:'Nie, dzięki',umowa:'Załatwione',rules:'Załatwione',yearpay:'Załatwione',najem:'✓ Zapłacone',pit:'✓ Złożone',pit28:'✓ Złożone',young:'Wiem',close:'Pomiń',short:'Wiem',int:'Pomiń',promo:'Wiem',pit38:'✓ Rozliczone'};
export function ignoreCheck(key,stay){if(guard())return;S.hraw={...S.hraw,checkIgnore:{...(S.hraw?.checkIgnore||{}),[key]:true}};merge(H,{checkIgnore:{[key]:true}});if(stay)render();else showToday();toast(GHOST[key.split(':')[0]]&&key.split(':')[0]!='rec'?'Gotowe ✓':'Ukryte – nie pokażę tego więcej')}
/* 📌 a payment that repeats every month – into 📌 Stałe with the form filled in */
export const recList=()=>S.cfg?recurringP(S.cfg,liveOf(S.tx),td(),S.hraw?.checkIgnore):[];
export function addRecFixed(key){const r=recList().find(x=>x.key==key);if(!r)return;S.fixSub='fix';goTab('fix');if(r.kind=='tr')return editFixed(null,'tr',{name:r.note?r.note.slice(0,1).toUpperCase()+r.note.slice(1):'Przelew '+r.name,amount:r.amount,day:r.day,acc:r.acc,to:r.to});editFixed(null,'exp',{name:r.name.slice(0,1).toUpperCase()+r.name.slice(1),amount:r.amount,day:r.day,sub:r.sub,acc:r.acc})}
export function closeToday(){$('dlg').hidden=true}
export function showToday(){const L=todayItems(),d=$('dlg'),now=L.filter(x=>!x.later),soon=L.length-now.length,bad=now.some(x=>x.k=='bad');ls.set('mw_today',td());S.todayL=L;
  const row=(x,i)=>`<div class="titem ${x.k}"><span class="ti">${x.icon}</span><span class="tt">${esc(x.text)}${x.k=='check'?'<small>🧹 strażnik porządku</small>':''}</span><span class="tb"><button class="chip" onclick="todayGo(${i})">${esc(x.label)}</button>${x.key?`<button class="chip ghost" onclick="ignoreCheck('${esc(x.key)}')">${GHOST[x.key.split(':')[0]]||GHOST[x.k]||'To nie błąd'}</button>`:''}</span></div>`;
  $('dlgBody').innerHTML=`<div class="cslide">${kotki.mode=='off'?'':scene(now.length?'duo':'sleep','kot')}<h2>🔔 Na dziś</h2><p class="dtext">${now.length?(bad?'Coś czeka po terminie – zajrzyjmy razem.':'Kilka rzeczy na dziś. Spokojnie, po kolei.'):soon?'Na dziś nic pilnego. Niżej to, co będzie za kilka dni 😺':'Na dziś nic. Można się zdrzemnąć 😺'}</p></div>
    ${now.length?`<div class="today">${now.map(row).join('')}</div>`:''}
    ${soon?`<details class="tsoon"${now.length?'':' open'}><summary>⏳ Wkrótce (${soon})</summary><div class="today">${L.slice(now.length).map((x,j)=>row(x,now.length+j)).join('')}</div></details>`:''}
    <div class="g2" style="grid-template-columns:1fr"><button class="btn primary" id="tdOk">Zamknij</button></div>`;
  d.hidden=false;$('tdOk').onclick=closeToday;d.onclick=e=>{if(e.target===d)closeToday()};updToday()}
export function updToday(){const n=todayNow().length,b=$('todayBtn');if(!b)return;b.dataset.n=n||'';b.setAttribute('aria-label',n?`Na dziś: ${n}`:'Na dziś')}
/* the first time the app is opened on a given day, if anything is waiting */
export async function maybeToday(){await S.pushReady;if(ls.get('mw_today')==td()||!$('dlg').hidden||!$('sheet').hidden)return;if(S.pushOk&&!automatStale(S.market,td())){ls.set('mw_today',td());return}if(todayNow().length)showToday();else ls.set('mw_today',td())}
/* event wiring of this part – app.js calls it once at start (it used to run while app.js was loading) */
export function wireToday(){
/* while the app stays open: at 20:00 a gentle nudge when nothing was entered today */
window.setInterval(()=>{if(!S.cfg)return;updToday();const today=td();if(!(S.pushOk&&!automatStale(S.market,today))&&new Date().getHours()>=20&&ls.get('mw_eve')!=today&&!liveOf(S.tx).some(t=>t.date==today&&!t.fixedId)){ls.set('mw_eve',today);toast((kotki.mode=='off'?'':'🐱 ')+'Już 20:00 – wpiszesz dzisiejsze wydatki?','',{label:'Wpisz',fn:()=>openTx()})}},60000);
}