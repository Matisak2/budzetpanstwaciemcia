/* Budżet M&W – 🗓️ zamknięcie miesiąca: one screen with 5 steps at the start of a month (bank balances, what went over the plan,
   surplus, the plan for the new month, goals). Steps are shared by both phones (households/main closeM{ym:{steps,done}});
   „✓ Zgadza się” at an account = reconM{accId:date}. Only declarations here – nothing runs when the module loads. */
import {doc} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {scene} from './cats.js';
import {kotki} from './guide.js';
import {CLOSE_STEPS,closeDueP} from './today.js';
import {actuals,agg,balance,fixedPlanGap,liveOf,planOf,savFlow,savIds,subsMap} from './logic.js';
import {MN,MNG,addDays,addMonths,esc,td,zl,zl0,money} from './util.js';
import {S,toast,CUR,accOwner,H,PLC,merge,guard,celebrate} from './core.js';
import {goalProgress,unallocated,markRecon} from './actions.js';
import {cascadeH} from './debts.js';
import {render} from './app.js';

const STEP_N={bank:'Salda z bankiem',prev:'Co było ponad plan',casc:'Nadwyżka',plan:'Plan na nowy miesiąc',goals:'Cele'};
/* the month waiting to be closed (first 10 days), or the previous month when opened by hand */
export const closeYm=()=>closeDueP(S.hraw,liveOf(S.tx),td())?.ym||addMonths(td().slice(0,7),-1);
const stOf=ym=>S.hraw?.closeM?.[ym]||{};
const nDone=ym=>CLOSE_STEPS.filter(k=>stOf(ym).steps?.[k]).length;
/* accounts to compare with the bank: current, sub-accounts and savings (investments are valued by the automat) */
const bankAccs=()=>S.cfg.accs.filter(a=>!a.archived&&a.grp!='inv');
/* the last time an account was checked with the bank: „✓ Zgadza się” or a reconciliation entry */
export function lastCheck(id){let d=S.hraw?.reconM?.[id]||'';
  for(const t of liveOf(S.tx))if(t.acc===id&&t.type=='adj'&&!t.val&&t.date>d)d=t.date;return d}
const fresh=(id,ym)=>lastCheck(id)>=ym+'-25';
const dmy=d=>d.split('-').reverse().join('.');

export function openClose(ym){if(guard())return;S.tab='dash';S.proj=null;S.close=ym||closeYm();S.ym=td().slice(0,7);window.scrollTo(0,0);render()}
export function closeClose(){S.close=null;window.scrollTo(0,0);render()}
/* „✓ Zgadza się”: the balance in the app is the same as in the bank */
export function reconOk(id){if(guard())return;markRecon([id]);render();toast('✓ Zgadza się')}
/* a step done / undone; all five → the month is closed (confetti) */
export function closeStep(k,on){if(guard())return;const ym=S.close;if(!ym)return;const v=on?{by:S.who,at:Date.now()}:null,c=stOf(ym),steps={...(c.steps||{}),[k]:v};
  const all=CLOSE_STEPS.every(x=>steps[x]),done=all?{by:S.who,at:Date.now()}:null;
  S.hraw={...S.hraw,closeM:{...(S.hraw?.closeM||{}),[ym]:{...c,steps,done}}};merge(H,{closeM:{[ym]:{steps:{[k]:v},done}}});render();
  if(all&&!c.done)celebrate({scene:'celebrate',title:`${MN[+ym.slice(5)-1]} zamknięty! 🎉`,text:`Salda sprawdzone, plan gotowy, nadwyżka na swoim miejscu. Bailey odhacza w kalendarzu, Ivo idzie na drzemkę.`})}
/* the plan of the new month for one position (from step 2) */
export function closePlan(sid,val){if(guard())return;const ym=td().slice(0,7);S.plans={...S.plans,[ym]:{...(S.plans[ym]||{}),[sid]:val}};merge(doc(PLC(),ym),{[sid]:val});render();toast('Plan na '+MN[+ym.slice(5)-1].toLowerCase()+': '+zl0(val))}

/* the card on the Budget screen: big while the month waits, a small line when it is done or not due */
export function closeCardH(){if(S.ym!=td().slice(0,7))return'';const due=closeDueP(S.hraw,liveOf(S.tx),td());
  if(due)return`<button class="alert info closecard" onclick="openClose()"><b>🗓️ Zamknij ${MN[+due.ym.slice(5)-1].toLowerCase()} – ${due.n} z 5 kroków ›</b><span class="mini">salda z bankiem · co było ponad plan · nadwyżka · plan · cele – ok. 10 minut</span></button>`;
  return''}
