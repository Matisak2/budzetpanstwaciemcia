/* Budżet M&W – 🗓️ zamknięcie miesiąca: one screen with 5 steps, personal – each of you the day before your earliest pay day
   (learned from the payslips, today.js closeWinP). Bank balances (own + shared accounts), surplus (own accounts) and goals are personal
   (closeM{ym:{p:{who:{steps,done}}}}), „Co było ponad plan” and „Plan” are shared (closeM{ym:{steps}} – ticked by one = ticked for both).
   „✓ Zgadza się” at an account = reconM{accId:date}. Only declarations here – nothing runs when the module loads. */
import {doc} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {scene} from './cats.js';
import {kotki} from './guide.js';
import {CLOSE_STEPS,CLOSE_SHARED,closeDueP,closeStateP,closeYmP} from './today.js';
import {actuals,agg,avgActuals,balance,fixedPlanGap,liveOf,planOf,savFlow,savIds} from './logic.js';
import {MN,MNG,addDays,addMonths,esc,td,zl0,money,dmy} from './util.js';
import {S,toast,CUR,accOwner,H,PLC,merge,guard,celebrate} from './core.js';
import {goalProgress,goalOwner,unallocated,markRecon} from './actions.js';
import {cascadeH} from './debts.js';
import {render} from './app.js';

const STEP_N={bank:'Salda z bankiem',prev:'Co było ponad plan',casc:'Nadwyżka',plan:'Plan na nowy miesiąc',goals:'Cele'};
/* the month waiting to be closed by this phone's person (the window before the pay day), or the last one when opened by hand */
export const closeYm=()=>closeDueP(S.hraw,liveOf(S.tx),td(),S.cfg,S.who)?.ym||closeYmP(S.cfg,liveOf(S.tx),S.who,td());
const stOf=ym=>closeStateP(S.hraw,ym,S.who);
const nDone=ym=>stOf(ym).n;
/* accounts to compare with the bank: own and shared current, sub-accounts and savings (investments are valued by the automat) */
const bankAccs=()=>S.cfg.accs.filter(a=>!a.archived&&a.grp!='inv'&&['Wspólne',S.who].includes(accOwner(a)));
/* the last time an account was checked with the bank: „✓ Zgadza się” or a reconciliation entry */
export function lastCheck(id){let d=S.hraw?.reconM?.[id]||'';
  for(const t of liveOf(S.tx))if(t.acc===id&&t.type=='adj'&&!t.val&&t.date>d)d=t.date;return d}
const fresh=(id,ym)=>lastCheck(id)>=ym+'-25';

export function openClose(ym){if(guard())return;S.tab='dash';S.proj=null;S.close=ym||closeYm();S.ym=td().slice(0,7);window.scrollTo(0,0);render()}
export function closeClose(){S.close=null;window.scrollTo(0,0);render()}
/* „Wyrównaj wszystkie salda naraz” from step 1 – the same screen as in 👛 Konta, back to the closing afterwards */
export function closeRecAll(){if(guard())return;S.recBack=S.close;S.tab='acc';S.close=null;S.recon=true;S.recVals={};S.recScope='cur';window.scrollTo(0,0);render()}
/* „✓ Zgadza się”: the balance in the app is the same as in the bank */
export function reconOk(id){if(guard())return;markRecon([id]);render();toast('✓ Zgadza się')}
/* a step done / undone (a shared one for both of you); all five → this person's month is closed (confetti) */
export function closeStep(k,on){if(guard())return;const ym=S.close;if(!ym)return;const v=on?{by:S.who,at:Date.now()}:null,was=stOf(ym),sh=CLOSE_SHARED.includes(k);
  const c=S.hraw?.closeM?.[ym]||{},me=c.p?.[S.who]||{},nc=sh?{...c,steps:{...(c.steps||{}),[k]:v}}:{...c,p:{...(c.p||{}),[S.who]:{...me,steps:{...(me.steps||{}),[k]:v}}}};
  const st=closeStateP({closeM:{[ym]:nc}},ym,S.who),all=st.n==CLOSE_STEPS.length,done=all?{by:S.who,at:Date.now()}:null;
  nc.p={...(nc.p||{}),[S.who]:{...(nc.p?.[S.who]||{}),done}};
  S.hraw={...S.hraw,closeM:{...(S.hraw?.closeM||{}),[ym]:nc}};merge(H,{closeM:{[ym]:sh?{steps:{[k]:v},p:{[S.who]:{done}}}:{p:{[S.who]:{steps:{[k]:v},done}}}}});render();
  if(all&&!was.done)celebrate({scene:'celebrate',title:`${MN[+ym.slice(5)-1]} zamknięty! 🎉`,text:`Salda sprawdzone, plan gotowy, nadwyżka na swoim miejscu. Bailey odhacza w kalendarzu, Ivo idzie na drzemkę.`})}
/* the plan of the new month for one position (from step 2) */
export function closePlan(sid,val){if(guard())return;const ym=td().slice(0,7);S.plans={...S.plans,[ym]:{...(S.plans[ym]||{}),[sid]:val}};merge(doc(PLC(),ym),{[sid]:val});render();toast('Plan na '+MN[+ym.slice(5)-1].toLowerCase()+': '+zl0(val))}

