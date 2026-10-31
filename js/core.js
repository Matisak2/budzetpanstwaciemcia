/* Budżet M&W – state, Firebase, UI helpers and storage (shared by every screen). Part of the former js/app.js (split into modules, same code). */
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {initializeFirestore,persistentLocalCache,persistentMultipleTabManager,doc,collection,setDoc,updateDoc,deleteField} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {scene} from './cats.js';
import {NEWS,NEWS_V,TOUR,WIDE,greeting,isTreat,kotki} from './guide.js';
import {CURS,SEASON,tint} from './data.js';
import {wrapOf} from './inv.js';
import {actuals,agg,cleanCat,fixedDate,fixedTwin,fixedWho,seenBy,liveOf,savFlow,savIds,planOf} from './logic.js';
import {$,addDays,daysIn,esc,ls,rid,td,money,curSym,fxPlus} from './util.js';
import {goalAlloc,askWhoLock} from './actions.js';
import {runGo,maybeToday} from './todayui.js';
import {accN,render} from './app.js';
import {use} from './usage.js';

export const fa=initializeApp({apiKey:"AIzaSyBda2N5_9Pdez3kzI4MFR7o2gGSSm8nLZM",authDomain:"budzet-panstwa-ciemcia.firebaseapp.com",projectId:"budzet-panstwa-ciemcia",appId:"1:711621657322:web:d589b95213dd2211328d93"});
export const auth=getAuth(fa);
export const fdb=initializeFirestore(fa,{localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})});

export function applySeason(){const m=+S.ym.slice(5)-1,[c,l]=SEASON[m];const r=document.documentElement.style;r.setProperty('--head',c);r.setProperty('--head-line',l);r.setProperty('--bg',tint(c,.38));
  const meta=document.querySelector('meta[name=theme-color]');if(meta)meta.setAttribute('content',c)}

/* ---------- state ---------- */
/* the demo version (/demo/): sample data in this browser only, no Firebase, no notifications or e-mails */
export const DEMO=window.MW_DEMO||null;
export const S={sub:'all',bf:'all',fold:{},showEmpty:{},showCat:{},accSub:'all',accTab:'cur',savTarget:0,goals:{},slips:{},hold:{},debts:{},market:{},backup:null,plansSrv:false,autoPlanned:{},f:{q:'',type:'',who:'',acc:'',cat:'',scope:'m'},ana:'m',cfg:null,tx:[],plans:{},inv:{},months:new Set(),ym:td().slice(0,7),tab:'dash',open:{},pend:false,edit:null,etype:'exp',last:'',who:ls.get('mw_who')||'Mati',ro:false};

/* ---------- labels ---------- */
export const catL=c=>(S.cfg.cats.findIndex(x=>x.id===c.id)+1)+'. '+cleanCat(c.name);

/* ---------- decorations ---------- */
export function confetti(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  /* 🌸 on Wercia's pink phone: falling cherry petals instead of confetti */
  const pet=document.body.classList.contains('wf'),box=document.createElement('div');box.className='confetti'+(pet?' petals':'');const cols=pet?['#fbcfe8','#f9a8d4','#fce7f3','#f472b6','#fff']:['#fbcfe8','#bbf0d6','#dfe5ff','#fde68a','#fecdd3','#c7f0dd','#e9d5ff'];
  for(let i=0;i<70;i++){const p=document.createElement('i');p.style.left=Math.random()*100+'%';p.style.background=cols[i%cols.length];p.style.animationDelay=(Math.random()*.6)+'s';p.style.animationDuration=(1.8+Math.random()*1.4)*(pet?1.3:1)+'s';p.style.transform=`rotate(${Math.random()*360}deg)`;if(i%3==0&&!pet)p.style.borderRadius='50%';box.append(p)}
  document.body.append(box);setTimeout(()=>box.remove(),pet?5200:3800)}
