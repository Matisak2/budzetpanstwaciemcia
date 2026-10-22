/* 🔔 „Na dziś” and the tidiness guard – pure functions shared by the app and the GitHub automat (no DOM, no Firebase).
   D = {cfg, tx (live entries), slips, hold, debts, market, backup, hraw}; every item says whom it concerns (who: 'Mati'|'Wercia'|null = both)
   and where a tap leads (go: {a:'fixed'|'slip'|'pay'|'add'|'year'|'rem'|'lent'|'owe'|'inst'|'tr'|'sav'|'limits'|'backup'|'automat'|'tx'|'acc', ...}). */
import {MN,addDays,addMonths,money,zl} from './util.js';
import {balance,carStats,dueAlerts,subsMap} from './logic.js';
import {BONDS,IICON,addM,limitOf,paidInYear,wrapOf,yearPlan,LIMITS} from './inv.js';
import {calcNet} from './pay.js';
export const ownerOf=a=>a?.owner||(/wercia|weronika/i.test(a?.name||'')?'Wercia':/mati/i.test(a?.name||'')?'Mati':'Wspólne');
const person=o=>o=='Mati'||o=='Wercia'?o:null;
const plu=(n,a,b,c)=>n==1?a:(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20))?b:c;
const dmy=d=>d.split('-').reverse().join('.');
const dd=(a,b)=>Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/864e5);
/* yearly expenses: what the envelopes hold, what to put aside this month, what is due soon */
export function yearStateP(cfg,tx,hraw,ym,today){const id=hraw?.yearAcc,years=cfg.years||[];if(!id||!cfg.accs.some(a=>a.id==id)||!years.length)return null;
  const now=balance(cfg,tx,id,addDays(today,1)),base=yearPlan(years,balance(cfg,tx,id,ym+'-01'),ym),need=base.reduce((a,x)=>a+x.need,0);
  const dep=tx.filter(t=>t.type=='tr'&&t.to===id&&t.date.startsWith(ym)).reduce((a,t)=>a+(t.amount2??t.amount),0);
  return{id,now,list:yearPlan(years,now,ym),need,dep,left:Math.max(0,need-dep),soon:base.filter(x=>x.months<=2&&x.fill<x.it.amount)}}
/* a liability or receivable: what is left, estimated end, overdue */
export function debtStateP(d,tx,today){if(!d?.id)return{left:0,paid:0,pc:0,src:'auto',end:null,pays:[],late:false};
  const pays=tx.filter(t=>d.dir=='owe'?t.debt===d.id:t.lendOf===d.id).sort((a,b)=>a.date.localeCompare(b.date)),paid=pays.reduce((a,t)=>a+t.amount,0);
  const bl=Object.entries(d.left||{}).sort((a,b)=>a[0].localeCompare(b[0])).at(-1);let left=Math.max(0,(d.start||0)-paid),src='auto';
  if(d.mode=='bank'&&bl){const after=pays.filter(t=>t.date>bl[0]).reduce((a,t)=>a+t.amount,0);left=Math.max(0,bl[1]-after);src=bl[0]}
  const pc=d.start?Math.min(100,(1-left/d.start)*100):0,last3=pays.slice(-3),avg=last3.length?last3.reduce((a,t)=>a+t.amount,0)/last3.length:(d.inst||0);
  const months=left&&(d.inst||avg)>0?Math.ceil(left/(d.inst||avg)):null,end=months?addMonths(today.slice(0,7),months):null;
  return{left,paid,pc,src,end,pays,late:d.dir=='lent'&&!!d.until&&d.until<today&&left>0}}
/* 💰 saving up for a one-time payoff: every liability counts what was put aside for it – tx.save{debtId:grosze}
   (+ a transfer into the account, − money taken back, the payoff and its interest) */
export const savedP=(id,tx)=>tx.reduce((a,t)=>a+(+t.save?.[id]||0),0);
/* an account that holds money for payoffs: per liability, all together, the balance and what is left free */
export function saveSplitP(cfg,tx,debts,acc,today){
  const L=Object.entries(debts||{}).filter(([,d])=>!d.deleted&&d.dir=='owe'&&d.saveAcc==acc).map(([id,x])=>{const d={id,...x};return{d,saved:savedP(id,tx),left:debtStateP(d,tx,today).left}}).filter(x=>x.saved||x.left>0);
  const sum=L.reduce((a,x)=>a+x.saved,0),bal=balance(cfg,tx,acc,addDays(today,1));return{L,sum,bal,free:bal-sum}}
