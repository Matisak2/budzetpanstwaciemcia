/* Budżet M&W – budget / account actions, look of the phone, fixed costs, goals, reconcile, backup and import, register filters. Part of the former js/app.js (split into modules, same code). */
import {doc,collection,setDoc,deleteDoc,updateDoc,deleteField,getDocs} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {catIcon,catsEmpty} from './art.js';
import {CELEBRATE} from './guide.js';
import {HUES,catHue,freeHue} from './data.js';
import {position,wrapOf} from './inv.js';
import {ULGI} from './today.js';
import {suggest} from './pay.js';
import {balance,buildIcs,cleanCat,fixedDate,liveOf,planRecon,subsMap} from './logic.js';
import {$,MN,addDays,clone,daysIn,esc,f2,isDate,ls,p2,pg,pnum,rid,td,zl,money,curSym,fxPlus,priv} from './util.js';
import {S,catL,celebrate,toast,err,ask,CUR,accCur,isP,am,WRAP_F,setWrap,CUR_OPTS,GRPN,accOwner,accOpts,subOpts,H,PUSH,DEBTS,HOLD,SLIPS,MC,PLC,INV,GOALS,w,merge,saveCfg,saveAcc,delAccDb,saveSub,saveCat,delCatDb,delSubDb,saveFixed,delFixedDb,putTx,putInv,liveById,guard} from './core.js';
import {plu,catColor,P,RCPT,RMETA,phCache,openTx} from './sheet.js';
import {incs,gr,openSlip} from './salary.js';
import {debtList,debtState} from './debts.js';
import {accN,render} from './app.js';

/* ---------- budget / accounts actions ---------- */
export function setPlan(sid,v){if(guard())return;const ym=S.ym,val=pg(v);
  if(((S.plans[ym]||{})[sid]||0)===val)return;
  merge(doc(PLC(),ym),{[sid]:val})}
export async function copyPlan(){if(guard())return;const[y,m]=S.ym.split('-').map(Number);const prev=m==1?(y-1)+'-12':y+'-'+p2(m-1);const src=S.plans[prev];
  if(!src||!Object.values(src).some(v=>v))return toast('Poprzedni miesiąc nie ma planu','bad');
  if(!await ask({title:'Skopiować plan?',text:`Plan z miesiąca ${MN[+prev.slice(5)-1]} zastąpi plan na ${MN[m-1]}.`,ok:'Kopiuj'}))return;
  if(w(setDoc(doc(PLC(),S.ym),{...src})))toast('Skopiowano plan')}
export async function recon(id){if(guard())return;const before=S.ym+'-32',cur=balance(S.cfg,liveOf(S.tx),id,before),a=S.cfg.accs.find(x=>x.id==id);
  const r=await ask({title:'Wyrównaj saldo',text:`${a.name}\nW aplikacji na koniec miesiąca: ${money(cur,CUR(a))}`,fields:[{id:'v',label:`Rzeczywiste saldo (${curSym(CUR(a))})`,type:'decimal',value:f2(cur)}],ok:'Wyrównaj'});
  if(!r||!r.v.trim())return;const d=pg(r.v)-cur;if(!d)return toast('Saldo się zgadza');
  const date=td().startsWith(S.ym)?td():S.ym+'-'+p2(daysIn(S.ym));
  if(await putTx(S.ym,'t'+rid(),{type:'adj',amount:d,date,sub:'',acc:id,to:'',who:S.who,note:'Wyrównanie salda',deleted:false,ts:Date.now()}))toast('Dodano wyrównanie '+(d>0?'+':'')+money(d,CUR(a)))}
export async function addAcc(){if(guard())return;const r=await ask({title:'Nowe konto',fields:[{id:'n',label:'Nazwa'},{id:'g',label:'Rodzaj',type:'select',value:S.accTab,options:Object.entries(GRPN)},{id:'w',label:'Czyje',type:'select',value:S.who,options:[['Mati','Mati'],['Wercia','Wercia'],['Wspólne','Wspólne']]},{id:'c',label:'Waluta',type:'select',value:'PLN',options:CUR_OPTS}],ok:'Dodaj'});
  if(!r||!r.n.trim())return;const a={id:'a'+rid(),name:r.n.trim(),grp:r.g,owner:r.w,open:0,...(r.c!='PLN'?{cur:r.c}:{})};S.cfg.accs.push(a);S.accTab=r.g;render();saveAcc(a)}
export async function editAcc(id){if(guard())return;const a=S.cfg.accs.find(x=>x.id==id);
  const used=liveOf(S.tx).some(t=>t.acc===id||t.to===id);
  const r=await ask({title:'Edytuj konto',fields:[{id:'n',label:'Nazwa',value:a.name},{id:'g',label:'Rodzaj',type:'select',value:a.grp,options:Object.entries(GRPN)},{id:'w',label:'Czyje',type:'select',value:accOwner(a),options:[['Mati','Mati'],['Wercia','Wercia'],['Wspólne','Wspólne']]},{id:'c',label:'Waluta',type:'select',value:CUR(a),options:CUR_OPTS},...(a.grp=='inv'?[WRAP_F(a)]:[]),{id:'o',label:`Saldo początkowe – przed pierwszą transakcją (${curSym(CUR(a))})`,type:'decimal',value:f2(a.open)}],alt:used?null:'Usuń konto'});
  if(!r)return;
  if(r=='alt'){if(!await ask({title:'Usunąć konto?',text:a.name,ok:'Usuń',danger:true}))return;S.cfg.accs=S.cfg.accs.filter(x=>x.id!=id);render();delAccDb(id);return}
  if(r.c!=CUR(a)&&used&&!await ask({title:'Zmienić walutę konta?',text:`${a.name}: ${CUR(a)} → ${r.c}\nKwoty nie zostaną przeliczone – zmieni się tylko waluta, w której są pokazane wszystkie wpisy tego konta.`,ok:'Zmień walutę'}))return;
  if(r.n.trim())a.name=r.n.trim();a.owner=r.w;a.open=pg(r.o);if(r.c!=CUR(a))a.cur=r.c;if(r.x!=null)setWrap(a,r.x);
  if(r.g!=a.grp){a.grp=r.g;S.accTab=r.g;toEndOfKind(a);toast('Konto przeniesione do: '+ACCTAB[r.g])}else saveAcc(a);render()}
export async function addSub(ci){if(guard())return;const r=await ask({title:'Nowa pozycja',text:catL(S.cfg.cats[ci]),fields:[{id:'n',label:'Nazwa'}],ok:'Dodaj'});
  if(!r||!r.n.trim())return;const c=S.cfg.cats[ci],s={id:'s'+rid(),name:r.n.trim()};c.subs.push(s);render();saveSub(c,s)}
export async function renSub(ci,si){if(guard())return;const s=S.cfg.cats[ci].subs[si];const r=await ask({title:'Zmień nazwę',fields:[{id:'n',label:'Nazwa',value:s.name}]});
  if(!r||!r.n.trim())return;s.name=r.n.trim();render();saveSub(S.cfg.cats[ci],s)}
export async function delSub(ci,si){if(guard())return;const c=S.cfg.cats[ci],s=c.subs[si];
  const txs=S.tx.filter(t=>t.sub===s.id),live=liveOf(txs),fx=(S.cfg.fixed||[]).filter(f=>f.sub===s.id),plans=Object.entries(S.plans).filter(([ym,p])=>p[s.id]);
  if(!live.length&&!fx.length){if(!await ask({title:'Usunąć pozycję?',text:s.name,ok:'Usuń',danger:true}))return;
    for(const[ym]of plans)w(updateDoc(doc(PLC(),ym),{[s.id]:deleteField()}));c.subs.splice(si,1);render();delSubDb(c,s);return}
  const opts=S.cfg.cats.filter(k=>k.type==c.type).map(k=>({group:catL(k),items:k.subs.filter(x=>x.id!==s.id).map(x=>[x.id,x.name])})).filter(g=>g.items.length);
  if(!opts.length)return ask({title:'Nie można usunąć',text:'Nie ma innej pozycji tego rodzaju, do której można przenieść wpisy.',ok:'OK',cancel:'Zamknij'});
  const plf=(n,a,b,c)=>n+' '+(n==1?a:(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20))?b:c);
  const parts=[live.length?plf(live.length,'wpis','wpisy','wpisów'):'',fx.length?plf(fx.length,'opłata stała','opłaty stałe','opłat stałych'):'',plans.length?`plan z ${plans.length} mies.`:''].filter(Boolean).join(', ');
  const r=await ask({title:'Połącz z inną pozycją',text:`„${s.name}” jest w użyciu (${parts}).\nWybierz pozycję, do której wszystko przeniosę. Potem „${s.name}” zostanie usunięta.`,
    fields:[{id:'t',label:'Przenieś do',type:'select',value:'',options:[['','— wybierz —'],...opts]}],ok:'Połącz i usuń',danger:true});
  if(!r)return;if(!r.t)return toast('Wybierz pozycję docelową','bad');
  const tgt=r.t,byM={};
  txs.forEach(t=>{const ym=t.date.slice(0,7);(byM[ym]=byM[ym]||{})[t.id]={sub:tgt}});
  for(const[ym,m]of Object.entries(byM))merge(doc(MC(),ym),{tx:m});
  for(const[ym,p]of plans)w(updateDoc(doc(PLC(),ym),{[tgt]:(p[tgt]||0)+p[s.id],[s.id]:deleteField()}));
  for(const f of fx){f.sub=tgt;saveFixed(f)}
  const ix=c.subs.indexOf(s);if(ix>=0)c.subs.splice(ix,1);render();delSubDb(c,s);
  toast('Przeniesiono do: '+(subsMap(S.cfg)[tgt]?.name||''))}
