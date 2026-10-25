/* Budżet M&W – 📊 analysis (extras, CSV, Money Wrapped) and the month / year analysis. Part of the former js/app.js (split into modules, same code). */
import {catsEmpty} from './art.js';
import {scene} from './cats.js';
import {isTreat,kotki} from './guide.js';
import {P_OTHER,C_INC,C_EXP,barsSvg,sankeySvg,chartBox,deltaH,donutSvg,gainSvg,hbarsH,legendH,lineSvg,pctS} from './charts.js';
import {OWN,OWN_COL,catHue,catMark} from './data.js';
import {anomalies,actuals,agg,balance,cleanCat,liveOf,subsMap,savFlow,savIds,planOf,yearSubs} from './logic.js';
import {$,MN,MNG,addMonths,daysIn,esc,ls,p2,sleep,td,zl,zl0,money,fxTxt} from './util.js';
import {S,catSlides,celebrate,toast,accCur,isP,accOwner,w} from './core.js';
import {norm,plu} from './sheet.js';
import {downloadBlob,txRowH} from './actions.js';
import {macro} from './savings.js';
import {projById} from './debts.js';
import {accN,render} from './app.js';

/* ---------- 📊 analysis extras: month summary, Mati ↔ Wercia, Sankey, wealth, 12 months, personal inflation, export, Wrapped ---------- */
export const anaFull=()=>ls.get('mw_anam')!='basic';
export function setAnaMode(k){ls.set('mw_anam',k);render()}
export function monthSumH(cfg,tx,ym){const act=actuals(cfg,tx,ym),pl=planOf(cfg,S.plans,tx,ym),L=cfg.cats.filter(c=>c.type=='exp').flatMap(c=>c.subs.map(s=>({s,p:pl[s.id]||0,a:act[s.id]||0}))).filter(x=>x.p||x.a);
  if(!L.length)return'';const fit=L.filter(x=>x.p&&x.a<=x.p),over=L.filter(x=>x.p&&x.a>x.p).sort((a,b)=>(b.a-b.p)-(a.a-a.p)),less=fit.filter(x=>x.a<=x.p*0.8).sort((a,b)=>(b.p-b.a)-(a.p-a.a)),out=L.filter(x=>!x.p&&x.a>0).sort((a,b)=>b.a-a.a);
  const saved=fit.reduce((a,x)=>a+x.p-x.a,0),lst=(X,f)=>X.slice(0,4).map(f).join(', ');
  const good=!over.length&&!out.length,who=good?'Ivo':'Bailey';
  return`<section class="chart msum"><div class="ct"><b>Podsumowanie miesiąca</b><span class="mini">${MN[+ym.slice(5)-1]} ${ym.slice(0,4)}</span></div>
    ${kotki.mode=='off'?'':`<div class="msk">${scene(good?'ivoHappy':'lupa','kot sm')}<span class="mini"><b>${who}:</b> ${good?'Wszystko w planie! Należy się smaczek 😺':over.length?`${over.length} ${plu(over.length,'pozycja przekroczyła','pozycje przekroczyły','pozycji przekroczyło')} plan. Zerknijmy razem, co się stało.`:'Kilka wydatków było poza planem – warto je dopisać do planu.'}</span></div>`}
    <div class="facts"><div>✅ Zmieściło się: <b>${fit.length}</b> ${plu(fit.length,'pozycja','pozycje','pozycji')}${saved?` · zostało ${zl0(saved)}`:''}</div>
    ${over.length?`<div>▲ Przekroczone: <b>${over.length}</b> – ${esc(lst(over,x=>x.s.name+' +'+zl0(x.a-x.p)))}</div>`:''}
    ${less.length?`<div>💚 Wyraźnie mniej niż plan: ${esc(lst(less,x=>x.s.name+' −'+zl0(x.p-x.a)))}</div>`:''}
    ${out.length?`<div>⚠️ Poza planem: ${esc(lst(out,x=>x.s.name+' '+zl0(x.a)))}</div>`:''}</div></section>`}
