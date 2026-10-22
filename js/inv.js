/* 📈 savings & investments: instruments, treasury bonds, deposits, IKE/IKZE/OKI limits, yearly expenses, FIRE. Amounts in grosze. */
import {addMonths} from './util.js';
export const IKINDS={etf:'ETF / fundusz',akcje:'Akcje',obl:'Obligacje skarbowe',zloto:'Złoto',krypto:'Krypto',lokata:'Lokata'};
export const IICON={etf:'📊',akcje:'📈',obl:'🏛️',zloto:'🥇',krypto:'🪙',lokata:'🏦'};
/* retail treasury bonds: months to maturity, how later periods are indexed, capitalisation; rates are typed from the purchase confirmation */
export const BONDS={
  OTS:{n:'OTS – 3-miesięczne, stałe',m:3,idx:'fix',cap:true,margin:0},
  ROR:{n:'ROR – roczne, zmienne (stopa NBP)',m:12,idx:'nbp',cap:false,margin:0},
  DOR:{n:'DOR – 2-letnie, zmienne (stopa NBP)',m:24,idx:'nbp',cap:false,margin:0.15},
  TOS:{n:'TOS – 3-letnie, stałe',m:36,idx:'fix',cap:true,margin:0},
  COI:{n:'COI – 4-letnie, inflacja + marża',m:48,idx:'infl',cap:false,margin:1.5},
  EDO:{n:'EDO – 10-letnie, inflacja + marża',m:120,idx:'infl',cap:true,margin:2},
  ROS:{n:'ROS – 6-letnie rodzinne, inflacja + marża',m:72,idx:'infl',cap:true,margin:2},
  ROD:{n:'ROD – 12-letnie rodzinne, inflacja + marża',m:144,idx:'infl',cap:true,margin:2.5}};
