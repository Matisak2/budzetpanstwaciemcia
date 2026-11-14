/* 💼 salaries: payslip math, amounts in grosze. The estimate ("Podpowiedz z brutto") is only a hint – the payslip always wins. */
export const KINDS={uop:'Umowa o pracę',zlec:'Umowa zlecenie',dzielo:'Umowa o dzieło',b2b:'Kontrakt / JDG'};
export const TAXF={skala:'Skala podatkowa (12% / 32%)',liniowy:'Podatek liniowy (19%)',ryczalt:'Ryczałt'};
/* 2026: limit of the pension + disability contributions (30 × forecast average salary) and the 32% tax threshold */
export const ZUS_LIMIT=28260000,TAX_THR=12000000;
/* the year these rules are for – in January of a later year „Na dziś” asks Mati to have them updated (then change RULES_YEAR and tests/calc.mjs) */
export const RULES_YEAR=2026;
const r0=x=>Math.round(x/100)*100; // tax advances are rounded to full złoty
const pct=(x,p)=>Math.round(x*p/100);
export const brutto=sl=>(sl.comp||[]).reduce((a,c)=>a+(c.a||0),0);
export const dedSum=sl=>(sl.ded||[]).reduce((a,d)=>a+(d.a||0),0);
export const hoursOf=sl=>(sl.comp||[]).reduce((a,c)=>a+(+c.h||0),0);
/* what should come to the account: employee contracts – brutto minus contributions, tax, own PPK and deductions; JDG – the invoice */
export const calcNet=(src,sl)=>src.kind=='b2b'?brutto(sl):brutto(sl)-(sl.zus||0)-(sl.health||0)-(sl.tax||0)-(sl.ppkOwn||0)-dedSum(sl);
/* JDG: what to put aside for ZUS, health and tax, and what is really left */
export const reserve=sl=>(sl.zus||0)+(sl.health||0)+(sl.tax||0);
export const onHand=sl=>brutto(sl)-reserve(sl)-(sl.costs||0);
/* sums of the earlier payslips of this source in the same year (for the ZUS limit and the 32% threshold) */
export function ytdOf(slips,srcId,ym){const y=ym.slice(0,4),r={brutto:0,base:0,hded:0,ym};
  for(const[m,d]of Object.entries(slips||{}))if(m.startsWith(y)&&m<ym&&d[srcId]){const s=d[srcId];r.brutto+=brutto(s);r.base+=s.base||0;r.hded+=s.hded||0}
  return r}
/* 💼 JDG 2026 (ZUS, MF): ZUS społeczny from the minimum base – preferential 30% of the minimum wage (4 806 zł), full 60% of the forecast average salary (9 420 zł);
   emerytalne 19,52%, rentowe 8%, wypadkowe 1,67%, chorobowe 2,45% (voluntary), Fundusz Pracy 2,45% (full ZUS only).
   Health (zdrowotna): skala 9% / liniowy 4,9% of the income, at least 9% of the minimum wage – from February (January: the minimum of the year before, 314,96 zł);
   liniowy may deduct the health contribution only up to a yearly limit; ryczałt – a fixed amount by the revenue of the year so far (≤ 60 000 / ≤ 300 000 / more).
   A new year: add its line (and the robot's examples in tests/calc.mjs). */
export const JDG={2026:{pref:144180,full:565200,hmin:43254,hminJan:31496,rycz:[49835,83058,149504],linLimit:1410000}};
export const jdgT=ym=>{const y=+(ym||'').slice(0,4),ks=Object.keys(JDG).map(Number);return JDG[y]||JDG[y>Math.max(...ks)||!y?Math.max(...ks):Math.min(...ks)]};
export const ZUS_VARS={start:'Ulga na start (6 mies.) – 0 zł',pref:'Preferencyjny (24 mies.)',full:'Pełny ZUS',own:'Inna kwota – wpiszę ją'};
/* ZUS społeczny of a month: soc = deductible contributions, fp = Fundusz Pracy (a cost of the business, not for ryczałt); no variant (older sources) = the typed amount */
export function jdgZus(src,ym){const v=src.zusVar||'own';if(v=='own')return{soc:src.zusAmt||0,fp:0};if(v=='start')return{soc:0,fp:0};
  const T=jdgT(ym),b=v=='pref'?T.pref:T.full;return{soc:pct(b,19.52)+pct(b,8)+pct(b,1.67)+(src.zusChor?pct(b,2.45):0),fp:v=='full'?pct(b,2.45):0}}
