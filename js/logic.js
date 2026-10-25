import {addDays,daysIn,isDate,p2,zl} from './util.js';
export const cleanCat=n=>String(n||'').replace(/^\s*\d+\s*[.)]\s*/,'').trim();
export const subsMap=cfg=>{const m={};cfg.cats.forEach(c=>c.subs.forEach(s=>m[s.id]={...s,cat:c}));return m};
/* ⚡ speed with many years of entries: results that depend only on the list of entries are remembered for that list
   (the app gets a new list on every change from Firestore, so a remembered result is never stale; nothing changes entries in place) */
const LIVE=new WeakMap(),BYM=new WeakMap(),BAL=new WeakMap();
export const liveOf=tx=>{let r=LIVE.get(tx);if(!r){r=tx.filter(t=>!t.deleted&&isDate(t.date));LIVE.set(tx,r)}return r};
/* entries of a month ('YYYY-MM') or a year ('YYYY') without scanning everything */
export function inPeriod(tx,prefix){if(prefix.length!=7&&prefix.length!=4)return tx.filter(t=>t.date&&t.date.startsWith(prefix));
  let m=BYM.get(tx);if(!m){m=new Map();for(const t of tx){const k=(t.date||'').slice(0,7);let a=m.get(k);if(!a)m.set(k,a=[]);a.push(t)}BYM.set(tx,m)}
  if(prefix.length==7)return m.get(prefix)||[];const out=[];for(let i=1;i<=12;i++){const a=m.get(prefix+'-'+String(i).padStart(2,'0'));if(a)for(const t of a)out.push(t)}return out}
/* currency of every account (PLN when not set) */
export const curMap=cfg=>{const m={};cfg.accs.forEach(a=>m[a.id]=a.cur||'PLN');return m};
export function balance(cfg,tx,id,before){const open=cfg.accs.find(a=>a.id===id)?.open||0;
  /* per account: its changes sorted by date with running sums – the balance before a date is one binary search */
  let ix=BAL.get(tx);if(!ix){const per=new Map(),put=(a,d,v)=>{let L=per.get(a);if(!L)per.set(a,L=[]);L.push([d,v])};
    for(const t of tx){const d=t.date??'';if(t.acc!=null)put(t.acc,d,t.type=='inc'||t.type=='adj'||t.type=='invs'?t.amount:-t.amount);if(t.type=='tr'&&t.to!=null)put(t.to,d,t.amount2??t.amount)}
    ix=new Map();for(const[a,L]of per){L.sort((x,y)=>x[0]<y[0]?-1:x[0]>y[0]?1:0);const ds=L.map(x=>x[0]),cum=[0];for(const x of L)cum.push(cum[cum.length-1]+x[1]);ix.set(a,{ds,cum})}BAL.set(tx,ix)}
  const e=ix.get(id);if(!e)return open;let lo=0,hi=e.ds.length;while(lo<hi){const mid=(lo+hi)>>1;if(e.ds[mid]<before)lo=mid+1;else hi=mid}
  return open+e.cum[lo]}
/* whose an account is: Mati / Wercia / Wspólne (older accounts without owner – by the name) */
export const ownerOf=a=>a?.owner||(/wercia|weronika/i.test(a?.name||'')?'Wercia':/mati/i.test(a?.name||'')?'Mati':'Wspólne');
/* 🐷 savings and investment accounts in złoty (also archived ones – money moved out of them still counts), of one owner or all */
export const savIds=(cfg,owner)=>cfg.accs.filter(a=>(a.grp=='sav'||a.grp=='inv')&&(!a.cur||a.cur=='PLN')&&(!owner||ownerOf(a)==owner)).map(a=>a.id);
/* 🐷 what was really put aside in a month ('YYYY-MM') or a year ('YYYY'): money moved into these accounts minus money taken out
   (transfers, PPK, income booked on them, spending from them); a transfer between two of them cancels out.
   Value changes of investments (adj val – prices, valuations, the automat) are NOT put aside – they come back apart as gain. */
export function savFlow(cfg,tx,ids,prefix){const S=new Set(ids);let flow=0,gain=0;
  for(const t of inPeriod(tx,prefix)){if(!t.date.startsWith(prefix))continue;let v=0;
    if(S.has(t.acc))v+=t.type=='inc'||t.type=='adj'||t.type=='invs'?t.amount:-t.amount;if(t.type=='tr'&&S.has(t.to))v+=t.amount2??t.amount;
    if(t.type=='adj'&&t.val)gain+=v;else flow+=v}
  return{flow,gain}}
