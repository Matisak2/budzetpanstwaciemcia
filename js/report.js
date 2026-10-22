/* 🖨️ the year summary – the same numbers and the same page in the app (Analiza → Rok → „Podsumowanie roku”, save as PDF / print)
   and in the January e-mail from the automat. Pure functions; inline styles, so e-mail apps show it the same way. */
import {MN,zl,zl0} from './util.js';
import {agg,balance,cleanCat} from './logic.js';
import {limitOf,paidInYear,wrapOf} from './inv.js';
import {ULGI,pitSummaryP} from './today.js';
const isPln=a=>!a.cur||a.cur=='PLN';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* D = {cfg, tx (live entries), hraw}; today limits the current year to the months that already started */
export function yearStats(D,year,today='9999-12-31'){const{cfg,tx,hraw}=D,y=String(year),A=agg(cfg,tx,y),P=agg(cfg,tx,String(+y-1));
  const last=today.slice(0,4)==y?+today.slice(5,7):12;
  let months=Array.from({length:last},(_,i)=>{const ym=`${y}-${String(i+1).padStart(2,'0')}`,M=agg(cfg,tx,ym);return{ym,inc:M.inc,exp:M.exp}});
  const first=months.findIndex(m=>m.inc||m.exp);months=first<0?[]:months.slice(first);
  const start=`${y}-01-01`,end=`${+y+1}-01-01`,bal=(a,d)=>balance(cfg,tx,a.id,d),live=cfg.accs.filter(a=>isPln(a)&&!a.archived);
  const sv=cfg.accs.filter(a=>(a.grp=='sav'||a.grp=='inv')&&isPln(a)),saved=sv.reduce((x,a)=>x+bal(a,end)-bal(a,start),0);
  const wealth0=live.reduce((x,a)=>x+bal(a,start),0),wealth1=live.reduce((x,a)=>x+bal(a,end),0);
  const cats=Object.entries(A.cat).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([id,v])=>{const c=cfg.cats.find(c=>c.id==id);return{n:cleanCat(c?.name||''),v,hue:c?.hue??220,icon:c?.icon||''}});
  const subName={};cfg.cats.forEach(c=>c.subs.forEach(s=>{subName[s.id]=s.name}));
  const top=Object.entries(A.sub).filter(([id,v])=>v>0&&cfg.cats.some(c=>c.type=='exp'&&c.subs.some(s=>s.id==id))).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([id,v])=>({n:subName[id]||'',v}));
  const withData=months.filter(m=>m.exp>0),maxM=withData.slice().sort((a,b)=>b.exp-a.exp)[0]||null;
  const wraps=cfg.accs.filter(a=>a.grp=='inv'&&!a.archived&&['ike','ikze','ppk','oki'].includes(wrapOf(a))).map(a=>({n:a.name,w:wrapOf(a),paid:paidInYear(tx,a.id,y),lim:limitOf(a,y,hraw?.limits),value:bal(a,end)})).filter(x=>x.paid||x.value);
  const pit=['Mati','Wercia'].map(w=>({w,...pitSummaryP(cfg,tx,y,w,hraw)})).filter(p=>p.n||p.ikze.length);
  return{year:y,inc:A.inc,exp:A.exp,who:A.who,prev:{inc:P.inc,exp:P.exp},months,saved,wealth0,wealth1,cats,top,maxM,avgExp:withData.length?Math.round(withData.reduce((a,m)=>a+m.exp,0)/withData.length):0,
    wraps,pit,n:tx.filter(t=>t.date.startsWith(y)).length,partial:last<12}}