export const HUE_N={150:'Miętowy',205:'Błękitny',28:'Brzoskwiniowy',340:'Różowy',265:'Lawendowy',48:'Miodowy',185:'Morski',12:'Łososiowy',295:'Fiołkowy',95:'Pistacjowy',228:'Chabrowy',320:'Malinowy',62:'Cytrynowy',168:'Szałwiowy',245:'Niebieski',0:'Koralowy'};
export async function editCat(ci){if(guard())return;const c=S.cfg.cats[ci],empty=!c.subs.length;
  const r=await ask({title:'Kategoria '+(ci+1),fields:[{id:'n',label:'Nazwa (numer dodaje się sam)',value:cleanCat(c.name)},{id:'i',label:'Ikonka (emoji, np. 🍕 🐱 ✈️)',value:catIcon(c)},{id:'h',label:'Kolor',type:'select',value:String(catHue(c,ci)),options:HUES.map(h=>[String(h),HUE_N[h]])}],alt:empty?'Usuń kategorię':null});
  if(!r)return;
  if(r=='alt'){if(!await ask({title:'Usunąć kategorię?',text:cleanCat(c.name),ok:'Usuń',danger:true}))return;S.cfg.cats.splice(ci,1);render();delCatDb(c.id);S.cfg.cats.forEach(saveCat);return}
  if(!r.n.trim())return;c.name=cleanCat(r.n);c.icon=(r.i||'').trim().slice(0,8);c.hue=+r.h;render();saveCat(c)}
export async function addCat(){if(guard())return;
  const r=await ask({title:'Nowa kategoria',fields:[{id:'n',label:'Nazwa',ph:'np. EDUKACJA'},{id:'t',label:'Rodzaj',type:'select',value:'exp',options:[['exp','Wydatki'],['inc','Przychody']]}],ok:'Dodaj'});
  if(!r||!r.n.trim())return;const c={id:'c'+rid(),name:cleanCat(r.n),type:r.t,hue:freeHue(S.cfg.cats),subs:[]};S.cfg.cats.push(c);render();saveCat(c);toast('Dodano kategorię – dodaj do niej pozycje')}
export const ACCTAB={cur:'Konta bieżące',sub:'Subkonta',sav:'Oszczędności',inv:'Inwestycje'};
/* an account whose kind changed goes to the end of its new kind; every account whose position moved is saved */
export function toEndOfKind(a){const A=S.cfg.accs,old=A.map(x=>x.id);A.splice(A.indexOf(a),1);
  let k=-1;A.forEach((x,i)=>{if(x.grp==a.grp)k=i});A.splice(k+1,0,a);
  A.forEach((x,i)=>{if(old[i]!==x.id||x===a)saveAcc(x)})}
export function setAccTab(k){S.accTab=k;render()}
/* swap an account with its neighbour of the same kind (archived accounts are skipped) */
export function moveAcc(id,d){if(guard())return;const A=S.cfg.accs,i=A.findIndex(a=>a.id==id);if(i<0)return;
  let j=i+d;while(j>=0&&j<A.length&&(A[j].grp!=A[i].grp||A[j].archived))j+=d;if(j<0||j>=A.length)return;
  [A[i],A[j]]=[A[j],A[i]];render();saveAcc(A[i]);saveAcc(A[j])}
export function moveCat(ci,d){if(guard())return;const j=ci+d;if(j<0||j>=S.cfg.cats.length)return;const a=S.cfg.cats;[a[ci],a[j]]=[a[j],a[ci]];render();saveCat(a[ci]);saveCat(a[j])}
/* 🎨 the look of this phone: accent colour (default: Wercia pink, Mati mint) and text size */
export const ACCENTS=[['mint','Miętowy','#a7f3d0'],['pink','Różowy','#fbcfe8'],['lav','Lawendowy','#ddd6fe'],['sky','Błękitny','#bae6fd'],['peach','Brzoskwiniowy','#fed7aa'],['lemon','Cytrynowy','#fef08a']];
export const accOf=()=>ls.get('mw_acc')||(S.who=='Wercia'?'pink':'mint');
export function lookApply(){document.body.dataset.acc=accOf();document.body.dataset.size=ls.get('mw_size')||'0';priv.on=ls.get('mw_hide')=='1';document.body.classList.toggle('hidev',priv.on)}
export function setHide(on){setLook('mw_hide',on?'1':'0');toast(on?'🙈 Kwoty ukryte na tym telefonie':'👀 Kwoty znów widać')}
export function setLook(k,v){ls.set(k,v);lookApply();render()}
export const lookH=()=>`<div class="card"><h3>🎨 Wygląd</h3><div class="accs" role="group" aria-label="Kolor">${ACCENTS.map(([k,n,c])=>`<button class="accdot" style="background:${c}" aria-pressed="${accOf()==k}" aria-label="${n}" title="${n}" onclick="setLook('mw_acc','${k}')"></button>`).join('')}</div>
  <div class="seg seg3" role="group" aria-label="Wielkość tekstu">${[['0','A'],['1','A+'],['2','A++']].map(([k,l])=>`<button aria-pressed="${(ls.get('mw_size')||'0')==k}" onclick="setLook('mw_size','${k}')" style="font-size:${14+(+k)*2}px">${l}</button>`).join('')}</div><div class="mini" style="margin-top:10px"><b style="color:var(--fg)">🙈 Tryb dyskretny</b> – kwoty jako „•••”, gdy pokazujecie komuś telefon albo otwieracie aplikację przy ludziach.</div><div class="seg seg2" role="group" aria-label="Tryb dyskretny">${[[0,'👀 Kwoty widać'],[1,'🙈 Ukryte']].map(([k,l])=>`<button aria-pressed="${priv.on==!!k}" onclick="setHide(${k})">${l}</button>`).join('')}</div><div class="mini">Kolor, wielkość tekstu i tryb dyskretny dotyczą tylko tego telefonu.</div></div>`;
export function setWho(v){S.who=v;ls.set('mw_who',v);if(S.uid)merge(doc(collection(H,'users'),S.uid),{email:S.email||'',who:v});const pid=ls.get('mw_push');if(pid&&S.pushOk)merge(doc(PUSH(),pid),{who:v});render()}

