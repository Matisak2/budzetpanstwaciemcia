import {initializeApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,signOut,setPersistence,browserLocalPersistence} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {initializeFirestore,persistentLocalCache,persistentMultipleTabManager,doc,collection,onSnapshot,setDoc,deleteDoc,updateDoc,deleteField,waitForPendingWrites} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {catIcon,catsEmpty} from './art.js';
import {scene} from './cats.js';
import {CELEBRATE,NEWS,NEWS_V,TOUR,WIDE,greeting,isTreat,kotki,treatJoke} from './guide.js';
import {P_OTHER,C_INC,C_EXP,C_SAV,barsSvg,chartBox,deltaH,donutSvg,hbarsH,legendH,lineSvg,pctS,whoH} from './charts.js';
import {CURS,HUES,OWN,OWN_COL,SEASON,ZWROT_PIT,catHue,catMark,freeHue,pastel,seed,tint} from './data.js';
import {KINDS,TAXF,brutto,calcNet,onHand,reserve,suggest,totals,ytdOf} from './pay.js';
import {actuals,agg,balance,buildIcs,cleanCat,dueAlerts,fixedDate,invPln,liveOf,planRecon,roundUp,status,subsMap} from './logic.js';
import {$,MN,MNG,addDays,addMonths,clone,daysIn,esc,f2,fmtIn,isDate,ls,p2,pg,pnum,rid,sleep,td,zl,zl0,money,curSym,fxPlus,fxTxt} from './util.js';
const fa=initializeApp({apiKey:"AIzaSyBda2N5_9Pdez3kzI4MFR7o2gGSSm8nLZM",authDomain:"budzet-panstwa-ciemcia.firebaseapp.com",projectId:"budzet-panstwa-ciemcia",appId:"1:711621657322:web:d589b95213dd2211328d93"});
const auth=getAuth(fa);
const fdb=initializeFirestore(fa,{localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})});

function applySeason(){const m=+S.ym.slice(5)-1,[c,l]=SEASON[m];const r=document.documentElement.style;r.setProperty('--head',c);r.setProperty('--head-line',l);r.setProperty('--bg',tint(c,.38));
  const meta=document.querySelector('meta[name=theme-color]');if(meta)meta.setAttribute('content',c)}

/* ---------- state ---------- */
const S={sub:'all',bf:'all',fold:{},accSub:'all',accTab:'cur',savTarget:0,goals:{},slips:{},backup:null,plansSrv:false,autoPlanned:{},f:{q:'',type:'',who:'',acc:'',cat:'',scope:'m'},ana:'m',cfg:null,tx:[],plans:{},inv:{},months:new Set(),ym:td().slice(0,7),tab:'dash',open:{},pend:false,edit:null,etype:'exp',last:'',who:ls.get('mw_who')||'Mati',ro:false};
let seeding=false;

/* ---------- pure money logic ---------- */
const catL=c=>(S.cfg.cats.indexOf(c)+1)+'. '+cleanCat(c.name);

/* ---------- decorations ---------- */
function confetti(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const box=document.createElement('div');box.className='confetti';const cols=['#fbcfe8','#bbf0d6','#dfe5ff','#fde68a','#fecdd3','#c7f0dd','#e9d5ff'];
  for(let i=0;i<70;i++){const p=document.createElement('i');p.style.left=Math.random()*100+'%';p.style.background=cols[i%cols.length];p.style.animationDelay=(Math.random()*.6)+'s';p.style.animationDuration=(1.8+Math.random()*1.4)+'s';p.style.transform=`rotate(${Math.random()*360}deg)`;if(i%3==0)p.style.borderRadius='50%';box.append(p)}
  document.body.append(box);setTimeout(()=>box.remove(),3800)}
kotki.mode=ls.get('mw_kotki')||'lots';
/* greeting on the Budget screen: Bailey or Ivo says one thing (special day, something to fix, good news or an everyday line) */
function greetH(cfg,txAll){const now=new Date(),hr=now.getHours(),today=td(),ym=today.slice(0,7),who=S.who;
  const [hi,em]=hr<5?['Dobranoc','🌙']:hr<12?['Dzień dobry','☀️']:hr<18?['Miłego dnia','🌤️']:hr<23?['Dobry wieczór','🌆']:['Dobranoc','🌙'];
  const tx=liveOf(txAll),A=agg(cfg,tx,ym),pl=S.plans[ym]||{},pexp=cfg.cats.filter(c=>c.type=='exp').reduce((a,c)=>a+c.subs.reduce((b,x)=>b+(pl[x.id]||0),0),0);
  const sv=cfg.accs.filter(a=>(a.grp=='sav'||a.grp=='inv')&&isP(a)),sd=sv.reduce((x,a)=>x+balance(cfg,tx,a.id,ym+'-32')-balance(cfg,tx,a.id,ym+'-00'),0);
  const unpaid=(cfg.fixed||[]).filter(f=>(f.kind||'exp')=='exp'&&!tx.some(t=>t.fixedId===f.id&&t.date.startsWith(ym)));
  const late=unpaid.filter(f=>fixedDate(f,ym)<today).map(f=>f.name),soon=unpaid.filter(f=>{const d=fixedDate(f,ym);return d>=today&&d<=addDays(today,5)}).map(f=>f.name);
  const gl=Object.values(S.goals).filter(g=>g.target&&goalAlloc(g)<g.target).map(g=>({name:g.name,pct:goalAlloc(g)/g.target*100})).sort((a,b)=>b.pct-a.pct)[0]||null;
  const act=actuals(cfg,tx,ym),treats=cfg.cats.reduce((a,c)=>a+c.subs.filter(x=>isTreat(x.name)).reduce((b,x)=>b+Math.max(0,act[x.id]||0),0),0);
  const g=greeting({jdg:(cfg.incs||[]).some(s=>s.kind=='b2b')&&+today.slice(8)>=14&&+today.slice(8)<=20,coins:coinSum(ym),name:who,today,hour:hr,dl:daysIn(ym)-(+today.slice(8))+1,plan:pexp,left:pexp-A.exp,saved:sd,late,soon,goal:gl,backupDays:0,treats});
  if(g.scene.startsWith('birthday')&&kotki.mode!='off'&&!ls.get('mw_bd_'+today)){ls.set('mw_bd_'+today,'1');setTimeout(confetti,400)}
  const pic=kotki.mode=='off'?'':`<div class="gcats${WIDE.has(g.scene)?' w':''}">${scene(g.scene,'kot',g.arg)}</div>`;
  return`<section class="greet"><div class="gtxt"><b>${hi}, ${esc(who)} ${em}</b><span>${kotki.mode=='off'?'':`<em class="who">${g.who}:</em> `}${esc(g.text)}</span></div>${pic}</section>`}
/* Bailey & Ivo slides: first steps, "Co nowego", celebrations */
function catSlides(slides,done='Gotowe'){return new Promise(res=>{const d=$('dlg');let i=0;
  const fin=()=>{d.hidden=true;d.onclick=null;d.onkeydown=null;res()};
  const draw=()=>{const sl=slides[i],last=i==slides.length-1;
    $('dlgBody').innerHTML=`<div class="cslide">${kotki.mode=='off'?'':scene(sl.scene,'kot',sl.arg)}<h2>${esc(sl.title)}</h2><p class="dtext">${esc(sl.text)}</p></div>${slides.length>1?`<div class="dots">${slides.map((_,j)=>`<i class="${j==i?'on':''}"></i>`).join('')}</div>`:''}<div class="${slides.length>1?'g2':'btns'}">${slides.length>1?`<button class="btn" id="csBack">${i?'Wstecz':'Pomiń'}</button>`:''}<button class="btn primary" id="csNext" style="${slides.length>1?'':'flex:1'}">${last?done:'Dalej'}</button></div>`;
    if($('csBack'))$('csBack').onclick=()=>{if(i){i--;draw()}else fin()};$('csNext').onclick=()=>{if(!last){i++;draw()}else fin()}};
  d.onclick=e=>{if(e.target===d)fin()};d.onkeydown=e=>{if(e.key=='Escape')fin()};draw();d.hidden=false})}
const showTour=()=>catSlides(TOUR(S.who),'Zaczynamy!');
function showNews(all){const seen=all?0:+(ls.get('mw_news')||0),list=NEWS.filter(x=>x.v>seen);ls.set('mw_news',String(NEWS_V));
  return catSlides((list.length?list:NEWS.slice(0,1)).map(x=>({scene:x.scene,title:'Co nowego · '+x.title,text:x.items.map(t=>'• '+t).join('\n')})),'Super!')}
/* once per session, after the budget has loaded: first steps on a new phone, otherwise "Co nowego" after an update */
function maybeIntro(){if(S.introDone||!S.cfg||!$('dlg').hidden||!$('sheet').hidden)return;S.introDone=true;
  if(!ls.get('mw_tour')&&kotki.mode!='off'){ls.set('mw_tour','1');ls.set('mw_news',String(NEWS_V));showTour()}
  else if(+(ls.get('mw_news')||0)<NEWS_V)showNews()}
/* a celebration: confetti + Bailey & Ivo (or just a message when they are switched to "few"/"off") */
function celebrate(c){confetti();if(kotki.mode=='lots')catSlides([c],'Hura!');else toast(c.title)}
/* drobne saved in a month (all rules, one rule, or into one account) */
const coinSum=(ym,r,to)=>liveOf(S.tx).filter(t=>t.roundOf&&t.date.startsWith(ym)&&(!r||t.acc==r.from&&t.to==r.to)&&(!to||t.to==to)&&(r||to||accCur(t.acc)=='PLN')).reduce((a,t)=>a+t.amount,0);
async function editRound(id){if(guard())return;const r0=id?(S.cfg.round||[]).find(x=>x.id==id):null,opts=accOpts();
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
function setKotki(v){kotki.mode=v;ls.set('mw_kotki',v);render()}

/* ---------- UI helpers ---------- */
function toast(msg,kind,action){const t=$('toast');t.textContent='';const sp=document.createElement('span');sp.textContent=msg;t.append(sp);
  if(action){const b=document.createElement('button');b.className='tbtn';b.textContent=action.label;b.onclick=()=>{t.hidden=true;clearTimeout(toast.h);action.fn()};t.append(b)}
  t.dataset.kind=kind||'';t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,action?7000:3800)}
function err(e){S.last=new Date().toLocaleTimeString('pl-PL')+' · '+(e&&e.code?e.code+': ':'')+((e&&e.message)||e);if(S.tab=='set')render()}
function ask({title,text='',fields=[],ok='Zapisz',cancel='Anuluj',danger=false,alt=null}){
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
const CUR=a=>a?.cur||'PLN',accCur=id=>CUR(S.cfg.accs.find(a=>a.id==id)),isP=a=>CUR(a)=='PLN';
const am=(n,id)=>money(n,accCur(id));
const fxOf=(accs,f)=>{const m={};accs.forEach(a=>{const c=CUR(a);if(c!='PLN')m[c]=(m[c]||0)+f(a)});return m};
const fxSmall=m=>{const t=fxPlus(m).trim();return t?`<small class="fxs">${esc(t)}</small>`:''};
const CUR_OPTS=[['PLN','PLN – złoty polski'],...CURS.map(([c,n])=>[c,c+' – '+n])];
const r4=x=>x.toLocaleString('pl-PL',{minimumFractionDigits:4,maximumFractionDigits:4});
/* "1 EUR = 4,2856 zł" – złoty always on the right; without złoty: 1 of the source currency */
function fxRate(c1,a1,c2,a2){if(c1=='PLN'){[c1,c2]=[c2,c1];[a1,a2]=[a2,a1]}return`1 ${c1} = ${r4(a2/a1)} ${curSym(c2)}`}
const stripFx=n=>String(n||'').replace(/\s*(·\s*)?💱.*$/,'');
const GRPN={cur:'Konto bieżące',sub:'Subkonto',sav:'Oszczędności',inv:'Inwestycje'};
const accOwner=a=>a.owner||(/wercia|weronika/i.test(a.name)?'Wercia':/mati/i.test(a.name)?'Mati':'Wspólne');
const accOpts=()=>[['cur','Konta bieżące'],['sub','Subkonta'],['sav','Oszczędności'],['inv','Inwestycje']].map(([g,l])=>({group:l,items:S.cfg.accs.filter(a=>a.grp==g&&!a.archived).map(a=>[a.id,a.name])})).filter(g=>g.items.length);
const subOpts=type=>S.cfg.cats.filter(c=>!type||c.type==type).map(c=>({group:catL(c),items:c.subs.map(s=>[s.id,s.name])}));

/* ---------- storage (Firebase Firestore) ---------- */
const H=doc(fdb,'households','main');
const SLIPS=()=>collection(H,'slips'),MC=()=>collection(H,'months'),PLC=()=>collection(H,'plans'),INV=()=>collection(H,'inv'),GOALS=()=>collection(H,'goals');
function w(p){p.catch(e=>{err(e);
  if(e?.code=='permission-denied')toast('Brak uprawnień do zapisu – sprawdź logowanie i reguły Firestore.','bad');
  else if(e?.code=='resource-exhausted')toast('Przekroczono darmowy limit Firebase na dziś.','bad');
  else toast('Nie udało się zapisać ('+(e?.code||'błąd')+').','bad')});return true}
const merge=(ref,body)=>w(setDoc(ref,body,{merge:true}));
/* settings are stored as maps (one entry per account / category / item / fixed cost) so two phones editing different things never overwrite each other */
const toArr=m=>Object.entries(m||{}).map(([id,v])=>({...v,id})).sort((a,b)=>(a.o??0)-(b.o??0)||String(a.id).localeCompare(String(b.id)));
const strip=(x,i)=>{const{o,subs,subsM,...r}=x;return{...r,o:i}};
function fromDoc(d){
  if(d.accsM||d.catsM||d.fixedM)return{accs:toArr(d.accsM).map(({o,...a})=>a),cats:toArr(d.catsM).map(({o,subsM,...c})=>({...c,subs:toArr(subsM).map(({o,...x})=>x)})),fixed:toArr(d.fixedM).map(({o,...f})=>f),round:toArr(d.roundM).map(({o,...r})=>r),incs:toArr(d.incM).map(({o,...x})=>x)};
  return{accs:d.accs||[],cats:d.cats||[],fixed:d.fixed||[],round:[],incs:[],legacy:true}}
function toDoc(cfg){const m=(arr,f)=>Object.fromEntries((arr||[]).map((x,i)=>[x.id,f?f(x,i):strip(x,i)]));
  return{v:2,accsM:m(cfg.accs),catsM:m(cfg.cats,(c,i)=>({...strip(c,i),subsM:m(c.subs)})),fixedM:m(cfg.fixed),roundM:m(cfg.round),incM:m(cfg.incs)}}
/* rewrites accounts, categories and fixed items as a whole; other household fields (monthly saving goal, migration flags) are kept */
const saveCfg=()=>{const keep=Object.fromEntries(Object.entries(S.hraw||{}).filter(([k])=>!['v','accsM','catsM','fixedM','roundM','incM','accs','cats','fixed'].includes(k)));
  return w(setDoc(H,{...keep,...toDoc(S.cfg),savTarget:S.savTarget||0}))};
const saveAcc=a=>merge(H,{accsM:{[a.id]:strip(a,S.cfg.accs.indexOf(a))}});
const delAccDb=id=>w(updateDoc(H,{['accsM.'+id]:deleteField()}));
const saveSub=(c,s)=>merge(H,{catsM:{[c.id]:{...strip(c,S.cfg.cats.indexOf(c)),subsM:{[s.id]:strip(s,c.subs.indexOf(s))}}}});
const saveCat=c=>merge(H,{catsM:{[c.id]:strip(c,S.cfg.cats.indexOf(c))}});
const delCatDb=id=>w(updateDoc(H,{['catsM.'+id]:deleteField()}));
const delSubDb=(c,s)=>w(updateDoc(H,{[`catsM.${c.id}.subsM.${s.id}`]:deleteField()}));
const saveFixed=f=>merge(H,{fixedM:{[f.id]:strip(f,S.cfg.fixed.indexOf(f))}});
const saveRound=r=>merge(H,{roundM:{[r.id]:strip(r,S.cfg.round.indexOf(r))}});
const delRoundDb=id=>w(updateDoc(H,{['roundM.'+id]:deleteField()}));
const delFixedDb=id=>w(updateDoc(H,{['fixedM.'+id]:deleteField()}));
const putTx=(ym,id,body)=>merge(doc(MC(),ym),{tx:{[id]:body}});
const putInv=(id,body)=>merge(doc(INV(),id),body);
const liveById=id=>S.tx.find(t=>t.id===id&&!t.deleted);
const guard=()=>{if(!S.cfg){toast('Budżet jeszcze się wczytuje');return true}return false};

/* ---------- transaction sheet ---------- */
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ł/g,'l').trim();
const plu=(n,a,b,c)=>n==1?a:(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20))?b:c;
const catColor=c=>pastel(catHue(c,S.cfg.cats.indexOf(c)));
/* amount field adds up a receipt: "12+8,50-3" → grosze */
const calcAmt=v=>(String(v||'').replace(/\s/g,'').replace(/−/g,'-').match(/[+-]?[^+-]+/g)||[]).reduce((a,p)=>a+pg(p),0);
/* refunds are income booked on the expense's own position, so they lower that expense instead of adding income */
const refundsOf=id=>liveOf(S.tx).filter(x=>x.refundOf===id);
/* the picker offers positions of this kind; a refund keeps its expense position */
const pickKind=()=>S.etype=='inc'&&!S.refEdit?'inc':'exp';

function setType(t){S.etype=t;$('mt').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v==t));
  if(S.cfg){updCoin();updFx()}
  $('msWrap').hidden=t=='tr';$('mtoWrap').hidden=t!='tr';$('mwWrap').hidden=t=='tr';$('mcLab').textContent=t=='tr'?'Z konta':'Konto';
  const s=S.cfg&&subsMap(S.cfg)[$('ms').value];if(s&&s.cat.type!=pickKind())setMs('');
  if(t=='tr'&&SP.length){SP=[];renderSplit()}updSplit()}
/* 🪙 drobne: the rule of the chosen account, the rounding of this amount, on/off for this one expense (on by default) */
const ruleOf=acc=>(S.cfg.round||[]).find(r=>r.from==acc&&S.cfg.accs.some(a=>a.id==r.to)&&accCur(r.from)==accCur(r.to));
function updCoin(){const b=$('rnd'),r=S.etype=='exp'&&!S.edit&&ruleOf($('mc').value),d=$('md').value,amt=calcAmt($('ma').value);
  const v=r&&amt>0&&(!r.since||d>=r.since)?roundUp(amt,r):0;S.coin=v?{r,v}:null;b.hidden=!v;if(!v)return;
  b.setAttribute('aria-pressed',S.coinOn);b.innerHTML=`<span class="cn">🪙</span><span class="ct"><b>Drobne +${am(v,r.from)}</b><small>→ ${esc(accN(r.to))}${S.coinOn?'':' · nie odłożę'}</small></span><span class="ck">${S.coinOn?'✓':''}</span>`}
/* 🌍 currencies in the sheet: label of the amount, the second amount of an exchange, a card payment abroad */
function updFx(){if(!S.cfg)return;const t=S.etype,cA=accCur($('mc').value),cB=accCur($('mto').value),two=t=='tr'&&cA!=cB;
  $('maLab').textContent=`Kwota (${curSym(cA)})`;$('fxTr').hidden=!two;
  if(two){$('ma2Lab').textContent=`Wpłynie na konto docelowe (${curSym(cB)})`;const a=calcAmt($('ma').value),b=calcAmt($('ma2').value);
    $('fxRate').textContent=a>0&&b>0?`💱 ${fxRate(cA,a,cB,b)} – dopiszę do notatki`:'Wpisz obie kwoty z banku – kurs policzę sam.'}
  const card=t!='tr'&&cA=='PLN'&&!S.refEdit;$('fxBtn').hidden=!card||S.fxOpen;$('fxCard').hidden=!card||!S.fxOpen;
  if(card&&S.fxOpen){const a=calcAmt($('ma').value),b=calcAmt($('fxa').value);
    $('fxCardRate').textContent=a>0&&b>0?`💱 ${fxRate($('fxc').value,b,'PLN',a)} – dopiszę do notatki`:'„Kwota (zł)” to tyle, ile pobrał bank. Wpisz też kwotę w walucie – kurs policzę sam.'}}
function autoWho(){const a=S.cfg.accs.find(x=>x.id==$('mc').value),o=a&&accOwner(a);if(o=='Mati'||o=='Wercia')$('mw').value=o}

/* position picker: search, recently used, the note's usual position, category tiles */
const P={kind:'exp',cat:null,cb:null,cur:''};
function openPick(cur,cb){P.kind=pickKind();P.cb=cb;P.cur=cur||'';P.cat=null;$('pq').value='';renderPick();$('pick').hidden=false;$('pkBody').scrollTop=0}
const closePick=()=>{$('pick').hidden=true;P.cb=null};
function recentSubs(kind,n){const sm=subsMap(S.cfg),seen=new Map();
  liveOf(S.tx).filter(t=>sm[t.sub]&&sm[t.sub].cat.type==kind&&(t.type=='exp'||t.type=='inc')&&!t.fixedId&&!t.refundOf).sort((a,b)=>(b.ts||0)-(a.ts||0)).slice(0,80)
    .forEach((t,i)=>{const x=seen.get(t.sub)||{n:0,i};x.n++;seen.set(t.sub,x)});
  return[...seen].sort((a,b)=>b[1].n-a[1].n||a[1].i-b[1].i).slice(0,n).map(([id])=>sm[id])}
/* the position usually chosen with this note: the same note first, then the same first word */
function noteSub(note,kind){const k=norm(note);if(k.length<2)return null;const w=k.split(/\s+/)[0],sm=subsMap(S.cfg),ex={},fw={};
  for(const t of liveOf(S.tx)){if(!t.note||!sm[t.sub]||sm[t.sub].cat.type!=kind||t.refundOf)continue;const n=norm(t.note);
    if(n==k)ex[t.sub]=(ex[t.sub]||0)+1;else if(w.length>=3&&n.split(/\s+/)[0]==w)fw[t.sub]=(fw[t.sub]||0)+1}
  for(const m of[ex,fw]){const e=Object.entries(m).sort((a,b)=>b[1]-a[1]),tot=e.reduce((a,x)=>a+x[1],0);if(e.length&&e[0][1]/tot>=.6)return sm[e[0][0]]}
  return null}
function paintPick(btn,sid){const s=sid&&subsMap(S.cfg)[sid];btn.className='pickbtn'+(s?' on':'');btn.style.cssText=s?catColor(s.cat):'';
  btn.innerHTML=s?`<span class="cico">${catIcon(s.cat)}</span><span class="pt"><small>${esc(cleanCat(s.cat.name))}</small><b>${esc(s.name)}</b></span>`:'<span class="ph">— stuknij, żeby wybrać pozycję —</span>'}
