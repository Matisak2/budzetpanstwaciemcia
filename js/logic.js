import {addDays,daysIn,isDate,p2,zl} from './util.js';
export const cleanCat=n=>String(n||'').replace(/^\s*\d+\s*[.)]\s*/,'').trim();
export const subsMap=cfg=>{const m={};cfg.cats.forEach(c=>c.subs.forEach(s=>m[s.id]={...s,cat:c}));return m};
export const liveOf=tx=>tx.filter(t=>!t.deleted&&isDate(t.date));
export function balance(cfg,tx,id,before){let b=cfg.accs.find(a=>a.id===id)?.open||0;
  for(const t of tx){if(t.date>=before)continue;
    if(t.acc===id){if(t.type=='inc'||t.type=='adj'||t.type=='invs')b+=t.amount;else b-=t.amount}
    if(t.type=='tr'&&t.to===id)b+=t.amount}
  return b}
export function actuals(cfg,tx,ym){const sm=subsMap(cfg),act={};
  tx.forEach(t=>{if(!t.date.startsWith(ym))return;const s=sm[t.sub];if(!s||(t.type!='exp'&&t.type!='inc'))return;
    act[t.sub]=(act[t.sub]||0)+(t.type==s.cat.type?t.amount:-t.amount)});return act}
export function status(type,plan,act){
  if(!plan&&!act)return null;
  if(!plan)return{k:'none',txt:'bez planu',pct:null};
  const pct=act/plan*100,r=Math.round(pct);
  if(type=='inc')return pct>=100?{k:'ok',txt:'✓ '+r+'%',pct}:{k:'low',txt:r+'%',pct};
  if(pct>100)return{k:'over',txt:'▲ '+r+'%',pct};
  if(pct>=85)return{k:'near',txt:'● '+r+'%',pct};
  return{k:'ok',txt:'✓ '+r+'%',pct}}
/* old investments module: złoty put in and still held at a date (buys minus the average cost of what was sold) */
export function invPln(it,before='9999-99-99'){
  const all=Object.values(it.lots||{}).filter(l=>!l.deleted&&l.date<before).sort((a,b)=>a.date.localeCompare(b.date)||(a.ts||0)-(b.ts||0));
  let qty=0,pln=0;
  for(const l of all){const q=+l.qty||0;
    if(l.kind=='sell'){if(qty<=0)continue;const k=Math.min(q,qty);pln-=Math.round(pln/qty*k);qty-=k;if(qty<1e-9){qty=0;pln=0}}
    else{qty+=q;pln+=l.pln||0}}
  return pln}
export const fixedDate=(f,ym)=>ym+'-'+p2(Math.min(Math.max(1,+f.day||1),daysIn(ym)));
/* unpaid fixed costs that are overdue this month, due today or due tomorrow (tomorrow may already be next month) */
export function dueAlerts(fixed,tx,today){const out=[],tom=addDays(today,1);
  const paid=(f,ym)=>tx.some(t=>t.fixedId===f.id&&t.date.startsWith(ym));
  for(const f of fixed){const ym=today.slice(0,7),due=fixedDate(f,ym);
    if(f.kind=='inc'){if(!paid(f,ym)&&due<today)out.push({f,when:'inc',due});continue}
    if(!paid(f,ym)){if(due<today)out.push({f,when:'late',due});else if(due==today)out.push({f,when:'today',due});else if(due==tom)out.push({f,when:'tomorrow',due})}
    const tym=tom.slice(0,7);if(tym!=ym&&fixedDate(f,tym)==tom&&!paid(f,tym))out.push({f,when:'tomorrow',due:tom})}
  const ord={late:0,today:1,tomorrow:2,inc:3};return out.sort((a,b)=>ord[a.when]-ord[b.when]||a.due.localeCompare(b.due))}
