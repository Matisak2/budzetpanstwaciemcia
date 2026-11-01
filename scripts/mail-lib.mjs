// E-mails of Budżet M&W: the backup file (same format as ⚙️ „Pobierz kopię”) and a pastel summary of a month. Pure functions – easy to test.
import {MN,MNG,zl,zl0,addMonths,daysIn,esc,plu,dmy} from '../js/util.js';
import {actuals,agg,subsMap,cleanCat,savFlow,savIds,planOf,balance,anomalies,firstYm,yearDueIn,backupDoc as backupOf} from '../js/logic.js';
import {debtStateP} from '../js/today.js';
import {catIcon} from '../js/art.js';
export const APP='https://matisak2.github.io/budzetpanstwaciemcia/';
/* the full backup – the app reads it back with ⚙️ „Wczytaj kopię” */
export function backupDoc(D,now=new Date()){return backupOf({...D,tx:D.txAll},now,{auto:true})}

const OWN=['Mati','Wercia','Wspólne'];
const isPln=a=>!a.cur||a.cur=='PLN';
const nice=n=>{n=cleanCat(n);return n.charAt(0)+n.slice(1).toLowerCase()};/* „ZDROWIE I URODA” → „Zdrowie i uroda” */
const pc=(a,b)=>b?Math.round((a/Math.abs(b)-1)*100):null;
/* 🏪 a shop / place from the note: the same name written a bit differently counts as one */
const placeKey=n=>String(n||'').replace(/💱.*$/,'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ł/g,'l').replace(/[.,!?;:"'„”()]/g,'').replace(/\s+/g,' ').trim();
/* all numbers of one month (ym) for the summary e-mail – compared with the previous month, the averages of 3 and 6 months before it and the same month a year ago */
export function monthStats(D,ym,today=ym+'-28'){const{cfg,tx}=D,sm=subsMap(cfg),first=firstYm(tx),SV=savIds(cfg),plans=D.plans||{};
  const memo={},M=m=>memo[m]||(memo[m]=(()=>{const A=agg(cfg,tx,m);return{m,inc:A.inc,exp:A.exp,bal:A.inc-A.exp,put:savFlow(cfg,tx,SV,m).flow,cat:A.cat,sub:A.sub,has:!!(A.inc||A.exp)}})());
  const back=n=>Array.from({length:n},(_,i)=>addMonths(ym,-1-i)).filter(m=>m>=first).map(M).filter(x=>x.has);
  const avgOf=L=>{if(!L.length)return null;const o={n:L.length,cat:{}};for(const k of ['inc','exp','bal','put'])o[k]=Math.round(L.reduce((a,x)=>a+x[k],0)/L.length);
    for(const x of L)for(const[c,v]of Object.entries(x.cat))o.cat[c]=(o.cat[c]||0)+v/L.length;for(const c in o.cat)o.cat[c]=Math.round(o.cat[c]);return o};
  const A=agg(cfg,tx,ym),cur=M(ym),prevM=M(addMonths(ym,-1)),prev=prevM.has?prevM:null,a3=avgOf(back(3)),a6=avgOf(back(6)),yaM=M(addMonths(ym,-12)),ya=yaM.has?yaM:null;
  /* plan */
  const act=actuals(cfg,tx,ym),pl=planOf(cfg,plans,tx,ym),exp=cfg.cats.filter(c=>c.type=='exp').flatMap(c=>c.subs.map(s=>({s,c,p:pl[s.id]||0,a:act[s.id]||0}))).filter(x=>x.p||x.a);
  const over=exp.filter(x=>x.p&&x.a>x.p).sort((a,b)=>(b.a-b.p)-(a.a-a.p)),out=exp.filter(x=>!x.p&&x.a>0).sort((a,b)=>b.a-a.a),fit=exp.filter(x=>x.p&&x.a<=x.p);
  const pexp=cfg.cats.filter(c=>c.type=='exp').reduce((a,c)=>a+c.subs.reduce((b,s)=>b+(pl[s.id]||0),0),0);
  /* categories: amount, share, change to the previous month, to the 3-month average and to a year ago */
  const cats=cfg.cats.filter(c=>c.type=='exp'&&(A.cat[c.id]||0)>0).map(c=>{const v=A.cat[c.id];return{id:c.id,n:nice(c.name),icon:catIcon(c),hue:c.hue??220,v,share:A.exp?v/A.exp*100:0,
    prev:prev?prev.cat[c.id]||0:null,a3:a3?a3.cat[c.id]||0:null,ya:ya?ya.cat[c.id]||0:null}}).sort((a,b)=>b.v-a.v);
  const chg=a3?cfg.cats.filter(c=>c.type=='exp').map(c=>({n:nice(c.name),v:A.cat[c.id]||0,avg:a3.cat[c.id]||0})).map(x=>({...x,d:x.v-x.avg})).filter(x=>Math.abs(x.d)>=5000):[];
  const up=chg.filter(x=>x.d>0).sort((a,b)=>b.d-a.d).slice(0,3),down=chg.filter(x=>x.d<0).sort((a,b)=>a.d-b.d).slice(0,3);
  /* the most a category cost in the last 6 months – „najwięcej od pół roku” */
  const L6=back(6),record=L6.length>=3?cats.filter(c=>c.v>=10000&&L6.every(x=>(x.cat[c.id]||0)<c.v)).slice(0,2):[];
  const anom=anomalies(cfg,tx,ym).slice(0,5).map(x=>({n:x.sub.name,v:x.v,avg:x.avg,pct:x.pct}));
  const big=A.big.map(t=>({v:t.amount,n:sm[t.sub]?.name||'',note:t.note||'',d:t.date}));
  /* shops and places from the notes (złoty expenses, no fixed payments, no loan instalments) */
  const G={};for(const t of tx){if(t.type!='exp'||!t.date.startsWith(ym)||t.fixedId||t.debt||t.payoff||!isPln(cfg.accs.find(a=>a.id==t.acc)||{}))continue;const raw=String(t.note||'').replace(/💱.*$/,'').trim();
    if(raw.length<2||/^[🪙↩📅💼]/u.test(raw)||/^potrącenie/i.test(raw))continue;const k=placeKey(raw);if(!k)continue;const g=G[k]||(G[k]={v:0,n:0,names:{}});g.v+=t.amount;g.n++;g.names[raw]=(g.names[raw]||0)+1}
  const shops=Object.values(G).filter(g=>g.v>0).sort((a,b)=>b.v-a.v).slice(0,5).map(g=>({n:Object.entries(g.names).sort((a,b)=>b[1]-a[1])[0][0],v:g.v,k:g.n}));
  /* days */
  const nd=daysIn(ym),dayMax=Object.entries(A.day).sort((a,b)=>b[1]-a[1])[0]||null;
  /* Mati ↔ Wercia: whose account the money came from (as in the app), and what each put aside */
  const persons=OWN.map(o=>({o,exp:A.own[o]||0,put:savFlow(cfg,tx,savIds(cfg,o),ym).flow}));
  /* savings, cushion, goals, wealth, liabilities at the end of the month */
  const end=addMonths(ym,1)+'-01',start=ym+'-01',bal=(a,d)=>balance(cfg,tx,a.id,d),pln=cfg.accs.filter(isPln);
  const savA=pln.filter(a=>a.grp=='sav'||a.grp=='inv'),sav1=savA.reduce((x,a)=>x+bal(a,end),0),sav0=savA.reduce((x,a)=>x+bal(a,start),0);
  const w1=pln.reduce((x,a)=>x+bal(a,end),0),w0=pln.reduce((x,a)=>x+bal(a,start),0);
  const goals=Object.values(D.goals||{}).filter(g=>g.target>0).map(g=>({n:g.name,saved:g.alloc??g.saved??0,target:g.target,o:g.owner||'Wspólne'})).map(g=>({...g,pct:Math.min(100,Math.max(0,g.saved/g.target*100))}));
  const past=back(6).map(x=>x.exp).filter(v=>v>0),avgE=past.length?past.reduce((a,v)=>a+v,0)/past.length:A.exp;
  const cushPool=pln.filter(a=>a.grp=='sav').reduce((x,a)=>x+bal(a,end),0)-goals.reduce((a,g)=>a+Math.max(0,g.saved),0),cushion=avgE>0?Math.max(0,cushPool)/avgE:null;
  const owe=Object.entries(D.debts||{}).filter(([,d])=>!d.deleted&&d.dir=='owe').reduce((a,[id,d])=>a+debtStateP({id,...d},tx,today).left,0);
  /* the new month: fixed payments, yearly expenses due, the plan if there is one */
  const nym=addMonths(ym,1),fixedN=(cfg.fixed||[]).filter(f=>(f.kind||'exp')=='exp'&&isPln(cfg.accs.find(a=>a.id==f.acc)||{})).reduce((a,f)=>a+(+f.amount||0),0);
  const yearsN=(cfg.years||[]).filter(it=>+it.amount>0&&yearDueIn(it,nym)).map(it=>({n:it.name,v:+it.amount}));
  const planN=plans[nym]?Object.entries(plans[nym]).filter(([id])=>sm[id]?.cat.type=='exp').reduce((a,[,v])=>a+(+v||0),0):0;
  const st={ym,inc:A.inc,exp:A.exp,bal:A.inc-A.exp,put:cur.put,gain:savFlow(cfg,tx,SV,ym).gain,rate:A.inc?cur.put/A.inc*100:null,cmp:{prev,a3,a6,ya},pexp,over,out,fit,
    left:fit.reduce((a,x)=>a+x.p-x.a,0),cats,up,down,record,anom,big,shops,fixed:A.fixed,avgDay:A.exp/nd,dayMax:dayMax?{d:+dayMax[0],v:dayMax[1]}:null,persons,
    target:D.hraw?.savTarget||0,sav0,sav1,w0,w1,goals,cushion,owe,fixedN,yearsN,planN,n:tx.filter(t=>t.date.startsWith(ym)).length};
  st.notes=insights(st);return st}
