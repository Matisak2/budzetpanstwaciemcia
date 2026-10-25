/* Budżet M&W – 🔻🔺 liabilities and receivables, planning, 🏷️ projects, 🔔 reminders, 💧 cascade. Part of the former js/app.js (split into modules, same code). */
import {doc,updateDoc,deleteField} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {catsEmpty} from './art.js';
import {PAL,C_EXP,barsSvg,chartBox,hbarsH} from './charts.js';
import {OWN} from './data.js';
import {addM,position,limitOf,paidInYear,wrapOf} from './inv.js';
import {closeWinP,debtStateP,nextCloseP,rataP,remStateP,salaryTxP,savedP} from './today.js';
import {avgActuals,actuals,carStats,balance,cleanCat,fixedDate,liveOf,status,subsMap,planOf,yearSubs} from './logic.js';
import {$,MN,addDays,esc,f2,isDate,pnum,rid,td,zl,zl0} from './util.js';
import {S,toast,ask,isP,am,accOwner,accOpts,subOpts,H,DEBTS,PLC,w,merge,strip,putTx,guard} from './core.js';
import {plu,calcAmt,P,openTx} from './sheet.js';
import {fixedPaid,isPod,txRowH} from './actions.js';
import {gr,segL} from './salary.js';
import {accById,pn,newYear} from './savings.js';
import {accN,render} from './app.js';

/* ---------- 🔻 liabilities (we owe) and 🔺 receivables (owed to us), in 👛 Konta ---------- */
export const DKIND={owe:[['hip','🏠 Kredyt hipoteczny'],['got','💳 Kredyt gotówkowy'],['auto','🚗 Kredyt samochodowy'],['raty','🧾 Raty 0%'],['karta','💳 Karta kredytowa'],['bnpl','🛍️ Odroczone płatności (np. Allegro Pay)'],['leasing','📄 Leasing'],['rodz','👪 Pożyczka od rodziny / znajomych'],['inne','📌 Inne']],
  lent:[['rodz','👪 Rodzina'],['znaj','🤝 Znajomi'],['inne','📌 Inne']]};
export const dIcon=d=>(DKIND[d.dir].find(k=>k[0]==d.kind)?.[1]||'📌').split(' ')[0];
export const dById=id=>S.debts[id]&&{id,...S.debts[id]};
export const debtList=dir=>Object.entries(S.debts).filter(([,d])=>!d.deleted&&(!dir||d.dir==dir)).map(([id,d])=>({id,...d}));
/* what is left: bank loans – the last amount typed from the bank; otherwise the start minus linked payments / repayments */
export function debtState(d){return debtStateP(d,liveOf(S.tx),td())}
export const debtSum=(dir,owner)=>debtList(dir).filter(d=>!owner||(d.payer||'Wspólne')==owner).reduce((a,d)=>a+debtState(d).left,0);
export function setAccView(k){S.accView=k;S.recon=false;window.scrollTo(0,0);render()}
export const accSegH=()=>`<div class="seg seg3">${[['acc','🏦 Salda'],['owe','🔻 My winni'],['lent','🔺 Nam winni']].map(([k,l])=>`<button aria-pressed="${(S.accView||'acc')==k}" onclick="setAccView('${k}')">${segL(l)}</button>`).join('')}</div>`;
export function debtsH(dir){const L=debtList(dir).map(d=>({d,st:debtState(d)})),act=L.filter(x=>x.st.left>0),done=L.filter(x=>x.st.left<=0),owe=dir=='owe';let h='';
  const tot=act.reduce((a,x)=>a+x.st.left,0);
  if(L.length)h+=`<div class="worth ${owe?'':'wsp'}"><div class="l">${owe?'Razem do spłaty':'Razem do oddania Wam'}</div><div class="v num">${zl(tot)}</div><div class="s">${OWN.map(o=>`${o} ${zl0(act.filter(x=>(x.d.payer||'Wspólne')==o).reduce((a,x)=>a+x.st.left,0))}`).join(' · ')} · w 👛 Konta widać to osobno – stan kont się nie zmienia</div></div>`;
  if(!owe){const sid=S.cfg.cats.flatMap(c=>c.subs).find(s=>/udzielone pożyczki/i.test(s.name))?.id,old=sid?liveOf(S.tx).filter(t=>t.type=='exp'&&t.sub===sid):[];
    if(old.length)h+=`<div class="note">💡 W pozycji „Udzielone pożyczki” jest ${old.length} ${plu(old.length,'wydatek','wydatki','wydatków')} (${zl(old.reduce((a,t)=>a+t.amount,0))}). Pożyczka to nie wydatek – ktoś Wam ją odda. <button class="btn sm primary" onclick="moveLent()">Przenieś do należności</button></div>`}
  h+=`<button class="btn dark" onclick="editDebt(null,'${dir}')">+ ${owe?'Dodaj zobowiązanie':'Pożyczyliśmy komuś'}</button>`;
  if(!L.length)h+=catsEmpty(owe?'Dodaj kredyt, raty albo pożyczkę. Raty w Budżecie zostają wydatkami, a tu zobaczysz, ile jeszcze zostało.':'Zapisz, komu pożyczyliście pieniądze i do kiedy ma oddać. Przypomnę o terminie.',1,'envelope');
  const tx=liveOf(S.tx),svH=(d,st)=>{if(!owe||!d.saveAcc||!st.left)return'';const sv=savedP(d.id,tx),pc=Math.min(100,sv/st.left*100);
    return`<div class="dsave"><div class="r1"><span>💰 Odłożone na „${esc(accN(d.saveAcc))}”</span><b class="num">${zl(sv)}</b></div><div class="gbar"><i style="width:${Math.max(0,pc).toFixed(1)}%"></i></div><div class="mini">${sv>=st.left?'✓ Uzbierane – możesz spłacić całość':`${Math.floor(Math.max(0,pc))}% · brakuje ${zl(st.left-sv)}`}</div></div>`};
  const raH=ra=>ra?`<div class="mini">🔻 ${ra.paid?'✓ w tym miesiącu zapłacona · następna rata':'rata w tym miesiącu'}: ok. <b>${zl(ra.amt)}</b>${ra.int?` (kapitał ${zl(ra.cap)} · odsetki ${zl(ra.int)})`:''}${ra.never?' · <b class="t-exp">⚠️ rata nie pokrywa odsetek</b>':ra.end?` · koniec: ${MN[+ra.end.slice(5)-1].toLowerCase()} ${ra.end.slice(0,4)}`:''}${ra.intAll?` · odsetki do końca ok. ${zl0(ra.intAll)}`:''}</div>`:'';
  const card=({d,st})=>{const ra=owe?rataP(d,tx,td()):null;return`<div class="debt${st.late?' late':''}"><div class="r1"><b>${dIcon(d)} ${esc(d.name)}</b><b class="num">${zl(st.left)}</b></div>
    <div class="mini">${esc(d.party||'')}${d.party?' · ':''}${owe?'spłaca':'pieniądze'}: ${esc(d.payer||'Wspólne')}${d.inst?` · rata ${zl(d.inst)}${d.day?` do ${d.day}.`:''}`:''}${d.rate?` · ${esc(String(d.rate).replace('.',','))}%${d.rtype=='var'?' zmienne':' stałe'}`:''}</div>
    <div class="gbar"><i style="width:${st.pc.toFixed(1)}%"></i></div>
    <div class="mini">${owe?'spłacono':'oddano'} ${zl((d.start||0)-st.left)} z ${zl(d.start||0)} (${Math.round(st.pc)}%)${st.left?(owe?(!ra&&st.end?` · szacowany koniec: ${MN[+st.end.slice(5)-1].toLowerCase()} ${st.end.slice(0,4)}`:d.until&&!ra?.end?` · do ${d.until.split('-').reverse().join('.')}`:''):(d.until?` · termin zwrotu ${d.until.split('-').reverse().join('.')}`:'')):' · ✓ '+(owe?'spłacone':'oddane')}${d.mode=='bank'&&st.src!='auto'?` · wg banku z ${st.src.split('-').reverse().join('.')}`:''}</div>
    ${raH(ra)}${svH(d,st)}${st.late?'<div class="mini t-exp"><b>⚠️ Termin zwrotu minął</b></div>':''}${d.note?`<div class="mini">📝 ${esc(d.note)}</div>`:''}
    <div class="btns" style="gap:6px;margin-top:4px">${st.left?(owe?`<button class="chip" onclick="openTx(null,{type:'exp',debt:'${d.id}'})">+ Rata</button>${d.saveAcc?`<button class="chip sv" onclick="openTx(null,{type:'tr',to:'${d.saveAcc}',saveFor:'${d.id}'})">💰 Odłóż</button>${savedP(d.id,tx)>0?`<button class="chip" onclick="openTx(null,{type:'tr',from:'${d.saveAcc}',saveFor:'${d.id}'})">↑ Weź z odłożonych</button>`:''}`:''}<button class="chip" onclick="payoffDebt('${d.id}')">✅ Spłać całość</button>${d.mode=='bank'?`<button class="chip" onclick="setDebtLeft('${d.id}')">✎ Pozostało</button>`:''}`:`<button class="chip" onclick="lentBack('${d.id}')">↩️ Zwrot</button>`):''}<button class="chip" onclick="editDebt('${d.id}')">Edytuj</button></div></div>`}
  h+=act.map(card).join('');
  if(done.length)h+=`<div class="h2">${owe?'Spłacone':'Oddane'}</div>`+done.map(card).join('');
  return h}