/* the page itself (a <div> – the app shows it, the e-mail wraps it) */
export function yearBody(st,app=''){const bal=st.inc-st.exp,pc=(a,b)=>b?Math.round((a/b-1)*100):null,dE=pc(st.exp,st.prev.exp);
  const row=(l,v,c='#334155')=>`<tr><td style="padding:6px 0;color:#64748b">${l}</td><td style="padding:6px 0;text-align:right;font-weight:800;color:${c}">${v}</td></tr>`;
  const box=(t,body,bg)=>`<div style="background:${bg};border-radius:16px;padding:14px 16px;margin:10px 0;break-inside:avoid"><div style="font-weight:800;margin-bottom:8px;font-size:16px">${t}</div>${body}</div>`;
  const bar=(v,max,col)=>`<div style="background:rgba(15,23,42,.06);border-radius:6px;height:10px;overflow:hidden"><div style="width:${max?Math.max(2,Math.round(v/max*100)):0}%;height:10px;background:${col};border-radius:6px"></div></div>`;
  const maxE=Math.max(1,...st.months.map(m=>Math.max(m.exp,m.inc)));
  const monthsT=`<table style="width:100%;border-collapse:collapse;font-size:13.5px">${st.months.map(m=>`<tr><td style="padding:4px 8px 4px 0;width:70px;color:#475569">${MN[+m.ym.slice(5)-1].slice(0,3)}</td>
    <td style="padding:4px 0">${bar(m.inc,maxE,'#86efac')}<div style="height:3px"></div>${bar(m.exp,maxE,'#fda4af')}</td><td style="padding:4px 0 4px 8px;text-align:right;white-space:nowrap"><span style="color:#15803d">${zl0(m.inc)}</span><br><span style="color:#be123c">${zl0(m.exp)}</span></td></tr>`).join('')}</table>
    <div style="font-size:12px;color:#64748b;margin-top:6px">🟩 przychody · 🟥 wydatki${st.maxM?` · najwięcej wydaliście w miesiącu: ${MN[+st.maxM.ym.slice(5)-1].toLowerCase()}`:''}</div>`;
  const maxC=st.cats[0]?.v||1,catsT=st.cats.slice(0,8).map(c=>`<div style="margin:6px 0"><div style="display:flex;justify-content:space-between;font-size:14px"><span>${esc(c.icon)} ${esc(c.n)}</span><b>${zl0(c.v)}</b></div>${bar(c.v,maxC,`hsl(${c.hue} 65% 72%)`)}</div>`).join('');
  const topT=st.top.length?`<div style="font-size:13px;color:#475569;margin-top:10px">Największe pozycje: ${st.top.map(x=>`${esc(x.n)} <b>${zl0(x.v)}</b>`).join(' · ')}</div>`:'';
  const good=st.saved>0,dW=st.wealth1-st.wealth0;
  const W={ike:'IKE',ikze:'IKZE',ppk:'PPK',oki:'OKI'};
  const wrapsT=st.wraps.map(x=>`<div style="padding:4px 0;font-size:14px">${esc(x.n)} <span style="color:#64748b">(${W[x.w]})</span>: wpłacono <b>${zl0(x.paid)}</b>${x.lim?` z ${zl0(x.lim)} limitu`:''}${x.value?` · wartość ${zl0(x.value)}`:''}</div>`).join('');
  const pitT=st.pit.map(p=>`<div style="padding:6px 0"><b>${p.w}</b>: ${[...Object.entries(p.by).map(([k,v])=>`${ULGI[k]?.n||k} ${zl0(v.sum)} (${v.n})`),...p.ikze.map(x=>`IKZE ${zl0(x.paid)} – do odliczenia od dochodu`)].join(' · ')}</div>`).join('');
  return`<div style="max-width:560px;margin:0 auto;padding:18px;font-family:Nunito,Segoe UI,Arial,sans-serif;color:#1e293b;background:#fdf6ee;border-radius:20px">
 <div style="text-align:center;padding:8px 0 4px">${app?`<img src="${app}icon-192.png" width="64" height="64" alt="" style="border-radius:16px">`:''}<div style="font-size:22px;font-weight:900;margin-top:6px">Podsumowanie roku ${st.year} ${good?'🎉':'🐾'}</div>
 <div style="color:#64748b;font-size:14px">${st.n} ${st.n==1?'wpis':st.n%10>=2&&st.n%10<=4&&(st.n%100<10||st.n%100>=20)?'wpisy':'wpisów'} w budżecie${st.partial?' · rok jeszcze trwa':''}</div></div>
 ${box('🐾 '+(good?`Ivo: Odłożyliście ${zl0(st.saved)}. Brawo, należy się smaczek! 😺`:st.partial?`Bailey: W tym roku jeszcze nic nie odłożyliście – nawet małe kwoty się liczą.`:`Bailey: To był rok bez odkładania – w nowym zacznijmy od małych kwot.`),'',good?'#dcfce7':'#fef3c7')}
 ${box('W liczbach',`<table style="width:100%;border-collapse:collapse;font-size:15px">${row('Przychody',zl(st.inc),'#15803d')}${row('Wydatki',zl(st.exp)+(dE!=null?` <span style="color:#64748b;font-weight:600">(${dE>0?'+':''}${dE}% wobec ${+st.year-1})</span>`:''),'#be123c')}${row('Zostało',zl(bal),bal>=0?'#15803d':'#be123c')}${row('Odłożone (oszczędności i inwestycje)',zl(st.saved),st.saved>=0?'#15803d':'#be123c')}${row('Średnio wydatki na miesiąc',zl(st.avgExp))}</table>`,'#ffffff')}
 ${st.months.length?box('Miesiąc po miesiącu',monthsT,'#ffffff'):''}
 ${st.cats.length?box('Na co poszło',catsT+topT,'#ffffff'):''}
 ${box('Majątek',`<table style="width:100%;border-collapse:collapse;font-size:15px">${row('Na początku roku',zl(st.wealth0))}${row(st.partial?'Teraz':'Na koniec roku',zl(st.wealth1))}${row('Zmiana',(dW>=0?'+':'')+zl(dW),dW>=0?'#15803d':'#be123c')}</table><div style="font-size:12px;color:#64748b">wszystkie konta w złotych (bez zobowiązań i należności)</div>`,'#eef2ff')}
 ${(st.who.Mati||st.who.Wercia)?box('Mati ↔ Wercia',`<div style="font-size:15px">wydatki: Mati <b>${zl0(st.who.Mati||0)}</b> · Wercia <b>${zl0(st.who.Wercia||0)}</b></div>`,'#fdf2f8'):''}
 ${st.wraps.length?box('🛡️ IKE, IKZE, PPK',wrapsT,'#ecfeff'):''}
 ${st.pit.length?box('🧾 Do zeznania PIT',pitT+`<div style="font-size:12px;color:#64748b;margin-top:4px">To podpowiedź z Waszych wpisów, nie porada podatkowa.</div>`,'#fefce8'):''}
 <div style="text-align:center;color:#94a3b8;font-size:12px;margin-top:12px">Budżet M&amp;W · Bailey i Ivo 🐾</div></div>`}
/* the e-mail: the page plus a button to the app */
export function yearHtml(st,app){return`<!doctype html><html><body style="margin:0;background:#fdf6ee">${yearBody(st,app)}
 <div style="text-align:center;margin:18px 0;font-family:Nunito,Segoe UI,Arial,sans-serif"><a href="${app}" style="display:inline-block;background:#a7f3d0;color:#065f46;font-weight:800;text-decoration:none;padding:12px 22px;border-radius:14px">Otwórz Budżet M&amp;W</a>
 <div style="color:#94a3b8;font-size:12px;margin-top:10px">Wysłał automat Budżetu M&amp;W · 1 stycznia</div></div></body></html>`}
export const yearText=st=>`Podsumowanie roku ${st.year}\nPrzychody: ${zl(st.inc)}\nWydatki: ${zl(st.exp)}\nOdłożone: ${zl(st.saved)}\nMajątek: ${zl(st.wealth0)} → ${zl(st.wealth1)}\n`;