/* the card on the Budget screen: big while the month waits, a small line when it is done or not due */
export function closeCardH(){if(S.ym!=td().slice(0,7))return'';const due=closeDueP(S.hraw,liveOf(S.tx),td(),S.cfg,S.who);
  if(due)return`<button class="alert info closecard" onclick="openClose()"><b>🗓️ Zamknij ${MN[+due.ym.slice(5)-1].toLowerCase()} – ${due.n} z 5 kroków ›</b><span class="mini">${due.pay&&due.pay>td()?`przed wypłatą ${dmy(due.pay)} · `:''}salda z bankiem · co było ponad plan · nadwyżka · plan · cele – ok. 10 minut</span></button>`;
  return''}
export function closeLinkH(){if(S.ym!=td().slice(0,7))return'';const ym=closeYm(),c=stOf(ym);
  return`<button class="btn sm" onclick="openClose()">🗓️ Zamknięcie miesiąca: ${MN[+ym.slice(5)-1].toLowerCase()}${c.done?' ✓':nDone(ym)?` (${nDone(ym)}/5)`:''}</button>`}

const stepH=(i,k,body,label)=>{const st=stOf(S.close).steps?.[k];
  return`<section class="chart cstep${st?' done':''}"><div class="ct"><b>${i}. ${STEP_N[k]}</b>${st?`<span class="pill ok">✓ ${esc(st.by||'')}</span>`:CLOSE_SHARED.includes(k)?'<span class="pill low">wspólny</span>':''}</div>${body}
    <div class="btns" style="gap:6px">${st?`<button class="btn sm" onclick="closeStep('${k}',0)">↺ Cofnij</button>`:`<button class="btn sm primary" onclick="closeStep('${k}',1)">✓ ${label}</button>`}</div></section>`};