function setMs(sid,hint){$('ms').value=sid||'';paintPick($('msBtn'),sid);$('msHint').textContent=hint||'';updSplit()}
function renderPick(){const q=norm($('pq').value),kind=P.kind,cats=S.cfg.cats.filter(c=>c.type==kind),sm=subsMap(S.cfg);
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
let SP=[];
const splitLeft=()=>calcAmt($('ma').value)-SP.reduce((a,x)=>a+Math.max(0,calcAmt(x.amt)),0);
function updSplit(){const on=SP.length>0;$('splitWrap').hidden=!on;$('splitBtn').hidden=on||!!S.edit||S.etype=='tr';
  if(on){const left=splitLeft();$('msHint').textContent=`na tę pozycję zostaje ${zl(left)}`;$('msHint').style.color=left>0?'':'var(--exp)'}else $('msHint').style.color=''}
function renderSplit(){$('splitRows').innerHTML=SP.map((x,i)=>`<div class="srow"><button type="button" class="pickbtn" data-i="${i}"></button><input inputmode="decimal" placeholder="0,00" value="${esc(x.amt)}" data-i="${i}" aria-label="Kwota tej pozycji" autocomplete="off"><button type="button" class="x" data-x="${i}" aria-label="Usuń tę pozycję">×</button></div>`).join('');
  $('splitRows').querySelectorAll('.pickbtn').forEach(b=>paintPick(b,SP[+b.dataset.i].sub));
  if(!SP.length&&!$('ms').value)$('msHint').textContent='';updSplit()}

function openTx(id,pre){if(guard())return;
  const t=id?liveById(id):null;
  const sp=t&&(t.slip?t:t.slipOf?liveById(t.slipOf):null);
  if(sp&&sp.slip&&incById(sp.slip)){ask({title:'Wpis z paska pensji',text:`${sp.note} – ${sp.date.split('-').reverse().join('.')}\nTen wpis powstał z paska. Zmień go w pasku, a wszystko przeliczy się samo.`,ok:'Otwórz pasek',cancel:'Zamknij',alt:'Usuń wpis'}).then(r=>{if(r=='alt')delTx(id);else if(r)openSlip(sp.slip,sp.date.slice(0,7))});return}
  if(t&&t.type=='adj'){ask({title:'Wyrównanie salda',text:`${accN(t.acc)}: ${t.amount>0?'+':''}${zl(t.amount)} (${t.date})\nUsunąć to wyrównanie?`,ok:'Usuń',danger:true}).then(r=>{if(r)delTx(id)});return}
  if(t&&t.ppk){ask({title:t.note,text:`${accN(t.acc)}: ${zl(t.amount)} (${t.date.split('-').reverse().join('.')})\nTa wpłata jest powiązana z pensją. Żeby ją zmienić, odznacz i odhacz pensję ponownie w 📌 Stałe.`,ok:'Usuń wpłatę',cancel:'Zamknij',danger:true}).then(r=>{if(r)delTx(id)});return}
  if(t&&(t.type=='inv'||t.type=='invs')){ask({title:t.type=='inv'?'Zakup inwestycji':'Sprzedaż inwestycji',text:`${t.note} – ${zl(t.amount)}\nTen starszy wpis usuniesz w zakładce Oszczędności.`,ok:'Przejdź',cancel:'Zamknij'}).then(r=>{if(r){S.tab='sav';render()}});return}
  S.edit=t?id:null;S.refEdit=!!t?.refundOf;S.autoSub=false;SP=[];
  const ao=accOpts().map(g=>`<optgroup label="${esc(g.group)}">${g.items.map(a=>`<option value="${a[0]}">${esc(a[1])}</option>`).join('')}</optgroup>`).join('');$('mc').innerHTML=ao;$('mto').innerHTML=ao;
  $('ms').value='';setType(t?t.type:(pre?.type||'exp'));
  $('mw').value=(t&&t.who)||S.who;
  $('ma').value=t?f2(t.amount):'';$('maSum').textContent='';
  $('md').value=t?t.date:(td().startsWith(S.ym)?td():S.ym+'-01');
  if(t){$('mc').value=t.acc;$('mto').value=t.to||''}else{const last=ls.get('mw_acc_'+S.who);if(last&&S.cfg.accs.some(a=>a.id==last))$('mc').value=last}
  if(pre?.from){$('mc').value=pre.from;const c=S.cfg.accs.find(a=>a.grp=='cur'&&!a.archived);if(c)$('mto').value=c.id}
  if(pre?.to)$('mto').value=pre.to;
  if($('mto').value==$('mc').value){const o=[...$('mto').options].find(o=>o.value!=$('mc').value);if(o){if(pre?.to)$('mc').value=o.value;else $('mto').value=o.value}}
  if(!t)autoWho();
  $('mn').value=t?stripFx(t.note):'';
  setMs(t?t.sub:'');renderSplit();S.coinOn=true;updCoin();
  if(!$('fxc').options.length)$('fxc').innerHTML=CURS.map(([c,n])=>`<option value="${c}">${c} – ${esc(n)}</option>`).join('');
  $('ma2').value=t?.amount2?f2(t.amount2):'';S.fxOpen=!!t?.fxCur;$('fxc').value=t?.fxCur||'EUR';$('fxa').value=t?.fxAmt?f2(t.fxAmt):'';updFx();
  const left=t&&t.type=='exp'?t.amount-refundsOf(t.id).reduce((a,x)=>a+x.amount,0):0;
  $('shRef').hidden=!(left>0);
  $('shTitle').textContent=t?(t.refundOf?'Edytuj zwrot':'Edytuj transakcję'):pre?.from?'Wypłata na konto bieżące':pre?.type=='tr'?'Wpłata':'Nowa transakcja';$('shDel').hidden=!t;
  $('sheet').hidden=false;if(!t)setTimeout(()=>$('ma').focus(),80)}
const closeSheet=()=>{$('sheet').hidden=true;S.edit=null;S.refEdit=false;SP=[];closePick()};
async function saveTx(){if(guard())return;
  const type=S.etype,amount=calcAmt($('ma').value),date=$('md').value;
  if(amount<=0)return toast('Podaj kwotę większą od zera','bad');
  if(!isDate(date))return toast('Wybierz datę','bad');
  if(type!='tr'&&!$('ms').value)return toast('Wybierz pozycję budżetu','bad');
  if(type=='tr'&&$('mc').value==$('mto').value)return toast('Wybierz dwa różne konta','bad');
  const cA=accCur($('mc').value),cB=type=='tr'?accCur($('mto').value):cA,two=cA!=cB,amount2=two?calcAmt($('ma2').value):0;
  if(two&&amount2<=0)return toast(`Podaj, ile wpłynie na drugie konto (${curSym(cB)})`,'bad');
  const fxAmt=type!='tr'&&cA=='PLN'&&S.fxOpen&&!S.refEdit?calcAmt($('fxa').value):0,fxCur=fxAmt>0?$('fxc').value:'';
  const auto=two?'💱 kurs '+fxRate(cA,amount,cB,amount2):fxCur?`💱 ${money(fxAmt,fxCur)} · kurs ${fxRate(fxCur,fxAmt,'PLN',amount)}`:'';
  const parts=type=='tr'||S.edit?[]:SP.map(x=>({sub:x.sub,amount:calcAmt(x.amt)}));
  if(parts.some(x=>!x.sub))return toast('Wybierz pozycję w każdym wierszu paragonu','bad');
  if(parts.some(x=>x.amount<=0))return toast('Podaj kwotę w każdym wierszu paragonu','bad');
  const main=amount-parts.reduce((a,x)=>a+x.amount,0);
  if(main<=0)return toast('Pozycje paragonu przekraczają jego kwotę','bad');
  ls.set('mw_acc_'+S.who,$('mc').value);
  const old=S.edit?liveById(S.edit):null,id=old?old.id:'t'+rid();
  const base={type,date,acc:$('mc').value,to:type=='tr'?$('mto').value:'',who:type=='tr'?S.who:$('mw').value,note:[stripFx($('mn').value.trim()),auto].filter(Boolean).join(' · '),deleted:false,ts:Date.now()};
  const body={...base,amount:main,sub:type=='tr'?'':$('ms').value};
  if(two)body.amount2=amount2;else if(old?.amount2)body.amount2=null;
  if(fxCur){body.fxCur=fxCur;body.fxAmt=fxAmt}else if(old?.fxCur){body.fxCur='';body.fxAmt=0}
  if(old)for(const k of['fixedId','refundOf','split'])if(old[k])body[k]=old[k];
  const g=parts.length?'g'+rid():'';if(g)body.split=g;
  const coin=!old&&type=='exp'&&S.coinOn&&S.coin;
  closeSheet();
  const ym=date.slice(0,7),ok=await putTx(ym,id,body);
  if(ok)for(const x of parts)putTx(ym,'t'+rid(),{...base,amount:x.amount,sub:x.sub,split:g});
  if(ok&&coin)putTx(ym,'t'+rid(),{type:'tr',amount:coin.v,date,sub:'',acc:coin.r.from,to:coin.r.to,who:base.who,note:'🪙 drobne',roundOf:id,deleted:false,ts:Date.now()});
  if(ok&&old&&old.date.slice(0,7)!=ym)await putTx(old.date.slice(0,7),id,{deleted:true,moved:true});
  const sm2=subsMap(S.cfg);if(ok&&!old&&kotki.mode=='lots'&&[body.sub,...parts.map(x=>x.sub)].some(x=>isTreat(sm2[x]?.name)))setTimeout(()=>toast(treatJoke(Math.floor(Date.now()/1000))),1900);
  if(ok){const n=parts.length+1;const M=v=>money(v,cA);toast(old?'Zapisano zmiany':parts.length?`Dodano paragon ${M(amount)} (${n} ${plu(n,'pozycja','pozycje','pozycji')})${coin?' · 🪙 +'+M(coin.v):''}`:'Dodano '+M(amount)+(coin?' · 🪙 +'+M(coin.v):''));if(ym!=S.ym){S.ym=ym;render()}}}
async function delTx(id){if(guard())return;const t=liveById(id);if(!t)return;const ym=t.date.slice(0,7),linked=liveOf(S.tx).filter(x=>x.ppkOf===id||x.refundOf===id||x.slipOf===id);
  closeSheet();if(!await putTx(ym,id,{deleted:true}))return;
  linked.forEach(x=>putTx(x.date.slice(0,7),x.id,{deleted:true}));
  toast('Usunięto '+am(Math.abs(t.amount),t.acc)+(linked.length?linked.some(x=>x.slipOf)?' razem z potrąceniami i PPK':linked.some(x=>x.ppk)?' razem z wpłatami PPK':' razem ze zwrotami':''),'',{label:'Cofnij',fn:()=>{putTx(ym,id,{deleted:false});linked.forEach(x=>putTx(x.date.slice(0,7),x.id,{deleted:false}))}})}
async function markRefund(id){const t=liveById(id);if(!t)return;const done=refundsOf(id).reduce((a,x)=>a+x.amount,0),left=t.amount-done;
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

$('msBtn').onclick=()=>openPick($('ms').value,sid=>{S.autoSub=false;setMs(sid)});
$('pkBody').onclick=e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.sid){const cb=P.cb;closePick();if(cb)cb(b.dataset.sid)}
  else if(b.dataset.cat){P.cat=b.dataset.cat;renderPick()}
  else if(b.dataset.back){P.cat=null;renderPick()}};
$('pq').oninput=()=>{P.cat=null;renderPick()};
$('pkClose').onclick=closePick;$('pick').onclick=e=>{if(e.target===$('pick'))closePick()};
$('mn').oninput=()=>{if(S.edit||S.etype=='tr'||($('ms').value&&!S.autoSub))return;const s=noteSub($('mn').value,pickKind());
  if(s){S.autoSub=true;setMs(s.id,'💡 podpowiedziane po notatce – stuknij, żeby zmienić')}else if(S.autoSub){S.autoSub=false;setMs('')}};
$('ma').oninput=()=>{const v=$('ma').value;$('maSum').textContent=/\d\s*[+\-−]\s*\d/.test(v)?'= '+am(calcAmt(v),$('mc').value):'';updSplit();updCoin();updFx()};
$('ma2').oninput=$('fxa').oninput=$('fxc').onchange=$('mto').onchange=()=>updFx();
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

/* ---------- budget / accounts actions ---------- */
function setPlan(sid,v){if(guard())return;const ym=S.ym,val=pg(v);
  if(((S.plans[ym]||{})[sid]||0)===val)return;
  merge(doc(PLC(),ym),{[sid]:val})}
async function copyPlan(){if(guard())return;const[y,m]=S.ym.split('-').map(Number);const prev=m==1?(y-1)+'-12':y+'-'+p2(m-1);const src=S.plans[prev];
  if(!src||!Object.values(src).some(v=>v))return toast('Poprzedni miesiąc nie ma planu','bad');
  if(!await ask({title:'Skopiować plan?',text:`Plan z miesiąca ${MN[+prev.slice(5)-1]} zastąpi plan na ${MN[m-1]}.`,ok:'Kopiuj'}))return;
  if(w(setDoc(doc(PLC(),S.ym),{...src})))toast('Skopiowano plan')}
async function recon(id){if(guard())return;const before=S.ym+'-32',cur=balance(S.cfg,liveOf(S.tx),id,before),a=S.cfg.accs.find(x=>x.id==id);
  const r=await ask({title:'Wyrównaj saldo',text:`${a.name}\nW aplikacji na koniec miesiąca: ${money(cur,CUR(a))}`,fields:[{id:'v',label:`Rzeczywiste saldo (${curSym(CUR(a))})`,type:'decimal',value:f2(cur)}],ok:'Wyrównaj'});
  if(!r||!r.v.trim())return;const d=pg(r.v)-cur;if(!d)return toast('Saldo się zgadza');
  const date=td().startsWith(S.ym)?td():S.ym+'-'+p2(daysIn(S.ym));
  if(await putTx(S.ym,'t'+rid(),{type:'adj',amount:d,date,sub:'',acc:id,to:'',who:S.who,note:'Wyrównanie salda',deleted:false,ts:Date.now()}))toast('Dodano wyrównanie '+(d>0?'+':'')+money(d,CUR(a)))}
async function addAcc(){if(guard())return;const r=await ask({title:'Nowe konto',fields:[{id:'n',label:'Nazwa'},{id:'g',label:'Rodzaj',type:'select',value:S.accTab,options:Object.entries(GRPN)},{id:'w',label:'Czyje',type:'select',value:S.who,options:[['Mati','Mati'],['Wercia','Wercia'],['Wspólne','Wspólne']]},{id:'c',label:'Waluta',type:'select',value:'PLN',options:CUR_OPTS}],ok:'Dodaj'});
  if(!r||!r.n.trim())return;const a={id:'a'+rid(),name:r.n.trim(),grp:r.g,owner:r.w,open:0,...(r.c!='PLN'?{cur:r.c}:{})};S.cfg.accs.push(a);S.accTab=r.g;render();saveAcc(a)}
async function editAcc(id){if(guard())return;const a=S.cfg.accs.find(x=>x.id==id);
  const used=liveOf(S.tx).some(t=>t.acc===id||t.to===id);
  const r=await ask({title:'Edytuj konto',fields:[{id:'n',label:'Nazwa',value:a.name},{id:'g',label:'Rodzaj',type:'select',value:a.grp,options:Object.entries(GRPN)},{id:'w',label:'Czyje',type:'select',value:accOwner(a),options:[['Mati','Mati'],['Wercia','Wercia'],['Wspólne','Wspólne']]},{id:'c',label:'Waluta',type:'select',value:CUR(a),options:CUR_OPTS},{id:'o',label:`Saldo początkowe – przed pierwszą transakcją (${curSym(CUR(a))})`,type:'decimal',value:f2(a.open)}],alt:used?null:'Usuń konto'});
  if(!r)return;
  if(r=='alt'){if(!await ask({title:'Usunąć konto?',text:a.name,ok:'Usuń',danger:true}))return;S.cfg.accs=S.cfg.accs.filter(x=>x.id!=id);render();delAccDb(id);return}
  if(r.c!=CUR(a)&&used&&!await ask({title:'Zmienić walutę konta?',text:`${a.name}: ${CUR(a)} → ${r.c}\nKwoty nie zostaną przeliczone – zmieni się tylko waluta, w której są pokazane wszystkie wpisy tego konta.`,ok:'Zmień walutę'}))return;
  if(r.n.trim())a.name=r.n.trim();a.owner=r.w;a.open=pg(r.o);if(r.c!=CUR(a))a.cur=r.c;
  if(r.g!=a.grp){a.grp=r.g;S.accTab=r.g;toEndOfKind(a);toast('Konto przeniesione do: '+ACCTAB[r.g])}else saveAcc(a);render()}
async function addSub(ci){if(guard())return;const r=await ask({title:'Nowa pozycja',text:catL(S.cfg.cats[ci]),fields:[{id:'n',label:'Nazwa'}],ok:'Dodaj'});
  if(!r||!r.n.trim())return;const c=S.cfg.cats[ci],s={id:'s'+rid(),name:r.n.trim()};c.subs.push(s);render();saveSub(c,s)}
async function renSub(ci,si){if(guard())return;const s=S.cfg.cats[ci].subs[si];const r=await ask({title:'Zmień nazwę',fields:[{id:'n',label:'Nazwa',value:s.name}]});
  if(!r||!r.n.trim())return;s.name=r.n.trim();render();saveSub(S.cfg.cats[ci],s)}
async function delSub(ci,si){if(guard())return;const c=S.cfg.cats[ci],s=c.subs[si];
  const txs=S.tx.filter(t=>t.sub===s.id),live=liveOf(txs),fx=(S.cfg.fixed||[]).filter(f=>f.sub===s.id),plans=Object.entries(S.plans).filter(([ym,p])=>p[s.id]);
  if(!live.length&&!fx.length){if(!await ask({title:'Usunąć pozycję?',text:s.name,ok:'Usuń',danger:true}))return;
    for(const[ym]of plans)w(updateDoc(doc(PLC(),ym),{[s.id]:deleteField()}));c.subs.splice(si,1);render();delSubDb(c,s);return}
  const opts=S.cfg.cats.filter(k=>k.type==c.type).map(k=>({group:catL(k),items:k.subs.filter(x=>x.id!==s.id).map(x=>[x.id,x.name])})).filter(g=>g.items.length);
  if(!opts.length)return ask({title:'Nie można usunąć',text:'Nie ma innej pozycji tego rodzaju, do której można przenieść wpisy.',ok:'OK',cancel:'Zamknij'});
  const plf=(n,a,b,c)=>n+' '+(n==1?a:(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20))?b:c);
  const parts=[live.length?plf(live.length,'wpis','wpisy','wpisów'):'',fx.length?plf(fx.length,'opłata stała','opłaty stałe','opłat stałych'):'',plans.length?`plan z ${plans.length} mies.`:''].filter(Boolean).join(', ');
  const r=await ask({title:'Połącz z inną pozycją',text:`„${s.name}” jest w użyciu (${parts}).\nWybierz pozycję, do której wszystko przeniosę. Potem „${s.name}” zostanie usunięta.`,
    fields:[{id:'t',label:'Przenieś do',type:'select',value:'',options:[['','— wybierz —'],...opts]}],ok:'Połącz i usuń',danger:true});
  if(!r)return;if(!r.t)return toast('Wybierz pozycję docelową','bad');
  const tgt=r.t,byM={};
  txs.forEach(t=>{const ym=t.date.slice(0,7);(byM[ym]=byM[ym]||{})[t.id]={sub:tgt}});
  for(const[ym,m]of Object.entries(byM))merge(doc(MC(),ym),{tx:m});
  for(const[ym,p]of plans)w(updateDoc(doc(PLC(),ym),{[tgt]:(p[tgt]||0)+p[s.id],[s.id]:deleteField()}));
  for(const f of fx){f.sub=tgt;saveFixed(f)}
  const ix=c.subs.indexOf(s);if(ix>=0)c.subs.splice(ix,1);render();delSubDb(c,s);
  toast('Przeniesiono do: '+(subsMap(S.cfg)[tgt]?.name||''))}
const HUE_N={150:'Miętowy',205:'Błękitny',28:'Brzoskwiniowy',340:'Różowy',265:'Lawendowy',48:'Miodowy',185:'Morski',12:'Łososiowy',295:'Fiołkowy',95:'Pistacjowy',228:'Chabrowy',320:'Malinowy',62:'Cytrynowy',168:'Szałwiowy',245:'Niebieski',0:'Koralowy'};
async function editCat(ci){if(guard())return;const c=S.cfg.cats[ci],empty=!c.subs.length;
  const r=await ask({title:'Kategoria '+(ci+1),fields:[{id:'n',label:'Nazwa (numer dodaje się sam)',value:cleanCat(c.name)},{id:'i',label:'Ikonka (emoji, np. 🍕 🐱 ✈️)',value:catIcon(c)},{id:'h',label:'Kolor',type:'select',value:String(catHue(c,ci)),options:HUES.map(h=>[String(h),HUE_N[h]])}],alt:empty?'Usuń kategorię':null});
  if(!r)return;
  if(r=='alt'){if(!await ask({title:'Usunąć kategorię?',text:cleanCat(c.name),ok:'Usuń',danger:true}))return;S.cfg.cats.splice(ci,1);render();delCatDb(c.id);S.cfg.cats.forEach(saveCat);return}
  if(!r.n.trim())return;c.name=cleanCat(r.n);c.icon=(r.i||'').trim().slice(0,8);c.hue=+r.h;render();saveCat(c)}
async function addCat(){if(guard())return;
  const r=await ask({title:'Nowa kategoria',fields:[{id:'n',label:'Nazwa',ph:'np. EDUKACJA'},{id:'t',label:'Rodzaj',type:'select',value:'exp',options:[['exp','Wydatki'],['inc','Przychody']]}],ok:'Dodaj'});
  if(!r||!r.n.trim())return;const c={id:'c'+rid(),name:cleanCat(r.n),type:r.t,hue:freeHue(S.cfg.cats),subs:[]};S.cfg.cats.push(c);render();saveCat(c);toast('Dodano kategorię – dodaj do niej pozycje')}
const ACCTAB={cur:'Konta bieżące',sub:'Subkonta',sav:'Oszczędności',inv:'Inwestycje'};
/* an account whose kind changed goes to the end of its new kind; every account whose position moved is saved */
function toEndOfKind(a){const A=S.cfg.accs,old=A.map(x=>x.id);A.splice(A.indexOf(a),1);
  let k=-1;A.forEach((x,i)=>{if(x.grp==a.grp)k=i});A.splice(k+1,0,a);
  A.forEach((x,i)=>{if(old[i]!==x.id||x===a)saveAcc(x)})}
function setAccTab(k){S.accTab=k;render()}
/* swap an account with its neighbour of the same kind (archived accounts are skipped) */
function moveAcc(id,d){if(guard())return;const A=S.cfg.accs,i=A.findIndex(a=>a.id==id);if(i<0)return;
  let j=i+d;while(j>=0&&j<A.length&&(A[j].grp!=A[i].grp||A[j].archived))j+=d;if(j<0||j>=A.length)return;
  [A[i],A[j]]=[A[j],A[i]];render();saveAcc(A[i]);saveAcc(A[j])}
function moveCat(ci,d){if(guard())return;const j=ci+d;if(j<0||j>=S.cfg.cats.length)return;const a=S.cfg.cats;[a[ci],a[j]]=[a[j],a[ci]];render();saveCat(a[ci]);saveCat(a[j])}
function setWho(v){S.who=v;ls.set('mw_who',v);render()}

/* ---------- fixed costs ---------- */
const fixedPaid=(fid,ym)=>liveOf(S.tx).find(t=>t.fixedId===fid&&t.date.startsWith(ym));
async function editFixed(fid,kind){if(guard())return;
  const f=fid?S.cfg.fixed.find(x=>x.id==fid):null;kind=f?(f.kind||'exp'):(kind||'exp');const inc=kind=='inc';
  const invAccs=S.cfg.accs.filter(a=>a.grp=='inv'&&!a.archived);
  const fields=[
    {id:'n',label:'Nazwa',value:f?.name||'',ph:inc?'np. Pensja Mati':'np. Czynsz'},
    {id:'a',label:inc?'Przybliżona kwota (zł)':'Kwota (zł)',type:'decimal',value:f?f2(f.amount):'',ph:'0,00'},
    {id:'d',label:inc?'Zwykle wpływa do dnia (1–31)':'Termin – dzień miesiąca (1–31)',type:'int',value:f?.day||10},
    {id:'s',label:'Pozycja budżetu',type:'select',value:f?.sub||'',options:[['','— wybierz —'],...subOpts(kind)]},
    {id:'c',label:inc?'Wpływa na konto':'Płacone z konta',type:'select',value:f?.acc||S.cfg.accs.find(a=>a.grp=='cur')?.id,options:accOpts()}];
  if(inc){fields.push({id:'v',label:'Kwota co miesiąc',type:'select',value:f?.vary?'1':'0',options:[['0','Podpowiadaj ostatnią kwotę'],['1','Zawsze inna – wpisuję od zera']]});
    fields.push({id:'p',label:'Wpłaty PPK przy tej pensji',type:'select',value:f?.ppk||'',options:[['','Bez PPK'],...invAccs.map(a=>[a.id,a.name])]})}
  const r=await ask({title:f?(inc?'Edytuj przychód stały':'Edytuj opłatę stałą'):(inc?'Nowy przychód stały':'Nowa opłata stała'),fields,ok:f?'Zapisz':'Dodaj',alt:f?(inc?'Usuń przychód':'Usuń opłatę'):null});
  if(!r)return;
  if(r=='alt'){if(!await ask({title:inc?'Usunąć przychód stały?':'Usunąć opłatę stałą?',text:f.name+'\nWpisy już zapisane w rejestrze zostaną.',ok:'Usuń',danger:true}))return;S.cfg.fixed=S.cfg.fixed.filter(x=>x.id!=fid);render();delFixedDb(fid);return}
  const amount=pg(r.a),day=Math.round(pnum(r.d));
  if(!r.n.trim())return toast('Podaj nazwę','bad');
  if(amount<=0&&!(inc&&r.v=='1'))return toast('Podaj kwotę większą od zera','bad');
  if(day<1||day>31)return toast('Dzień miesiąca musi być od 1 do 31','bad');
  if(!r.s)return toast('Wybierz pozycję budżetu','bad');
  const body={id:f?.id||'f'+rid(),name:r.n.trim(),amount,day,sub:r.s,acc:r.c,kind};
  if(inc){body.vary=r.v=='1';body.ppk=r.p||''}
  let tgt=f;if(f)Object.assign(f,body);else{tgt=body;S.cfg.fixed.push(body)}
  render();saveFixed(tgt)}