kotki.mode=ls.get('mw_kotki')||'lots';
/* greeting on the Budget screen: Bailey or Ivo says one thing (special day, something to fix, good news or an everyday line) */
export function greetH(cfg,txAll){const now=new Date(),hr=now.getHours(),today=td(),ym=today.slice(0,7),who=S.who;
  const [hi,em]=hr<5?['Dobranoc','🌙']:hr<12?['Dzień dobry','☀️']:hr<18?['Miłego dnia','🌤️']:hr<23?['Dobry wieczór','🌆']:['Dobranoc','🌙'];
  const tx=liveOf(txAll),A=agg(cfg,tx,ym),pl=planOf(cfg,S.plans,tx,ym),pexp=cfg.cats.filter(c=>c.type=='exp').reduce((a,c)=>a+c.subs.reduce((b,x)=>b+(pl[x.id]||0),0),0);
  const sd=savFlow(cfg,tx,savIds(cfg),ym).flow;
  const unpaid=(cfg.fixed||[]).filter(f=>(f.kind||'exp')=='exp'&&seenBy(fixedWho(cfg,f),who)&&!tx.some(t=>t.fixedId===f.id&&t.date.startsWith(ym))&&!fixedTwin(cfg,tx,f,ym));
  const late=unpaid.filter(f=>fixedDate(f,ym)<today).map(f=>f.name),soon=unpaid.filter(f=>{const d=fixedDate(f,ym);return d>=today&&d<=addDays(today,5)}).map(f=>f.name);
  const gl=Object.values(S.goals).filter(g=>g.target&&goalAlloc(g)<g.target).map(g=>({name:g.name,pct:goalAlloc(g)/g.target*100})).sort((a,b)=>b.pct-a.pct)[0]||null;
  const act=actuals(cfg,tx,ym),treats=cfg.cats.reduce((a,c)=>a+c.subs.filter(x=>isTreat(x.name)).reduce((b,x)=>b+Math.max(0,act[x.id]||0),0),0);
  const okL=(()=>{try{const o=JSON.parse(ls.get('mw_ok')||'{}');return o.d==today?o.k||[]:[]}catch(e){return[]}})();
  const g=greeting({calm:true,ok:new Set(okL),jdg:(cfg.incs||[]).some(s=>s.kind=='b2b')&&+today.slice(8)>=14&&+today.slice(8)<=20,coins:coinSum(ym),name:who,today,hour:hr,dl:daysIn(ym)-(+today.slice(8))+1,plan:pexp,left:pexp-A.exp,saved:sd,late,soon,goal:gl,backupDays:0,treats,births:S.hraw?.birth||{}});
  if((g.scene.startsWith('birthday')||g.bday)&&kotki.mode!='off'&&!ls.get('mw_bd_'+today)){ls.set('mw_bd_'+today,'1');setTimeout(confetti,400)}
  const pic=kotki.mode=='off'?'':`<div class="gcats${WIDE.has(g.scene)?' w':''}">${scene(g.scene,'kot',g.arg)}</div>`;
  const txt=esc(g.text).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>'),okB=g.k?`<button class="chip gok" data-k="${esc(g.k)}" onclick="okCats(this.dataset.k)">Rozumiem, kociaki 🐾</button>`:'';
  return`<section class="greet"><div class="gtxt"><b>${hi}, ${esc(who)} ${em}</b><span>${kotki.mode=='off'?'':`<em class="who">${g.who}:</em> `}${txt}</span>${okB}</div>${pic}</section>`}