/* 🔔 reminders: days left, kilometres left for a car */
export function remStateP(r,cfg,tx,today){const car=r.proj&&(cfg.projs||[]).find(p=>p.id==r.proj),odo=car?carStats(cfg,tx,car.id,car.odo0).odo:0;
  const days=r.next?dd(today,r.next):null,kmLeft=r.km&&car?(r.lastOdo||car.odo0||0)+r.km-odo:null;
  return{days,kmLeft,odo,due:(days!=null&&days<=14)||(kmLeft!=null&&kmLeft<=500),late:(days!=null&&days<0)||(kmLeft!=null&&kmLeft<0)}}
/* bonds and deposits that end within `days` */
export function maturitiesP(cfg,hold,today,days){const lim=addDays(today,days),out=[];
  for(const[id,it]of Object.entries(hold||{})){if(it.deleted||(it.kind!='obl'&&it.kind!='lokata'))continue;const a=cfg.accs.find(x=>x.id==it.acc);if(!a)continue;
    for(const l of Object.values(it.lots||{})){if(l.deleted||l.kind=='sell')continue;const end=addM(l.date,it.kind=='obl'?(it.bond?.m||BONDS[it.bond?.type]?.m||120):+(it.dep?.months||12));
      if(end>=today&&end<=lim)out.push({id,it,a,end,days:dd(today,end)})}}
  return out.sort((x,y)=>x.end.localeCompare(y.end))}
/* a limits proposal from the automat that has not been answered yet */
export function limitPropP(market,hraw){const L=market?.limits;if(!L?.year||!L.ike)return null;const cur={...(LIMITS[L.year]||{}),...((hraw?.limits||{})[L.year]||{})};
  if(cur.ike==L.ike&&cur.ikze==L.ikze&&cur.ikzeB==L.ikzeB)return null;if((hraw?.limitsSeen||{})[L.year]==L.found)return null;return L}
/* the automat stopped: no prices for 3 working days (only once it has worked at least once) */
export function automatStale(market,today){const d=market?.rates?.date;if(!d)return 0;let n=0;for(let x=addDays(d,1);x<=today;x=addDays(x,1)){const w=new Date(x+'T12:00:00').getDay();if(w&&w<6)n++}return n>=3?dd(d,today):0}
/* 🧹 tidiness guard: possible duplicates, entries without a position or account, negative current accounts, payslips that do not add up */
export function checksP(D,today){const{cfg,tx,slips,hraw}=D,ign=hraw?.checkIgnore||{},sm=subsMap(cfg),acc=new Set(cfg.accs.map(a=>a.id)),cm={};cfg.accs.forEach(a=>cm[a.id]=a.cur||'PLN');const out=[];
  const add=(key,icon,text,go)=>{if(!ign[key])out.push({key,icon,text,go,k:'check',who:null,label:go.a=='tx'?'Zobacz':'Pokaż'})};
  const from=addDays(today,-62),groups={};
  for(const t of tx){if(t.date<from||t.date>today)continue;if(t.type!='exp')continue;const k=[t.date,t.amount,t.acc,t.sub].join('|');(groups[k]=groups[k]||[]).push(t)}
  for(const L of Object.values(groups)){if(L.length<2)continue;if(L.every(t=>t.split&&t.split==L[0].split))continue;const t=L[0];
    add('dup:'+L.map(x=>x.id).sort().join(','),'👯',`Możliwy duplikat: ${L.length}× ${sm[t.sub]?.name||'wydatek'} ${money(t.amount,cm[t.acc])} (${dmy(t.date)})`,{a:'tx',id:t.id})}
  for(const t of tx){if(t.date<from)continue;
    if(t.acc&&!acc.has(t.acc)){add('acc:'+t.id,'❓',`Wpis z ${dmy(t.date)} (${zl(t.amount)}) ma konto, którego już nie ma`,{a:'tx',id:t.id});continue}
    if(((t.type=='exp'&&!t.payoff)||(t.type=='inc'&&!t.ppk&&!t.lendOf&&!t.debtIn&&!t.slip))&&!sm[t.sub])add('sub:'+t.id,'🏷️',`${t.type=='exp'?'Wydatek':'Przychód'} ${money(t.amount,cm[t.acc])} z ${dmy(t.date)} nie ma pozycji budżetu`,{a:'tx',id:t.id})}
  for(const a of cfg.accs.filter(a=>!a.archived)){const s=saveSplitP(cfg,tx,D.debts,a.id,today);if(s.L.length&&s.free<=-100)
    add('save:'+a.id+':'+s.sum+':'+s.bal,'💰',`${a.name}: na koncie ${money(s.bal,a.cur)}, a odłożone na spłatę pożyczek to ${zl(s.sum)} – brakuje ${zl(-s.free)}. Może wypłata albo płatność z tego konta bez wybrania pożyczki?`,{a:'owe'})}
  for(const a of cfg.accs.filter(a=>a.grp=='cur'&&!a.archived)){const b=balance(cfg,tx,a.id,addDays(today,1));if(b<0)add('neg:'+a.id+':'+today.slice(0,7),'➖',`Ujemne saldo: ${a.name} ${money(b,a.cur)} – coś nie wpisane albo wyrównanie?`,{a:'acc'})}
  const ym=today.slice(0,7),pm=addMonths(ym,-1);
  for(const m of [pm,ym])for(const[id,sl]of Object.entries(slips?.[m]||{})){const src=(cfg.incs||[]).find(s=>s.id==id)||sl;if(src.kind=='b2b')continue;const diff=(sl.net||0)-calcNet(src,sl);
    if(Math.abs(diff)>=1)add('slip:'+m+':'+id+':'+sl.ts,'💼',`Pasek ${sl.name||src.name} (${MN[+m.slice(5)-1].toLowerCase()}) – rachunek nie zgadza się o ${zl(Math.abs(diff))}`,{a:'slip',id,ym:m})}
  return out.slice(0,10)}