/* budget sums count złoty only – other currencies are summed apart (agg().fx) */
/* projects outside the everyday budget (one-off trips, renovations) are not counted in plans and analyses */
export const outProj=cfg=>new Set((cfg.projs||[]).filter(p=>p.inBudget===false).map(p=>p.id));
export function actuals(cfg,tx,ym){const sm=subsMap(cfg),act={},cm=curMap(cfg),op=outProj(cfg);
  inPeriod(tx,ym).forEach(t=>{if(!t.date.startsWith(ym)||(cm[t.acc]||'PLN')!='PLN'||(t.proj&&op.has(t.proj)))return;const s=sm[t.sub];if(!s||(t.type!='exp'&&t.type!='inc'))return;
    act[t.sub]=(act[t.sub]||0)+(t.type==s.cat.type?t.amount:-t.amount)});return act}
/* budget state of a position or category; an empty plan counts as 0 zł, so any spending without a plan is "poza planem"
   k: zero (nothing planned, nothing spent) · ok · near (≥85%) · full (exactly the plan) · over · low (income still missing) */
export function status(type,plan,act){
  if(!plan&&!act)return{k:'zero',txt:'0 zł',pct:null,msg:''};
  if(type=='inc'){
    if(!plan)return{k:'ok',txt:'✓ spoza planu',pct:100,msg:`wpłynęło spoza planu: ${zl(act)}`};
    const pct=act/plan*100,r=Math.round(pct);
    return act>=plan?{k:'ok',txt:'✓ '+r+'%',pct,msg:act>plan?`✓ wpłynęło ${zl(act-plan)} więcej`:'✓ wpłynęło wszystko'}:{k:'low',txt:r+'%',pct,msg:`brakuje ${zl(plan-act)}`}}
  if(!plan)return{k:'over',txt:'▲ poza planem',pct:100,msg:`poza planem: ${zl(act)}`};
  const pct=act/plan*100,r=Math.round(pct);
  if(act>plan)return{k:'over',txt:'▲ '+r+'%',pct,msg:`przekroczono o ${zl(act-plan)}`};
  if(act==plan)return{k:'full',txt:'✓ 100%',pct,msg:'✓ plan wykonany co do grosza'};
  if(pct>=85)return{k:'near',txt:'● '+r+'%',pct,msg:`zostało tylko ${zl(plan-act)}`};
  return{k:'ok',txt:r+'%',pct,msg:`zostało ${zl(plan-act)}`}}
/* 📅 yearly expenses in the plan: the month an item is due (or paid) adds its amount to the plan of its position – computed, never stored,
   so copying a plan to the next month never carries it on. Due: every 12 / 6 / 4 / 3 / 2 / 1 months counted from its month; every 24 months from
   the last payment (before the first one – its month every year). Paid in this month (📅 „Zapłacone”) – the amount paid; paid up to 3 months early – not again. */
const ymN=ym=>+ym.slice(0,4)*12+(+ym.slice(5,7))-1;
export function yearDueIn(it,ym){const e=Math.max(1,+it.every||12),m=+ym.slice(5,7)-1,m0=(+it.month||1)-1;
  if(12%e==0)return((m-m0)%e+e)%e==0;if(it.last){const d=ymN(ym)-ymN(it.last);return d>=0&&d%e==0}return m==m0}
export function yearPlanOf(cfg,tx,ym){const sub={},items=[];
  for(const it of cfg.years||[]){if(!it.sub||!(+it.amount>0))continue;const paid=inPeriod(tx,ym).filter(t=>t.yearId===it.id&&t.type=='exp'&&!t.deleted).reduce((a,t)=>a+t.amount,0);
    let amt=0;if(paid)amt=paid;else if(yearDueIn(it,ym)){const early=[1,2,3].some(k=>{const p=new Date(Date.UTC(+ym.slice(0,4),+ym.slice(5,7)-1-k,1)).toISOString().slice(0,7);return inPeriod(tx,p).some(t=>t.yearId===it.id&&t.type=='exp'&&!t.deleted)});if(!early)amt=+it.amount}
    if(amt){sub[it.sub]=(sub[it.sub]||0)+amt;items.push({it,amt})}}
  return{sub,items}}