/* „Rozumiem, kociaki 🐾”: this warning hides until tomorrow on this phone, the fact of the day comes instead */
export function okCats(k){const today=td();let o={};try{o=JSON.parse(ls.get('mw_ok')||'{}')}catch(e){}const L=o.d==today?o.k||[]:[];ls.set('mw_ok',JSON.stringify({d:today,k:[...new Set([...L,k])]}));render()}
/* Bailey & Ivo slides: first steps, "Co nowego", celebrations */
export function catSlides(slides,done='Gotowe'){return new Promise(res=>{const d=$('dlg');let i=0;
  const fin=()=>{d.hidden=true;d.onclick=null;d.onkeydown=null;res()};
  const draw=()=>{const sl=slides[i],last=i==slides.length-1;
    $('dlgBody').innerHTML=`<div class="cslide">${kotki.mode=='off'?'':scene(sl.scene,'kot',sl.arg)}<h2>${esc(sl.title)}</h2><p class="dtext">${esc(sl.text)}</p></div>${slides.length>1?`<div class="dots">${slides.map((_,j)=>`<i class="${j==i?'on':''}"></i>`).join('')}</div>`:''}<div class="${slides.length>1?'g2':'btns'}">${slides.length>1?`<button class="btn" id="csBack">${i?'Wstecz':'Pomiń'}</button>`:''}<button class="btn primary" id="csNext" style="${slides.length>1?'':'flex:1'}">${last?done:'Dalej'}</button></div>`;
    if($('csBack'))$('csBack').onclick=()=>{if(i){i--;draw()}else fin()};$('csNext').onclick=()=>{if(!last){i++;draw()}else fin()}};
  d.onclick=e=>{if(e.target===d)fin()};d.onkeydown=e=>{if(e.key=='Escape')fin()};draw();d.hidden=false})}
export const showTour=()=>catSlides(TOUR(S.who),'Zaczynamy!');
export function showNews(all){const seen=all?0:+(ls.get('mw_news')||0),list=NEWS.filter(x=>x.v>seen);ls.set('mw_news',String(NEWS_V));
  return catSlides((list.length?list:NEWS.slice(0,1)).map(x=>({scene:x.scene,title:'Co nowego · '+x.title,text:x.items.map(t=>'• '+t).join('\n')})),'Super!')}
/* once per session, after the budget has loaded: first steps on a new phone, otherwise "Co nowego" after an update */
export function maybeIntro(){if(S.introDone||!S.cfg||!$('dlg').hidden||!$('sheet').hidden)return;
  if(S.whoAsk){const d=S.whoAsk;S.whoAsk=null;return askWhoLock(d).then(()=>setTimeout(maybeIntro,400))}S.introDone=true;
  if(!ls.get('mw_tour')&&kotki.mode!='off'){ls.set('mw_tour','1');ls.set('mw_news',String(NEWS_V));showTour()}
  else if(+(ls.get('mw_news')||0)<NEWS_V)showNews();
  else if(S.goPending){const g=S.goPending;S.goPending=null;setTimeout(()=>{use('f:link');runGo(g)},300)}
  else if(birthDue())askBirth().then(()=>setTimeout(maybeToday,400));
  else setTimeout(maybeToday,400)}
/* 🎂 Bailey & Ivo ask this phone's person for the date of birth (shared on both phones: birthday wishes, ulga dla młodych in the payslip until 26).
   „Nie teraz” – asked again after 60 days; changed in ⚙️ → „Kto korzysta z tego telefonu?” */
const birthDue=()=>!DEMO&&!!S.cfg&&!S.hraw?.birth?.[S.who]&&!((ls.get('mw_bask')||'')>addDays(td(),-60));
export function askBirth(force){const who=S.who,cur=S.hraw?.birth?.[who]||'';if(!force)ls.set('mw_bask',td());
  return new Promise(res=>{const d=$('dlg');
    $('dlgBody').innerHTML=`<div class="cslide">${kotki.mode=='off'?'':scene('duo','kot')}<h2>${cur?'🎂 Data urodzenia':`Kiedy masz urodziny, ${esc(who)}? 🎂`}</h2><p class="dtext">${cur?'':'Bailey i Ivo chcą złożyć Ci życzenia. '}Do 26. urodzin aplikacja sama policzy też ulgę dla młodych w pasku pensji (bez podatku). Datę widzicie tylko Wy dwoje.</p></div>
      <label class="fld"><span>Data urodzenia</span><input id="f_bd" type="date" value="${esc(cur)}" max="${td()}"></label><div class="g2"><button class="btn" id="dlgNo">${cur||force?'Anuluj':'Nie teraz'}</button><button class="btn primary" id="dlgOk">Zapisz</button></div>`;
    d.hidden=false;const done=v=>{d.hidden=true;d.onkeydown=null;d.onclick=null;res(v)};
    $('dlgNo').onclick=()=>done(false);d.onclick=e=>{if(e.target===d)done(false)};d.onkeydown=e=>{if(e.key=='Escape')done(false)};
    $('dlgOk').onclick=()=>{const v=$('f_bd').value;if(!/^\d{4}-\d\d-\d\d$/.test(v)||v>td()||v<'1920-01-01')return toast('Wybierz datę urodzenia','bad');
      merge(H,{birth:{[who]:v}});done(true);toast(v.slice(5)==td().slice(5)?'🎂 Wszystkiego najlepszego!':'Zapisane 🎂 Bailey i Ivo już pamiętają')}})}