/* 💑 Mati ↔ Wercia: spending by whose account it came from (a shared account = Wspólne; „Kto” is only who typed it) and what each put aside */
export function personsH(cfg,tx,prefix){const sm=subsMap(cfg),per={},tot={};OWN.forEach(o=>{per[o]={};tot[o]=0});const ow={};cfg.accs.forEach(a=>ow[a.id]=accOwner(a));
  tx.filter(t=>t.date.startsWith(prefix)&&(t.type=='exp'||(t.type=='inc'&&t.refundOf))&&sm[t.sub]?.cat.type=='exp'&&accCur(t.acc)=='PLN').forEach(t=>{const c=sm[t.sub].cat,o=ow[t.acc]||'Wspólne',v=t.type=='exp'?t.amount:-t.amount;per[o][c.id]=(per[o][c.id]||0)+v;tot[o]+=v});
  if(!OWN.some(o=>tot[o]))return'';
  const put=o=>savFlow(cfg,tx,savIds(cfg,o),prefix).flow,sum=c=>OWN.reduce((a,o)=>a+(per[o][c.id]||0),0);
  const cats=cfg.cats.filter(c=>c.type=='exp'&&sum(c)>0).sort((a,b)=>sum(b)-sum(a)).slice(0,7),L={Mati:['Mati','odłożył'],Wercia:['Wercia 🌸','odłożyła'],'Wspólne':['Wspólne','odłożone']};
  return`<section class="chart"><div class="ct"><b>Mati ↔ Wercia</b><span class="mini">wydatki według tego, czyje było konto (z konta wspólnego = Wspólne)</span></div>
    <div class="kpis" style="gap:8px;grid-template-columns:repeat(3,minmax(0,1fr))">${OWN.map(o=>`<div class="kpi" style="background:${OWN_COL[o]}22"><div class="l">${L[o][0]}</div><div class="v num">${zl0(tot[o])}</div><div class="s">${L[o][1]} ${zl0(put(o))}</div></div>`).join('')}</div>
    ${cats.map(c=>{const t=sum(c);return`<div class="vs"><div class="r1 mini"><b style="color:var(--fg)">${esc(cleanCat(c.name))}</b><b class="num" style="color:var(--fg)">${zl0(t)}</b></div><div class="stack">${OWN.filter(o=>(per[o][c.id]||0)>0).map(o=>`<i style="width:${(per[o][c.id]/t*100).toFixed(1)}%;background:${OWN_COL[o]}" data-tip="${esc(cleanCat(c.name))} – ${o}: ${zl(per[o][c.id])}"></i>`).join('')}</div></div>`}).join('')}
    <div class="lg">${OWN.map(o=>`<span><i style="background:${OWN_COL[o]}"></i>${o}</span>`).join('')}</div><div class="tip mini">Dotknij paska, żeby zobaczyć kwotę.</div></section>`}
export function sankeyH(cfg,tx,ym,A){const act=actuals(cfg,tx,ym),cats=Object.fromEntries(cfg.cats.map(c=>[c.id,c]));
  const inc=cfg.cats.filter(c=>c.type=='inc').flatMap(c=>c.subs).map(s=>({l:s.name,v:act[s.id]||0})).filter(x=>x.v>0).sort((a,b)=>b.v-a.v);
  if(!inc.length||!A.exp)return'';const L=inc.slice(0,4);const rest=inc.slice(4).reduce((a,x)=>a+x.v,0);if(rest>0)L.push({l:'Inne przychody',v:rest});L.forEach((x,i)=>x.c=['#6fd0a8','#86efac','#a7f3d0','#bbf7d0','#d1fae5'][i]);
  const ex=Object.entries(A.cat).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]),R=ex.slice(0,5).map(([id,v])=>({l:cleanCat(cats[id]?.name),v,c:markOf(cats[id])}));
  const er=ex.slice(5).reduce((a,[,v])=>a+v,0);if(er>0)R.push({l:'Pozostałe',v:er,c:P_OTHER});
  const left=A.inc-A.exp;if(left>0)R.push({l:'Zostało',v:left,c:'#7fb0ec'});else if(left<0)L.push({l:'Z oszczędności',v:-left,c:'#fda4af'});
  return chartBox('Przepływ pieniędzy','skąd przyszły i dokąd poszły',sankeySvg(L,R))}
export function wealthH(y){const cur=td().slice(0,7),ms=Array.from({length:12},(_,i)=>y+'-'+p2(i+1)),tx=liveOf(S.tx),A=S.cfg.accs.filter(isP);
  const v=ms.map(m=>m>cur?null:A.reduce((x,a)=>x+balance(S.cfg,tx,a.id,m+'-32'),0));if(v.every(x=>x===null))return'';
  return chartBox('Majątek na kontach','wszystkie konta w złotych, na koniec miesiąca (bez zobowiązań)',lineSvg(['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'],v,'#a78bfa'))}
export function catGridH(cfg,M){const cats=cfg.cats.filter(c=>c.type=='exp'&&M.some(a=>(a.cat[c.id]||0)>0));if(!cats.length)return'';
  return`<section class="chart"><div class="ct"><b>Kategorie przez 12 miesięcy</b><span class="mini">im ciemniej, tym więcej w tym miesiącu</span></div><div class="cgrid">${cats.map(c=>{const vals=M.map(a=>Math.max(0,a.cat[c.id]||0)),mx=Math.max(1,...vals),col=markOf(c);
    return`<div class="cgl">${esc(cleanCat(c.name))}</div><div class="cgr">${vals.map((v,i)=>`<i style="background:${col};opacity:${v?(0.15+0.85*v/mx).toFixed(2):0.05}" data-tip="${esc(MN[i]+': '+zl(v))}" class="hit"></i>`).join('')}</div>`}).join('')}<div class="cgl"></div><div class="cgr cgm">${'SLMKMCLSWPLG'.split('').map(x=>`<span>${x}</span>`).join('')}</div></div></section>`}
