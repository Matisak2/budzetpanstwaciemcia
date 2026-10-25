/* Budżet M&W – the transaction sheet: amount, position picker, split receipt, photos, currencies, saving. Part of the former js/app.js (split into modules, same code). */
import {doc,collection,setDoc,deleteDoc,getDoc,increment} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {catIcon} from './art.js';
import {isTreat,kotki,treatJoke} from './guide.js';
import {CURS,catHue,pastel} from './data.js';
import {addM,position} from './inv.js';
import {ULGI,savedP,saveSplitP} from './today.js';
import {cleanCat,liveOf,roundUp,subsMap} from './logic.js';
import {$,esc,f2,isDate,ls,pg,pnum,rid,td,zl,money,curSym,addDays} from './util.js';
import {S,toast,ask,accCur,am,fxRate,stripFx,accOwner,accOpts,H,DEBTS,w,merge,putTx,liveById,guard} from './core.js';
import {exportJson,downloadBlob} from './actions.js';
import {incById,openSlip} from './salary.js';
import {dIcon,debtList,debtState,setDebtLeft,fillDebt,updDebtHint,updDebt,fillProj,updProj} from './debts.js';
import {accN,render} from './app.js';

/* ---------- transaction sheet ---------- */
export const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ł/g,'l').trim();
export const plu=(n,a,b,c)=>n==1?a:(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20))?b:c;
export const catColor=c=>pastel(catHue(c,S.cfg.cats.indexOf(c)));
/* amount field adds up a receipt: "12+8,50-3" → grosze */
export const calcAmt=v=>(String(v||'').replace(/\s/g,'').replace(/−/g,'-').match(/[+-]?[^+-]+/g)||[]).reduce((a,p)=>a+pg(p),0);
/* refunds are income booked on the expense's own position, so they lower that expense instead of adding income */
export const refundsOf=id=>liveOf(S.tx).filter(x=>x.refundOf===id);
/* the picker offers positions of this kind; a refund keeps its expense position */
export const pickKind=()=>S.etype=='inc'&&!S.refEdit?'inc':'exp';

export function setType(t){S.etype=t;$('mt').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v==t));
  if(S.cfg){updCoin();updFx();updDebt();updProj();updX();updSave();renderPh()}
  $('msWrap').hidden=t=='tr';$('mtoWrap').hidden=t!='tr';$('mwWrap').hidden=t=='tr';$('mcLab').textContent=t=='tr'?'Z konta':'Konto';
  const s=S.cfg&&subsMap(S.cfg)[$('ms').value];if(s&&s.cat.type!=pickKind())setMs('');
  if(t=='tr'&&SP.length){SP=[];renderSplit()}updSplit()}
/* 🪙 drobne: the rule of the chosen account, the rounding of this amount, on/off for this one expense (on by default) */
export const ruleOf=acc=>(S.cfg.round||[]).find(r=>r.from==acc&&S.cfg.accs.some(a=>a.id==r.to)&&accCur(r.from)==accCur(r.to));
/* 🛡️ warranty (asked from 300 zł) and 🧾 tax relief in the sheet */
export function updX(){if(!S.cfg)return;const exp=S.etype=='exp'&&!S.refEdit,amt=calcAmt($('ma').value);
  $('mwarWrap').hidden=!(exp&&(amt>=30000||$('mwar').value));$('mward').hidden=$('mwar').value!='date';
  $('mwarPh').hidden=!$('mwar').value||PH.some(p=>!p.removed);
  $('mulgaWrap').hidden=!(exp&&(S.ulgaOpen||$('mulga').value));$('mulgaBtn').hidden=!exp||!$('mulgaWrap').hidden;
  const u=ULGI[$('mulga').value];$('mulgaHint').textContent=u?u.d:'';$('mulgaHint').hidden=!u}
export function updCoin(){const b=$('rnd'),r=S.etype=='exp'&&!S.edit&&ruleOf($('mc').value),d=$('md').value,amt=calcAmt($('ma').value);
  const v=r&&amt>0&&(!r.since||d>=r.since)?roundUp(amt,r):0;S.coin=v?{r,v}:null;b.hidden=!v;if(!v)return;
  b.setAttribute('aria-pressed',S.coinOn);b.innerHTML=`<span class="cn">🪙</span><span class="ct"><b>Drobne +${am(v,r.from)}</b><small>→ ${esc(accN(r.to))}${S.coinOn?'':' · nie odłożę'}</small></span><span class="ck">${S.coinOn?'✓':''}</span>`}
/* 🌍 currencies in the sheet: label of the amount, the second amount of an exchange, a card payment abroad */
export function updFx(){if(!S.cfg)return;const t=S.etype,cA=accCur($('mc').value),cB=accCur($('mto').value),two=t=='tr'&&cA!=cB;
  $('maLab').textContent=`Kwota (${curSym(cA)})`;$('fxTr').hidden=!two;
  if(two){$('ma2Lab').textContent=`Wpłynie na konto docelowe (${curSym(cB)})`;const a=calcAmt($('ma').value),b=calcAmt($('ma2').value);
    $('fxRate').textContent=a>0&&b>0?`💱 ${fxRate(cA,a,cB,b)} – dopiszę do notatki`:'Wpisz obie kwoty z banku – kurs policzę sam.'}
  const card=t!='tr'&&cA=='PLN'&&!S.refEdit;$('fxBtn').hidden=!card||S.fxOpen;$('fxCard').hidden=!card||!S.fxOpen;
  if(card&&S.fxOpen){const a=calcAmt($('ma').value),b=calcAmt($('fxa').value);
    $('fxCardRate').textContent=a>0&&b>0?`💱 ${fxRate($('fxc').value,b,'PLN',a)} – dopiszę do notatki`:'„Kwota (zł)” to tyle, ile pobrał bank. Wpisz też kwotę w walucie – kurs policzę sam.'}}