/* a celebration: confetti + Bailey & Ivo (or just a message when they are switched to "few"/"off") */
export function celebrate(c){confetti();if(kotki.mode=='lots')catSlides([c],'Hura!');else toast(c.title)}
/* drobne saved in a month (all rules, one rule, or into one account) */
/* ids = only coins that went to these accounts (e.g. savings – „w tym z drobnych” under „Ile odłożyliście”) */
export const coinSum=(ym,r,to,ids)=>liveOf(S.tx).filter(t=>t.roundOf&&t.date.startsWith(ym)&&(!r||t.acc==r.from&&t.to==r.to)&&(!to||t.to==to)&&(!ids||ids.includes(t.to))&&(r||to||accCur(t.acc)=='PLN')).reduce((a,t)=>a+t.amount,0);
export async function editRound(id){if(guard())return;const r0=id?(S.cfg.round||[]).find(x=>x.id==id):null,opts=accOpts();
  const res=await ask({title:r0?'Reguła drobnych':'Nowa reguła drobnych',text:'Przykład: płacisz 12,34 zł → do pełnych 5 zł brakuje 2,66 zł → przy mnożniku ×2 odłożę 5,32 zł.\nDrobne liczą się od dnia dodania reguły.',fields:[
    {id:'f',label:'Z konta (nim płacisz kartą)',type:'select',value:r0?.from||'',options:[['','— wybierz —'],...opts]},
    {id:'t',label:'Odkładaj na konto',type:'select',value:r0?.to||'',options:[['','— wybierz —'],...opts]},
    {id:'s',label:'Zaokrąglaj w górę do',type:'select',value:String(r0?.step||5),options:[['5','pełnych 5 zł'],['10','pełnych 10 zł']]},
    {id:'m',label:'Mnożnik',type:'select',value:String(r0?.mult||1),options:[1,2,3,4,5,10].map(n=>[String(n),'×'+n])},
    {id:'q',label:'Przy równej kwocie (np. 15,00 zł)',type:'select',value:r0&&!r0.full?'0':'1',options:[['1','odkładaj pełne 5 / 10 zł × mnożnik'],['0','nic nie odkładaj']]}],
    ok:r0?'Zapisz':'Dodaj',alt:r0?'Usuń regułę':null});
  if(!res)return;
  if(res=='alt'){if(!await ask({title:'Usunąć regułę drobnych?',text:`${accN(r0.from)} → ${accN(r0.to)}\nOdłożone już drobne zostają na koncie.`,ok:'Usuń',danger:true}))return;
    S.cfg.round=S.cfg.round.filter(x=>x!==r0);render();delRoundDb(r0.id);return toast('Usunięto regułę drobnych')}
  if(!res.f||!res.t)return toast('Wybierz oba konta','bad');
  if(res.f==res.t)return toast('Wybierz dwa różne konta','bad');
  if(accCur(res.f)!=accCur(res.t))return toast('Oba konta muszą mieć tę samą walutę','bad');
  if((S.cfg.round||[]).some(x=>x.from==res.f&&x!==r0))return toast('To konto ma już regułę drobnych','bad');
  const body={id:r0?.id||'r'+rid(),from:res.f,to:res.t,step:+res.s,mult:+res.m,full:res.q=='1',since:r0?.since||td()};
  S.cfg.round=S.cfg.round||[];let r=r0;if(r)Object.assign(r,body);else{r=body;S.cfg.round.push(r)}
  render();saveRound(r);toast(r0?'Zapisano regułę drobnych':'Dodano regułę drobnych 🪙')}