/* 📌 payments that look regular but are not in 📌 Stałe: the same note once a month, a similar amount (±15%), 3 months in a row */
export const normNote=s=>String(s||'').toLowerCase().replace(/\d+/g,' ').replace(/[^\p{L} ]+/gu,' ').replace(/\s+/g,' ').trim();
export function recurringP(cfg,tx,today,ign={}){const ym=today.slice(0,7),months=[-3,-2,-1,0].map(d=>addMonths(ym,d)),by={};
  for(const t of tx){if(t.type!='exp'||t.fixedId||t.roundOf||t.ppk||t.split||t.slipOf||t.debt||t.date>today)continue;const i=months.indexOf(t.date.slice(0,7)),k=normNote(t.note);if(i<0||k.length<3)continue;
    (by[k]=by[k]||[[],[],[],[]])[i].push(t)}
  const fx=(cfg.fixed||[]).filter(f=>f.kind!='inc'&&f.kind!='tr'),out=[];
  for(const[k,M]of Object.entries(by)){if(ign['rec:'+k])continue;const w=[[1,2,3],[0,1,2]].find(w=>w.every(i=>M[i].length==1));if(!w)continue;
    const L=w.map(i=>M[i][0]),a=L.map(t=>t.amount),last=L.at(-1);if(Math.min(...a)<=0||Math.max(...a)/Math.min(...a)>1.15)continue;
    if(fx.some(f=>normNote(f.name)==k||(f.sub==last.sub&&Math.abs(f.amount-last.amount)<=last.amount*0.15)))continue;
    out.push({key:'rec:'+k,name:last.note.trim(),amount:last.amount,sub:last.sub,acc:last.acc,day:+last.date.slice(8)})}
  return out}
/* 🧾 tax reliefs a payment can be marked with – short explanations (a hint, not tax advice) */
export const ULGI={
  internet:{n:'Ulga internetowa',lim:76000,d:'Opłaty za internet (abonament domowy lub mobilny). Do 760 zł rocznie na osobę, tylko w dwóch kolejnych latach. Potrzebna faktura na Twoje imię.'},
  darowizny:{n:'Darowizny',d:'Darowizny na cele pożytku publicznego (np. fundacje, OPP), kult religijny, krwiodawstwo. Łącznie do 6% dochodu. Potrzebne potwierdzenie przelewu z nazwą odbiorcy.'},
  rehab:{n:'Ulga rehabilitacyjna',d:'Dla osoby z orzeczeniem o niepełnosprawności albo utrzymującej taką osobę: np. leki (nadwyżka ponad 100 zł miesięcznie), sprzęt, turnusy, dojazdy na zabiegi. Potrzebne faktury lub dowody zapłaty.'},
  termo:{n:'Ulga termomodernizacyjna',lim:5300000,d:'Właściciel domu jednorodzinnego: ocieplenie, wymiana pieca, pompa ciepła, fotowoltaika, okna. Do 53 000 zł na osobę łącznie przez wszystkie lata. Potrzebne faktury VAT.'},
  inne:{n:'Inna ulga',d:'Wydatek, który może się przydać przy zeznaniu – zapytacie księgową albo sprawdzicie w objaśnieniach do PIT.'}};