/* ---------- fixed costs ---------- */
export const fixedPaid=(fid,ym)=>liveOf(S.tx).find(t=>t.fixedId===fid&&t.date.startsWith(ym));
export async function editFixed(fid,kind,pre){if(guard())return;
  const f0=fid?S.cfg.fixed.find(x=>x.id==fid):null,f=f0||pre||null;kind=f0?(f0.kind||'exp'):(kind||'exp');const inc=kind=='inc';
  if(kind=='tr')return editFixedTr(f0);
  const invAccs=S.cfg.accs.filter(a=>a.grp=='inv'&&!a.archived);
  const fields=[
    {id:'n',label:'Nazwa',value:f?.name||'',ph:inc?'np. Najem mieszkania':'np. Czynsz'},
    {id:'a',label:inc?'Przybliżona kwota (zł)':'Kwota (zł)',type:'decimal',value:f?f2(f.amount):'',ph:'0,00'},
    {id:'d',label:inc?'Zwykle wpływa do dnia (1–31)':'Termin – dzień miesiąca (1–31)',type:'int',value:f?.day||10},
    {id:'s',label:'Pozycja budżetu',type:'select',value:f?.sub||'',options:[['','— wybierz —'],...subOpts(kind)]},
    {id:'c',label:inc?'Wpływa na konto':'Płacone z konta',type:'select',value:f?.acc||S.cfg.accs.find(a=>a.grp=='cur')?.id,options:accOpts()}];
  if(!inc)fields.push({id:'u',label:'📄 Umowa do (opcjonalnie) – przypomnę 2 miesiące wcześniej',type:'date',value:f?.until||''});
  if(!inc&&debtList('owe').length)fields.push({id:'db',label:'🔻 Spłata zobowiązania',type:'select',value:f?.debt||'',options:[['','— nie —'],...debtList('owe').map(d=>[d.id,d.name])]});
  if(inc){fields.push({id:'v',label:'Kwota co miesiąc',type:'select',value:f?.vary?'1':'0',options:[['0','Podpowiadaj ostatnią kwotę'],['1','Zawsze inna – wpisuję od zera']]});
    if(f0?.ppk)fields.push({id:'p',label:'Wpłaty PPK przy tej pensji',type:'select',value:f?.ppk||'',options:[['','Bez PPK'],...invAccs.map(a=>[a.id,a.name])]})}
  const lsrc=inc&&f0?incs().find(x=>x.fixed==f0.id):null;
  const r=await ask({title:f0?(inc?'Edytuj przychód stały':'Edytuj opłatę stałą'):(inc?'Nowy przychód stały':'Nowa opłata stała'),text:inc?(lsrc?`Połączony ze źródłem dochodu „${lsrc.name}” – odhaczenie otwiera pasek (💼 Pensje).`:'Np. najem mieszkania albo świadczenie. Pensje wpisujesz w 💼 Pensje – z paska albo z samej kwoty netto.'):'',fields,ok:f0?'Zapisz':'Dodaj',alt:f0?(inc?'Usuń przychód':'Usuń opłatę'):null});
  if(!r)return;
  if(r=='alt'){if(!await ask({title:inc?'Usunąć przychód stały?':'Usunąć opłatę stałą?',text:f.name+'\nWpisy już zapisane w rejestrze zostaną.',ok:'Usuń',danger:true}))return;S.cfg.fixed=S.cfg.fixed.filter(x=>x.id!=fid);render();delFixedDb(fid);return}
  const amount=pg(r.a),day=Math.round(pnum(r.d));
  if(!r.n.trim())return toast('Podaj nazwę','bad');
  if(amount<=0&&!(inc&&r.v=='1'))return toast('Podaj kwotę większą od zera','bad');
  if(day<1||day>31)return toast('Dzień miesiąca musi być od 1 do 31','bad');
  if(!r.s)return toast('Wybierz pozycję budżetu','bad');
  const body={id:f0?.id||'f'+rid(),name:r.n.trim(),amount,day,sub:r.s,acc:r.c,kind};if(!inc){body.debt=r.db||'';body.until=isDate(r.u)?r.u:''}
  if(inc){body.vary=r.v=='1';body.ppk=r.p||''}
  let tgt=f0;if(f0)Object.assign(f0,body);else{tgt=body;S.cfg.fixed.push(body)}
  render();saveFixed(tgt)}
export async function editFixedTr(f){const savs=S.cfg.accs.filter(a=>(a.grp=='sav'||a.grp=='inv'||a.grp=='sub')&&!a.archived),svd=debtList('owe').filter(d=>d.saveAcc&&(debtState(d).left>0||d.id==f?.saveFor));
  const r=await ask({title:f?'Stały przelew':'Nowy stały przelew na oszczędności',fields:[{id:'n',label:'Nazwa',value:f?.name||'',ph:'np. Oszczędności co miesiąc'},{id:'a',label:'Kwota (zł)',type:'decimal',value:f?f2(f.amount):''},
    {id:'d',label:'Dzień miesiąca (1–31)',type:'int',value:f?.day||10},{id:'c',label:'Z konta',type:'select',value:f?.acc||S.cfg.accs.find(a=>a.grp=='cur'&&accOwner(a)==S.who)?.id||'',options:accOpts()},
    {id:'t',label:'Na konto',type:'select',value:f?.to||savs[0]?.id||'',options:savs.map(a=>[a.id,a.name])},
    ...(svd.length||f?.saveFor?[{id:'sf',label:'💰 Odkładanie na spłatę pożyczki',type:'select',value:f?.saveFor||'',options:[['','— nie —'],...svd.map(d=>[d.id,`${d.name} (na „${accN(d.saveAcc)}”)`])]}]:[])],ok:f?'Zapisz':'Dodaj',alt:f?'Usuń przelew':null});
  if(!r)return;if(r=='alt'){S.cfg.fixed=S.cfg.fixed.filter(x=>x!==f);render();delFixedDb(f.id);return}
  const amount=gr(r.a),day=Math.round(pnum(r.d));if(!r.n.trim()||amount<=0)return toast('Podaj nazwę i kwotę','bad');if(day<1||day>31)return toast('Dzień miesiąca musi być od 1 do 31','bad');if(r.c==r.t)return toast('Wybierz dwa różne konta','bad');
  const sd=r.sf&&S.debts[r.sf];if(sd&&sd.saveAcc!=r.t)return toast(`Na „${sd.name}” odkładasz na koncie „${accN(sd.saveAcc)}” – wybierz je w polu „Na konto”`,'bad');
  const body={id:f?.id||'f'+rid(),name:r.n.trim(),amount,day,sub:'',acc:r.c,to:r.t,kind:'tr',saveFor:sd?r.sf:''};let tgt=f;if(f)Object.assign(f,body);else{tgt=body;S.cfg.fixed.push(body)}render();saveFixed(tgt)}
export const lastOf=(f,pred)=>liveOf(S.tx).filter(t=>pred(t)&&t.date<S.ym+'-01').sort((a,b)=>b.date.localeCompare(a.date))[0];
export async function toggleFixed(fid){if(guard())return;const f=S.cfg.fixed.find(x=>x.id==fid),paid=fixedPaid(fid,S.ym),inc=f.kind=='inc';
  const src=inc&&!paid&&incs().find(x=>x.fixed==fid);if(src)return openSlip(src.id);
  if(paid){const ym=paid.date.slice(0,7),linked=liveOf(S.tx).filter(t=>t.ppkOf===paid.id||t.slipOf===paid.id);
    if(await putTx(ym,paid.id,{deleted:true})){linked.forEach(t=>putTx(t.date.slice(0,7),t.id,{deleted:true}));
      toast('Odznaczono: '+f.name,'',{label:'Cofnij',fn:()=>{putTx(ym,paid.id,{deleted:false});linked.forEach(t=>putTx(t.date.slice(0,7),t.id,{deleted:false}))}})}return}
  const due=fixedDate(f,S.ym),date=td().startsWith(S.ym)?td():due;
  if(f.kind=='tr'){const r=await ask({title:'Przelano: '+f.name,fields:[{id:'a',label:'Kwota (zł)',type:'decimal',value:f2(f.amount)},{id:'d',label:'Data',type:'date',value:date},{id:'c',label:'Z konta',type:'select',value:f.acc,options:accOpts()},{id:'t',label:'Na konto',type:'select',value:f.to,options:accOpts()}],ok:'Odhacz'});
    if(!r)return;const amt=pg(r.a);if(amt<=0)return toast('Podaj kwotę','bad');if(!isDate(r.d)||!r.d.startsWith(S.ym))return toast('Data musi być w miesiącu '+MN[+S.ym.slice(5)-1].toLowerCase(),'bad');if(r.c==r.t)return toast('Wybierz dwa różne konta','bad');
    const sf=f.saveFor&&S.debts[f.saveFor]?.saveAcc==r.t?f.saveFor:'';
    S.justChecked=f.id;if(await putTx(S.ym,'t'+rid(),{type:'tr',amount:amt,date:r.d,sub:'',acc:r.c,to:r.t,who:S.who,note:'🐷 '+f.name,fixedId:f.id,...(sf?{save:{[sf]:amt}}:{}),deleted:false,ts:Date.now()}))toast('Odłożono: '+zl(amt)+(sf?' na spłatę: '+S.debts[sf].name:'')+' 🐷');return}
  if(!inc){
    const r=await ask({title:'Zapłacono: '+f.name,text:'Kwotę możesz zmienić, jeśli w tym miesiącu rachunek był inny.',fields:[
      {id:'a',label:'Kwota (zł)',type:'decimal',value:f2(f.amount)},
      {id:'d',label:'Data zapłaty',type:'date',value:date},
      {id:'c',label:'Z konta',type:'select',value:f.acc,options:accOpts()}],ok:'Odhacz'});
    if(!r)return;const amt=pg(r.a);
    if(amt<=0)return toast('Podaj kwotę większą od zera','bad');
    if(!isDate(r.d)||!r.d.startsWith(S.ym))return toast('Data musi być w miesiącu '+MN[+S.ym.slice(5)-1].toLowerCase(),'bad');
    S.justChecked=f.id;
    if(await putTx(S.ym,'t'+rid(),{type:'exp',amount:amt,date:r.d,sub:f.sub,acc:r.c,to:'',who:S.who,note:f.name,fixedId:f.id,...(f.debt?{debt:f.debt}:{}),deleted:false,ts:Date.now()})){
      const exps=S.cfg.fixed.filter(x=>(x.kind||'exp')=='exp'),all=exps.every(x=>x.id==f.id||fixedPaid(x.id,S.ym));
      if(all&&exps.length>1)celebrate(CELEBRATE.allPaid(S.who));else toast('Zapłacono: '+f.name+' ✓')}
    return}
  {const sl=liveOf(S.tx).find(t=>t.type=='inc'&&t.slip&&t.sub==f.sub&&t.date.startsWith(S.ym));
   if(sl&&!await ask({title:'Ta pensja już jest w tym miesiącu?',text:`Jest już wpływ z paska „${sl.note}” ${zl(sl.amount)}.\nJeśli to ta sama wypłata, nie odhaczaj jej drugi raz – policzyłaby się podwójnie. Najlepiej połącz ten przychód stały ze źródłem dochodu (💼 Pensje).`,ok:'Odhacz mimo to',cancel:'Nie odhaczaj'}))return}
  // income: suggest last month's actual amount; PPK contributions from the payslip
  const last=lastOf(f,t=>t.fixedId===f.id),lastOwn=f.ppk?lastOf(f,t=>t.ppk=='own'&&t.acc===f.ppk&&t.fixedRef===f.id):null,lastEmp=f.ppk?lastOf(f,t=>t.ppk=='emp'&&t.acc===f.ppk&&t.fixedRef===f.id):null;
  const sug=f.vary?'':f2(last?last.amount:f.amount);
  const fields=[{id:'a',label:'Kwota, która wpłynęła (zł)',type:'decimal',value:sug,ph:'z aplikacji banku'},
    {id:'d',label:'Data wpływu',type:'date',value:date},
    {id:'c',label:'Na konto',type:'select',value:f.acc,options:accOpts()}];
  if(f.ppk){fields.push({id:'o',label:'PPK – moja wpłata (zł, z paska wypłaty)',type:'decimal',value:lastOwn?f2(lastOwn.amount):'',ph:'np. 180'});
    fields.push({id:'e',label:'PPK – wpłata pracodawcy (zł)',type:'decimal',value:lastEmp?f2(lastEmp.amount):'',ph:'np. 135'})}
  const r=await ask({title:'Wpłynęło: '+f.name,text:(last?`W poprzednim wpływie: ${zl(last.amount)}. `:'')+'Wpisz dokładną kwotę z banku.'+(f.ppk?'\nWpłaty PPK nie liczą się do budżetu – trafiają na konto „'+accN(f.ppk)+'”.':''),fields,ok:'Odhacz'});
  if(!r)return;const amt=pg(r.a);
  if(amt<=0)return toast('Podaj kwotę, która wpłynęła','bad');
  if(!isDate(r.d)||!r.d.startsWith(S.ym))return toast('Data musi być w miesiącu '+MN[+S.ym.slice(5)-1].toLowerCase(),'bad');
  S.justChecked=f.id;const iid='t'+rid();
  if(await putTx(S.ym,iid,{type:'inc',amount:amt,date:r.d,sub:f.sub,acc:r.c,to:'',who:S.who,note:f.name,fixedId:f.id,deleted:false,ts:Date.now()})){
    if(f.ppk){const own=pg(r.o),emp=pg(r.e),base={date:r.d,sub:'',acc:f.ppk,to:'',who:S.who,deleted:false,ts:Date.now(),ppkOf:iid,fixedRef:f.id};
      if(own>0)putTx(S.ym,'t'+rid(),{...base,type:'inc',amount:own,note:'PPK – moja wpłata',ppk:'own'});
      if(emp>0)putTx(S.ym,'t'+rid(),{...base,type:'inc',amount:emp,note:'PPK – wpłata pracodawcy',ppk:'emp'})}
    toast(`Wpłynęło: ${f.name} ${zl(amt)} ✓`)}}