export function setKotki(v){kotki.mode=v;ls.set('mw_kotki',v);render()}

/* ---------- UI helpers ---------- */
export function toast(msg,kind,action){const t=$('toast');t.textContent='';const sp=document.createElement('span');sp.textContent=msg;t.append(sp);
  if(action){const b=document.createElement('button');b.className='tbtn';b.textContent=action.label;b.onclick=()=>{t.hidden=true;clearTimeout(toast.h);action.fn()};t.append(b)}
  t.dataset.kind=kind||'';t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,action?7000:3800)}
export function err(e){S.last=new Date().toLocaleTimeString('pl-PL')+' · '+(e&&e.code?e.code+': ':'')+((e&&e.message)||e);if(S.tab=='set')render()}
/* ⓘ a long explanation folded under a small link – open once, it stays open on this screen until closed (S.infoOpen survives re-renders) */
export const infoH=(k,html,label='ⓘ Jak to liczę')=>`<details class="info"${S.infoOpen?.[k]?' open':''} ontoggle="infoTog('${k}',this.open)"><summary>${label}</summary><div class="mini">${html}</div></details>`;
export function infoTog(k,o){S.infoOpen={...(S.infoOpen||{}),[k]:o}}
export function ask({title,text='',fields=[],ok='Zapisz',cancel='Anuluj',danger=false,alt=null}){
  return new Promise(res=>{const d=$('dlg');
    const opt=o=>o.group?`<optgroup label="${esc(o.group)}">${o.items.map(opt).join('')}</optgroup>`:`<option value="${esc(o[0])}">${esc(o[1])}</option>`;
    $('dlgBody').innerHTML=`<h2>${esc(title)}</h2>${text?`<p class="dtext">${esc(text)}</p>`:''}`+
      fields.map(f=>`<label class="fld"><span>${esc(f.label)}</span>${f.type=='select'
        ?`<select id="f_${f.id}">${f.options.map(opt).join('')}</select>`
        :`<input id="f_${f.id}" value="${esc(f.value??'')}"${f.type=='decimal'?' inputmode="decimal"':''}${f.type=='date'?' type="date"':''}${f.type=='month'?' type="month"':''}${f.type=='int'?' inputmode="numeric"':''}${f.ph?` placeholder="${esc(f.ph)}"`:''} autocomplete="off">`}</label>`).join('')+
      `<div class="g2"><button class="btn" id="dlgNo">${esc(cancel)}</button><button class="btn ${danger?'danger':'primary'}" id="dlgOk">${esc(ok)}</button></div>`+
      (alt?`<button class="btn sm" id="dlgAlt" style="align-self:center;background:none;color:var(--exp)">${esc(alt)}</button>`:'');
    fields.forEach(f=>{if(f.type=='select')$('f_'+f.id).value=f.value??''});
    d.hidden=false;const first=d.querySelector('input:not([type=date])');if(first&&!first.value)setTimeout(()=>first.focus(),60);
    const done=v=>{d.hidden=true;d.onkeydown=null;res(v)};
    $('dlgNo').onclick=()=>done(null);
    if(alt)$('dlgAlt').onclick=()=>done('alt');
    $('dlgOk').onclick=()=>{const o={};fields.forEach(f=>o[f.id]=$('f_'+f.id).value);done(fields.length?o:true)};
    d.onclick=e=>{if(e.target===d)done(null)};
    d.onkeydown=e=>{if(e.key=='Enter'&&e.target.tagName=='INPUT'){e.preventDefault();$('dlgOk').click()}if(e.key=='Escape')done(null)};
  })}