export async function editDebt(id,dir){if(guard())return;const d0=id?S.debts[id]:null;dir=d0?.dir||dir;const owe=dir=='owe';
  const f=[{id:'k',label:'Rodzaj',type:'select',value:d0?.kind||(owe?'got':'rodz'),options:DKIND[dir]},
    {id:'n',label:'Nazwa',value:d0?.name||'',ph:owe?'np. Kredyt na mieszkanie':'np. Pożyczka dla Kasi'},
    {id:'p',label:owe?'Od kogo (bank, osoba)':'Komu',value:d0?.party||''},
    {id:'w',label:owe?'Kto spłaca':'Czyje pieniądze',type:'select',value:d0?.payer||'Wspólne',options:[['Mati','Mati'],['Wercia','Wercia'],['Wspólne','Wspólne']]},
    {id:'a',label:owe?'Kwota na start (zł)':'Ile pożyczyliście (zł)',type:'decimal',value:d0?f2(d0.start):''},
    {id:'d',label:'Data',type:'date',value:d0?.date||td()}];
  if(owe)f.push({id:'m',label:'Jak liczyć, ile zostało',type:'select',value:d0?.mode||'auto',options:[['bank','Kredyt w banku – wpisuję „pozostało” z aplikacji banku'],['auto','Sama odejmuj spłaty (np. pożyczka prywatna, raty 0%)']]},
    {id:'i',label:'Rata miesięczna (zł, zwykle)',type:'decimal',value:d0?.inst?f2(d0.inst):''},{id:'dy',label:'Dzień raty (1–31)',type:'int',value:d0?.day||''},
    {id:'r',label:'Oprocentowanie nominalne (%, nie RRSO)',type:'decimal',value:d0?.rate!=null?String(d0.rate).replace('.',','):''},{id:'rt',label:'Oprocentowanie',type:'select',value:d0?.rtype||'fix',options:[['fix','Stałe'],['var','Zmienne (np. WIBOR / WIRON + marża)']]},
    {id:'am',label:'Raty',type:'select',value:d0?.amort||'eq',options:[['eq','Równe (co miesiąc ta sama rata)'],['dec','Malejące']]},
    {id:'sa',label:'💰 Zbieram na spłatę całości na koncie',type:'select',value:d0?.saveAcc||'',options:[['','— nie zbieram —'],...accOpts()]});
  f.push({id:'u',label:owe?'Do kiedy (ostatnia rata)':'Termin zwrotu',type:'date',value:d0?.until||''},{id:'t',label:'Warunki, notatki',value:d0?.note||''});
  if(!d0)f.push({id:'c',label:owe?'Pieniądze wpłynęły na konto':'Pieniądze wyszły z konta',type:'select',value:'',options:[['','— nie zapisuj ruchu na koncie —'],...accOpts()]});
  const r=await ask({title:d0?(owe?'Zobowiązanie':'Należność'):(owe?'Nowe zobowiązanie':'Pożyczyliśmy komuś'),fields:f,ok:d0?'Zapisz':'Dodaj',alt:d0?'Usuń':null});
  if(!r)return;if(r=='alt'){if(!await ask({title:'Usunąć?',text:d0.name+'\nWpisy w rejestrze zostaną.',ok:'Usuń',danger:true}))return;merge(doc(DEBTS(),id),{deleted:true});return toast('Usunięto')}
  const start=gr(r.a);if(!r.n.trim()||start<=0)return toast('Podaj nazwę i kwotę','bad');if(!isDate(r.d))return toast('Wybierz datę','bad');
  const body={dir,kind:r.k,name:r.n.trim(),party:r.p.trim(),payer:r.w,start,date:r.d,until:isDate(r.u)?r.u:'',note:r.t.trim(),deleted:false,ts:Date.now()};
  if(owe){body.mode=r.m;body.inst=gr(r.i);body.day=Math.round(pnum(r.dy))||0;body.rate=r.r.trim()?pn(r.r):null;body.rtype=r.rt;body.amort=r.am;body.saveAcc=r.sa||''}
  const did=id||'d'+rid();merge(doc(DEBTS(),did),body);
  if(!d0&&r.c){const ym=r.d.slice(0,7);putTx(ym,'t'+rid(),owe?{type:'inc',amount:start,date:r.d,sub:'',acc:r.c,to:'',who:S.who,note:'🔻 Pożyczka od '+(body.party||body.name),debtIn:did,deleted:false,ts:Date.now()}
    :{type:'lend',amount:start,date:r.d,sub:'',acc:r.c,to:'',who:S.who,note:'🔺 Pożyczka dla '+(body.party||body.name),lendId:did,deleted:false,ts:Date.now()})}
  toast(d0?'Zapisano':owe?'Dodano zobowiązanie':'Zapisano pożyczkę')}
