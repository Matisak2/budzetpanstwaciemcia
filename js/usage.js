/* Budżet M&W – 📊 „Czego używamy”: a quiet counter of opened screens, used features and cards seen on the screen (≥ 2 s), per person.
   Only to Your own Firebase: households/main/usage/{YYYY-MM} → {c:{osoba:{klucz:liczba}}, d:{osoba:{klucz:'YYYY-MM-DD'}}} (increment, written in batches
   every ~2 minutes and when the app goes to the background). Not in the backup copy – it is a statistic, not your data. In the demo it stays in the guest's browser.
   Keys: e: = a screen, f: = a feature, k: = a card (its title). The view: ⚙️ → 📖 Pomoc → „📊 Czego używamy”. */
import {doc,collection,getDocs,increment} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {$,esc,td,dmy,addMonths,ls} from './util.js';
import {S,H,merge} from './core.js';

/* everything the counter knows – so that what nobody opens shows up as „nieużywane” too */
export const USAGE_CAT=[
  ['Ekrany',[['e:dash','📊 Budżet'],['e:tx','🧾 Rejestr'],['e:fix','📌 Stałe → Opłaty'],['e:pay','💼 Pensje'],['e:payy','💼 Pensje – widok roku (PIT)'],['e:year','📅 Roczne i terminy'],
    ['e:sav','🐷 Oszczędności – Razem'],['e:savp','🐷 Oszczędności – osoba / Wspólne'],['e:acc','👛 Konta – salda'],['e:owe','🔻 My winni'],['e:lent','🔺 Nam winni'],['e:recon','⚖️ Wyrównaj wszystkie salda'],
    ['e:inst','📈 Instrumenty konta'],['e:values','📈 Aktualizuj wartości'],['e:anam','📈 Analiza miesiąc – Podstawowa'],['e:anamf','📈 Analiza miesiąc – Pełna'],['e:anay','📈 Analiza rok'],
    ['e:close','🗓️ Zamknięcie miesiąca'],['e:proj','🏷️ Projekt'],['e:report','🖨️ Podsumowanie roku'],['e:help','📖 Przewodnik'],
    ['e:set','⚙️ Ustawienia'],['e:set-acc','⚙️ Konta'],['e:set-cat','⚙️ Kategorie i drobne'],['e:set-tel','⚙️ Ten telefon'],['e:set-bez','⚙️ Bezpieczeństwo'],['e:set-auto','⚙️ Automaty'],['e:set-pom','⚙️ Pomoc']]],
  ['Okienka i przyciski',[['f:today','🔔 Na dziś'],['f:find','🔍 Szukaj wszędzie'],['f:add','➕ Nowy wpis'],['f:edit','✎ Zmiana wpisu'],['f:next','⏩ Zapisz i dodaj kolejny'],['f:slip','💼 Pasek pensji'],
    ['f:fixtick','📌 Odhaczenie opłaty stałej'],['f:txmenu','✋ Przytrzymanie wpisu'],['f:swipe','👆 Zmiana miesiąca palcem'],['f:hide','🙈 Tryb dyskretny'],['f:link','🗣️ Siri / skrót / link z powiadomienia'],
    ['f:wrapped','🎁 Money Wrapped'],['f:csv','📤 Eksport CSV'],['f:backup','💾 Pobierz kopię'],['f:subs','📋 Przegląd subskrypcji'],['f:goal','🎯 Przydziel do celu'],['f:odloz','🐷 Odłóż'],['f:usage','📊 Czego używamy']]],
  ['Dodatki we wpisie (zapisane)',[['f:split','✂️ Podział paragonu'],['f:fx','🌍 Obca waluta'],['f:photo','📷 Zdjęcie paragonu'],['f:refund','↩️ Zwrot'],['f:ulga','🧾 Ulga w PIT'],['f:projtx','🏷️ Projekt we wpisie'],
    ['f:debt','🔻 Rata / spłata we wpisie'],['f:war','🛡️ Gwarancja'],['f:coin','🪙 Drobne'],['f:fuel','⛽ Tankowanie (litry, licznik)'],['f:notesug','✍️ Podpowiedź notatki']]],
  ['Karty (widoczne na ekranie co najmniej 2 s)',[...['Podsumowanie miesiąca','Nietypowo dużo','Na co poszły pieniądze','Rok temu','Przepływ pieniędzy','Mati ↔ Wercia','Największe pozycje','Co się zmieniło','Wydatki dzień po dniu',
    'Z jakich kont','Opłaty stałe a reszta','Gdzie wydajemy','Największe pojedyncze wydatki','Przychody i wydatki','Kategorie w całym roku','Kategorie przez 12 miesięcy','Miesiąc po miesiącu','Najciekawsze miesiące',
    'Plan a rzeczywistość','Majątek na kontach','Oszczędności i inwestycje','Wasza inflacja','Ile odłożyliście','Wszystkie cele','Poduszka bezpieczeństwa','Limity','Odsetki z kont','Wpłacone a wartość',
    'Niezależność finansowa (FIRE)','Kaskada nadwyżek','Czyj majątek'].map(t=>['k:'+t,t])]]];