/* 💰 a transfer into / out of an account that collects money for paying off liabilities: how much of it is for which one */
export let SV={mode:'',ids:'',auto:''};
export const saveDebtsOf=acc=>{const tx=liveOf(S.tx).filter(t=>t.id!==S.edit),own=(S.edit&&liveById(S.edit)?.save)||{};
  return acc?debtList('owe').filter(d=>d.saveAcc==acc).map(d=>({d,saved:savedP(d.id,tx),left:debtState(d).left})).filter(x=>x.left>0||x.saved>0||own[x.d.id]):[]};
export function updSave(){if(!S.cfg)return;const tr=S.etype=='tr',to=tr?saveDebtsOf($('mto').value):[],from=tr&&!to.length?saveDebtsOf($('mc').value):[],L=to.length?to:from,mode=to.length?'in':from.length?'out':'';
  $('msaveWrap').hidden=!mode;if(!mode){SV={mode:'',ids:'',auto:SV.auto};return}
  const ids=mode+L.map(x=>x.d.id).join();
  if(ids!=SV.ids){const prev={};$('msaveRows').querySelectorAll('input').forEach(i=>prev[i.dataset.sv]=i.value);
    if(!SV.auto&&mode=='in'&&L.length==1)SV.auto=L[0].d.id;
    $('msaveRows').innerHTML=L.map(x=>`<label class="svrow"><span>${esc(dIcon(x.d)+' '+x.d.name)}<small>odłożone ${zl(x.saved)}${x.left?' z '+zl(x.left):''}</small></span><input inputmode="decimal" placeholder="0,00" autocomplete="off" data-sv="${x.d.id}" value="${esc(prev[x.d.id]||'')}" aria-label="Kwota dla: ${esc(x.d.name)}"></label>`).join('');
    $('msaveRows').querySelectorAll('input').forEach(i=>i.oninput=()=>{if(i.dataset.sv==SV.auto)SV.auto='x';updSaveHint()});SV.ids=ids;SV.mode=mode;SV.L=L}
  const a=$('msaveRows').querySelector(`input[data-sv="${SV.auto}"]`);if(a){const v=calcAmt($('ma').value);a.value=v>0?f2(v):''}
  $('msaveLab').textContent=mode=='in'?'💰 Odkładasz na spłatę? Ile z tej wpłaty na którą pożyczkę:':'💰 Zabierasz z odłożonych na spłatę? Wpisz, z której pożyczki:';updSaveHint()}
export function updSaveHint(){if(!SV.mode)return;const amt=calcAmt($('ma').value),sum=[...$('msaveRows').querySelectorAll('input')].reduce((a,i)=>a+Math.max(0,calcAmt(i.value)),0),acc=SV.mode=='in'?$('mto').value:$('mc').value;
  const tx=liveOf(S.tx).filter(t=>t.id!==S.edit),s=saveSplitP(S.cfg,tx,S.debts,acc,td());
  $('msaveHint').textContent=SV.mode=='in'?(sum>amt?`Wpisano ${zl(sum)} – więcej niż cała wpłata.`:amt>sum?`Reszta (${zl(amt-sum)}) zostaje wolna na koncie.`:'Cała wpłata idzie na spłatę.')
    :`Zostaw puste, jeśli bierzesz wolne pieniądze (wolne teraz: ${zl(Math.max(0,s.free))}).`}
export function autoWho(){const a=S.cfg.accs.find(x=>x.id==$('mc').value),o=a&&accOwner(a);if(o=='Mati'||o=='Wercia')$('mw').value=o}

/* position picker: search, recently used, the note's usual position, category tiles */
export const P={kind:'exp',cat:null,cb:null,cur:''};
export function openPick(cur,cb){P.kind=pickKind();P.cb=cb;P.cur=cur||'';P.cat=null;$('pq').value='';renderPick();$('pick').hidden=false;$('pkBody').scrollTop=0}
export const closePick=()=>{$('pick').hidden=true;P.cb=null};
export function recentSubs(kind,n){const sm=subsMap(S.cfg),seen=new Map();
  liveOf(S.tx).filter(t=>sm[t.sub]&&sm[t.sub].cat.type==kind&&(t.type=='exp'||t.type=='inc')&&!t.fixedId&&!t.refundOf).sort((a,b)=>(b.ts||0)-(a.ts||0)).slice(0,80)
    .forEach((t,i)=>{const x=seen.get(t.sub)||{n:0,i};x.n++;seen.set(t.sub,x)});
  return[...seen].sort((a,b)=>b[1].n-a[1].n||a[1].i-b[1].i).slice(0,n).map(([id])=>sm[id])}
/* the position usually chosen with this note: the same note first, then the same first word */
export /* ✍️ note suggestions: notes used in the last year for this kind of entry, most used first – one tap fills the note
   (the same shop name every time also makes „🏪 Gdzie wydajemy” more exact) */
function noteSugs(q,kind){const k=norm(q),since=addDays(td(),-365),G={};
  for(const t of liveOf(S.tx)){if(t.type!=kind||t.date<since||t.fixedId||t.roundOf||t.slip||t.slipOf||t.ppk)continue;const raw=stripFx(t.note).trim();if(raw.length<2||/^[🪙↩]/u.test(raw))continue;
    const n=norm(raw),g=G[n]||(G[n]={c:0,last:'',names:{}});g.c++;if(t.date>g.last)g.last=t.date;g.names[raw]=(g.names[raw]||0)+1}
  return Object.entries(G).filter(([n])=>n!=k&&(!k||n.startsWith(k)||n.split(/\s+/).some(w=>w.startsWith(k))))
    .sort((a,b)=>b[1].c-a[1].c||b[1].last.localeCompare(a[1].last)).slice(0,4).map(([,g])=>Object.entries(g.names).sort((a,b)=>b[1]-a[1])[0][0])}
function renderNoteSug(){const box=$('mnSug');if(!box)return;const on=document.activeElement===$('mn')&&S.etype!='tr'&&!S.refEdit,L=on?noteSugs($('mn').value,S.etype):[];
  box.hidden=!L.length;box.innerHTML=L.map(n=>`<button type="button" class="chip" data-note="${esc(n)}">${esc(n)}</button>`).join('')}