export function inflationH(cfg,tx,y){const cur=td().slice(0,7),last=y<cur.slice(0,4)?12:+cur.slice(5),py=String(+y-1);
  const sum=(yy,id)=>{let s=0;for(let i=1;i<=last;i++){const a=agg(cfg,tx,yy+'-'+p2(i));s+=id?(a.cat[id]||0):a.exp}return s};
  const prevTot=sum(py);if(!prevTot)return`<section class="chart"><div class="ct"><b>📈 Wasza inflacja</b></div><div class="mini">Porównanie rok do roku pojawi się, gdy w aplikacji będą wydatki z ${py} roku.</div></section>`;
  const curTot=sum(y),your=(curTot/prevTot-1)*100,gus=macro().infl;
  const rows=cfg.cats.filter(c=>c.type=='exp').map(c=>({c,a:sum(y,c.id),b:sum(py,c.id)})).filter(x=>x.b>0&&x.a>0).map(x=>({...x,d:(x.a/x.b-1)*100})).sort((a,b)=>b.d-a.d);
  const f=x=>(x>=0?'+':'')+x.toFixed(1).replace('.',',')+'%';
  return`<section class="chart"><div class="ct"><b>📈 Wasza inflacja</b><span class="mini">${last==12?'cały rok':`styczeń–${MN[last-1].toLowerCase()}`} ${y} wobec ${py}</span></div>
    <div class="kpis" style="gap:8px"><div class="kpi k-ro"><div class="l">Wasze wydatki</div><div class="v num">${f(your)}</div><div class="s">${zl0(curTot)} wobec ${zl0(prevTot)}</div></div><div class="kpi k-sk"><div class="l">Inflacja GUS</div><div class="v num">${gus!=null?f(+gus):'—'}</div><div class="s">${gus!=null?(S.market?.rates?.inflPer?'automat, '+S.market.rates.inflPer:'wpisana ręcznie'):'wpisze ją automat'}</div></div></div>
    ${rows.slice(0,8).map(x=>`<div class="r1"><span>${esc(cleanCat(x.c.name))}</span><b class="num ${x.d>0?'t-exp':'t-inc'}">${x.d>0?'▲':'▼'} ${f(x.d)}</b></div>`).join('')}</section>`}