export function closeLinkH(){if(S.ym!=td().slice(0,7))return'';const ym=closeYm(),c=stOf(ym);
  return`<button class="btn sm" onclick="openClose()">🗓️ Zamknięcie miesiąca: ${MN[+ym.slice(5)-1].toLowerCase()}${c.done?' ✓':nDone(ym)?` (${nDone(ym)}/5)`:''}</button>`}

const stepH=(i,k,body,label)=>{const st=stOf(S.close).steps?.[k];
  return`<section class="chart cstep${st?' done':''}"><div class="ct"><b>${i}. ${STEP_N[k]}</b>${st?`<span class="pill ok">✓ ${esc(st.by||'')}</span>`:''}</div>${body}
    <div class="btns" style="gap:6px">${st?`<button class="btn sm" onclick="closeStep('${k}',0)">↺ Cofnij</button>`:`<button class="btn sm primary" onclick="closeStep('${k}',1)">✓ ${label}</button>`}</div></section>`};

export function closePageH(){const ym=S.close,cur=td().slice(0,7),tx=liveOf(S.tx),sm=subsMap(S.cfg),mn=MN[+ym.slice(5)-1],mnc=MN[+cur.slice(5)-1],n=nDone(ym),c=stOf(ym);
  let h=`<button class="btn sm" style="align-self:flex-start" onclick="closeClose()">‹ Budżet</button>`;
  h+=`<section class="greet"><div class="gtxt"><b>🗓️ Zamknięcie: ${esc(mn)} ${ym.slice(0,4)}</b><span>${c.done?`Gotowe – zamknięte ${c.done.by?'przez '+esc(c.done.by):''} 🎉 Możecie tu zajrzeć, kiedy chcecie.`:`5 kroków, ok. 10 minut. Możecie je podzielić – odhaczone kroki widać na obu telefonach.`}</span></div>${kotki.mode=='off'?'':`<div class="gcats">${scene(c.done?'happy':'lupa','kot')}</div>`}</section>`;
  h+=`<div class="gbar"><i style="width:${(n/5*100).toFixed(0)}%"></i></div><div class="mini" style="text-align:center">${n} z 5 kroków</div>`;

  /* 1. bank balances */
  const A=bankAccs(),ok=A.filter(a=>fresh(a.id,ym)).length,tom=addDays(td(),1);
  h+=stepH(1,'bank',`<div class="mini">Otwórz aplikacje banków i porównaj salda. Zgadza się – „✓”. Inaczej – „⚖️” i wpisz saldo z banku (różnica zapisze się jako wyrównanie, nie wydatek).</div>
    <div class="list">${A.map(a=>{const lc=lastCheck(a.id),f=fresh(a.id,ym);return`<div class="acc"><div style="min-width:0;flex:1"><b>${esc(a.name)}</b><div class="mini">${esc(accOwner(a))} · ${f?`<span class="t-inc">✓ sprawdzone ${dmy(lc)}</span>`:lc?`sprawdzone ${dmy(lc)}`:'jeszcze nie sprawdzane'}</div></div><div class="r"><b class="num">${money(balance(S.cfg,tx,a.id,tom),CUR(a))}</b>${f?'':`<div class="btns" style="gap:4px;justify-content:flex-end"><button class="chip" onclick="reconOk('${a.id}')">✓</button><button class="chip" onclick="recon('${a.id}')">⚖️</button></div>`}</div></div>`}).join('')}</div>
    <div class="mini">${ok} z ${A.length} kont sprawdzonych.</div>`,ok==A.length?'Wszystko sprawdzone':'Gotowe');

  /* 2. what went over the plan last month */
  const pl=planOf(S.cfg,S.plans,tx,ym),act=actuals(S.cfg,tx,ym),plc=S.plans[cur]||{},Ag=agg(S.cfg,tx,ym),put=savFlow(S.cfg,tx,savIds(S.cfg),ym).flow;
  const L=S.cfg.cats.filter(c=>c.type=='exp').flatMap(c=>c.subs.map(s=>({s,p:pl[s.id]||0,a:act[s.id]||0}))).filter(x=>x.a>x.p).sort((x,y)=>(y.a-y.p)-(x.a-x.p));
  h+=stepH(2,'prev',`<div class="mini">${esc(mn)}: przychody ${zl0(Ag.inc)} · wydatki ${zl0(Ag.exp)} · bilans <b style="color:var(--fg)">${Ag.inc-Ag.exp>=0?'+':''}${zl0(Ag.inc-Ag.exp)}</b> · odłożone ${zl0(put)}</div>
    ${L.length?`<div class="mini">Ponad plan albo bez planu – może plan na ${esc(mnc.toLowerCase())} powinien być inny?</div>${L.slice(0,8).map(x=>{const v=Math.ceil(x.a/1000)*1000,now=plc[x.s.id]||0;return`<div class="r1"><span>${esc(x.s.name)} <span class="mini">${zl0(x.a)}${x.p?` przy planie ${zl0(x.p)}`:' bez planu'}</span></span>${now>=v?`<span class="mini t-inc">plan ${zl0(now)} ✓</span>`:`<button class="chip" onclick="closePlan('${x.s.id}',${v})">plan ${zl0(v)}</button>`}</div>`}).join('')}`:'<div class="mini t-inc">💚 Nic nie przekroczyło planu.</div>'}`,'Przejrzane');

  /* 3. surplus on current accounts */
  const cas=['Mati','Wercia','Wspólne'].map(o=>cascadeH(o)).join('');
  h+=stepH(3,'casc',cas||'<div class="mini">Na kontach bieżących nie ma nadwyżek do przelania.</div>','Gotowe');

  /* 4. the plan of the new month */
  const pn=planOf(S.cfg,S.plans,tx,cur),sum=t=>S.cfg.cats.filter(c=>c.type==t).reduce((a,c)=>a+c.subs.reduce((b,s)=>b+(pn[s.id]||0),0),0),pi=sum('inc'),pe=sum('exp'),gap=fixedPlanGap(S.cfg,pn).filter(x=>!x.sub.hidden&&!x.sub.cat.hidden),tg=S.savTarget||0;
  h+=stepH(4,'plan',pe||pi?`<div class="mini">${esc(mnc)}: przychody w planie ${zl0(pi)} · wydatki ${zl0(pe)} · zostaje ${zl0(pi-pe)}${tg?` · cel odkładania ${zl0(tg)}${pi-pe<tg?' – <b class="t-exp">plan nie zostawia tyle</b>':''}`:''}</div>${gap.length?`<div class="mini t-exp">📌 Plan niższy niż opłaty stałe: ${gap.map(x=>esc(x.sub.name)).join(', ')}</div><button class="btn sm" onclick="planToFixed()">Podnieś plan do opłat stałych</button>`:''}`
    :`<div class="mini">${esc(mnc)} nie ma jeszcze planu.</div><div class="btns" style="gap:6px"><button class="btn sm" onclick="copyPlan()">Skopiuj z poprzedniego miesiąca</button><button class="btn sm" onclick="fillAvg()">Wypełnij średnimi</button></div>`,'Plan gotowy');

  /* 5. goals: what to put into each this month */
  const G=Object.entries(S.goals).map(([id,g])=>({id,...g,pr:goalProgress(g,S.cfg,tx,td())})).filter(g=>!g.pr.done);
  const free=['Mati','Wercia','Wspólne'].map(o=>({o,v:unallocated(o)})).filter(x=>x.v>0);
  h+=stepH(5,'goals',G.length?`${free.length?`<div class="mini">Do przydzielenia: ${free.map(x=>`${x.o} ${zl0(x.v)}`).join(' · ')}</div>`:''}${G.map(g=>`<div class="r1"><span>${esc(g.name)} <span class="mini">${zl0(g.pr.saved)} z ${zl0(g.target)}${g.pr.perMonth?` · ok. ${zl0(g.pr.perMonth)}/mies. do ${MNG[+g.deadline.slice(5,7)-1]}`:''}</span></span><button class="chip" onclick="allocGoal('${g.id}',1)">Przydziel</button></div>`).join('')}<div class="mini">Przydzielacie część oszczędności – pieniądze zostają na kontach.</div>`
    :'<div class="mini">Nie macie celów w trakcie. Nowy cel dodacie w 💰 Majątek → Oszczędności.</div>','Gotowe');
  return h}