const lastOf=(f,pred)=>liveOf(S.tx).filter(t=>pred(t)&&t.date<S.ym+'-01').sort((a,b)=>b.date.localeCompare(a.date))[0];
async function toggleFixed(fid){if(guard())return;const f=S.cfg.fixed.find(x=>x.id==fid),paid=fixedPaid(fid,S.ym),inc=f.kind=='inc';
  const src=inc&&!paid&&incs().find(x=>x.fixed==fid);if(src)return openSlip(src.id);
  if(paid){const ym=paid.date.slice(0,7),linked=liveOf(S.tx).filter(t=>t.ppkOf===paid.id||t.slipOf===paid.id);
    if(await putTx(ym,paid.id,{deleted:true})){linked.forEach(t=>putTx(t.date.slice(0,7),t.id,{deleted:true}));
      toast('Odznaczono: '+f.name,'',{label:'Cofnij',fn:()=>{putTx(ym,paid.id,{deleted:false});linked.forEach(t=>putTx(t.date.slice(0,7),t.id,{deleted:false}))}})}return}
  const due=fixedDate(f,S.ym),date=td().startsWith(S.ym)?td():due;
  if(!inc){
    const r=await ask({title:'Zapłacono: '+f.name,text:'Kwotę możesz zmienić, jeśli w tym miesiącu rachunek był inny.',fields:[
      {id:'a',label:'Kwota (zł)',type:'decimal',value:f2(f.amount)},
      {id:'d',label:'Data zapłaty',type:'date',value:date},
      {id:'c',label:'Z konta',type:'select',value:f.acc,options:accOpts()}],ok:'Odhacz'});
    if(!r)return;const amt=pg(r.a);
    if(amt<=0)return toast('Podaj kwotę większą od zera','bad');
    if(!isDate(r.d)||!r.d.startsWith(S.ym))return toast('Data musi być w miesiącu '+MN[+S.ym.slice(5)-1].toLowerCase(),'bad');
    S.justChecked=f.id;
    if(await putTx(S.ym,'t'+rid(),{type:'exp',amount:amt,date:r.d,sub:f.sub,acc:r.c,to:'',who:S.who,note:f.name,fixedId:f.id,deleted:false,ts:Date.now()})){
      const exps=S.cfg.fixed.filter(x=>(x.kind||'exp')=='exp'),all=exps.every(x=>x.id==f.id||fixedPaid(x.id,S.ym));
      if(all&&exps.length>1)celebrate(CELEBRATE.allPaid(S.who));else toast('Zapłacono: '+f.name+' ✓')}
    return}
  // income: suggest last month's actual amount; PPK contributions from the payslip
  const last=lastOf(f,t=>t.fixedId===f.id),lastOwn=f.ppk?lastOf(f,t=>t.ppk=='own'&&t.acc===f.ppk&&t.fixedRef===f.id):null,lastEmp=f.ppk?lastOf(f,t=>t.ppk=='emp'&&t.acc===f.ppk&&t.fixedRef===f.id):null;
  const sug=f.vary?'':f2(last?last.amount:f.amount);
  const fields=[{id:'a',label:'Kwota, która wpłynęła (zł)',type:'decimal',value:sug,ph:'z aplikacji banku'},
    {id:'d',label:'Data wpływu',type:'date',value:date},
    {id:'c',label:'Na konto',type:'select',value:f.acc,options:accOpts()}];
  if(f.ppk){fields.push({id:'o',label:'PPK – moja wpłata (zł, z paska wypłaty)',type:'decimal',value:lastOwn?f2(lastOwn.amount):'',ph:'np. 180'});
    fields.push({id:'e',label:'PPK – wpłata pracodawcy (zł)',type:'decimal',value:lastEmp?f2(lastEmp.amount):'',ph:'np. 135'})}
  const r=await ask({title:'Wpłynęło: '+f.name,text:(last?`W poprzednim wpływie: ${zl(last.amount)}. `:'')+'Wpisz dokładną kwotę z banku.'+(f.ppk?'\nWpłaty PPK nie liczą się do budżetu – trafiają na konto „'+accN(f.ppk)+'”.':''),fields,ok:'Odhacz'});
  if(!r)return;const amt=pg(r.a);
  if(amt<=0)return toast('Podaj kwotę, która wpłynęła','bad');
  if(!isDate(r.d)||!r.d.startsWith(S.ym))return toast('Data musi być w miesiącu '+MN[+S.ym.slice(5)-1].toLowerCase(),'bad');
  S.justChecked=f.id;const iid='t'+rid();
  if(await putTx(S.ym,iid,{type:'inc',amount:amt,date:r.d,sub:f.sub,acc:r.c,to:'',who:S.who,note:f.name,fixedId:f.id,deleted:false,ts:Date.now()})){
    if(f.ppk){const own=pg(r.o),emp=pg(r.e),base={date:r.d,sub:'',acc:f.ppk,to:'',who:S.who,deleted:false,ts:Date.now(),ppkOf:iid,fixedRef:f.id};
      if(own>0)putTx(S.ym,'t'+rid(),{...base,type:'inc',amount:own,note:'PPK – moja wpłata',ppk:'own'});
      if(emp>0)putTx(S.ym,'t'+rid(),{...base,type:'inc',amount:emp,note:'PPK – wpłata pracodawcy',ppk:'emp'})}
    toast(`Wpłynęło: ${f.name} ${zl(amt)} ✓`)}}

function calendarExport(){if(!S.cfg?.fixed?.some(f=>(f.kind||'exp')=='exp'))return toast('Najpierw dodaj opłaty stałe','bad');
  const blob=new Blob([buildIcs(S.cfg.fixed,td())],{type:'text/calendar'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download='oplaty-stale.ics';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000);
  ask({title:'Dodaj do kalendarza',text:'Otwórz pobrany plik „oplaty-stale.ics” i wybierz „Dodaj wszystkie” (iPhone) albo kalendarz, do którego mają trafić.\n\nKażda opłata pojawi się co miesiąc w dniu terminu, z przypomnieniem dzień wcześniej o 18:00.\n\nJeśli zmienisz opłaty, usuń stare wydarzenia i dodaj plik ponownie.',ok:'Rozumiem',cancel:'Zamknij'})}
function goFixed(){S.ym=td().slice(0,7);S.tab='fix';window.scrollTo(0,0);render()}

/* ---------- investments ---------- */
/* old investments module (first app version): shown read-only, can only be deleted together with its register entries */
async function delInv(iid){if(guard())return;const it=S.inv[iid];if(!it)return;const lots=Object.values(it.lots||{}).filter(l=>!l.deleted);
  if(!await ask({title:'Usunąć starszy wpis inwestycji?',text:it.name+(lots.length?`\nRazem z ${lots.length} zakupami i sprzedażami. Powiązane wpisy w rejestrze kont też zostaną usunięte.`:''),ok:'Usuń',danger:true}))return;
  for(const l of lots)if(l.txId){const t=liveById(l.txId);if(t)await putTx(t.date.slice(0,7),t.id,{deleted:true})}
  w(deleteDoc(doc(INV(),iid)));toast('Usunięto '+it.name)}

/* ---------- investment accounts ---------- */
/* contributed = opening balance + money moved in − money moved out; value change = sum of value updates (adj) */
function invAccStats(cfg,tx,id,before){const a=cfg.accs.find(x=>x.id==id);let paid=a?.open||0,chg=0,last=null,own=0,emp=0;
  for(const t of tx){if(t.date>=before)continue;
    if(t.acc===id){if(t.type=='adj'){chg+=t.amount;if(!last||t.date>last)last=t.date}else if(t.type=='inc'||t.type=='invs'){paid+=t.amount;if(t.ppk=='own')own+=t.amount;if(t.ppk=='emp')emp+=t.amount}else paid-=t.amount}
    if(t.type=='tr'&&t.to===id)paid+=t.amount}
  const value=paid+chg;return{paid,chg,value,pct:paid>0?chg/paid*100:null,last,own,emp}}
async function updateValue(id){if(guard())return;const a=S.cfg.accs.find(x=>x.id==id),tom=addDays(td(),1),cur=balance(S.cfg,liveOf(S.tx),id,tom);
  const r=await ask({title:'Aktualna wartość: '+a.name,text:`W aplikacji: ${money(cur,CUR(a))}\nWpisz, ile jest teraz warte konto w aplikacji brokera. Różnicę zapiszę jako zysk albo stratę (nie wpływa na wydatki).`,fields:[{id:'v',label:`Wartość dziś (${curSym(CUR(a))})`,type:'decimal',value:f2(cur)}],ok:'Zapisz wartość'});
  if(!r||!r.v.trim())return;const d=pg(r.v)-cur;if(!d)return toast('Wartość się zgadza');
  const ym=td().slice(0,7),tid='t'+rid();
  if(await putTx(ym,tid,{type:'adj',val:true,amount:d,date:td(),sub:'',acc:id,to:'',who:S.who,note:'Zmiana wartości',deleted:false,ts:Date.now()}))
    toast(`${d>0?'Zysk':'Strata'} ${money(Math.abs(d),CUR(a))} zapisany`,'',{label:'Cofnij',fn:()=>putTx(ym,tid,{deleted:true})})}

/* ---------- savings goals as envelopes: money in savings + investment accounts is assigned to goals ---------- */
const goalAlloc=g=>g.alloc??g.saved??0;
const goalOwner=g=>g.owner||'Wspólne';
const poolNow=(cfg,tx,owner)=>cfg.accs.filter(a=>(a.grp=='sav'||a.grp=='inv')&&isP(a)&&(!owner||accOwner(a)==owner)).reduce((s,a)=>s+balance(cfg,tx,a.id,addDays(td(),1)),0);
function goalProgress(g,cfg,tx,today){const saved=goalAlloc(g);
  const pct=g.target?Math.max(0,saved/g.target*100):0,left=Math.max(0,g.target-saved);
  let months=null,perMonth=null;
  if(g.deadline&&left>0){const[y,m]=g.deadline.split('-').map(Number),[cy,cm]=today.split('-').map(Number);months=Math.max(1,(y-cy)*12+(m-cm)+1);perMonth=Math.ceil(left/months)}
  return{saved,pct,left,months,perMonth,done:saved>=g.target&&g.target>0}}
const unallocated=owner=>poolNow(S.cfg,liveOf(S.tx),owner)-Object.values(S.goals).filter(g=>goalOwner(g)==owner).reduce((a,g)=>a+goalAlloc(g),0);
async function editGoal(gid,owner){if(guard())return;const g=gid?S.goals[gid]:null;owner=g?goalOwner(g):(owner||'Wspólne');
  const r=await ask({title:g?'Edytuj cel':'Nowy cel (koperta)',text:g?'':`Cel to „koperta”: przydzielacie do niej część oszczędności (${owner=='Wspólne'?'wspólnych':owner=='Mati'?'Matiego':'Werci'}).`,fields:[
    {id:'n',label:'Na co oszczędzacie?',value:g?.name||'',ph:'np. Wakacje 2027'},
    {id:'t',label:'Ile potrzebujecie (zł)',type:'decimal',value:g?f2(g.target):'',ph:'np. 6000'},
    {id:'d',label:'Do kiedy (miesiąc, opcjonalnie)',type:'month',value:g?.deadline||''},
    {id:'o',label:'Czyj cel',type:'select',value:owner,options:[['Mati','Mati'],['Wercia','Wercia'],['Wspólne','Wspólne']]}],
    ok:g?'Zapisz':'Dodaj cel',alt:g?'Usuń cel':null});
  if(!r)return;
  if(r=='alt'){if(!await ask({title:'Usunąć cel?',text:`${g.name}\nPrzydzielone ${zl(goalAlloc(g))} wróci do puli „do przydzielenia”.`,ok:'Usuń',danger:true}))return;const keep=clone(g);w(deleteDoc(doc(GOALS(),gid)));toast('Usunięto cel','',{label:'Cofnij',fn:()=>w(setDoc(doc(GOALS(),gid),keep))});return}
  const target=pg(r.t);if(!r.n.trim())return toast('Podaj nazwę celu','bad');if(target<=0)return toast('Podaj kwotę celu','bad');
  const body={name:r.n.trim(),target,deadline:/^\d{4}-\d{2}$/.test(r.d)?r.d:'',owner:r.o};
  const id=gid||'g'+rid();if(!g)body.alloc=0,body.ts=Date.now();
  merge(doc(GOALS(),id),body);toast(g?'Zapisano cel':'Dodano cel: '+body.name)}
async function allocGoal(gid,dir){if(guard())return;const g=S.goals[gid],have=goalAlloc(g),own=goalOwner(g),free=unallocated(own);
  if(dir>0&&free<=0)return ask({title:'Brak wolnych pieniędzy',text:`Wszystkie ${own=='Wspólne'?'wspólne oszczędności':'oszczędności ('+own+')'} są już przydzielone do celów. Wpłaćcie coś na takie konto albo zabierzcie z innego celu.`,ok:'OK',cancel:'Zamknij'});
  const sug=dir>0?Math.max(0,Math.min(free,g.target-have)):have;
  const r=await ask({title:(dir>0?'Przydziel do: ':'Zabierz z: ')+g.name,text:dir>0?`Do przydzielenia: ${zl(free)}`:`W kopercie: ${zl(have)}`,fields:[{id:'v',label:'Kwota (zł)',type:'decimal',value:sug?f2(sug):''}],ok:dir>0?'Przydziel':'Zabierz'});
  if(!r)return;const v=pg(r.v);if(v<=0)return;
  if(dir>0&&v>free)return toast('Możesz przydzielić najwyżej '+zl(free),'bad');
  if(dir<0&&v>have)return toast('W kopercie jest tylko '+zl(have),'bad');
  const nv=have+dir*v;merge(doc(GOALS(),gid),{alloc:nv,saved:nv});
  if(dir>0&&nv>=g.target&&have<g.target){setTimeout(()=>celebrate(CELEBRATE.goal(S.who,g.name)),150);return}
  toast(`${dir>0?'Przydzielono':'Zabrano'} ${zl(v)}`,'',{label:'Cofnij',fn:()=>merge(doc(GOALS(),gid),{alloc:have,saved:have})})}
async function setSavTarget(){if(guard())return;const r=await ask({title:'Ile chcecie odkładać co miesiąc?',text:'Liczy się wszystko, co przybyło na kontach oszczędnościowych i inwestycjach w danym miesiącu. Wpisz 0, żeby wyłączyć.',fields:[{id:'v',label:'Kwota miesięcznie (zł)',type:'decimal',value:S.savTarget?f2(S.savTarget):'',ph:'np. 2000'}]});
  if(!r)return;merge(H,{savTarget:Math.max(0,pg(r.v))});toast('Zapisano cel miesięczny')}
function setSub(k){S.sub=k;render()}
/* bulk reconcile screen in the Accounts tab */
const recAccs=()=>{const o={cur:0,sub:1,sav:2,inv:3},cur=(S.recScope||'cur')=='cur';return S.cfg.accs.filter(a=>!a.archived&&(cur?a.grp=='cur'||a.grp=='sub':a.grp=='sav'||a.grp=='inv')).slice().sort((a,b)=>o[a.grp]-o[b.grp])};
function setRecScope(k){recAccs().forEach(a=>{const el=$('rv_'+a.id);if(el)S.recVals[a.id]=el.value});S.recScope=k;render()}
function openRecon(scope){if(guard())return;S.recon=true;S.recVals={};S.recScope=scope||'cur';window.scrollTo(0,0);render()}
function closeRecon(){S.recon=false;render()}
function recRead(all){const tx=liveOf(S.tx),tom=addDays(td(),1),list=all?S.cfg.accs.filter(a=>!a.archived):recAccs();
  return list.map(a=>{const el=$('rv_'+a.id),app=balance(S.cfg,tx,a.id,tom),raw=(el?el.value:(S.recVals[a.id]||'')).trim();return{a,app,filled:raw!=='',real:raw===''?app:pg(raw)}})}
function recSum(){recAccs().forEach(a=>{const el=$('rv_'+a.id);if(el)S.recVals[a.id]=el.value});const r=recRead(),rp=r.filter(x=>isP(x.a)),app=rp.reduce((s,x)=>s+x.app,0),real=rp.reduce((s,x)=>s+x.real,0),n=r.filter(x=>x.filled).length,d=real-app;
  $('recApp').textContent=zl(app);$('recReal').textContent=zl(real);$('recN').textContent=n?`uzupełniono ${n} z ${r.length}`:'nic jeszcze nie wpisano';
  const el=$('recDiff');el.textContent=(d>0?'+':'')+zl(d);el.className='num '+(d>0?'t-inc':d<0?'t-exp':'');
  r.forEach(x=>{const c=$('rd_'+x.a.id);if(c){const dd=x.real-x.app;c.textContent=x.filled&&dd?(dd>0?'+':'')+money(dd,CUR(x.a)):'';c.className='rdiff '+(dd>0?'t-inc':'t-exp')}})}
async function applyRecon(){recAccs().forEach(a=>{const el=$('rv_'+a.id);if(el)S.recVals[a.id]=el.value});const r=recRead(true).filter(x=>x.filled&&x.real!==x.app);
  if(!r.length)return toast('Wszystko się zgadza – nic do zmiany');
  const ops=planRecon(r.map(x=>({id:x.a.id,d:x.real-x.app,inv:x.a.grp=='inv',cur:CUR(x.a)})));
  const lines=ops.map(o=>o.kind=='tr'?`⇄ ${accN(o.from)} → ${accN(o.to)}: ${am(o.amount,o.from)}`:o.kind=='val'?`📈 ${accN(o.acc)}: zmiana wartości ${o.amount>0?'+':''}${am(o.amount,o.acc)}`:`⚖️ ${accN(o.acc)}: wyrównanie ${o.amount>0?'+':''}${am(o.amount,o.acc)}`).join('\n');
  const tr=ops.filter(o=>o.kind=='tr').length,adj=ops.filter(o=>o.kind=='adj').length;
  if(!await ask({title:'Zapisać te zmiany?',text:lines+`\n\n${tr?'Przelewy (⇄) przenoszą pieniądze między kontami i nie wpływają na budżet. ':''}${adj?'Wyrównania (⚖️) to różnica, której nie da się wyjaśnić przelewem – też nie liczą się do wydatków. ':''}`,ok:'Zapisz'}))return;
  const ym=td().slice(0,7),date=td(),ids=[];
  for(const o of ops){const id='t'+rid();ids.push(id);
    const base={date,sub:'',who:S.who,deleted:false,ts:Date.now()};
    putTx(ym,id,o.kind=='tr'?{...base,type:'tr',amount:o.amount,acc:o.from,to:o.to,note:'Wyrównanie sald – przeniesienie'}:{...base,type:'adj',amount:o.amount,acc:o.acc,to:'',note:o.kind=='val'?'Zmiana wartości':'Wyrównanie salda',...(o.kind=='val'?{val:true}:{})})}
  S.recon=false;render();
  toast(`Zapisano ${ops.length} ${ops.length==1?'zmianę':ops.length<5?'zmiany':'zmian'}`,'',{label:'Cofnij',fn:()=>ids.forEach(id=>putTx(ym,id,{deleted:true}))})}
/* savings / investment accounts managed from the Savings tab */
async function addSavAcc(owner){if(guard())return;
  const r=await ask({title:'Nowe konto – '+owner,fields:[{id:'n',label:'Nazwa',ph:owner=='Wspólne'?'np. Fundusz wakacyjny':'np. Konto oszczędnościowe '+owner}, {id:'g',label:'Rodzaj',type:'select',value:'sav',options:[['sav','Oszczędności (stała kwota)'],['inv','Inwestycje / IKE / IKZE (zmienna wartość)']]},{id:'c',label:'Waluta',type:'select',value:'PLN',options:CUR_OPTS}],ok:'Dodaj konto'});
  if(!r||!r.n.trim())return;const a={id:'a'+rid(),name:r.n.trim(),grp:r.g,owner,open:0,...(r.c!='PLN'?{cur:r.c}:{})};S.cfg.accs.push(a);render();saveAcc(a);toast('Dodano konto: '+a.name)}
async function editSavAcc(id){if(guard())return;const a=S.cfg.accs.find(x=>x.id==id);
  const r=await ask({title:'Konto: '+a.name,fields:[{id:'n',label:'Nazwa',value:a.name},{id:'g',label:'Rodzaj',type:'select',value:a.grp,options:[['sav','Oszczędności (stała kwota)'],['inv','Inwestycje / IKE / IKZE (zmienna wartość)']]},{id:'w',label:'Czyje',type:'select',value:accOwner(a),options:[['Mati','Mati'],['Wercia','Wercia'],['Wspólne','Wspólne']]},{id:'c',label:'Waluta',type:'select',value:CUR(a),options:CUR_OPTS}],alt:'Usuń konto'});
  if(!r)return;if(r=='alt')return removeSavAcc(id);
  if(r.c!=CUR(a)&&liveOf(S.tx).some(t=>t.acc===id||t.to===id)&&!await ask({title:'Zmienić walutę konta?',text:`${a.name}: ${CUR(a)} → ${r.c}\nKwoty nie zostaną przeliczone – zmieni się tylko waluta, w której są pokazane.`,ok:'Zmień walutę'}))return;
  if(r.n.trim())a.name=r.n.trim();a.grp=r.g;a.owner=r.w;if(r.c!=CUR(a))a.cur=r.c;render();saveAcc(a)}
async function removeSavAcc(id){const a=S.cfg.accs.find(x=>x.id==id),tx=liveOf(S.tx),tom=addDays(td(),1),bal=balance(S.cfg,tx,id,tom),own=accOwner(a);
  const others=S.cfg.accs.filter(x=>x.id!=id&&!x.archived&&(x.grp=='sav'||x.grp=='inv')&&CUR(x)==CUR(a));
  const pref=others.find(x=>accOwner(x)==own&&x.grp=='sav'&&/oszcz/i.test(x.name))||others.find(x=>accOwner(x)==own&&x.grp=='sav')||others.find(x=>accOwner(x)==own)||others.find(x=>x.grp=='sav');
  let target=null;
  if(bal!==0){if(!pref)return ask({title:'Nie można usunąć',text:'Na tym koncie są pieniądze, a nie ma innego konta oszczędnościowego, na które można je przenieść.',ok:'OK',cancel:'Zamknij'});
    const r=await ask({title:'Usunąć konto „'+a.name+'”?',text:`Na koncie jest ${money(bal,CUR(a))}. Przeniosę tę kwotę na wybrane konto. Historia wpłat zostanie zachowana.`,fields:[{id:'t',label:'Przenieś pieniądze na',type:'select',value:pref.id,options:[...['Mati','Wercia','Wspólne'].map(o=>({group:o,items:others.filter(x=>accOwner(x)==o).map(x=>[x.id,x.name])})).filter(g=>g.items.length)]}],ok:'Przenieś i usuń',danger:true});
    if(!r)return;target=r.t}
  else if(!await ask({title:'Usunąć konto „'+a.name+'”?',text:'Konto jest puste. Historia zostanie zachowana.',ok:'Usuń',danger:true}))return;
  const ym=td().slice(0,7);
  if(target)putTx(ym,'t'+rid(),bal>0?{type:'tr',amount:bal,date:td(),sub:'',acc:id,to:target,who:S.who,note:'Zamknięcie konta '+a.name,deleted:false,ts:Date.now()}:{type:'tr',amount:-bal,date:td(),sub:'',acc:target,to:id,who:S.who,note:'Zamknięcie konta '+a.name,deleted:false,ts:Date.now()});
  const used=S.tx.some(t=>t.acc===id||t.to===id)||a.open;
  if(used){a.archived=true;saveAcc(a)}else{S.cfg.accs=S.cfg.accs.filter(x=>x.id!=id);delAccDb(id)}
  render();toast(target?`Usunięto konto. ${money(Math.abs(bal),CUR(a))} → ${accN(target)}`:'Usunięto konto')}

/* ---------- backup ---------- */
async function exportJson(){if(!S.cfg)return;
  const data=JSON.stringify({format:'budzet-mw-2',exported:new Date().toISOString(),cfg:S.cfg,savTarget:S.savTarget,tx:S.tx,plans:S.plans,inv:S.inv,goals:S.goals,slips:S.slips},null,1);
  const name='budzet-kopia-'+td()+'.json',blob=new Blob([data],{type:'application/json'});
  const file=typeof File=='function'?new File([blob],name,{type:'application/json'}):null;
  const mobile=matchMedia('(pointer:coarse)').matches;
  if(mobile&&file&&navigator.canShare&&navigator.canShare({files:[file]})){
    try{await navigator.share({files:[file],title:'Kopia budżetu'});markBackup();toast('Kopia zapisana ✓')}
    catch(e){if(e?.name!='AbortError'){err(e);downloadBlob(blob,name);markBackup()}}
    return}
  downloadBlob(blob,name);markBackup();toast('Pobrano kopię ✓')}
function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}
const META=()=>doc(H,'meta','backup');
function markBackup(){w(setDoc(META(),{at:Date.now(),who:S.who}))}
async function writeTxs(list){const by={};list.forEach(([id,t])=>{const ym=t.date.slice(0,7);(by[ym]=by[ym]||{})[id]=t});
  for(const ym of Object.keys(by).sort())merge(doc(MC(),ym),{tx:by[ym]});return true}
