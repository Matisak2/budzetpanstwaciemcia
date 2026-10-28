import {onAuthStateChanged,signInWithEmailAndPassword,signOut,setPersistence,browserLocalPersistence} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {doc,collection,onSnapshot,setDoc,waitForPendingWrites} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {catIcon,catsEmpty} from './art.js';
import {scene} from './cats.js';
import {CELEBRATE,HELP,NEWS_V,kotki} from './guide.js';
import {hbarsH} from './charts.js';
import {HUES,OWN,OWN_COL,SEASON,catHue,pastel,seed} from './data.js';
import {IICON,limitOf,paidInYear,wrapOf,intOf,intLabel} from './inv.js';
import {saveSplitP} from './today.js';
import {yearBody,yearStats} from './report.js';
import {avgActuals,actuals,agg,balance,cleanCat,dueAlerts,liveOf,status,subsMap,savFlow,savIds,firstYm,planOf,yearPlanOf,yearSubs,fixedTwin,fixedPlanGap} from './logic.js';
import {$,MN,MNG,addDays,addMonths,clone,daysIn,esc,f2,fmtIn,ls,sleep,td,zl,zl0,money,curSym,fxPlus,fxTxt,priv,plu} from './util.js';
import {auth,fdb,applySeason,DEMO,S,catL,greetH,okCats,showTour,showNews,maybeIntro,askBirth,celebrate,coinSum,editRound,setKotki,toast,err,ask,CUR,accCur,isP,am,fxOf,fxSmall,stripFx,accOwner,accOpts,H,MARKET,DEBTS,HOLD,SLIPS,MC,PLC,GOALS,w,merge,fromDoc,saveCfg,saveCat,liveById} from './core.js';
import {catColor,refundsOf,setType,updCoin,updFx,updSave,autoWho,closePick,RMETA,phMeterH,openTx,closeSheet,saveTx,delTx,markRefund,wireSheet} from './sheet.js';
import {editInt,setPlan,planToFixed,fixPlan,copyPlan,addAcc,editAcc,addSub,renSub,delSub,subMenu,hideSub,editCat,addCat,ACCTAB,setAccTab,moveAcc,moveCat,lookApply,setHide,setLook,lookH,setWho,fixedPaid,editFixed,toggleFixed,goFixed,invAccStats,goalOwner,goalAlloc,isPod,poolNow,goalProgress,editGoal,allocGoal,setSavTarget,setSub,recAccs,setRecScope,openRecon,closeRecon,recSum,applyRecon,addSavAcc,editSavAcc,exportJson,META,importFile,backupH,amtQuery,txMatches,txRowH,txListH,setQ,setF,clearF,togF} from './actions.js';
import {segL,fixSegH,setFixSub,setPayView,payH,fixYearH,deletedH,restoreTx,changesH,siriHelp,ulgaInfo,editInc,openSlip,closeSlip,slipCalc,slipRow,slipCopy,slipSuggest,slipNetto,slipReal,slipH,saveSlip,delSlip,pensLinkH,linkInc} from './salary.js';
import {intMini,intCardH,bookInt,addTerm,accById,instsOf,matH,openInst,closeInst,instPageH,editInst,addLot,setPrice,setUnits,bondRatesDlg,saveInstVal,openValues,valuesH,saveValues,autoValH,saveAutoVal,limitPropH,acceptLimits,limitsH,editLimits,setGain,gainH,fireH,odloz,yearLineH,goYear,yearH,setYearAcc,editYear,payYear} from './savings.js';
import {debtSum,setAccView,accSegH,debtsH,editDebt,payoffDebt,setDebtLeft,lentBack,moveLent,toPlanH,fillAvg,projectsH,editProj,openProj,closeProj,projPageH,editRem,doneRem,cascadeH,setCascade} from './debts.js';
import {anaFull,setAnaMode,exportCsv,wrapped,anaMonth,anaYear} from './analysis.js';
import {checkPush,enablePush,disablePush,shareDemo,demoCardH,pushCardH,todayItems,runGo,goFromHash,todayGo,ignoreCheck,addRecFixed,recH,closeToday,showToday,updToday,maybeToday,wireToday} from './todayui.js';
import {openClose,closeClose,closeCardH,closeLinkH,closePageH,reconOk,closeStep,closePlan,closeRecAll} from './close.js';

wireSheet();wireToday();
let seeding=false;

/* ---------- render ---------- */
export const accN=id=>S.cfg.accs.find(a=>a.id===id)?.name||'?';
/* 💰 an account that collects money for paying off liabilities: what of it is for which one, the rest is free */
const saveInH=id=>{const s=saveSplitP(S.cfg,liveOf(S.tx),S.debts,id,td());if(!s.sum)return'';
  return`<div class="mini svin">💰 w tym na spłatę: ${s.L.filter(x=>x.saved).map(x=>`${esc(x.d.name)} ${zl0(x.saved)}`).join(' · ')} · <b class="${s.free<0?'t-exp':''}">wolne ${zl0(s.free)}</b></div>`};
const barH=st=>st.pct===null?'<div class="bar"></div>':`<div class="bar ${st.k}"><i style="width:${Math.min(100,Math.max(0,st.pct)).toFixed(1)}%"></i></div>`;
function trioH(type,name,plan,act,planInput,fx){const st=status(type,plan,act);
  return`<div class="r1">${name}<span class="pill ${st.k}">${esc(st.txt)}</span></div><div class="trio"><span><em>Plan</em>${planInput||`<b>${zl(plan)}</b>`}</span><span><em>${type=='inc'?'Wpłynęło':'Wydano'}</em><b>${zl(act)}</b>${fx?`<small class="fxs">${fx.startsWith('−')?'':'+ '}${esc(fx)}</small>`:''}</span></div>${barH(st)}${st.msg?`<div class="smsg ${st.k}">${esc(st.msg)}</div>`:''}`}
/* tap on "Na kontach": current accounts split by person */
/* „Na kontach ›” → 👛 Konta (who has what is shown there, in „Czyj majątek”) */
function showWealth(){S.accView='acc';goTab('acc')}
function setBF(k){S.bf=k;render()}
/* long amounts get a smaller font instead of being cut („14 109,1…”); a long month name gets shortened on narrow phones */
function fitNums(){document.querySelectorAll('#app .kpi .v,#app .worth .v').forEach(e=>{e.style.fontSize='';let fs=parseFloat(getComputedStyle(e).fontSize),n=0;
    const over=()=>e.scrollWidth>e.clientWidth+1||[...e.children].some(c=>c.getBoundingClientRect().right>e.getBoundingClientRect().right+1);
    while(over()&&fs>14&&n++<10){fs-=1.5;e.style.fontSize=fs+'px'}});
  const L=$('mlabel');if(L&&L.scrollWidth>L.clientWidth+1&&L.dataset.short)L.textContent=L.dataset.short}
/* 💰 Majątek = 🐷 Oszczędności + 👛 Konta */
const majSegH=()=>`<div class="seg seg2 majseg">${[['sav','🐷 Oszczędności'],['acc','👛 Konta']].map(([k,l])=>`<button aria-pressed="${S.tab==k}" onclick="${k=='acc'?"S.accView='acc';":''}goTab('${k}')">${segL(l)}</button>`).join('')}</div>`;
function setAccSub(k){S.accSub=k;window.scrollTo(0,0);render()}