/* 3–5 short conclusions for the top of the e-mail */
function insights(st){const N=[],{prev,a3,ya}=st.cmp,m=MN[+st.ym.slice(5)-1].toLowerCase();
  if(a3&&a3.exp){const d=pc(st.exp,a3.exp);if(d!=null&&Math.abs(d)>=3)N.push(`Wydatki o ${Math.abs(d)}% ${d<0?'niższe':'wyższe'} niż średnio w ostatnich ${a3.n} ${plu(a3.n,'miesiącu','miesiącach','miesiącach')} (${zl0(a3.exp)}).`);else if(d!=null)N.push(`Wydatki na zwykłym poziomie – prawie tyle, co średnio w ostatnich miesiącach (${zl0(a3.exp)}).`)}
  if(st.pexp)N.push(st.exp>st.pexp?`Plan wydatków przekroczony o ${zl0(st.exp-st.pexp)} (${Math.round(st.exp/st.pexp*100)}% planu).`:`Plan wydatków wykonany w ${Math.round(st.exp/st.pexp*100)}% – zostało ${zl0(st.pexp-st.exp)}.`);
  if(st.rate!=null)N.push(`Odłożyliście ${Math.round(st.rate)}% przychodów (${zl0(st.put)})${prev&&prev.inc?` – w poprzednim miesiącu ${Math.round(prev.put/prev.inc*100)}%`:''}.`);
  if(st.up[0])N.push(`Najbardziej wzrosło: ${st.up[0].n} (+${zl0(st.up[0].d)} względem średniej).`);
  for(const r of st.record)N.push(`${r.n}: najwięcej od pół roku (${zl0(r.v)}).`);
  if(ya&&ya.exp){const d=pc(st.exp,ya.exp);if(d!=null)N.push(`W porównaniu z: ${m} ${+st.ym.slice(0,4)-1} wydatki ${d>0?'wyższe':'niższe'} o ${Math.abs(d)}%.`)}
  if(st.bal<0)N.push(`Wydatki były większe niż przychody o ${zl0(-st.bal)}.`);
  return N.slice(0,5)}