async function writePlans(map){for(const[ym,d]of Object.entries(map)){if(Object.keys(d).length)merge(doc(PLC(),ym),d)}return true}
/* fuzzy name matching for transaction-list imports: words without brackets/punctuation */
const toks=n=>new Set(String(n||'').toLowerCase().replace(/\(.*?\)/g,' ').replace(/^\s*\d+\s*[.)]\s*/,'').split(/[^0-9a-ząćęłńóśźż+-]+/i).filter(w=>w.length>=3&&!['oraz','dla','the'].includes(w)));
const simTok=(a,b)=>{const A=toks(a),B=toks(b);if(!A.size||!B.size)return 0;let k=0;A.forEach(w=>{if(B.has(w))k++});return k/Math.min(A.size,B.size)};
function matchSub(cfg,catName,subName,type){const want=type=='inc'?'inc':'exp';let best=null;
  for(const c of cfg.cats){if(c.type!=want)continue;const cs=simTok(c.name,catName);
    for(const x of c.subs){const exact=x.name.trim().toLowerCase()==subName.trim().toLowerCase();const sc=exact?10:simTok(x.name,subName)+(cs>=.5?.5:0);
      if(!best||sc>best.sc)best={sc,sub:x,cat:c,exact}}}
  return best&&(best.exact||best.sc>=1.1)?best:null}
/* rows without an id get one from their content (plus a counter for identical rows), so loading the same file twice adds nothing */
const hashId=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(36)};
async function importTxList(o){const cfg=S.cfg,list=(o.tx||[]).filter(t=>isDate(t.date)&&t.amount>0&&['inc','exp','tr'].includes(t.type));
  const acc=n=>cfg.accs.find(a=>a.name.trim().toLowerCase()==String(n||'').trim().toLowerCase());
  const newAccs=[...new Set(list.flatMap(t=>[t.acc,t.to]).filter(n=>n&&!acc(n)))];
  const mapped=[],fuzzy=new Map(),missing=new Map();
  for(const t of list){let sub='';if(t.type!='tr'&&t.sub){const m=matchSub(cfg,t.cat,String(t.sub),t.type);
      if(m){sub=m.sub.id;if(!m.exact)fuzzy.set(t.sub,m.sub.name)}else missing.set(t.sub,t.cat)}
    mapped.push({t,sub})}
  const n=list.length,inc=list.filter(t=>t.type=='inc').reduce((a,t)=>a+t.amount,0),exp=list.filter(t=>t.type=='exp').reduce((a,t)=>a+t.amount,0);
  const dates=list.map(t=>t.date).sort();
  const trW=n==1?'transakcja':(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20))?'transakcje':'transakcji';let text=`${n} ${trW} z okresu ${dates[0].split('-').reverse().join('.')}–${dates.at(-1).split('-').reverse().join('.')}\nprzychody ${zl(inc)} · wydatki ${zl(exp)}`;
  if(fuzzy.size)text+=`\n\nDopasowane do Waszych pozycji:\n`+[...fuzzy].map(([a,b])=>`• ${a} → ${b}`).join('\n');
  if(missing.size)text+=`\n\nNowe pozycje (zostaną dodane):\n`+[...missing].map(([a,c])=>`• ${a} (${cleanCat(c)})`).join('\n');
  if(newAccs.length)text+=`\n\nNowe konta (zostaną dodane): ${newAccs.join(', ')}`;
  text+='\n\nTransakcje zostaną dopisane. Wczytanie tego samego pliku drugi raz niczego nie zdubluje.';
  if(!await ask({title:'Wczytać transakcje?',text,ok:'Wczytaj'}))return;
  for(const name of newAccs){const a={id:'a'+rid(),name,grp:'cur',open:0};cfg.accs.push(a);saveAcc(a)}
  for(const[name,catName]of missing){const want=list.find(t=>t.sub==name).type=='inc'?'inc':'exp';
    let c=cfg.cats.filter(k=>k.type==want).map(k=>({k,s:simTok(k.name,catName)})).sort((a,b)=>b.s-a.s)[0];
    let k=c&&c.s>=.5?c.k:null;if(!k){k={id:'c'+rid(),name:cleanCat(catName)||'Inne',type:want,hue:freeHue(cfg.cats),subs:[]};cfg.cats.push(k);saveCat(k)}
    const x={id:'s'+rid(),name,};k.subs.push(x);saveSub(k,x);mapped.forEach(m=>{if(m.t.sub==name&&m.t.type!='tr')m.sub=x.id})}
  const seen={},idOf=t=>{if(t.id)return t.id;const k=[t.date,t.type,t.amount,t.cat,t.sub,t.acc,t.to,t.note,t.who].join('|');seen[k]=(seen[k]||0)+1;return'b'+hashId(k+'#'+seen[k])};
  await writeTxs(mapped.map(({t,sub})=>[idOf(t),{type:t.type,amount:t.amount,date:t.date,sub,acc:acc(t.acc)?.id||'',to:t.type=='tr'?(acc(t.to)?.id||''):'',who:t.who||'',note:t.note||'',deleted:false,ts:Date.now()}]));
  render();toast(`Wczytano: ${n} ${trW} ✓`)}
async function importFile(file){if(guard())return;let o;
  try{o=JSON.parse(await file.text())}catch(e){return ask({title:'To nie jest plik kopii',text:'Wybierz plik .json pobrany przyciskiem „Pobierz kopię”.',ok:'OK',cancel:'Zamknij'})}
  if(o&&o.format=='budzet-mw-tx'&&Array.isArray(o.tx))return importTxList(o);
  const isNew=o&&o.cfg&&Array.isArray(o.tx),isOld=o&&Array.isArray(o.categories)&&Array.isArray(o.transactions);
  if(!isNew&&!isOld)return ask({title:'Nie rozpoznaję tego pliku',text:'To nie jest kopia budżetu z tej ani ze starej wersji aplikacji.',ok:'OK',cancel:'Zamknij'});
  const n=isNew?o.tx.filter(t=>!t.deleted).length:o.transactions.length;
  if(!await ask({title:'Wczytać kopię?',text:`Znaleziono ${n} transakcji.\n${isNew?'Konta, pozycje budżetu i opłaty stałe zostaną zastąpione tymi z kopii.':'Brakujące konta i pozycje zostaną dopisane.'} Transakcje o tym samym numerze zostaną nadpisane, reszta zostaje.`,ok:'Wczytaj'}))return;
  toast('Wczytywanie…');
  try{let ok;
    if(isNew){S.cfg=clone(o.cfg);S.cfg.fixed=S.cfg.fixed||[];S.cfg.round=S.cfg.round||[];S.cfg.incs=S.cfg.incs||[];if(o.savTarget!=null)S.savTarget=o.savTarget;await saveCfg();
      ok=await writeTxs(o.tx.filter(t=>isDate(t.date)).map(t=>{const{id,...b}=t;return[id||('t'+rid()),b]}));
      ok=(await writePlans(o.plans||{}))&&ok;
      for(const[id,it]of Object.entries(o.inv||{}))ok=(await putInv(id,it))&&ok;
      for(const[id,g]of Object.entries(o.goals||{}))merge(doc(GOALS(),id),g);
      for(const[ym,sl]of Object.entries(o.slips||{}))merge(doc(SLIPS(),ym),{s:sl})}
    else{const sm={},am={};S.cfg.cats.forEach(c=>c.subs.forEach(s=>sm[s.name]=s.id));S.cfg.accs.forEach(a=>am[a.name]=a.id);
      o.categories.forEach(c=>{const bil=c.typ=='BILANS_KONTA'||c.typ=='BILANS_OSZCZ';(c.podkategorie||[]).forEach(nm=>{
        if(bil){if(!am[nm]){am[nm]='a'+rid();S.cfg.accs.push({id:am[nm],name:nm,grp:c.typ=='BILANS_KONTA'?'cur':'sav',open:0})}}
        else if(!sm[nm]){let k=S.cfg.cats.find(x=>cleanCat(x.name)==cleanCat(c.nazwa));if(!k){k={id:'c'+rid(),name:cleanCat(c.nazwa),type:c.typ=='PRZYCHOD'?'inc':'exp',hue:freeHue(S.cfg.cats),subs:[]};S.cfg.cats.push(k)}sm[nm]='s'+rid();k.subs.push({id:sm[nm],name:nm})}})});
      const ob=o.openingBalancesBase||o.openingBalancesJan||{};S.cfg.accs.forEach(a=>{if(ob[a.name]!==undefined)a.open=Math.round(ob[a.name]*100)});
      await saveCfg();
      ok=await writeTxs(o.transactions.filter(t=>isDate(t.date)).map(t=>['imp_'+t.id,{type:t.type=='Przychód'?'inc':t.type=='Wydatek'?'exp':'tr',amount:Math.round(Math.abs(t.amount)*100),date:t.date,sub:sm[t.subcategory]||'',acc:am[t.account]||'',to:am[t.targetAccount]||'',who:(/^\[(Mati|Wercia)\]/.exec(t.note||'')||[])[1]||'',note:String(t.note||'').replace(/^\[(Mati|Wercia)\]\s*/,''),deleted:false,ts:Date.now()}]));
      const pp=o.plansByYear||{[String(new Date().getFullYear())]:o.plans||{}},pm={};
      Object.keys(pp).forEach(y=>Object.keys(pp[y]||{}).forEach(m=>{const d={};Object.entries(pp[y][m]||{}).forEach(([nm,v])=>{if(sm[nm]&&v)d[sm[nm]]=Math.round(v*100)});pm[y+'-'+p2(+m+1)]=d}));
      ok=(await writePlans(pm))&&ok}
    toast(`Wczytano ${n} transakcji`)}
  catch(e){err(e);toast('Błąd wczytywania: '+(e.message||e),'bad')}}

function backupH(){if(!S.tx.length)return'';const b=S.backup,days=b?Math.floor((Date.now()-b.at)/864e5):null;
  if(b&&days<30)return'';
  return`<button class="alert info" onclick="exportJson()"><b>💾 ${b?`Ostatnia kopia danych: ${days} dni temu`:'Nie zrobiliście jeszcze kopii danych'}</b><span class="mini">Stuknij, żeby zapisać kopię na telefonie (np. w Plikach / na Dysku). Zajmie to chwilę.</span></button>`}

/* ---------- register search & filters ---------- */
/* amount filters typed into the search (zł): ">200", "<50", ">=100", "100-300"; the rest of the text is searched as words */
function amtQuery(raw){const f=[];
  const q=raw.toLowerCase().replace(/(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)/g,(m,a,b)=>{const lo=pg(a),hi=pg(b);if(lo>hi)return m;f.push(v=>v>=lo&&v<=hi);return' '})
    .replace(/([<>]=?)\s*(\d+(?:[.,]\d+)?)/g,(m,op,a)=>{const x=pg(a);f.push(op=='>'?v=>v>x:op=='>='?v=>v>=x:op=='<'?v=>v<x:v=>v<=x);return' '});
  return{q:q.trim(),f}}
function txMatches(t,sm,F,ym,AQ){
  if(F.scope=='m'&&!t.date.startsWith(ym))return false;
  if(F.scope=='y'&&!t.date.startsWith(ym.slice(0,4)))return false;
  if(F.type&&!(t.type==F.type||(F.type=='inv'&&t.type=='invs')))return false;
  if(F.who&&t.who!==F.who)return false;
  if(F.acc&&t.acc!==F.acc&&t.to!==F.acc)return false;
  if(F.cat&&sm[t.sub]?.cat.id!==F.cat)return false;
  if(AQ.f.some(fn=>!fn(Math.abs(t.amount))))return false;
  const q=AQ.q;if(!q)return true;
  const s=sm[t.sub],amt=(Math.abs(t.amount)/100).toFixed(2);
  const hay=[t.note,s?.name,s?cleanCat(s.cat.name):'',accN(t.acc),t.to?accN(t.to):'',t.who,t.date,t.date.split('-').reverse().join('.'),amt,amt.replace('.',','),amt.replace(/\.00$/,''),
    {exp:'wydatek',inc:'przychód',tr:'przelew',inv:'zakup inwestycja',invs:'sprzedaż inwestycja',adj:'wyrównanie'}[t.type],t.refundOf?'zwrot':'',t.split?'paragon':''].join(' ').toLowerCase();
  return q.split(/\s+/).every(w=>hay.includes(w.replace(',','.'))||hay.includes(w))}
function txRowH(t,sm,rf={},cn={}){const M=v=>am(v,t.acc),k=t.type,sg=k=='inc'||k=='invs'?'+':k=='exp'||k=='inv'?'−':k=='adj'?(t.amount>=0?'+':'−'):'';
  const cls=k=='invs'?'inv':k,s=sm[t.sub],c=s&&(k=='exp'||k=='inc')?s.cat:null;
  const title=t.ppk?t.note:k=='tr'?accN(t.acc)+' → '+accN(t.to):k=='adj'?(t.val?'Zmiana wartości inwestycji':'Wyrównanie salda'):k=='inv'?'Zakup: '+t.note:k=='invs'?'Sprzedaż: '+t.note:t.refundOf?'↩️ Zwrot · '+(s?.name||''):(t.fixedId?'📌 ':'')+(s?.name||'Bez pozycji');
  const ico=c?`<span class="tico" style="${catColor(c)}">${catIcon(c)}</span>`:`<span class="tico n">${t.ppk?'🏦':t.roundOf?'🪙':k=='tr'?'⇄':k=='adj'?(t.val?'📈':'⚖️'):k=='inv'?'📈':k=='invs'?'📉':'💠'}</span>`;
  return`<button class="tx" onclick="openTx('${t.id}')">${ico}<span class="info">${c?`<span class="tcat" style="${catColor(c)}">${esc(cleanCat(c.name))}</span>`:''}<b>${esc(title)}</b><span class="meta">${k=='tr'?'Przelew'+(t.amount2?' · wpłynęło '+am(t.amount2,t.to):''):esc(accN(t.acc))}${t.who?' · '+esc(t.who):''}${t.split?' · ✂️ paragon':''}</span>${t.note&&k!='adj'&&k!='inv'&&k!='invs'&&!t.ppk?`<div class="note">${esc(t.note)}</div>`:''}${rf[t.id]?`<div class="ref">↩️ zwrócono ${M(rf[t.id])} z ${M(t.amount)}</div>`:''}${cn[t.id]?`<div class="coinl">🪙 drobne +${M(cn[t.id].amount)} → ${esc(accN(cn[t.id].to))}</div>`:''}</span><span class="amt num t-${cls}">${sg}${M(Math.abs(t.amount))}</span></button>`}
function txListH(){const sm=subsMap(S.cfg),F=S.f,tx=liveOf(S.tx),AQ=amtQuery(F.q.trim());
  const l=tx.filter(t=>txMatches(t,sm,F,S.ym,AQ)).sort((a,b)=>b.date.localeCompare(a.date)||(b.ts||0)-(a.ts||0));
  const filtered=F.q||F.type||F.who||F.acc||F.cat||F.scope!='m',rf={};
  tx.forEach(t=>{if(t.refundOf)rf[t.refundOf]=(rf[t.refundOf]||0)+t.amount});
  /* drobne are shown under their expense (as their own row only when the expense is not on the list, or when filtering transfers) */
  const cn={},ids=new Set(l.map(t=>t.id));tx.forEach(t=>{if(t.roundOf&&ids.has(t.roundOf)&&F.type!='tr')cn[t.roundOf]=t});
  const lv=l.filter(t=>!(t.roundOf&&cn[t.roundOf]===t));
  if(!l.length)return filtered?catsEmpty('Nic nie znaleziono.<br>Zmień wyszukiwanie albo filtry.',1,'lupa'):catsEmpty('Brak transakcji w tym miesiącu.<br>Dodaj pierwszą przyciskiem ＋ w prawym dolnym rogu.',0,'box');
  let h='';
  if(filtered){const E={},I={},ad=(m,t,v)=>{const c=accCur(t.acc);m[c]=(m[c]||0)+v};
    l.forEach(t=>{if(t.type=='exp')ad(E,t,t.amount);else if(t.refundOf)ad(E,t,-t.amount);else if(t.type=='inc')ad(I,t,t.amount)});
    const sx=m=>((m.PLN?zl(m.PLN):'')+fxPlus({...m,PLN:0})).replace(/^ \+ /,''),e=sx(E),i=sx(I);
    h+=`<div class="fsum"><b>${lv.length} ${plu(lv.length,'wpis','wpisy','wpisów')}</b>${e?` · wydatki <b class="t-exp">${e}</b>`:''}${i?` · przychody <b class="t-inc">${i}</b>`:''}</div>`}
  const days={};lv.forEach(t=>(days[t.date]=days[t.date]||[]).push(t));
  const yr=F.scope!='m';
  h+=Object.entries(days).slice(0,400).map(([d,ts])=>{const dd=new Date(d+'T12:00:00').toLocaleDateString('pl-PL',yr?{weekday:'short',day:'numeric',month:'long',year:'numeric'}:{weekday:'long',day:'numeric',month:'long'});
    return`<div class="day">${esc(dd)}</div><div class="list">${ts.map(t=>txRowH(t,sm,rf,cn)).join('')}</div>`}).join('');
  return h}
let qT=null;
function setQ(v){S.f.q=v;clearTimeout(qT);qT=setTimeout(()=>{const el=$('txlist');if(el)el.innerHTML=txListH()},150)}
function setF(k,v){S.f[k]=v;if(document.activeElement?.id=='fq')document.activeElement.blur();render()}
function clearF(){S.f={q:'',type:'',who:'',acc:'',cat:'',scope:'m'};if(document.activeElement?.id=='fq')document.activeElement.blur();render()}

/* ---------- 💼 salaries (📌 Stałe → Pensje): income sources per person, a payslip per source and month ---------- */
const incs=()=>S.cfg.incs||[],incById=id=>incs().find(s=>s.id==id);
const slipOf=(ym,id)=>(S.slips[ym]||{})[id];
const putSlip=(ym,id,body)=>merge(doc(SLIPS(),ym),{s:{[id]:body}});
const saveInc=x=>merge(H,{incM:{[x.id]:strip(x,incs().indexOf(x))}});
const delIncDb=id=>w(updateDoc(H,{['incM.'+id]:deleteField()}));
const gr=v=>{const x=pg(v||'0');return isFinite(x)?x:0};
const fixSegH=()=>`<div class="seg seg2">${[['fix','📌 Opłaty i przychody'],['pay','💼 Pensje']].map(([k,l])=>`<button aria-pressed="${(S.fixSub||'fix')==k}" onclick="setFixSub('${k}')">${l}</button>`).join('')}</div>`;
function setFixSub(k){S.fixSub=k;S.slip=null;window.scrollTo(0,0);render()}
function setPayView(k){S.payView=k;render()}
const payTabH=T=>`<div class="ptbl">${[['Brutto / faktury',T.brutto],['ZUS (społeczne)',-T.zus],['Zdrowotna',-T.health],['Zaliczka na podatek',-T.tax],['PPK – moje wpłaty',-T.ppkOwn],['PPK – pracodawca (na PPK)',T.ppkEmp],['Potrącenia',-T.ded],['Netto na konto',T.net]].filter(([,v],i)=>v||i==0||i==7).map(([l,v],i,a)=>`<div class="r1${i==a.length-1?' tot':''}"><span>${l}</span><b class="num">${v<0?'−'+zl(-v):zl(v)}</b></div>`).join('')}${T.hours?`<div class="mini">${String(T.hours).replace('.',',')} h wpisanych godzin</div>`:''}</div>`;
function payH(){const y=S.ym.slice(0,4);
  return`<div class="seg" style="align-self:center">${[['m','Miesiąc'],['y','Rok '+y]].map(([k,l])=>`<button aria-pressed="${(S.payView||'m')==k}" onclick="setPayView('${k}')">${l}</button>`).join('')}</div>`+(S.payView=='y'?payYearH():payMonthH())}
function payMonthH(){const ym=S.ym,live=new Set(liveOf(S.tx).map(t=>t.id));let h='';
  const b2b=incs().filter(s=>s.kind=='b2b');
  if(b2b.length&&ym==td().slice(0,7)){const res=b2b.reduce((a,s)=>a+(slipOf(ym,s.id)?reserve(slipOf(ym,s.id)):0),0);
    h+=`<div class="note">📅 JDG: do 20. dnia miesiąca zapłać ZUS, zdrowotną i zaliczkę na podatek${res?` – według pasków ok. <b>${zl(res)}</b>`:''}.</div>`}
  for(const who of ['Mati','Wercia']){const list=incs().filter(s=>s.who==who);
    h+=`<div class="r1" style="padding:0 4px"><span class="h2" style="margin:0">💼 ${who}</span><button class="btn sm dark" onclick="editInc(null,'${who}')">+ Źródło dochodu</button></div>`;
    if(!list.length){h+=`<div class="mini" style="padding:0 6px">Dodaj pracodawcę albo zleceniodawcę. Co miesiąc wpiszesz pasek, a netto, potrącenia i PPK same trafią do budżetu.</div>`;continue}
    h+=`<div class="list">${list.map(s=>{const sl=slipOf(ym,s.id),ok=sl&&sl.booked&&live.has(sl.booked),b=s.kind=='b2b';
      return`<div class="acc"><div style="min-width:0;flex:1"><div class="r1"><b>${esc(s.name)}</b><button class="btn sm" style="padding:3px 9px" aria-label="Edytuj źródło dochodu" onclick="editInc('${s.id}')">⋯</button></div><div class="mini">${KINDS[s.kind]} · ${esc(accN(s.acc))}${s.ppk?' · PPK':''}</div>
        ${sl?`<div class="mini">${b?'faktury':'brutto'} <b style="color:var(--fg)">${zl(brutto(sl))}</b> · ${b?'na rękę':'netto'} <b style="color:var(--fg)">${zl(b?onHand(sl):sl.net)}</b> · ${ok?'<span class="t-inc">✓ w budżecie</span>':'<span class="t-exp">nie zaksięgowano</span>'}</div>`:`<div class="mini">Brak paska w tym miesiącu${s.day?` · wypłata zwykle do ${s.day}.`:''}</div>`}
        <div class="btns" style="gap:6px;margin-top:6px"><button class="chip" onclick="openSlip('${s.id}')">${sl?'📝 Pasek':'+ Wpisz pasek'}</button></div></div></div>`}).join('')}</div>`}
  const T=totals(Object.values(S.slips[ym]||{}));
  if(T.n)h+=`<section class="chart"><div class="ct"><b>Razem w miesiącu</b><span class="mini">${T.n} ${plu(T.n,'pasek','paski','pasków')} · ZUS, zdrowotna i podatek nie są wydatkami w budżecie</span></div>${payTabH(T)}</section>`;
  return h}