/* the relief summary of one person for a year (marked payments + IKZE payments) */
export function pitSummaryP(cfg,tx,year,who,hraw){const L=tx.filter(t=>t.date.startsWith(year)&&t.ulga&&(t.ulgaWho||t.who)==who&&(t.type=='exp'));
  const by={};L.forEach(t=>{(by[t.ulga]=by[t.ulga]||{sum:0,n:0}).sum+=t.amount;by[t.ulga].n++});
  const ikze=cfg.accs.filter(a=>a.grp=='inv'&&wrapOf(a)=='ikze'&&ownerOf(a)==who).map(a=>({a,paid:paidInYear(tx,a.id,year),lim:limitOf(a,year,hraw?.limits)})).filter(x=>x.paid>0);
  return{by,ikze,n:L.length}}
/* everything that needs attention today */
export function todayItems(D,{today,hour=12,checks=true}={}){const{cfg,tx,slips,hold,debts,market,backup,hraw}=D;if(!cfg)return[];
  const ym=today.slice(0,7),day=+today.slice(8),out=[],cm={};cfg.accs.forEach(a=>cm[a.id]=a.cur||'PLN');const accOf=id=>cfg.accs.find(a=>a.id==id);
  const add=(icon,text,go,label,k='',who=null)=>out.push({icon,text,go,label,k,who});const incs=cfg.incs||[];
  const st=automatStale(market,today);if(st)add('🤖',`Automat nie pobiera danych od ${st} dni. Sprawdź go na GitHubie.`,{a:'automat'},'Otwórz','bad');
  for(const x of dueAlerts(cfg.fixed||[],tx,today))add(x.when=='inc'?'📥':x.when=='late'?'⏰':'💳',x.when=='inc'?`${x.f.name} – czeka na odhaczenie`:`${x.f.name} · ${money(x.f.amount,cm[x.f.acc])} – ${x.when=='late'?'po terminie':x.when=='today'?'termin dziś':'termin jutro'}`,{a:'fixed'},'Odhacz',x.when=='late'?'bad':'',person(ownerOf(accOf(x.f.acc))));
  const live=new Set(tx.map(t=>t.id));
  for(const s of incs)if(day>=(s.day||10)){const sl=(slips?.[ym]||{})[s.id];if(!sl||!sl.booked||!live.has(sl.booked))add('💼',`Pasek: ${s.name}${s.who?' ('+s.who+')':''} – wypłata zwykle do ${s.day||10}.`,{a:'slip',id:s.id,ym},'Wpisz','',person(s.who))}
  if(day>=14&&day<=20)for(const s of incs.filter(s=>s.kind=='b2b'))add('🧾',`JDG (${s.name}): do 20. zapłać ZUS, zdrowotną i podatek.`,{a:'pay'},'Pensje','',person(s.who));
  if(hour>=20&&!tx.some(t=>t.date==today&&!t.fixedId&&!t.ppk&&!t.roundOf&&!(t.type=='adj'&&t.val)))add('✍️','Po 20:00 – dziś nic jeszcze nie wpisano. Były jakieś wydatki?',{a:'add'},'Wpisz');
  const ys=yearStateP(cfg,tx,hraw,ym,today);if(ys){if(ys.left)add('📅',`Wydatki roczne: w tym miesiącu odłóż jeszcze ${zl(ys.left)}.`,{a:'year'},'Odłóż');
    ys.soon.forEach(x=>add('⏰',`Wkrótce: ${x.it.name} (${zl(x.it.amount)}) – ${MN[+x.due.slice(5)-1].toLowerCase()}, w kopercie ${zl(x.fill)}.`,{a:'year'},'Zobacz'))}
  for(const r of cfg.rems||[]){const s=remStateP(r,cfg,tx,today);if(s.due||s.late)add('🔔',`${r.name}${r.next?' – '+dmy(r.next):''}${s.kmLeft!=null?` · zostało ${s.kmLeft.toLocaleString('pl-PL')} km`:''}`,{a:'rem'},'Zobacz',s.late?'bad':'')}
  for(const[id,x]of Object.entries(debts||{})){if(x.deleted||x.dir!='lent'||!x.until)continue;const d={id,...x},s=debtStateP(d,tx,today);if(!s.left)continue;const n=dd(today,d.until);
    if(n<=7)add('🔺',`${d.party||d.name} – zwrot ${zl(s.left)} ${n<0?'po terminie ('+dmy(d.until)+')':n==0?'dziś':'za '+n+' '+plu(n,'dzień','dni','dni')}`,{a:'lent'},'Zobacz',n<0?'bad':'',person(d.payer))}
  for(const[id,x]of Object.entries(debts||{})){if(x.deleted||x.dir!='owe'||!x.saveAcc)continue;const d={id,...x},s=debtStateP(d,tx,today),saved=savedP(id,tx),from=+d.day||1;
    if(s.left>0&&saved>=s.left&&day>=from&&day<=from+2)add('💰',`${d.name}: uzbierane ${zl(saved)} – możesz spłacić całość (${zl(s.left)}).`,{a:'owe'},'Zobacz','',person(d.payer))}
  for(const m of maturitiesP(cfg,hold,today,30))add(IICON[m.it.kind],`${m.it.kind=='obl'?'Wykup':'Koniec lokaty'}: ${m.it.name} – ${dmy(m.end)}`,{a:'inst',acc:m.a.id},'Zobacz','',person(ownerOf(m.a)));
  const mo=+today.slice(5,7),y=today.slice(0,4),wr=cfg.accs.filter(a=>a.grp=='inv'&&!a.archived);
  if(mo==12)for(const a of wr.filter(a=>wrapOf(a)=='ikze')){const left=limitOf(a,y,hraw?.limits)-paidInYear(tx,a.id,y);if(left>0)add('🛡️',`${a.name}: do 31.12 możesz wpłacić jeszcze ${zl(left)} (ulga w PIT).`,{a:'tr',to:a.id},'Wpłać','',person(ownerOf(a)))}
  const lp=limitPropP(market,hraw);if(lp)add('🛡️',`Automat znalazł limity IKE i IKZE na ${lp.year} – potwierdź w Oszczędnościach.`,{a:'sav'},'Zobacz');
  if(mo==1&&wr.some(a=>['ike','ikze'].includes(wrapOf(a))))add('🛡️',`Nowy rok – sprawdź limity IKE i IKZE na ${y}.`,{a:'limits'},'Limity');
  if(tx.length){const days=backup?Math.floor((new Date(today+'T12:00:00')-backup.at)/864e5):null;if(!backup||days>=30)add('💾',backup?`Ostatnia kopia danych: ${days} dni temu.`:'Nie zrobiliście jeszcze kopii danych.',{a:'backup'},'Kopia')}
  for(const t of tx){if(!t.war||t.type!='exp'||t.war<today)continue;const n=dd(today,t.war);
    if(n<=30)add('🛡️',`Gwarancja kończy się ${n?'za '+n+' '+plu(n,'dzień','dni','dni'):'dziś'}: ${t.note||subsMap(cfg)[t.sub]?.name||'zakup'} (${dmy(t.war)}). Coś nie działa? To ostatni moment na reklamację.`,{a:'tx',id:t.id},'Zobacz','',person(t.who))}
  if(mo==1)for(const w of ['Mati','Wercia']){const p=pitSummaryP(cfg,tx,String(+y-1),w,hraw);if(p.n||p.ikze.length)add('🧾',`${w}: zestawienie ulg do PIT za ${+y-1} jest gotowe.`,{a:'pit',y:String(+y-1)},'Pokaż','',w)}
  if(checks){for(const r of recurringP(cfg,tx,today,hraw?.checkIgnore))out.push({key:r.key,icon:'📌',text:`„${r.name}” – ${money(r.amount,cm[r.acc])} co miesiąc od 3 miesięcy. Dodać do opłat stałych?`,go:{a:'recFix',key:r.key},label:'Dodaj',k:'rec',who:null});
    out.push(...checksP(D,today))}
  return out}