const LABEL=Object.fromEntries(USAGE_CAT.flatMap(([,L])=>L));

/* ---------- counting ---------- */
let buf={},bufD={},timer=0,lastScreen='';
export function use(k){if(!k||!S.who)return;buf[k]=(buf[k]||0)+1;bufD[k]=td();if(!timer)timer=setTimeout(flushUsage,120000)}
export function flushUsage(){clearTimeout(timer);timer=0;const who=S.who,keys=Object.keys(buf);if(!who||!keys.length)return;
  const c={},d={};for(const k of keys){c[k]=increment(buf[k]);d[k]=bufD[k]}buf={};bufD={};
  merge(doc(collection(H,'usage'),td().slice(0,7)),{c:{[who]:c},d:{[who]:d}})}
/* the screen now shown (called after every render) – counted when it changes */
export function useScreen(){const t=S.tab;let k=t=='dash'?(S.close?'e:close':S.proj?'e:proj':'e:dash'):t=='tx'?'e:tx':t=='fix'?(S.fixSub=='pay'?(S.payView=='y'?'e:payy':'e:pay'):S.fixSub=='year'||S.fixSub=='rem'?'e:year':'e:fix')
    :t=='sav'?(S.values?'e:values':S.instAcc?'e:inst':S.sub=='all'?'e:sav':'e:savp'):t=='acc'?(S.recon?'e:recon':S.accView=='owe'?'e:owe':S.accView=='lent'?'e:lent':'e:acc')
    :t=='ana'?(S.report?'e:report':S.ana=='y'?'e:anay':ls.get('mw_anam')!='basic'?'e:anamf':'e:anam'):t=='set'?(S.help?'e:help':S.setPage?'e:set-'+S.setPage:'e:set'):'';
  if(S.help)k='e:help';if(k&&k!=lastScreen){lastScreen=k;use(k)}watchCards()}
/* a card = section.chart; its title without emoji, year, „: …” or „ – …” */
export const cardKey=t=>{t=(t||'').replace(/^[^\p{L}]+/u,'').split(/:| – /)[0].replace(/\s*\d{4}\s*$/,'').replace(/\./g,'').trim();return t.includes('↔')?'Mati ↔ Wercia':t};
let io=null;const seen=new WeakMap();
function watchCards(){if(!('IntersectionObserver' in window))return;if(!io)io=new window.IntersectionObserver(es=>{for(const e of es){const el=e.target;
    if(e.isIntersecting&&e.intersectionRatio>=0.5){if(!seen.has(el))seen.set(el,setTimeout(()=>{const k=cardKey(el.querySelector('.ct b')?.textContent);if(k)use('k:'+k);seen.set(el,-1)},2000))}
    else{const v=seen.get(el);if(v&&v!==-1){clearTimeout(v);seen.delete(el)}}}},{threshold:[0,0.5]});
  io.disconnect();document.querySelectorAll('#app section.chart').forEach(el=>io.observe(el))}