/* CSV for Excel: semicolons, decimal comma, UTF-8 with BOM */
export function exportCsv(y){const sm=subsMap(S.cfg),L=liveOf(S.tx).filter(t=>!y||t.date.startsWith(y)).sort((a,b)=>a.date.localeCompare(b.date));if(!L.length)return toast('Brak wpisów do eksportu','bad');
  const TY={exp:'wydatek',inc:'przychód',tr:'przelew',adj:'wyrównanie',inv:'zakup inwestycji',invs:'sprzedaż inwestycji',lend:'pożyczka'},q=v=>{const s=String(v??'');return/[;"\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s};
  const rows=[['Data','Rodzaj','Kwota','Waluta','Kategoria','Pozycja','Konto','Na konto','Kto','Notatka','Projekt'],...L.map(t=>{const s=sm[t.sub];
    return[t.date,t.refundOf?'zwrot':t.payoff?'spłata zobowiązania':TY[t.type]||t.type,((t.type=='exp'||t.type=='lend'||t.type=='inv'?-1:1)*t.amount/100).toFixed(2).replace('.',','),accCur(t.acc),s?cleanCat(s.cat.name):'',s?.name||'',accN(t.acc),t.to?accN(t.to):'',t.who||'',t.note||'',t.proj?projById(t.proj)?.name||'':'']})];
  downloadBlob(new Blob(['﻿'+rows.map(r=>r.map(q).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}),`budzet-${y||'wszystko'}.csv`);toast(`Pobrano ${L.length} ${plu(L.length,'wpis','wpisy','wpisów')} do Excela ✓`)}
/* 🎁 Money Wrapped: the year told by Bailey and Ivo */
export function wrapped(y){const tx=liveOf(S.tx),cfg=S.cfg,Y=agg(cfg,tx,y),sm=subsMap(cfg);if(!Y.exp&&!Y.inc)return toast('Brak danych za rok '+y,'bad');
  const cats=Object.entries(Y.cat).sort((a,b)=>b[1]-a[1]),top=cats[0]&&cfg.cats.find(c=>c.id==cats[0][0]),big=tx.filter(t=>t.date.startsWith(y)&&t.type=='exp'&&!t.payoff).sort((a,b)=>b.amount-a.amount)[0];
  const words={};tx.filter(t=>t.date.startsWith(y)&&t.type=='exp'&&!t.payoff&&t.note).forEach(t=>{const w=t.note.trim().split(/\s+/)[0].toLowerCase();if(w.length>2)words[w]=(words[w]||0)+1});
  const fav=Object.entries(words).sort((a,b)=>b[1]-a[1])[0],ms=Array.from({length:12},(_,i)=>({i,a:agg(cfg,tx,y+'-'+p2(i+1))})).filter(x=>x.a.inc||x.a.exp),best=ms.length?ms.reduce((p,c)=>c.a.inc-c.a.exp>p.a.inc-p.a.exp?c:p):null;
  const treats=tx.filter(t=>t.date.startsWith(y)&&t.type=='exp'&&isTreat(sm[t.sub]?.name)).reduce((a,t)=>a+t.amount,0),n=tx.filter(t=>t.date.startsWith(y)).length;
  const sd=savFlow(cfg,tx,savIds(cfg),y).flow;
  const sl=[{scene:'duo',title:`🎁 Wasz rok ${y}`,text:`Bailey i Ivo przejrzeli wszystkie ${n} wpisów. Gotowi?`},
    {scene:'calc',title:'Pieniądze w liczbach',text:`Wpłynęło ${zl0(Y.inc)}, wydaliście ${zl0(Y.exp)}. ${Y.inc>Y.exp?`Zostało ${zl0(Y.inc-Y.exp)} – brawo!`:'Wydatki były większe niż przychody – w przyszłym roku damy radę.'}`},
    ...(top?[{scene:'lupa',title:'Najwięcej poszło na…',text:`${cleanCat(top.name)}: ${zl0(cats[0][1])} (${pctS(cats[0][1],Y.exp)} wszystkich wydatków).`}]:[]),
    ...(big?[{scene:'grumpy',title:'Największy pojedynczy wydatek',text:`${zl(big.amount)} – ${sm[big.sub]?.name||''}${big.note?` („${big.note}”)`:''}, ${big.date.split('-').reverse().join('.')}. Ivo do dziś nie może uwierzyć.`}]:[]),
    ...(fav?[{scene:'wink',title:'Wasze ulubione miejsce',text:`„${fav[0]}” – w notatkach ${fav[1]} razy.`}]:[]),
    ...(best?[{scene:'happy',title:'Najlepszy miesiąc',text:`${MN[best.i]}: zostało ${zl0(best.a.inc-best.a.exp)}.`}]:[]),
    {scene:'coin',title:'Oszczędności',text:sd>0?`Na oszczędności i inwestycje odłożyliście ${zl0(sd)}. Moneta do monety!`:'W tym roku oszczędności nie urosły – nowy rok, nowa skarbonka.'},
    ...(treats?[{scene:'churu',title:'Smaczki 😺',text:`Na smaczki dla nas wydaliście ${zl0(treats)}. Uważamy, że to za mało, ale dziękujemy.`}]:[]),
    {scene:'celebrate',title:'Do zobaczenia w '+(+y+1)+'!',text:'Bailey pilnuje planu, Ivo pilnuje świętowania. Dobrego roku!'}];
  catSlides(sl,'Super!')}
/* ---------- analysis ---------- */
/* every category is drawn in its own colour (the same hue as on the Budget screen); "other" stays neutral grey */
export const markOf=c=>c?catMark(catHue(c,S.cfg.cats.indexOf(c))):P_OTHER;

/* spending and income in other currencies – not converted, so shown beside the charts */
export const fxNote=F=>{const e=fxTxt(F.exp),i=fxTxt(F.inc);return e||i?`<div class="note">🌍 W innych walutach (poza wykresami): ${e?`wydatki <b>${esc(e)}</b>`:''}${e&&i?' · ':''}${i?`przychody <b>${esc(i)}</b>`:''}</div>`:''};
/* 🏪 where the money goes: shops and places from the notes (Biedronka, Lidl, Glovo…), złoty expenses without fixed payments; colour = category used most there */
export function shopsH(cfg,tx,pre,when){const sm=subsMap(cfg),G={};
  for(const t of tx){if(t.type!='exp'||!t.date.startsWith(pre)||t.fixedId||t.debt||t.payoff||accCur(t.acc)!='PLN')continue;const raw=String(t.note||'').replace(/💱.*$/,'').trim();if(raw.length<2||/^[🪙↩]/u.test(raw))continue;
    const k=norm(raw).replace(/[.,!?;:"'„”()]/g,'').replace(/\s+/g,' ');if(!k)continue;const g=G[k]||(G[k]={v:0,n:0,names:{},subs:{}});g.v+=t.amount;g.n++;g.names[raw]=(g.names[raw]||0)+1;g.subs[t.sub]=(g.subs[t.sub]||0)+t.amount}
  const L=Object.values(G).filter(g=>g.v>0).sort((a,b)=>b.v-a.v);if(L.length<2)return'';const tot=L.reduce((a,g)=>a+g.v,0),top=(o)=>Object.entries(o).sort((a,b)=>b[1]-a[1])[0][0];
  const rows=L.slice(0,8).map(g=>{const c=markOf(sm[top(g.subs)]?.cat);return{l:top(g.names),v:g.v,c,dot:c,note:g.n>1?`${g.n} razy · średnio ${zl0(g.v/g.n)}`:'1 raz'}});
  const rest=L.slice(8).reduce((a,g)=>a+g.v,0);if(rest>0)rows.push({l:`Inne miejsca (${L.length-8})`,v:rest,c:P_OTHER,dot:P_OTHER});
  return chartBox('🏪 Gdzie wydajemy','sklepy i miejsca z notatek '+when+' (bez opłat stałych)',hbarsH(rows,tot))}
export function anaMonth(ctx){const{cfg,tx,ym}=ctx,sm=subsMap(cfg),cats=Object.fromEntries(cfg.cats.map(c=>[c.id,c]));
  const A=agg(cfg,tx,ym),Pm=agg(cfg,tx,addMonths(ym,-1)),pl=planOf(cfg,S.plans,tx,ym);
  const pexp=cfg.cats.filter(c=>c.type=='exp').reduce((a,c)=>a+c.subs.reduce((b,s)=>b+(pl[s.id]||0),0),0);
  const bal=A.inc-A.exp,pbal=Pm.inc-Pm.exp,rate=A.inc?bal/A.inc*100:null;
  const SV=savIds(cfg),put=savFlow(cfg,tx,SV,ym).flow,pput=savFlow(cfg,tx,SV,addMonths(ym,-1)).flow,prate=A.inc?put/A.inc*100:null,pprate=Pm.inc?pput/Pm.inc*100:null;
  const mName=MN[+ym.slice(5)-1].toLowerCase(),prevName=MN[+addMonths(ym,-1).slice(5)-1].toLowerCase();
  let h=`<div class="kpis">
    <div class="kpi k-em"><div class="l">Przychody</div><div class="v num">${zl(A.inc)}</div><div class="s">${deltaH(A.inc,Pm.inc,true)||'&nbsp;'}</div></div>
    <div class="kpi k-ro"><div class="l">Wydatki</div><div class="v num">${zl(A.exp)}</div><div class="s">${deltaH(A.exp,Pm.exp,false)||'&nbsp;'}</div></div>
    <div class="kpi k-sk"><div class="l">Bilans miesiąca</div><div class="v num">${zl(bal)}</div><div class="s">${deltaH(bal,pbal,true)||'&nbsp;'}</div></div>
    <div class="kpi k-in"><div class="l">Odłożone</div><div class="v num">${prate===null?'—':prate.toFixed(0)+'%'}</div><div class="s">${zl0(put)} z przychodów${pprate!==null&&prate!==null?` · ${prevName}: ${pprate.toFixed(0)}%`:''}<br>zostaje z przychodów: ${rate===null?'—':rate.toFixed(0)+'%'}</div></div></div>
    ${Pm.inc||Pm.exp?`<div class="mini" style="text-align:center">Strzałki porównują z miesiącem: ${prevName}.</div>`:''}`+fxNote(A.fx);
  const cur=td().slice(0,7);
  if(ym==cur&&pexp>0&&A.exp>pexp)h+=`<div class="note bad">⚠️ Plan wydatków przekroczony o <b>${zl(A.exp-pexp)}</b>.</div>`;
  h+=monthSumH(cfg,tx,ym);
  if(!A.exp&&!A.inc)return h+catsEmpty(`Brak przychodów i wydatków w miesiącu: ${mName}.`,0,'sleep');
  const an=anomalies(cfg,tx,ym);if(an.length)h+=`<section class="chart"><div class="ct"><b>🔎 Nietypowo dużo</b><span class="mini">w porównaniu ze średnią z 3 miesięcy</span></div>${an.slice(0,5).map(x=>`<div class="r1"><span>${esc(x.sub.name)}</span><b class="t-exp num" style="text-align:right">+${x.pct}% · ${zl0(x.v)}<span class="mini" style="display:block">(zwykle ${zl0(x.avg)})</span></b></div>`).join('')}</section>`;
  // structure donut
  const catRows=Object.entries(A.cat).filter(([,v])=>v>0).map(([id,v])=>({id,v,l:cleanCat(cats[id]?.name)})).sort((a,b)=>b.v-a.v);
  const top=catRows.slice(0,5),rest=catRows.slice(5).reduce((a,r)=>a+r.v,0);
  const segs=top.map(r=>({l:r.l,v:r.v,c:markOf(cats[r.id])}));if(rest>0)segs.push({l:'Pozostałe',v:rest,c:P_OTHER});
  if(segs.length){const tot=segs.reduce((a,x)=>a+x.v,0);
    h+=chartBox('Na co poszły pieniądze','wydatki według kategorii',`<div class="dwrap">${donutSvg(segs,zl0(tot),'wydatki')}${hbarsH(segs.map(x=>({l:x.l,v:x.v,c:x.c,dot:x.c})),tot)}</div>`)}
  if(!ctx.full)return h;
  h+=sankeyH(cfg,tx,ym,A)+personsH(cfg,tx,ym);
  // top subcategories
  const subRows=Object.entries(A.sub).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,7).map(([id,v])=>{const p=pl[id]||0;return{l:sm[id]?.name||'?',v,c:sm[id]?markOf(sm[id].cat):P_OTHER,note:p?`plan ${zl0(p)} · ${Math.round(v/p*100)}%${v>p?' <b class="t-exp">▲ ponad plan</b>':''}`:''}});
  if(subRows.length)h+=chartBox('Największe pozycje','top 7 pozycji budżetu',hbarsH(subRows,A.exp));
  // changes vs previous month
  const ch=cfg.cats.filter(c=>c.type=='exp').map(c=>({l:cleanCat(c.name),d:(A.cat[c.id]||0)-(Pm.cat[c.id]||0)})).filter(x=>Math.abs(x.d)>=100);
  const ups=ch.filter(x=>x.d>0).sort((a,b)=>b.d-a.d).slice(0,3),downs=ch.filter(x=>x.d<0).sort((a,b)=>a.d-b.d).slice(0,3);
  if(ups.length||downs.length)h+=`<section class="chart"><div class="ct"><b>Co się zmieniło</b><span class="mini">w porównaniu z: ${prevName}</span></div><div class="chg">
    <div><div class="mini" style="font-weight:800">Więcej niż ostatnio</div>${ups.map(x=>`<div class="r1"><span>${esc(x.l)}</span><b class="t-exp num">+${zl0(x.d)}</b></div>`).join('')||'<div class="mini">—</div>'}</div>
    <div><div class="mini" style="font-weight:800">Mniej niż ostatnio</div>${downs.map(x=>`<div class="r1"><span>${esc(x.l)}</span><b class="t-inc num">−${zl0(-x.d)}</b></div>`).join('')||'<div class="mini">—</div>'}</div></div></section>`;
  // daily spending
  const nd=daysIn(ym),days=Array.from({length:nd},(_,i)=>A.day[i+1]||0),active=days.filter(v=>v>0).length;
  const avgDay=A.exp/(ym==cur?Math.max(1,+td().slice(8)):nd);
  h+=chartBox('Wydatki dzień po dniu',`średnio ${zl0(avgDay)} dziennie · ${active} dni z wydatkami`,barsSvg(days.map((_,i)=>String(i+1)),[{name:'Wydatki',color:C_EXP,values:days}],{every:5,tipLabel:i=>(i+1)+' '+MNG[+ym.slice(5)-1]}));
  // who & accounts
  const wsum=Object.values(A.who).reduce((a,v)=>a+v,0);
  const accRows=Object.entries(A.acc).sort((a,b)=>b[1]-a[1]).map(([id,v])=>({l:accN(id),v,c:'#93c5fd'}));
  if(accRows.length)h+=chartBox('Z jakich kont','',hbarsH(accRows,wsum));
  // fixed vs variable
  if(A.fixed)h+=`<section class="chart"><div class="ct"><b>Opłaty stałe a reszta</b></div><div class="stack"><i style="width:${(A.fixed/wsum*100).toFixed(1)}%;background:#b4a8f0" data-tip="Opłaty stałe: ${zl(A.fixed)}"></i><i style="width:${((wsum-A.fixed)/wsum*100).toFixed(1)}%;background:${P_OTHER}" data-tip="Pozostałe wydatki: ${zl(wsum-A.fixed)}"></i></div>
    <div class="lg" style="margin-top:8px"><span><i style="background:#b4a8f0"></i>📌 Opłaty stałe: <b class="num">${zl(A.fixed)}</b> (${pctS(A.fixed,wsum)})</span><span><i style="background:${P_OTHER}"></i>Pozostałe: <b class="num">${zl(wsum-A.fixed)}</b> (${pctS(wsum-A.fixed,wsum)})</span></div></section>`;
  // biggest
  h+=shopsH(cfg,tx,ym,'w tym miesiącu');
  if(A.big.length)h+=`<section class="chart"><div class="ct"><b>Największe pojedyncze wydatki</b></div><div class="list" style="border:0">${A.big.map(t=>txRowH(t,sm)).join('')}</div></section>`;
  return h}

export const n0=v=>zl0(v).replace(/\s*zł$/,'');
/* 📊 plan and reality in a year: positions over the plan in most months (the plan is too small – or the spending too big) and positions far below it;
   only finished months (the running one is not over yet), from the first month with entries; 📅 yearly expenses are left out (their plan comes by itself) */
export function planVsH(cfg,tx,y,M){const cur=td().slice(0,7),ms=Array.from({length:12},(_,i)=>y+'-'+p2(i+1)),first=M.findIndex(a=>a.inc||a.exp);if(first<0)return'';
  const idx=ms.map((m,i)=>i).filter(i=>i>=first&&ms[i]<cur);if(idx.length<3)return'';
  const P=Object.fromEntries(idx.map(i=>[i,planOf(cfg,S.plans,tx,ms[i])])),YS=yearSubs(cfg),n=idx.length,over=[],under=[];
  for(const c of cfg.cats.filter(c=>c.type=='exp'))for(const s of c.subs){if(YS.has(s.id))continue;let o=0,u=0,np=0,sp=0,sa=0,na=0;
    for(const i of idx){const p=P[i][s.id]||0,a=M[i].sub[s.id]||0;sp+=p;sa+=a;if(p)np++;if(a>0)na++;if(a>p)o++;else if(p&&a<p*0.6)u++}
    if(!sa&&!sp)continue;const avgA=sa/n,avgP=np?sp/np:0;
    if(o>=Math.max(3,Math.ceil(n/2))&&sa-sp>=10000)over.push({s,o,avgA,avgP,np,d:sa-sp,sug:Math.ceil(avgA/1000)*1000});
    else if(np>=3&&na>=Math.ceil(np/2)&&u>=Math.max(3,Math.ceil(np*0.7))&&sp-sa>=10000)under.push({s,u,np,avgA,avgP,d:sp-sa,sug:Math.max(0,Math.ceil(avgA/1000)*1000)})}
  if(!over.length&&!under.length)return chartBox('Plan a rzeczywistość',`${n} ${plu(n,'miesiąc','miesiące','miesięcy')} ${y}`,'<div class="mini">💚 Żadna pozycja nie przekracza planu regularnie – plan pasuje do Waszych wydatków.</div>');
  const nm=MNG[+addMonths(cur,1).slice(5)-1],btn=x=>x.sug>0&&x.sug!=Math.round(x.avgP)?`<button class="chip" onclick="fixPlan('${x.s.id}',${x.sug})">Ustaw ${zl0(x.sug)} od ${nm}</button>`:'';
  over.sort((a,b)=>b.d-a.d);under.sort((a,b)=>b.d-a.d);
  return`<section class="chart"><div class="ct"><b>Plan a rzeczywistość</b><span class="mini">${n} ${plu(n,'zakończony miesiąc','zakończone miesiące','zakończonych miesięcy')} ${y} · bez wydatków rocznych</span></div>
    ${over.length?`<div class="mini" style="font-weight:800">▲ Często ponad plan – może plan jest za mały?</div>${over.slice(0,6).map(x=>`<div class="pvr"><div class="r1"><b>${esc(x.s.name)}</b><span class="pill over">${x.o} z ${n} mies.</span></div><div class="mini">średnio wydajecie ${zl0(x.avgA)}/mies.${x.np?` przy planie ok. ${zl0(x.avgP)}`:' – bez planu'}</div>${btn(x)}</div>`).join('')}`:''}
    ${under.length?`<div class="mini" style="font-weight:800;margin-top:6px">💚 Wyraźnie mniej niż plan – można go zmniejszyć</div>${under.slice(0,4).map(x=>`<div class="pvr"><div class="r1"><b>${esc(x.s.name)}</b><span class="pill ok">${x.u} z ${x.np} mies.</span></div><div class="mini">plan ok. ${zl0(x.avgP)}, wydajecie średnio ${zl0(x.avgA)}/mies.</div>${btn(x)}</div>`).join('')}`:''}
    <div class="mini">Przycisk zmienia tylko plan na kolejne miesiące – wcześniejsze zostają bez zmian.</div></section>`}
export function anaYear(ctx){const{cfg,tx,ym,savAt}=ctx,y=ym.slice(0,4),cats=Object.fromEntries(cfg.cats.map(c=>[c.id,c]));
  const cur=td().slice(0,7),months=Array.from({length:12},(_,i)=>y+'-'+p2(i+1));
  const M=months.map(m=>agg(cfg,tx,m)),Y=agg(cfg,tx,y),PY=agg(cfg,tx,String(+y-1));
  const elapsed=y<cur.slice(0,4)?12:y==cur.slice(0,4)?+cur.slice(5):0;
  /* averages count months from the first one with entries (a budget started in July must not be divided by 10 months) */
  const first=M.findIndex(a=>a.inc||a.exp),nMon=first<0?0:Math.max(1,elapsed-first);
  const fxN=fxNote(Y.fx),bal=Y.inc-Y.exp,rate=Y.inc?bal/Y.inc*100:null,SV=savIds(cfg),yF=savFlow(cfg,tx,SV,y),prate=Y.inc?yF.flow/Y.inc*100:null,avgExp=nMon?Y.exp/nMon:0,avgInc=nMon?Y.inc/nMon:0,hasPY=!!(PY.inc||PY.exp);
  let h=`<div class="kpis">
    <div class="kpi k-em"><div class="l">Przychody ${y}</div><div class="v num">${zl(Y.inc)}</div><div class="s">śr. ${zl0(avgInc)}/mies. ${deltaH(Y.inc,PY.inc,true)}</div></div>
    <div class="kpi k-ro"><div class="l">Wydatki ${y}</div><div class="v num">${zl(Y.exp)}</div><div class="s">śr. ${zl0(avgExp)}/mies. ${deltaH(Y.exp,PY.exp,false)}</div></div>
    <div class="kpi k-sk"><div class="l">Zostało w roku</div><div class="v num">${zl(bal)}</div><div class="s">${nMon?`śr. ${zl0(bal/nMon)}/mies. `:''}${deltaH(bal,PY.inc-PY.exp,true)||(nMon?'':'&nbsp;')}</div></div>
    <div class="kpi k-in"><div class="l">Odłożone</div><div class="v num">${prate===null?'—':prate.toFixed(0)+'%'}</div><div class="s">${zl0(yF.flow)} z przychodów w roku<br>zostaje z przychodów: ${rate===null?'—':rate.toFixed(0)+'%'}</div></div></div>
    ${hasPY?`<div class="mini" style="text-align:center">Strzałki porównują z rokiem ${+y-1}.</div>`:''}`+fxN+`<div class="g2"><button class="btn" onclick="exportCsv('${y}')">📥 Eksport do Excela</button><button class="btn primary" onclick="wrapped('${y}')">🎁 Money Wrapped</button></div>`;
  if(!Y.inc&&!Y.exp)return h+`<div class="empty">Brak danych za rok ${y}.</div>`;
  const ml=['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];
  h+=chartBox('Przychody i wydatki','miesiąc po miesiącu',barsSvg(ml,[{name:'Przychody',color:C_INC,values:M.map(a=>Math.max(0,a.inc))},{name:'Wydatki',color:C_EXP,values:M.map(a=>Math.max(0,a.exp))}],{tipLabel:i=>MN[i]}),legendH([{l:'Przychody',c:C_INC},{l:'Wydatki',c:C_EXP}]));
  h+=planVsH(cfg,tx,y,M);
  if(!ctx.full){const cr=Object.entries(Y.cat).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([id,v])=>({l:cleanCat(cats[id]?.name),v,c:markOf(cats[id]),dot:markOf(cats[id])}));return h+(cr.length?chartBox('Kategorie w całym roku','',hbarsH(cr,Y.exp)):'')}
  {const n=y<cur.slice(0,4)?12:elapsed,v0=savAt(y+'-01-01');let paid=v0;const pts=[{d:y+'-01-01',paid:v0,value:v0}];
    for(let i=0;i<n;i++){const m=months[i];paid+=savFlow(cfg,tx,SV,m).flow;pts.push({d:m+'-'+p2(daysIn(m)),paid,value:savAt(m+'-32')})}
    if(n&&pts.some(p=>p.value||p.paid))h+=chartBox('Oszczędności i inwestycje',`przerywana – stan z 1 stycznia + odłożone · fioletowa – wartość${yF.gain?` · różnica to zmiana kursów (${yF.gain>0?'+':'−'}${zl0(Math.abs(yF.gain))})`:''}`,gainSvg(pts))}
  h+=wealthH(y)+catGridH(cfg,M)+inflationH(cfg,tx,y);
  // months table
  h+=`<section class="chart"><div class="ct"><b>Miesiąc po miesiącu</b><span class="mini">kwoty w zł</span></div><div class="tw"><table class="tbl"><thead><tr><th><span class="mf">Miesiąc</span><span class="msh">Mies.</span></th><th>Przychody</th><th>Wydatki</th><th>Bilans</th></tr></thead><tbody>${M.map((a,i)=>a.inc||a.exp?`<tr><td><span class="mf">${MN[i]}</span><span class="msh">${MN[i].slice(0,3)}</span></td><td class="num">${n0(a.inc)}</td><td class="num">${n0(a.exp)}</td><td class="num ${a.inc-a.exp<0?'t-exp':'t-inc'}">${n0(a.inc-a.exp)}</td></tr>`:'').join('')}<tr class="tot"><td>Razem</td><td class="num">${n0(Y.inc)}</td><td class="num">${n0(Y.exp)}</td><td class="num">${n0(bal)}</td></tr></tbody></table></div></section>`;
  // best / worst
  const withData=M.map((a,i)=>({i,a})).filter(x=>x.a.inc||x.a.exp);
  if(withData.length>1){const best=withData.reduce((p,c)=>c.a.inc-c.a.exp>p.a.inc-p.a.exp?c:p),most=withData.reduce((p,c)=>c.a.exp>p.a.exp?c:p),least=withData.reduce((p,c)=>c.a.exp<p.a.exp?c:p);
    h+=`<section class="chart"><div class="ct"><b>Najciekawsze miesiące</b></div><div class="facts">
      <div>🏆 Najwięcej zostało: <b>${MN[best.i]}</b> (${zl0(best.a.inc-best.a.exp)})</div>
      <div>💸 Najwięcej wydatków: <b>${MN[most.i]}</b> (${zl0(most.a.exp)})</div>
      <div>🌿 Najmniej wydatków: <b>${MN[least.i]}</b> (${zl0(least.a.exp)})</div></div></section>`}
  // categories in the year
  const catRows=Object.entries(Y.cat).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([id,v])=>({l:cleanCat(cats[id]?.name),v,c:markOf(cats[id]),dot:markOf(cats[id]),note:`średnio ${zl0(nMon?v/nMon:v)} / mies.`}));
  if(catRows.length)h+=chartBox('Kategorie w całym roku','suma, udział i średnia miesięczna',hbarsH(catRows,Y.exp));
  h+=shopsH(cfg,tx,y,'w całym roku');
  const wsum=Object.values(Y.who).reduce((a,v)=>a+v,0);
  h+=personsH(cfg,tx,y);
  if(Y.fixed)h+=`<div class="note">📌 Opłaty stałe w ${y}: <b>${zl(Y.fixed)}</b>, czyli ${pctS(Y.fixed,wsum)} wszystkich wydatków.</div>`;
  return h}