/* ✅ paying off at once: the principal goes back to the lender and is not a budget expense (the loan was not income either) –
   only interest and fees count, on a position of their own; what was put aside for this liability is used up first */
export async function payoffDebt(id){if(guard())return;const d=dById(id);if(!d)return;const st=debtState(d),saved=d.saveAcc?savedP(id,liveOf(S.tx)):0;
  const est=+d.rate>0&&st.left?Math.round(st.left*d.rate/1200):0,subs=S.cfg.cats.filter(c=>c.type=='exp').flatMap(c=>c.subs),isub=(subs.find(s=>/odsetk/i.test(s.name))||subs.find(s=>/kredyt|pożycz|raty|opłaty bank/i.test(s.name)))?.id||d.sub||'';
  const r=await ask({title:'✅ Spłata całości: '+d.name,text:`Spłata kapitału nie liczy się w Budżecie – oddajesz pożyczone pieniądze. Do Budżetu trafią tylko odsetki i opłaty.${saved>0?`\n💰 Odłożone: ${zl(saved)} na „${accN(d.saveAcc)}”.`:''}${est?`\nPrzy ${String(d.rate).replace('.',',')}% odsetki za miesiąc od ${zl(st.left)} to ok. ${zl(est)} – dokładną kwotę poda bank.`:''}`,
    fields:[{id:'a',label:'Spłacony kapitał (zł)',type:'decimal',value:f2(st.left)},{id:'i',label:'Odsetki i opłaty (zł, z banku)',type:'decimal',value:'',ph:'0,00'},
      {id:'s',label:'Pozycja na odsetki',type:'select',value:isub,options:[['','— wybierz —'],...subOpts('exp')]},
      {id:'c',label:'Z konta',type:'select',value:d.saveAcc||S.cfg.accs.find(a=>a.grp=='cur'&&!a.archived&&accOwner(a)==S.who)?.id||'',options:accOpts()},{id:'d',label:'Data',type:'date',value:td()}],ok:'Zapisz spłatę'});
  if(!r)return;const P=gr(r.a),I=gr(r.i);if(P<=0)return toast('Podaj spłacony kapitał','bad');if(I<0)return toast('Odsetki nie mogą być ujemne','bad');if(!isDate(r.d))return toast('Wybierz datę','bad');if(I&&!r.s)return toast('Wybierz pozycję na odsetki','bad');
  const full=P>=st.left,here=r.c==d.saveAcc,use=Math.max(0,full?saved:here?Math.min(saved,P+I):0),ui=here?Math.min(I,use):0,up=use-ui;
  const ym=r.d.slice(0,7),pid='t'+rid(),who=d.payer=='Mati'||d.payer=='Wercia'?d.payer:S.who,base={date:r.d,acc:r.c,to:'',who,deleted:false,ts:Date.now()};
  if(!await putTx(ym,pid,{...base,type:'exp',amount:P,sub:'',note:'Spłata całości: '+d.name,debt:id,payoff:true,...(up?{save:{[id]:-up}}:{})}))return;
  if(I)putTx(ym,'t'+rid(),{...base,type:'exp',amount:I,sub:r.s,note:'💸 Odsetki od spłaty pożyczki: '+d.name,debtInt:id,payOf:pid,...(ui?{save:{[id]:-ui}}:{})});
  if(d.mode=='bank')merge(doc(DEBTS(),id),{left:{[r.d]:Math.max(0,st.left-P)}});
  toast(full?'Pożyczka spłacona w całości 🎉'+(saved>P+I&&saved?` · ${zl(saved-P-I)} z odłożonych jest teraz wolne`:''):'Zapisano spłatę '+zl(P))}
export async function setDebtLeft(id){if(guard())return;const d=dById(id);if(!d)return;const st=debtState(d);
  const r=await ask({title:'Pozostało do spłaty: '+d.name,text:'Wpisz kwotę z aplikacji banku (kapitał do spłaty).',fields:[{id:'a',label:'Pozostało (zł)',type:'decimal',value:f2(st.left)},{id:'d',label:'Stan na dzień',type:'date',value:td()}]});
  if(!r)return;if(!isDate(r.d))return toast('Wybierz datę','bad');merge(doc(DEBTS(),id),{left:{[r.d]:gr(r.a)}});toast('Zapisano')}
