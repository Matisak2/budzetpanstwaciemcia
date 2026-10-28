/* 📈 savings & investments: instruments, treasury bonds, deposits, IKE/IKZE/OKI limits, yearly expenses, FIRE. Amounts in grosze. */
import {addDays,addMonths,zl0} from './util.js';
export const IKINDS={etf:'ETF',tfi:'Fundusz TFI / PPK',akcje:'Akcje',obl:'Obligacje skarbowe',zloto:'Złoto',krypto:'Krypto',lokata:'Lokata'};
export const IICON={etf:'📊',tfi:'🧺',akcje:'📈',obl:'🏛️',zloto:'🥇',krypto:'🪙',lokata:'🏦'};
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
/* inflation and the NBP rate for bonds: the automat's reading unless one typed later; inflH = GUS history {YYYY-MM: % y/y} */
export const macroP=(hraw,rates)=>{const m=hraw?.macro||{},r=rates||{},pick=(k,at)=>r[k]!=null&&!(m[k]!=null&&(m[at]||'')>=(r.date||''))?r[k]:m[k];
  return{infl:pick('infl','inflAt'),nbp:pick('nbp','nbpAt'),inflH:r.inflH||{},inflPer:r.inflPer||null}};
/* every interest year of a bond lot: the 1st from the purchase confirmation, later ones margin + inflation y/y of the month 2 months before
   the year starts (GUS history; until it is published – the latest reading as an estimate) or the NBP rate; a typed correction wins */
export function bondYears(b,macro={},start){const T=BONDS[b.type]||BONDS.EDO,n=Math.max(1,Math.ceil((b.m||T.m)/12)),mg=+(b.margin??T.margin),H=macro.inflH||{};
  return Array.from({length:n},(_,i)=>{const from=start?addM(start,12*i):null;
    if(i==0)return{r:+(b.first||0),src:'first',from};
    if(b.rates&&b.rates[i]!=null&&b.rates[i]!=='')return{r:+b.rates[i],src:'manual',from};
    if(T.idx=='infl'){const ref=from?addMonths(from.slice(0,7),-2):null,known=ref&&H[ref]!=null,v=known?+H[ref]:+(macro.infl??0);
      return{r:Math.round((Math.max(0,v)+mg)*100)/100,src:known?'gus':'est',from,ref,infl:v,mg}}
    if(T.idx=='nbp')return{r:(+(macro.nbp??0))+mg,src:'nbp',from,mg};
    return{r:+(b.first||0),src:'first',from}})}
export const bondRates=(b,macro={},start)=>bondYears(b,macro,start).map(x=>x.r);
export function bondLotValue(b,l,today,macro){const T=BONDS[b.type]||BONDS.EDO,months=b.m||T.m,N=Math.round((+l.qty||0)*(+l.price||100)*100),end=addM(l.date,months),at=today<end?today:end;
  if(months<12){const r=(+(b.first||0))/100,f=Math.max(0,dd(l.date,at))/dd(l.date,end);return{value:Math.round(N*(1+r*months/12*f)),paid:0,end,cost:N}}
  const rates=bondRates(b,macro,l.date).map(r=>r/100),full=Math.min(rates.length,Math.floor(monthsBetween(l.date,at)/12));
  const ys=addM(l.date,full*12),ye=addM(l.date,(full+1)*12),frac=full>=rates.length?0:Math.max(0,dd(ys,at))/dd(ys,ye);
  let v=N,paid=0;for(let i=0;i<full;i++){if(T.cap)v=v*(1+rates[i]);else paid+=N*rates[i]}
  const cur=full<rates.length?rates[full]:0;
  return{value:Math.round(v*(1+cur*frac)),paid:Math.round(paid),end,cost:N}}