function noteSub(note,kind){const k=norm(note);if(k.length<2)return null;const w=k.split(/\s+/)[0],sm=subsMap(S.cfg),ex={},fw={};
  for(const t of liveOf(S.tx)){if(!t.note||!sm[t.sub]||sm[t.sub].cat.type!=kind||t.refundOf)continue;const n=norm(t.note);
    if(n==k)ex[t.sub]=(ex[t.sub]||0)+1;else if(w.length>=3&&n.split(/\s+/)[0]==w)fw[t.sub]=(fw[t.sub]||0)+1}
  for(const m of[ex,fw]){const e=Object.entries(m).sort((a,b)=>b[1]-a[1]),tot=e.reduce((a,x)=>a+x[1],0);if(e.length&&e[0][1]/tot>=.6)return sm[e[0][0]]}
  return null}
export function paintPick(btn,sid){const s=sid&&subsMap(S.cfg)[sid];btn.className='pickbtn'+(s?' on':'');btn.style.cssText=s?catColor(s.cat):'';
  btn.innerHTML=s?`<span class="cico">${catIcon(s.cat)}</span><span class="pt"><small>${esc(cleanCat(s.cat.name))}</small><b>${esc(s.name)}</b></span>`:`<span class="ph">${btn.dataset.i!=null?'wybierz pozycję':'— stuknij, żeby wybrać pozycję —'}</span>`}
export function setMs(sid,hint){$('ms').value=sid||'';paintPick($('msBtn'),sid);$('msHint').textContent=hint||'';updSplit();updProj()}
export function renderPick(){const q=norm($('pq').value),kind=P.kind,cats=S.cfg.cats.filter(c=>c.type==kind),sm=subsMap(S.cfg);
  const chip=(s,cls='')=>`<button type="button" class="pchip ${cls}" style="${catColor(s.cat)}" data-sid="${s.id}"><span>${esc(s.name)}</span></button>`;
  const row=s=>`<button type="button" class="prow" style="${catColor(s.cat)}" data-sid="${s.id}"${s.id==P.cur?' aria-current="true"':''}><i></i><span><b>${esc(s.name)}</b><small>${catIcon(s.cat)} ${esc(cleanCat(s.cat.name))}</small></span></button>`;
  let h='';
  if(q){const ws=q.split(/\s+/),res=cats.flatMap(c=>c.subs.map(s=>sm[s.id])).filter(s=>{const hay=norm(s.name+' '+cleanCat(s.cat.name));return ws.every(w=>hay.includes(w))});
    h=res.length?`<div class="list">${res.slice(0,40).map(row).join('')}</div>`:'<div class="empty" style="padding:20px">Nic nie znaleziono.<br>Spróbuj innych liter albo wybierz kategorię.</div>'}
  else if(P.cat){const c=S.cfg.cats.find(x=>x.id==P.cat);
    h=`<button type="button" class="btn sm pback" data-back="1">‹ Wszystkie kategorie</button><div class="pkh">${catIcon(c)} ${esc(cleanCat(c.name))}</div><div class="list">${c.subs.map(s=>row(sm[s.id])).join('')||'<div class="prow mini">Ta kategoria nie ma jeszcze pozycji – dodasz je w ⚙️.</div>'}</div>`}
  else{const note=$('mn').value.trim(),sug=noteSub(note,kind),rec=recentSubs(kind,8).filter(s=>!sug||s.id!=sug.id);
    if(sug)h+=`<div class="pkh">💡 Zwykle przy „${esc(note)}”</div><div class="chips">${chip(sug,'sug')}</div>`;
    if(rec.length)h+=`<div class="pkh">Ostatnio używane</div><div class="chips">${rec.map(s=>chip(s)).join('')}</div>`;
    h+=`<div class="pkh">Kategorie</div><div class="tiles">${cats.map(c=>`<button type="button" class="ptile" style="${catColor(c)}" data-cat="${c.id}"><span class="cico">${catIcon(c)}</span><span>${esc(cleanCat(c.name))}</span></button>`).join('')}</div>`}
  $('pkBody').innerHTML=h}

/* receipt split: extra rows with their own position and amount; the main position gets the rest */
export let SP=[];
export const splitLeft=()=>calcAmt($('ma').value)-SP.reduce((a,x)=>a+Math.max(0,calcAmt(x.amt)),0);
export function updSplit(){const on=SP.length>0;$('splitWrap').hidden=!on;$('splitBtn').hidden=on||!!S.edit||S.etype=='tr';
  if(on){const left=splitLeft(),amt=calcAmt($('ma').value),parts=SP.some(x=>calcAmt(x.amt)>0);$('msHint').textContent=amt?`na tę pozycję zostaje ${zl(left)}`:'wpisz u góry kwotę całego paragonu';$('msHint').style.color=amt&&parts&&left<=0?'var(--exp)':''}else $('msHint').style.color=''}
export function renderSplit(){$('splitRows').innerHTML=SP.map((x,i)=>`<div class="srow"><button type="button" class="pickbtn" data-i="${i}"></button><input inputmode="decimal" placeholder="0,00" value="${esc(x.amt)}" data-i="${i}" aria-label="Kwota tej pozycji" autocomplete="off"><button type="button" class="x" data-x="${i}" aria-label="Usuń tę pozycję">×</button></div>`).join('');
  $('splitRows').querySelectorAll('.pickbtn').forEach(b=>paintPick(b,SP[+b.dataset.i].sub));
  if(!SP.length&&!$('ms').value)$('msHint').textContent='';updSplit()}

/* 📷 receipt photos: shrunk on the phone to a JPEG of at most ~150 KB, one document each in households/main/receipts
   (never listened to as a whole – a photo is read only when its entry is opened); the entry keeps the ids in rcpt[];
   meta/receipts counts photos and bytes for ⚙️. A deleted entry keeps its photos, so „Przywróć” brings them back too. */