/* currencies: every account keeps its own; złoty sums stay złoty, other currencies are added as " + 45,00 €" */
export const CUR=a=>a?.cur||'PLN',accCur=id=>CUR(S.cfg.accs.find(a=>a.id==id)),isP=a=>CUR(a)=='PLN';
export const am=(n,id)=>money(n,accCur(id));
export const fxOf=(accs,f)=>{const m={};accs.forEach(a=>{const c=CUR(a);if(c!='PLN')m[c]=(m[c]||0)+f(a)});return m};
export const fxSmall=m=>{const t=fxPlus(m).trim();return t?`<small class="fxs">${esc(t)}</small>`:''};
export const WRAP_F=a=>({id:'x',label:'Podatek',type:'select',value:wrapOf(a)=='ikze'&&a.jdg?'ikzeB':wrapOf(a),options:[['','Zwykłe konto – podatek Belki 19%'],['ike','IKE'],['ikze','IKZE'],['ikzeB','IKZE – prowadzę działalność (wyższy limit)'],['oki','OKI (od 2027)'],['ppk','PPK']]});
export const setWrap=(a,v)=>{a.wrap=v=='ikzeB'?'ikze':v;a.jdg=v=='ikzeB'};
export const CUR_OPTS=[['PLN','PLN – złoty polski'],...CURS.map(([c,n])=>[c,c+' – '+n])];
export const r4=x=>x.toLocaleString('pl-PL',{minimumFractionDigits:4,maximumFractionDigits:4});
/* "1 EUR = 4,2856 zł" – złoty always on the right; without złoty: 1 of the source currency */
export function fxRate(c1,a1,c2,a2){if(c1=='PLN'){[c1,c2]=[c2,c1];[a1,a2]=[a2,a1]}return`1 ${c1} = ${r4(a2/a1)} ${curSym(c2)}`}
export const stripFx=n=>String(n||'').replace(/\s*(·\s*)?💱.*$/,'');
export const GRPN={cur:'Konto bieżące',sub:'Subkonto',sav:'Oszczędności',inv:'Inwestycje'};
export const accOwner=a=>a.owner||(/wercia|weronika/i.test(a.name)?'Wercia':/mati/i.test(a.name)?'Mati':'Wspólne');
export const accOpts=()=>[['cur','Konta bieżące'],['sub','Subkonta'],['sav','Oszczędności'],['inv','Inwestycje']].map(([g,l])=>({group:l,items:S.cfg.accs.filter(a=>a.grp==g&&!a.archived).map(a=>[a.id,a.name])})).filter(g=>g.items.length);
/* positions for a select; 🙈 hidden ones last in their own group (a dialog may still show one that is already chosen) */
export const subOpts=type=>{const C=S.cfg.cats.filter(c=>!type||c.type==type),hid=C.flatMap(c=>c.subs.filter(s=>s.hidden||c.hidden).map(s=>[s.id,s.name+' ('+cleanCat(c.name).toLowerCase()+')']));
  return[...C.filter(c=>!c.hidden).map(c=>({group:catL(c),items:c.subs.filter(s=>!s.hidden).map(s=>[s.id,s.name])})).filter(g=>g.items.length),...(hid.length?[{group:'🙈 Ukryte',items:hid}]:[])]};

/* ---------- storage (Firebase Firestore) ---------- */
export const H=doc(fdb,'households','main');
export const PUSH=()=>collection(H,'push'),MARKET=()=>collection(H,'market'),DEBTS=()=>collection(H,'debts'),HOLD=()=>collection(H,'hold'),SLIPS=()=>collection(H,'slips'),MC=()=>collection(H,'months'),PLC=()=>collection(H,'plans'),INV=()=>collection(H,'inv'),GOALS=()=>collection(H,'goals');
export function w(p){p.catch(e=>{err(e);
  if(e?.code=='permission-denied')toast('Brak uprawnień do zapisu – sprawdź logowanie i reguły Firestore.','bad');
  else if(e?.code=='resource-exhausted')toast('Przekroczono darmowy limit Firebase na dziś.','bad');
  else toast('Nie udało się zapisać ('+(e?.code||'błąd')+').','bad')});return true}