export function calendarExport(){if(!S.cfg?.fixed?.some(f=>(f.kind||'exp')=='exp'))return toast('Najpierw dodaj opłaty stałe','bad');
  const blob=new Blob([buildIcs(S.cfg.fixed,td())],{type:'text/calendar'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download='oplaty-stale.ics';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000);
  ask({title:'Dodaj do kalendarza',text:'Otwórz pobrany plik „oplaty-stale.ics” i wybierz „Dodaj wszystkie” (iPhone) albo kalendarz, do którego mają trafić.\n\nKażda opłata pojawi się co miesiąc w dniu terminu, z przypomnieniem dzień wcześniej o 18:00.\n\nJeśli zmienisz opłaty, usuń stare wydarzenia i dodaj plik ponownie.',ok:'Rozumiem',cancel:'Zamknij'})}
export function goFixed(){S.ym=td().slice(0,7);S.tab='fix';S.fixSub='fix';S.slip=null;window.scrollTo(0,0);render()}

/* ---------- investments ---------- */
/* old investments module (first app version): shown read-only, can only be deleted together with its register entries */
export async function delInv(iid){if(guard())return;const it=S.inv[iid];if(!it)return;const lots=Object.values(it.lots||{}).filter(l=>!l.deleted);
  if(!await ask({title:'Usunąć starszy wpis inwestycji?',text:it.name+(lots.length?`\nRazem z ${lots.length} zakupami i sprzedażami. Powiązane wpisy w rejestrze kont też zostaną usunięte.`:''),ok:'Usuń',danger:true}))return;
  for(const l of lots)if(l.txId){const t=liveById(l.txId);if(t)await putTx(t.date.slice(0,7),t.id,{deleted:true})}
  w(deleteDoc(doc(INV(),iid)));toast('Usunięto '+it.name)}

/* ---------- investment accounts ---------- */
/* contributed = opening balance + money moved in − money moved out; value change = sum of value updates (adj) */
export function invAccStats(cfg,tx,id,before){const a=cfg.accs.find(x=>x.id==id);let paid=a?.open||0,chg=0,last=null,own=0,emp=0;
  for(const t of tx){if(t.date>=before)continue;
    if(t.acc===id){if(t.type=='adj'){chg+=t.amount;if(!last||t.date>last)last=t.date}else if(t.type=='inc'||t.type=='invs'){paid+=t.amount;if(t.ppk=='own')own+=t.amount;if(t.ppk=='emp')emp+=t.amount}else paid-=t.amount}
    if(t.type=='tr'&&t.to===id)paid+=t.amount2??t.amount}
  const value=paid+chg;return{paid,chg,value,pct:paid>0?chg/paid*100:null,last,own,emp}}
export async function updateValue(id){if(guard())return;const a=S.cfg.accs.find(x=>x.id==id),tom=addDays(td(),1),cur=balance(S.cfg,liveOf(S.tx),id,tom);
  const r=await ask({title:'Aktualna wartość: '+a.name,text:`W aplikacji: ${money(cur,CUR(a))}\nWpisz, ile jest teraz warte konto w aplikacji brokera. Różnicę zapiszę jako zysk albo stratę (nie wpływa na wydatki).`,fields:[{id:'v',label:`Wartość dziś (${curSym(CUR(a))})`,type:'decimal',value:f2(cur)}],ok:'Zapisz wartość'});
  if(!r||!r.v.trim())return;const d=pg(r.v)-cur;if(!d)return toast('Wartość się zgadza');
  const ym=td().slice(0,7),tid='t'+rid();
  if(await putTx(ym,tid,{type:'adj',val:true,amount:d,date:td(),sub:'',acc:id,to:'',who:S.who,note:'Zmiana wartości',deleted:false,ts:Date.now()}))
    toast(`${d>0?'Zysk':'Strata'} ${money(Math.abs(d),CUR(a))} zapisany`,'',{label:'Cofnij',fn:()=>putTx(ym,tid,{deleted:true})})}

/* ---------- savings goals as envelopes: money in savings + investment accounts is assigned to goals ---------- */
export const goalAlloc=g=>g.alloc??g.saved??0;
export const goalOwner=g=>g.owner||'Wspólne';
export const poolNow=(cfg,tx,owner)=>cfg.accs.filter(a=>(a.grp=='sav'||(a.grp=='inv'&&!wrapOf(a)))&&isP(a)&&(!owner||accOwner(a)==owner)).reduce((s,a)=>s+balance(cfg,tx,a.id,addDays(td(),1)),0);
export function goalProgress(g,cfg,tx,today){const saved=goalAlloc(g);
  const pct=g.target?Math.max(0,saved/g.target*100):0,left=Math.max(0,g.target-saved);
  let months=null,perMonth=null;
  if(g.deadline&&left>0){const[y,m]=g.deadline.split('-').map(Number),[cy,cm]=today.split('-').map(Number);months=Math.max(1,(y-cy)*12+(m-cm)+1);perMonth=Math.ceil(left/months)}
  return{saved,pct,left,months,perMonth,done:saved>=g.target&&g.target>0}}
export const unallocated=owner=>poolNow(S.cfg,liveOf(S.tx),owner)-Object.values(S.goals).filter(g=>goalOwner(g)==owner).reduce((a,g)=>a+goalAlloc(g),0);
export async function editGoal(gid,owner){if(guard())return;const g=gid?S.goals[gid]:null;owner=g?goalOwner(g):(owner||'Wspólne');
  const r=await ask({title:g?'Edytuj cel':'Nowy cel (koperta)',text:g?'':`Cel to „koperta”: przydzielacie do niej część oszczędności (${owner=='Wspólne'?'wspólnych':owner=='Mati'?'Matiego':'Werci'}).`,fields:[
    {id:'n',label:'Na co oszczędzacie?',value:g?.name||'',ph:'np. Wakacje 2027'},
    {id:'t',label:'Ile potrzebujecie (zł)',type:'decimal',value:g?f2(g.target):'',ph:'np. 6000'},
    {id:'d',label:'Do kiedy (miesiąc, opcjonalnie)',type:'month',value:g?.deadline||''},
    {id:'o',label:'Czyj cel',type:'select',value:owner,options:[['Mati','Mati'],['Wercia','Wercia'],['Wspólne','Wspólne']]}],
    ok:g?'Zapisz':'Dodaj cel',alt:g?'Usuń cel':null});
  if(!r)return;
  if(r=='alt'){if(!await ask({title:'Usunąć cel?',text:`${g.name}\nPrzydzielone ${zl(goalAlloc(g))} wróci do puli „do przydzielenia”.`,ok:'Usuń',danger:true}))return;const keep=clone(g);w(deleteDoc(doc(GOALS(),gid)));toast('Usunięto cel','',{label:'Cofnij',fn:()=>w(setDoc(doc(GOALS(),gid),keep))});return}
  const target=pg(r.t);if(!r.n.trim())return toast('Podaj nazwę celu','bad');if(target<=0)return toast('Podaj kwotę celu','bad');
  const body={name:r.n.trim(),target,deadline:/^\d{4}-\d{2}$/.test(r.d)?r.d:'',owner:r.o};
  const id=gid||'g'+rid();if(!g)body.alloc=0,body.ts=Date.now();
  merge(doc(GOALS(),id),body);toast(g?'Zapisano cel':'Dodano cel: '+body.name)}
export async function allocGoal(gid,dir){if(guard())return;const g=S.goals[gid],have=goalAlloc(g),own=goalOwner(g),free=unallocated(own);
  if(dir>0&&free<=0)return ask({title:'Brak wolnych pieniędzy',text:`Wszystkie ${own=='Wspólne'?'wspólne oszczędności':'oszczędności ('+own+')'} są już przydzielone do celów. Wpłaćcie coś na takie konto albo zabierzcie z innego celu.`,ok:'OK',cancel:'Zamknij'});
  const sug=dir>0?Math.max(0,Math.min(free,g.target-have)):have;
  const r=await ask({title:(dir>0?'Przydziel do: ':'Zabierz z: ')+g.name,text:dir>0?`Do przydzielenia: ${zl(free)}`:`W kopercie: ${zl(have)}`,fields:[{id:'v',label:'Kwota (zł)',type:'decimal',value:sug?f2(sug):''}],ok:dir>0?'Przydziel':'Zabierz'});
  if(!r)return;const v=pg(r.v);if(v<=0)return;
  if(dir>0&&v>free)return toast('Możesz przydzielić najwyżej '+zl(free),'bad');
  if(dir<0&&v>have)return toast('W kopercie jest tylko '+zl(have),'bad');
  const nv=have+dir*v;merge(doc(GOALS(),gid),{alloc:nv,saved:nv});
  if(dir>0&&nv>=g.target&&have<g.target){setTimeout(()=>celebrate(CELEBRATE.goal(S.who,g.name)),150);return}
  toast(`${dir>0?'Przydzielono':'Zabrano'} ${zl(v)}`,'',{label:'Cofnij',fn:()=>merge(doc(GOALS(),gid),{alloc:have,saved:have})})}
export async function setSavTarget(){if(guard())return;const r=await ask({title:'Ile chcecie odkładać co miesiąc?',text:'Liczą się wpłaty na konta oszczędnościowe i inwestycyjne (także PPK) minus wypłaty z nich. Zmiana kursów inwestycji się nie liczy. Wpisz 0, żeby wyłączyć.',fields:[{id:'v',label:'Kwota miesięcznie (zł)',type:'decimal',value:S.savTarget?f2(S.savTarget):'',ph:'np. 2000'}]});
  if(!r)return;merge(H,{savTarget:Math.max(0,pg(r.v))});toast('Zapisano cel miesięczny')}
export function setSub(k){S.sub=k;render()}
/* bulk reconcile screen in the Accounts tab */
export const recAccs=()=>{const o={cur:0,sub:1,sav:2,inv:3},cur=(S.recScope||'cur')=='cur';return S.cfg.accs.filter(a=>!a.archived&&(cur?a.grp=='cur'||a.grp=='sub':a.grp=='sav'||a.grp=='inv')).slice().sort((a,b)=>o[a.grp]-o[b.grp])};
export function setRecScope(k){recAccs().forEach(a=>{const el=$('rv_'+a.id);if(el)S.recVals[a.id]=el.value});S.recScope=k;render()}
export function openRecon(scope){if(guard())return;S.recon=true;S.recVals={};S.recScope=scope||'cur';window.scrollTo(0,0);render()}
export function closeRecon(){S.recon=false;render()}
export function recRead(all){const tx=liveOf(S.tx),tom=addDays(td(),1),list=all?S.cfg.accs.filter(a=>!a.archived):recAccs();
  return list.map(a=>{const el=$('rv_'+a.id),app=balance(S.cfg,tx,a.id,tom),raw=(el?el.value:(S.recVals[a.id]||'')).trim();return{a,app,filled:raw!=='',real:raw===''?app:pg(raw)}})}
export function recSum(){recAccs().forEach(a=>{const el=$('rv_'+a.id);if(el)S.recVals[a.id]=el.value});const r=recRead(),rp=r.filter(x=>isP(x.a)),app=rp.reduce((s,x)=>s+x.app,0),real=rp.reduce((s,x)=>s+x.real,0),n=r.filter(x=>x.filled).length,d=real-app;
  $('recApp').textContent=zl(app);$('recReal').textContent=zl(real);$('recN').textContent=n?`uzupełniono ${n} z ${r.length}`:'nic jeszcze nie wpisano';
  const el=$('recDiff');el.textContent=(d>0?'+':'')+zl(d);el.className='num '+(d>0?'t-inc':d<0?'t-exp':'');
  r.forEach(x=>{const c=$('rd_'+x.a.id);if(c){const dd=x.real-x.app;c.textContent=x.filled&&dd?(dd>0?'+':'')+money(dd,CUR(x.a)):'';c.className='rdiff '+(dd>0?'t-inc':'t-exp')}})}
export async function applyRecon(){recAccs().forEach(a=>{const el=$('rv_'+a.id);if(el)S.recVals[a.id]=el.value});const r=recRead(true).filter(x=>x.filled&&x.real!==x.app);
  if(!r.length)return toast('Wszystko się zgadza – nic do zmiany');
  const ops=planRecon(r.map(x=>({id:x.a.id,d:x.real-x.app,inv:x.a.grp=='inv',cur:CUR(x.a)})));
  const lines=ops.map(o=>o.kind=='tr'?`⇄ ${accN(o.from)} → ${accN(o.to)}: ${am(o.amount,o.from)}`:o.kind=='val'?`📈 ${accN(o.acc)}: zmiana wartości ${o.amount>0?'+':''}${am(o.amount,o.acc)}`:`⚖️ ${accN(o.acc)}: wyrównanie ${o.amount>0?'+':''}${am(o.amount,o.acc)}`).join('\n');
  const tr=ops.filter(o=>o.kind=='tr').length,adj=ops.filter(o=>o.kind=='adj').length;
  if(!await ask({title:'Zapisać te zmiany?',text:lines+`\n\n${tr?'Przelewy (⇄) przenoszą pieniądze między kontami i nie wpływają na budżet. ':''}${adj?'Wyrównania (⚖️) to różnica, której nie da się wyjaśnić przelewem – też nie liczą się do wydatków. ':''}`,ok:'Zapisz'}))return;
  const ym=td().slice(0,7),date=td(),ids=[];
  for(const o of ops){const id='t'+rid();ids.push(id);
    const base={date,sub:'',who:S.who,deleted:false,ts:Date.now()};
    putTx(ym,id,o.kind=='tr'?{...base,type:'tr',amount:o.amount,acc:o.from,to:o.to,note:'Wyrównanie sald – przeniesienie'}:{...base,type:'adj',amount:o.amount,acc:o.acc,to:'',note:o.kind=='val'?'Zmiana wartości':'Wyrównanie salda',...(o.kind=='val'?{val:true}:{})})}
  S.recon=false;render();
  toast(`Zapisano ${ops.length} ${ops.length==1?'zmianę':ops.length<5?'zmiany':'zmian'}`,'',{label:'Cofnij',fn:()=>ids.forEach(id=>putTx(ym,id,{deleted:true}))})}
/* savings / investment accounts managed from the Savings tab */
export async function addSavAcc(owner){if(guard())return;
  const r=await ask({title:'Nowe konto – '+owner,fields:[{id:'n',label:'Nazwa',ph:owner=='Wspólne'?'np. Fundusz wakacyjny':'np. Konto oszczędnościowe '+owner}, {id:'g',label:'Rodzaj',type:'select',value:'sav',options:[['sav','Oszczędności (stała kwota)'],['inv','Inwestycje / IKE / IKZE (zmienna wartość)']]},{id:'c',label:'Waluta',type:'select',value:'PLN',options:CUR_OPTS}],ok:'Dodaj konto'});
  if(!r||!r.n.trim())return;const a={id:'a'+rid(),name:r.n.trim(),grp:r.g,owner,open:0,...(r.c!='PLN'?{cur:r.c}:{})};S.cfg.accs.push(a);render();saveAcc(a);toast('Dodano konto: '+a.name)}
export async function editSavAcc(id){if(guard())return;const a=S.cfg.accs.find(x=>x.id==id);
  const r=await ask({title:'Konto: '+a.name,fields:[{id:'n',label:'Nazwa',value:a.name},{id:'g',label:'Rodzaj',type:'select',value:a.grp,options:[['sav','Oszczędności (stała kwota)'],['inv','Inwestycje / IKE / IKZE (zmienna wartość)']]},{id:'w',label:'Czyje',type:'select',value:accOwner(a),options:[['Mati','Mati'],['Wercia','Wercia'],['Wspólne','Wspólne']]},{id:'c',label:'Waluta',type:'select',value:CUR(a),options:CUR_OPTS},...(a.grp=='inv'?[WRAP_F(a)]:[])],alt:'Usuń konto'});
  if(!r)return;if(r=='alt')return removeSavAcc(id);
  if(r.c!=CUR(a)&&liveOf(S.tx).some(t=>t.acc===id||t.to===id)&&!await ask({title:'Zmienić walutę konta?',text:`${a.name}: ${CUR(a)} → ${r.c}\nKwoty nie zostaną przeliczone – zmieni się tylko waluta, w której są pokazane.`,ok:'Zmień walutę'}))return;
  if(r.n.trim())a.name=r.n.trim();a.grp=r.g;a.owner=r.w;if(r.c!=CUR(a))a.cur=r.c;if(r.x!=null)setWrap(a,r.x);render();saveAcc(a)}
export async function removeSavAcc(id){const a=S.cfg.accs.find(x=>x.id==id),tx=liveOf(S.tx),tom=addDays(td(),1),bal=balance(S.cfg,tx,id,tom),own=accOwner(a);
  const others=S.cfg.accs.filter(x=>x.id!=id&&!x.archived&&(x.grp=='sav'||x.grp=='inv')&&CUR(x)==CUR(a));
  const pref=others.find(x=>accOwner(x)==own&&x.grp=='sav'&&/oszcz/i.test(x.name))||others.find(x=>accOwner(x)==own&&x.grp=='sav')||others.find(x=>accOwner(x)==own)||others.find(x=>x.grp=='sav');
  let target=null;
  if(bal!==0){if(!pref)return ask({title:'Nie można usunąć',text:'Na tym koncie są pieniądze, a nie ma innego konta oszczędnościowego, na które można je przenieść.',ok:'OK',cancel:'Zamknij'});
    const r=await ask({title:'Usunąć konto „'+a.name+'”?',text:`Na koncie jest ${money(bal,CUR(a))}. Przeniosę tę kwotę na wybrane konto. Historia wpłat zostanie zachowana.`,fields:[{id:'t',label:'Przenieś pieniądze na',type:'select',value:pref.id,options:[...['Mati','Wercia','Wspólne'].map(o=>({group:o,items:others.filter(x=>accOwner(x)==o).map(x=>[x.id,x.name])})).filter(g=>g.items.length)]}],ok:'Przenieś i usuń',danger:true});
    if(!r)return;target=r.t}
  else if(!await ask({title:'Usunąć konto „'+a.name+'”?',text:'Konto jest puste. Historia zostanie zachowana.',ok:'Usuń',danger:true}))return;
  const ym=td().slice(0,7);
  if(target)putTx(ym,'t'+rid(),bal>0?{type:'tr',amount:bal,date:td(),sub:'',acc:id,to:target,who:S.who,note:'Zamknięcie konta '+a.name,deleted:false,ts:Date.now()}:{type:'tr',amount:-bal,date:td(),sub:'',acc:target,to:id,who:S.who,note:'Zamknięcie konta '+a.name,deleted:false,ts:Date.now()});
  const used=S.tx.some(t=>t.acc===id||t.to===id)||a.open;
  if(used){a.archived=true;saveAcc(a)}else{S.cfg.accs=S.cfg.accs.filter(x=>x.id!=id);delAccDb(id)}
  render();toast(target?`Usunięto konto. ${money(Math.abs(bal),CUR(a))} → ${accN(target)}`:'Usunięto konto')}

/* ---------- backup ---------- */
export async function exportJson(withPhotos){if(!S.cfg)return;let receipts;
  if(withPhotos===true){toast('Zbieram zdjęcia…');try{receipts={};(await getDocs(RCPT())).docs.forEach(d=>receipts[d.id]=d.data())}catch(e){err(e);return toast('Nie udało się pobrać zdjęć – spróbuj przy dobrym internecie','bad')}}
  const data=JSON.stringify({format:'budzet-mw-2',exported:new Date().toISOString(),cfg:S.cfg,savTarget:S.savTarget,tx:S.tx,plans:S.plans,inv:S.inv,goals:S.goals,slips:S.slips,hold:S.hold,debts:S.debts,...(receipts?{receipts}:{})},null,receipts?0:1);
  const name=(receipts?'budzet-kopia-ze-zdjeciami-':'budzet-kopia-')+td()+'.json',blob=new Blob([data],{type:'application/json'});
  const file=typeof File=='function'?new File([blob],name,{type:'application/json'}):null;
  const mobile=matchMedia('(pointer:coarse)').matches;
  if(mobile&&file&&navigator.canShare&&navigator.canShare({files:[file]})){
    try{await navigator.share({files:[file],title:'Kopia budżetu'});markBackup();toast('Kopia zapisana ✓')}
    catch(e){if(e?.name!='AbortError'){err(e);downloadBlob(blob,name);markBackup()}}
    return}
  downloadBlob(blob,name);markBackup();toast('Pobrano kopię ✓')}
export function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}
export const META=()=>doc(H,'meta','backup');
export function markBackup(){w(setDoc(META(),{at:Date.now(),who:S.who}))}
export async function writeTxs(list){const by={};list.forEach(([id,t])=>{const ym=t.date.slice(0,7);(by[ym]=by[ym]||{})[id]=t});
  for(const ym of Object.keys(by).sort())merge(doc(MC(),ym),{tx:by[ym]});return true}