export const RCPT=()=>collection(H,'receipts'),RMETA=()=>doc(H,'meta','receipts'),PH_MAX=3,PH_BYTES=180000;
export const kb=b=>b>=1e6?(b/1e6).toFixed(1).replace('.',',')+' MB':Math.max(1,Math.round(b/1000))+' KB';
export let PH=[];export const phCache=new Map();
export async function shrinkPhoto(file){const url=URL.createObjectURL(file);
  try{const img=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=url});let max=1800,q=.72,out='',c;
    for(let k=0;k<8;k++){const sc=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.naturalWidth*sc));c.height=Math.max(1,Math.round(img.naturalHeight*sc));
      const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(img,0,0,c.width,c.height);out=c.toDataURL('image/jpeg',q);
      if(out.length*.75<=PH_BYTES)break;if(q>.5)q-=.1;else max=Math.round(max*.8)}
    return{data:out,size:Math.round(out.length*.75),w:c.width,h:c.height}}finally{URL.revokeObjectURL(url)}}
export async function phLoad(id){if(phCache.has(id))return phCache.get(id);try{const s=await getDoc(doc(RCPT(),id)),d=s.exists()?s.data():null;if(d)phCache.set(id,d);return d}catch(e){return null}}
export function renderPh(){if(!$('mph'))return;if($('mwarPh'))$('mwarPh').hidden=!$('mwar').value||PH.some(p=>!p.removed);const tr=S.etype=='tr',L=tr?[]:PH.filter(p=>!p.removed);$('mphWrap').hidden=!L.length;$('mphBtn').hidden=tr||L.length>=PH_MAX;$('mphBtn').textContent=L.length?'📷 Kolejne zdjęcie':'📷 Zdjęcie paragonu';
  $('mph').innerHTML=L.map(p=>`<span class="ph"><button type="button" class="phi" data-ph="${p.id}" aria-label="Pokaż zdjęcie">${p.data?`<img src="${p.data}" alt="">`:`<span class="mini">${p.missing?'brak':'…'}</span>`}</button><button type="button" class="x" data-phx="${p.id}" aria-label="Usuń zdjęcie">×</button></span>`).join('');
  const nw=L.filter(p=>p.isNew).reduce((a,p)=>a+p.size,0);$('mphHint').textContent=nw?`zapiszę razem z wpisem (${kb(nw)})`:'stuknij zdjęcie, żeby je powiększyć';
  L.filter(p=>!p.data&&!p.loading&&!p.missing).forEach(p=>{p.loading=true;phLoad(p.id).then(d=>{p.loading=false;if(d){p.data=d.data;p.size=d.size||0}else p.missing=true;renderPh()})})}
export const phMeterH=()=>{const n=Math.max(0,S.rcptMeta?.n||0),b=Math.max(0,S.rcptMeta?.bytes||0);if(!n)return'';
  return`<div class="phm"><div class="r1"><b>📷 Zdjęcia paragonów</b><span class="mini">${n} ${plu(n,'zdjęcie','zdjęcia','zdjęć')} · ${kb(b)} z 1 GB</span></div><div class="bar"><i style="width:${Math.max(1,Math.min(100,b/1e7)).toFixed(1)}%;background:#86efac"></i></div>
    <div class="mini">Darmowe miejsce w Firebase to 1 GB – starczy na kilka tysięcy zdjęć. Comiesięczny mail z kopią nie zawiera zdjęć (byłby za duży).</div><button class="btn sm" onclick="exportJson(true)">📷 Pobierz kopię ze zdjęciami</button></div>`};
export function openPhoto(data){$('phvImg').src=data;$('phv').hidden=false}
export async function savePhoto(){const src=$('phvImg').src;if(!src)return;const blob=await (await fetch(src)).blob(),name='paragon-'+td()+'.jpg',file=typeof File=='function'?new File([blob],name,{type:'image/jpeg'}):null;
  if(file&&navigator.canShare&&navigator.canShare({files:[file]})&&matchMedia('(pointer:coarse)').matches){try{await navigator.share({files:[file]})}catch(e){}}else downloadBlob(blob,name)}
/* writes the photo changes of an entry (new ones, removed ones) and updates the counter */
export function phCommit(txId,ym,keep,del){const nw=keep.filter(p=>p.isNew);if(!nw.length&&!del.length)return;
  nw.forEach(p=>{phCache.set(p.id,{data:p.data,size:p.size});w(setDoc(doc(RCPT(),p.id),{tx:txId,ym,data:p.data,size:p.size,w:p.w,h:p.h,at:Date.now(),by:S.who}))});
  del.forEach(p=>{phCache.delete(p.id);w(deleteDoc(doc(RCPT(),p.id)))});
  const db=nw.reduce((a,p)=>a+p.size,0)-del.reduce((a,p)=>a+(p.size||0),0);merge(RMETA(),{bytes:increment(db),n:increment(nw.length-del.length)})}