export const merge=(ref,body)=>w(setDoc(ref,body,{merge:true}));
/* settings are stored as maps (one entry per account / category / item / fixed cost) so two phones editing different things never overwrite each other */
export const toArr=m=>Object.entries(m||{}).map(([id,v])=>({...v,id})).sort((a,b)=>(a.o??0)-(b.o??0)||String(a.id).localeCompare(String(b.id)));
export const strip=(x,i)=>{const{o,subs,subsM,...r}=x;return{...r,o:i}};
export function fromDoc(d){
  if(d.accsM||d.catsM||d.fixedM)return{accs:toArr(d.accsM).map(({o,...a})=>a),cats:toArr(d.catsM).map(({o,subsM,...c})=>({...c,subs:toArr(subsM).map(({o,...x})=>x)})),fixed:toArr(d.fixedM).map(({o,...f})=>f),round:toArr(d.roundM).map(({o,...r})=>r),incs:toArr(d.incM).map(({o,...x})=>x),years:toArr(d.yearM).map(({o,...x})=>x),projs:toArr(d.projM).map(({o,...x})=>x),rems:toArr(d.remM).map(({o,...x})=>x)};
  return{accs:d.accs||[],cats:d.cats||[],fixed:d.fixed||[],round:[],incs:[],years:[],projs:[],rems:[],legacy:true}}
export function toDoc(cfg){const m=(arr,f)=>Object.fromEntries((arr||[]).map((x,i)=>[x.id,f?f(x,i):strip(x,i)]));
  return{v:2,accsM:m(cfg.accs),catsM:m(cfg.cats,(c,i)=>({...strip(c,i),subsM:m(c.subs)})),fixedM:m(cfg.fixed),roundM:m(cfg.round),incM:m(cfg.incs),yearM:m(cfg.years),projM:m(cfg.projs),remM:m(cfg.rems)}}
/* rewrites accounts, categories and fixed items as a whole; other household fields (monthly saving goal, migration flags) are kept */
export const saveCfg=()=>{const keep=Object.fromEntries(Object.entries(S.hraw||{}).filter(([k])=>!['v','accsM','catsM','fixedM','roundM','incM','yearM','projM','remM','accs','cats','fixed'].includes(k)));
  return w(setDoc(H,{...keep,...toDoc(S.cfg),savTarget:S.savTarget||0}))};
export const saveAcc=a=>merge(H,{accsM:{[a.id]:strip(a,S.cfg.accs.indexOf(a))}});
export const delAccDb=id=>w(updateDoc(H,{['accsM.'+id]:deleteField()}));
export const saveSub=(c,s)=>merge(H,{catsM:{[c.id]:{...strip(c,S.cfg.cats.indexOf(c)),subsM:{[s.id]:strip(s,c.subs.indexOf(s))}}}});
export const saveCat=c=>merge(H,{catsM:{[c.id]:strip(c,S.cfg.cats.indexOf(c))}});
export const delCatDb=id=>w(updateDoc(H,{['catsM.'+id]:deleteField()}));
export const delSubDb=(c,s)=>w(updateDoc(H,{[`catsM.${c.id}.subsM.${s.id}`]:deleteField()}));
export const saveFixed=f=>merge(H,{fixedM:{[f.id]:strip(f,S.cfg.fixed.indexOf(f))}});
export const saveRound=r=>merge(H,{roundM:{[r.id]:strip(r,S.cfg.round.indexOf(r))}});
export const delRoundDb=id=>w(updateDoc(H,{['roundM.'+id]:deleteField()}));
export const delFixedDb=id=>w(updateDoc(H,{['fixedM.'+id]:deleteField()}));
/* every write remembers whose phone it came from (shown in the entry and in ⚙️ „Ostatnie zmiany”) */
/* a real deletion also clears „moved” – an entry once moved out of this month and back still had it, and 🗑️ Ostatnio usunięte did not show it */
export const putTx=(ym,id,body)=>{if(body.deleted===true&&!body.moved)body={...body,moved:false,dby:S.who,dAt:Date.now()};else if(body.type&&!('by' in body))body={...body,by:S.who};return merge(doc(MC(),ym),{tx:{[id]:body}})};
export const putInv=(id,body)=>merge(doc(INV(),id),body);
export const liveById=id=>S.tx.find(t=>t.id===id&&!t.deleted);
export const guard=()=>{if(!S.cfg){toast('Budżet jeszcze się wczytuje');return true}return false};