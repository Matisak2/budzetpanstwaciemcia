// E-mails of Budżet M&W: the backup file (same format as ⚙️ „Pobierz kopię”) and a pastel summary of a month. Pure functions – easy to test.
import {MN,zl,zl0,addMonths} from '../js/util.js';
import {actuals,agg,balance,subsMap,cleanCat} from '../js/logic.js';
export const APP='https://matisak2.github.io/budzetpanstwaciemcia/';
/* the full backup – the app reads it back with ⚙️ „Wczytaj kopię” */
export function backupDoc(D,now=new Date()){return{format:'budzet-mw-2',exported:now.toISOString(),auto:true,cfg:D.cfg,savTarget:D.hraw?.savTarget||0,tx:D.txAll,plans:D.plans,inv:D.inv,goals:D.goals,
  slips:Object.fromEntries(Object.entries(D.slips||{})),hold:D.hold,debts:D.debts}}
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const isPln=a=>!a.cur||a.cur=='PLN';
/* numbers of one month (ym) for the summary */
export function monthStats(D,ym){const{cfg,tx}=D,A=agg(cfg,tx,ym),act=actuals(cfg,tx,ym),pl=D.plans?.[ym]||{},sm=subsMap(cfg);
  const exp=cfg.cats.filter(c=>c.type=='exp').flatMap(c=>c.subs.map(s=>({s,c,p:pl[s.id]||0,a:act[s.id]||0}))).filter(x=>x.p||x.a);
  const over=exp.filter(x=>x.p&&x.a>x.p).sort((a,b)=>(b.a-b.p)-(a.a-a.p)),out=exp.filter(x=>!x.p&&x.a>0).sort((a,b)=>b.a-a.a),fit=exp.filter(x=>x.p&&x.a<=x.p);
  const pexp=cfg.cats.filter(c=>c.type=='exp').reduce((a,c)=>a+c.subs.reduce((b,s)=>b+(pl[s.id]||0),0),0);
  const sv=cfg.accs.filter(a=>(a.grp=='sav'||a.grp=='inv')&&isPln(a)),saved=sv.reduce((x,a)=>x+balance(cfg,tx,a.id,ym+'-32')-balance(cfg,tx,a.id,ym+'-00'),0);
  const cats=Object.entries(A.cat).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([id,v])=>({n:cleanCat(cfg.cats.find(c=>c.id==id)?.name),v}));
  const P=agg(cfg,tx,addMonths(ym,-1));
  return{ym,inc:A.inc,exp:A.exp,pexp,over,out,fit,saved,cats,who:A.who,prevExp:P.exp,n:tx.filter(t=>t.date.startsWith(ym)).length,sm}}
/* the summary e-mail: simple tables with inline styles (what e-mail apps understand), pastel colours, Bailey and Ivo */
export function summaryHtml(st){const m=MN[+st.ym.slice(5)-1].toLowerCase()+' '+st.ym.slice(0,4),bal=st.inc-st.exp,good=!st.over.length&&!st.out.length;
  const row=(l,v,c='#334155')=>`<tr><td style="padding:6px 0;color:#64748b">${l}</td><td style="padding:6px 0;text-align:right;font-weight:800;color:${c}">${v}</td></tr>`;
  const box=(t,body,bg)=>`<div style="background:${bg};border-radius:16px;padding:14px 16px;margin:10px 0"><div style="font-weight:800;margin-bottom:6px">${t}</div>${body}</div>`;
  const list=(L,f)=>L.slice(0,5).map(x=>`<div style="padding:3px 0">${f(x)}</div>`).join('');
  const d=st.prevExp?Math.round((st.exp/st.prevExp-1)*100):null;
  return`<!doctype html><html><body style="margin:0;background:#fdf6ee;font-family:Nunito,Segoe UI,Arial,sans-serif;color:#1e293b">
<div style="max-width:520px;margin:0 auto;padding:18px">
 <div style="text-align:center;padding:8px 0 4px"><img src="${APP}icon-192.png" width="64" height="64" alt="" style="border-radius:16px"><div style="font-size:20px;font-weight:900;margin-top:6px">Podsumowanie: ${m}</div>
 <div style="color:#64748b;font-size:14px">${st.n} wpisów w budżecie</div></div>
 ${box('🐾 '+(good?'Ivo: Wszystko w planie! Należy się smaczek 😺':`Bailey: ${st.over.length?`${st.over.length} ${st.over.length==1?'pozycja przekroczyła':'pozycji przekroczyło'} plan`:'Kilka wydatków było poza planem'} – zerknijcie razem, bez nerwów.`),'',good?'#dcfce7':'#fef3c7')}
 ${box('W liczbach',`<table style="width:100%;border-collapse:collapse;font-size:15px">${row('Przychody',zl(st.inc),'#15803d')}${row('Wydatki',zl(st.exp)+(d!=null?` <span style="color:#64748b;font-weight:600">(${d>0?'+':''}${d}% wobec poprzedniego)</span>`:''),'#be123c')}${st.pexp?row('Plan wydatków',zl(st.pexp)):''}${row('Zostało',zl(bal),bal>=0?'#15803d':'#be123c')}${row('Odłożone (oszczędności i inwestycje)',(st.saved>0?'+':'')+zl(st.saved),'#4338ca')}</table>`,'#ffffff')}
 ${st.over.length?box('▲ Przekroczone',list(st.over,x=>`${esc(x.s.name)} <b style="color:#be123c">+${zl0(x.a-x.p)}</b> <span style="color:#64748b">(plan ${zl0(x.p)})</span>`),'#fff1f2'):''}
 ${st.out.length?box('⚠️ Poza planem',list(st.out,x=>`${esc(x.s.name)} <b>${zl0(x.a)}</b>`),'#fefce8'):''}
 ${st.fit.length?box('✅ Zmieściło się',`${st.fit.length} ${st.fit.length==1?'pozycja':'pozycji'} – zostało ${zl0(st.fit.reduce((a,x)=>a+x.p-x.a,0))}`,'#ecfdf5'):''}
 ${st.cats.length?box('Na co poszło najwięcej',list(st.cats,x=>`${esc(x.n)} <b>${zl0(x.v)}</b>`),'#eef2ff'):''}
 ${(st.who.Mati||st.who.Wercia)?box('Mati ↔ Wercia',`Mati <b>${zl0(st.who.Mati||0)}</b> · Wercia <b>${zl0(st.who.Wercia||0)}</b>`,'#fdf2f8'):''}
 <div style="text-align:center;margin:18px 0"><a href="${APP}" style="display:inline-block;background:#a7f3d0;color:#065f46;font-weight:800;text-decoration:none;padding:12px 22px;border-radius:14px">Otwórz Budżet M&amp;W</a></div>
 <div style="text-align:center;color:#94a3b8;font-size:12px">Wysłał automat Budżetu M&amp;W · 1. dnia każdego miesiąca</div>
</div></body></html>`}
export function summaryText(st){const m=MN[+st.ym.slice(5)-1].toLowerCase()+' '+st.ym.slice(0,4);
  return`Podsumowanie: ${m}\nPrzychody: ${zl(st.inc)}\nWydatki: ${zl(st.exp)}\nZostało: ${zl(st.inc-st.exp)}\nOdłożone: ${zl(st.saved)}\n${st.over.length?'Przekroczone: '+st.over.slice(0,5).map(x=>x.s.name).join(', ')+'\n':''}\n${APP}`}