export function openTx(id,pre){if(guard())return;
  const t=id?liveById(id):null;
  if(t&&(t.type=='lend'||t.lendOf||t.debtIn)){ask({title:t.note,text:`${accN(t.acc)}: ${am(t.amount,t.acc)} (${t.date.split('-').reverse().join('.')})\nTen wpis należy do ${t.debtIn?'zobowiązania':'należności'} w 👛 Konta.`,ok:'Pokaż',cancel:'Zamknij',alt:'Usuń wpis'}).then(r=>{if(r=='alt')delTx(id);else if(r){S.tab='acc';S.accView=t.debtIn?'owe':'lent';render()}});return}
  if(t&&t.payoff){const d=S.debts[t.debt],it=liveOf(S.tx).find(x=>x.payOf===t.id);ask({title:t.note,text:`${accN(t.acc)}: ${am(t.amount,t.acc)} (${t.date.split('-').reverse().join('.')})${it?`\n💸 odsetki i opłaty: ${am(it.amount,it.acc)} – są w Budżecie`:''}\nSpłata ${d?'„'+d.name+'” ':''}nie liczy się w Budżecie. Usunięcie przywróci dług${it?' i usunie odsetki':''}.`,ok:'Pokaż',cancel:'Zamknij',alt:'Usuń wpis'}).then(r=>{if(r=='alt')delTx(id);else if(r){S.tab='acc';S.accView='owe';render()}});return}
  const sp=t&&(t.slip?t:t.slipOf?liveById(t.slipOf):null);
  if(sp&&sp.slip&&incById(sp.slip)){ask({title:'Wpis z paska pensji',text:`${sp.note} – ${sp.date.split('-').reverse().join('.')}\nTen wpis powstał z paska. Zmień go w pasku, a wszystko przeliczy się samo.`,ok:'Otwórz pasek',cancel:'Zamknij',alt:'Usuń wpis'}).then(r=>{if(r=='alt')delTx(id);else if(r)openSlip(sp.slip,sp.date.slice(0,7))});return}
  if(t&&t.type=='adj'){ask({title:'Wyrównanie salda',text:`${accN(t.acc)}: ${t.amount>0?'+':''}${zl(t.amount)} (${t.date})\nUsunąć to wyrównanie?`,ok:'Usuń',danger:true}).then(r=>{if(r)delTx(id)});return}
  if(t&&t.ppk){ask({title:t.note,text:`${accN(t.acc)}: ${zl(t.amount)} (${t.date.split('-').reverse().join('.')})\nTa wpłata jest powiązana z pensją. Żeby ją zmienić, odznacz i odhacz pensję ponownie w 📌 Stałe.`,ok:'Usuń wpłatę',cancel:'Zamknij',danger:true}).then(r=>{if(r)delTx(id)});return}
  if(t&&(t.type=='inv'||t.type=='invs')){ask({title:t.type=='inv'?'Zakup inwestycji':'Sprzedaż inwestycji',text:`${t.note} – ${zl(t.amount)}\nTen starszy wpis usuniesz w zakładce Oszczędności.`,ok:'Przejdź',cancel:'Zamknij'}).then(r=>{if(r){S.tab='sav';render()}});return}
  S.edit=t?id:null;S.refEdit=!!t?.refundOf;S.debtOpen=S.projOpen=false;S.autoSub=false;SP=[];
  const ao=accOpts().map(g=>`<optgroup label="${esc(g.group)}">${g.items.map(a=>`<option value="${a[0]}">${esc(a[1])}</option>`).join('')}</optgroup>`).join('');$('mc').innerHTML=ao;$('mto').innerHTML=ao;
  PH=(t?.rcpt||[]).map(id=>({id}));$('ms').value='';setType(t?t.type:(pre?.type||'exp'));
  $('mw').value=(t&&t.who)||S.who;
  $('ma').value=t?f2(t.amount):'';$('maSum').textContent='';
  $('md').value=t?t.date:(td().startsWith(S.ym)?td():S.ym+'-01');
  if(t){$('mc').value=t.acc;$('mto').value=t.to||''}else{const last=ls.get('mw_acc_'+S.who),own=S.cfg.accs.find(a=>a.grp=='cur'&&!a.archived&&a.owner==S.who);
    if(last&&S.cfg.accs.some(a=>a.id==last&&!a.archived))$('mc').value=last;else if(own)$('mc').value=own.id}
  if(pre?.from){$('mc').value=pre.from;const c=S.cfg.accs.find(a=>a.grp=='cur'&&!a.archived);if(c)$('mto').value=c.id}
  if(pre?.to)$('mto').value=pre.to;if(pre?.acc&&S.cfg.accs.some(a=>a.id==pre.acc))$('mc').value=pre.acc;
  if(pre?.amount)$('ma').value=f2(pre.amount);
  if($('mto').value==$('mc').value){const o=[...$('mto').options].find(o=>o.value!=$('mc').value);if(o){if(pre?.to)$('mc').value=o.value;else $('mto').value=o.value}}
  if(!t)autoWho();
  $('mn').value=t?stripFx(t.note):(pre?.note||'');if(!t&&pre?.note&&!pre.sub)setTimeout(()=>$('mn').dispatchEvent(new window.Event('input')),0);
  $('mwar').value=t?.war?'date':'';$('mward').value=t?.war||'';$('mulga').value=t?.ulga||'';S.ulgaOpen=!!t?.ulga;updX();
  {const f=x=>new Date(x).toLocaleString('pl-PL',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
   $('shWho').textContent=t&&(t.by||t.eby)?[t.by?`➕ ${t.by=='Wercia'?'dodała':'dodał'} ${t.by}${t.ts?' · '+f(t.ts):''}`:'',t.eby?`✏️ ${t.eby=='Wercia'?'zmieniła':'zmienił'} ${t.eby}${t.eAt?' · '+f(t.eAt):''}`:''].filter(Boolean).join('   '):'';$('shWho').hidden=!$('shWho').textContent}
  setMs(t?t.sub:pre?.sub||(pre?.debt&&S.debts[pre.debt]?.sub)||'');renderSplit();fillDebt(t?.debt||pre?.debt||'');updDebtHint(!t&&!pre?.amount);fillProj(t?.proj||pre?.proj||'');$('mlit').value=t?.lit?String(t.lit).replace('.',','):'';$('modo').value=t?.odo||'';S.coinOn=true;updCoin();
  if(!$('fxc').options.length)$('fxc').innerHTML=CURS.map(([c,n])=>`<option value="${c}">${c} – ${esc(n)}</option>`).join('');
  $('ma2').value=t?.amount2?f2(t.amount2):'';S.fxOpen=!!t?.fxCur;$('fxc').value=t?.fxCur||'EUR';$('fxa').value=t?.fxAmt?f2(t.fxAmt):'';updFx();
  SV={mode:'',ids:'',auto:t?'x':pre?.saveFor||''};$('msaveRows').innerHTML='';updSave();if(t?.save)$('msaveRows').querySelectorAll('input').forEach(i=>{const v=+t.save[i.dataset.sv]||0;if(v)i.value=f2(Math.abs(v))});updSaveHint();
  const left=t&&t.type=='exp'?t.amount-refundsOf(t.id).reduce((a,x)=>a+x.amount,0):0;
  $('shRef').hidden=!(left>0);
  $('shTitle').textContent=t?(t.refundOf?'Edytuj zwrot':'Edytuj transakcję'):pre?.from?'Wypłata na konto bieżące':pre?.type=='tr'?'Wpłata':'Nowa transakcja';$('shDel').hidden=!t;$('shNext').hidden=!!t;
  $('sheet').hidden=false;if(!t)setTimeout(()=>$('ma').focus(),80)}
export const closeSheet=()=>{$('sheet').hidden=true;S.edit=null;S.refEdit=false;SP=[];PH=[];$('phv').hidden=true;closePick()};
/* 👯 the same entry already there? (both of you typing the same receipt): same kind and amount, a day apart at most,
   and the same note, position or – for a transfer – the same two accounts */
function dupOf(type,amount,date,note,sub,acc,to){const n=norm(stripFx(note)),lo=addDays(date,-1),hi=addDays(date,1),sm=subsMap(S.cfg);
  const t=liveOf(S.tx).find(t=>t.type==type&&t.amount==amount&&t.date>=lo&&t.date<=hi&&!t.roundOf&&(type=='tr'?t.acc==acc&&t.to==to:(n&&norm(stripFx(t.note))==n)||(sub&&t.sub==sub)));
  if(!t)return null;const who=t.by||t.who,V=w=>w=='Wercia'?'dodała':'dodał';
  return{t,label:`${t.note?stripFx(t.note):sm[t.sub]?.name||'Przelew'} · ${am(t.amount,t.acc)} · ${t.date.split('-').reverse().join('.')}${who?` · ${V(who)} ${who}`:''}`}}
export async function saveTx(next){if(guard())return;
  const keep={acc:$('mc').value,date:$('md').value,who:$('mw').value,type:S.etype};
  const type=S.etype,amount=calcAmt($('ma').value),date=$('md').value;
  if(amount<=0)return toast('Podaj kwotę większą od zera','bad');
  if(!isDate(date))return toast('Wybierz datę','bad');
  if(type!='tr'&&!$('ms').value)return toast('Wybierz pozycję budżetu','bad');
  if(type=='tr'&&$('mc').value==$('mto').value)return toast('Wybierz dwa różne konta','bad');
  const cA=accCur($('mc').value),cB=type=='tr'?accCur($('mto').value):cA,two=cA!=cB,amount2=two?calcAmt($('ma2').value):0;
  if(two&&amount2<=0)return toast(`Podaj, ile wpłynie na drugie konto (${curSym(cB)})`,'bad');
  const fxAmt=type!='tr'&&cA=='PLN'&&S.fxOpen&&!S.refEdit?calcAmt($('fxa').value):0,fxCur=fxAmt>0?$('fxc').value:'';
  const auto=two?'💱 kurs '+fxRate(cA,amount,cB,amount2):fxCur?`💱 ${money(fxAmt,fxCur)} · kurs ${fxRate(fxCur,fxAmt,'PLN',amount)}`:'';
  let save=null;if(type=='tr'&&SV.mode){save={};const lim=SV.mode=='in'?(two?amount2:amount):amount;let sum=0;
    for(const i of $('msaveRows').querySelectorAll('input')){const v=calcAmt(i.value),x=SV.L.find(x=>x.d.id==i.dataset.sv);if(v<0)return toast('Kwota odkładania nie może być ujemna','bad');if(!v||!x)continue;
      if(SV.mode=='out'&&v>x.saved)return toast(`Na „${x.d.name}” odłożono tylko ${zl(x.saved)}`,'bad');save[x.d.id]=SV.mode=='in'?v:-v;sum+=v}
    if(sum>lim)return toast(SV.mode=='in'?'Na pożyczki wpisano więcej, niż wynosi wpłata':'Z odłożonych wpisano więcej, niż wynosi wypłata','bad')}
  const parts=type=='tr'||S.edit?[]:SP.map(x=>({sub:x.sub,amount:calcAmt(x.amt)}));
  if(parts.some(x=>!x.sub))return toast('Wybierz pozycję w każdym wierszu paragonu','bad');
  if(parts.some(x=>x.amount<=0))return toast('Podaj kwotę w każdym wierszu paragonu','bad');
  const main=amount-parts.reduce((a,x)=>a+x.amount,0);
  if(main<=0)return toast('Pozycje paragonu przekraczają jego kwotę','bad');
  if(!S.edit){const d=dupOf(type,amount,date,$('mn').value,type=='tr'?'':$('ms').value,$('mc').value,$('mto').value);
    if(d&&!await ask({title:'Taki wpis już jest',text:`${d.label}\n\nCzy to ten sam zakup? Jeśli tak, nie zapisuj go drugi raz.`,ok:'Zapisz mimo to',cancel:'Nie zapisuj'}))return}
  ls.set('mw_acc_'+S.who,$('mc').value);
  const old=S.edit?liveById(S.edit):null,id=old?old.id:'t'+rid();
  const base={type,date,acc:$('mc').value,to:type=='tr'?$('mto').value:'',who:type=='tr'?S.who:$('mw').value,note:[stripFx($('mn').value.trim()),auto].filter(Boolean).join(' · '),deleted:false,ts:Date.now()};
  const body={...base,amount:main,sub:type=='tr'?'':$('ms').value};
  if(two)body.amount2=amount2;else if(old?.amount2)body.amount2=null;
  if(old?.save&&old.type=='tr'){const z={};Object.keys(old.save).forEach(k=>z[k]=0);save={...z,...(save||{})}}if(save&&Object.keys(save).length)body.save=save;
  if(fxCur){body.fxCur=fxCur;body.fxAmt=fxAmt}else if(old?.fxCur){body.fxCur='';body.fxAmt=0}
  const proj=type!='tr'&&!$('mprojWrap').hidden?$('mproj').value:'';if(proj){body.proj=proj;base.proj=proj}else if(old?.proj)body.proj='';
  const lit=!$('mcarWrap').hidden?pnum($('mlit').value)||0:0,odo=!$('mcarWrap').hidden?Math.round(pnum($('modo').value))||0:0;if(lit)body.lit=lit;else if(old?.lit)body.lit=0;if(odo)body.odo=odo;else if(old?.odo)body.odo=0;
  {const wv=type=='exp'&&!$('mwarWrap').hidden?$('mwar').value:'',war=wv=='date'?(isDate($('mward').value)?$('mward').value:''):wv?addM(date,+wv):'';if(war)body.war=war;else if(old?.war)body.war='';
   const ul=type=='exp'&&!$('mulgaWrap').hidden?$('mulga').value:'';if(ul){body.ulga=ul;body.ulgaWho=base.who}else if(old?.ulga){body.ulga='';body.ulgaWho=''}}
  const debt=type=='exp'&&!$('mdebtWrap').hidden?$('mdebt').value:'';if(debt)body.debt=debt;else if(old?.debt)body.debt='';
  if(debt&&S.debts[debt]&&!S.debts[debt].sub&&body.sub)merge(doc(DEBTS(),debt),{sub:body.sub});
  if(old){for(const k of['fixedId','refundOf','split'])if(old[k])body[k]=old[k];body.by=old.by||'';body.ts=old.ts||body.ts;body.eby=S.who;body.eAt=Date.now()}
  const g=parts.length?'g'+rid():'';if(g)body.split=g;
  const coin=!old&&type=='exp'&&S.coinOn&&S.coin;
  const phKeep=type=='tr'?[]:PH.filter(p=>!p.removed),phDel=PH.filter(p=>!p.isNew&&(p.removed||type=='tr'));if(phKeep.length||old?.rcpt?.length)body.rcpt=phKeep.map(p=>p.id);
  closeSheet();
  const ym=date.slice(0,7),ok=await putTx(ym,id,body);
  if(ok)phCommit(id,ym,phKeep,phDel);
  if(ok)for(const x of parts)putTx(ym,'t'+rid(),{...base,amount:x.amount,sub:x.sub,split:g});
  if(ok&&coin)putTx(ym,'t'+rid(),{type:'tr',amount:coin.v,date,sub:'',acc:coin.r.from,to:coin.r.to,who:base.who,note:'🪙 drobne',roundOf:id,deleted:false,ts:Date.now()});
  if(ok&&old&&old.date.slice(0,7)!=ym)await putTx(old.date.slice(0,7),id,{deleted:true,moved:true});
  const sm2=subsMap(S.cfg);if(ok&&!old&&kotki.mode=='lots'&&[body.sub,...parts.map(x=>x.sub)].some(x=>isTreat(sm2[x]?.name)))setTimeout(()=>toast(treatJoke(Math.floor(Date.now()/1000))),1900);
  if(ok&&debt&&S.debts[debt]?.mode=='bank'&&!old)setTimeout(()=>toast('Rata zapisana. Wpisz, ile zostało wg banku.','',{label:'✎ Pozostało',fn:()=>setDebtLeft(debt)}),1500);
  if(ok&&next===true){openTx(null,{type:keep.type});$('mc').value=keep.acc;$('md').value=keep.date;$('mw').value=keep.who;updX()}
  if(ok){const n=parts.length+1;const M=v=>money(v,cA);toast(old?'Zapisano zmiany':parts.length?`Dodano paragon ${M(amount)} (${n} ${plu(n,'pozycja','pozycje','pozycji')})${coin?' · 🪙 +'+M(coin.v):''}`:'Dodano '+M(amount)+(coin?' · 🪙 +'+M(coin.v):''));if(ym!=S.ym){S.ym=ym;render()}}}
export async function delTx(id){if(guard())return;const t=liveById(id);if(!t)return;const ym=t.date.slice(0,7),linked=liveOf(S.tx).filter(x=>x.ppkOf===id||x.refundOf===id||x.slipOf===id||x.payOf===id);
  closeSheet();if(!await putTx(ym,id,{deleted:true}))return;
  linked.forEach(x=>putTx(x.date.slice(0,7),x.id,{deleted:true}));
  toast('Usunięto '+am(Math.abs(t.amount),t.acc)+(linked.length?linked.some(x=>x.slipOf)?' razem z potrąceniami i PPK':linked.some(x=>x.payOf)?' razem z odsetkami':linked.some(x=>x.ppk)?' razem z wpłatami PPK':' razem ze zwrotami':''),'',{label:'Cofnij',fn:()=>{putTx(ym,id,{deleted:false});linked.forEach(x=>putTx(x.date.slice(0,7),x.id,{deleted:false}))}})}
export async function markRefund(id){const t=liveById(id);if(!t)return;const done=refundsOf(id).reduce((a,x)=>a+x.amount,0),left=t.amount-done;
  if(left<=0)return toast('Ten wydatek jest już w całości zwrócony');
  const r=await ask({title:'↩️ Zwrot: '+(subsMap(S.cfg)[t.sub]?.name||''),text:`Wydatek ${am(t.amount,t.acc)} z ${t.date.split('-').reverse().join('.')}${done?`, zwrócono już ${am(done,t.acc)}`:''}.\nZwrot zmniejszy wydatek w tej samej pozycji – nie liczy się jako przychód.`,
    fields:[{id:'a',label:`Ile wróciło (${curSym(accCur(t.acc))})`,type:'decimal',value:f2(left)},{id:'d',label:'Data zwrotu',type:'date',value:td()},{id:'c',label:'Na konto',type:'select',value:t.acc,options:accOpts()}],ok:'Zapisz zwrot'});
  if(!r)return;const amt=pg(r.a);
  if(amt<=0)return toast('Podaj kwotę zwrotu','bad');
  if(amt>left)return toast('Zwrot może wynieść najwyżej '+zl(left),'bad');
  if(!isDate(r.d))return toast('Wybierz datę zwrotu','bad');
  closeSheet();const rym=r.d.slice(0,7),tid='t'+rid();
  if(await putTx(rym,tid,{type:'inc',amount:amt,date:r.d,sub:t.sub,acc:r.c,to:'',who:t.who||S.who,note:t.note||'',refundOf:id,deleted:false,ts:Date.now()}))
    toast('Zapisano zwrot '+zl(amt),'',{label:'Cofnij',fn:()=>putTx(rym,tid,{deleted:true})})}
/* event wiring of this part – app.js calls it once at start (it used to run while app.js was loading) */
export function wireSheet(){
$('mn').addEventListener('input',renderNoteSug);$('mn').addEventListener('focus',renderNoteSug);$('mn').addEventListener('blur',()=>setTimeout(renderNoteSug,150));
$('mnSug').addEventListener('pointerdown',e=>e.preventDefault());
$('mnSug').onclick=e=>{const b=e.target.closest('[data-note]');if(!b)return;$('mn').value=b.dataset.note;$('mn').dispatchEvent(new window.Event('input'));$('mn').blur();$('mnSug').hidden=true};
$('mwarPhBtn').onclick=()=>$('mphIn').click();

$('msBtn').onclick=()=>openPick($('ms').value,sid=>{S.autoSub=false;setMs(sid)});
$('pkBody').onclick=e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.sid){const cb=P.cb;closePick();if(cb)cb(b.dataset.sid)}
  else if(b.dataset.cat){P.cat=b.dataset.cat;renderPick()}
  else if(b.dataset.back){P.cat=null;renderPick()}};