export async function lentBack(id){if(guard())return;const d=dById(id);if(!d)return;const st=debtState(d);
  const r=await ask({title:'↩️ Zwrot: '+d.name,fields:[{id:'a',label:'Ile oddano (zł)',type:'decimal',value:f2(st.left)},{id:'d',label:'Data',type:'date',value:td()},{id:'c',label:'Na konto',type:'select',value:S.cfg.accs.find(a=>a.grp=='cur'&&accOwner(a)==S.who)?.id||'',options:accOpts()}]});
  if(!r)return;const amt=gr(r.a);if(amt<=0||!isDate(r.d))return toast('Podaj kwotę i datę','bad');if(amt>st.left)return toast('Zwrot może wynieść najwyżej '+zl(st.left),'bad');
  if(await putTx(r.d.slice(0,7),'t'+rid(),{type:'inc',amount:amt,date:r.d,sub:'',acc:r.c,to:'',who:S.who,note:'🔺 Zwrot pożyczki: '+(d.party||d.name),lendOf:id,deleted:false,ts:Date.now()}))toast(amt>=st.left?'Pożyczka oddana w całości 🎉':'Zapisano zwrot '+zl(amt))}
/* earlier "Udzielone pożyczki" expenses become receivables (the entries stay, only their type changes) */
export async function moveLent(){if(guard())return;const sid=S.cfg.cats.flatMap(c=>c.subs).find(s=>/udzielone pożyczki/i.test(s.name))?.id,old=liveOf(S.tx).filter(t=>t.type=='exp'&&t.sub===sid);if(!old.length)return;
  if(!await ask({title:'Przenieść do należności?',text:`${old.length} ${plu(old.length,'wpis','wpisy','wpisów')} przestanie liczyć się jako wydatek. Każdy stanie się pożyczką, którą można oznaczyć jako oddaną. Saldo kont się nie zmieni.`,ok:'Przenieś'}))return;
  for(const t of old){const did='d'+rid();merge(doc(DEBTS(),did),{dir:'lent',kind:'inne',name:t.note||'Pożyczka',party:t.note||'',payer:t.who||'Wspólne',start:t.amount,date:t.date,until:'',note:'przeniesione z „Udzielone pożyczki”',deleted:false,ts:Date.now()});
    putTx(t.date.slice(0,7),t.id,{type:'lend',sub:'',wasSub:t.sub,lendId:did,note:'🔺 Pożyczka'+(t.note?': '+t.note:'')})}
  toast('Przeniesiono do należności')}
/* the sheet: which liability an expense pays off */
export function fillDebt(sel){const L=debtList('owe').filter(d=>debtState(d).left>0||d.id==sel);$('mdebt').innerHTML='<option value="">— nie —</option>'+L.map(d=>`<option value="${d.id}">${esc(dIcon(d)+' '+d.name)}</option>`).join('');$('mdebt').value=sel||'';updDebt()}
export const rataTxt=r=>r?`💡 ${{dec:'rata malejąca',inst:'rata z umowy',ann:`rata równa (${String(+r.rate.toFixed(2)).replace('.',',')}%, ${r.n} ${plu(r.n,'rata','raty','rat')} do końca)`,eq:`${zl(r.left)} ÷ ${r.n} ${plu(r.n,'miesiąc','miesiące','miesięcy')} do końca`,last:'jak ostatnio'}[r.src]}: ${zl(r.amt)}${r.int?` – w tym odsetki ok. ${zl(r.int)}`:''}${r.last?' · ostatnia rata':''}`:'';
export function updDebtHint(fill){const d=S.debts[$('mdebt').value],r=d&&!S.edit?rataP({id:$('mdebt').value,...d},liveOf(S.tx),$('md').value||td()):null;$('mdebtHint').textContent=rataTxt(r);$('mdebtHint').hidden=!r;
  if(fill&&r&&!calcAmt($('ma').value)){$('ma').value=f2(r.amt);$('ma').oninput()}}
export function updDebt(){const av=S.etype=='exp'&&!S.refEdit&&$('mdebt').options.length>1;$('mdebtWrap').hidden=!(av&&(S.debtOpen||$('mdebt').value));$('mdebtBtn').hidden=!av||!$('mdebtWrap').hidden}
/* ---------- 📝 planning: positions to plan, the 3-month average ---------- */
/* positions to plan: no plan yet, spending in recent months; hidden positions and 📅 yearly expenses (they come into the plan by themselves) are skipped */
export function toPlanH(){const ym=S.ym,cur=td().slice(0,7);if(ym<cur)return'';const tx=liveOf(S.tx),pl=planOf(S.cfg,S.plans,tx,ym),{avg}=avgActuals(S.cfg,tx,ym,3),YS=yearSubs(S.cfg);
  const L=S.cfg.cats.filter(c=>!c.hidden).flatMap(c=>c.subs.filter(s=>!s.hidden).map(s=>({c,s}))).filter(x=>!pl[x.s.id]&&avg[x.s.id]>0&&!YS.has(x.s.id));if(!L.length)return'';
  const tot=L.filter(x=>x.c.type=='exp').reduce((a,x)=>a+avg[x.s.id],0);
  return`<div class="note">📝 <b>Do zaplanowania: ${L.length} ${plu(L.length,'pozycja','pozycje','pozycji')}</b> bez planu, które w ostatnich miesiącach miały wpisy${tot?` (wydatki średnio ${zl0(tot)}/mies.)`:''}. Średnią widać w pustym polu planu.<br><button class="btn sm primary" style="margin-top:6px" onclick="fillAvg()">Wypełnij średnimi</button></div>`}
export async function fillAvg(){if(guard())return;const ym=S.ym,tx=liveOf(S.tx),pl=planOf(S.cfg,S.plans,tx,ym),{avg,months}=avgActuals(S.cfg,tx,ym,3),YS=yearSubs(S.cfg),d={};
  S.cfg.cats.filter(c=>!c.hidden).forEach(c=>c.subs.forEach(s=>{if(!s.hidden&&!YS.has(s.id)&&!pl[s.id]&&avg[s.id]>0)d[s.id]=Math.ceil(avg[s.id]/1000)*1000}));const n=Object.keys(d).length;if(!n)return;
  if(!await ask({title:'Wypełnić średnimi?',text:`${n} ${plu(n,'pozycja','pozycje','pozycji')} dostanie plan równy średniej z ${months} ${plu(months,'miesiąca','miesięcy','miesięcy')}, zaokrąglonej w górę do 10 zł. Pozycje z planem zostają bez zmian.`,ok:'Wypełnij'}))return;
  merge(doc(PLC(),ym),d);toast('Wypełniono plan średnimi ✓')}