function payYearH(){const y=S.ym.slice(0,4),ms=Array.from({length:12},(_,i)=>y+'-'+p2(i+1)),rows=[];
  ms.forEach(m=>Object.entries(S.slips[m]||{}).forEach(([id,sl])=>rows.push({m,id,sl})));
  if(!rows.length)return catsEmpty(`Brak pasków w roku ${y}.<br>Wpisz pierwszy w widoku „Miesiąc”.`,0,'papers');
  const T=totals(rows.map(r=>r.sl)),nm=new Set(rows.map(r=>r.m)).size;
  let h=`<div class="kpis"><div class="kpi k-em"><div class="l">Netto ${y}</div><div class="v num">${zl(T.net)}</div><div class="s">średnio ${zl0(T.net/nm)}/mies.</div></div><div class="kpi k-sk"><div class="l">Brutto ${y}</div><div class="v num">${zl(T.brutto)}</div><div class="s">${nm} mies. z paskami</div></div></div>`;
  h+=chartBox('Netto miesiąc po miesiącu','wszystkie źródła razem',barsSvg(['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'],[{name:'Netto',color:C_INC,values:ms.map(m=>rows.filter(r=>r.m==m).reduce((a,r)=>a+(r.sl.net||0),0))}],{tipLabel:i=>MN[i]}));
  h+=`<section class="chart"><div class="ct"><b>Cały rok ${y}</b></div>${payTabH(T)}</section><div class="h2">Do sprawdzenia PIT-11</div>`;
  h+=[...new Set(rows.map(r=>r.id))].map(id=>{const list=rows.filter(r=>r.id==id).map(r=>r.sl),last=list[list.length-1],src=incById(id)||last,t=totals(list),b2b=src.kind=='b2b';
    const L=b2b?[['Przychód (faktury)',t.brutto],['Składki ZUS',t.zus],['Zdrowotna',t.health],['Podatek',t.tax]]
      :[['Przychód'+(t.ppkEmp?' (z PPK pracodawcy)':''),t.brutto+t.ppkEmp],['Koszty uzyskania',t.kup],['Składki ZUS',t.zus],['Zdrowotna',t.health],['Zaliczka na podatek',t.tax]];
    return`<section class="chart"><div class="ct"><b>${esc(src.name||'?')}</b><span class="mini">${KINDS[src.kind]||''} · ${esc(src.who||'')} · ${t.n} ${plu(t.n,'pasek','paski','pasków')}</span></div><div class="ptbl">${L.map(([l,v])=>`<div class="r1"><span>${l}</span><b class="num">${zl(v)}</b></div>`).join('')}</div>${b2b?'<div class="mini">JDG rozliczasz we własnym zeznaniu (PIT-36, PIT-36L albo PIT-28), nie z PIT-11.</div>':''}</section>`}).join('');
  return h+`<div class="mini" style="padding:0 4px">Liczone według miesiąca wypłaty. Porównaj z PIT-11 od pracodawcy – drobne różnice mogą wynikać z zaokrągleń.</div>`}
/* income source: name, person, kind of contract, account, budget position, PPK; then details used by the estimate */
async function editInc(id,who){if(guard())return;const s0=id?incById(id):null;who=s0?.who||who||S.who;
  const fixedInc=(S.cfg.fixed||[]).filter(f=>f.kind=='inc'),invAccs=S.cfg.accs.filter(a=>a.grp=='inv'&&!a.archived);
  const defSub=S.cfg.cats.filter(c=>c.type=='inc').flatMap(c=>c.subs).find(x=>new RegExp('pensja\\s+'+who,'i').test(x.name))?.id||'';
  const defPpk=S.cfg.accs.find(a=>a.grp=='inv'&&!a.archived&&/ppk/i.test(a.name)&&accOwner(a)==who)?.id||'';
  const r=await ask({title:s0?'Źródło dochodu':'Nowe źródło dochodu – '+who,fields:[
    {id:'n',label:'Pracodawca albo zleceniodawca',value:s0?.name||'',ph:'np. Szpital Wojewódzki'},
    {id:'k',label:'Rodzaj umowy',type:'select',value:s0?.kind||'uop',options:Object.entries(KINDS)},
    {id:'c',label:'Wpływa na konto',type:'select',value:s0?.acc||S.cfg.accs.find(a=>a.grp=='cur'&&accOwner(a)==who)?.id||'',options:accOpts()},
    {id:'s',label:'Pozycja budżetu (przychód)',type:'select',value:s0?.sub||defSub,options:[['','— wybierz —'],...subOpts('inc')]},
    {id:'d',label:'Wypłata zwykle do dnia (1–31)',type:'int',value:s0?.day||10},
    {id:'p',label:'PPK',type:'select',value:s0?s0.ppk||'':defPpk,options:[['','Bez PPK'],...invAccs.map(a=>[a.id,'Wpłaty na: '+a.name])]},
    {id:'f',label:'Połącz z przychodem stałym (📌)',type:'select',value:s0?.fixed||'',options:[['','— bez połączenia —'],...fixedInc.map(f=>[f.id,f.name])]}],
    ok:'Dalej',alt:s0?'Usuń źródło':null});
  if(!r)return;
  if(r=='alt'){if(!await ask({title:'Usunąć źródło dochodu?',text:s0.name+'\nZapisane paski i wpisy w rejestrze zostaną.',ok:'Usuń',danger:true}))return;
    S.cfg.incs=incs().filter(x=>x!==s0);render();delIncDb(s0.id);return toast('Usunięto źródło dochodu')}
  if(!r.n.trim())return toast('Podaj nazwę pracodawcy','bad');if(!r.s)return toast('Wybierz pozycję budżetu','bad');if(!r.c)return toast('Wybierz konto','bad');
  const day=Math.round(pnum(r.d))||10,k=r.k,P=v=>{const x=pnum(v);return isFinite(x)?x:0};
  const f2p=x=>String(x).replace('.',',');
  const det=k=='uop'?[{id:'kup',label:'Koszty uzyskania przychodu',type:'select',value:String(s0?.kup||250),options:[['250','Standardowe – 250 zł'],['300','Podwyższone (dojazd z innej miejscowości) – 300 zł']]},{id:'pit2',label:'PIT-2 złożony (ulga 300 zł miesięcznie)',type:'select',value:s0?.pit2===false?'0':'1',options:[['1','Tak'],['0','Nie']]}]
    :k=='zlec'?[{id:'kup',label:'Koszty uzyskania',type:'select',value:String(s0?.kup||20),options:[['20','20%'],['50','50% (prawa autorskie)']]},{id:'zus',label:'Składki ZUS',type:'select',value:s0?.zusOn===false?'0':'1',options:[['1','Tak, płacone ze zlecenia'],['0','Nie (np. student, inny tytuł)']]},{id:'pit2',label:'PIT-2 złożony u zleceniodawcy',type:'select',value:s0?.pit2?'1':'0',options:[['0','Nie'],['1','Tak']]}]
    :k=='dzielo'?[{id:'kup',label:'Koszty uzyskania',type:'select',value:String(s0?.kup||20),options:[['20','20%'],['50','50% (prawa autorskie)']]}]
    :[{id:'tf',label:'Forma podatku',type:'select',value:s0?.taxf||'skala',options:Object.entries(TAXF)},{id:'za',label:'Twój ZUS społeczny miesięcznie (zł)',type:'decimal',value:s0?.zusAmt?f2(s0.zusAmt):'',ph:'z PUE ZUS, np. 1926,76'},{id:'rr',label:'Stawka ryczałtu (%, tylko ryczałt)',type:'decimal',value:s0?.ryczRate?f2p(s0.ryczRate):'',ph:'np. 14'},{id:'ha',label:'Zdrowotna miesięcznie (zł, tylko ryczałt)',type:'decimal',value:s0?.healthAmt?f2(s0.healthAmt):'',ph:'np. 830,58'}];
  if(r.p&&k!='b2b'&&k!='dzielo')det.push({id:'po',label:'PPK – moja wpłata (% brutto)',type:'decimal',value:f2p(s0?.ppkOwnPct??2)},{id:'pe',label:'PPK – pracodawca (% brutto)',type:'decimal',value:f2p(s0?.ppkEmpPct??1.5)});
  const r2=await ask({title:'Szczegóły: '+r.n.trim(),text:'Służą tylko do „Podpowiedz z brutto” (szacunek). Zawsze możesz wpisać kwoty z paska.',fields:det,ok:s0?'Zapisz':'Dodaj'});
  if(!r2)return;
  const body={id:s0?.id||'i'+rid(),name:r.n.trim(),who,kind:k,acc:r.c,sub:r.s,day:Math.min(31,Math.max(1,day)),ppk:k=='b2b'||k=='dzielo'?'':r.p,fixed:r.f,dedSub:s0?.dedSub||{}};
  if(k=='uop'){body.kup=+r2.kup;body.pit2=r2.pit2=='1'}
  if(k=='zlec'){body.kup=+r2.kup;body.zusOn=r2.zus=='1';body.pit2=r2.pit2=='1'}
  if(k=='dzielo')body.kup=+r2.kup;
  if(k=='b2b'){body.taxf=r2.tf;body.zusAmt=gr(r2.za);body.ryczRate=P(r2.rr);body.healthAmt=gr(r2.ha)}
  if(body.ppk){body.ppkOwnPct=P(r2.po)||2;body.ppkEmpPct=P(r2.pe)||1.5}
  S.cfg.incs=incs();let x=s0;if(x)Object.assign(x,body);else{x=body;S.cfg.incs.push(x)}
  render();saveInc(x);toast(s0?'Zapisano źródło dochodu':'Dodano źródło dochodu 💼')}
/* the payslip editor (a page in 📌 Stałe) */
function openSlip(id,ym){if(guard())return;const src=incById(id);if(!src)return toast('Nie ma już tego źródła dochodu','bad');ym=ym||S.ym;
  const old=slipOf(ym,id),day=ym+'-'+p2(Math.min(src.day||10,daysIn(ym)));
  const d=old?clone(old):{comp:[{n:src.kind=='b2b'?'Faktura':'Wynagrodzenie zasadnicze',a:0,h:0}],zus:0,health:0,kup:0,tax:0,ppkOwn:0,ppkEmp:0,costs:0,ded:[],net:0,date:td().startsWith(ym)&&td()<day?td():day};
  d.comp=d.comp||[];d.ded=d.ded||[];
  S.slip={id,ym,d,isNew:!old};S.ym=ym;S.tab='fix';S.fixSub='pay';window.scrollTo(0,0);render()}
function closeSlip(){S.slip=null;render()}
function slipRead(){const d=S.slip.d,root=document.querySelector('.slip');if(!root)return d;
  root.querySelectorAll('[data-k]').forEach(el=>d[el.dataset.k]=gr(el.value));
  root.querySelectorAll('[data-c]').forEach(el=>{const c=d.comp[+el.dataset.c];if(!c)return;const f=el.dataset.f;c[f]=f=='a'?gr(el.value):f=='h'?(pnum(el.value)||0):el.value});
  root.querySelectorAll('[data-d]').forEach(el=>{const x=d.ded[+el.dataset.d];if(!x)return;const f=el.dataset.f;x[f]=f=='a'?gr(el.value):el.value});
  const dt=$('slDate');if(dt)d.date=dt.value;return d}
function slipCalc(){if(!S.slip||!$('slB'))return;const d=slipRead(),src=incById(S.slip.id);if(!src)return;
  const b=brutto(d),calc=calcNet(src,d);$('slB').textContent=zl(b);$('slNet').placeholder=f2(Math.max(0,calc));
  /* remembered budget position of a deduction with this name */
  document.querySelectorAll('.slip select[data-d]').forEach(el=>{const x=d.ded[+el.dataset.d],m=(src.dedSub||{})[(x?.n||'').trim().toLowerCase()];if(x&&!el.value&&m){el.value=m;x.sub=m}});
  let chk;
  if(src.kind=='b2b')chk=`Do odłożenia na ZUS, zdrowotną i podatek: <b>${zl(reserve(d))}</b><br>Na rękę po kosztach i daninach: <b>${zl(onHand(d))}</b>`;
  else if(d.net){const df=d.net-calc;chk=df==0?'<span class="t-inc">✓ Rachunek się zgadza</span>':`<span class="t-exp">⚠️ Różnica ${df>0?'+':'−'}${zl(Math.abs(df))}</span> – brutto minus składki, podatek, PPK i potrącenia daje ${zl(calc)}. Sprawdź kwoty z paska.`}
  else chk=`Wyliczone netto: <b>${zl(calc)}</b> – wpisz kwotę z banku, a sprawdzę rachunek.`;
  $('slChk').innerHTML=chk;
  const net=d.net||calc,ratio=b>0?net/b:0,hc=d.comp.filter(c=>+c.h>0&&c.a>0);
  $('slHr').innerHTML=hc.map(c=>`⏱️ ${esc(c.n||'Składnik')} (${String(c.h).replace('.',',')} h): ${zl(Math.round(c.a/c.h))} brutto · ok. ${zl(Math.round(c.a*ratio/c.h))} netto za godzinę`).join('<br>')}
function slipRow(kind,i){slipRead();const L=S.slip.d[kind];if(i==null)L.push(kind=='comp'?{n:'',a:0,h:0}:{n:'',a:0,sub:''});else L.splice(i,1);
  if(document.activeElement)document.activeElement.blur();render()}
function slipCopy(){const {id,ym}=S.slip,prev=Object.keys(S.slips).filter(m=>m<ym&&S.slips[m][id]).sort().pop();
  if(!prev)return toast('Brak wcześniejszego paska tego źródła','bad');
  const p=clone(S.slips[prev][id]),d=slipRead();
  Object.assign(d,{comp:p.comp||[],zus:p.zus||0,health:p.health||0,kup:p.kup||0,tax:p.tax||0,ppkOwn:p.ppkOwn||0,ppkEmp:p.ppkEmp||0,costs:p.costs||0,ded:p.ded||[],net:0,est:false});
  if(document.activeElement)document.activeElement.blur();render();toast('Skopiowano pasek z miesiąca: '+MN[+prev.slice(5)-1].toLowerCase()+'. Wpisz kwotę z banku.')}
function slipSuggest(){const {id,ym}=S.slip,src=incById(id),d=slipRead();if(brutto(d)<=0)return toast(src.kind=='b2b'?'Najpierw wpisz kwotę faktury':'Najpierw wpisz składniki brutto','bad');
  Object.assign(d,suggest(src,d,ytdOf(S.slips,id,ym)),{est:true});if(document.activeElement)document.activeElement.blur();render();toast('🧮 Wpisałem szacunek – sprawdź go z paskiem')}
function slipH(){const {id,ym,d}=S.slip,src=incById(id);if(!src){S.slip=null;return''}
  const b2b=src.kind=='b2b',V=v=>v?f2(v):'';
  const inp=(k,label,hint)=>`<label class="srow2"><span>${label}${hint?`<small>${hint}</small>`:''}</span><input class="planin" data-k="${k}" value="${V(d[k])}" placeholder="0,00" inputmode="decimal" autocomplete="off"></label>`;
  const sopt=sel=>subOpts('exp').map(g=>`<optgroup label="${esc(g.group)}">${g.items.map(([v,l])=>`<option value="${v}"${v==sel?' selected':''}>${esc(l)}</option>`).join('')}</optgroup>`).join('');
  let h=`<div class="slip" oninput="slipCalc()" onchange="slipCalc()"><div class="sl-h"><b>💼 ${esc(src.name)}</b><span class="mini">${KINDS[src.kind]} · ${src.who} · wypłata: ${MN[+ym.slice(5)-1].toLowerCase()} ${ym.slice(0,4)}</span></div>
    <div class="btns" style="gap:6px"><button class="chip" onclick="slipCopy()">⧉ Skopiuj z poprzedniego miesiąca</button><button class="chip" onclick="slipSuggest()">🧮 Podpowiedz z brutto</button></div>
    ${d.est?'<div class="note">🧮 To <b>szacunek</b> wyliczony z brutto. Sprawdź i popraw kwoty według paska z wypłaty.</div>':''}
    <div class="sl-sec">${b2b?'FAKTURY':'SKŁADNIKI (BRUTTO)'}</div>
    ${d.comp.map((c,i)=>`<div class="sl-row"><input data-c="${i}" data-f="n" value="${esc(c.n||'')}" placeholder="${b2b?'np. Faktura za październik':'np. Dyżury'}" aria-label="Nazwa składnika" autocomplete="off"><input class="planin" data-c="${i}" data-f="a" value="${V(c.a)}" placeholder="0,00" inputmode="decimal" aria-label="Kwota" autocomplete="off">${b2b?'':`<input class="planin hrs" data-c="${i}" data-f="h" value="${c.h?String(c.h).replace('.',','):''}" placeholder="godz." inputmode="decimal" aria-label="Godziny (opcjonalnie)" autocomplete="off">`}<button type="button" class="x" onclick="slipRow('comp',${i})" aria-label="Usuń składnik">×</button></div>`).join('')}
    <button class="btn sm" style="align-self:flex-start" onclick="slipRow('comp')">+ ${b2b?'faktura':'składnik'}</button>
    <div class="r1 sl-tot"><span>${b2b?'Razem faktury':'Brutto'}</span><b class="num" id="slB"></b></div>
    <div class="sl-sec">${b2b?'ZAPŁACISZ SAM':'SKŁADKI I PODATEK'}</div>
    ${b2b?inp('costs','Koszty firmy','np. leasing, sprzęt, księgowa')+inp('zus','Twój ZUS (społeczny)')+inp('health','Zdrowotna')+inp('tax','Podatek (zaliczka)')
      :inp('zus','ZUS (emerytalna, rentowa, chorobowa)')+inp('health','Zdrowotna')+inp('tax','Zaliczka na podatek')+inp('kup','Koszty uzyskania','tylko do PIT – nie zmniejszają wypłaty')}
    ${src.ppk&&!b2b?`<div class="sl-sec">PPK → ${esc(accN(src.ppk))}</div>${inp('ppkOwn','Moja wpłata','odejmuje się od wypłaty')}${inp('ppkEmp','Wpłata pracodawcy','dodatkowo, na konto PPK')}`:''}
    ${b2b?'':`<div class="sl-sec">POTRĄCENIA</div><div class="mini">Np. Multisport, ubezpieczenie grupowe. Trafią do budżetu jako wydatki w wybranej pozycji.</div>
    ${d.ded.map((x,i)=>`<div class="sl-ded"><div class="sl-row"><input data-d="${i}" data-f="n" value="${esc(x.n||'')}" placeholder="np. Multisport" aria-label="Nazwa potrącenia" autocomplete="off"><input class="planin" data-d="${i}" data-f="a" value="${V(x.a)}" placeholder="0,00" inputmode="decimal" aria-label="Kwota potrącenia" autocomplete="off"><button type="button" class="x" onclick="slipRow('ded',${i})" aria-label="Usuń potrącenie">×</button></div><select data-d="${i}" data-f="sub" aria-label="Pozycja budżetu"><option value="">— pozycja budżetu —</option>${sopt(x.sub)}</select></div>`).join('')}
    <button class="btn sm" style="align-self:flex-start" onclick="slipRow('ded')">+ potrącenie</button>`}
    <div class="sl-sec">WPŁYW</div>
    <label class="srow2"><span>Data wpływu</span><input type="date" id="slDate" value="${esc(d.date||'')}"></label>
    <label class="srow2"><span>Wpłynęło na konto<small>${esc(accN(src.acc))} – kwota z aplikacji banku</small></span><input class="planin" data-k="net" id="slNet" value="${V(d.net)}" inputmode="decimal" autocomplete="off"></label>
    <div class="note" id="slChk"></div><div class="mini" id="slHr"></div>
    <div class="g2"><button class="btn" onclick="closeSlip()">Anuluj</button><button class="btn primary" onclick="saveSlip()">Zapisz i zaksięguj</button></div>
    ${S.slip.isNew?'':'<button class="btn sm" style="align-self:center;background:none;color:var(--exp)" onclick="delSlip()">Usuń pasek</button>'}</div>`;
  return h}
/* earlier booking of a payslip: the income and everything linked to it (deductions, PPK) */
const slipTxs=iid=>iid?liveOf(S.tx).filter(t=>t.id===iid||t.slipOf===iid||t.ppkOf===iid):[];
async function saveSlip(){if(guard())return;const {id,ym}=S.slip,src=incById(id),d=slipRead();
  d.comp=d.comp.filter(c=>c.a||String(c.n||'').trim());d.ded=src.kind=='b2b'?[]:d.ded.filter(x=>x.a||String(x.n||'').trim());
  if(!src.ppk||src.kind=='b2b'){d.ppkOwn=0;d.ppkEmp=0}
  const b=brutto(d);if(b<=0)return toast(src.kind=='b2b'?'Wpisz kwotę faktury':'Wpisz składniki brutto','bad');
  if(!isDate(d.date)||!d.date.startsWith(ym))return toast('Data wpływu musi być w miesiącu: '+MN[+ym.slice(5)-1].toLowerCase(),'bad');
  if(d.ded.some(x=>x.a>0&&!x.sub))return toast('Wybierz pozycję budżetu dla każdego potrącenia','bad');
  const calc=calcNet(src,d),net=d.net||calc;if(net<=0)return toast('Kwota na konto musi być większa od zera','bad');
  const old=slipOf(ym,id);slipTxs(old?.booked).forEach(t=>putTx(t.date.slice(0,7),t.id,{deleted:true}));
  const iid='t'+rid(),ts=Date.now(),dd=d.ded.filter(x=>x.a>0),inc=net+dd.reduce((a,x)=>a+x.a,0);
  if(!await putTx(ym,iid,{type:'inc',amount:inc,date:d.date,sub:src.sub,acc:src.acc,to:'',who:src.who,note:'💼 '+src.name,slip:id,...(src.fixed?{fixedId:src.fixed}:{}),deleted:false,ts}))return;
  dd.forEach(x=>putTx(ym,'t'+rid(),{type:'exp',amount:x.a,date:d.date,sub:x.sub,acc:src.acc,to:'',who:src.who,note:`potrącenie z pensji – ${src.name}: ${x.n||'potrącenie'}`,slipOf:iid,deleted:false,ts}));
  const pb={date:d.date,sub:'',acc:src.ppk,to:'',who:src.who,deleted:false,ts,ppkOf:iid,...(src.fixed?{fixedRef:src.fixed}:{})};
  if(d.ppkOwn>0)putTx(ym,'t'+rid(),{...pb,type:'inc',amount:d.ppkOwn,note:'PPK – moja wpłata',ppk:'own'});
  if(d.ppkEmp>0)putTx(ym,'t'+rid(),{...pb,type:'inc',amount:d.ppkEmp,note:'PPK – wpłata pracodawcy',ppk:'emp'});
  const base=src.kind=='b2b'?Math.max(0,b-(d.costs||0)-(d.zus||0)):Math.max(0,Math.round((b-(d.zus||0)-(d.kup||0)+(d.ppkEmp||0))/100)*100);
  putSlip(ym,id,{comp:d.comp.map(c=>({n:String(c.n||''),a:c.a||0,h:+c.h||0})),zus:d.zus||0,health:d.health||0,kup:d.kup||0,tax:d.tax||0,ppkOwn:d.ppkOwn||0,ppkEmp:d.ppkEmp||0,costs:d.costs||0,
    ded:d.ded.map(x=>({n:String(x.n||''),a:x.a||0,sub:x.sub||''})),net,date:d.date,base,booked:iid,name:src.name,kind:src.kind,who:src.who,est:false,ts});
  if(dd.length){src.dedSub={...(src.dedSub||{})};dd.forEach(x=>{if(x.n)src.dedSub[x.n.trim().toLowerCase()]=x.sub});saveInc(src)}
  S.slip=null;render();toast(`Zaksięgowano: ${src.name} · ${zl(net)} na konto${dd.length?` · ${dd.length} ${plu(dd.length,'potrącenie','potrącenia','potrąceń')} w budżecie`:''}`)}
async function delSlip(){const {id,ym}=S.slip,old=slipOf(ym,id);if(!old)return closeSlip();
  if(!await ask({title:'Usunąć pasek?',text:`${old.name||''} – ${MN[+ym.slice(5)-1].toLowerCase()}\nUsunę też wpływ, potrącenia i wpłaty PPK z tego paska.`,ok:'Usuń',danger:true}))return;
  slipTxs(old.booked).forEach(t=>putTx(t.date.slice(0,7),t.id,{deleted:true}));w(updateDoc(doc(SLIPS(),ym),{['s.'+id]:deleteField()}));
  S.slip=null;render();toast('Usunięto pasek')}