export async function writePlans(map){for(const[ym,d]of Object.entries(map)){if(Object.keys(d).length)merge(doc(PLC(),ym),d)}return true}
/* fuzzy name matching for transaction-list imports: words without brackets/punctuation */
export const toks=n=>new Set(String(n||'').toLowerCase().replace(/\(.*?\)/g,' ').replace(/^\s*\d+\s*[.)]\s*/,'').split(/[^0-9a-ząćęłńóśźż+-]+/i).filter(w=>w.length>=3&&!['oraz','dla','the'].includes(w)));
export const simTok=(a,b)=>{const A=toks(a),B=toks(b);if(!A.size||!B.size)return 0;let k=0;A.forEach(w=>{if(B.has(w))k++});return k/Math.min(A.size,B.size)};
export function matchSub(cfg,catName,subName,type){const want=type=='inc'?'inc':'exp';let best=null;
  for(const c of cfg.cats){if(c.type!=want)continue;const cs=simTok(c.name,catName);
    for(const x of c.subs){const exact=x.name.trim().toLowerCase()==subName.trim().toLowerCase();const sc=exact?10:simTok(x.name,subName)+(cs>=.5?.5:0);
      if(!best||sc>best.sc)best={sc,sub:x,cat:c,exact}}}
  return best&&(best.exact||best.sc>=1.1)?best:null}