/* limits of yearly payments (MRPiPS notices); OKI has no payment limit – 100 000 zł of assets is the tax-free threshold (0,85% above it in 2027) */
export const LIMITS={2026:{ike:2826000,ikze:1130400,ikzeB:1695600},2025:{ike:2601900,ikze:1040760,ikzeB:1561140}};
export const OKI_FREE=10000000,OKI_RATE=0.85,BELKA=19;
export const wrapOf=a=>a.wrap??(/\bIKZE\b/i.test(a.name)?'ikze':/\bIKE\b/i.test(a.name)?'ike':/\bOKI\b/i.test(a.name)?'oki':/\bPPK\b/i.test(a.name)?'ppk':'');
export const taxFree=a=>['ike','ikze','oki','ppk'].includes(wrapOf(a));
const dd=(a,b)=>(new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/864e5;
const monthsBetween=(a,b)=>{const[y1,m1,d1]=a.split('-').map(Number),[y2,m2,d2]=b.split('-').map(Number);return(y2-y1)*12+(m2-m1)-(d2<d1?1:0)};
export const addM=(date,m)=>{const[y,mo,d]=date.split('-').map(Number),t=new Date(Date.UTC(y,mo-1+m,1)),last=new Date(Date.UTC(t.getUTCFullYear(),t.getUTCMonth()+1,0)).getUTCDate();return t.toISOString().slice(0,8)+String(Math.min(d,last)).padStart(2,'0')};
/* lots: {date,qty,price,fx,fee,kind:'buy'|'sell'}; average cost; qty may be fractional */
export function position(it,before='9999-99-99'){let qty=0,cost=0,costPx=0,costFx=0,real=0;
  for(const l of Object.values(it.lots||{}).filter(l=>!l.deleted&&l.date<before).sort((a,b)=>a.date.localeCompare(b.date))){
    const q=+l.qty||0,px=+l.price||0,fx=+l.fx||1;
    if(l.kind=='sell'){if(qty<=0)continue;const k=Math.min(q,qty)/qty;real+=Math.round(Math.min(q,qty)*px*fx*100)-(l.fee||0)-cost*k;cost-=cost*k;costPx-=costPx*k;costFx-=costFx*k;qty-=Math.min(q,qty);continue}
    qty+=q;cost+=Math.round(q*px*fx*100)+(l.fee||0);costPx+=q*px;costFx+=q*px*fx}
  return{qty,cost:Math.round(cost),avgPx:qty?costPx/qty:0,avgFx:costPx?costFx/costPx:1,real:Math.round(real)}}
/* yearly rates of one bond lot: first year typed, later years inflation (or NBP rate) + margin */
export function bondRates(b,macro={}){const T=BONDS[b.type]||BONDS.EDO,n=Math.max(1,Math.ceil((b.m||T.m)/12));
  const later=T.idx=='infl'?Math.max(0,+(macro.infl??0))+(+(b.margin??T.margin)):T.idx=='nbp'?(+(macro.nbp??0))+(+(b.margin??T.margin)):+(b.first||0);
  return Array.from({length:n},(_,i)=>i==0?+(b.first||0):(b.rates&&b.rates[i]!=null?+b.rates[i]:later))}
export function bondLotValue(b,l,today,macro){const T=BONDS[b.type]||BONDS.EDO,months=b.m||T.m,N=Math.round((+l.qty||0)*(+l.price||100)*100),end=addM(l.date,months),at=today<end?today:end;
  if(months<12){const r=(+(b.first||0))/100,f=Math.max(0,dd(l.date,at))/dd(l.date,end);return{value:Math.round(N*(1+r*months/12*f)),paid:0,end,cost:N}}
  const rates=bondRates(b,macro).map(r=>r/100),full=Math.min(rates.length,Math.floor(monthsBetween(l.date,at)/12));
  const ys=addM(l.date,full*12),ye=addM(l.date,(full+1)*12),frac=full>=rates.length?0:Math.max(0,dd(ys,at))/dd(ys,ye);
  let v=N,paid=0;for(let i=0;i<full;i++){if(T.cap)v=v*(1+rates[i]);else paid+=N*rates[i]}
  const cur=full<rates.length?rates[full]:0;
  return{value:Math.round(v*(1+cur*frac)),paid:Math.round(paid),end,cost:N}}
/* the automat's quote for an instrument (only when newer than a price typed by hand); fx from NBP mid rates */
export function marketQuote(it,acc,m){if(!m)return null;const ac=acc.cur||'PLN',ic=it.cur||ac,fx=c=>c=='PLN'?1:m.fx?.[c],newer=d=>d&&(!it.priceDate||d>=it.priceDate);
  let p=null,d=null;const q=it.ticker&&m.prices?.[String(it.ticker).trim().toUpperCase()];
  if(q&&(!q.cur||q.cur==ic)){p=q.p;d=q.d}else if(it.kind=='zloto'&&!it.ticker&&m.gold&&ic=='PLN'){p=m.gold;d=m.goldDate||m.date}
  const f=ic==ac?1:(fx(ic)&&fx(ac)?fx(ic)/fx(ac):null);
  return{p:newer(d)?p:null,fx:newer(m.fxDate||m.date)&&ic!=ac?f:null,d}}
/* value of an instrument in the account currency, gains and the amount after the 19% tax */
export function instValue(it,acc,today,macro={},mkt=null){
  if(it.kind=='obl'||it.kind=='lokata'){let value=0,cost=0,paid=0,next=null;
    for(const l of Object.values(it.lots||{}).filter(l=>!l.deleted&&l.kind!='sell')){
      let r;if(it.kind=='obl')r=bondLotValue(it.bond||{},l,today,macro);
      else{const N=Math.round((+l.qty||1)*(+l.price||0)*100),end=addM(l.date,+(it.dep?.months||12)),at=today<end?today:end;r={value:Math.round(N*(1+(+(it.dep?.rate||0))/100*Math.max(0,dd(l.date,at))/365)),paid:0,end,cost:N}}
      value+=r.value;cost+=r.cost;paid+=r.paid;if(r.end>=today&&(!next||r.end<next))next=r.end}
    const gain=value-cost+paid,tax=taxFree(acc)?0:Math.round(Math.max(0,value-cost)*BELKA/100);
    return{value,cost,gain,gPx:gain,gFx:0,net:value-tax,tax,paid,next,qty:null,real:0}}
  const p=position(it),mq=marketQuote(it,acc,mkt),px=+(mq?.p??it.price??p.avgPx),fx=it.cur&&it.cur!=(acc.cur||'PLN')?+(mq?.fx||it.fxNow||p.avgFx||1):1;
  const value=Math.round(p.qty*px*fx*100)/100,costNoFee=Math.round(p.qty*p.avgPx*p.avgFx*100)/100;
  const gPx=Math.round(p.qty*(px-p.avgPx)*fx*100)/100,gFx=Math.round(p.qty*p.avgPx*(fx-p.avgFx)*100)/100;
  const v=Math.round(value*100),c=Math.round(p.cost),gain=v-c,tax=taxFree(acc)?0:Math.round(Math.max(0,gain)*BELKA/100);
  return{value:v,cost:c,gain,gPx:Math.round(gPx*100),gFx:Math.round(gFx*100),net:v-tax,tax,qty:p.qty,px,fx,costNoFee,real:p.real,auto:!!mq?.p}}
/* payments into a tax wrapper in a year (transfers and incomes in, no value changes, no withdrawals subtracted) */
export function paidInYear(tx,accId,year){let s=0;for(const t of tx){if(!t.date.startsWith(year))continue;
  if(t.type=='tr'&&t.to===accId)s+=t.amount2??t.amount;else if(t.acc===accId&&t.type=='inc'&&!t.ppk)s+=t.amount}return s}
export const limitOf=(a,year,over)=>{const L={...(LIMITS[year]||LIMITS[Math.max(...Object.keys(LIMITS).map(Number))]),...((over||{})[year]||{})},w=wrapOf(a);return w=='ike'?L.ike:w=='ikze'?(a.jdg?L.ikzeB:L.ikze):0};
/* yearly expenses: next due month of an item, how much of it the envelope already holds, what to put aside each month */
export function yearDue(it,ym){const every=Math.max(1,+it.every||12);
  if(it.last)return addMonths(it.last,every)<ym?ym:addMonths(it.last,every);
  let d=ym.slice(0,4)+'-'+String(+it.month||1).padStart(2,'0');while(d<ym)d=addMonths(d,every);return d}
export function yearPlan(items,bal,ym){const L=items.map(it=>({it,due:yearDue(it,ym)})).sort((a,b)=>a.due.localeCompare(b.due));let left=Math.max(0,bal);
  return L.map(x=>{const fill=Math.min(x.it.amount,left);left-=fill;const months=Math.max(1,(+x.due.slice(0,4)-+ym.slice(0,4))*12+(+x.due.slice(5)-+ym.slice(5))+1);
    return{...x,fill,months,need:Math.max(0,Math.ceil((x.it.amount-fill)/months))}})}
/* FIRE: 25 × yearly spending (the 4% rule); months to get there with a monthly saving and a real return */
export function fireMonths(now,target,monthly,real=4){if(now>=target)return 0;const r=Math.pow(1+real/100,1/12)-1;let v=now;
  for(let m=1;m<=1200;m++){v=v*(1+r)+monthly;if(v>=target)return m}return null}
/* paid in vs value of a group of accounts, day by day (end of each day with a change); internal transfers cancel out */
export function flowSeries(cfg,tx,ids){const S=new Set(ids);let paid=0,value=0;cfg.accs.forEach(a=>{if(S.has(a.id)){paid+=a.open||0;value+=a.open||0}});
  const pts=[],L=tx.filter(t=>S.has(t.acc)||(t.type=='tr'&&S.has(t.to))).sort((a,b)=>a.date.localeCompare(b.date));
  for(const t of L){let v=0;if(S.has(t.acc))v+=(t.type=='inc'||t.type=='adj'||t.type=='invs')?t.amount:-t.amount;if(t.type=='tr'&&S.has(t.to))v+=t.amount2??t.amount;
    value+=v;if(t.type!='adj')paid+=v;else if(!t.val)paid+=v;
    if(pts.length&&pts.at(-1).d==t.date){pts.at(-1).paid=paid;pts.at(-1).value=value}else pts.push({d:t.date,paid,value})}
  return pts}