/* ---------- analysis ---------- */
/* every category is drawn in its own colour (the same hue as on the Budget screen); "other" stays neutral grey */
const markOf=c=>c?catMark(catHue(c,S.cfg.cats.indexOf(c))):P_OTHER;

/* spending and income in other currencies – not converted, so shown beside the charts */
const fxNote=F=>{const e=fxTxt(F.exp),i=fxTxt(F.inc);return e||i?`<div class="note">🌍 W innych walutach (poza wykresami): ${e?`wydatki <b>${esc(e)}</b>`:''}${e&&i?' · ':''}${i?`przychody <b>${esc(i)}</b>`:''}</div>`:''};
function anaMonth(ctx){const{cfg,tx,ym}=ctx,sm=subsMap(cfg),cats=Object.fromEntries(cfg.cats.map(c=>[c.id,c]));
  const A=agg(cfg,tx,ym),Pm=agg(cfg,tx,addMonths(ym,-1)),pl=S.plans[ym]||{};
  const pexp=cfg.cats.filter(c=>c.type=='exp').reduce((a,c)=>a+c.subs.reduce((b,s)=>b+(pl[s.id]||0),0),0);
  const bal=A.inc-A.exp,pbal=Pm.inc-Pm.exp,rate=A.inc?bal/A.inc*100:null,prate=Pm.inc?pbal/Pm.inc*100:null;
  const mName=MN[+ym.slice(5)-1].toLowerCase(),prevName=MN[+addMonths(ym,-1).slice(5)-1].toLowerCase();
  let h=`<div class="kpis">
    <div class="kpi k-em"><div class="l">Przychody</div><div class="v num">${zl(A.inc)}</div><div class="s">${deltaH(A.inc,Pm.inc,true)||'&nbsp;'}</div></div>
    <div class="kpi k-ro"><div class="l">Wydatki</div><div class="v num">${zl(A.exp)}</div><div class="s">${deltaH(A.exp,Pm.exp,false)||'&nbsp;'}</div></div>
    <div class="kpi k-sk"><div class="l">Zostało (bilans)</div><div class="v num">${zl(bal)}</div><div class="s">${deltaH(bal,pbal,true)||'&nbsp;'}</div></div>
    <div class="kpi k-in"><div class="l">Odkładacie</div><div class="v num">${rate===null?'—':rate.toFixed(0)+'%'}</div><div class="s">przychodów${prate!==null&&rate!==null?` · ${prevName}: ${prate.toFixed(0)}%`:''}</div></div></div>
    <div class="mini" style="text-align:center">Strzałki porównują z miesiącem: ${prevName}.</div>`+fxNote(A.fx);
  const cur=td().slice(0,7);
  if(ym==cur&&pexp>0){const dl=daysIn(ym)-(+td().slice(8))+1,left=pexp-A.exp;
    h+=`<div class="note ${left<0?'bad':''}">${left>=0?`💡 Do końca miesiąca możecie wydać jeszcze <b>${zl(left)}</b>, czyli ok. <b>${zl(Math.floor(left/dl))}</b> dziennie (${dl} dni).`:`⚠️ Plan wydatków przekroczony o <b>${zl(-left)}</b>.`}</div>`}
  if(!A.exp&&!A.inc)return h+catsEmpty(`Brak przychodów i wydatków w miesiącu: ${mName}.`,0,'sleep');
  // structure donut
  const catRows=Object.entries(A.cat).filter(([,v])=>v>0).map(([id,v])=>({id,v,l:cleanCat(cats[id]?.name)})).sort((a,b)=>b.v-a.v);
  const top=catRows.slice(0,5),rest=catRows.slice(5).reduce((a,r)=>a+r.v,0);
  const segs=top.map(r=>({l:r.l,v:r.v,c:markOf(cats[r.id])}));if(rest>0)segs.push({l:'Pozostałe',v:rest,c:P_OTHER});
  if(segs.length){const tot=segs.reduce((a,x)=>a+x.v,0);
    h+=chartBox('Na co poszły pieniądze','wydatki według kategorii',`<div class="dwrap">${donutSvg(segs,zl0(tot),'wydatki')}${hbarsH(segs.map(x=>({l:x.l,v:x.v,c:x.c,dot:x.c})),tot)}</div>`)}
  // top subcategories
  const subRows=Object.entries(A.sub).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,7).map(([id,v])=>{const p=pl[id]||0;return{l:sm[id]?.name||'?',v,c:sm[id]?markOf(sm[id].cat):P_OTHER,note:p?`plan ${zl0(p)} · ${Math.round(v/p*100)}%${v>p?' <b class="t-exp">▲ ponad plan</b>':''}`:''}});
  if(subRows.length)h+=chartBox('Największe pozycje','top 7 pozycji budżetu',hbarsH(subRows,A.exp));
  // changes vs previous month
  const ch=cfg.cats.filter(c=>c.type=='exp').map(c=>({l:cleanCat(c.name),d:(A.cat[c.id]||0)-(Pm.cat[c.id]||0)})).filter(x=>Math.abs(x.d)>=100);
  const ups=ch.filter(x=>x.d>0).sort((a,b)=>b.d-a.d).slice(0,3),downs=ch.filter(x=>x.d<0).sort((a,b)=>a.d-b.d).slice(0,3);
  if(ups.length||downs.length)h+=`<section class="chart"><div class="ct"><b>Co się zmieniło</b><span class="mini">w porównaniu z: ${prevName}</span></div><div class="chg">
    <div><div class="mini" style="font-weight:800">Więcej niż ostatnio</div>${ups.map(x=>`<div class="r1"><span>${esc(x.l)}</span><b class="t-exp num">+${zl0(x.d)}</b></div>`).join('')||'<div class="mini">—</div>'}</div>
    <div><div class="mini" style="font-weight:800">Mniej niż ostatnio</div>${downs.map(x=>`<div class="r1"><span>${esc(x.l)}</span><b class="t-inc num">−${zl0(-x.d)}</b></div>`).join('')||'<div class="mini">—</div>'}</div></div></section>`;
  // daily spending
  const nd=daysIn(ym),days=Array.from({length:nd},(_,i)=>A.day[i+1]||0),active=days.filter(v=>v>0).length;
  const avgDay=A.exp/(ym==cur?Math.max(1,+td().slice(8)):nd);
  h+=chartBox('Wydatki dzień po dniu',`średnio ${zl0(avgDay)} dziennie · ${active} dni z wydatkami`,barsSvg(days.map((_,i)=>String(i+1)),[{name:'Wydatki',color:C_EXP,values:days}],{every:5,tipLabel:i=>(i+1)+' '+MNG[+ym.slice(5)-1]}));
  // who & accounts
  const wsum=Object.values(A.who).reduce((a,v)=>a+v,0);
  h+=chartBox('Kto wydawał','suma wydatków według osoby',whoH(A.who,wsum));
  const accRows=Object.entries(A.acc).sort((a,b)=>b[1]-a[1]).map(([id,v])=>({l:accN(id),v,c:'#93c5fd'}));
  if(accRows.length)h+=chartBox('Z jakich kont','',hbarsH(accRows,wsum));
  // fixed vs variable
  if(A.fixed)h+=`<section class="chart"><div class="ct"><b>Opłaty stałe a reszta</b></div><div class="stack"><i style="width:${(A.fixed/wsum*100).toFixed(1)}%;background:#b4a8f0" data-tip="Opłaty stałe: ${zl(A.fixed)}"></i><i style="width:${((wsum-A.fixed)/wsum*100).toFixed(1)}%;background:${P_OTHER}" data-tip="Pozostałe wydatki: ${zl(wsum-A.fixed)}"></i></div>
    <div class="lg" style="margin-top:8px"><span><i style="background:#b4a8f0"></i>📌 Opłaty stałe: <b class="num">${zl(A.fixed)}</b> (${pctS(A.fixed,wsum)})</span><span><i style="background:${P_OTHER}"></i>Pozostałe: <b class="num">${zl(wsum-A.fixed)}</b></span></div></section>`;
  // biggest
  if(A.big.length)h+=`<section class="chart"><div class="ct"><b>Największe pojedyncze wydatki</b></div><div class="list" style="border:0">${A.big.map(t=>txRowH(t,sm)).join('')}</div></section>`;
  return h}

function anaYear(ctx){const{cfg,tx,ym,savAt}=ctx,y=ym.slice(0,4),cats=Object.fromEntries(cfg.cats.map(c=>[c.id,c]));
  const cur=td().slice(0,7),months=Array.from({length:12},(_,i)=>y+'-'+p2(i+1));
  const M=months.map(m=>agg(cfg,tx,m)),Y=agg(cfg,tx,y),PY=agg(cfg,tx,String(+y-1));
  const elapsed=y<cur.slice(0,4)?12:y==cur.slice(0,4)?+cur.slice(5):0;
  const fxN=fxNote(Y.fx),bal=Y.inc-Y.exp,rate=Y.inc?bal/Y.inc*100:null,avgExp=elapsed?Y.exp/elapsed:0,avgInc=elapsed?Y.inc/elapsed:0;
  let h=`<div class="kpis">
    <div class="kpi k-em"><div class="l">Przychody ${y}</div><div class="v num">${zl(Y.inc)}</div><div class="s">śr. ${zl0(avgInc)}/mies. ${deltaH(Y.inc,PY.inc,true)}</div></div>
    <div class="kpi k-ro"><div class="l">Wydatki ${y}</div><div class="v num">${zl(Y.exp)}</div><div class="s">śr. ${zl0(avgExp)}/mies. ${deltaH(Y.exp,PY.exp,false)}</div></div>
    <div class="kpi k-sk"><div class="l">Zostało w roku</div><div class="v num">${zl(bal)}</div><div class="s">${deltaH(bal,PY.inc-PY.exp,true)||'&nbsp;'}</div></div>
    <div class="kpi k-in"><div class="l">Odkładacie</div><div class="v num">${rate===null?'—':rate.toFixed(0)+'%'}</div><div class="s">przychodów w roku</div></div></div>
    <div class="mini" style="text-align:center">Strzałki porównują z rokiem ${+y-1}.</div>`+fxN;
  if(!Y.inc&&!Y.exp)return h+`<div class="empty">Brak danych za rok ${y}.</div>`;
  const ml=['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];
  h+=chartBox('Przychody i wydatki','miesiąc po miesiącu',barsSvg(ml,[{name:'Przychody',color:C_INC,values:M.map(a=>Math.max(0,a.inc))},{name:'Wydatki',color:C_EXP,values:M.map(a=>Math.max(0,a.exp))}],{tipLabel:i=>MN[i]}),legendH([{l:'Przychody',c:C_INC},{l:'Wydatki',c:C_EXP}]));
  const sv=months.map((m,i)=>i<elapsed||y<cur.slice(0,4)?savAt(m+'-32'):null);
  if(sv.some(v=>v!==null))h+=chartBox('Oszczędności','konta oszczędnościowe + wpłacone w inwestycje, na koniec miesiąca',lineSvg(ml,sv,C_SAV));
  // months table
  h+=`<section class="chart"><div class="ct"><b>Miesiąc po miesiącu</b></div><div class="tw"><table class="tbl"><thead><tr><th>Miesiąc</th><th>Przychody</th><th>Wydatki</th><th>Bilans</th></tr></thead><tbody>${M.map((a,i)=>a.inc||a.exp?`<tr><td>${MN[i]}</td><td class="num">${zl0(a.inc)}</td><td class="num">${zl0(a.exp)}</td><td class="num ${a.inc-a.exp<0?'t-exp':'t-inc'}">${zl0(a.inc-a.exp)}</td></tr>`:'').join('')}<tr class="tot"><td>Razem</td><td class="num">${zl0(Y.inc)}</td><td class="num">${zl0(Y.exp)}</td><td class="num">${zl0(bal)}</td></tr></tbody></table></div></section>`;
  // best / worst
  const withData=M.map((a,i)=>({i,a})).filter(x=>x.a.inc||x.a.exp);
  if(withData.length>1){const best=withData.reduce((p,c)=>c.a.inc-c.a.exp>p.a.inc-p.a.exp?c:p),most=withData.reduce((p,c)=>c.a.exp>p.a.exp?c:p),least=withData.reduce((p,c)=>c.a.exp<p.a.exp?c:p);
    h+=`<section class="chart"><div class="ct"><b>Najciekawsze miesiące</b></div><div class="facts">
      <div>🏆 Najwięcej zostało: <b>${MN[best.i]}</b> (${zl0(best.a.inc-best.a.exp)})</div>
      <div>💸 Najwięcej wydatków: <b>${MN[most.i]}</b> (${zl0(most.a.exp)})</div>
      <div>🌿 Najmniej wydatków: <b>${MN[least.i]}</b> (${zl0(least.a.exp)})</div></div></section>`}
  // categories in the year
  const catRows=Object.entries(Y.cat).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([id,v])=>({l:cleanCat(cats[id]?.name),v,c:markOf(cats[id]),dot:markOf(cats[id]),note:`średnio ${zl0(elapsed?v/elapsed:v)} / mies.`}));
  if(catRows.length)h+=chartBox('Kategorie w całym roku','suma, udział i średnia miesięczna',hbarsH(catRows,Y.exp));
  const wsum=Object.values(Y.who).reduce((a,v)=>a+v,0);
  h+=chartBox('Kto wydawał w roku','',whoH(Y.who,wsum));
  if(Y.fixed)h+=`<div class="note">📌 Opłaty stałe w ${y}: <b>${zl(Y.fixed)}</b>, czyli ${pctS(Y.fixed,wsum)} wszystkich wydatków.</div>`;
  return h}

/* ---------- render ---------- */
const accN=id=>S.cfg.accs.find(a=>a.id===id)?.name||'?';
const barH=st=>st.pct===null?'<div class="bar"></div>':`<div class="bar ${st.k}"><i style="width:${Math.min(100,Math.max(0,st.pct)).toFixed(1)}%"></i></div>`;
function trioH(type,name,plan,act,planInput,fx){const st=status(type,plan,act);
  return`<div class="r1">${name}<span class="pill ${st.k}">${esc(st.txt)}</span></div><div class="trio"><span><em>Plan</em>${planInput||`<b>${zl(plan)}</b>`}</span><span><em>${type=='inc'?'Wpłynęło':'Wydano'}</em><b>${zl(act)}</b>${fx?`<small class="fxs">${fx.startsWith('−')?'':'+ '}${esc(fx)}</small>`:''}</span></div>${barH(st)}${st.msg?`<div class="smsg ${st.k}">${esc(st.msg)}</div>`:''}`}
/* tap on "Na kontach": current accounts split by person */
function showWealth(){if(guard())return;const tx=liveOf(S.tx),end=S.ym+'-32',accs=(o,g)=>S.cfg.accs.filter(a=>a.grp==g&&accOwner(a)==o),b=a=>balance(S.cfg,tx,a.id,end),sumO=(o,g)=>accs(o,g).filter(isP).reduce((x,a)=>x+b(a),0);
  const lines=OWN.map(o=>{const c=sumO(o,'cur'),sb=sumO(o,'sub'),fs=fxOf(accs(o,'sub'),b);return`${o}: ${zl(c)}${fxPlus(fxOf(accs(o,'cur'),b))}${sb||fxTxt(fs)?` · subkonta ${zl(sb)}${fxPlus(fs)}`:''}`});
  ask({title:'Na kontach bieżących',text:lines.join('\n')+'\n\nWszystkie konta, także oszczędności i inwestycje, zobaczysz w 👛 Konta.',ok:'Pokaż konta',cancel:'Zamknij'}).then(r=>{if(r)goTab('acc')})}
function setBF(k){S.bf=k;render()}
function setAccSub(k){S.accSub=k;window.scrollTo(0,0);render()}