/* ---------- 🏷️ projects and labels (cars, cats, trips) ---------- */
export const projs=()=>S.cfg.projs||[],projById=id=>projs().find(p=>p.id==id);
export const saveProj=x=>merge(H,{projM:{[x.id]:strip(x,projs().indexOf(x))}});
export const delProjDb=id=>w(updateDoc(H,{['projM.'+id]:deleteField()}));
export const PKIND=[['stały','Stały – liczy się do budżetu (np. 🐱 koty, 🏠 mieszkanie)'],['jedno','Jednorazowy – poza codziennym budżetem (np. ✈️ wyjazd, 🔨 remont)'],['car','🚗 Pojazd – tankowania, licznik, koszt km']];
export const projSpent=(p,tx)=>tx.filter(t=>t.proj===p.id).reduce((a,t)=>a+(t.type=='exp'?t.amount:t.type=='inc'&&t.refundOf?-t.amount:0),0);
export function projectsH(){const L=projs(),tx=liveOf(S.tx);let h=`<div class="r1" style="padding:0 4px"><span class="h2" style="margin:0">🏷️ Projekty</span><button class="btn sm dark" onclick="editProj()">+ Projekt</button></div>`;
  if(!L.length)return h+`<div class="mini" style="padding:0 6px">Np. 🚗 auto, 🐱 Bailey i Ivo, ✈️ wakacje. Przy wydatku wybierzesz projekt, a tu zobaczysz, ile kosztuje.</div>`;
  return h+`<div class="list">${L.map(p=>{const sp=projSpent(p,tx),pc=p.budget?sp/p.budget*100:null,st=p.budget?status('exp',p.budget,sp):null;
    return`<button class="acc" style="text-align:left;width:100%" onclick="openProj('${p.id}')"><div style="min-width:0;flex:1"><div class="r1"><b>${esc(p.icon||'🏷️')} ${esc(p.name)}</b><b class="num">${zl(sp)}</b></div>
      <div class="mini">${p.kind=='car'?'pojazd · ':''}${p.inBudget===false?'poza codziennym budżetem':'liczy się do budżetu'}${p.budget?` · budżet ${zl0(p.budget)}`:''}${p.from?` · ${p.from.split('-').reverse().join('.')}${p.to?' – '+p.to.split('-').reverse().join('.'):''}`:''}</div>
      ${st?`<div class="bar ${st.k}"><i style="width:${Math.min(100,pc).toFixed(1)}%"></i></div><div class="smsg ${st.k}">${esc(st.msg)}</div>`:''}</div></button>`}).join('')}</div>`}
export async function editProj(id){if(guard())return;const p0=id?projById(id):null;
  const r=await ask({title:p0?'Projekt':'Nowy projekt',text:p0?'':'Projekt nie odkłada pieniędzy – liczy, ile coś kosztuje (auto, koty, remont). Odkładanie: 🎯 Cel w Oszczędnościach albo 📅 Roczne i terminy.',fields:[{id:'n',label:'Nazwa',value:p0?.name||'',ph:'np. Toyota, Bailey i Ivo, Wakacje 2027'},{id:'i',label:'Ikonka (emoji)',value:p0?.icon||'',ph:'🚗 🐱 ✈️ 🔨'},
    {id:'k',label:'Rodzaj',type:'select',value:p0?.kind||'stały',options:PKIND},
    {id:'b',label:'Czy liczyć do codziennego budżetu',type:'select',value:p0?(p0.inBudget===false?'0':'1'):'',options:[['','Według rodzaju'],['1','Tak'],['0','Nie – osobno']]},
    {id:'g',label:'Budżet projektu (zł, opcjonalnie)',type:'decimal',value:p0?.budget?f2(p0.budget):''},
    {id:'f',label:'Od (opcjonalnie)',type:'date',value:p0?.from||''},{id:'t',label:'Do (opcjonalnie)',type:'date',value:p0?.to||''},
    {id:'o',label:'Pojazd: przebieg na start (km)',type:'int',value:p0?.odo0||''}],ok:p0?'Zapisz':'Dodaj',alt:p0?'Usuń projekt':null});
  if(!r)return;if(r=='alt'){if(!await ask({title:'Usunąć projekt?',text:p0.name+'\nWydatki zostaną w rejestrze, tylko bez etykiety projektu.',ok:'Usuń',danger:true}))return;S.cfg.projs=projs().filter(x=>x!==p0);S.proj=null;render();delProjDb(p0.id);return}
  if(!r.n.trim())return toast('Podaj nazwę','bad');
  const body={id:p0?.id||'p'+rid(),name:r.n.trim(),icon:r.i.trim()||(r.k=='car'?'🚗':r.k=='jedno'?'✈️':'🏷️'),kind:r.k,inBudget:r.b?r.b=='1':r.k!='jedno',budget:gr(r.g),from:isDate(r.f)?r.f:'',to:isDate(r.t)?r.t:'',odo0:Math.round(pnum(r.o))||0};
  S.cfg.projs=projs();let x=p0;if(x)Object.assign(x,body);else{x=body;S.cfg.projs.push(x)}render();saveProj(x);toast(p0?'Zapisano projekt':'Dodano projekt')}
