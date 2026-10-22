/* 🔔 „Na dziś” and the tidiness guard – pure functions shared by the app and the GitHub automat (no DOM, no Firebase).
   D = {cfg, tx (live entries), slips, hold, debts, market, backup, hraw}; every item says whom it concerns (who: 'Mati'|'Wercia'|null = both)
   and where a tap leads (go: {a:'fixed'|'slip'|'pay'|'add'|'year'|'rem'|'lent'|'inst'|'tr'|'sav'|'limits'|'backup'|'automat'|'tx'|'acc', ...}). */
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
    if((t.type=='exp'||(t.type=='inc'&&!t.ppk&&!t.lendOf&&!t.debtIn&&!t.slip))&&!sm[t.sub])add('sub:'+t.id,'🏷️',`${t.type=='exp'?'Wydatek':'Przychód'} ${money(t.amount,cm[t.acc])} z ${dmy(t.date)} nie ma pozycji budżetu`,{a:'tx',id:t.id})}
  for(const a of cfg.accs.filter(a=>a.grp=='cur'&&!a.archived)){const b=balance(cfg,tx,a.id,addDays(today,1));if(b<0)add('neg:'+a.id+':'+today.slice(0,7),'➖',`Ujemne saldo: ${a.name} ${money(b,a.cur)} – coś nie wpisane albo wyrównanie?`,{a:'acc'})}
  const ym=today.slice(0,7),pm=addMonths(ym,-1);
  for(const m of [pm,ym])for(const[id,sl]of Object.entries(slips?.[m]||{})){const src=(cfg.incs||[]).find(s=>s.id==id)||sl;if(src.kind=='b2b')continue;const diff=(sl.net||0)-calcNet(src,sl);
    if(Math.abs(diff)>=1)add('slip:'+m+':'+id+':'+sl.ts,'💼',`Pasek ${sl.name||src.name} (${MN[+m.slice(5)-1].toLowerCase()}) – rachunek nie zgadza się o ${zl(Math.abs(diff))}`,{a:'slip',id,ym:m})}
  return out.slice(0,10)}
/* everything that needs attention today */
export function todayItems(D,{today,hour=12,checks=true}={}){const{cfg,tx,slips,hold,debts,market,backup,hraw}=D;if(!cfg)return[];
  const ym=today.slice(0,7),day=+today.slice(8),out=[],cm={};cfg.accs.forEach(a=>cm[a.id]=a.cur||'PLN');const accOf=id=>cfg.accs.find(a=>a.id==id);
  const add=(icon,text,go,label,k='',who=null)=>out.push({icon,text,go,label,k,who});const incs=cfg.incs||[];
  const st=automatStale(market,today);if(st)add('🤖',`Automat nie pobiera danych od ${st} dni. Sprawdź go na GitHubie.`,{a:'automat'},'Otwórz','bad');
  for(const x of dueAlerts(cfg.fixed||[],tx,today))add(x.when=='inc'?'📥':x.when=='late'?'⏰':'💳',x.when=='inc'?`${x.f.name} – jeszcze nie odhaczony`:`${x.f.name} · ${money(x.f.amount,cm[x.f.acc])} – ${x.when=='late'?'po terminie':x.when=='today'?'termin dziś':'termin jutro'}`,{a:'fixed'},'Odhacz',x.when=='late'?'bad':'',person(ownerOf(accOf(x.f.acc))));
  const live=new Set(tx.map(t=>t.id));
  for(const s of incs)if(day>=(s.day||10)){const sl=(slips?.[ym]||{})[s.id];if(!sl||!sl.booked||!live.has(sl.booked))add('💼',`Pasek: ${s.name}${s.who?' ('+s.who+')':''} – wypłata zwykle do ${s.day||10}.`,{a:'slip',id:s.id,ym},'Wpisz','',person(s.who))}
  if(day>=14&&day<=20)for(const s of incs.filter(s=>s.kind=='b2b'))add('🧾',`JDG (${s.name}): do 20. zapłać ZUS, zdrowotną i podatek.`,{a:'pay'},'Pensje','',person(s.who));
  if(hour>=20&&!tx.some(t=>t.date==today&&!t.fixedId&&!t.ppk&&!t.roundOf&&!(t.type=='adj'&&t.val)))add('✍️','Po 20:00 – dziś nic jeszcze nie wpisano. Były jakieś wydatki?',{a:'add'},'Wpisz');
  const ys=yearStateP(cfg,tx,hraw,ym,today);if(ys){if(ys.left)add('📅',`Wydatki roczne: w tym miesiącu odłóż jeszcze ${zl(ys.left)}.`,{a:'year'},'Odłóż');
    ys.soon.forEach(x=>add('⏰',`Wkrótce: ${x.it.name} (${zl(x.it.amount)}) – ${MN[+x.due.slice(5)-1].toLowerCase()}, w kopercie ${zl(x.fill)}.`,{a:'year'},'Zobacz'))}
  for(const r of cfg.rems||[]){const s=remStateP(r,cfg,tx,today);if(s.due||s.late)add('🔔',`${r.name}${r.next?' – '+dmy(r.next):''}${s.kmLeft!=null?` · zostało ${s.kmLeft.toLocaleString('pl-PL')} km`:''}`,{a:'rem'},'Zobacz',s.late?'bad':'')}
  for(const[id,x]of Object.entries(debts||{})){if(x.deleted||x.dir!='lent'||!x.until)continue;const d={id,...x},s=debtStateP(d,tx,today);if(!s.left)continue;const n=dd(today,d.until);
    if(n<=7)add('🔺',`${d.party||d.name} – zwrot ${zl(s.left)} ${n<0?'po terminie ('+dmy(d.until)+')':n==0?'dziś':'za '+n+' '+plu(n,'dzień','dni','dni')}`,{a:'lent'},'Zobacz',n<0?'bad':'',person(d.payer))}
  for(const m of maturitiesP(cfg,hold,today,30))add(IICON[m.it.kind],`${m.it.kind=='obl'?'Wykup':'Koniec lokaty'}: ${m.it.name} – ${dmy(m.end)}`,{a:'inst',acc:m.a.id},'Zobacz','',person(ownerOf(m.a)));
  const mo=+today.slice(5,7),y=today.slice(0,4),wr=cfg.accs.filter(a=>a.grp=='inv'&&!a.archived);
  if(mo==12)for(const a of wr.filter(a=>wrapOf(a)=='ikze')){const left=limitOf(a,y,hraw?.limits)-paidInYear(tx,a.id,y);if(left>0)add('🛡️',`${a.name}: do 31.12 możesz wpłacić jeszcze ${zl(left)} (ulga w PIT).`,{a:'tr',to:a.id},'Wpłać','',person(ownerOf(a)))}
  const lp=limitPropP(market,hraw);if(lp)add('🛡️',`Automat znalazł limity IKE i IKZE na ${lp.year} – potwierdź w Oszczędnościach.`,{a:'sav'},'Zobacz');
  if(mo==1&&wr.some(a=>['ike','ikze'].includes(wrapOf(a))))add('🛡️',`Nowy rok – sprawdź limity IKE i IKZE na ${y}.`,{a:'limits'},'Limity');
  if(tx.length){const days=backup?Math.floor((new Date(today+'T12:00:00')-backup.at)/864e5):null;if(!backup||days>=30)add('💾',backup?`Ostatnia kopia danych: ${days} dni temu.`:'Nie zrobiliście jeszcze kopii danych.',{a:'backup'},'Kopia')}
  if(checks)out.push(...checksP(D,today));
  return out}