/* the plan of a month as used everywhere: what you typed + yearly expenses due that month */
export function planOf(cfg,plans,tx,ym){const p={...((plans||{})[ym]||{})};for(const[k,v]of Object.entries(yearPlanOf(cfg,tx,ym).sub))p[k]=(p[k]||0)+v;return p}
/* positions of yearly expenses – the 3-month average would spread their big payment over every month, so hints skip them */
export const yearSubs=cfg=>new Set((cfg.years||[]).map(it=>it.sub).filter(Boolean));
/* 📌 typed expenses and fixed / yearly payments – so one bill is never booked twice.
   A fixed payment matches an expense of the same position with an amount within 15% (a variable bill – any amount),
   or with its name in the note (amount within 50%). */
const nn=s=>String(s||'').toLowerCase().replace(/\d+/g,' ').replace(/[^\p{L} ]+/gu,' ').replace(/\s+/g,' ').trim();
const near=(a,b,p)=>Math.abs(a-b)<=b*p;
const fixLike=(f,t)=>(f.sub&&f.sub==t.sub&&(f.vary||near(t.amount,+f.amount||0,.15)))||(nn(f.name).length>=3&&nn(t.note).includes(nn(f.name))&&near(t.amount,+f.amount||0,.5));
const fixedPaidIn=(tx,id,ym)=>inPeriod(tx,ym).some(x=>x.fixedId===id&&!x.deleted);
/* a new typed expense (not saved yet) → the unpaid fixed payment of its month it probably is */
export function fixedMatch(cfg,tx,t){if(t.type!='exp'||!isDate(t.date))return null;const ym=t.date.slice(0,7);
  const L=(cfg.fixed||[]).filter(f=>(f.kind||'exp')=='exp'&&!fixedPaidIn(tx,f.id,ym)&&fixLike(f,t));
  return L.sort((a,b)=>Math.abs(t.amount-a.amount)-Math.abs(t.amount-b.amount))[0]||null}
/* ticking a fixed payment → a typed expense of that month that is probably the same bill (not linked to anything yet), the closest amount first */
export function fixedTwin(cfg,tx,f,ym){if((f.kind||'exp')!='exp')return null;
  const L=inPeriod(tx,ym).filter(t=>!t.deleted&&t.type=='exp'&&!t.fixedId&&!t.yearId&&!t.slipOf&&!t.roundOf&&!t.ppk&&!t.payoff&&fixLike(f,t));
  return L.sort((a,b)=>Math.abs(a.amount-f.amount)-Math.abs(b.amount-f.amount))[0]||null}
/* 📅 the due month of a yearly expense closest to ym (±2 months; null when none) – the payment of that date */
export function yearDueNear(it,ym){let best=null;for(const k of [0,-1,1,-2,2]){const m=new Date(Date.UTC(+ym.slice(0,4),+ym.slice(5,7)-1+k,1)).toISOString().slice(0,7);if(yearDueIn(it,m)){best=m;break}}return best}
/* a typed expense → the yearly expense it probably pays: the same position, amount within 25%, due within 2 months and not paid yet */
export function yearMatch(cfg,tx,t){if(t.type!='exp'||!isDate(t.date))return null;const ym=t.date.slice(0,7);
  return(cfg.years||[]).find(it=>it.sub&&it.sub==t.sub&&+it.amount>0&&near(t.amount,+it.amount,.25)&&(()=>{const m=yearDueNear(it,ym);if(!m)return false;
    const from=new Date(Date.UTC(+m.slice(0,4),+m.slice(5,7)-4,1)).toISOString().slice(0,10);return!tx.some(x=>x.yearId===it.id&&!x.deleted&&x.type=='exp'&&x.date>=from)})())||null}
/* positions whose fixed payments cost more than their plan (pl = the plan as used everywhere) */
export function fixedPlanGap(cfg,pl){const by={};for(const f of cfg.fixed||[])if((f.kind||'exp')=='exp'&&f.sub&&+f.amount>0)by[f.sub]=(by[f.sub]||0)+(+f.amount);
  const sm=subsMap(cfg);return Object.entries(by).filter(([id,v])=>sm[id]&&v>(pl[id]||0)).map(([id,v])=>({sub:sm[id],fix:v,plan:pl[id]||0}))}
/* "drobne": a card payment rounded up to the next full 5 / 10 zł, the difference × multiplier is put aside;
   an exact amount (e.g. 15,00) gives a full step only when rule.full is on – this is how Revolut does it */