const hMin=ym=>{const T=jdgT(ym);return ym&&ym.slice(5,7)=='01'?T.hminJan:T.hmin};
function progressive(base,ytdBase,reduce){const low=Math.max(0,Math.min(base,TAX_THR-ytdBase));return Math.max(0,r0(pct(low,12)+pct(base-low,32)-reduce))}
/* estimate of contributions and tax from brutto (Polish rules 2026, simplified) */
/* 🎓 ulga dla młodych (PIT-0): umowa o pracę i zlecenie – bez podatku od przychodu (z wpłatą PPK pracodawcy) otrzymanego do dnia 26. urodzin włącznie,
   do 85 528 zł w roku razem ze wszystkich umów tej osoby. ZUS i zdrowotna bez zmian. Przy przekroczeniu limitu podatek od nadwyżki:
   ZUS odliczany w części przypadającej na opodatkowany przychód, koszty najwyżej do tej części. */
export const YOUNG_LIMIT=8552800;
export const youngKind=k=>k=='uop'||k=='zlec';
const leap=y=>y%4==0&&(y%100!=0||y%400==0);
/* the 26th birthday (the last day of the relief) from the date of birth; 29 February → 28 February in a common year */
export function youngUntil(birth){if(!/^\d{4}-\d\d-\d\d$/.test(birth||''))return'';const y=+birth.slice(0,4)+26,md=birth.slice(5);return y+'-'+(md=='02-29'&&!leap(y)?'02-28':md)}
export const revOf=sl=>brutto(sl)+(sl.ppkEmp||0);
/* the limit left for a payslip of `src` paid on `date` (month ym): null = no relief (no date of birth, after the 26th birthday, other contract).
   Other payslips of the same person this year count – stored `young`, or (older ones) their whole income when paid before the birthday. */
export function youngLeft(slips,incs,src,birth,ym,date){const until=youngUntil(birth);if(!until||!youngKind(src.kind))return null;if((date||ym+'-01')>until)return null;
  const y=ym.slice(0,4);let used=0;
  for(const[m,L]of Object.entries(slips||{})){if(!m.startsWith(y)||m>ym)continue;
    for(const[id,sl]of Object.entries(L||{})){if(m==ym&&id==src.id)continue;const s=(incs||[]).find(x=>x.id==id)||sl;
      if((sl.who||s.who)!=src.who||!youngKind(sl.kind||s.kind))continue;used+=sl.young!=null?sl.young:(sl.date||m+'-01')<=until?revOf(sl):0}}
  return Math.max(0,YOUNG_LIMIT-used)}
/* the exempt part of a payslip: everything up to the limit left (0 when no relief) */
export const youngPart=(sl,left)=>left>0?Math.min(revOf(sl),left):0;
/* the tax base of a payslip (for the 32% threshold and PIT-11): income minus ZUS and costs; the exempt part (young) does not count */
export function baseOf(src,sl){const b=brutto(sl);if(src.kind=='b2b')return Math.max(0,b-(sl.costs||0)-(sl.zus||0));
  const rev=revOf(sl),ex=Math.min(rev,sl.young||0),sh=rev?(rev-ex)/rev:1;return Math.max(0,r0(rev-ex-Math.round((sl.zus||0)*sh)-(sl.kup||0)))}