/* what a saved entry used (new / edit / extras) */
export function useTx(b,{old,parts,coin,next}){use(old?'f:edit':'f:add');if(next)use('f:next');if(parts)use('f:split');if(b.fxCur||b.amount2)use('f:fx');if(b.rcpt?.length&&!old?.rcpt?.length)use('f:photo');
  if(b.refundOf&&!old)use('f:refund');if(b.ulga)use('f:ulga');if(b.proj)use('f:projtx');if(b.debt)use('f:debt');if(b.war)use('f:war');if(coin)use('f:coin');if(b.lit||b.odo)use('f:fuel')}

/* ---------- 📊 the view: the last 3 months, the most used first; what nobody opened in 3 months apart ---------- */
export async function openUsage(){use('f:usage');flushUsage();const d=$('dlg');$('dlgBody').innerHTML='<h2>📊 Czego używamy</h2><p class="dtext">Liczę…</p>';d.hidden=false;
  let docs=[];try{docs=(await getDocs(collection(H,'usage'))).docs.map(x=>({id:x.id,...x.data()}))}catch(e){docs=[]}
  const from=addMonths(td().slice(0,7),-2),P=['Mati','Wercia'],cnt={},last={};let first=null;
  for(const x of docs){if(!first||x.id<first)first=x.id;for(const p of P){for(const[k,v]of Object.entries(x.d?.[p]||{}))if(!last[k]||v>last[k])last[k]=v;
    if(x.id>=from)for(const[k,v]of Object.entries(x.c?.[p]||{})){cnt[k]=cnt[k]||{Mati:0,Wercia:0};cnt[k][p]+=+v||0}}}
  const tot=k=>(cnt[k]?.Mati||0)+(cnt[k]?.Wercia||0),lab=k=>k.startsWith('k:')?k.slice(2)+' · karta':LABEL[k]||k;
  const used=Object.keys(cnt).filter(k=>tot(k)>0).sort((a,b)=>tot(b)-tot(a)),unused=USAGE_CAT.map(([g,L])=>[g,L.map(([k])=>k).filter(k=>!tot(k))]).filter(([,L])=>L.length);
  const row=k=>`<div class="r1 urow"><span>${esc(lab(k))}</span><span class="num"><b>${tot(k)}</b><small class="mini"> · Mati ${cnt[k].Mati} · Wercia ${cnt[k].Wercia}</small></span></div>`;
  $('dlgBody').innerHTML=`<h2>📊 Czego używamy</h2><p class="dtext">${first?`Liczę od ${first.slice(5)}.${first.slice(0,4)}. Poniżej ostatnie 3 miesiące. Po 2–3 miesiącach będzie widać, co warto uprościć albo usunąć.`:'Licznik dopiero zaczął – zajrzyjcie tu za kilka tygodni.'}</p>
    <div class="usage">${used.length?`<div class="h2">Najczęściej</div>${used.map(row).join('')}`:''}
    ${unused.length?`<div class="h2">Nieużywane od 3 miesięcy</div>${unused.map(([g,L])=>`<div class="mini" style="font-weight:800;margin-top:6px">${esc(g)}</div>${L.map(k=>`<div class="r1 urow off"><span>${esc(lab(k))}</span><small class="mini">${last[k]?'ostatnio '+dmy(last[k]):'jeszcze nigdy'}</small></div>`).join('')}`).join('')}`:''}</div>
    <div class="mini">Liczby zapisują się tylko w Waszym Firebase. Kopia danych ich nie zawiera.</div>
    <div class="g2" style="grid-template-columns:1fr"><button class="btn primary" id="usOk">Zamknij</button></div>`;
  $('usOk').onclick=()=>{d.hidden=true};d.onclick=e=>{if(e.target===d)d.hidden=true}}
/* event wiring – app.js calls it once at start */
export function wireUsage(){document.addEventListener('visibilitychange',()=>{if(document.visibilityState=='hidden')flushUsage()});window.addEventListener('pagehide',flushUsage)}