export function render(){
  const tabOf=S.tab=='sav'||S.tab=='acc'?'maj':S.tab=='ana'?'dash':S.tab;document.querySelectorAll('.tabs [data-tab]').forEach(b=>{if(b.dataset.tab==tabOf)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  if(S.tab=='set')$('gearBtn').setAttribute('aria-current','page');else $('gearBtn').removeAttribute('aria-current');
  document.body.classList.toggle('w-theme',S.who=='Wercia');lookApply();
  const[y,m]=S.ym.split('-').map(Number);applySeason();$('mlabel').textContent=S.tab=='ana'&&S.ana=='y'?'Rok '+y:SEASON[m-1][2]+' '+MN[m-1]+' '+y;$('mlabel').dataset.short=S.tab=='ana'&&S.ana=='y'?'':SEASON[m-1][2]+' '+MN[m-1].slice(0,3)+' '+y;
  if(!S.cfg)return;
  const ae=document.activeElement;if(ae&&ae.tagName=='INPUT'&&$('app').contains(ae)){S.pend=true;return}S.pend=false;
  /* pl = the plan used everywhere (typed + 📅 yearly expenses due this month); plS = only what was typed (the input fields) */
  const tx=liveOf(S.tx),end=S.ym+'-32',start=S.ym+'-00',plS=S.plans[S.ym]||{},pl=planOf(S.cfg,S.plans,tx,S.ym),act=actuals(S.cfg,tx,S.ym),FX=agg(S.cfg,tx,S.ym).fx;
  const sum=(ty,f)=>S.cfg.cats.filter(c=>c.type==ty).reduce((a,c)=>a+c.subs.reduce((b,s)=>b+f(s),0),0);
  const inc=sum('inc',s=>act[s.id]||0),exp=sum('exp',s=>act[s.id]||0),pinc=sum('inc',s=>pl[s.id]||0),pexp=sum('exp',s=>pl[s.id]||0);
  const tot=g=>S.cfg.accs.filter(a=>a.grp==g&&isP(a)).reduce((a,c)=>a+balance(S.cfg,tx,c.id,end),0),totFx=g=>fxOf(S.cfg.accs.filter(a=>a.grp==g),a=>balance(S.cfg,tx,a.id,end));
  /* savings = savings accounts + money put into investments, at a given date; change over the shown month */
  const savAt=before=>S.cfg.accs.filter(a=>(a.grp=='sav'||a.grp=='inv')&&isP(a)).reduce((a,c)=>a+balance(S.cfg,tx,c.id,before),0);
  const savEnd=savAt(end),savDelta=savEnd-savAt(start);
  /* 🐷 put aside = money moved in (not price changes of investments – those are „gain”) */
  const SVI=savIds(S.cfg),flowM=savFlow(S.cfg,tx,SVI,S.ym),tg=S.savTarget||0;
  const trendH=d=>d>0?`<span class="trend up" title="Przybyło w tym miesiącu">▲ +${zl0(d)}</span>`:d<0?`<span class="trend down" title="Ubyło w tym miesiącu">▼ −${zl0(-d)}</span>`:'';
  const pct=(a,p)=>p?' · <span style="white-space:nowrap">'+Math.round(a/p*100)+'% planu</span>':'';
  let h='';
  const al=dueAlerts(S.cfg.fixed||[],tx,td()).map(x=>({...x,tw:x.when!='inc'&&fixedTwin(S.cfg,tx,x.f,x.due.slice(0,7))}));
  const alertH=al.length?`<button class="alert" onclick="goFixed()"><b>🔔 Do odhaczenia w 📌 Stałe</b>${al.map(x=>`<span class="it"><span>${x.when=='inc'?'📥 ':''}${esc(x.f.name)}${x.when=='inc'?'':' · '+am(x.f.amount,x.f.acc)}</span><span class="when ${x.when=='late'&&!x.tw?'late':''}">${x.tw?'💡 jest podobny wpis – połącz':x.when=='inc'?'czeka na odhaczenie':x.when=='late'?'po terminie ('+x.due.slice(8)+'.'+x.due.slice(5,7)+')':x.when=='today'?'dziś':'jutro'}</span></span>`).join('')}</button>`:'';

  if(S.tab=='dash'&&S.proj)h+=projPageH();
  else if(S.tab=='dash'&&S.close)h+=closePageH();
  else if(S.tab=='dash'){
    setTimeout(autoPlan,0);const AVG=avgActuals(S.cfg,tx,S.ym,3).avg,YS=yearSubs(S.cfg),YP=yearPlanOf(S.cfg,tx,S.ym).items;
    if(S.ym==td().slice(0,7))h+=greetH(S.cfg,S.tx);
    {const bad=todayItems().filter(x=>x.k=='bad');if(bad.length)h+=`<button class="urgent" onclick="showToday()">⏰ ${bad.length} ${plu(bad.length,'sprawa wymaga','sprawy wymagają','spraw wymaga')} uwagi – ${esc(bad[0].text.slice(0,48))}${bad[0].text.length>48?'…':''} ›</button>`}
    h+=alertH;
    h+=closeCardH();
    h+=yearLineH();
    h+=backupH();
    h+=`<div class="kpis">
      <div class="kpi k-em"><div class="l">Przychody</div><div class="v num">${zl(inc)}${fxSmall(FX.inc)}</div><div class="s">plan ${zl0(pinc)}${pct(inc,pinc)}</div></div>
      <div class="kpi k-ro"><div class="l">Wydatki</div><div class="v num">${zl(exp)}${fxSmall(FX.exp)}</div><div class="s">plan ${zl0(pexp)}${pct(exp,pexp)}</div></div>
      <div class="kpi k-sk"><div class="l">Bilans miesiąca</div><div class="v num">${zl(inc-exp)}</div><div class="s">plan ${zl0(pinc-pexp)}</div></div>
      <button class="kpi k-in kbtn" onclick="showWealth()" aria-label="Na kontach – pokaż konta"><div class="l">Na kontach ›</div><div class="v num">${zl(tot('cur'))}${fxSmall(totFx('cur'))}</div><div class="s">${S.cfg.accs.some(a=>a.grp=='sub')?`subkonta ${zl0(tot('sub'))}${fxPlus(totFx('sub'))} · `:''}oszczędności ${zl0(savEnd)}</div>${savDelta?`<div class="tr">${trendH(savDelta)}</div>`:''}</button></div>`;
    if(flowM.flow||flowM.gain||tg)h+=`<button class="alert info savl" onclick="goTab('sav')"><b>🐷 Odłożone w tym miesiącu: <span class="num ${flowM.flow<0?'t-exp':''}">${flowM.flow>0?'+':''}${zl(flowM.flow)}</span>${tg?` z ${zl0(tg)}`:''}</b><span class="mini">wpłaty na oszczędności i inwestycje${tg?` · ${Math.max(0,Math.round(flowM.flow/tg*100))}% celu`:''}${flowM.gain?` · inwestycje ${flowM.gain>0?'zarobiły':'straciły'} ${zl0(Math.abs(flowM.gain))}`:''}</span></button>`;
    h+=`<button class="anabtn" onclick="goTab('ana')"><span>📈</span><b>Analiza</b><small>wykresy, podsumowanie, Mati ↔ Wercia</small><i>›</i></button>`;
    /* filter: everything / positions over plan (incl. spending without a plan) / positions with no plan */
    const BF=S.bf,stOf=(c,s)=>status(c.type,pl[s.id]||0,act[s.id]||0);
    const isE=s=>!(pl[s.id]||0)&&!(act[s.id]||0)&&!fxTxt(FX.sub[s.id]);
    /* 🙈 hidden positions / categories are left out – unless they have a plan or spending this month (sums must always add up) */
    const VC=S.cfg.cats.map((c,i)=>({...c,_i:i,subs:c.subs.filter(s=>!(s.hidden||c.hidden)||!isE(s))})).filter(c=>!c.hidden||c.subs.length);
    const keep=(c,s)=>BF=='all'||(BF=='over'?c.type=='exp'&&stOf(c,s).k=='over':!(pl[s.id]||0));
    const nOver=VC.reduce((a,c)=>a+c.subs.filter(s=>c.type=='exp'&&stOf(c,s).k=='over').length,0),nNo=VC.reduce((a,c)=>a+c.subs.filter(s=>!(pl[s.id]||0)).length,0);
    h+=toPlanH();
    /* 📌 the plan of a position lower than its fixed payments – it would be „over plan” every month */
    const GAP=S.ym>=td().slice(0,7)?fixedPlanGap(S.cfg,pl).filter(x=>!x.sub.hidden&&!x.sub.cat.hidden):[],gapOf=Object.fromEntries(GAP.map(x=>[x.sub.id,x]));
    if(GAP.length)h+=`<div class="note">📌 <b>Plan niższy niż opłaty stałe:</b> ${GAP.map(x=>`${esc(x.sub.name)} – plan ${zl0(x.plan)}, opłaty stałe ${zl0(x.fix)}`).join(' · ')}.<br><button class="btn sm primary" style="margin-top:6px" onclick="planToFixed()">Podnieś plan do opłat stałych</button></div>`;
    h+=`<div class="seg seg3 bfilt">${[['all','Wszystko'],['over','▲ Ponad plan'+(nOver?` (${nOver})`:'')],['none','Bez planu'+(nNo?` (${nNo})`:'')]].map(([k,l])=>`<button aria-pressed="${BF==k}" onclick="setBF('${k}')">${l}</button>`).join('')}</div>`;
    let shownCats=VC.map(c=>({c,i:c._i,subs:c.subs.filter(s=>keep(c,s))})).filter(x=>BF=='all'||x.subs.length);
    const anyData=shownCats.some(x=>!x.c.subs.every(isE)),emptyCats=BF=='all'&&anyData?shownCats.filter(x=>x.c.subs.every(isE)&&!S.showCat[x.c.id]):[];
    if(BF=='all'){shownCats=shownCats.filter(x=>!emptyCats.includes(x));if(anyData)shownCats.forEach(x=>{x.hid=S.showEmpty[x.c.id]||x.c.subs.every(isE)?0:x.subs.filter(isE).length;if(x.hid)x.subs=x.subs.filter(s=>!isE(s))})}
    if(!shownCats.length)h+=BF=='over'?catsEmpty('🎉 W tym miesiącu nic nie przekroczyło planu.',1,'happy'):catsEmpty('💚 Każda pozycja ma już swój plan.',1,'ivoHappy');
    h+=shownCats.map(({c,i,subs,hid})=>{const pa=c.subs.reduce((a,s)=>a+(pl[s.id]||0),0),ac=c.subs.reduce((a,s)=>a+(act[s.id]||0),0),o=BF=='all'?S.open[c.id]:!S.fold[c.id];
      const cfx=fxTxt(FX.cat[c.id]);
      return`<section class="cat${status(c.type,pa,ac).k=='zero'&&!cfx?' dim':''}" style="${pastel(catHue(c,i))}"><button class="ch" onclick="tog('${c.id}')" aria-expanded="${!!o}">${trioH(c.type,`<span class="nm"><span class="chev">${o?'▾':'▸'}</span><span class="cico">${catIcon(c)}</span>${esc(catL(c))}</span>`,pa,ac,'',cfx)}</button>`+
        (o?subs.map(s=>{const a=act[s.id]||0,p=pl[s.id]||0,ps=plS[s.id]||0,sfx=fxTxt(FX.sub[s.id]),yi=YP.filter(x=>x.it.sub==s.id);
          return`<div class="sub${status(c.type,p,a).k=='zero'&&!sfx?' dim':''}">${trioH(c.type,`<span class="n">${esc(s.name)}</span>`,p,a,`<input class="planin" value="${fmtIn(ps)}" placeholder="${AVG[s.id]&&!ps&&!YS.has(s.id)?fmtIn(Math.ceil(AVG[s.id]/1000)*1000):'0'}" inputmode="decimal" aria-label="Plan: ${esc(s.name)}" onchange="setPlan('${s.id}',this.value)">`,sfx)}${yi.length?`<div class="mini">📅 do planu doliczone: ${yi.map(x=>`${esc(x.it.name)} ${zl(x.amt)}`).join(' · ')} (wydatek roczny)</div>`:''}${gapOf[s.id]?`<div class="mini t-exp">📌 opłaty stałe w tej pozycji: ${zl(gapOf[s.id].fix)} – więcej niż plan</div>`:''}</div>`}).join('')+(hid?`<button class="submore" onclick="showEmpty('${c.id}')">＋ ${hid} ${plu(hid,'pusta pozycja','puste pozycje','pustych pozycji')} ›</button>`:BF=='all'&&S.showEmpty[c.id]&&c.subs.some(isE)?`<button class="submore" onclick="showEmpty('${c.id}')">− schowaj puste</button>`:''):'')+`</section>`}).join('');
    if(emptyCats.length)h+=`<div class="emptycats"><span class="mini">Puste w tym miesiącu:</span>${emptyCats.map(({c})=>`<button class="chip" onclick="showCat('${c.id}')">${catIcon(c)} ${esc(cleanCat(c.name).charAt(0)+cleanCat(c.name).slice(1).toLowerCase())}</button>`).join('')}</div>`;
    h+=`<div class="btns" style="justify-content:center"><button class="btn sm" onclick="copyPlan()">Skopiuj plan z poprzedniego miesiąca</button>${closeLinkH()}</div>`;
    h+=projectsH()}

  else if(S.tab=='tx'){
    const F=S.f,fc=F.cat&&S.cfg.cats.find(c=>c.id==F.cat),sel=(k,opts,st='')=>`<select aria-label="${k}" onchange="setF('${k}',this.value)"${st?` style="${st}"`:''}>${opts.map(o=>o.group?`<optgroup label="${esc(o.group)}">${o.items.map(i=>`<option value="${esc(i[0])}"${F[k]==i[0]?' selected':''}>${esc(i[1])}</option>`).join('')}</optgroup>`:`<option value="${esc(o[0])}"${F[k]==o[0]?' selected':''}>${esc(o[1])}</option>`).join('')}</select>`;
    const active=F.q||F.type||F.who||F.acc||F.cat||F.scope!='m',nF=[F.type,F.who,F.acc,F.cat].filter(Boolean).length,fo=S.fShown=S.fOpen??!!nF;
    /* the search and the period stay on top; kind / person / account / category are under one „Filtry” button (open when used) */
    h+=`<div class="filters"><input id="fq" type="search" enterkeyhint="search" placeholder="🔍 Szukaj, np. Biedronka albo >200" value="${esc(F.q)}" oninput="setQ(this.value)" autocomplete="off">
      <div class="frow ftop">${sel('scope',[['m','Ten miesiąc'],['y','Cały rok '+S.ym.slice(0,4)],['a','Wszystko']])}<button class="fbtn" aria-expanded="${fo}" aria-pressed="${!!nF}" onclick="togF()">⚙️ Filtry${nF?` (${nF})`:''} ${fo?'▴':'▾'}</button></div>
      ${fo?`<div class="frow">${sel('type',[['','Wszystkie rodzaje'],['exp','Wydatki'],['inc','Przychody'],['tr','Przelewy'],['adj','Wyrównania']])}${sel('who',[['','Wszyscy'],['Mati','Mati'],['Wercia','Wercia']])}${sel('acc',[['','Wszystkie konta'],...accOpts()])}${sel('cat',[['','Wszystkie kategorie'],...S.cfg.cats.map(c=>[c.id,catL(c)])],fc?catColor(fc)+';background:var(--c);color:var(--c3);border-color:var(--c4);font-weight:700':'')}</div>`:''}
      ${active?`<button class="btn sm" style="align-self:flex-start" onclick="clearF()">✕ Wyczyść filtry</button>`:''}</div><div id="txlist">${txListH()}</div>`}

  else if(S.tab=='ana'&&S.report)h+=`<div class="r1 noprint"><button class="btn sm" onclick="closeReport()">‹ Analiza</button><button class="btn sm primary" onclick="window.print()">🖨️ Zapisz jako PDF / drukuj</button></div>
    <div class="mini noprint">Na telefonie: „Zapisz jako PDF” otwiera okno drukowania – wybierz „Zapisz jako PDF” albo udostępnij plik.</div>
    <div class="report">${yearBody(yearStats({cfg:S.cfg,tx,hraw:S.hraw},S.report,td()),new URL('./',location.href).href.replace(/demo\/$/,''))}</div>`;
  else if(S.tab=='ana'){
    h+=`<button class="btn sm" style="align-self:flex-start" onclick="goTab('dash')">‹ Budżet</button>`;
    h+=`<div class="r1" style="gap:8px;flex-wrap:wrap;justify-content:center"><div class="seg">${[['m','Miesiąc'],['y','Rok']].map(([k,l])=>`<button aria-pressed="${S.ana==k}" onclick="setAna('${k}')">${l}</button>`).join('')}</div><div class="seg">${[['basic','Podstawowa'],['full','Pełna']].map(([k,l])=>`<button aria-pressed="${(anaFull()?'full':'basic')==k}" onclick="setAnaMode('${k}')">${l}</button>`).join('')}</div></div>`;
    if(S.ana=='y')h+=`<button class="anabtn" onclick="openReport('${S.ym.slice(0,4)}')"><span>🖨️</span><b>Podsumowanie roku ${S.ym.slice(0,4)}</b><small>jedna strona do zapisania jako PDF albo wydruku</small><i>›</i></button>`;
    h+=S.ana=='y'?anaYear({cfg:S.cfg,tx,ym:S.ym,savAt,full:anaFull()}):anaMonth({cfg:S.cfg,tx,ym:S.ym,full:anaFull()})}

  else if(S.tab=='fix'&&S.slip)h+=slipH();
  else if(S.tab=='fix'&&S.fixSub=='pay')h+=fixSegH()+payH();
  else if(S.tab=='fix'&&(S.fixSub=='year'||S.fixSub=='rem'))h+=fixSegH()+yearH();
  else if(S.tab=='fix'){
    h+=fixSegH()+(S.ym==td().slice(0,7)?recH():'')+pensLinkH();
    if(S.ym==td().slice(0,7)||al.some(x=>x.due.startsWith(S.ym)))h+=alertH;
    const isCur=td().startsWith(S.ym),today=+td().slice(8),all=(S.cfg.fixed||[]).slice().sort((a,b)=>(+a.day)-(+b.day)||a.name.localeCompare(b.name,'pl'));
    const row=(f,paid)=>{const inc=f.kind=='inc',late=!paid&&isCur&&today>Math.min(+f.day,daysIn(S.ym)),tw=!paid&&!inc&&f.kind!='tr'?fixedTwin(S.cfg,liveOf(S.tx),f,S.ym):null;
      const ppk=paid&&inc?liveOf(S.tx).filter(t=>t.ppkOf===paid.id):[];
      return`<div class="fx ${paid?'done':''}"><button class="box${paid&&S.justChecked==f.id?' pop':''}" role="checkbox" aria-checked="${!!paid}" aria-label="${esc(f.name)}" onclick="toggleFixed('${f.id}')">${paid?'✓':''}</button><button class="info" onclick="editFixed('${f.id}')"><b>${esc(f.name)}</b><span class="mini">${paid?(inc?'wpłynęło ':'zapłacono ')+paid.date.slice(8)+'.'+paid.date.slice(5,7)+' · '+esc(accN(paid.acc))+(ppk.length?' · PPK '+zl0(ppk.reduce((a,t)=>a+t.amount,0)):''):(tw?`<span class="t-inc">💡 jest podobny wpis z ${tw.date.slice(8)}.${tw.date.slice(5,7)} – stuknij kwadracik, żeby połączyć</span> · `:late?`<span class="late">${inc?'czeka na odhaczenie':'po terminie'}</span> · `:'')+(inc?'zwykle do ':'termin do ')+f.day+'. · '+esc(accN(f.acc))+(f.kind=='tr'?' → '+esc(accN(f.to)):'')+(inc&&f.ppk?' · z PPK':'')}${f.until&&!inc?` · <span class="${f.until<addDays(td(),62)?'late':''}">📄 umowa do ${f.until.split('-').reverse().join('.')}</span>`:''}</span></button><span class="num ${inc?'t-inc':''}">${paid?am(paid.amount,paid.acc):inc&&f.vary?'—':(inc?'~':'')+am(f.amount,f.acc)}</span></div>`};
    const block=(kind)=>{const fx=all.filter(f=>(f.kind||'exp')==kind),inc=kind=='inc',trf=kind=='tr';
      let x=`<div class="r1" style="padding:0 4px"><span class="h2" style="margin:0">${inc?'📥 Przychody stałe':trf?'🔁 Stałe przelewy':'📤 Opłaty stałe'}</span><button class="btn sm dark" onclick="editFixed(null,'${kind}')">+ ${inc?'Przychód':trf?'Przelew':'Opłata'}</button></div>`;
      if(!fx.length)return x+`<div class="mini" style="padding:0 6px">${inc?'Np. najem mieszkania – co miesiąc odhaczysz, ile faktycznie wpłynęło. Pensje wpisujesz w 💼 Pensje.':trf?'Np. 500 zł co miesiąc na oszczędności albo zrzutka na konto wspólne – odhaczasz, gdy przelew wyjdzie.':'Dodaj np. czynsz, prąd albo Spotify – co miesiąc odhaczysz je na liście.'}</div>`;
      const rows=fx.map(f=>({f,paid:fixedPaid(f.id,S.ym)})),done=rows.filter(r=>r.paid),left=rows.filter(r=>!r.paid);
      const sumDone=done.reduce((a,r)=>a+r.paid.amount,0),sumLeft=left.reduce((a,r)=>a+(r.f.vary?0:r.f.amount),0);
      x+=`<div class="prog"><div class="r1"><b>${inc?'Wpłynęło':trf?'Przelane':'Zapłacone'} ${done.length} z ${rows.length}</b><span class="num">${zl(sumDone)}</span></div><div class="bar"><i style="width:${(done.length/rows.length*100).toFixed(1)}%;background:#86efac"></i></div><div class="mini">${done.length==rows.length?`<b class="t-inc">✓ ${inc?'wszystko wpłynęło':trf?'wszystko przelane':'wszystko zapłacone'}</b>`:`${inc?'Jeszcze oczekiwane: ok. ':'Zostało do zapłaty: '}<b class="num" style="color:var(--fg)">${zl(sumLeft)}</b>`}</div></div>`;
      return x+`<div class="list">${rows.map(r=>row(r.f,r.paid)).join('')}</div>`};
    if(!all.length)h+=catsEmpty('Dodaj stałe przychody (np. pensje) i opłaty (np. czynsz, prąd, Spotify).<br>Co miesiąc odhaczysz je na liście, a wpisy same trafią do rejestru.',0,'bell');
    h+=block('inc')+block('exp')+fixYearH(all)+block('tr');
    h+=`<div class="mini" style="text-align:center">Stuknij kwadracik, żeby odhaczyć. Stuknij nazwę, żeby zmienić.</div>`}

  else if(S.tab=='sav'){
    const tom=addDays(td(),1),SV=a=>(a.grp=='sav'||a.grp=='inv');
    const shown=a=>SV(a)&&(!a.archived||balance(S.cfg,tx,a.id,end)||balance(S.cfg,tx,a.id,start));
    const OWN=['Mati','Wercia','Wspólne'],cols={Mati:'#7fb0ec',Wercia:'#f0a3c3','Wspólne':'#6fd0a8'};
    if(!['all',...OWN].includes(S.sub))S.sub='all';
    if(S.instAcc||S.values)h+=S.values?valuesH():instPageH();else{
    h+=majSegH()+`<div class="seg seg4">${[['all','Razem'],['Mati','Mati'],['Wercia','Wercia'],['Wspólne','Wspólne']].map(([k,l])=>`<button aria-pressed="${S.sub==k}"${k=='Wercia'?' class="wbtn"':''} onclick="setSub('${k}')">${l}${k=='Wercia'?' 🌸':''}</button>`).join('')}</div>`;
    const actH=o=>`<div class="g2"><button class="btn primary" onclick="odloz('${o}')">🐷 Odłóż</button><button class="btn" onclick="openValues()">📈 Aktualizuj wartości</button></div>`;
    const monthlySave=()=>{const cur=td().slice(0,7),first=firstYm(tx),d=[];for(let k=1;k<=6;k++){const m=addMonths(cur,-k);if(m<first)break;d.push(savFlow(S.cfg,tx,SVI,m).flow)}return d.length?Math.round(d.reduce((a,v)=>a+v,0)/d.length):Math.max(0,flowM.flow)};
    const ownFx=(o,before)=>fxOf(S.cfg.accs.filter(a=>SV(a)&&(!o||accOwner(a)==o)),a=>balance(S.cfg,tx,a.id,before));
    const ownAt=(o,before)=>S.cfg.accs.filter(a=>SV(a)&&isP(a)&&accOwner(a)==o).reduce((x,a)=>x+balance(S.cfg,tx,a.id,before),0);
    /* 🛟 the safety cushion: only savings accounts – IKE, IKZE, PPK and investments cannot be taken out quickly without a loss; a „Poduszka…” account is shown apart */
    const cushion=owner=>{const curYm=td().slice(0,7),past=[];for(let k=1;k<=6;k++){const e=agg(S.cfg,tx,addMonths(curYm,-k)).exp;if(e>0)past.push(e)}
      const avgE=past.length?past.reduce((a,v)=>a+v,0)/past.length:agg(S.cfg,tx,curYm).exp;if(!(avgE>0))return'';
      const L=S.cfg.accs.filter(a=>a.grp=='sav'&&isP(a)&&(!owner||accOwner(a)==owner)),pool=L.reduce((x,a)=>x+balance(S.cfg,tx,a.id,tom),0),pod=L.find(a=>!a.archived&&isPod(a));
      /* money assigned to goals is not a cushion (a goal may be paid from investments too – then the cushion shows a bit too little, never too much) */
      const inGoals=Object.values(S.goals).filter(g=>!owner||goalOwner(g)==owner).reduce((a,g)=>a+Math.max(0,goalAlloc(g)),0),free=Math.max(0,pool-inGoals);
      const m=Math.max(0,free/avgE),mp=pod?Math.max(0,balance(S.cfg,tx,pod.id,tom)/avgE):0,lvl=m<3?['bad','Warto ją powiększyć – zwykle radzi się mieć zapas na 3–6 miesięcy wydatków.']:m<6?['ok','Dobry poziom – zapas na 3–6 miesięcy to zalecane minimum.']:['ok','Bardzo bezpieczny poziom.'];
      return`<section class="chart"><div class="ct"><b>🛟 Poduszka bezpieczeństwa${owner?' – '+owner:''}</b><span class="mini">średnie wydatki domu: ${zl0(avgE)}/mies. (${past.length?'ostatnie '+past.length+' mies.':'ten miesiąc'})</span></div><div class="cush"><span class="num">${m.toFixed(1).replace('.',',')}</span><span>mies. życia bez przychodów</span></div><div class="gbar"><i style="width:${Math.min(100,m/6*100).toFixed(1)}%"></i></div><div class="mini ${lvl[0]=='bad'?'t-exp':''}">${lvl[1]}</div>
        <div class="mini">Liczę ${owner?'wspólne ':''}konta oszczędnościowe (${zl0(pool)})${inGoals?` minus pieniądze przydzielone do celów (${zl0(inGoals)})`:''} – bez IKE, IKZE, PPK i inwestycji, bo tych nie da się szybko wypłacić bez straty.${pod?` W tym „${esc(pod.name)}”: ${mp.toFixed(1).replace('.',',')} mies.`:''}</div></section>`};
    const accRow=a=>{const e=balance(S.cfg,tx,a.id,end),s0=balance(S.cfg,tx,a.id,start),dlt=e-s0,inv=a.grp=='inv',wr=inv?wrapOf(a):'';let extra=inv?'':intMini(a,tx);
      if(wr=='ike'||wr=='ikze'){const y=td().slice(0,4),lim=limitOf(a,y,S.hraw?.limits),p=paidInYear(liveOf(S.tx),a.id,y);extra+=`<div class="mini">🛡️ ${wr.toUpperCase()} ${y}: wpłacono ${zl0(p)} z ${zl0(lim)}</div>`}
      if(inv){const st=invAccStats(S.cfg,tx,a.id,tom),ago=st.last?Math.floor((Date.now()-new Date(st.last+'T12:00:00'))/864e5):null;
        extra=`${st.own||st.emp?`<div class="mini">🏦 moje wpłaty <b style="color:var(--fg)">${zl0(st.own)}</b> · pracodawca <b style="color:var(--fg)">${zl0(st.emp)}</b></div>`:''}<div class="mini">wpłacono ${zl0(st.paid)} · <b class="${st.chg>=0?'t-inc':'t-exp'}">${st.chg>=0?'+':''}${zl0(st.chg)}${st.pct!==null?' ('+(st.chg>=0?'+':'')+st.pct.toFixed(1).replace('.',',')+'%)':''}</b></div><div class="mini">${st.last?`wartość z ${st.last.split('-').reverse().join('.')}${ago>30?' · <b class="t-exp">warto zaktualizować</b>':ago>0?' ('+ago+' dni temu)':' (dziś)'}`:'wartości jeszcze nie aktualizowano'}</div>`}
      return`<div class="acc"><div style="min-width:0;flex:1"><div class="r1"><b>${inv?'<span class="badge">inwest.</span>':''}${esc(a.name)}</b>${a.archived?'<span class="mini">usunięte</span>':`<button class="btn sm" style="padding:3px 9px" aria-label="Edytuj konto" onclick="editSavAcc('${a.id}')">⋯</button>`}</div><div class="mini">w tym miesiącu: <span class="${dlt>0?'t-inc':dlt<0?'t-exp':''}">${dlt>0?'+':''}${money(dlt,CUR(a))}</span>${coinSum(S.ym,null,a.id)?` · 🪙 drobne ${money(coinSum(S.ym,null,a.id),CUR(a))}`:''}</div>${extra}${saveInH(a.id)}
        ${a.archived?'':`<div class="btns" style="gap:6px;margin-top:6px"><button class="chip" onclick="openTx(null,{type:'tr',to:'${a.id}'})">↓ Wpłać</button><button class="chip" onclick="openTx(null,{type:'tr',from:'${a.id}'})">↑ Wypłać</button>${!inv?`<button class="chip" style="background:#fef3c7;color:#92400e" onclick="editInt('${a.id}')">💰 Oprocentowanie</button>`:''}${inv?`<button class="chip" style="background:#e0f2fe;color:#075985" onclick="openInst('${a.id}')">📊 Instrumenty${instsOf(a.id).length?' ('+instsOf(a.id).length+')':''}</button>`:''}</div>`}</div><div class="r"><b class="num">${money(e,CUR(a))}</b></div></div>`};
    const goalsH=owner=>{const goals=Object.entries(S.goals).map(([id,g])=>({id,...g,pr:goalProgress(g,S.cfg,tx,td())})).filter(g=>goalOwner(g)==owner).sort((a,b)=>(a.ts||0)-(b.ts||0));
      const pool=poolNow(S.cfg,tx,owner),alloc=goals.reduce((a,g)=>a+g.pr.saved,0),free=pool-alloc;
      let x=`<div class="r1" style="padding:0 4px"><span class="h2" style="margin:0">${owner=='Wspólne'?'Wspólne cele':'Cele: '+owner}</span><button class="btn sm dark" onclick="editGoal(null,'${owner}')">+ Dodaj cel</button></div>`;
      if(goals.length)x+=`<div class="envtop ${free<0?'neg':''}"><div><div class="mini">${free<0?'Przydzielono więcej, niż jest na kontach':'Do przydzielenia'}</div><div class="num big">${zl(free)}</div></div><div class="mini" style="text-align:right">na kontach ${zl0(pool)}<br>w celach ${zl0(alloc)}<br><small>bez poduszki, IKE, IKZE, PPK</small></div></div>`;
      if(free<0)x+=`<div class="note bad">⚠️ Na kontach jest mniej, niż przydzieliliście do celów. Zabierzcie ${zl(-free)} z któregoś celu.</div>`;
      if(!goals.length)x+=catsEmpty(`Cele działają jak koperty: część pieniędzy z kont powyżej przydzielacie na konkretny cel, np. ${owner=='Wspólne'?'Wakacje, Remont':'Nowy laptop, Kurs'}.`,1,'envelope');
      x+=goals.map(g=>{const p=g.pr,wd=Math.min(100,p.pct);
        return`<div class="goal"><div class="r1"><b>${p.done?'🎉 ':''}${esc(g.name)}</b><span class="pill ${p.done?'ok':'low'}">${Math.floor(p.pct)}%</span></div><div class="gbar"><i style="width:${wd.toFixed(1)}%"></i></div>
          <div class="r1 mini"><span><b class="num" style="color:var(--fg)">${zl0(p.saved)}</b> z ${zl0(g.target)}</span><span>${p.done?'Cel osiągnięty!':'brakuje '+zl0(p.left)}</span></div>
          ${p.perMonth?`<div class="mini">Do ${MNG[+g.deadline.slice(5,7)-1]} ${g.deadline.slice(0,4)}: przydzielajcie ok. <b style="color:var(--fg)">${zl0(p.perMonth)}</b> miesięcznie (${p.months} mies.)</div>`:''}
          <div class="btns" style="gap:6px"><button class="btn sm primary" onclick="allocGoal('${g.id}',1)">+ Przydziel</button>${p.saved>0?`<button class="btn sm" onclick="allocGoal('${g.id}',-1)">− Zabierz</button>`:''}<button class="btn sm" onclick="editGoal('${g.id}')">Edytuj</button></div></div>`}).join('');
      return x};

    if(S.sub=='all'){
      h+=`<div class="worth"><div class="l">Oszczędności i inwestycje razem</div><div class="v num">${zl(savEnd)} ${trendH(savDelta)}</div>${fxTxt(ownFx(null,end))?`<div class="s">${esc(fxPlus(ownFx(null,end)).trim())} (bez przeliczania)</div>`:''}<div class="s">${OWN.map(o=>`${o} ${zl0(ownAt(o,end))}`).join(' · ')}</div></div>`;
      h+=actH('all')+autoValH()+limitPropH()+matH()+limitsH();
      /* who saves how much: the line under the total and the tabs Mati / Wercia / Wspólne (no separate card) */
      /* the year so far: January … the shown month */
      const yF=Array.from({length:+S.ym.slice(5)},(_,i)=>savFlow(S.cfg,tx,SVI,S.ym.slice(0,5)+String(i+1).padStart(2,'0'))).reduce((a,x)=>({flow:a.flow+x.flow,gain:a.gain+x.gain}),{flow:0,gain:0}),put=flowM.flow,coins=coinSum(S.ym);
      const gainL=(g,when)=>g?`<div class="mini">📈 Zyski ${when}: <b class="${g>0?'t-inc':'t-exp'}">${g>0?'+':'−'}${zl(Math.abs(g))}</b> – zmiana kursów i wycen oraz 💰 odsetki, nie liczą się do odłożonych.</div>`:'';
      h+=`<section class="chart"><div class="ct"><b>Ile odłożyliście</b><span class="mini">wpłaty na oszczędności i inwestycje (z PPK) minus wypłaty – bez zmiany kursów</span></div>
        <div class="kpis" style="gap:8px"><div class="kpi k-em"><div class="l">${MN[+S.ym.slice(5)-1]}</div><div class="v num ${put<0?'t-exp':''}">${put>0?'+':''}${zl(put)}</div>${tg?`<div class="s">cel ${zl0(tg)} · ${Math.max(0,Math.round(put/tg*100))}%</div>`:''}</div><div class="kpi k-sk"><div class="l">Rok ${S.ym.slice(0,4)}</div><div class="v num ${yF.flow<0?'t-exp':''}">${yF.flow>0?'+':''}${zl(yF.flow)}</div>${tg?`<div class="s">cel ${zl0(tg*(+S.ym.slice(5)))} do końca ${MNG[+S.ym.slice(5)-1]}</div>`:''}</div></div>
        ${tg?`<div class="gbar"><i style="width:${Math.min(100,Math.max(0,put/tg*100)).toFixed(1)}%"></i></div><div class="mini">${put>=tg?'🎉 Cel na ten miesiąc osiągnięty!':`Do celu w tym miesiącu brakuje ${zl0(tg-Math.max(0,put))}.`}</div>`:''}
        ${gainL(flowM.gain,'w tym miesiącu')}${yF.gain&&yF.gain!=flowM.gain?gainL(yF.gain,'w '+S.ym.slice(0,4)+' r.'):''}
        ${coins?`<div class="mini">🪙 w tym z drobnych: <b style="color:var(--fg)">${zl(coins)}</b></div>`:''}
        <button class="btn sm" style="align-self:flex-start" onclick="setSavTarget()">${tg?'Zmień cel miesięczny ('+zl0(tg)+')':'+ Ustaw cel: ile odkładać co miesiąc'}</button></section>`;
      if(tg&&put>=tg&&S.ym==td().slice(0,7)&&!ls.get('mw_conf_'+S.ym)){ls.set('mw_conf_'+S.ym,'1');setTimeout(()=>celebrate(CELEBRATE.saving(S.who)),300)}
      h+=cushion()+intCardH();
      h+=fireH(savAt(tom),monthlySave());
      h+=gainH(S.cfg.accs.filter(a=>shown(a)),'Wszystkie konta');
      const gl=Object.entries(S.goals).map(([id,g])=>({id,...g,pr:goalProgress(g,S.cfg,tx,td())}));
      if(gl.length)h+=`<section class="chart"><div class="ct"><b>Wszystkie cele</b></div>${hbarsH(gl.map(g=>({l:g.name+' · '+goalOwner(g),v:g.pr.saved,c:cols[goalOwner(g)],dot:cols[goalOwner(g)],note:`${Math.floor(g.pr.pct)}% z ${zl0(g.target)}`})))}</section>`;}
    else{const o=S.sub,accs=S.cfg.accs.filter(a=>shown(a)&&accOwner(a)==o),tE=ownAt(o,end),tD=tE-ownAt(o,start);
      const invV=accs.filter(a=>a.grp=='inv'&&isP(a)).reduce((x,a)=>x+balance(S.cfg,tx,a.id,end),0);
      h+=`<div class="ptab ${o=='Wercia'?'pink':''}">`;
      h+=`<div class="worth ${o=='Mati'?'mati':o=='Wspólne'?'wsp':''}">${o=='Wercia'?'<svg class="flowers" viewBox="0 0 170 120" aria-hidden="true"><g stroke-linecap="round"><path d="M40 120 C40 96 42 80 46 64" stroke="#86c29a" stroke-width="4" fill="none"/><path d="M42 98 C30 92 24 84 22 74 C34 78 40 86 42 98Z" fill="#a7d8b5"/><path d="M46 64 C34 60 30 44 34 30 C40 38 44 40 46 40 C48 40 52 38 58 30 C62 44 58 60 46 64Z" fill="#f472b6"/><path d="M46 40 C44 30 46 22 46 18 C50 24 52 32 50 42Z" fill="#ec4899"/><path d="M118 120 C118 100 116 86 112 74" stroke="#86c29a" stroke-width="4" fill="none"/><path d="M115 100 C126 94 132 86 134 78 C122 80 116 90 115 100Z" fill="#a7d8b5"/><circle cx="112" cy="62" r="17" fill="#fda4af"/><path d="M112 62 m-11 0 a11 11 0 1 1 11 11" fill="none" stroke="#e11d48" stroke-width="3"/><path d="M112 62 m-6 0 a6 6 0 1 1 6 6" fill="none" stroke="#e11d48" stroke-width="2.5"/><path d="M80 120 C80 108 80 100 82 92" stroke="#86c29a" stroke-width="3" fill="none"/><ellipse cx="82" cy="80" rx="4.5" ry="10" fill="#fff" transform="rotate(0 82 90)"/><ellipse cx="82" cy="80" rx="4.5" ry="10" fill="#fff" transform="rotate(45 82 90)"/><ellipse cx="82" cy="80" rx="4.5" ry="10" fill="#fff" transform="rotate(90 82 90)"/><ellipse cx="82" cy="80" rx="4.5" ry="10" fill="#fff" transform="rotate(135 82 90)"/><ellipse cx="82" cy="80" rx="4.5" ry="10" fill="#fff" transform="rotate(180 82 90)"/><ellipse cx="82" cy="80" rx="4.5" ry="10" fill="#fff" transform="rotate(225 82 90)"/><ellipse cx="82" cy="80" rx="4.5" ry="10" fill="#fff" transform="rotate(270 82 90)"/><ellipse cx="82" cy="80" rx="4.5" ry="10" fill="#fff" transform="rotate(315 82 90)"/><circle cx="82" cy="90" r="5" fill="#fbbf24"/><g transform="translate(150 96) scale(.6)"><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fbcfe8" transform="rotate(0)"/><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fbcfe8" transform="rotate(60)"/><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fbcfe8" transform="rotate(120)"/><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fbcfe8" transform="rotate(180)"/><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fbcfe8" transform="rotate(240)"/><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fbcfe8" transform="rotate(300)"/><circle r="5" fill="#fde68a"/></g><g transform="translate(14 104) scale(.5)"><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fff" transform="rotate(0)"/><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fff" transform="rotate(60)"/><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fff" transform="rotate(120)"/><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fff" transform="rotate(180)"/><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fff" transform="rotate(240)"/><ellipse cx="0" cy="-10" rx="4.5" ry="10" fill="#fff" transform="rotate(300)"/><circle r="5" fill="#f9a8d4"/></g></g></svg>':''}<div class="l">${o=='Wercia'?'🌷 ':''}${o=='Wspólne'?'Wspólne oszczędności':'Oszczędności: '+o}</div><div class="v num">${zl(tE)} ${trendH(tD)}</div><div class="s">oszczędności ${zl0(tE-invV)} · inwestycje, IKE, IKZE ${zl0(invV)}</div></div>`;
      if(o=='Wspólne')h+=cushion('Wspólne');
      h+=actH(o)+intCardH(o);
      const grpL=(g,t)=>{const L=accs.filter(a=>a.grp==g);return L.length?`<div class="list"><div class="grp-h ${g}"><span>${t}</span><span class="num">${zl(L.filter(isP).reduce((x,a)=>x+balance(S.cfg,tx,a.id,end),0))}${fxPlus(fxOf(L,a=>balance(S.cfg,tx,a.id,end)))}</span></div>${L.map(accRow).join('')}</div>`:''};
      h+=`<div class="r1" style="padding:0 4px"><span class="h2" style="margin:0">Razem ${zl(tE)}${fxPlus(ownFx(o,end))}</span><button class="btn sm dark" onclick="addSavAcc('${o}')">+ Dodaj konto</button></div>`+(grpL('sav','OSZCZĘDNOŚCI')+grpL('inv','INWESTYCJE, IKE, IKZE, PPK')||'<div class="acc mini">Brak kont – dodaj pierwsze przyciskiem powyżej.</div>');
      h+=cascadeH(o);
      h+=gainH(accs,'Wszystkie konta: '+o);
      h+=`<div class="mini" style="padding:0 4px">Konta „inwest.” (inwestycje, IKE, IKZE) mają zmienną wartość – automat wycenia je sam na koniec miesiąca, a w każdej chwili zrobisz to przyciskiem „📈 Aktualizuj wartości”. Przycisk ⋯ zmienia nazwę lub usuwa konto (pieniądze przejdą na inne konto).</div>`;
      h+=goalsH(o)+'</div>'}}}

  else if(S.tab=='acc'&&(S.accView=='owe'||S.accView=='lent'))h+=majSegH()+accSegH()+debtsH(S.accView);
  else if(S.tab=='acc'&&S.recon){
    const tom=addDays(td(),1),accs=recAccs(),app=accs.filter(isP).reduce((x,a)=>x+balance(S.cfg,tx,a.id,tom),0),GH={cur:'KONTA BIEŻĄCE',sub:'SUBKONTA',sav:'OSZCZĘDNOŚCI',inv:'INWESTYCJE, IKE, IKZE'};
    h+=`<div class="seg seg2">${[['cur','Bieżące i subkonta'],['sav','Oszczędności']].map(([k,l])=>`<button aria-pressed="${(S.recScope||'cur')==k}" onclick="setRecScope('${k}')">${l}</button>`).join('')}</div>`;
    h+=`<div class="worth rectop"><div class="l">⚖️ ${(S.recScope||'cur')=='cur'?'Konta bieżące i subkonta':'Konta oszczędnościowe'} · stan na dziś ${td().split('-').reverse().join('.')}</div>
      <div class="recgrid"><div><div class="mini">W aplikacji</div><b class="num" id="recApp">${zl(app)}</b></div><div><div class="mini">Wpisane</div><b class="num" id="recReal">${zl(app)}</b></div><div><div class="mini">Różnica</div><b class="num" id="recDiff">0,00 zł</b></div></div><div class="mini" id="recN">nic jeszcze nie wpisano</div></div>
      <div class="note">Wpisz, ile <b>faktycznie</b> jest na kontach (z aplikacji banku). Puste pole = bez zmian. Możesz uzupełnić jedną albo obie zakładki – „Dalej” zapisze wszystko, co wpisałeś. Różnice między kontami zapiszę jako przelewy, a resztę jako wyrównanie. Wartość inwestycji (IKE, IKZE, PPK, maklerskie) zmienisz w 💰 Majątek → Oszczędności → „📈 Aktualizuj wartości”.</div>`;
    let g0='';h+=`<div class="list">`+accs.map(a=>{const b=balance(S.cfg,tx,a.id,tom),hd=a.grp!=g0?`<div class="grp-h ${a.grp=='sub'?'subk':a.grp}"><span>${GH[a.grp]}</span></div>`:'';g0=a.grp;
      return hd+`<div class="recrow"><div style="min-width:0"><b>${esc(a.name)}</b><div class="mini">w aplikacji: <span class="num">${money(b,CUR(a))}</span></div><div class="rdiff" id="rd_${a.id}"></div></div><input id="rv_${a.id}" class="planin" style="max-width:130px" inputmode="decimal" value="${esc((S.recVals||{})[a.id]||'')}" placeholder="${f2(b)}" oninput="recSum()" autocomplete="off"></div>`}).join('')+`</div>`;
    h+=`<div class="g2"><button class="btn" onclick="closeRecon()">Anuluj</button><button class="btn primary" onclick="applyRecon()">Dalej</button></div>`}

  else if(S.tab=='acc'){
    /* wealth by person: Wszyscy / Mati / Wercia / Wspólne, groups: current accounts, subaccounts, savings, investments */
    const o=OWN.includes(S.accSub)?S.accSub:'all',bal=a=>balance(S.cfg,tx,a.id,end);
    const vis=a=>(!a.archived||bal(a)||balance(S.cfg,tx,a.id,start))&&(o=='all'||accOwner(a)==o);
    const accsO=(ow,g)=>S.cfg.accs.filter(a=>(!ow||accOwner(a)==ow)&&(!g||a.grp==g)),sumO=(ow,g)=>accsO(ow,g).filter(isP).reduce((x,a)=>x+bal(a),0),fxO=(ow,g)=>fxOf(accsO(ow,g),bal);
    const GL={cur:'bieżące',sub:'subkonta',sav:'oszczędności',inv:'inwestycje'};
    const parts=ow=>['cur','sub','sav','inv'].map(g=>[g,sumO(ow,g)]).filter(([g,v])=>v||g=='cur').map(([g,v])=>`${GL[g]} ${zl0(v)}${fxPlus(fxO(ow,g))}`).join(' · ')+'';
    /* liabilities and receivables do not change what is on the accounts – they are shown beside it */
    const dl=ow=>[debtSum('owe',ow)?`🔻 do spłaty ${zl0(debtSum('owe',ow))}`:'',debtSum('lent',ow)?`🔺 pożyczone innym ${zl0(debtSum('lent',ow))}`:''].filter(Boolean).join(' · ');
    const dlH=ow=>dl(ow)?`<div class="s">${dl(ow)} · po rozliczeniu wszystkiego: ${zl0(total(ow)-debtSum('owe',ow)+debtSum('lent',ow))}</div>`:'';
    const total=ow=>sumO(ow),otag=ow=>`<span class="otag o-${ow=='Mati'?'m':ow=='Wercia'?'w':'s'}">${ow}</span>`;
    h+=majSegH()+accSegH()+`<button class="btn dark" style="width:100%" onclick="openRecon()">⚖️ Wyrównaj wszystkie salda naraz</button>`;
    h+=`<div class="seg seg4">${[['all','Wszyscy'],...OWN.map(x=>[x,x])].map(([k,l])=>`<button aria-pressed="${o==k}"${k=='Wercia'?' class="wbtn"':''} onclick="setAccSub('${k}')">${l}${k=='Wercia'?' 🌸':''}</button>`).join('')}</div>`;
    h+=`<div class="ptab ${o=='Wercia'?'pink':''}">`;
    if(o=='all'){const own=OWN.map(x=>[x,total(x)]),pos=own.filter(([,v])=>v>0),pt=pos.reduce((a,[,v])=>a+v,0);
      h+=`<div class="worth"><div class="l">Łączny majątek na koniec miesiąca</div><div class="v num">${zl(total())}${fxSmall(fxO())}</div><div class="s">${parts()}</div>${dlH()}</div>`;
      h+=`<section class="chart"><div class="ct"><b>Czyj majątek</b><span class="mini">stuknij osobę, żeby zobaczyć tylko jej konta</span></div>${pt>0?`<div class="stack">${pos.map(([x,v])=>`<i style="width:${(v/pt*100).toFixed(2)}%;background:${OWN_COL[x]}" data-tip="${x}: ${zl(v)}"></i>`).join('')}</div>`:''}<div class="owners">${own.map(([x,v])=>`<button class="orow" onclick="setAccSub('${x}')"><i style="background:${OWN_COL[x]}"></i><span class="ot"><b>${x}</b><small>${parts(x)}${dl(x)?'<br>'+dl(x):''}</small></span><b class="num">${zl(v)}</b></button>`).join('')}</div></section>`}
    else h+=`<div class="worth ${o=='Mati'?'mati':o=='Wspólne'?'wsp':''}"><div class="l">${o=='Wspólne'?'Wspólny majątek':'Majątek: '+o}</div><div class="v num">${zl(total(o))}${fxSmall(fxO(o))}</div><div class="s">${parts(o)}</div>${dlH(o)}</div>`;
    const GH={cur:'KONTA BIEŻĄCE',sub:'SUBKONTA',sav:'OSZCZĘDNOŚCI',inv:'INWESTYCJE, IKE, IKZE'},groups=['cur','sub','sav','inv'].filter(g=>S.cfg.accs.some(a=>a.grp==g&&vis(a)));
    if(!groups.length)h+=`<div class="empty">Brak kont – dodasz je w ⚙️ Ustawieniach.</div>`;
    h+=groups.map(g=>{const accs=S.cfg.accs.filter(a=>a.grp==g&&vis(a));
      return`<div class="list"><div class="grp-h ${g=='sub'?'subk':g}"><span>${GH[g]}</span><span class="num">${zl(accs.filter(isP).reduce((x,a)=>x+bal(a),0))}${fxPlus(fxOf(accs,bal))}</span></div>${accs.map(a=>{const e=bal(a),s0=balance(S.cfg,tx,a.id,start),dlt=e-s0,M=v=>money(v,CUR(a));
        return`<div class="acc"><div><b>${esc(a.name)}</b>${o=='all'?otag(accOwner(a)):''}<div class="mini">na początek: ${M(s0)}${isP(a)?'':` · <span class="curtag">${CUR(a)}</span>`}</div>${saveInH(a.id)}${intMini(a,tx)}</div><div class="r"><b class="num">${M(e)}</b><div class="mini ${dlt>0?'t-inc':dlt<0?'t-exp':''}">${dlt>0?'+':''}${M(dlt)}</div></div></div>`}).join('')}</div>`}).join('');
    h+='</div>'}

  else if(S.help)h+=helpH();
  else{
    const rules=S.cfg.round||[];
    let h0=h;const C={};h='';
    h+=`<div class="card"><div class="rowx" style="border:0;padding:0"><h3>🪙 Drobne</h3><button class="btn sm dark" onclick="editRound()">+ Reguła</button></div><div class="mini">Jak w Revolucie: wydatek z wybranego konta zaokrągla się w górę do 5 albo 10 zł, a różnica (razy mnożnik) trafia na wskazane konto. W okienku wydatku pojawi się złota moneta – odznacz ją, gdy bank nie liczy drobnych (np. przy BLIK-u).</div>${rules.map(r=>`<div class="rowx"><span style="flex:1;min-width:0"><b>${esc(accN(r.from))} → ${esc(accN(r.to))}</b><br><span class="mini">do ${r.step} ${curSym(accCur(r.from))} · ×${r.mult}${r.full?' · pełne drobne przy równej kwocie':''} · w tym miesiącu ${am(coinSum(S.ym,r),r.from)}</span></span><button class="btn sm" onclick="editRound('${r.id}')">Edytuj</button></div>`).join('')||'<div class="mini" style="padding-top:4px">Nie ma jeszcze żadnej reguły.</div>'}</div>`;C.round=h;h='';
    h+=DEMO?demoCardH():pushCardH();C.push=h;h='';
    C.chg=changesH()+deletedH();
    if(!DEMO)h+=`<div class="card"><h3>🗣️ Siri i skróty</h3><div class="mini">„Hej Siri, wydatek” – Siri zapyta o kwotę i notatkę, a aplikacja otworzy się z gotowym okienkiem. Skrót otwiera się w Safari, więc raz zaloguj się tam do aplikacji.</div><button class="btn sm" onclick="siriHelp()">Jak to ustawić</button></div>`;C.siri=h;h='';
    if(!DEMO){const L=S.market?.maillog||{},f=d=>d?d.split('-').reverse().join('.'):'—';h+=`<div class="card"><h3>📧 Maile</h3><div class="mini">💾 Kopia zapasowa – w pierwszą niedzielę miesiąca, tylko do Matiego. Ostatnio: ${f(L.backupAt)}.<br>📊 Podsumowanie miesiąca – 1. dnia miesiąca, do Was obojga. Ostatnio: ${f(L.sumAt)}.<br>Kopię z maila wczytasz przyciskiem „Wczytaj kopię” poniżej (plik .json.gz).${S.email?`<br>Ten telefon: ${esc(S.email)} → ${esc(S.who)}`:''}</div></div>`}C.mail=h;h='';
    if(!DEMO){const r=S.market?.rates;h+=`<div class="card"><h3>🤖 Automat (GitHub)</h3><div class="mini">${r?.date?`Ostatnio: ${r.date.split('-').reverse().join('.')} · kursy walut ${Object.keys(r.fx||{}).length} · ceny ${Object.keys(r.prices||{}).length}${r.gold?' · złoto':''}${r.infl!=null?` · inflacja ${String(r.infl).replace('.',',')}% (${esc(r.inflPer||'')})`:''}${r.nbp!=null?` · stopa NBP ${String(r.nbp).replace('.',',')}%`:''}${Object.keys(r.funds||{}).length?` · fundusze ${Object.keys(r.funds).length}`:''}${S.market?.funds?.list?` · lista PPK ${Object.keys(S.market.funds.list).length}`:''}${S.market?.autoval?.last?` · wycena za ${MN[+S.market.autoval.last.slice(5)-1].toLowerCase()}`:''}`:'Jeszcze nie działa – po włączeniu codziennie w dni robocze pobierze kursy NBP, stopę NBP, inflację i ceny instrumentów z symbolem.'}</div></div>`}C.auto=h;h='';
    C.look=lookH();
    if(!DEMO)h+=`<div class="card"><h3>🧪 Pokaż komuś aplikację</h3><div class="mini">Wersja demonstracyjna z przykładowymi danymi – bez Waszych danych i bez logowania. Każdy zobaczy swoją kopię, a zmiany zostają tylko w jego przeglądarce.</div><div class="btns"><button class="btn sm primary" onclick="shareDemo()">📤 Wyślij link</button><a class="btn sm" href="./demo/" target="_blank" rel="noopener">Otwórz demo</a></div></div>`;C.demo=h;h='';
    h+=`<div class="card"><h3>🐾 Bailey i Ivo</h3><div class="seg seg3">${[['lots','Dużo'],['few','Mało'],['off','Wyłączone']].map(([k,l])=>`<button aria-pressed="${kotki.mode==k}" onclick="setKotki('${k}')">${l}</button>`).join('')}</div><div class="mini">Dużo – rysunki, porady i żarty. Mało – rysunki i tylko ważne komunikaty. Wyłączone – bez kotków. Ustawienie dotyczy tego telefonu.</div></div>`;C.cats=h;h='';
    h+=`<div class="card"><h3>Kto korzysta z tego telefonu?</h3><div class="seg seg2">${['Mati','Wercia'].map(n=>`<button aria-pressed="${S.who==n}" onclick="setWho('${n}')">${n}</button>`).join('')}</div><div class="mini">Nowe transakcje będą podpisane tym imieniem.</div>${DEMO?'':`<div class="r1"><span class="mini">🎂 Urodziny (${esc(S.who)}): <b style="color:var(--fg)">${S.hraw?.birth?.[S.who]?S.hraw.birth[S.who].split('-').reverse().join('.'):'nie wpisane'}</b></span><button class="btn sm" onclick="askBirth(true)">${S.hraw?.birth?.[S.who]?'Zmień':'+ Wpisz'}</button></div>`}</div>`;C.who=h;h='';
    h+=`<div class="card"><div class="rowx" style="border:0;padding:0"><h3>Konta</h3><button class="btn sm dark" onclick="addAcc()">+ Konto</button></div><div class="seg seg2 acctabs">${Object.entries(ACCTAB).map(([g,l])=>`<button aria-pressed="${S.accTab==g}" onclick="setAccTab('${g}')">${{cur:'💳',sub:'🗂️',sav:'🐷',inv:'📈'}[g]} ${l} (${S.cfg.accs.filter(a=>a.grp==g&&!a.archived).length})</button>`).join('')}</div>${(()=>{const list=S.cfg.accs.filter(a=>a.grp==S.accTab&&!a.archived);
      return list.length?list.map((a,i)=>`<div class="rowx"><span style="flex:1;min-width:0"><b>${esc(a.name)}</b><br><span class="mini">${accOwner(a)}${isP(a)?'':' · '+CUR(a)} · saldo początkowe ${money(a.open,CUR(a))}${intOf(a)?' · 💰 '+esc(intLabel(intOf(a),td())):''}</span></span><span class="btns" style="gap:4px">${a.grp!='inv'?`<button class="btn sm" aria-label="Oprocentowanie" onclick="editInt('${a.id}')">💰</button>`:''}<button class="btn sm" aria-label="W górę" onclick="moveAcc('${a.id}',-1)"${i==0?' disabled style="opacity:.3"':''}>↑</button><button class="btn sm" aria-label="W dół" onclick="moveAcc('${a.id}',1)"${i==list.length-1?' disabled style="opacity:.3"':''}>↓</button><button class="btn sm" onclick="editAcc('${a.id}')">Edytuj</button></span></div>`).join(''):`<div class="mini" style="padding:6px 0">Nie ma tu jeszcze kont – dodasz je przyciskiem „+ konto”.</div>`})()}<div class="mini">Strzałkami zmienisz kolejność – w tej kolejności konta pokazują się w całej aplikacji. Rodzaj konta zmienisz w „Edytuj”.</div></div>
`;C.acc=h;h='';
    h+=`<div class="card"><div class="rowx" style="border:0;padding:0"><h3>Kategorie i pozycje budżetu</h3><button class="btn sm dark" onclick="addCat()">+ Kategoria</button></div><div class="mini">Stuknij kategorię albo pozycję, żeby zmienić nazwę, 🙈 ukryć albo usunąć. Strzałkami zmienisz kolejność.</div>${S.cfg.cats.map((c,ci)=>`<div class="rowx"${c.hidden?' style="opacity:.6"':''}><button class="catname" onclick="editCat(${ci})">${catIcon(c)} ${esc(catL(c))}${c.hidden?' 🙈':''}&nbsp;✏️</button><span class="btns" style="gap:4px"><button class="btn sm" aria-label="W górę" onclick="moveCat(${ci},-1)"${ci==0?' disabled style="opacity:.3"':''}>↑</button><button class="btn sm" aria-label="W dół" onclick="moveCat(${ci},1)"${ci==S.cfg.cats.length-1?' disabled style="opacity:.3"':''}>↓</button><button class="btn sm" onclick="addSub(${ci})">+ Pozycja</button></span><div class="tags" style="width:100%">${c.subs.map((s,si)=>s.hidden?'':`<span class="tag"><button onclick="subMenu(${ci},${si})">${esc(s.name)}</button></span>`).join('')}</div>${c.subs.some(s=>s.hidden)?`<div class="mini" style="width:100%">🙈 Ukryte: ${c.subs.map((s,si)=>s.hidden?`${esc(s.name)} <button class="lnk" onclick="hideSub(${ci},${si},false)">↺ przywróć</button>`:'').filter(Boolean).join(' · ')}</div>`:''}</div>`).join('')}</div>
`;C.catc=h;h='';
    h+=`<div class="card"><h3>Kopia danych</h3><div class="mini">Pobierz kopię co jakiś czas. Tym samym miejscem wczytasz też kopię ze starej wersji aplikacji.</div><div class="btns"><button class="btn primary" onclick="exportJson()">Pobierz kopię</button><button class="btn" onclick="$('fileIn').click()">Wczytaj kopię (.json)</button>${DEMO?'':'<button class="btn" onclick="logout()">Wyloguj</button>'}</div>${phMeterH()}<div class="mini">Zalogowano: ${esc(auth.currentUser?.email||'')}</div><div class="diag">Diagnostyka: ${esc(S.last||'brak błędów')} · transakcji: ${tx.length}</div></div>`;C.backup=h;
    /* ⚙️ in groups – rarely used ones folded; every phone remembers which groups are open */
    const G=(k,t,sub,body,def)=>{const o=(S.setOpen||{})[k]??def;return body?`<details class="sgrp"${o?' open':''} ontoggle="(S.setOpen=S.setOpen||{})['${k}']=this.open"><summary><span><b>${t}</b><small>${sub}</small></span><i>›</i></summary><div class="sgb">${body}</div></details>`:''};
    const helpC=`<div class="card"><h3>📖 Pomoc</h3><div class="mini">Każda funkcja aplikacji krok po kroku, z wyszukiwarką.</div><div class="btns"><button class="btn sm primary" onclick="openHelp()">📖 Co nowego i jak to działa</button><button class="btn sm" onclick="showTour()">Pokaż pierwsze kroki</button></div></div>`;
    h=h0+G('bud','💰 Budżet','konta, kategorie i pozycje, drobne',C.acc+C.catc+C.round,true)
      +G('tel','📱 Ten telefon','wygląd, tryb dyskretny, kotki, kto korzysta',C.look+C.cats+C.who,false)
      +G('bez','🛡️ Bezpieczeństwo','kopia danych, ostatnio usunięte, ostatnie zmiany',C.backup+C.chg,false)
      +G('auto','🤖 Automaty',(DEMO?'':S.pushOk?'powiadomienia, ':'⚠️ powiadomienia wyłączone · ')+'maile, automat, Siri',C.push+C.mail+C.auto+C.siri,false)
      +G('pom','📖 Pomoc','jak to działa, pokaż komuś aplikację',helpC+C.demo,false)}
  if(priv.on)h=`<div class="demob hideb">🙈 Tryb dyskretny – kwoty są ukryte <button onclick="setHide(0)">Pokaż kwoty</button></div>`+h;
  if(DEMO)h=`<div class="demob">🧪 Wersja demonstracyjna · przykładowe dane, tylko w tej przeglądarce <button onclick="MW_DEMO.reset()">Zacznij od nowa</button></div>`+h;
  $('app').innerHTML=h;updToday();fitNums();
  {const key=[S.tab,S.ym,S.sub,S.fixSub,S.accView,S.ana,!!S.instAcc].join('|'),a=$('app');if(key!=S.animKey){const first=!S.animKey;S.animKey=key;if(!first){a.classList.remove('anim','sl','sr');void a.offsetWidth;a.classList.add('anim',S.swipe>0?'sl':S.swipe<0?'sr':'up');clearTimeout(S.animT);S.animT=setTimeout(()=>a.classList.remove('anim','sl','sr','up'),650)}}S.swipe=0}if(S.tab=='acc'&&S.recon&&$('recApp'))recSum();if(S.tab=='fix'&&S.slip)slipCalc()}
function setAna(k){S.ana=k;render()}
export function showEmpty(id){S.showEmpty[id]=!S.showEmpty[id];render()}
export function showCat(id){S.showCat[id]=true;S.open[id]=true;render()}
function tog(id){if(S.bf!='all')S.fold[id]=!S.fold[id];else S.open[id]=!S.open[id];render()}
function autoPlan(){const ym=S.ym,cur=td().slice(0,7);
  if(!S.plansSrv||S.plans[ym]||S.autoPlanned[ym]||ym<cur||ym>addMonths(cur,1))return;
  const prev=Object.keys(S.plans).filter(k=>k<ym&&Object.values(S.plans[k]).some(v=>v)).sort().pop();if(!prev)return;
  S.autoPlanned[ym]=1;w(setDoc(doc(PLC(),ym),{...S.plans[prev]},{merge:true}));
  toast(`Plan na ${MN[+ym.slice(5)-1].toLowerCase()} skopiowany z: ${MN[+prev.slice(5)-1].toLowerCase()}`)}

/* ---------- wiring ---------- */
$('findBtn').onclick=openFind;
/* 🙈 hold the month name for ~0,6 s: discreet mode on / off (a quick way besides ⚙️ → Wygląd) */
{let t=null;const m=document.querySelector('.mlab'),stop=()=>{clearTimeout(t);t=null};
  m.addEventListener('pointerdown',()=>{stop();t=setTimeout(()=>{t=null;if(!S.cfg)return;if(navigator.vibrate)navigator.vibrate(15);setHide(!priv.on)},600)});
  ['pointerup','pointerleave','pointercancel'].forEach(k=>m.addEventListener(k,stop));m.addEventListener('contextmenu',e=>e.preventDefault())}$('prevM').onclick=()=>mv(-1);$('nextM').onclick=()=>mv(1);
function mv(d){if(S.tab=='ana'&&S.ana=='y')d*=12;S.swipe=Math.sign(d);S.ym=addMonths(S.ym,d);render()}
/* ✋ hold an entry in the Register: duplicate, refund, delete */
function txMenu(id){const t=liveById(id);if(!t)return;const d=$('dlg'),sm=subsMap(S.cfg);
  const special=t.slip||t.slipOf||t.ppk||t.refundOf||t.roundOf||t.lendOf||t.debtIn||['adj','lend','inv','invs'].includes(t.type);
  const left=t.type=='exp'?t.amount-refundsOf(t.id).reduce((a,x)=>a+x.amount,0):0;
  $('dlgBody').innerHTML=`<h2>${esc(stripFx(t.note)||sm[t.sub]?.name||'Wpis')}</h2><p class="dtext">${am(t.amount,t.acc)} · ${t.date.split('-').reverse().join('.')}${sm[t.sub]?' · '+esc(sm[t.sub].name):''}</p>
    <div class="menu">${special?'':'<button class="btn" data-m="dup">📋 Duplikuj</button>'}${left>0?'<button class="btn" data-m="ref">↩️ Zwrot</button>':''}<button class="btn" data-m="open">✏️ Otwórz</button><button class="btn" data-m="del" style="color:var(--exp)">🗑️ Usuń</button><button class="btn" data-m="">Anuluj</button></div>`;
  d.hidden=false;d.onclick=e=>{if(e.target===d){d.hidden=true;return}const b=e.target.closest('[data-m]');if(!b)return;d.hidden=true;const m=b.dataset.m;
    if(m=='dup')openTx(null,{type:t.type,amount:t.amount,note:stripFx(t.note),sub:t.sub,acc:t.acc,...(t.type=='tr'?{to:t.to}:{})});else if(m=='ref')markRefund(id);else if(m=='open')openTx(id);else if(m=='del')delTx(id)}}
{let lp=null;const app=$('app'),stop=()=>{if(lp){clearTimeout(lp.t);lp=null}};
  app.addEventListener('pointerdown',e=>{const b=e.target.closest('.tx[data-id]');if(!b)return;stop();lp={x:e.clientX,y:e.clientY,t:setTimeout(()=>{lp=null;S.lpAt=Date.now();try{navigator.vibrate?.(12)}catch(x){}txMenu(b.dataset.id)},550)}});
  ['pointerup','pointercancel','pointerleave'].forEach(k=>app.addEventListener(k,stop));
  app.addEventListener('pointermove',e=>{if(lp&&Math.hypot(e.clientX-lp.x,e.clientY-lp.y)>10)stop()});
  app.addEventListener('contextmenu',e=>{const b=e.target.closest('.tx[data-id]');if(!b)return;e.preventDefault();stop();if(Date.now()-(S.lpAt||0)>900){S.lpAt=Date.now();txMenu(b.dataset.id)}});
  document.addEventListener('click',e=>{if(S.lpAt&&Date.now()-S.lpAt<900&&e.target.closest('#app .tx[data-id]')){e.preventDefault();e.stopPropagation();S.lpAt=0}},true)}
{let lastY=0;window.addEventListener('scroll',()=>{const y=window.scrollY,f=$('addBtn');if(!f)return;if(y>lastY+6&&y>120)f.classList.add('away');else if(y<lastY-6||y<120)f.classList.remove('away');lastY=y},{passive:true})}
/* 🚫🔍 no zoom on a double tap anywhere (iPhone Safari zooms on a fast second tap on text and cards even with touch-action).
   The second quick tap is stopped; when it landed on a button / link / tappable row, that one gets its click anyway. Pinch with two fingers still zooms. */
{let last=0,st=null;
  document.addEventListener('touchstart',e=>{st=e.touches.length==1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null},{passive:true});
  document.addEventListener('touchend',e=>{const now=Date.now(),t=e.changedTouches[0],tap=st&&t&&Math.abs(t.clientX-st.x)<12&&Math.abs(t.clientY-st.y)<12&&!e.touches.length;
    if(!tap){last=0;return}
    if(now-last<350&&!e.target.closest('input,textarea,select,[contenteditable]')){e.preventDefault();const b=e.target.closest('button,a,label,summary,[onclick],[role=button]');if(b)b.click();last=0;return}
    last=now},{passive:false})}
/* 👆 swipe left / right on the screen: the next / previous month */
{let sw=null;const app=$('app'),scrollsX=el=>{for(let x=el;x&&x!==app;x=x.parentElement)if(x.scrollWidth>x.clientWidth+4&&/(auto|scroll)/.test(getComputedStyle(x).overflowX))return true;return false};
  app.addEventListener('touchstart',e=>{sw=null;if(e.touches.length!=1||!['dash','tx','fix','ana'].includes(S.tab)||S.slip||S.proj||!$('sheet').hidden||!$('dlg').hidden)return;
    const el=e.target;if(el.closest('input,select,textarea,.noswipe')||scrollsX(el))return;sw={x:e.touches[0].clientX,y:e.touches[0].clientY,at:Date.now()}},{passive:true});
  app.addEventListener('touchend',e=>{if(!sw)return;const t=e.changedTouches[0],dx=t.clientX-sw.x,dy=t.clientY-sw.y,dt=Date.now()-sw.at;sw=null;
    if(Math.abs(dx)>80&&Math.abs(dy)<Math.abs(dx)*0.5&&dt<800)mv(dx<0?1:-1)},{passive:true})}
/* 📖 every feature: a list by section, tap = what it is for and how to use it */
function openReport(y){S.report=y;window.scrollTo(0,0);render()}
function closeReport(){S.report=null;window.scrollTo(0,0);render()}
function openHelp(open){goTab('set');S.help=true;S.helpOpen=open||'';render()}
function closeHelp(){S.help=false;window.scrollTo(0,0);render()}
function helpFilter(v){const q=v.trim().toLowerCase();document.querySelectorAll('#app details.hlp').forEach(d=>{d.hidden=!!q&&!d.textContent.toLowerCase().includes(q)});
  document.querySelectorAll('#app .hlpsec').forEach(c=>{c.hidden=!!q&&![...c.querySelectorAll('details.hlp')].some(d=>!d.hidden)})}
function helpH(){const isNew=x=>x.v&&x.v>=NEWS_V-2;
  const item=x=>`<details class="hlp"${S.helpOpen==x.t?' open':''}><summary><span class="hi">${x.i}</span><span class="ht"><b>${esc(x.t)}${isNew(x)?' <em class="newb">nowe</em>':''}</b><small>${esc(x.s)}</small></span><span class="hchev">›</span></summary><div class="hbody"><p>${esc(x.w)}</p><ol>${x.h.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></div></details>`;
  const fresh=HELP.flatMap(s=>s.items).filter(isNew).sort((a,b)=>b.v-a.v);
  let h=`<button class="btn sm" style="align-self:flex-start" onclick="closeHelp()">‹ Ustawienia</button>
    <div class="greet"><div class="gtxt"><b>📖 Co nowego i jak to działa</b><span>Stuknij funkcję, żeby zobaczyć, do czego służy i jak jej używać.</span></div></div>
    <input class="pq" type="search" placeholder="🔍 Szukaj funkcji, np. paragon, PPK, gwarancja" oninput="helpFilter(this.value)" autocomplete="off">`;
  if(fresh.length)h+=`<div class="card hlpsec"><h3>🆕 Ostatnio dodane</h3>${fresh.map(item).join('')}</div>`;
  h+=HELP.map(s=>`<div class="card hlpsec"><h3>${esc(s.s)}</h3>${s.items.map(item).join('')}</div>`).join('');
  return h+`<div class="btns" style="justify-content:center"><button class="btn sm" onclick="showNews(true)">🎞️ Slajdy „Co nowego”</button><button class="btn sm" onclick="showTour()">🐾 Pierwsze kroki</button></div>`}
/* 🔍 one search: entries, positions, accounts, instruments, fixed payments */
function openFind(){if(!S.cfg)return;const d=$('dlg');
  $('dlgBody').innerHTML=`<div class="r1"><h2>🔍 Szukaj</h2><button class="btn sm" data-x="1">Zamknij</button></div><input id="fdQ" class="pq" type="search" enterkeyhint="search" placeholder="np. Biedronka, prąd, 120, >200" autocomplete="off"><div id="fdRes" class="fdres"></div>`;
  d.hidden=false;const q=$('fdQ');q.oninput=()=>findRun(q.value);findRun('');setTimeout(()=>q.focus(),60);
  d.onclick=e=>{if(e.target===d||e.target.closest('[data-x]')){d.hidden=true;return}const b=e.target.closest('[data-go],.tx');if(!b)return;d.hidden=true;if(b.dataset.go)findGo(b.dataset.go)}}
function findRun(raw){const v=raw.trim(),el=$('fdRes');if(!v){el.innerHTML='<div class="mini">Szukam we wpisach (notatka, pozycja, konto, kwota), w pozycjach budżetu, kontach, instrumentach i opłatach stałych.</div>';return}
  const low=s=>String(s||'').toLowerCase(),q=low(v),sm=subsMap(S.cfg),grp=(t,L)=>L.length?`<div class="h2">${t}</div>${L.join('')}`:'',row=(go,ic,t,s)=>`<button class="fhit" data-go="${go}"><span>${ic}</span><b>${esc(t)}</b><small>${esc(s)}</small></button>`;
  const subs=S.cfg.cats.flatMap(c=>c.subs.map(s=>({s,c}))).filter(x=>low(x.s.name).includes(q)).slice(0,5).map(x=>row('sub:'+x.s.id,catIcon(x.c),x.s.name,cleanCat(x.c.name)));
  const accs=S.cfg.accs.filter(a=>!a.archived&&low(a.name).includes(q)).slice(0,4).map(a=>row('acc:'+a.id,'👛',a.name,ACCTAB[a.grp]||''));
  const ins=Object.entries(S.hold).filter(([,x])=>!x.deleted&&(low(x.name).includes(q)||low(x.ticker).includes(q))).slice(0,4).map(([,x])=>row('inst:'+x.acc,IICON[x.kind]||'📈',x.name,accN(x.acc)));
  const fx=(S.cfg.fixed||[]).filter(f=>low(f.name).includes(q)).slice(0,4).map(f=>row('fix:'+f.id,'📌',f.name,'opłata stała'));
  const hl=HELP.flatMap(s=>s.items).filter(x=>low(x.t+' '+x.s).includes(q)).slice(0,3).map(x=>row('help:'+x.t,x.i,x.t,'📖 jak to działa'));
  const AQ=amtQuery(v),F={scope:'a',q:v,type:'',who:'',acc:'',cat:''},L=liveOf(S.tx).filter(t=>txMatches(t,sm,{...F,q:AQ.q},S.ym,AQ)).sort((a,b)=>b.date.localeCompare(a.date)||(b.ts||0)-(a.ts||0));
  const txs=L.slice(0,30).map(t=>txRowH(t,sm));
  el.innerHTML=grp('Jak to działa',hl)+grp('Pozycje budżetu',subs)+grp('Opłaty stałe',fx)+grp('Konta',accs)+grp('Instrumenty',ins)+grp(`Wpisy${L.length>30?` (30 z ${L.length})`:L.length?` (${L.length})`:''}`,txs)||'<div class="mini">Nic nie znalazłem 🐾</div>'}
function findGo(g){const i=g.indexOf(':'),k=g.slice(0,i),id=g.slice(i+1);if(k=='help')return openHelp(id);
  if(k=='sub'){const s=subsMap(S.cfg)[id];S.f={...S.f,q:s?.name||'',scope:'y'};return goTab('tx')}
  if(k=='fix'){S.fixSub='fix';goTab('fix');return editFixed(id)}
  if(k=='acc'){const a=accById(id);return goTab(a&&(a.grp=='sav'||a.grp=='inv')?'sav':'acc')}
  if(k=='inst'){goTab('sav');return openInst(id)}}
export const goTab=t=>{S.help=false;S.report=null;if(t=='maj')t=ls.get('mw_maj')=='acc'?'acc':'sav';if(t=='sav'||t=='acc')ls.set('mw_maj',t);S.tab=t;S.recon=false;S.recBack=null;S.slip=null;S.proj=null;S.close=null;S.instAcc=null;S.values=false;window.scrollTo(0,0);render()};
document.querySelectorAll('.tabs [data-tab]').forEach(b=>b.onclick=()=>goTab(b.dataset.tab));
$('gearBtn').onclick=()=>goTab(S.tab=='set'?'dash':'set');
$('addBtn').onclick=()=>openTx();
$('mt').querySelectorAll('button').forEach(b=>b.onclick=()=>setType(b.dataset.v));
$('mc').onchange=()=>{if($('mto').value==$('mc').value){const o=[...$('mto').options].find(o=>o.value!=$('mc').value);if(o)$('mto').value=o.value}autoWho();updCoin();updFx();updSave()};
$('todayBtn').onclick=()=>{if(S.cfg)showToday()};
$('shCancel').onclick=closeSheet;$('shSave').onclick=()=>saveTx();$('shNext').onclick=()=>saveTx(true);$('shDel').onclick=()=>S.edit&&delTx(S.edit);
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
  S.uid=u.uid;S.email=u.email||'';merge(doc(collection(H,'users'),u.uid),{email:S.email,who:S.who,seen:td()});
  $('app').innerHTML=`<div class="load">${kotki.mode=='off'?'':scene('window')}Wczytywanie budżetu…</div>`;
  const onErr=e=>{err(e);if(e?.code=='permission-denied')$('app').innerHTML='<div class="load">Brak dostępu do danych.<br><br>Sprawdź reguły Firestore albo czy ten e-mail jest na liście.</div>'};
  unsub.push(onSnapshot(H,s=>{
    if(s.exists()){const raw=s.data(),c=fromDoc(clone(raw));const leg=c.legacy;delete c.legacy;S.hraw=raw;S.cfg=c;if(!S.pushReady)S.pushReady=checkPush();S.savTarget=raw.savTarget||0;render();setTimeout(maybeIntro,700);if(leg&&!s.metadata.fromCache)saveCfg();
      /* (one-time changes of 2025–26 – IKE/IKZE/PPK/shared accounts, „Zwroty”, subaccounts – removed in Oct 2026: done long ago, and the default accounts have them) */
      if(!leg&&!s.metadata.fromCache&&c.cats.some(k=>k.hue==null))c.cats.forEach((k,i)=>{if(k.hue==null){k.hue=HUES[i%HUES.length];saveCat(k)}});}
    else if(!s.metadata.fromCache&&!seeding){seeding=true;S.cfg=seed();render();saveCfg()}
  },onErr));
  unsub.push(onSnapshot(MC(),{includeMetadataChanges:true},s=>{const all=[];S.months=new Set();
    s.docs.forEach(d=>{S.months.add(d.id);const m=d.data()?.tx||{};for(const[id,t]of Object.entries(m))all.push({id,...t})});
    S.tx=all;syncLabel(s.metadata);render()},onErr));
  unsub.push(onSnapshot(PLC(),{includeMetadataChanges:true},s=>{const p={};s.docs.forEach(d=>p[d.id]={...d.data()});S.plans=p;S.plansSrv=!s.metadata.fromCache;render()},onErr));
  unsub.push(onSnapshot(META(),s=>{S.backup=s.exists()?s.data():null;render()},onErr));
  unsub.push(onSnapshot(RMETA(),s=>{S.rcptMeta=s.exists()?s.data():null;if(S.tab=='set')render()},onErr));
  unsub.push(onSnapshot(MARKET(),s=>{const p={};s.docs.forEach(d=>p[d.id]=clone(d.data()));S.market=p;render()},onErr));
  unsub.push(onSnapshot(DEBTS(),s=>{const p={};s.docs.forEach(d=>p[d.id]=clone(d.data()));S.debts=p;render()},onErr));
  unsub.push(onSnapshot(HOLD(),s=>{const p={};s.docs.forEach(d=>p[d.id]=clone(d.data()));S.hold=p;render()},onErr));
  unsub.push(onSnapshot(SLIPS(),s=>{const p={};s.docs.forEach(d=>p[d.id]=clone(d.data().s||{}));S.slips=p;render()},onErr));
  unsub.push(onSnapshot(GOALS(),s=>{const g={};s.docs.forEach(d=>g[d.id]=clone(d.data()));S.goals=g;render()},onErr));
});
/* 🔄 a new version: sw.js downloads all its files first, then takes over – the page reloads itself when nothing is being typed (sw.js) */
if(!DEMO&&'serviceWorker' in navigator){const SW=navigator.serviceWorker,had=!!SW.controller;SW.register('./sw.js').then(r=>{document.addEventListener('visibilitychange',()=>{if(document.visibilityState=='visible')r.update().catch(()=>{})})}).catch(()=>{});
  const reload=()=>{const busy=document.querySelector('.ov:not([hidden])')||!$('sheet').hidden||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||'');if(busy)return setTimeout(reload,3000);location.reload()};
  SW.addEventListener('controllerchange',()=>{if(had)reload()});SW.addEventListener('message',e=>{const u=e.data?.go;if(u){const g=goFromHash(new URL(u,location.href).hash);if(g)runGo(g)}})}