$('pq').oninput=()=>{P.cat=null;renderPick()};
$('pkClose').onclick=closePick;$('pick').onclick=e=>{if(e.target===$('pick'))closePick()};
$('mn').oninput=()=>{if(S.edit||S.etype=='tr'||($('ms').value&&!S.autoSub))return;const s=noteSub($('mn').value,pickKind());
  if(s){S.autoSub=true;setMs(s.id,'💡 podpowiedziane po notatce – stuknij, żeby zmienić')}else if(S.autoSub){S.autoSub=false;setMs('')}};
$('ma').addEventListener('input',()=>updX());
$('ma').oninput=()=>{const v=$('ma').value;$('maSum').textContent=/\d\s*[+\-−]\s*\d/.test(v)?'= '+am(calcAmt(v),$('mc').value):'';updSplit();updCoin();updFx();updSave()};
$('mproj').onchange=()=>updProj();
$('mwar').onchange=()=>{if($('mwar').value=='date'&&!$('mward').value)$('mward').value=addM($('md').value||td(),24);updX()};
$('mulga').onchange=()=>updX();$('mulgaBtn').onclick=()=>{S.ulgaOpen=true;updX()};
$('mphBtn').onclick=()=>$('mphIn').click();
$('mphIn').onchange=async e=>{const files=[...e.target.files];e.target.value='';const room=PH_MAX-PH.filter(p=>!p.removed).length;if(files.length>room)toast(`Najwyżej ${PH_MAX} zdjęcia przy jednym wpisie`);
  for(const f of files.slice(0,room)){try{PH.push({id:'r'+rid(),...await shrinkPhoto(f),isNew:true})}catch(er){toast('Nie udało się wczytać zdjęcia','bad')}}renderPh()};