/* rows without an id get one from their content (plus a counter for identical rows), so loading the same file twice adds nothing */
export const hashId=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(36)};
export async function importTxList(o){const cfg=S.cfg,list=(o.tx||[]).filter(t=>isDate(t.date)&&t.amount>0&&['inc','exp','tr'].includes(t.type));
  const acc=n=>cfg.accs.find(a=>a.name.trim().toLowerCase()==String(n||'').trim().toLowerCase());
  const newAccs=[...new Set(list.flatMap(t=>[t.acc,t.to]).filter(n=>n&&!acc(n)))];
  const mapped=[],fuzzy=new Map(),missing=new Map();
  for(const t of list){let sub='';if(t.type!='tr'&&t.sub){const m=matchSub(cfg,t.cat,String(t.sub),t.type);
      if(m){sub=m.sub.id;if(!m.exact)fuzzy.set(t.sub,m.sub.name)}else missing.set(t.sub,t.cat)}
    mapped.push({t,sub})}
  const n=list.length,inc=list.filter(t=>t.type=='inc').reduce((a,t)=>a+t.amount,0),exp=list.filter(t=>t.type=='exp').reduce((a,t)=>a+t.amount,0);
  const dates=list.map(t=>t.date).sort();
  const trW=n==1?'transakcja':(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20))?'transakcje':'transakcji';let text=`${n} ${trW} z okresu ${dates[0].split('-').reverse().join('.')}–${dates.at(-1).split('-').reverse().join('.')}\nprzychody ${zl(inc)} · wydatki ${zl(exp)}`;
  if(fuzzy.size)text+=`\n\nDopasowane do Waszych pozycji:\n`+[...fuzzy].map(([a,b])=>`• ${a} → ${b}`).join('\n');
  if(missing.size)text+=`\n\nNowe pozycje (zostaną dodane):\n`+[...missing].map(([a,c])=>`• ${a} (${cleanCat(c)})`).join('\n');
  if(newAccs.length)text+=`\n\nNowe konta (zostaną dodane): ${newAccs.join(', ')}`;
  text+='\n\nTransakcje zostaną dopisane. Wczytanie tego samego pliku drugi raz niczego nie zdubluje.';
  if(!await ask({title:'Wczytać transakcje?',text,ok:'Wczytaj'}))return;
  for(const name of newAccs){const a={id:'a'+rid(),name,grp:'cur',open:0};cfg.accs.push(a);saveAcc(a)}
  for(const[name,catName]of missing){const want=list.find(t=>t.sub==name).type=='inc'?'inc':'exp';
    let c=cfg.cats.filter(k=>k.type==want).map(k=>({k,s:simTok(k.name,catName)})).sort((a,b)=>b.s-a.s)[0];
    let k=c&&c.s>=.5?c.k:null;if(!k){k={id:'c'+rid(),name:cleanCat(catName)||'Inne',type:want,hue:freeHue(cfg.cats),subs:[]};cfg.cats.push(k);saveCat(k)}
    const x={id:'s'+rid(),name,};k.subs.push(x);saveSub(k,x);mapped.forEach(m=>{if(m.t.sub==name&&m.t.type!='tr')m.sub=x.id})}
  const seen={},idOf=t=>{if(t.id)return t.id;const k=[t.date,t.type,t.amount,t.cat,t.sub,t.acc,t.to,t.note,t.who].join('|');seen[k]=(seen[k]||0)+1;return'b'+hashId(k+'#'+seen[k])};
  await writeTxs(mapped.map(({t,sub})=>[idOf(t),{type:t.type,amount:t.amount,date:t.date,sub,acc:acc(t.acc)?.id||'',to:t.type=='tr'?(acc(t.to)?.id||''):'',who:t.who||'',note:t.note||'',deleted:false,ts:Date.now()}]));
  render();toast(`Wczytano: ${n} ${trW} ✓`)}