/* the automat's quote for an instrument (only when newer than a price typed by hand); fx from NBP mid rates */
export function marketQuote(it,acc,m){if(!m)return null;const ac=acc.cur||'PLN',ic=it.cur||ac,fx=c=>c=='PLN'?1:m.fx?.[c],newer=d=>d&&(!it.priceDate||d>=it.priceDate);
  let p=null,d=null;const q=it.ticker&&m.prices?.[String(it.ticker).trim().toUpperCase()];
  const fq=it.kind=='tfi'&&it.fund?.id&&m.funds?.[it.fund.id];
  if(fq&&(!fq.cur||fq.cur==ic)){p=fq.p;d=fq.d}else if(q&&(!q.cur||q.cur==ic)){p=q.p;d=q.d}else if(it.kind=='zloto'&&!it.ticker&&m.gold&&ic=='PLN'){p=m.gold;d=m.goldDate||m.date}
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
/* value adjustment that makes an account balance show its instruments at today's value (instrument gains minus value changes already booked) */
export function instDiffP(acc,items,tx,today,macro,mkt){if(!items.length)return null;let unreal=0,val=0;
  items.forEach(it=>{const v=instValue(it,acc,today,macro,mkt);unreal+=v.value-v.cost+(v.real||0)});
  for(const t of tx)if(t.acc===acc.id&&t.type=='adj'&&t.val)val+=t.amount;return unreal-val}
/* an instrument as it was at the end of a day (later purchases and sales left out) */
export const holdAt=(it,date)=>({...it,lots:Object.fromEntries(Object.entries(it.lots||{}).filter(([,l])=>l.date<=date))});
/* a readable fund name from its address: "ppk-inpzu-2040" -> "PPK inPZU 2040"; the institution = the name without the year */
export function fundName(slug){const KEEP={ppk:'PPK',inpzu:'inPZU',pzu:'PZU',pko:'PKO',nn:'NN',pfr:'PFR',bnp:'BNP',dfe:'DFE',sfio:'SFIO',fio:'FIO',tfi:'TFI',ufk:'UFK',ing:'ING',axa:'AXA'};
  return String(slug||'').split('-').filter(Boolean).map(w=>KEEP[w]||(w[0].toUpperCase()+w.slice(1))).join(' ')}
export const fundHouse=slug=>fundName(String(slug||'').replace(/-\d{4}(-.*)?$/,''));
/* analizy.pl address of a fund -> {id, path} (the automat reads the unit value from that page) */
export function fundFromUrl(s){const m=String(s||'').match(/(fundusze-[a-z-]+)\/([A-Z]{2,6}\d+)\/([a-z0-9-]+)/i);return m?{id:m[2].toUpperCase(),path:`${m[1].toLowerCase()}/${m[2].toUpperCase()}/${m[3].toLowerCase()}`}:null}
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
/* 💰 interest on a savings account / subaccount / current account: a.int = {rates:{'YYYY-MM-DD':% a year (from that day)}, promo?:%, promoTo?:'YYYY-MM-DD',
   promoMax?:grosze (the promo rate only up to this amount, the rest at the normal rate; 0 = no limit), cap:'m'|'q'|'y' (when the bank adds it), tax:'bank'|'self'|'none'}.
   Counted day by day from the balance at the end of each day (like banks: balance × rate ÷ 365); the bank's own rounding may differ by a few grosze.
   Booked as adj val:true,int:true (intP = the last month of the period) – a gain, not money put aside (savFlow). */
export const INT_TAX={bank:'Pobiera bank (19%)',self:'Rozliczam sam – PIT-38 (bank zagraniczny)',none:'Bez podatku (IKE, IKZE, OKI)'};
export const INT_CAP={m:'co miesiąc',q:'co kwartał',y:'raz w roku'};
export const intOf=a=>{const I=a?.int;return I&&(Object.values(I.rates||{}).some(v=>+v>0)||+I.promo>0)?I:null};
export const intTax=a=>a.int?.tax||(taxFree(a)?'none':'bank');
/* the normal rate on a day (the latest change on or before it) */
export function intRate(I,day){let k='',r=0;for(const[d,v]of Object.entries(I.rates||{}))if(d<=day&&d>=k){k=d;r=+v||0}return r}
export const intPromo=(I,day)=>+I.promo>0&&(!I.promoTo||day<=I.promoTo);
/* the period a month belongs to: {from,to,key} – key = its last month */
export function intPeriod(I,ym){const y=+ym.slice(0,4),m=+ym.slice(5,7),n=I.cap=='q'?3:I.cap=='y'?12:1,end=Math.ceil(m/n)*n,start=end-n+1,p=x=>String(x).padStart(2,'0');
  const key=y+'-'+p(end),last=new Date(Date.UTC(y,end,0)).getUTCDate();return{from:y+'-'+p(start)+'-01',to:key+'-'+p(last),key}}
/* interest from the day `from` to the day `to` (both included): gross, tax 19% (bank), what lands on the account (book: the bank's net, or gross when settled alone) */
export function intCalc(cfg,tx,a,from,to,bal){const I=intOf(a);if(!I||to<from)return{gross:0,tax:0,net:0,book:0};let g=0;
  for(let d=from;d<=to;d=addDays(d,1)){const b=bal(cfg,tx,a.id,addDays(d,1));if(b<=0)continue;const base=intRate(I,d);
    if(intPromo(I,d)){const pa=+I.promoMax>0?Math.min(b,+I.promoMax):b;g+=pa*(+I.promo)+(b-pa)*base}else g+=b*base}
  const gross=Math.round(g/100/365),mode=intTax(a),tax=mode=='none'?0:Math.round(gross*BELKA/100);
  return{gross,tax,net:gross-(mode=='bank'?tax:0),book:mode=='bank'?gross-tax:gross}}
/* about how much a month now (from today's balance and today's rate, after the bank's tax) */
export function intMonthly(a,b,day){const I=intOf(a);if(!I||b<=0)return 0;const base=intRate(I,day),pa=intPromo(I,day)?(+I.promoMax>0?Math.min(b,+I.promoMax):b):0;
  const gross=(pa*(+I.promo||0)+(b-pa)*base)/100/12;return Math.round(intTax(a)=='bank'?gross*(1-BELKA/100):gross)}
/* the rate shown next to an account: „3,5%” or „🎁 7% do 31.01 (potem 3,5%)” */
export function intLabel(I,day){const base=intRate(I,day),f=v=>String(+(+v).toFixed(2)).replace('.',',')+'%';
  return intPromo(I,day)?`🎁 ${f(I.promo)}${I.promoTo?' do '+I.promoTo.slice(8)+'.'+I.promoTo.slice(5,7):''}${+I.promoMax>0?' (limit '+zl0(I.promoMax)+')':''}${base?', potem '+f(base):''}`:f(base)}