/* the summary e-mail: simple tables with inline styles (what e-mail apps understand), pastel colours, Bailey and Ivo */
export function summaryHtml(st){const m=MN[+st.ym.slice(5)-1].toLowerCase()+' '+st.ym.slice(0,4),good=!st.over.length&&!st.out.length,{prev,a3,a6,ya}=st.cmp;
  const F='font-family:Nunito,Segoe UI,Arial,sans-serif',G='#15803d',R='#be123c',S='#64748b';
  const row=(l,v,c='#334155')=>`<tr><td style="padding:6px 0;color:${S}">${l}</td><td style="padding:6px 0;text-align:right;font-weight:800;color:${c}">${v}</td></tr>`;
  const box=(t,body,bg='#ffffff')=>`<div style="background:${bg};border-radius:16px;padding:14px 16px;margin:10px 0"><div style="font-weight:800;margin-bottom:8px;font-size:16px">${t}</div>${body}</div>`;
  const bar=(v,max,col)=>`<div style="background:rgba(15,23,42,.06);border-radius:6px;height:8px;overflow:hidden;margin-top:3px"><div style="width:${max?Math.max(2,Math.min(100,Math.round(v/max*100))):0}%;height:8px;background:${col};border-radius:6px"></div></div>`;
  /* ▲▼ change: good = green (income up, spending down) */
  const dl=(c,b,goodUp)=>{if(b==null)return'<span style="color:#cbd5e1">—</span>';const d=pc(c,b);if(d==null)return'<span style="color:#cbd5e1">—</span>';if(Math.abs(d)<1)return`<span style="color:${S}">=</span>`;
    const up=d>0;return`<span style="color:${up==goodUp?G:R};white-space:nowrap">${up?'▲':'▼'} ${Math.abs(d)}%</span>`};
  const L=(X,f,n=5)=>X.slice(0,n).map(x=>`<div style="padding:4px 0;border-top:1px solid rgba(15,23,42,.05)">${f(x)}</div>`).join('');
  /* the comparison table */
  const cols=[['ten miesiąc',{inc:st.inc,exp:st.exp,bal:st.bal,put:st.put}],['poprzedni',prev],...(a3?[[`średnio ${a3.n} mies.`,a3]]:[]),...(a6&&a6.n>(a3?.n||0)?[[`średnio ${a6.n} mies.`,a6]]:[]),...(ya?[['rok temu',ya]]:[])];
  const rowsT=[['Przychody','inc',true],['Wydatki','exp',false],['Bilans','bal',true],['Odłożone','put',true]];
  const cmpT=`<table style="width:100%;border-collapse:collapse;font-size:12.5px"><tr>${['',...cols.map(c=>c[0])].map((h,i)=>`<td style="padding:4px 3px;color:${S};font-weight:700;${i?'text-align:right':''}">${h}</td>`).join('')}</tr>
    ${rowsT.map(([l,k,gu])=>`<tr><td style="padding:5px 3px;color:${S}">${l}</td>${cols.map(([,o],i)=>`<td style="padding:5px 3px;text-align:right;${i?'':'font-weight:800;'}">${o?zl0(o[k]):'—'}${i&&o?`<br>${dl(st[k],o[k],gu)}`:''}</td>`).join('')}</tr>`).join('')}</table>
    <div style="font-size:12px;color:${S};margin-top:6px">Strzałka pod kwotą mówi, jak ten miesiąc wypada na tle tamtej kolumny (zielona – dobrze).</div>`;
  const maxC=st.cats[0]?.v||1;
  const catsT=st.cats.slice(0,10).map(c=>`<div style="margin:8px 0"><div style="display:flex;justify-content:space-between;gap:8px;font-size:14px"><span>${esc(c.icon)} ${esc(c.n)} <span style="color:${S};font-size:12px">${c.share.toFixed(0)}%</span></span><b>${zl0(c.v)}</b></div>${bar(c.v,maxC,`hsl(${c.hue} 65% 72%)`)}
    <div style="font-size:12px;color:${S};margin-top:2px">${[c.prev!=null?`poprz. ${zl0(c.prev)} ${dl(c.v,c.prev||null,false)}`:'',c.a3!=null?`średnio ${zl0(c.a3)} ${dl(c.v,c.a3||null,false)}`:'',c.ya!=null?`rok temu ${zl0(c.ya)} ${dl(c.v,c.ya||null,false)}`:''].filter(Boolean).join(' · ')}</div></div>`).join('');
  const who=good?'Ivo':'Bailey',cat='🐾 '+(good?`${who}: Wszystko w planie! Należy się smaczek 😺`:`${who}: ${st.over.length?`${st.over.length} ${plu(st.over.length,'pozycja przekroczyła','pozycje przekroczyły','pozycji przekroczyło')} plan`:'Kilka wydatków było poza planem'} – zerknijcie razem, bez nerwów.`);
  const P={Mati:'Mati',Wercia:'Wercia','Wspólne':'Wspólne'};
  return`<!doctype html><html><body style="margin:0;background:#fdf6ee;${F};color:#1e293b">
<div style="max-width:560px;margin:0 auto;padding:18px">
 <div style="text-align:center;padding:8px 0 4px"><img src="${APP}icon-192.png" width="64" height="64" alt="" style="border-radius:16px"><div style="font-size:21px;font-weight:900;margin-top:6px">Podsumowanie: ${m}</div>
 <div style="color:${S};font-size:14px">${st.n} ${plu(st.n,'wpis','wpisy','wpisów')} w budżecie</div></div>
 ${box(cat,'',good?'#dcfce7':'#fef3c7')}
 ${st.notes.length?box('✨ Krótko',st.notes.map(t=>`<div style="padding:3px 0">• ${esc(t)}</div>`).join(''),'#eef2ff'):''}
 ${box('W liczbach',`<table style="width:100%;border-collapse:collapse;font-size:15px">${row('Przychody',zl(st.inc),G)}${row('Wydatki',zl(st.exp),R)}${row('Bilans',zl(st.bal),st.bal>=0?G:R)}${row('Odłożone (wpłaty na oszczędności i inwestycje)',(st.put>0?'+':'')+zl(st.put)+(st.rate!=null?` <span style="color:${S};font-weight:600">(${Math.round(st.rate)}% przychodów)</span>`:''),'#4338ca')}${st.gain?row('Inwestycje – zmiana kursów i wycen',(st.gain>0?'+':'')+zl(st.gain),st.gain>=0?G:R):''}</table>`)}
 ${prev||a3||ya?box('📊 Na tle innych miesięcy',cmpT):''}
 ${st.pexp||st.over.length||st.out.length?box('📋 Plan a rzeczywistość',`${st.pexp?`<div style="font-size:14px">Plan wydatków <b>${zl0(st.pexp)}</b> · wydane <b>${zl0(st.exp)}</b> · <b style="color:${st.exp>st.pexp?R:G}">${Math.round(st.exp/st.pexp*100)}% planu</b></div>${bar(st.exp,Math.max(st.exp,st.pexp),st.exp>st.pexp?'#fda4af':'#86efac')}`:''}
   ${st.over.length?`<div style="font-weight:800;margin-top:10px">▲ Przekroczone</div>${L(st.over,x=>`${esc(x.s.name)} <b style="color:${R}">+${zl0(x.a-x.p)}</b> <span style="color:${S}">(${zl0(x.a)} przy planie ${zl0(x.p)})</span>`,8)}`:''}
   ${st.out.length?`<div style="font-weight:800;margin-top:10px">⚠️ Poza planem</div>${L(st.out,x=>`${esc(x.s.name)} <b>${zl0(x.a)}</b>`)}`:''}
   ${st.fit.length?`<div style="margin-top:10px;font-size:14px">✅ Zmieściło się: <b>${st.fit.length}</b> ${plu(st.fit.length,'pozycja','pozycje','pozycji')}${st.left?` – zostało w nich ${zl0(st.left)}`:''}</div>`:''}`):''}
 ${st.cats.length?box('🧺 Na co poszło',catsT):''}
 ${st.up.length||st.down.length?box('↕️ Co się najbardziej zmieniło',`<div style="font-size:12px;color:${S};margin-bottom:4px">w porównaniu ze średnią z poprzednich miesięcy</div>${L(st.up,x=>`${esc(x.n)} <b style="color:${R}">+${zl0(x.d)}</b> <span style="color:${S}">(${zl0(x.v)}, zwykle ${zl0(x.avg)})</span>`,3)}${L(st.down,x=>`${esc(x.n)} <b style="color:${G}">−${zl0(-x.d)}</b> <span style="color:${S}">(${zl0(x.v)}, zwykle ${zl0(x.avg)})</span>`,3)}`):''}
 ${st.anom.length?box('🔎 Nietypowo dużo',L(st.anom,x=>`${esc(x.n)} <b style="color:${R}">${zl0(x.v)}</b> <span style="color:${S}">(zwykle ${zl0(x.avg)}, +${x.pct}%)</span>`),'#fff1f2'):''}
 ${st.big.length?box('💸 Największe pojedyncze wydatki',L(st.big,x=>`<b>${zl(x.v)}</b> · ${esc(x.n)}${x.note?` <span style="color:${S}">„${esc(x.note)}”</span>`:''} <span style="color:${S}">${dmy(x.d).slice(0,5)}</span>`)):''}
 ${st.shops.length?box('🏪 Gdzie wydajecie',L(st.shops,x=>`${esc(x.n)} <b>${zl0(x.v)}</b> <span style="color:${S}">· ${x.k} ${plu(x.k,'raz','razy','razy')}${x.k>1?`, średnio ${zl0(x.v/x.k)}`:''}</span>`)):''}
 ${box('📆 Rytm wydatków',`<div style="font-size:14px">Średnio <b>${zl0(st.avgDay)}</b> dziennie${st.dayMax?` · najdroższy dzień: <b>${st.dayMax.d} ${MNG[+st.ym.slice(5)-1]}</b> (${zl0(st.dayMax.v)})`:''}</div>${st.fixed&&st.exp?`<div style="font-size:14px;margin-top:6px">📌 Opłaty stałe: <b>${zl0(st.fixed)}</b> (${Math.round(st.fixed/st.exp*100)}% wydatków) · reszta <b>${zl0(st.exp-st.fixed)}</b></div>${bar(st.fixed,st.exp,'#b4a8f0')}`:''}`)}
 ${st.persons.some(p=>p.exp||p.put)?box('💑 Mati ↔ Wercia',`<div style="font-size:12px;color:${S};margin-bottom:4px">wydatki według tego, czyje było konto (z konta wspólnego = Wspólne)</div><table style="width:100%;border-collapse:collapse;font-size:14px"><tr><td></td><td style="text-align:right;color:${S};font-size:12px">wydatki</td><td style="text-align:right;color:${S};font-size:12px">odłożone</td></tr>${st.persons.map(p=>`<tr><td style="padding:4px 0">${P[p.o]}</td><td style="text-align:right;font-weight:800">${zl0(p.exp)}</td><td style="text-align:right;font-weight:800;color:#4338ca">${zl0(p.put)}</td></tr>`).join('')}</table>`,'#fdf2f8'):''}
 ${box('🐷 Oszczędności i majątek',`<table style="width:100%;border-collapse:collapse;font-size:14px">${st.target?row('Cel odkładania na miesiąc',`${zl0(st.put)} z ${zl0(st.target)} (${Math.max(0,Math.round(st.put/st.target*100))}%)`,st.put>=st.target?G:'#334155'):''}${row('Oszczędności i inwestycje',`${zl0(st.sav1)} <span style="color:${S};font-weight:600">(${st.sav1-st.sav0>=0?'+':'−'}${zl0(Math.abs(st.sav1-st.sav0))})</span>`)}${st.cushion!=null?row('Poduszka bezpieczeństwa',`${st.cushion.toFixed(1).replace('.',',')} mies. wydatków`,st.cushion<3?R:G):''}${row('Majątek na kontach (koniec miesiąca)',`${zl0(st.w1)} <span style="color:${S};font-weight:600">(${st.w1-st.w0>=0?'+':'−'}${zl0(Math.abs(st.w1-st.w0))})</span>`)}${st.owe?row('Do spłaty (pożyczki, kredyty)',zl0(st.owe),R):''}</table>
   ${st.goals.length?`<div style="font-weight:800;margin-top:10px">🎯 Cele</div>${st.goals.slice(0,6).map(g=>`<div style="margin:6px 0;font-size:14px"><div style="display:flex;justify-content:space-between"><span>${esc(g.n)} <span style="color:${S};font-size:12px">${P[g.o]||''}</span></span><b>${Math.floor(g.pct)}%</b></div>${bar(g.saved,g.target,'#f9a8d4')}<div style="font-size:12px;color:${S}">${zl0(g.saved)} z ${zl0(g.target)}</div></div>`).join('')}`:''}`,'#ecfeff')}
 ${box('🗓️ Na nowy miesiąc',`<div style="font-size:14px">📌 Opłaty stałe: <b>${zl0(st.fixedN)}</b>${st.planN?` · 📋 plan wydatków: <b>${zl0(st.planN)}</b>`:' · plan jeszcze nie jest wpisany'}</div>${st.yearsN.length?`<div style="font-size:14px;margin-top:6px">📅 Wydatki roczne do zapłaty: ${st.yearsN.map(x=>`${esc(x.n)} <b>${zl0(x.v)}</b>`).join(' · ')}</div>`:''}`,'#fefce8')}
 <div style="text-align:center;margin:18px 0"><a href="${APP}" style="display:inline-block;background:#a7f3d0;color:#065f46;font-weight:800;text-decoration:none;padding:12px 22px;border-radius:14px">Otwórz Budżet M&amp;W</a></div>
 <div style="text-align:center;color:#94a3b8;font-size:12px">Wysłał automat Budżetu M&amp;W · 1. dnia każdego miesiąca</div>
</div></body></html>`}
export function summaryText(st){const m=MN[+st.ym.slice(5)-1].toLowerCase()+' '+st.ym.slice(0,4),{prev,a3,ya}=st.cmp,c=(l,o)=>o?`\n${l}: wydatki ${zl0(o.exp)}, przychody ${zl0(o.inc)}`:'';
  return`Podsumowanie: ${m}\n\n${st.notes.map(t=>'• '+t).join('\n')}\n\nPrzychody: ${zl(st.inc)}\nWydatki: ${zl(st.exp)}\nBilans: ${zl(st.bal)}\nOdłożone: ${zl(st.put)}${c('Poprzedni miesiąc',prev)}${c(a3?`Średnio (${a3.n} mies.)`:'',a3)}${c('Rok temu',ya)}\n${st.over.length?'\nPrzekroczone: '+st.over.slice(0,5).map(x=>`${x.s.name} +${zl0(x.a-x.p)}`).join(', ')+'\n':''}${st.cats.length?'\nNa co poszło: '+st.cats.slice(0,5).map(x=>`${x.n} ${zl0(x.v)}`).join(', ')+'\n':''}\n${APP}`}