export function openProj(id){S.proj=id;window.scrollTo(0,0);render()}
export function closeProj(){S.proj=null;render()}
export function projPageH(){const p=projById(S.proj);if(!p){S.proj=null;return''}const tx=liveOf(S.tx),sm=subsMap(S.cfg),L=tx.filter(t=>t.proj===p.id).sort((a,b)=>b.date.localeCompare(a.date)),sp=projSpent(p,tx);
  let h=`<button class="btn sm" style="align-self:flex-start" onclick="closeProj()">‹ Budżet</button><div class="worth"><div class="l">${esc(p.icon||'🏷️')} ${esc(p.name)} · ${p.inBudget===false?'poza codziennym budżetem':'liczy się do budżetu'}</div><div class="v num">${zl(sp)}</div><div class="s">${L.length} ${plu(L.length,'wpis','wpisy','wpisów')}${p.budget?` · budżet ${zl(p.budget)} · zostało ${zl(p.budget-sp)}`:''}</div></div>`;
  if(p.kind=='car'){const c=carStats(S.cfg,tx,p.id,p.odo0);
    h+=`<div class="kpis"><div class="kpi k-sk"><div class="l">Przejechane</div><div class="v num">${c.km.toLocaleString('pl-PL')} km</div><div class="s">licznik ${c.odo?c.odo.toLocaleString('pl-PL')+' km':'—'}</div></div><div class="kpi k-ro"><div class="l">Koszt 1 km</div><div class="v num">${c.perKm?zl(Math.round(c.perKm)):'—'}</div><div class="s">wszystkie koszty</div></div>
      <div class="kpi k-em"><div class="l">Spalanie</div><div class="v num">${c.l100?c.l100.toFixed(1).replace('.',',')+' l':'—'}</div><div class="s">na 100 km</div></div><div class="kpi k-in"><div class="l">Litr paliwa</div><div class="v num">${c.litre?zl(Math.round(c.litre)):'—'}</div><div class="s">średnio</div></div></div>
      <div class="mini" style="padding:0 4px">Spalanie liczę, gdy przy tankowaniach wpiszesz litry i stan licznika (pola pojawią się przy pozycji „Paliwo” i tym projekcie).</div>`;
    const rows=Object.entries(c.byCat).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([l,v],i)=>({l,v,c:PAL[i%PAL.length],dot:PAL[i%PAL.length]}));if(rows.length)h+=chartBox('Struktura kosztów','',hbarsH(rows,c.cost))}
  else{const byCat={};L.forEach(t=>{const s=sm[t.sub];if(!s||t.type=='tr')return;const k=cleanCat(s.cat.name);byCat[k]=(byCat[k]||0)+(t.type=='exp'?t.amount:-t.amount)});
    const rows=Object.entries(byCat).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([l,v],i)=>({l,v,c:PAL[i%PAL.length],dot:PAL[i%PAL.length]}));if(rows.length)h+=chartBox('Na co','według kategorii',hbarsH(rows,sp))}
  const ms=[...new Set(L.map(t=>t.date.slice(0,7)))].sort().slice(-12);
  if(ms.length>1)h+=chartBox('Miesiąc po miesiącu','',barsSvg(ms.map(m=>MN[+m.slice(5)-1].slice(0,3).toLowerCase()),[{name:'Koszty',color:C_EXP,values:ms.map(m=>L.filter(t=>t.date.startsWith(m)).reduce((a,t)=>a+(t.type=='exp'?t.amount:t.refundOf?-t.amount:0),0))}],{tipLabel:i=>MN[+ms[i].slice(5)-1]+' '+ms[i].slice(0,4)}));
  h+=L.length?`<div class="list">${L.slice(0,100).map(t=>txRowH(t,sm)).join('')}</div>`:catsEmpty('Brak wpisów. Przy wydatku wybierz ten projekt w polu „🏷️ Projekt”.',1,'box');
  return h+`<div class="btns" style="justify-content:center"><button class="btn sm" onclick="editProj('${p.id}')">Edytuj projekt</button></div>`}
/* the sheet: project label, litres and odometer for a vehicle */
export function fillProj(sel){$('mproj').innerHTML='<option value="">— brak —</option>'+projs().map(p=>`<option value="${p.id}">${esc((p.icon||'🏷️')+' '+p.name)}</option>`).join('');$('mproj').value=sel||'';updProj()}
export function updProj(){if(!S.cfg)return;const has=projs().length>0,p=projById($('mproj').value),s=subsMap(S.cfg)[$('ms').value];
  const av=has&&S.etype!='tr';$('mprojWrap').hidden=!(av&&(S.projOpen||$('mproj').value));$('mprojBtn').hidden=!av||!$('mprojWrap').hidden;$('mcarWrap').hidden=!(p&&p.kind=='car'&&S.etype=='exp'&&s&&/paliw|tankow|benzyn|diesel|lpg|ładowan/i.test(s.name))}
/* ---------- 🔔 reminders (📌 Stałe → Przypomnienia): insurance, inspection, tyres, service, cats' vaccinations ---------- */
export const rems=()=>S.cfg.rems||[];
export const saveRem=x=>merge(H,{remM:{[x.id]:strip(x,rems().indexOf(x))}});
export const delRemDb=id=>w(updateDoc(H,{['remM.'+id]:deleteField()}));
export const REM_PRE=[['','— własne —'],['🔧 Przegląd techniczny','12'],['🛞 Wymiana opon','6'],['🧰 Serwis / olej','12'],['💉 Szczepienie kotów','12'],['🐾 Odrobaczenie kotów','3']];
export function remState(r){return remStateP(r,S.cfg,liveOf(S.tx),td())}
export function warrantiesH(){const today=td(),sm=subsMap(S.cfg),L=liveOf(S.tx).filter(t=>t.war&&t.type=='exp').sort((a,b)=>a.war.localeCompare(b.war)),act=L.filter(t=>t.war>=today),old=L.length-act.length;
  if(!L.length)return'';return`<div class="r1" style="padding:0 4px"><span class="h2" style="margin:0">🛡️ Gwarancje</span><span class="mini">${act.length} ${plu(act.length,'aktywna','aktywne','aktywnych')}${old?` · ${old} ${plu(old,'wygasła','wygasłe','wygasłych')}`:''}</span></div>
  <div class="list">${act.map(t=>{const n=Math.round((new Date(t.war)-new Date(today))/864e5);return`<button class="acc" style="width:100%;text-align:left" onclick="openTx('${t.id}')"><div style="flex:1;min-width:0"><div class="r1"><b>${esc(t.note||sm[t.sub]?.name||'Zakup')}${t.rcpt?.length?' 📷':''}</b><b class="num">${zl(t.amount)}</b></div><div class="mini">kupione ${t.date.split('-').reverse().join('.')} · gwarancja do ${t.war.split('-').reverse().join('.')}${n<=30?` · <b class="t-exp">za ${n} ${plu(n,'dzień','dni','dni')}</b>`:''}</div></div></button>`}).join('')||'<div class="acc mini">Brak aktywnych gwarancji.</div>'}</div>`}