function render(){
  document.querySelectorAll('.tabs [data-tab]').forEach(b=>{if(b.dataset.tab==S.tab)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  if(S.tab=='set')$('gearBtn').setAttribute('aria-current','page');else $('gearBtn').removeAttribute('aria-current');
  document.body.classList.toggle('w-theme',S.who=='Wercia');
  const[y,m]=S.ym.split('-').map(Number);applySeason();$('mlabel').textContent=S.tab=='ana'&&S.ana=='y'?'Rok '+y:SEASON[m-1][2]+' '+MN[m-1]+' '+y;
  if(!S.cfg)return;
  const ae=document.activeElement;if(ae&&ae.tagName=='INPUT'&&$('app').contains(ae)){S.pend=true;return}S.pend=false;
  const tx=liveOf(S.tx),sm=subsMap(S.cfg),end=S.ym+'-32',start=S.ym+'-00',pl=S.plans[S.ym]||{},act=actuals(S.cfg,tx,S.ym),FX=agg(S.cfg,tx,S.ym).fx;
  const sum=(ty,f)=>S.cfg.cats.filter(c=>c.type==ty).reduce((a,c)=>a+c.subs.reduce((b,s)=>b+f(s),0),0);
  const inc=sum('inc',s=>act[s.id]||0),exp=sum('exp',s=>act[s.id]||0),pinc=sum('inc',s=>pl[s.id]||0),pexp=sum('exp',s=>pl[s.id]||0);
  const tot=g=>S.cfg.accs.filter(a=>a.grp==g&&isP(a)).reduce((a,c)=>a+balance(S.cfg,tx,c.id,end),0),totFx=g=>fxOf(S.cfg.accs.filter(a=>a.grp==g),a=>balance(S.cfg,tx,a.id,end));
  const invList=Object.entries(S.inv).map(([id,it])=>({id,...it,pln:invPln(it)})).sort((a,b)=>(a.name||'').localeCompare(b.name||'','pl'));
  /* savings = savings accounts + money put into investments, at a given date; change over the shown month */
  const invAt=before=>invList.reduce((a,i)=>a+invPln(i,before),0);
  const savAt=before=>S.cfg.accs.filter(a=>(a.grp=='sav'||a.grp=='inv')&&isP(a)).reduce((a,c)=>a+balance(S.cfg,tx,c.id,before),0)+invAt(before);
  const savEnd=savAt(end),savDelta=savEnd-savAt(start);
  const trendH=d=>d>0?`<span class="trend up" title="Przybyło w tym miesiącu">▲ +${zl0(d)}</span>`:d<0?`<span class="trend down" title="Ubyło w tym miesiącu">▼ −${zl0(-d)}</span>`:'';
  const pct=(a,p)=>p?' · '+Math.round(a/p*100)+'% planu':'';
  let h='';
  const al=dueAlerts(S.cfg.fixed||[],tx,td());
  const alertH=al.length?`<button class="alert" onclick="goFixed()"><b>🔔 Do odhaczenia w 📌 Stałe</b>${al.map(x=>`<span class="it"><span>${x.when=='inc'?'📥 ':''}${esc(x.f.name)}${x.when=='inc'?'':' · '+am(x.f.amount,x.f.acc)}</span><span class="when ${x.when=='late'?'late':''}">${x.when=='inc'?'jeszcze nie odhaczony':x.when=='late'?'po terminie ('+x.due.slice(8)+'.'+x.due.slice(5,7)+')':x.when=='today'?'dziś':'jutro'}</span></span>`).join('')}</button>`:'';

  if(S.tab=='dash'){
    setTimeout(autoPlan,0);
    if(S.ym==td().slice(0,7))h+=greetH(S.cfg,S.tx);
    h+=alertH;
    h+=backupH();
    h+=`<div class="kpis">
      <div class="kpi k-em"><div class="l">Przychody</div><div class="v num">${zl(inc)}${fxSmall(FX.inc)}</div><div class="s">plan ${zl0(pinc)}${pct(inc,pinc)}</div></div>
      <div class="kpi k-ro"><div class="l">Wydatki</div><div class="v num">${zl(exp)}${fxSmall(FX.exp)}</div><div class="s">plan ${zl0(pexp)}${pct(exp,pexp)}</div></div>
      <div class="kpi k-sk"><div class="l">Bilans miesiąca</div><div class="v num">${zl(inc-exp)}</div><div class="s">plan ${zl0(pinc-pexp)}</div></div>
      <button class="kpi k-in kbtn" onclick="showWealth()" aria-label="Na kontach – pokaż podział na osoby"><div class="l">Na kontach ›</div><div class="v num">${zl(tot('cur'))}${fxSmall(totFx('cur'))}</div><div class="s">${S.cfg.accs.some(a=>a.grp=='sub')?`subkonta ${zl0(tot('sub'))}${fxPlus(totFx('sub'))} · `:''}oszczędności ${zl0(savEnd)}</div>${savDelta?`<div class="tr">${trendH(savDelta)}</div>`:''}</button></div>`;
    /* filter: everything / positions over plan (incl. spending without a plan) / positions with no plan */
    const BF=S.bf,stOf=(c,s)=>status(c.type,pl[s.id]||0,act[s.id]||0);
    const keep=(c,s)=>BF=='all'||(BF=='over'?c.type=='exp'&&stOf(c,s).k=='over':!(pl[s.id]||0));
    const nOver=S.cfg.cats.reduce((a,c)=>a+c.subs.filter(s=>c.type=='exp'&&stOf(c,s).k=='over').length,0),nNo=S.cfg.cats.reduce((a,c)=>a+c.subs.filter(s=>!(pl[s.id]||0)).length,0);
    h+=`<div class="seg seg3 bfilt">${[['all','Wszystko'],['over','▲ Przekroczone'+(nOver?` (${nOver})`:'')],['none','Bez planu'+(nNo?` (${nNo})`:'')]].map(([k,l])=>`<button aria-pressed="${BF==k}" onclick="setBF('${k}')">${l}</button>`).join('')}</div>`;
    const shownCats=S.cfg.cats.map((c,i)=>({c,i,subs:c.subs.filter(s=>keep(c,s))})).filter(x=>BF=='all'||x.subs.length);
    if(!shownCats.length)h+=BF=='over'?catsEmpty('🎉 W tym miesiącu nic nie przekroczyło planu.',1,'happy'):catsEmpty('💚 Każda pozycja ma już swój plan.',1,'ivoHappy');
    h+=shownCats.map(({c,i,subs})=>{const pa=c.subs.reduce((a,s)=>a+(pl[s.id]||0),0),ac=c.subs.reduce((a,s)=>a+(act[s.id]||0),0),o=BF=='all'?S.open[c.id]:!S.fold[c.id];
      const cfx=fxTxt(FX.cat[c.id]);
      return`<section class="cat${status(c.type,pa,ac).k=='zero'&&!cfx?' dim':''}" style="${pastel(catHue(c,i))}"><button class="ch" onclick="tog('${c.id}')" aria-expanded="${!!o}">${trioH(c.type,`<span class="nm"><span class="chev">${o?'▾':'▸'}</span><span class="cico">${catIcon(c)}</span>${esc(catL(c))}</span>`,pa,ac,'',cfx)}</button>`+
        (o?subs.map(s=>{const a=act[s.id]||0,p=pl[s.id]||0,sfx=fxTxt(FX.sub[s.id]);
          return`<div class="sub${status(c.type,p,a).k=='zero'&&!sfx?' dim':''}">${trioH(c.type,`<span class="n">${esc(s.name)}</span>`,p,a,`<input class="planin" value="${fmtIn(p)}" placeholder="0" inputmode="decimal" aria-label="Plan: ${esc(s.name)}" onchange="setPlan('${s.id}',this.value)">`,sfx)}</div>`}).join(''):'')+`</section>`}).join('');
    h+=`<div class="btns" style="justify-content:center"><button class="btn sm" onclick="copyPlan()">Skopiuj plan z poprzedniego miesiąca</button></div>`}

  else if(S.tab=='tx'){
    const F=S.f,fc=F.cat&&S.cfg.cats.find(c=>c.id==F.cat),sel=(k,opts,st='')=>`<select aria-label="${k}" onchange="setF('${k}',this.value)"${st?` style="${st}"`:''}>${opts.map(o=>o.group?`<optgroup label="${esc(o.group)}">${o.items.map(i=>`<option value="${esc(i[0])}"${F[k]==i[0]?' selected':''}>${esc(i[1])}</option>`).join('')}</optgroup>`:`<option value="${esc(o[0])}"${F[k]==o[0]?' selected':''}>${esc(o[1])}</option>`).join('')}</select>`;
    const active=F.q||F.type||F.who||F.acc||F.cat||F.scope!='m';
    h+=`<div class="filters"><input id="fq" type="search" enterkeyhint="search" placeholder="🔍 Szukaj: notatka, pozycja, kwota albo np. >200" value="${esc(F.q)}" oninput="setQ(this.value)" autocomplete="off">
      <div class="frow">${sel('scope',[['m','Ten miesiąc'],['y','Cały rok '+S.ym.slice(0,4)],['a','Wszystko']])}${sel('type',[['','Wszystkie rodzaje'],['exp','Wydatki'],['inc','Przychody'],['tr','Przelewy'],['inv','Inwestycje'],['adj','Wyrównania']])}${sel('who',[['','Wszyscy'],['Mati','Mati'],['Wercia','Wercia']])}${sel('acc',[['','Wszystkie konta'],...accOpts()])}${sel('cat',[['','Wszystkie kategorie'],...S.cfg.cats.map(c=>[c.id,catL(c)])],fc?catColor(fc)+';background:var(--c);color:var(--c3);border-color:var(--c4);font-weight:700':'')}</div>
      ${active?`<button class="btn sm" style="align-self:flex-start" onclick="clearF()">✕ Wyczyść filtry</button>`:''}</div><div id="txlist">${txListH()}</div>`}

  else if(S.tab=='ana'){
    h+=`<div class="seg" style="align-self:center">${[['m','Miesiąc'],['y','Rok']].map(([k,l])=>`<button aria-pressed="${S.ana==k}" onclick="setAna('${k}')">${l}</button>`).join('')}</div>`;
    h+=S.ana=='y'?anaYear({cfg:S.cfg,tx,ym:S.ym,savAt}):anaMonth({cfg:S.cfg,tx,ym:S.ym})}

  else if(S.tab=='fix'&&S.slip)h+=slipH();
  else if(S.tab=='fix'&&S.fixSub=='pay')h+=fixSegH()+payH();
  else if(S.tab=='fix'){
    h+=fixSegH();
    if(S.ym==td().slice(0,7)||al.some(x=>x.due.startsWith(S.ym)))h+=alertH;
    const isCur=td().startsWith(S.ym),today=+td().slice(8),all=(S.cfg.fixed||[]).slice().sort((a,b)=>(+a.day)-(+b.day)||a.name.localeCompare(b.name,'pl'));
    const row=(f,paid)=>{const inc=f.kind=='inc',late=!paid&&isCur&&today>Math.min(+f.day,daysIn(S.ym));
      const ppk=paid&&inc?liveOf(S.tx).filter(t=>t.ppkOf===paid.id):[];
      return`<div class="fx ${paid?'done':''}"><button class="box${paid&&S.justChecked==f.id?' pop':''}" role="checkbox" aria-checked="${!!paid}" aria-label="${esc(f.name)}" onclick="toggleFixed('${f.id}')">${paid?'✓':''}</button><button class="info" onclick="editFixed('${f.id}')"><b>${esc(f.name)}</b><span class="mini">${paid?(inc?'wpłynęło ':'zapłacono ')+paid.date.slice(8)+'.'+paid.date.slice(5,7)+' · '+esc(accN(paid.acc))+(ppk.length?' · PPK '+zl0(ppk.reduce((a,t)=>a+t.amount,0)):''):(late?`<span class="late">${inc?'jeszcze nie odhaczony':'po terminie'}</span> · `:'')+(inc?'zwykle do ':'termin do ')+f.day+'. · '+esc(accN(f.acc))+(inc&&f.ppk?' · z PPK':'')}</span></button><span class="num ${inc?'t-inc':''}">${paid?am(paid.amount,paid.acc):inc&&f.vary?'—':(inc?'~':'')+am(f.amount,f.acc)}</span></div>`};
    const block=(kind)=>{const fx=all.filter(f=>(f.kind||'exp')==kind),inc=kind=='inc';
      let x=`<div class="r1" style="padding:0 4px"><span class="h2" style="margin:0">${inc?'📥 Przychody stałe':'📤 Opłaty stałe'}</span><button class="btn sm dark" onclick="editFixed(null,'${kind}')">+ ${inc?'Przychód':'Opłata'}</button></div>`;
      if(!fx.length)return x+`<div class="mini" style="padding:0 6px">${inc?'Dodaj np. pensje – co miesiąc odhaczysz, ile faktycznie wpłynęło, razem z wpłatami na PPK.':'Dodaj np. czynsz, prąd albo Spotify – co miesiąc odhaczysz je na liście.'}</div>`;
      const rows=fx.map(f=>({f,paid:fixedPaid(f.id,S.ym)})),done=rows.filter(r=>r.paid),left=rows.filter(r=>!r.paid);
      const sumDone=done.reduce((a,r)=>a+r.paid.amount,0),sumLeft=left.reduce((a,r)=>a+(r.f.vary?0:r.f.amount),0);
      x+=`<div class="prog"><div class="r1"><b>${inc?'Wpłynęło':'Zapłacone'} ${done.length} z ${rows.length}</b><span class="num">${zl(sumDone)}</span></div><div class="bar"><i style="width:${(done.length/rows.length*100).toFixed(1)}%;background:${inc?'#93c5fd':'#86efac'}"></i></div><div class="mini">${inc?'Jeszcze oczekiwane: ok. ':'Zostało do zapłaty: '}<b class="num" style="color:var(--fg)">${zl(sumLeft)}</b></div></div>`;
      return x+`<div class="list">${rows.map(r=>row(r.f,r.paid)).join('')}</div>`};
    if(!all.length)h+=catsEmpty('Dodaj stałe przychody (np. pensje) i opłaty (np. czynsz, prąd, Spotify).<br>Co miesiąc odhaczysz je na liście, a wpisy same trafią do rejestru.',0,'bell');
    h+=block('inc')+block('exp');
    h+=`<div class="mini" style="text-align:center">Stuknij kwadracik, żeby odhaczyć. Stuknij nazwę, żeby zmienić.</div>${all.some(f=>(f.kind||'exp')=='exp')?`<div class="card"><h3>📅 Przypomnienia w telefonie</h3><div class="mini">Dodaj opłaty do kalendarza telefonu. Dzień przed terminem o 18:00 dostaniesz powiadomienie, nawet gdy aplikacja jest zamknięta.</div><button class="btn primary" onclick="calendarExport()">Dodaj opłaty do kalendarza</button></div>`:''}`}

  else if(S.tab=='sav'){
    const tom=addDays(td(),1),SV=a=>(a.grp=='sav'||a.grp=='inv');
    const shown=a=>SV(a)&&(!a.archived||balance(S.cfg,tx,a.id,end)||balance(S.cfg,tx,a.id,start));
    const OWN=['Mati','Wercia','Wspólne'],cols={Mati:'#7fb0ec',Wercia:'#f0a3c3','Wspólne':'#6fd0a8'};
    if(!['all',...OWN].includes(S.sub))S.sub='all';
    h+=`<div class="seg seg4">${[['all','Razem'],['Mati','Mati'],['Wercia','Wercia'],['Wspólne','Wspólne']].map(([k,l])=>`<button aria-pressed="${S.sub==k}"${k=='Wercia'?' class="wbtn"':''} onclick="setSub('${k}')">${l}${k=='Wercia'?' 🌸':''}</button>`).join('')}</div>`;
    const ownFx=(o,before)=>fxOf(S.cfg.accs.filter(a=>SV(a)&&(!o||accOwner(a)==o)),a=>balance(S.cfg,tx,a.id,before));
    const ownAt=(o,before)=>S.cfg.accs.filter(a=>SV(a)&&isP(a)&&accOwner(a)==o).reduce((x,a)=>x+balance(S.cfg,tx,a.id,before),0);
    const cushion=(pool,title)=>{const curYm=td().slice(0,7),past=[];for(let k=1;k<=6;k++){const e=agg(S.cfg,tx,addMonths(curYm,-k)).exp;if(e>0)past.push(e)}
      const avgE=past.length?past.reduce((a,v)=>a+v,0)/past.length:agg(S.cfg,tx,curYm).exp;if(!(avgE>0))return'';
      const m=Math.max(0,pool/avgE),lvl=m<3?['bad','Warto ją powiększyć – zwykle radzi się mieć zapas na 3–6 miesięcy wydatków.']:m<6?['ok','Dobry poziom – zapas na 3–6 miesięcy to zalecane minimum.']:['ok','Bardzo bezpieczny poziom.'];
      return`<section class="chart"><div class="ct"><b>🛟 ${title}</b><span class="mini">średnie wydatki domu: ${zl0(avgE)}/mies. (${past.length?'ostatnie '+past.length+' mies.':'ten miesiąc'})</span></div><div class="cush"><span class="num">${m.toFixed(1).replace('.',',')}</span><span>mies. życia bez przychodów</span></div><div class="gbar"><i style="width:${Math.min(100,m/6*100).toFixed(1)}%"></i></div><div class="mini ${lvl[0]=='bad'?'t-exp':''}">${lvl[1]}</div></section>`};
    const accRow=a=>{const e=balance(S.cfg,tx,a.id,end),s0=balance(S.cfg,tx,a.id,start),dlt=e-s0,inv=a.grp=='inv';let extra='';
      if(inv){const st=invAccStats(S.cfg,tx,a.id,tom),ago=st.last?Math.floor((Date.now()-new Date(st.last+'T12:00:00'))/864e5):null;
        extra=`${st.own||st.emp?`<div class="mini">🏦 moje wpłaty <b style="color:var(--fg)">${zl0(st.own)}</b> · pracodawca <b style="color:var(--fg)">${zl0(st.emp)}</b></div>`:''}<div class="mini">wpłacono ${zl0(st.paid)} · <b class="${st.chg>=0?'t-inc':'t-exp'}">${st.chg>=0?'+':''}${zl0(st.chg)}${st.pct!==null?' ('+(st.chg>=0?'+':'')+st.pct.toFixed(1).replace('.',',')+'%)':''}</b></div><div class="mini">${st.last?`wartość z ${st.last.split('-').reverse().join('.')}${ago>30?' · <b class="t-exp">warto zaktualizować</b>':ago>0?' ('+ago+' dni temu)':' (dziś)'}`:'wartości jeszcze nie aktualizowano'}</div>`}
      return`<div class="acc"><div style="min-width:0;flex:1"><div class="r1"><b>${inv?'<span class="badge">inwest.</span>':''}${esc(a.name)}</b>${a.archived?'<span class="mini">usunięte</span>':`<button class="btn sm" style="padding:3px 9px" aria-label="Edytuj konto" onclick="editSavAcc('${a.id}')">⋯</button>`}</div><div class="mini">w tym miesiącu: <span class="${dlt>0?'t-inc':dlt<0?'t-exp':''}">${dlt>0?'+':''}${money(dlt,CUR(a))}</span>${coinSum(S.ym,null,a.id)?` · 🪙 drobne ${money(coinSum(S.ym,null,a.id),CUR(a))}`:''}</div>${extra}
        ${a.archived?'':`<div class="btns" style="gap:6px;margin-top:6px"><button class="chip" onclick="openTx(null,{type:'tr',to:'${a.id}'})">↓ Wpłać</button><button class="chip" onclick="openTx(null,{type:'tr',from:'${a.id}'})">↑ Wypłać</button>${inv?`<button class="chip" style="background:#ede9fe;color:#5b21b6" onclick="updateValue('${a.id}')">✎ Wartość</button>`:''}</div>`}</div><div class="r"><b class="num">${money(e,CUR(a))}</b></div></div>`};
    const goalsH=owner=>{const goals=Object.entries(S.goals).map(([id,g])=>({id,...g,pr:goalProgress(g,S.cfg,tx,td())})).filter(g=>goalOwner(g)==owner).sort((a,b)=>(a.ts||0)-(b.ts||0));
      const pool=poolNow(S.cfg,tx,owner),alloc=goals.reduce((a,g)=>a+g.pr.saved,0),free=pool-alloc;
      let x=`<div class="r1" style="padding:0 4px"><span class="h2" style="margin:0">${owner=='Wspólne'?'Wspólne cele':'Cele: '+owner}</span><button class="btn sm dark" onclick="editGoal(null,'${owner}')">+ Dodaj cel</button></div>`;
      if(goals.length)x+=`<div class="envtop ${free<0?'neg':''}"><div><div class="mini">${free<0?'Przydzielono więcej, niż jest na kontach':'Do przydzielenia'}</div><div class="num big">${zl(free)}</div></div><div class="mini" style="text-align:right">na kontach ${zl0(pool)}<br>w celach ${zl0(alloc)}</div></div>`;
      if(free<0)x+=`<div class="note bad">⚠️ Na kontach jest mniej, niż przydzieliliście do celów. Zabierzcie ${zl(-free)} z któregoś celu.</div>`;
      if(!goals.length)x+=catsEmpty(`Cele działają jak koperty: część pieniędzy z kont powyżej przydzielacie na konkretny cel, np. ${owner=='Wspólne'?'Wakacje, Remont':'Nowy laptop, Kurs'}.`,1,'envelope');
      x+=goals.map(g=>{const p=g.pr,wd=Math.min(100,p.pct);
        return`<div class="goal"><div class="r1"><b>${p.done?'🎉 ':''}${esc(g.name)}</b><span class="pill ${p.done?'ok':'low'}">${Math.floor(p.pct)}%</span></div><div class="gbar"><i style="width:${wd.toFixed(1)}%"></i></div>
          <div class="r1 mini"><span><b class="num" style="color:var(--fg)">${zl0(p.saved)}</b> z ${zl0(g.target)}</span><span>${p.done?'Cel osiągnięty!':'brakuje '+zl0(p.left)}</span></div>
          ${p.perMonth?`<div class="mini">Do ${MNG[+g.deadline.slice(5)-1]} ${g.deadline.slice(0,4)}: przydzielajcie ok. <b style="color:var(--fg)">${zl0(p.perMonth)}</b> miesięcznie (${p.months} mies.)</div>`:''}
          <div class="btns" style="gap:6px"><button class="btn sm primary" onclick="allocGoal('${g.id}',1)">+ Przydziel</button>${p.saved>0?`<button class="btn sm" onclick="allocGoal('${g.id}',-1)">− Zabierz</button>`:''}<button class="btn sm" onclick="editGoal('${g.id}')">Edytuj</button></div></div>`}).join('');
      return x};

    if(S.sub=='all'){
      h+=`<div class="worth"><div class="l">Oszczędności i inwestycje razem</div><div class="v num">${zl(savEnd)} ${trendH(savDelta)}</div>${fxTxt(ownFx(null,end))?`<div class="s">${esc(fxPlus(ownFx(null,end)).trim())} (bez przeliczania)</div>`:''}<div class="s">${OWN.map(o=>`${o} ${zl0(ownAt(o,end))}`).join(' · ')}</div></div>`;
      const own=Object.fromEntries(OWN.map(o=>[o,Math.max(0,ownAt(o,end))])),ownTot=Object.values(own).reduce((a,v)=>a+v,0);
      if(ownTot>0)h+=`<section class="chart"><div class="ct"><b>Czyje oszczędności</b></div><div class="stack">${OWN.filter(n=>own[n]>0).map(n=>`<i style="width:${(own[n]/ownTot*100).toFixed(2)}%;background:${cols[n]}" data-tip="${n}: ${zl(own[n])}"></i>`).join('')}</div><div class="lg">${OWN.map(n=>`<span><i style="background:${cols[n]}"></i>${n}: <b class="num">${zl(own[n])}</b></span>`).join('')}</div><div class="tip mini">Dotknij paska albo przejdź do zakładki osoby.</div></section>`;
      const yDelta=savEnd-savAt(S.ym.slice(0,4)+'-00'),tg=S.savTarget,coins=coinSum(S.ym);
      h+=`<section class="chart"><div class="ct"><b>Ile odłożyliście</b><span class="mini">przybyło na kontach oszczędnościowych i w inwestycjach</span></div>
        <div class="kpis" style="gap:8px"><div class="kpi k-em"><div class="l">${MN[+S.ym.slice(5)-1]}</div><div class="v num ${savDelta<0?'t-exp':''}">${savDelta>0?'+':''}${zl(savDelta)}</div>${tg?`<div class="s">cel ${zl0(tg)} · ${Math.max(0,Math.round(savDelta/tg*100))}%</div>`:''}</div><div class="kpi k-sk"><div class="l">Rok ${S.ym.slice(0,4)}</div><div class="v num ${yDelta<0?'t-exp':''}">${yDelta>0?'+':''}${zl(yDelta)}</div>${tg?`<div class="s">cel ${zl0(tg*(+S.ym.slice(5)))} do końca ${MNG[+S.ym.slice(5)-1]}</div>`:''}</div></div>
        ${tg?`<div class="gbar"><i style="width:${Math.min(100,Math.max(0,savDelta/tg*100)).toFixed(1)}%"></i></div><div class="mini">${savDelta>=tg?'🎉 Cel na ten miesiąc osiągnięty!':`Do celu w tym miesiącu brakuje ${zl0(tg-Math.max(0,savDelta))}.`}</div>`:''}
        ${coins?`<div class="mini">🪙 w tym z drobnych: <b style="color:var(--fg)">${zl(coins)}</b></div>`:''}
        <button class="btn sm" style="align-self:flex-start" onclick="setSavTarget()">${tg?'Zmień cel miesięczny ('+zl0(tg)+')':'+ Ustaw cel: ile odkładać co miesiąc'}</button></section>`;
      if(tg&&savDelta>=tg&&S.ym==td().slice(0,7)&&!ls.get('mw_conf_'+S.ym)){ls.set('mw_conf_'+S.ym,'1');setTimeout(()=>celebrate(CELEBRATE.saving(S.who)),300)}
      h+=cushion(savAt(tom),'Wszystkie oszczędności wystarczą na');
      const gl=Object.entries(S.goals).map(([id,g])=>({id,...g,pr:goalProgress(g,S.cfg,tx,td())}));
      if(gl.length)h+=`<section class="chart"><div class="ct"><b>Wszystkie cele</b></div>${hbarsH(gl.map(g=>({l:g.name+' · '+goalOwner(g),v:g.pr.saved,c:cols[goalOwner(g)],dot:cols[goalOwner(g)],note:`${Math.floor(g.pr.pct)}% z ${zl0(g.target)}`})))}</section>`;
      if(invList.length){h+=`<div class="h2">Starsze wpisy inwestycji (poprzednia wersja)</div>`+invList.map(it=>`<div class="inv"><div class="inv-h"><div style="min-width:0"><b>${esc(it.name)}</b><div class="mini">wpłacono ${zl(it.pln)}</div></div><button class="btn sm" onclick="delInv('${it.id}')">Usuń</button></div></div>`).join('')}}
    else{const o=S.sub,accs=S.cfg.accs.filter(a=>shown(a)&&accOwner(a)==o),tE=ownAt(o,end),tD=tE-ownAt(o,start);
      const invV=accs.filter(a=>a.grp=='inv'&&isP(a)).reduce((x,a)=>x+balance(S.cfg,tx,a.id,end),0);
      h+=`<div class="ptab ${o=='Wercia'?'pink':''}">`;
      h+=`<div class="worth ${o=='Mati'?'mati':o=='Wspólne'?'wsp':''}">${o=='Wercia'?'<svg class="flowers" viewBox="0 0 170 120" aria-hidden="true"><g stroke-linecap="round"><path d="M40 120 C40 96 42 80 46 64" stroke="#86c29a" stroke-width="4" fill="none"/><path d="M42 98 C30 92 24 84 22 74 C34 78 40 86 42 98Z" fill="#a7d8b5"/><path d="M46 64 C34 60 30 44 34 30 C40 38 44 40 46 40 C48 40 52 38 58 30 C62 44 58 60 46 64Z" fill="#f472b6"/><path d="M46 40 C44 30 46 22 46 18 C50 24 52 32 50 42Z" fill="#ec4899"/><path d="M118 120 C118 100 116 86 112 74" stroke="#86c29a" stroke-width="4" fill="none"/><path d="M115 100 C126 94 132 86 134 78 C122 80 116 90 115 100Z" fill="#a7d8b5"/><circle cx="112" cy="62" r="17" fill="#fda4af"/><path d="M112 62 m-11 0 a11 11 0 1 1 11 11" fill="none" stroke="#e11d48" stroke-width="3"/><path d="M112 62 m-6 0 a6 6 0 1 1 6 6" fill="none" stroke="#e11d48" stroke-width="2.5"/><path d="M80 120 C80 108 80 100 82 92" stroke="#86c29a" stroke-width="3" fill="none"/><ellipse cx="82" cy="80" rx="4.5" ry="10" fill="#fff" transform="rotate(0 82 90)"/><ellipse cx="82" cy="80" rx="4.5" ry="10" fill="#fff" transform="rotate(45 82 90)"/><ellipse cx="82" cy="80" rx="4.5" ry="10" fill="#fff" transform="rotate(90 82 90)"/><ellipse cx="82" cy="80" rx="4.5" ry="10" fill="#fff" transform="rotate(135 82 90)"/><ellipse cx="82" cy="80" rx="4.5" ry="10" fill="#fff" transform="rotate(180 82 90)"/><ellipse cx="82" cy="80" rx="4.5" ry="10" fill="#fff" transform="rotate(225 82 90)"/><ellipse cx="82" cy="80" rx="4.5" ry="10" fill="#fff" transform="rotate(270 82 90)"/><ellipse cx="82" cy="80" rx="4.5" ry="10" fill="#fff" transform="rotate(315 82 90)"/><circle cx="82" cy="90" r="5" fill="#fbbf24"/><g transform="translate(150 96) scale(.6)"><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fbcfe8" transform="rotate(0)"/><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fbcfe8" transform="rotate(60)"/><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fbcfe8" transform="rotate(120)"/><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fbcfe8" transform="rotate(180)"/><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fbcfe8" transform="rotate(240)"/><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fbcfe8" transform="rotate(300)"/><circle r="5" fill="#fde68a"/></g><g transform="translate(14 104) scale(.5)"><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fff" transform="rotate(0)"/><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fff" transform="rotate(60)"/><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fff" transform="rotate(120)"/><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fff" transform="rotate(180)"/><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fff" transform="rotate(240)"/><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fff" transform="rotate(300)"/><circle r="5" fill="#f9a8d4"/></g></g></svg>':''}<div class="l">${o=='Wercia'?'🌷 ':''}${o=='Wspólne'?'Wspólne oszczędności':'Oszczędności: '+o}</div><div class="v num">${zl(tE)} ${trendH(tD)}</div><div class="s">oszczędności ${zl0(tE-invV)} · inwestycje, IKE, IKZE ${zl0(invV)}</div></div>`;
      if(o=='Wspólne')h+=cushion(tE,'Wspólne oszczędności wystarczą na');
      h+=`<div class="list"><div class="grp-h ${o=='Wspólne'?'':'sav'}"><span>KONTA</span><span class="num">${zl(tE)}${fxPlus(ownFx(o,end))}</span></div>${accs.map(accRow).join('')||'<div class="acc mini">Brak kont – dodaj pierwsze poniżej.</div>'}<div class="acc" style="justify-content:center"><button class="btn sm dark" onclick="addSavAcc('${o}')">+ Dodaj konto</button></div></div>`;
      h+=`<div class="mini" style="padding:0 4px">Konta „inwest.” (inwestycje, IKE, IKZE) mają zmienną wartość – raz na jakiś czas wpisz aktualną kwotę z aplikacji przyciskiem „✎ Wartość”. Przycisk ⋯ zmienia nazwę lub usuwa konto (pieniądze przejdą na inne konto).</div>`;
      h+=goalsH(o)+'</div>'}}

  else if(S.tab=='acc'&&S.recon){
    const tom=addDays(td(),1),accs=recAccs(),app=accs.filter(isP).reduce((x,a)=>x+balance(S.cfg,tx,a.id,tom),0),GH={cur:'KONTA BIEŻĄCE',sub:'SUBKONTA',sav:'OSZCZĘDNOŚCI',inv:'INWESTYCJE, IKE, IKZE'};
    h+=`<div class="seg seg2">${[['cur','Bieżące i subkonta'],['sav','Oszczędności i inwestycje']].map(([k,l])=>`<button aria-pressed="${(S.recScope||'cur')==k}" onclick="setRecScope('${k}')">${l}</button>`).join('')}</div>`;
    h+=`<div class="worth rectop"><div class="l">⚖️ ${(S.recScope||'cur')=='cur'?'Konta bieżące i subkonta':'Oszczędności i inwestycje'} · stan na dziś ${td().split('-').reverse().join('.')}</div>
      <div class="recgrid"><div><div class="mini">W aplikacji</div><b class="num" id="recApp">${zl(app)}</b></div><div><div class="mini">Wpisane</div><b class="num" id="recReal">${zl(app)}</b></div><div><div class="mini">Różnica</div><b class="num" id="recDiff">0,00 zł</b></div></div><div class="mini" id="recN">nic jeszcze nie wpisano</div></div>
      <div class="note">Wpisz, ile <b>faktycznie</b> jest na kontach (z aplikacji banku). Puste pole = bez zmian. Możesz uzupełnić jedną albo obie zakładki – „Dalej” zapisze wszystko, co wpisałeś. Różnice między kontami zapiszę jako przelewy, a resztę jako wyrównanie.</div>`;
    let g0='';h+=`<div class="list">`+accs.map(a=>{const b=balance(S.cfg,tx,a.id,tom),hd=a.grp!=g0?`<div class="grp-h ${a.grp=='sub'?'subk':a.grp}"><span>${GH[a.grp]}</span></div>`:'';g0=a.grp;
      return hd+`<div class="recrow"><div style="min-width:0"><b>${esc(a.name)}</b><div class="mini">w aplikacji: <span class="num">${money(b,CUR(a))}</span></div><div class="rdiff" id="rd_${a.id}"></div></div><input id="rv_${a.id}" class="planin" style="max-width:130px" inputmode="decimal" value="${esc((S.recVals||{})[a.id]||'')}" placeholder="${f2(b)}" oninput="recSum()" autocomplete="off"></div>`}).join('')+`</div>`;
    h+=`<div class="g2"><button class="btn" onclick="closeRecon()">Anuluj</button><button class="btn primary" onclick="applyRecon()">Dalej</button></div>`}

  else if(S.tab=='acc'){
    /* wealth by person: Wszyscy / Mati / Wercia / Wspólne, groups: current accounts, subaccounts, savings, investments */
    const o=OWN.includes(S.accSub)?S.accSub:'all',bal=a=>balance(S.cfg,tx,a.id,end);
    const vis=a=>(!a.archived||bal(a)||balance(S.cfg,tx,a.id,start))&&(o=='all'||accOwner(a)==o);
    const accsO=(ow,g)=>S.cfg.accs.filter(a=>(!ow||accOwner(a)==ow)&&(!g||a.grp==g)),sumO=(ow,g)=>accsO(ow,g).filter(isP).reduce((x,a)=>x+bal(a),0),fxO=(ow,g)=>fxOf(accsO(ow,g),bal);
    const oldInv=ow=>invList.filter(i=>!ow||(i.owner||'Wspólne')==ow).reduce((x,i)=>x+i.pln,0);
    const GL={cur:'bieżące',sub:'subkonta',sav:'oszczędności',inv:'inwestycje'};
    const parts=ow=>['cur','sub','sav','inv'].map(g=>[g,sumO(ow,g)+(g=='inv'?oldInv(ow):0)]).filter(([g,v])=>v||g=='cur').map(([g,v])=>`${GL[g]} ${zl0(v)}${fxPlus(fxO(ow,g))}`).join(' · ');
    const total=ow=>sumO(ow)+oldInv(ow),otag=ow=>`<span class="otag o-${ow=='Mati'?'m':ow=='Wercia'?'w':'s'}">${ow}</span>`;
    h+=`<button class="btn dark" style="width:100%" onclick="openRecon()">⚖️ Wyrównaj wszystkie salda naraz</button>`;
    h+=`<div class="seg seg4">${[['all','Wszyscy'],...OWN.map(x=>[x,x])].map(([k,l])=>`<button aria-pressed="${o==k}"${k=='Wercia'?' class="wbtn"':''} onclick="setAccSub('${k}')">${l}${k=='Wercia'?' 🌸':''}</button>`).join('')}</div>`;
    h+=`<div class="ptab ${o=='Wercia'?'pink':''}">`;
    if(o=='all'){const own=OWN.map(x=>[x,total(x)]),pos=own.filter(([,v])=>v>0),pt=pos.reduce((a,[,v])=>a+v,0);
      h+=`<div class="worth"><div class="l">Łączny majątek na koniec miesiąca</div><div class="v num">${zl(total())}${fxSmall(fxO())}</div><div class="s">${parts()}</div></div>`;
      h+=`<section class="chart"><div class="ct"><b>Czyj majątek</b><span class="mini">stuknij osobę, żeby zobaczyć tylko jej konta</span></div>${pt>0?`<div class="stack">${pos.map(([x,v])=>`<i style="width:${(v/pt*100).toFixed(2)}%;background:${OWN_COL[x]}" data-tip="${x}: ${zl(v)}"></i>`).join('')}</div>`:''}<div class="owners">${own.map(([x,v])=>`<button class="orow" onclick="setAccSub('${x}')"><i style="background:${OWN_COL[x]}"></i><span class="ot"><b>${x}</b><small>${parts(x)}</small></span><b class="num">${zl(v)}</b></button>`).join('')}</div></section>`}
    else h+=`<div class="worth ${o=='Mati'?'mati':o=='Wspólne'?'wsp':''}"><div class="l">${o=='Wspólne'?'Wspólny majątek':'Majątek: '+o}</div><div class="v num">${zl(total(o))}${fxSmall(fxO(o))}</div><div class="s">${parts(o)}</div></div>`;
    const GH={cur:'KONTA BIEŻĄCE',sub:'SUBKONTA',sav:'OSZCZĘDNOŚCI',inv:'INWESTYCJE, IKE, IKZE'},groups=['cur','sub','sav','inv'].filter(g=>S.cfg.accs.some(a=>a.grp==g&&vis(a)));
    if(!groups.length)h+=`<div class="empty">Brak kont – dodasz je w ⚙️ Ustawieniach.</div>`;
    h+=groups.map(g=>{const accs=S.cfg.accs.filter(a=>a.grp==g&&vis(a));
      return`<div class="list"><div class="grp-h ${g=='sub'?'subk':g}"><span>${GH[g]}</span><span class="num">${zl(accs.filter(isP).reduce((x,a)=>x+bal(a),0))}${fxPlus(fxOf(accs,bal))}</span></div>${accs.map(a=>{const e=bal(a),s0=balance(S.cfg,tx,a.id,start),dlt=e-s0,M=v=>money(v,CUR(a));
        return`<div class="acc"><div><b>${esc(a.name)}</b>${o=='all'?otag(accOwner(a)):''}<div class="mini">na początek: ${M(s0)}${isP(a)?'':` · <span class="curtag">${CUR(a)}</span>`}</div>${a.grp=='inv'?`<button class="chip" onclick="updateValue('${a.id}')">✎ Aktualizuj wartość</button>`:`<button class="chip" onclick="recon('${a.id}')">⚖️ Wyrównaj</button>`}</div><div class="r"><b class="num">${M(e)}</b><div class="mini ${dlt>0?'t-inc':dlt<0?'t-exp':''}">${dlt>0?'+':''}${M(dlt)}</div></div></div>`}).join('')}</div>`}).join('');
    const oldL=invList.filter(i=>o=='all'||(i.owner||'Wspólne')==o);
    if(oldL.length)h+=`<div class="list"><div class="grp-h inv"><span>STARSZE WPISY INWESTYCJI</span><span class="num">${zl(oldL.reduce((x,i)=>x+i.pln,0))}</span></div>${oldL.map(i=>`<div class="acc"><div><b>${esc(i.name)}</b><div class="mini">${esc(i.kind||'')} · ${esc(i.owner||'')}</div></div><div class="r"><b class="num">${zl(i.pln)}</b></div></div>`).join('')}</div>`;
    h+='</div>'}

  else{
    const rules=S.cfg.round||[];
    h+=`<div class="card"><div class="rowx" style="border:0;padding:0"><h3>🪙 Drobne</h3><button class="btn sm dark" onclick="editRound()">+ reguła</button></div><div class="mini">Jak w Revolucie: wydatek z wybranego konta zaokrągla się w górę do 5 albo 10 zł, a różnica (razy mnożnik) trafia na wskazane konto. W okienku wydatku pojawi się złota moneta – odznacz ją, gdy bank nie liczy drobnych (np. przy BLIK-u).</div>${rules.map(r=>`<div class="rowx"><span style="flex:1;min-width:0"><b>${esc(accN(r.from))} → ${esc(accN(r.to))}</b><br><span class="mini">do ${r.step} ${curSym(accCur(r.from))} · ×${r.mult}${r.full?' · pełne drobne przy równej kwocie':''} · w tym miesiącu ${am(coinSum(S.ym,r),r.from)}</span></span><button class="btn sm" onclick="editRound('${r.id}')">Edytuj</button></div>`).join('')||'<div class="mini" style="padding-top:4px">Nie ma jeszcze żadnej reguły.</div>'}</div>`;
    h+=`<div class="card"><h3>🐾 Bailey i Ivo</h3><div class="seg seg3">${[['lots','Dużo'],['few','Mało'],['off','Wyłączone']].map(([k,l])=>`<button aria-pressed="${kotki.mode==k}" onclick="setKotki('${k}')">${l}</button>`).join('')}</div><div class="mini">Dużo – rysunki, porady i żarty. Mało – rysunki i tylko ważne komunikaty. Wyłączone – bez kotków. Ustawienie dotyczy tego telefonu.</div><div class="btns"><button class="btn sm" onclick="showTour()">Pokaż pierwsze kroki</button><button class="btn sm" onclick="showNews(true)">Co nowego</button></div></div>`;
    h+=`<div class="card"><h3>Kto korzysta z tego telefonu?</h3><div class="seg">${['Mati','Wercia'].map(n=>`<button aria-pressed="${S.who==n}" onclick="setWho('${n}')">${n}</button>`).join('')}</div><div class="mini">Nowe transakcje będą podpisane tym imieniem.</div></div>
    <div class="card"><div class="rowx" style="border:0;padding:0"><h3>Konta</h3><button class="btn sm dark" onclick="addAcc()">+ konto</button></div><div class="seg seg2 acctabs">${Object.entries(ACCTAB).map(([g,l])=>`<button aria-pressed="${S.accTab==g}" onclick="setAccTab('${g}')">${{cur:'💳',sub:'🗂️',sav:'🐷',inv:'📈'}[g]} ${l} (${S.cfg.accs.filter(a=>a.grp==g&&!a.archived).length})</button>`).join('')}</div>${(()=>{const list=S.cfg.accs.filter(a=>a.grp==S.accTab&&!a.archived);
      return list.length?list.map((a,i)=>`<div class="rowx"><span style="flex:1;min-width:0"><b>${esc(a.name)}</b><br><span class="mini">${accOwner(a)}${isP(a)?'':' · '+CUR(a)} · saldo początkowe ${money(a.open,CUR(a))}</span></span><span class="btns" style="gap:4px"><button class="btn sm" aria-label="W górę" onclick="moveAcc('${a.id}',-1)"${i==0?' disabled style="opacity:.3"':''}>↑</button><button class="btn sm" aria-label="W dół" onclick="moveAcc('${a.id}',1)"${i==list.length-1?' disabled style="opacity:.3"':''}>↓</button><button class="btn sm" onclick="editAcc('${a.id}')">Edytuj</button></span></div>`).join(''):`<div class="mini" style="padding:6px 0">Nie ma tu jeszcze kont – dodasz je przyciskiem „+ konto”.</div>`})()}<div class="mini">Strzałkami zmienisz kolejność – w tej kolejności konta pokazują się w całej aplikacji. Rodzaj konta zmienisz w „Edytuj”.</div></div>
    <div class="card"><div class="rowx" style="border:0;padding:0"><h3>Kategorie i pozycje budżetu</h3><button class="btn sm dark" onclick="addCat()">+ kategoria</button></div><div class="mini">Stuknij nazwę kategorii albo pozycji, żeby ją zmienić. Strzałkami zmienisz kolejność.</div>${S.cfg.cats.map((c,ci)=>`<div class="rowx"><button style="font-weight:800;text-align:left;flex:1;min-width:0" onclick="editCat(${ci})">${catIcon(c)} ${esc(catL(c))} ✏️</button><span class="btns" style="gap:4px"><button class="btn sm" aria-label="W górę" onclick="moveCat(${ci},-1)"${ci==0?' disabled style="opacity:.3"':''}>↑</button><button class="btn sm" aria-label="W dół" onclick="moveCat(${ci},1)"${ci==S.cfg.cats.length-1?' disabled style="opacity:.3"':''}>↓</button><button class="btn sm" onclick="addSub(${ci})">+ pozycja</button></span><div class="tags" style="width:100%">${c.subs.map((s,si)=>`<span class="tag"><button onclick="renSub(${ci},${si})">${esc(s.name)}</button><button class="x" aria-label="Usuń ${esc(s.name)}" onclick="delSub(${ci},${si})">×</button></span>`).join('')}</div></div>`).join('')}</div>
    <div class="card"><h3>Kopia danych</h3><div class="mini">Pobierz kopię co jakiś czas. Tym samym miejscem wczytasz też kopię ze starej wersji aplikacji.</div><div class="btns"><button class="btn primary" onclick="exportJson()">Pobierz kopię</button><button class="btn" onclick="$('fileIn').click()">Wczytaj kopię (.json)</button><button class="btn" onclick="logout()">Wyloguj</button></div><div class="mini">Zalogowano: ${esc(auth.currentUser?.email||'')}</div><div class="diag">Diagnostyka: ${esc(S.last||'brak błędów')} · transakcji: ${tx.length}</div></div>`}
  $('app').innerHTML=h;if(S.tab=='acc'&&S.recon&&$('recApp'))recSum();if(S.tab=='fix'&&S.slip)slipCalc()}
function setAna(k){S.ana=k;render()}
function tog(id){if(S.bf!='all')S.fold[id]=!S.fold[id];else S.open[id]=!S.open[id];render()}
function autoPlan(){const ym=S.ym,cur=td().slice(0,7);
  if(!S.plansSrv||S.plans[ym]||S.autoPlanned[ym]||ym<cur||ym>addMonths(cur,1))return;
  const prev=Object.keys(S.plans).filter(k=>k<ym&&Object.values(S.plans[k]).some(v=>v)).sort().pop();if(!prev)return;
  S.autoPlanned[ym]=1;w(setDoc(doc(PLC(),ym),{...S.plans[prev]},{merge:true}));
  toast(`Plan na ${MN[+ym.slice(5)-1].toLowerCase()} skopiowany z: ${MN[+prev.slice(5)-1].toLowerCase()}`)}

/* ---------- wiring ---------- */
$('prevM').onclick=()=>mv(-1);$('nextM').onclick=()=>mv(1);
function mv(d){if(S.tab=='ana'&&S.ana=='y')d*=12;S.ym=addMonths(S.ym,d);render()}
const goTab=t=>{S.tab=t;S.recon=false;window.scrollTo(0,0);render()};
document.querySelectorAll('.tabs [data-tab]').forEach(b=>b.onclick=()=>goTab(b.dataset.tab));
$('gearBtn').onclick=()=>goTab(S.tab=='set'?'dash':'set');
$('addBtn').onclick=()=>openTx();
$('mt').querySelectorAll('button').forEach(b=>b.onclick=()=>setType(b.dataset.v));
$('mc').onchange=()=>{if($('mto').value==$('mc').value){const o=[...$('mto').options].find(o=>o.value!=$('mc').value);if(o)$('mto').value=o.value}autoWho();updCoin();updFx()};
$('shCancel').onclick=closeSheet;$('shSave').onclick=saveTx;$('shDel').onclick=()=>S.edit&&delTx(S.edit);
$('sheet').onclick=e=>{if(e.target===$('sheet'))closeSheet()};
$('fileIn').onchange=e=>{const f=e.target.files[0];e.target.value='';if(f)importFile(f)};
function showTip(e){const m=e.target.closest('[data-tip]');if(!m)return;const box=m.closest('.chart');if(!box)return;const t=box.querySelector('.tip');if(t){t.textContent=m.dataset.tip;t.classList.add('on')}
  box.querySelectorAll('.sel').forEach(x=>x.classList.remove('sel'));m.classList.add('sel')}
$('app').addEventListener('click',showTip);$('app').addEventListener('mouseover',e=>{if(matchMedia('(hover:hover)').matches)showTip(e)});
document.addEventListener('focusout',()=>{if(S.pend)setTimeout(render,60)});
document.addEventListener('keydown',e=>{if(e.key!='Escape'||!$('dlg').hidden)return;if(!$('pick').hidden)closePick();else if(!$('sheet').hidden)closeSheet()});
window.addEventListener('unhandledrejection',e=>err(e.reason||'błąd'));

function syncLabel(md){$('sync').textContent=md.hasPendingWrites?'zapisywanie…':md.fromCache?'offline – zapisze się później':'zsynchronizowano'}
let unsub=[];
setPersistence(auth,browserLocalPersistence).catch(()=>{});
applySeason();if(kotki.mode!='off')$('lcats').innerHTML=scene('duo');
async function login(){$('lerr').textContent='';$('loginBtn').disabled=true;
  try{await signInWithEmailAndPassword(auth,$('em').value.trim(),$('pw').value)}
  catch(e){$('lerr').textContent=({'auth/invalid-credential':'Zły e-mail lub hasło.','auth/invalid-email':'To nie wygląda na adres e-mail.','auth/too-many-requests':'Za dużo prób. Spróbuj za kilka minut.','auth/network-request-failed':'Brak internetu.','auth/unauthorized-domain':'Ten adres strony nie jest dodany w Firebase (Authentication → Settings → Authorized domains).'})[e.code]||('Błąd logowania: '+e.code)}
  finally{$('loginBtn').disabled=false}}
$('loginBtn').onclick=login;$('pw').onkeydown=e=>{if(e.key=='Enter')login()};
async function allSynced(){return Promise.race([waitForPendingWrites(fdb).then(()=>true,()=>false),sleep(2500).then(()=>false)])}
async function logout(){
  const ok=navigator.onLine&&await allSynced();
  if(!ok){if(!await ask({title:'Uwaga: niewysłane zmiany',text:'Część wpisów z tego telefonu nie dotarła jeszcze do chmury (brak internetu?).\nJeśli się teraz wylogujesz, mogą przepaść. Połącz się z internetem i poczekaj, aż u góry pojawi się „zsynchronizowano”.',ok:'Wyloguj mimo to',cancel:'Zostań zalogowany',danger:true}))return}
  else if(!await ask({title:'Wylogować?',text:'Wszystko jest zapisane w chmurze. Na tym telefonie trzeba będzie zalogować się ponownie.',ok:'Wyloguj',danger:true}))return;
  signOut(auth)}
onAuthStateChanged(auth,u=>{unsub.forEach(f=>f());unsub=[];
  $('login').hidden=!!u;$('main').hidden=!u;
  if(!u){S.cfg=null;return}
  $('app').innerHTML=`<div class="load">${kotki.mode=='off'?'':scene('window')}Wczytywanie budżetu…</div>`;
  const onErr=e=>{err(e);if(e?.code=='permission-denied')$('app').innerHTML='<div class="load">Brak dostępu do danych.<br><br>Sprawdź reguły Firestore albo czy ten e-mail jest na liście.</div>'};
  unsub.push(onSnapshot(H,s=>{
    if(s.exists()){const raw=s.data(),c=fromDoc(clone(raw));const leg=c.legacy;delete c.legacy;S.hraw=raw;S.cfg=c;S.savTarget=raw.savTarget||0;render();setTimeout(maybeIntro,700);if(leg&&!s.metadata.fromCache)saveCfg();
      if(!leg&&!s.metadata.fromCache&&c.cats.some(k=>k.hue==null))c.cats.forEach((k,i)=>{if(k.hue==null){k.hue=HUES[i%HUES.length];saveCat(k)}});
      if(!raw.zwrotyRen&&!s.metadata.fromCache&&!leg){for(const k of c.cats.filter(x=>x.type=='inc'))for(const x of k.subs)if(x.name.trim()=='Zwroty'){x.name=ZWROT_PIT;saveSub(k,x)}merge(H,{zwrotyRen:true})}
      if(!raw.subAcc&&!s.metadata.fromCache&&!leg){c.accs.forEach(a=>{if(a.grp=='cur'&&/zwierzak|dzieciacz/i.test(a.name)){a.grp='sub';a.owner='Wspólne';saveAcc(a)}});merge(H,{subAcc:true})}
      if(!raw.invAcc&&!s.metadata.fromCache&&!leg){[['ainvM','Inwestycje Mati','Mati'],['ainvW','Inwestycje Wercia','Wercia']].forEach(([id,n,o])=>{if(!c.accs.some(a=>a.id==id||a.name==n)){const a={id,name:n,grp:'inv',owner:o,open:0};c.accs.push(a);saveAcc(a)}});merge(H,{invAcc:true});render()}
      if(!raw.ikeAcc&&!s.metadata.fromCache&&!leg){[['aikeM','IKE Mati','inv','Mati'],['aikzeM','IKZE Mati','inv','Mati'],['aikeW','IKE Wercia','inv','Wercia'],['aikzeW','IKZE Wercia','inv','Wercia'],['apodu','Poduszka bezpieczeństwa','sav','Wspólne']].forEach(([id,n,g,o])=>{if(!c.accs.some(a=>a.id==id||a.name==n)){const a={id,name:n,grp:g,owner:o,open:0};c.accs.push(a);saveAcc(a)}});merge(H,{ikeAcc:true});render()}
      if(!raw.wspAcc&&!s.metadata.fromCache&&!leg){if(!c.accs.some(a=>a.id=='awsp'||/^oszczędności wspólne$/i.test(a.name))){const a={id:'awsp',name:'Oszczędności wspólne',grp:'sav',owner:'Wspólne',open:0};const pi=c.accs.findIndex(x=>x.id=='apodu');if(pi>=0){c.accs.splice(pi,0,a);saveAcc(a);c.accs.slice(pi+1).forEach(saveAcc)}else{c.accs.push(a);saveAcc(a)}}merge(H,{wspAcc:true});render()}
      if(!raw.ppkAcc&&!s.metadata.fromCache&&!leg){[['appkM','PPK Mati','Mati'],['appkW','PPK Wercia','Wercia']].forEach(([id,n,o])=>{if(!c.accs.some(a=>a.id==id||a.name==n)){const a={id,name:n,grp:'inv',owner:o,open:0};c.accs.push(a);saveAcc(a)}});merge(H,{ppkAcc:true});render()}}
    else if(!s.metadata.fromCache&&!seeding){seeding=true;S.cfg=seed();render();saveCfg()}
  },onErr));
  unsub.push(onSnapshot(MC(),{includeMetadataChanges:true},s=>{const all=[];S.months=new Set();
    s.docs.forEach(d=>{S.months.add(d.id);const m=d.data()?.tx||{};for(const[id,t]of Object.entries(m))all.push({id,...t})});
    S.tx=all;syncLabel(s.metadata);render()},onErr));
  unsub.push(onSnapshot(PLC(),{includeMetadataChanges:true},s=>{const p={};s.docs.forEach(d=>p[d.id]={...d.data()});S.plans=p;S.plansSrv=!s.metadata.fromCache;render()},onErr));
  unsub.push(onSnapshot(META(),s=>{S.backup=s.exists()?s.data():null;render()},onErr));
  unsub.push(onSnapshot(SLIPS(),s=>{const p={};s.docs.forEach(d=>p[d.id]=clone(d.data().s||{}));S.slips=p;render()},onErr));
  unsub.push(onSnapshot(GOALS(),s=>{const g={};s.docs.forEach(d=>g[d.id]=clone(d.data()));S.goals=g;render()},onErr));
  unsub.push(onSnapshot(INV(),s=>{const p={};s.docs.forEach(d=>p[d.id]=clone(d.data()));S.inv=p;render()},onErr));
});
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
Object.assign(window,{editRound,setFixSub,setPayView,editInc,openSlip,closeSlip,slipCalc,slipRow,slipCopy,slipSuggest,saveSlip,delSlip,setKotki,showTour,showNews,setAccTab,moveAcc,setBF,setAccSub,showWealth,setRecScope,openRecon,closeRecon,recSum,applyRecon,addSavAcc,editSavAcc,updateValue,allocGoal,setSavTarget,setSub,setAna,editGoal,setQ,setF,clearF,editCat,addCat,moveCat,calendarExport,goFixed,$,S,render,tog,openTx,setPlan,copyPlan,recon,addAcc,editAcc,addSub,renSub,delSub,setWho,editFixed,toggleFixed,delInv,exportJson,logout});