/* a backup file: plain .json, or .json.gz from the monthly backup e-mail */
export async function readBackup(file){const buf=new Uint8Array(await file.arrayBuffer());
  if(buf[0]==0x1f&&buf[1]==0x8b){if(!('DecompressionStream' in window))throw new Error('gzip');return await new Response(new Blob([buf]).stream().pipeThrough(new window.DecompressionStream('gzip'))).text()}
  return new window.TextDecoder().decode(buf)}
export async function importFile(file){if(guard())return;let o;
  try{o=JSON.parse(await readBackup(file))}catch(e){return ask({title:'To nie jest plik kopii',text:'Wybierz plik .json (albo .json.gz z maila z kopią) pobrany przyciskiem „Pobierz kopię”.',ok:'OK',cancel:'Zamknij'})}
  if(o&&o.format=='budzet-mw-tx'&&Array.isArray(o.tx))return importTxList(o);
  const isNew=o&&o.cfg&&Array.isArray(o.tx),isOld=o&&Array.isArray(o.categories)&&Array.isArray(o.transactions);
  if(!isNew&&!isOld)return ask({title:'Nie rozpoznaję tego pliku',text:'To nie jest kopia budżetu z tej ani ze starej wersji aplikacji.',ok:'OK',cancel:'Zamknij'});
  const n=isNew?o.tx.filter(t=>!t.deleted).length:o.transactions.length;
  if(!await ask({title:'Wczytać kopię?',text:`Znaleziono ${n} transakcji.\n${isNew?'Konta, pozycje budżetu i opłaty stałe zostaną zastąpione tymi z kopii.':'Brakujące konta i pozycje zostaną dopisane.'} Transakcje o tym samym numerze zostaną nadpisane, reszta zostaje.`,ok:'Wczytaj'}))return;
  toast('Wczytywanie…');
  try{let ok;
    if(isNew){S.cfg=clone(o.cfg);S.cfg.fixed=S.cfg.fixed||[];S.cfg.round=S.cfg.round||[];S.cfg.incs=S.cfg.incs||[];S.cfg.years=S.cfg.years||[];S.cfg.projs=S.cfg.projs||[];S.cfg.rems=S.cfg.rems||[];if(o.savTarget!=null)S.savTarget=o.savTarget;await saveCfg();
      ok=await writeTxs(o.tx.filter(t=>isDate(t.date)).map(t=>{const{id,...b}=t;return[id||('t'+rid()),b]}));
      ok=(await writePlans(o.plans||{}))&&ok;
      for(const[id,it]of Object.entries(o.inv||{}))ok=(await putInv(id,it))&&ok;
      for(const[id,g]of Object.entries(o.goals||{}))merge(doc(GOALS(),id),g);
      for(const[ym,sl]of Object.entries(o.slips||{}))merge(doc(SLIPS(),ym),{s:sl});
      for(const[id,x]of Object.entries(o.hold||{}))merge(doc(HOLD(),id),x);
      for(const[id,x]of Object.entries(o.debts||{}))merge(doc(DEBTS(),id),x);
      if(o.receipts&&typeof o.receipts=='object'){let n=0,b=0;for(const[id,r]of Object.entries(o.receipts)){if(!r?.data)continue;await setDoc(doc(RCPT(),id),r).catch(err);phCache.set(id,r)}
        try{(await getDocs(RCPT())).docs.forEach(d=>{n++;b+=+d.data().size||0})}catch(e){}merge(RMETA(),{n,bytes:b})}}
    else{const sm={},am={};S.cfg.cats.forEach(c=>c.subs.forEach(s=>sm[s.name]=s.id));S.cfg.accs.forEach(a=>am[a.name]=a.id);
      o.categories.forEach(c=>{const bil=c.typ=='BILANS_KONTA'||c.typ=='BILANS_OSZCZ';(c.podkategorie||[]).forEach(nm=>{
        if(bil){if(!am[nm]){am[nm]='a'+rid();S.cfg.accs.push({id:am[nm],name:nm,grp:c.typ=='BILANS_KONTA'?'cur':'sav',open:0})}}
        else if(!sm[nm]){let k=S.cfg.cats.find(x=>cleanCat(x.name)==cleanCat(c.nazwa));if(!k){k={id:'c'+rid(),name:cleanCat(c.nazwa),type:c.typ=='PRZYCHOD'?'inc':'exp',hue:freeHue(S.cfg.cats),subs:[]};S.cfg.cats.push(k)}sm[nm]='s'+rid();k.subs.push({id:sm[nm],name:nm})}})});
      const ob=o.openingBalancesBase||o.openingBalancesJan||{};S.cfg.accs.forEach(a=>{if(ob[a.name]!==undefined)a.open=Math.round(ob[a.name]*100)});
      await saveCfg();
      ok=await writeTxs(o.transactions.filter(t=>isDate(t.date)).map(t=>['imp_'+t.id,{type:t.type=='Przychód'?'inc':t.type=='Wydatek'?'exp':'tr',amount:Math.round(Math.abs(t.amount)*100),date:t.date,sub:sm[t.subcategory]||'',acc:am[t.account]||'',to:am[t.targetAccount]||'',who:(/^\[(Mati|Wercia)\]/.exec(t.note||'')||[])[1]||'',note:String(t.note||'').replace(/^\[(Mati|Wercia)\]\s*/,''),deleted:false,ts:Date.now()}]));
      const pp=o.plansByYear||{[String(new Date().getFullYear())]:o.plans||{}},pm={};
      Object.keys(pp).forEach(y=>Object.keys(pp[y]||{}).forEach(m=>{const d={};Object.entries(pp[y][m]||{}).forEach(([nm,v])=>{if(sm[nm]&&v)d[sm[nm]]=Math.round(v*100)});pm[y+'-'+p2(+m+1)]=d}));
      ok=(await writePlans(pm))&&ok}
    toast(`Wczytano ${n} transakcji`)}
  catch(e){err(e);toast('Błąd wczytywania: '+(e.message||e),'bad')}}

export function backupH(){if(!S.tx.length)return'';const b=S.backup,days=b?Math.floor((Date.now()-b.at)/864e5):null;
  if(b&&days<30)return'';
  return`<button class="alert info" onclick="exportJson()"><b>💾 ${b?`Ostatnia kopia danych: ${days} dni temu`:'Nie zrobiliście jeszcze kopii danych'}</b><span class="mini">Stuknij, żeby zapisać kopię na telefonie (np. w Plikach / na Dysku). Zajmie to chwilę.</span></button>`}