export function closePageH(){const ym=S.close,cur=td().slice(0,7),tx=liveOf(S.tx),mn=MN[+ym.slice(5)-1],mnc=MN[+cur.slice(5)-1],n=nDone(ym),c=stOf(ym);
  let h=`<button class="btn sm" style="align-self:flex-start" onclick="closeClose()">‹ Budżet</button>`;
  h+=`<section class="greet"><div class="gtxt"><b>🗓️ Zamknięcie: ${esc(mn)} ${ym.slice(0,4)} – ${esc(S.who)}</b><span>${c.done?`Gotowe 🎉 Możesz tu zajrzeć, kiedy chcesz.`:`5 kroków, ok. 10 minut – najlepiej dzień przed wypłatą: na kontach jest wtedy to, co naprawdę zostało. „Co było ponad plan” i „Plan” są wspólne – odhaczone przez jedno z Was są odhaczone u obojga.`}</span></div>${kotki.mode=='off'?'':`<div class="gcats">${scene(c.done?'happy':'lupa','kot')}</div>`}</section>`;
  h+=`<div class="gbar"><i style="width:${(n/5*100).toFixed(0)}%"></i></div><div class="mini" style="text-align:center">${n} z 5 kroków</div>`;

  /* 1. bank balances */
  const A=bankAccs(),ok=A.filter(a=>fresh(a.id,ym)).length,tom=addDays(td(),1);
  h+=stepH(1,'bank',`<div class="mini">Otwórz aplikacje banków i porównaj salda (Twoje i wspólne). Zgadza się – „✓”. Inaczej – „Wyrównaj wszystkie salda naraz” i wpisz salda z banku (różnica zapisze się jako przelew albo wyrównanie, nie wydatek). Wspólne konto sprawdzone przez jedno z Was jest sprawdzone u obojga.</div>
    <div class="list">${A.map(a=>{const lc=lastCheck(a.id),f=fresh(a.id,ym);return`<div class="acc"><div style="min-width:0;flex:1"><b>${esc(a.name)}</b><div class="mini">${esc(accOwner(a))} · ${f?`<span class="t-inc">✓ sprawdzone ${dmy(lc)}</span>`:lc?`sprawdzone ${dmy(lc)}`:'jeszcze nie sprawdzane'}</div></div><div class="r"><b class="num">${money(balance(S.cfg,tx,a.id,tom),CUR(a))}</b>${f?'':`<div class="btns" style="gap:4px;justify-content:flex-end"><button class="chip" aria-label="Zgadza się: ${esc(a.name)}" onclick="reconOk('${a.id}')">✓ Zgadza się</button></div>`}</div></div>`}).join('')}</div>
    ${ok<A.length?`<button class="btn sm" onclick="closeRecAll()">⚖️ Wyrównaj wszystkie salda naraz</button>`:''}
    <div class="mini">${ok} z ${A.length} kont sprawdzonych.</div>`,ok==A.length?'Wszystko sprawdzone':'Gotowe');

  /* 2. what went over the plan last month */
  const pl=planOf(S.cfg,S.plans,tx,ym),act=actuals(S.cfg,tx,ym),plc=S.plans[cur]||{},Ag=agg(S.cfg,tx,ym),put=savFlow(S.cfg,tx,savIds(S.cfg),ym).flow;
  /* the proposed plan = the average of the closed month and the two before (one expensive month should not raise the plan for good) */
  const{avg:AV,months:AVn}=avgActuals(S.cfg,tx,addMonths(ym,1),3);
  const L=S.cfg.cats.filter(c=>c.type=='exp').flatMap(c=>c.subs.map(s=>({s,p:pl[s.id]||0,a:act[s.id]||0}))).filter(x=>x.a>x.p).sort((x,y)=>(y.a-y.p)-(x.a-x.p));
  h+=stepH(2,'prev',`<div class="mini">${esc(mn)}: przychody ${zl0(Ag.inc)} · wydatki ${zl0(Ag.exp)} · bilans <b style="color:var(--fg)">${Ag.inc-Ag.exp>=0?'+':''}${zl0(Ag.inc-Ag.exp)}</b> · odłożone ${zl0(put)}</div>
    ${L.length?`<div class="mini">Ponad plan albo bez planu – może plan na ${esc(mnc.toLowerCase())} powinien być inny?</div>${L.slice(0,8).map(x=>{const av=AV[x.s.id]||0,v=Math.ceil(av/1000)*1000,now=plc[x.s.id]||0;return`<div class="r1"><span>${esc(x.s.name)} <span class="mini">${zl0(x.a)}${x.p?` przy planie ${zl0(x.p)}`:' bez planu'}${AVn>1?` · średnio ${zl0(av)}`:''}</span></span>${now>=v?`<span class="mini t-inc">${AVn>1?'jednorazowo – ':''}plan ${zl0(now)} zostaje</span>`:`<button class="chip" onclick="closePlan('${x.s.id}',${v})">plan ${zl0(v)}</button>`}</div>`}).join('')}`:'<div class="mini t-inc">💚 Nic nie przekroczyło planu.</div>'}`,'Przejrzane');

  /* 3. surplus on current accounts */
  const cas=cascadeH(S.who);
  h+=stepH(3,'casc',cas||'<div class="mini">Na Twoich kontach bieżących nie ma nadwyżek do przelania (albo nie masz jeszcze konta oszczędnościowego).</div>','Gotowe');

  /* 4. the plan of the new month */
  const pn=planOf(S.cfg,S.plans,tx,cur),sum=t=>S.cfg.cats.filter(c=>c.type==t).reduce((a,c)=>a+c.subs.reduce((b,s)=>b+(pn[s.id]||0),0),0),pi=sum('inc'),pe=sum('exp'),gap=fixedPlanGap(S.cfg,pn).filter(x=>!x.sub.hidden&&!x.sub.cat.hidden),tg=S.savTarget||0;
  h+=stepH(4,'plan',pe||pi?`<div class="mini">${esc(mnc)}: przychody w planie ${zl0(pi)} · wydatki ${zl0(pe)} · zostaje ${zl0(pi-pe)}${tg?` · cel odkładania ${zl0(tg)}${pi-pe<tg?' – <b class="t-exp">plan nie zostawia tyle</b>':''}`:''}</div>${gap.length?`<div class="mini t-exp">📌 Plan niższy niż opłaty stałe: ${gap.map(x=>esc(x.sub.name)).join(', ')}</div><button class="btn sm" onclick="planToFixed()">Podnieś plan do opłat stałych</button>`:''}`
    :`<div class="mini">${esc(mnc)} nie ma jeszcze planu.</div><div class="btns" style="gap:6px"><button class="btn sm" onclick="copyPlan()">Skopiuj z poprzedniego miesiąca</button><button class="btn sm" onclick="fillAvg()">Wypełnij średnimi</button></div>`,'Plan gotowy');

  /* 5. goals: what to put into each this month */
  const G=Object.entries(S.goals).map(([id,g])=>({id,...g,pr:goalProgress(g,S.cfg,tx,td())})).filter(g=>!g.pr.done&&[S.who,'Wspólne'].includes(goalOwner(g)));
  const free=[S.who,'Wspólne'].map(o=>({o,v:unallocated(o)})).filter(x=>x.v>0);
  h+=stepH(5,'goals',G.length?`${free.length?`<div class="mini">Do przydzielenia: ${free.map(x=>`${x.o} ${zl0(x.v)}`).join(' · ')}</div>`:''}${G.map(g=>`<div class="r1"><span>${esc(g.name)} <span class="mini">${zl0(g.pr.saved)} z ${zl0(g.target)}${g.pr.perMonth?` · ok. ${zl0(g.pr.perMonth)}/mies. do ${MNG[+g.deadline.slice(5,7)-1]}`:''}</span></span><button class="chip" onclick="allocGoal('${g.id}',1)">Przydziel</button></div>`).join('')}<div class="mini">Przydzielacie część oszczędności – pieniądze zostają na kontach.</div>`
    :'<div class="mini">Nie macie celów w trakcie. Nowy cel dodacie w 💰 Majątek → Oszczędności.</div>','Gotowe');
  return h}