window.addEventListener('hashchange',()=>{const g=goFromHash(location.hash);if(g&&S.cfg){window.history.replaceState(null,'',location.pathname+location.search);runGo(g)}});
S.goPending=goFromHash(location.hash);if(S.goPending)window.history.replaceState(null,'',location.pathname+location.search);
Object.assign(window,{editInt,bookInt,okCats,askBirth,planToFixed,togF,openClose,closeClose,closeRecAll,reconOk,closeStep,closePlan,subMenu,hideSub,fixPlan,addTerm,payoffDebt,restoreTx,setHide,openReport,closeReport,openHelp,closeHelp,helpFilter,shareDemo,showEmpty,showCat,setLook,addRecFixed,setUnits,bondRatesDlg,ulgaInfo,siriHelp,maybeToday,todayGo,ignoreCheck,enablePush,disablePush,saveAutoVal,acceptLimits,showToday,closeToday,goTab,setAnaMode,exportCsv,wrapped,fillAvg,editProj,openProj,closeProj,editRem,doneRem,setCascade,setAccView,editDebt,setDebtLeft,lentBack,moveLent,openInst,closeInst,editInst,addLot,setPrice,saveInstVal,openValues,saveValues,editLimits,setGain,odloz,goYear,setYearAcc,editYear,payYear,editRound,setFixSub,setPayView,editInc,openSlip,closeSlip,slipCalc,slipRow,slipCopy,slipSuggest,slipNetto,slipReal,linkInc,saveSlip,delSlip,setKotki,showTour,showNews,setAccTab,moveAcc,setBF,setAccSub,showWealth,setRecScope,openRecon,closeRecon,recSum,applyRecon,addSavAcc,editSavAcc,allocGoal,setSavTarget,setSub,setAna,editGoal,setQ,setF,clearF,editCat,addCat,moveCat,goFixed,$,S,render,tog,openTx,setPlan,copyPlan,addAcc,editAcc,addSub,renSub,delSub,setWho,editFixed,toggleFixed,exportJson,logout});