/* ---------- register search & filters ---------- */
/* amount filters typed into the search (zł): ">200", "<50", ">=100", "100-300"; the rest of the text is searched as words */
export function amtQuery(raw){const f=[];
  const q=raw.toLowerCase().replace(/(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)/g,(m,a,b)=>{const lo=pg(a),hi=pg(b);if(lo>hi)return m;f.push(v=>v>=lo&&v<=hi);return' '})
    .replace(/([<>]=?)\s*(\d+(?:[.,]\d+)?)/g,(m,op,a)=>{const x=pg(a);f.push(op=='>'?v=>v>x:op=='>='?v=>v>=x:op=='<'?v=>v<x:v=>v<=x);return' '});
  return{q:q.trim(),f}}
export function txMatches(t,sm,F,ym,AQ){
  if(F.scope=='m'&&!t.date.startsWith(ym))return false;
  if(F.scope=='y'&&!t.date.startsWith(ym.slice(0,4)))return false;
  if(F.type&&!(t.type==F.type||(F.type=='inv'&&t.type=='invs')))return false;
  if(F.who&&t.who!==F.who)return false;
  if(F.acc&&t.acc!==F.acc&&t.to!==F.acc)return false;
  if(F.cat&&sm[t.sub]?.cat.id!==F.cat)return false;
  if(AQ.f.some(fn=>!fn(Math.abs(t.amount))))return false;
  const q=AQ.q;if(!q)return true;
  const s=sm[t.sub],amt=(Math.abs(t.amount)/100).toFixed(2);
  const hay=[t.note,s?.name,s?cleanCat(s.cat.name):'',accN(t.acc),t.to?accN(t.to):'',t.who,t.date,t.date.split('-').reverse().join('.'),amt,amt.replace('.',','),amt.replace(/\.00$/,''),
    {exp:'wydatek',inc:'przychód',tr:'przelew',inv:'zakup inwestycja',invs:'sprzedaż inwestycja',adj:'wyrównanie'}[t.type],t.refundOf?'zwrot':'',t.split?'paragon':''].join(' ').toLowerCase();
  return q.split(/\s+/).every(w=>hay.includes(w.replace(',','.'))||hay.includes(w))}
export function txRowH(t,sm,rf={},cn={}){const M=v=>am(v,t.acc),k=t.type,sg=k=='inc'||k=='invs'?'+':k=='exp'||k=='inv'||k=='lend'?'−':k=='adj'?(t.amount>=0?'+':'−'):'';
  const cls=k=='invs'?'inv':k=='lend'?'tr':t.lendOf||t.debtIn?'tr':k,s=sm[t.sub],c=s&&(k=='exp'||k=='inc')?s.cat:null;
  const title=t.ppk||k=='lend'||t.lendOf||t.debtIn||t.payoff?t.note:k=='tr'?accN(t.acc)+' → '+accN(t.to):k=='adj'?(t.val?'Zmiana wartości inwestycji':'Wyrównanie salda'):k=='inv'?'Zakup: '+t.note:k=='invs'?'Sprzedaż: '+t.note:t.refundOf?'↩️ Zwrot · '+(s?.name||''):(t.fixedId?'📌 ':'')+(s?.name||'Bez pozycji');
  const ico=c?`<span class="tico" style="${catColor(c)}">${catIcon(c)}</span>`:`<span class="tico n">${t.ppk?'🏦':t.payoff?'✅':t.roundOf?'🪙':k=='lend'||t.lendOf?'🔺':t.debtIn?'🔻':k=='tr'?'⇄':k=='adj'?(t.val?'📈':'⚖️'):k=='inv'?'📈':k=='invs'?'📉':'💠'}</span>`;
  return`<button class="tx" data-id="${t.id}" onclick="openTx('${t.id}')">${ico}<span class="info">${c?`<span class="tcat" style="${catColor(c)}">${esc(cleanCat(c.name))}</span>`:''}<b>${esc(title)}</b><span class="meta">${k=='tr'?'Przelew'+(t.amount2?' · wpłynęło '+am(t.amount2,t.to):''):esc(accN(t.acc))}${t.who?' · '+esc(t.who):''}${t.split?' · ✂️ paragon':''}${t.rcpt?.length?' · 📷':''}</span>${t.note&&k!='adj'&&k!='inv'&&k!='invs'&&k!='lend'&&!t.ppk&&!t.lendOf&&!t.debtIn&&!t.payoff?`<div class="note">${esc(t.note)}</div>`:''}${t.debt&&S.debts[t.debt]?`<div class="coinl" style="color:#9f1239">${t.payoff?'nie liczy się w Budżecie – to oddanie pożyczki':'🔻 spłata: '+esc(S.debts[t.debt].name)}</div>`:''}${t.save&&k=='tr'?Object.entries(t.save).filter(([i,v])=>v&&S.debts[i]).map(([i,v])=>`<div class="coinl" style="color:#a16207">💰 ${v>0?'na spłatę':'z odłożonych'}: ${esc(S.debts[i].name)} ${M(Math.abs(v))}</div>`).join(''):''}${t.war?`<div class="coinl" style="color:${t.war<td()?'#94a3b8':'#0e7490'}">🛡️ gwarancja do ${t.war.split('-').reverse().join('.')}</div>`:''}${t.ulga&&ULGI[t.ulga]?`<div class="coinl" style="color:#6d28d9">🧾 ${ULGI[t.ulga].n}</div>`:''}${rf[t.id]?`<div class="ref">↩️ zwrócono ${M(rf[t.id])} z ${M(t.amount)}</div>`:''}${cn[t.id]?`<div class="coinl">🪙 drobne +${M(cn[t.id].amount)} → ${esc(accN(cn[t.id].to))}</div>`:''}</span><span class="amt num t-${cls}">${sg}${M(Math.abs(t.amount))}</span></button>`}
export function txListH(){const sm=subsMap(S.cfg),F=S.f,tx=liveOf(S.tx),AQ=amtQuery(F.q.trim());
  const l=tx.filter(t=>txMatches(t,sm,F,S.ym,AQ)).sort((a,b)=>b.date.localeCompare(a.date)||(b.ts||0)-(a.ts||0));
  const filtered=F.q||F.type||F.who||F.acc||F.cat||F.scope!='m',rf={};
  tx.forEach(t=>{if(t.refundOf)rf[t.refundOf]=(rf[t.refundOf]||0)+t.amount});
  /* drobne are shown under their expense (as their own row only when the expense is not on the list, or when filtering transfers) */
  const cn={},ids=new Set(l.map(t=>t.id));tx.forEach(t=>{if(t.roundOf&&ids.has(t.roundOf)&&F.type!='tr')cn[t.roundOf]=t});
  const lv=l.filter(t=>!(t.roundOf&&cn[t.roundOf]===t));
  if(!l.length)return filtered?catsEmpty('Nic nie znaleziono.<br>Zmień wyszukiwanie albo filtry.',1,'lupa'):catsEmpty('Brak transakcji w tym miesiącu.<br>Dodaj pierwszą przyciskiem ＋ w prawym dolnym rogu.',0,'box');
  let h='';
  if(filtered){const E={},I={},ad=(m,t,v)=>{const c=accCur(t.acc);m[c]=(m[c]||0)+v};
    l.forEach(t=>{if(t.type=='exp'&&!t.payoff)ad(E,t,t.amount);else if(t.refundOf)ad(E,t,-t.amount);else if(t.type=='inc')ad(I,t,t.amount)});
    const sx=m=>((m.PLN?zl(m.PLN):'')+fxPlus({...m,PLN:0})).replace(/^ \+ /,''),e=sx(E),i=sx(I);
    h+=`<div class="fsum"><b>${lv.length} ${plu(lv.length,'wpis','wpisy','wpisów')}</b>${e?` · wydatki <b class="t-exp">${e}</b>`:''}${i?` · przychody <b class="t-inc">${i}</b>`:''}</div>`}
  const days={};lv.forEach(t=>(days[t.date]=days[t.date]||[]).push(t));
  const yr=F.scope!='m';
  h+=Object.entries(days).slice(0,400).map(([d,ts])=>{const dd=new Date(d+'T12:00:00').toLocaleDateString('pl-PL',yr?{weekday:'short',day:'numeric',month:'long',year:'numeric'}:{weekday:'long',day:'numeric',month:'long'});
    return`<div class="day">${esc(dd)}</div><div class="list">${ts.map(t=>txRowH(t,sm,rf,cn)).join('')}</div>`}).join('');
  return h}
export let qT=null;
export function setQ(v){S.f.q=v;clearTimeout(qT);qT=setTimeout(()=>{const el=$('txlist');if(el)el.innerHTML=txListH()},150)}
export function setF(k,v){S.f[k]=v;if(document.activeElement?.id=='fq')document.activeElement.blur();render()}
export function clearF(){S.f={q:'',type:'',who:'',acc:'',cat:'',scope:'m'};if(document.activeElement?.id=='fq')document.activeElement.blur();render()}