$('mph').onclick=e=>{const x=e.target.closest('[data-phx]');if(x){const p=PH.find(p=>p.id==x.dataset.phx);if(p)p.removed=true;return renderPh()}
  const b=e.target.closest('[data-ph]');if(b){const p=PH.find(p=>p.id==b.dataset.ph);if(p?.data)openPhoto(p.data)}};
$('phvClose').onclick=()=>{$('phv').hidden=true};$('phvSave').onclick=()=>savePhoto();$('phv').onclick=e=>{if(e.target.id=='phv')$('phv').hidden=true};
/* rarely needed: a liability and a project stay folded into small buttons at the bottom, unless the entry already has one */
$('mdebtBtn').onclick=()=>{S.debtOpen=true;updDebt()};$('mdebt').onchange=()=>updDebtHint(true);$('mprojBtn').onclick=()=>{S.projOpen=true;updProj()};
$('mulga').innerHTML='<option value="">— bez ulgi —</option>'+Object.entries(ULGI).map(([k,u])=>`<option value="${k}">${u.n}</option>`).join('');
$('ma2').oninput=$('fxa').oninput=$('fxc').onchange=()=>updFx();$('mto').onchange=()=>{updFx();updSave()};
$('fxBtn').onclick=()=>{S.fxOpen=true;updFx();$('fxa').focus()};
$('md').onchange=()=>updCoin();
$('rnd').onclick=()=>{S.coinOn=!S.coinOn;updCoin()};
document.querySelectorAll('.cop').forEach(b=>{b.onpointerdown=b.onmousedown=e=>e.preventDefault();
  b.onclick=()=>{const el=$('ma');el.value=el.value.replace(/[+\-−\s]+$/,'')+b.dataset.op;el.focus();el.oninput()}});
$('splitBtn').onclick=()=>{SP=[{sub:'',amt:''}];renderSplit()};
$('splitAdd').onclick=()=>{SP.push({sub:'',amt:''});renderSplit()};
$('splitRows').onclick=e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.x!=null){SP.splice(+b.dataset.x,1);renderSplit()}
  else if(b.dataset.i!=null){const i=+b.dataset.i;openPick(SP[i].sub,sid=>{SP[i].sub=sid;renderSplit()})}};
$('splitRows').oninput=e=>{const i=e.target.dataset.i;if(i!=null){SP[+i].amt=e.target.value;updSplit()}};
$('shRef').onclick=()=>S.edit&&markRefund(S.edit);
}