/* 🔔 dates without putting money aside (📌 Stałe → 📅 Roczne i terminy) */
export function remsH(){const L=rems().map(r=>({r,st:remState(r)})).sort((a,b)=>(a.r.next||'9999').localeCompare(b.r.next||'9999'));if(!L.length)return'';
  return`<div class="h2" style="padding:0 4px">🔔 Terminy bez odkładania</div><div class="list">${L.map(({r,st})=>`<div class="acc${st.late?' late':''}"><div style="min-width:0;flex:1"><div class="r1"><b>${esc(r.name)}</b>${st.late?'<span class="pill over">po terminie</span>':st.due?'<span class="pill near">wkrótce</span>':''}</div>
    <div class="mini">${r.next?`termin ${r.next.split('-').reverse().join('.')}${st.days!=null?` · ${st.days<0?Math.abs(st.days)+' dni temu':st.days==0?'dziś':'za '+st.days+' '+plu(st.days,'dzień','dni','dni')}`:''}`:''}${r.km?`${r.next?' · ':''}co ${r.km.toLocaleString('pl-PL')} km${st.kmLeft!=null?` · zostało ${st.kmLeft.toLocaleString('pl-PL')} km`:''}`:''}${+r.every?` · co ${r.every} mies.`:' · jednorazowe'}${r.proj&&projById(r.proj)?' · '+esc(projById(r.proj).name):''}</div>
    ${r.note?`<div class="mini">📝 ${esc(r.note)}</div>`:''}<div class="btns" style="gap:6px;margin-top:6px"><button class="chip" onclick="doneRem('${r.id}')">✓ Zrobione</button><button class="chip" onclick="editRem('${r.id}')">Edytuj</button></div></div></div>`).join('')}</div>`}
export async function editRem(id){if(guard())return;const r0=id?rems().find(x=>x.id==id):null,cars=projs().filter(p=>p.kind=='car');
  const r=await ask({title:r0?'Przypomnienie':'Nowe przypomnienie',fields:[...(r0?[]:[{id:'p',label:'Gotowe',type:'select',value:'',options:REM_PRE.map(([n,e])=>[n?n+'|'+e:'',n||'— własne —'])}]),
    {id:'n',label:'Nazwa (gdy własne)',value:r0?.name||'',ph:'np. Wymiana klocków'},{id:'d',label:'Termin',type:'date',value:r0?.next||''},
    {id:'e',label:'Powtarzaj',type:'select',value:String(r0?.every??12),options:[['0','Jednorazowo'],['1','Co miesiąc'],['3','Co 3 miesiące'],['6','Co pół roku'],['12','Co rok'],['24','Co 2 lata']]},
    ...(cars.length?[{id:'c',label:'Pojazd',type:'select',value:r0?.proj||'',options:[['','— nie dotyczy —'],...cars.map(p=>[p.id,p.name])]},{id:'k',label:'Albo co ile km (np. serwis)',type:'int',value:r0?.km||''}]:[]),
    {id:'t',label:'Notatka',value:r0?.note||''},
    {id:'a',label:'Kwota (zł, opcjonalnie) – z kwotą będę liczyć odkładanie',type:'decimal',value:'',ph:'puste = samo przypomnienie'},{id:'s',label:'Pozycja budżetu (gdy jest kwota)',type:'select',value:'',options:[['','— wybierz —'],...subOpts('exp')]}],ok:r0?'Zapisz':'Dodaj',alt:r0?'Usuń':null});
  if(!r)return;if(r=='alt'){S.cfg.rems=rems().filter(x=>x!==r0);render();delRemDb(r0.id);return}
  /* with an amount the date becomes a yearly expense (money put aside every month) – the reminder moves there */
  const amt=gr(r.a);if(amt>0){const nm=r.n.trim()||r0?.name||(r.p||'').split('|')[0],ev=+r.e;
    if(!nm)return toast('Podaj nazwę','bad');if(!isDate(r.d))return toast('Podaj termin płatności','bad');if(!ev)return toast('Wydatek z kwotą musi się powtarzać','bad');if(!r.s)return toast('Wybierz pozycję budżetu','bad');
    if(r0){S.cfg.rems=rems().filter(x=>x!==r0);delRemDb(r0.id)}newYear(nm,amt,r.d,ev,r.s);return toast('Przeniesione do odkładania: '+nm+' 📅')}
  let name=r.n.trim(),every=+r.e;if(!name&&r.p){const[n,e]=r.p.split('|');name=n;if(!r0&&r.e=='12')every=+e}
  if(!name)return toast('Podaj nazwę albo wybierz gotowe','bad');const km=Math.round(pnum(r.k||''))||0;if(!isDate(r.d)&&!km)return toast('Podaj termin albo liczbę km','bad');
  const car=r.c?projById(r.c):null,body={id:r0?.id||'r'+rid(),name,next:isDate(r.d)?r.d:'',every,proj:r.c||'',km,note:r.t.trim(),lastOdo:r0?.lastOdo??(car&&km?carStats(S.cfg,liveOf(S.tx),car.id,car.odo0).odo:0)};
  S.cfg.rems=rems();let x=r0;if(x)Object.assign(x,body);else{x=body;S.cfg.rems.push(x)}render();saveRem(x);toast(r0?'Zapisano':'Dodano przypomnienie 🔔')}
export async function doneRem(id){const r=rems().find(x=>x.id==id);if(!r)return;const st=remState(r);
  if(!+r.every&&!r.km){if(!await ask({title:'Zrobione: '+r.name,text:'To przypomnienie było jednorazowe – usunąć je?',ok:'Usuń'}))return;S.cfg.rems=rems().filter(x=>x!==r);render();delRemDb(r.id);return toast('Gotowe ✓')}
  if(r.next&&+r.every)r.next=addM(r.next<td()?td():r.next,+r.every);if(r.km)r.lastOdo=st.odo;render();saveRem(r);toast('Gotowe ✓'+(r.next?' – następny termin '+r.next.split('-').reverse().join('.'):''))}
/* ---------- 💧 cascade of surpluses: only a proposal, per person – counted the day before the pay day (and in the closing window after it):
   then the current accounts hold what is really left from the last salary. Surplus = balance − buffer (250 zł by default) − unpaid fixed payments
   due before the pay day − the new salary when it already came (it is for the next month, not a surplus). Shared accounts: the earliest pay day
   of the two of you, money transferred in since then is new money too. Never to PPK / OKI, never from cash, not above the IKE / IKZE limit. ---------- */