/* iCalendar file: one monthly all-day event per fixed cost, alarm at 18:00 the evening before */
export function buildIcs(fixed,today){const esc2=t=>String(t).replace(/[\\;,]/g,m=>'\\'+m).replace(/\n/g,'\\n');
  const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
  const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Budzet MW//PL','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Opłaty stałe'];
  for(const f of fixed.filter(x=>(x.kind||'exp')=='exp')){const day=Math.min(31,Math.max(1,+f.day||1));let first=fixedDate(f,today.slice(0,7));if(first<today){const n=addDays(today.slice(0,7)+'-01',32).slice(0,7);first=fixedDate(f,n)}
    const ds=first.replace(/-/g,''),de=addDays(first,1).replace(/-/g,'');
    L.push('BEGIN:VEVENT','UID:oplata-'+f.id+'@budzet-mw','DTSTAMP:'+stamp,'DTSTART;VALUE=DATE:'+ds,'DTEND;VALUE=DATE:'+de,
      'RRULE:FREQ=MONTHLY;BYMONTHDAY='+(day>=31?'-1':day),'SUMMARY:'+esc2('💳 '+f.name+' – '+zl(f.amount).replace(/\s/g,' ')),
      'DESCRIPTION:'+esc2('Termin opłaty stałej. Po zapłaceniu odhacz ją w aplikacji Budżet M&W.'),'TRANSP:TRANSPARENT',
      'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+esc2('Jutro termin: '+f.name),'TRIGGER:-PT6H','END:VALARM','END:VEVENT')}
  L.push('END:VCALENDAR');return L.join('\r\n')+'\r\n'}

/* bulk reconcile: diffs per account → transfers (too much → too little), leftovers → adjustments; investment accounts → value change */
export function planRecon(diffs){// diffs: [{id,d,inv}]
  const ops=[],pos=diffs.filter(x=>!x.inv&&x.d>0).map(x=>({...x})).sort((a,b)=>b.d-a.d),neg=diffs.filter(x=>!x.inv&&x.d<0).map(x=>({...x,d:-x.d})).sort((a,b)=>b.d-a.d);
  let i=0,j=0;while(i<pos.length&&j<neg.length){const a=Math.min(pos[i].d,neg[j].d);ops.push({kind:'tr',from:neg[j].id,to:pos[i].id,amount:a});pos[i].d-=a;neg[j].d-=a;if(!pos[i].d)i++;if(!neg[j].d)j++}
  pos.forEach(x=>{if(x.d)ops.push({kind:'adj',acc:x.id,amount:x.d})});neg.forEach(x=>{if(x.d)ops.push({kind:'adj',acc:x.id,amount:-x.d})});
  diffs.filter(x=>x.inv&&x.d).forEach(x=>ops.push({kind:'val',acc:x.id,amount:x.d}));
  return ops}
export function agg(cfg,tx,prefix){const sm=subsMap(cfg),r={inc:0,exp:0,cat:{},sub:{},who:{},acc:{},day:{},fixed:0,big:[],n:0};
  for(const t of tx){if(!t.date.startsWith(prefix))continue;const s=sm[t.sub];if(!s||(t.type!='exp'&&t.type!='inc'))continue;
    const a=(t.type==s.cat.type?1:-1)*t.amount;
    if(s.cat.type=='inc'){r.inc+=a;continue}
    r.exp+=a;r.cat[s.cat.id]=(r.cat[s.cat.id]||0)+a;r.sub[s.id]=(r.sub[s.id]||0)+a;
    if(t.type=='exp'){r.n++;const w=t.who||'—';r.who[w]=(r.who[w]||0)+t.amount;r.acc[t.acc]=(r.acc[t.acc]||0)+t.amount;
      const d=+t.date.slice(8);r.day[d]=(r.day[d]||0)+t.amount;if(t.fixedId)r.fixed+=t.amount;r.big.push(t)}
    else if(t.refundOf){const w=t.who||'—';r.who[w]=(r.who[w]||0)-t.amount;r.acc[t.acc]=(r.acc[t.acc]||0)-t.amount}}
  r.big.sort((a,b)=>b.amount-a.amount);r.big=r.big.slice(0,5);return r}