export function roundUp(amt,r){const st=(+r.step||5)*100,rem=amt%st,base=rem?st-rem:(r.full?st:0);return base*(+r.mult||1)}
export const fixedDate=(f,ym)=>ym+'-'+p2(Math.min(Math.max(1,+f.day||1),daysIn(ym)));
/* unpaid fixed costs that are overdue this month, due today or due tomorrow (tomorrow may already be next month) */
export function dueAlerts(fixed,tx,today){const out=[],tom=addDays(today,1);
  const paid=(f,ym)=>tx.some(t=>t.fixedId===f.id&&t.date.startsWith(ym));
  for(const f of fixed){const ym=today.slice(0,7),due=fixedDate(f,ym);
    if(f.kind=='inc'){if(!paid(f,ym)&&due<today)out.push({f,when:'inc',due});continue}
    if(!paid(f,ym)){if(due<today)out.push({f,when:'late',due});else if(due==today)out.push({f,when:'today',due});else if(due==tom)out.push({f,when:'tomorrow',due})}
    const tym=tom.slice(0,7);if(tym!=ym&&fixedDate(f,tym)==tom&&!paid(f,tym))out.push({f,when:'tomorrow',due:tom})}
  const ord={late:0,today:1,tomorrow:2,inc:3};return out.sort((a,b)=>ord[a.when]-ord[b.when]||a.due.localeCompare(b.due))}
/* bulk reconcile: diffs per account → transfers (too much → too little), leftovers → adjustments; investment accounts → value change */
export function planRecon(diffs){// diffs: [{id,d,inv,cur}] – transfers only between accounts of the same currency
  const ops=[];
  for(const cur of [...new Set(diffs.map(x=>x.cur||'PLN'))]){const D=diffs.filter(x=>(x.cur||'PLN')==cur);
    const pos=D.filter(x=>!x.inv&&x.d>0).map(x=>({...x})).sort((a,b)=>b.d-a.d),neg=D.filter(x=>!x.inv&&x.d<0).map(x=>({...x,d:-x.d})).sort((a,b)=>b.d-a.d);
    let i=0,j=0;while(i<pos.length&&j<neg.length){const a=Math.min(pos[i].d,neg[j].d);ops.push({kind:'tr',from:neg[j].id,to:pos[i].id,amount:a});pos[i].d-=a;neg[j].d-=a;if(!pos[i].d)i++;if(!neg[j].d)j++}
    pos.forEach(x=>{if(x.d)ops.push({kind:'adj',acc:x.id,amount:x.d})});neg.forEach(x=>{if(x.d)ops.push({kind:'adj',acc:x.id,amount:-x.d})})}
  diffs.filter(x=>x.inv&&x.d).forEach(x=>ops.push({kind:'val',acc:x.id,amount:x.d}));
  return ops}
export function agg(cfg,tx,prefix){const sm=subsMap(cfg),cm=curMap(cfg),op=outProj(cfg),r={inc:0,exp:0,cat:{},sub:{},who:{},own:{},acc:{},day:{},fixed:0,big:[],n:0,fx:{inc:{},exp:{},cat:{},sub:{}}};
  /* own: spending by whose account it came from (Mati / Wercia / Wspólne) – „who” is only who typed it */
  const ow={};cfg.accs.forEach(a=>ow[a.id]=ownerOf(a));
  const add=(m,k,c,v)=>{const x=m[k]=m[k]||{};x[c]=(x[c]||0)+v};
  for(const t of inPeriod(tx,prefix)){if(!t.date.startsWith(prefix)||(t.proj&&op.has(t.proj)))continue;const s=sm[t.sub];if(!s||(t.type!='exp'&&t.type!='inc'))continue;
    const a=(t.type==s.cat.type?1:-1)*t.amount,c=cm[t.acc]||'PLN';
    if(c!='PLN'){const F=r.fx;if(s.cat.type=='inc')F.inc[c]=(F.inc[c]||0)+a;else{F.exp[c]=(F.exp[c]||0)+a;add(F.cat,s.cat.id,c,a);add(F.sub,s.id,c,a)}continue}
    if(s.cat.type=='inc'){r.inc+=a;continue}
    r.exp+=a;r.cat[s.cat.id]=(r.cat[s.cat.id]||0)+a;r.sub[s.id]=(r.sub[s.id]||0)+a;
    if(t.type=='exp'){r.n++;const w=t.who||'—',o=ow[t.acc]||'Wspólne';r.who[w]=(r.who[w]||0)+t.amount;r.own[o]=(r.own[o]||0)+t.amount;r.acc[t.acc]=(r.acc[t.acc]||0)+t.amount;
      const d=+t.date.slice(8);r.day[d]=(r.day[d]||0)+t.amount;if(t.fixedId)r.fixed+=t.amount;r.big.push(t)}
    else if(t.refundOf){const w=t.who||'—',o=ow[t.acc]||'Wspólne';r.who[w]=(r.who[w]||0)-t.amount;r.own[o]=(r.own[o]||0)-t.amount;r.acc[t.acc]=(r.acc[t.acc]||0)-t.amount}}
  r.big.sort((a,b)=>b.amount-a.amount);r.big=r.big.slice(0,5);return r}