export function suggest(src,sl,ytd={brutto:0,base:0},young=null){const b=brutto(sl),o={};
  if(src.kind=='uop'||src.kind=='zlec'){
    /* 🎓 a student / pupil under 26 on umowa zlecenie: no ZUS and no health contribution */
    const stu=src.kind=='zlec'&&!!src.student,zusOn=src.kind=='uop'||(src.zusOn!==false&&!stu),cap=Math.min(b,Math.max(0,ZUS_LIMIT-ytd.brutto));
    o.zus=zusOn?pct(cap,9.76)+pct(cap,1.5)+pct(b,2.45):0;
    o.health=stu?0:pct(b-o.zus,9);
    o.ppkOwn=src.ppk?pct(b,src.ppkOwnPct??2):0;o.ppkEmp=src.ppk?pct(b,src.ppkEmpPct??1.5):0;
    const pit2=src.kind=='uop'?src.pit2!==false:!!src.pit2,ex=youngPart({comp:[{a:b}],ppkEmp:o.ppkEmp},young);o.young=ex;
    /* zlecenie: 20% / 50% of the revenue (with the employer's PPK) minus ZUS */
    if(!ex){o.kup=src.kind=='uop'?(src.kup==300?30000:25000):pct(b+o.ppkEmp-o.zus,src.kup==50?50:20);o.base=Math.max(0,r0(b-o.zus-o.kup+o.ppkEmp))}
    else{const rev=b+o.ppkEmp,tr=rev-ex,sh=tr/rev,zd=Math.round(o.zus*sh);
      o.kup=src.kind=='uop'?Math.min(src.kup==300?30000:25000,Math.max(0,tr-zd)):pct(Math.max(0,tr-zd),src.kup==50?50:20);
      o.base=Math.max(0,r0(tr-zd-o.kup))}
    o.tax=o.base>0?progressive(o.base,ytd.base,pit2?30000:0):0}
  else if(src.kind=='dzielo'){o.zus=0;o.health=0;o.ppkOwn=0;o.ppkEmp=0;o.kup=pct(b,src.kup==50?50:20);o.base=Math.max(0,r0(b-o.kup));o.tax=r0(pct(o.base,12))}
  else{const ym=ytd.ym,T=jdgT(ym),costs=sl.costs||0,Z=jdgZus(src,ym),inc=Math.max(0,b-costs-Z.soc-Z.fp);o.zus=Z.soc+Z.fp;o.kup=0;o.ppkOwn=0;o.ppkEmp=0;o.hded=0;
    if(src.taxf=='liniowy'){o.health=Math.max(pct(inc,4.9),hMin(ym));o.hded=Math.min(o.health,Math.max(0,T.linLimit-(ytd.hded||0)));o.base=Math.max(0,r0(inc-o.hded));o.tax=r0(pct(o.base,19))}
    else if(src.taxf=='ryczalt'){const R=(ytd.brutto||0)+b;o.health=src.healthAmt||T.rycz[R<=6000000?0:R<=30000000?1:2];
      /* ryczałt: revenue minus ZUS społeczny (not Fundusz Pracy) and half of the health contribution; costs do not count */
      o.base=Math.max(0,r0(b-Z.soc-Math.round(o.health/2)));o.tax=r0(Math.round(o.base*(+src.ryczRate||12)/100))}
    else{o.health=Math.max(pct(inc,9),hMin(ym));o.base=r0(inc);o.tax=progressive(o.base,ytd.base,30000)}}
  return o}
/* „Podpowiedz z netto”: from the amount that came to the account (plus the deductions taken from the pay) back to brutto, then the same estimate as from brutto.
   Employee contracts only (JDG: the invoice is what comes in). Net grows by at most a grosz per grosz of brutto (rounding can only slow it down),
   so a brutto that gives it exactly is always near; the tax is rounded to full złoty, so a few brutto amounts can give the same net –
   the lowest one around is taken (a rare rounding step can skip the target – then the nearest). */
export function fromNet(src,net,ded=0,ytd={brutto:0,base:0},young=null){if(src.kind=='b2b')return null;const target=net+ded;if(!(target>0))return null;
  const f=b=>{const o=suggest(src,{comp:[{a:b}]},ytd,young);return b-o.zus-o.health-o.tax-o.ppkOwn};
  let lo=0,hi=target;while(f(hi)<target){hi*=2;if(hi>1e11)return null}
  while(hi-lo>1){const mid=Math.floor((lo+hi)/2);if(f(mid)<target)lo=mid;else hi=mid}
  let b=0,best=null;for(let x=Math.max(1,hi-3000);x<=hi+3000;x++){const d=Math.abs(f(x)-target);if(!d){b=x;break}if(!best||d<best.d)best={x,d}}if(!b)b=best.x;
  return{b,...suggest(src,{comp:[{a:b}]},ytd,young)}}
/* totals of many payslips (a month of all sources, or a year of one source) */
export function totals(list){const t={brutto:0,net:0,zus:0,health:0,tax:0,kup:0,ppkOwn:0,ppkEmp:0,ded:0,hours:0,young:0,n:0};
  for(const s of list){t.n++;t.brutto+=brutto(s);t.net+=s.net||0;t.zus+=s.zus||0;t.health+=s.health||0;t.tax+=s.tax||0;t.kup+=s.kup||0;
    t.ppkOwn+=s.ppkOwn||0;t.ppkEmp+=s.ppkEmp||0;t.young+=s.young||0;t.ded+=dedSum(s);t.hours+=hoursOf(s)}
  return t}