const CASC_BUF=25000;
export const cascTargets=o=>S.cfg.accs.filter(a=>!a.archived&&isP(a)&&accOwner(a)==o&&(a.grp=='sav'||(a.grp=='inv'&&!['ppk','oki'].includes(wrapOf(a)))));
const dmyC=d=>d.split('-').reverse().join('.');
/* the pay window of a person (shared accounts: of whoever is paid first) – only a real pay day, not the „first 10 days” of a month without income sources */
export function cascWin(o,tx,today){const W=(o=='Wspólne'?['Mati','Wercia']:[o]).map(p=>closeWinP(S.cfg,tx,p,today)).filter(w=>w&&w.pay).sort((a,b)=>a.pay.localeCompare(b.pay));
  if(W.length)return{win:W[0]};const nx=(o=='Wspólne'?['Mati','Wercia']:[o]).map(p=>nextCloseP(S.cfg,tx,p,today)).filter(Boolean).sort()[0]||null;return{next:nx}}
export function cascSurplus(a,win,buf,tx,today){const tom=addDays(today,1),pm=win.pay.slice(0,7);
  const unpaid=(S.cfg.fixed||[]).filter(f=>(f.kind||'exp')!='inc'&&f.acc==a.id&&fixedDate(f,pm)<=win.pay&&!fixedPaid(f.id,pm)).reduce((x,f)=>x+f.amount,0);
  const fresh=tx.filter(t=>t.date<=today&&((t.acc===a.id&&t.date>=addDays(win.pay,-7)&&salaryTxP(S.cfg,t))||(t.type=='tr'&&t.to===a.id&&t.date>=win.start))).reduce((x,t)=>x+(t.type=='tr'?t.amount2??t.amount:t.amount),0);
  return{sur:balance(S.cfg,tx,a.id,tom)-buf-unpaid-fresh,u:unpaid,fresh}}
export function cascadeH(o){const cfgc=(S.hraw?.cascade||{})[o]||{},buf=cfgc.buf??CASC_BUF,today=td(),tx=liveOf(S.tx),y=today.slice(0,4);
  const T=cascTargets(o),rank=a=>a.grp=='sav'?(isPod(a)?1:0):!wrapOf(a)?2:3,to=T.find(a=>a.id==cfgc.to)?.id||T.slice().sort((a,b)=>rank(a)-rank(b))[0]?.id;
  const src=S.cfg.accs.filter(a=>a.grp=='cur'&&!a.archived&&isP(a)&&accOwner(a)==o&&!/gotówk/i.test(a.name));if(!src.length||!to)return'';
  const ta=accById(to),w=wrapOf(ta),room=w=='ike'||w=='ikze'?Math.max(0,limitOf(ta,y,S.hraw?.limits)-paidInYear(tx,to,y)):Infinity;
  const head=`<section class="chart"><div class="ct"><b>💧 Kaskada nadwyżek${o=='Wspólne'?' – wspólne':''}</b><button class="btn sm" aria-label="Ustawienia kaskady" onclick="setCascade('${o}')">⚙️</button></div>`;
  const{win,next}=cascWin(o,tx,today);
  if(!win)return head+`<div class="mini">${next?`Nadwyżkę policzę dzień przed wypłatą (<b style="color:var(--fg)">${dmyC(next)}</b>) – wtedy na kontach jest to, co naprawdę zostało z poprzedniej pensji. Teraz te pieniądze są jeszcze potrzebne na wydatki do wypłaty.`:`Nadwyżkę policzę dzień przed wypłatą – dodaj źródło dochodu w 📌 Stałe → 💼 Pensje (dzień wypłaty aplikacja nauczy się sama z pasków).`}</div></section>`;
  let left=room;const L=src.map(a=>{const c=cascSurplus(a,win,buf,tx,today),sur=Math.min(c.sur,left);if(sur>=10000)left-=sur;return{a,...c,sur}}).filter(x=>x.sur>=10000);
  return head+`<div class="mini">Propozycja ${win.pay>today?`przed wypłatą ${dmyC(win.pay)}`:`po wypłacie ${dmyC(win.pay)}`}: to, co zostało na kontach bieżących ponad zapas ${zl0(buf)} i opłaty stałe przed wypłatą, możesz przelać na „${esc(accN(to))}”.${room<Infinity?` Limit ${w.toUpperCase()} na ${y}: zostało ${zl0(room)}.`:''}</div>
    ${L.length?L.map(x=>`<div class="r1"><span>${esc(x.a.name)}${x.u||x.fresh?` <span class="mini">(${[x.u?`po opłatach ${zl0(x.u)}`:'',x.fresh?`bez nowej pensji i wpłat ${zl0(x.fresh)}`:''].filter(Boolean).join(', ')})</span>`:''}</span><button class="chip" onclick="openTx(null,{type:'tr',from:'${x.a.id}',to:'${to}',amount:${x.sur}})">→ ${zl(x.sur)}</button></div>`).join(''):`<div class="mini">${room<=0?`Limit ${w.toUpperCase()} na ten rok jest już wykorzystany – wybierz inne konto (⚙️).`:'Teraz nie ma nadwyżek do przelania.'}</div>`}</section>`}
export async function setCascade(o){if(guard())return;const c=(S.hraw?.cascade||{})[o]||{},T=cascTargets(o);
  const r=await ask({title:'Kaskada nadwyżek – '+o,text:'Na PPK i OKI nie można wpłacać samemu, więc ich tu nie ma.',fields:[{id:'b',label:'Zapas na każdym koncie bieżącym (zł)',type:'decimal',value:f2(c.buf??CASC_BUF)},{id:'t',label:'Przelewaj na',type:'select',value:T.some(a=>a.id==c.to)?c.to:'',options:[['','Pierwsze konto oszczędnościowe'],...T.map(a=>[a.id,a.name])]}]});
  if(!r)return;const v={buf:gr(r.b),to:r.t};S.hraw={...S.hraw,cascade:{...(S.hraw?.cascade||{}),[o]:v}};merge(H,{cascade:{[o]:v}});render()}