/* average of each position over the previous n months that have any data (plan hint, "Wypełnij średnimi", anomalies) */
/* the first month with any entry (remembered per list; sorting all dates every time was slow) */
const FIRST=new WeakMap();export const firstYm=tx=>{let f=FIRST.get(tx);if(f==null){let m='9999';for(const t of tx)if(t.date&&t.date<m)m=t.date;f=m.slice(0,7);FIRST.set(tx,f)}return f};
export function avgActuals(cfg,tx,ym,n=3){const first=firstYm(tx),sums={};let k=0;
  for(let i=1;i<=n;i++){const[y,m]=ym.split('-').map(Number),d=new Date(Date.UTC(y,m-1-i,1)).toISOString().slice(0,7);if(d<first)break;k++;
    for(const[id,v]of Object.entries(actuals(cfg,tx,d)))sums[id]=(sums[id]||0)+v}
  const r={};if(k)for(const[id,v]of Object.entries(sums))if(v>0)r[id]=Math.round(v/k);return{avg:r,months:k}}
/* unusually high spending this month: at least 40% and 100 zł above the 3-month average */
export function anomalies(cfg,tx,ym){const{avg,months}=avgActuals(cfg,tx,ym,3);if(months<2)return[];const act=actuals(cfg,tx,ym),sm=subsMap(cfg);
  return Object.entries(act).filter(([id,v])=>sm[id]?.cat.type=='exp'&&avg[id]&&v>=avg[id]*1.4&&v-avg[id]>=10000).map(([id,v])=>({sub:sm[id],v,avg:avg[id],pct:Math.round((v/avg[id]-1)*100)})).sort((a,b)=>(b.v-b.avg)-(a.v-a.avg))}
/* seasonality (after a year of data): a month where a position costs at least 3× its usual month and 300 zł */
export function seasonal(cfg,tx,ym){const first=firstYm(tx),[y,m]=ym.split('-').map(Number),start=new Date(Date.UTC(y-1,m-1,1)).toISOString().slice(0,7);
  if(first>start)return[];const sm=subsMap(cfg),per={};
  for(let i=0;i<12;i++){const d=new Date(Date.UTC(y-1,m-1+i,1)).toISOString().slice(0,7);for(const[id,v]of Object.entries(actuals(cfg,tx,d)))if(v>0&&sm[id]?.cat.type=='exp')(per[id]=per[id]||{})[d]=v}
  const out=[];for(const[id,ms]of Object.entries(per)){const tot=Object.values(ms).reduce((a,v)=>a+v,0);
    for(const[d,v]of Object.entries(ms)){const rest=(tot-v)/11;if(v>=30000&&v>=3*Math.max(rest,1))out.push({sub:sm[id],month:+d.slice(5),v})}}
  return out.sort((a,b)=>b.v-a.v)}
/* 🚗 a vehicle project: kilometres from the odometer, fuel use, price of a litre, cost per km */
export function carStats(cfg,tx,pid,odo0=0){const sm=subsMap(cfg),L=tx.filter(t=>t.proj===pid&&(t.type=='exp'||(t.type=='inc'&&t.refundOf))).sort((a,b)=>a.date.localeCompare(b.date));
  let cost=0;const byCat={};L.forEach(t=>{const v=t.type=='exp'?t.amount:-t.amount;cost+=v;const n=sm[t.sub]?.name||'Inne';byCat[n]=(byCat[n]||0)+v});
  const fills=L.filter(t=>t.type=='exp'&&t.odo>0).sort((a,b)=>a.odo-b.odo),odos=fills.map(t=>t.odo).concat(odo0>0?[odo0]:[]);
  const km=odos.length>1?Math.max(...odos)-Math.min(...odos):0,lit=L.filter(t=>t.lit>0),litSum=lit.reduce((a,t)=>a+t.lit,0),litCost=lit.reduce((a,t)=>a+t.amount,0);
  const after=fills.length>1?fills.slice(1).filter(t=>t.lit>0).reduce((a,t)=>a+t.lit,0):0,span=fills.length>1?fills.at(-1).odo-fills[0].odo:0;
  return{cost,byCat,km,odo:odos.length?Math.max(...odos):odo0,l100:span>0&&after>0?after/span*100:null,litre:litSum>0?litCost/litSum:null,perKm:km>0?cost/km:null,n:L.length}}
