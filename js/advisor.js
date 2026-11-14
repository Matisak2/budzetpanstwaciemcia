/* 🧭 Doradca – pure calculations (no UI, no saving; tested in tests/calc.mjs). Amounts in grosze (PLN).
   D1a: asset groups and classes (built-in + own `assetCls`), the list of known ETFs (checked in XTB), the class of every instrument and account,
   „what the wealth is made of” (allocP) and the analysis of held ETFs (criteria, doubled „whole worlds”, flags). PPK is left out everywhere (decision 5). */
import {addDays,zl0} from './util.js';
import {balance,ownerOf} from './logic.js';
import {BONDS,instValue,instDiffP,wrapOf,limitOf,paidInYear} from './inv.js';
import {debtStateP} from './today.js';

/* groups = the first ring of the wheel; c = pastel colour */
export const AGRP={cash:{n:'Gotówka i bezpieczne',i:'💵',c:'hsl(160 48% 70%)'},bond:{n:'Obligacje',i:'🧾',c:'hsl(208 62% 74%)'},stock:{n:'Akcje',i:'📈',c:'hsl(272 50% 76%)'},
  gold:{n:'Złoto i surowce',i:'🥇',c:'hsl(44 80% 68%)'},real:{n:'Nieruchomości',i:'🏠',c:'hsl(18 72% 74%)'},alt:{n:'Alternatywne',i:'🧪',c:'hsl(338 58% 78%)'},
  own:{n:'Własne',i:'✨',c:'hsl(186 44% 70%)'},todo:{n:'Do przypisania',i:'❓',c:'#cbd5e1'}};
export const AGRP_ORDER=['cash','bond','stock','gold','real','alt','own','todo'];
/* risk = how the class behaves in a crisis (the crisis test in D5): safe / bond / stock / gold / high */
export const RISKS=[['safe','bezpieczne (jak konto)'],['bond','jak obligacje'],['stock','jak akcje'],['gold','jak złoto'],['high','bardzo ryzykowne']];
const C=(n,i,g,risk)=>({n,i,g,risk});
export const ACLS={
  cash:C('Konta i gotówka','🏦','cash','safe'),deposit:C('Lokaty','🔒','cash','safe'),mmf:C('Fundusze krótkoterminowych papierów skarbowych','🧺','cash','safe'),
  b_fix:C('Obligacje skarbowe stałe (OTS, ROR, DOR, TOS)','🏛️','bond','safe'),b_idx:C('Obligacje skarbowe indeksowane (COI, EDO, ROS, ROD)','🏛️','bond','safe'),
  b_mkt:C('Obligacje rynkowe / ETF obligacji','📜','bond','bond'),b_corp:C('Obligacje korporacyjne','🏢','bond','bond'),b_fund:C('Inne fundusze dłużne','🧺','bond','bond'),
  s_world:C('Akcje – cały świat','🌍','stock','stock'),s_dev:C('Akcje – kraje rozwinięte','🏙️','stock','stock'),s_em:C('Akcje – rynki wschodzące','🌏','stock','stock'),
  s_pl:C('Akcje – Polska','🇵🇱','stock','stock'),s_us:C('Akcje – USA','🇺🇸','stock','stock'),s_eu:C('Akcje – Europa','🇪🇺','stock','stock'),s_reg:C('Akcje – inne regiony','🗺️','stock','stock'),
  s_single:C('Pojedyncze spółki','🎯','stock','high'),s_theme:C('Akcje tematyczne / sektorowe','🔭','stock','high'),s_div:C('Akcje dywidendowe','💸','stock','stock'),
  g_phys:C('Złoto fizyczne','🪙','gold','gold'),g_etc:C('Złoto „papierowe” (ETC)','📄','gold','gold'),g_metal:C('Srebro i inne metale','⚪','gold','high'),g_comm:C('Surowce (indeks)','🛢️','gold','high'),
  r_home:C('Mieszkanie własne','🏡','real','safe'),r_rent:C('Mieszkanie na wynajem','🏘️','real','bond'),r_land:C('Działka','🌳','real','bond'),r_garage:C('Garaż / komórka','🚗','real','bond'),
  r_comm:C('Lokal użytkowy','🏬','real','bond'),r_reit:C('Fundusze nieruchomości (REIT)','🏢','real','stock'),
  x_crypto:C('Kryptowaluty','🪙','alt','high'),x_coll:C('Przedmioty kolekcjonerskie','🖼️','alt','high'),x_firm:C('Udziały w firmie','🤝','alt','high'),x_loan:C('Pożyczki prywatne (inwestycja)','🤲','alt','high'),
  todo:C('Do przypisania','❓','todo','stock')};
/* every class, built-in and own (assetCls{id:{name,icon,hue,grp,risk,o}}); own ones never replace built-in ones */
export function clsAll(custom={}){const own=Object.fromEntries(Object.entries(custom||{}).filter(([id,x])=>x&&!x.deleted&&!ACLS[id]).sort((a,b)=>(a[1].o??0)-(b[1].o??0))
  .map(([id,x])=>[id,{n:x.name||'Własna klasa',i:x.icon||'✨',g:AGRP[x.grp]&&x.grp!='todo'?x.grp:'own',risk:x.risk||'stock',hue:x.hue,own:true}]));return{...ACLS,...own}}

/* 📋 the ETFs from Matis list – „Szczegóły instrumentu” in XTB, 14.11.2026 (ISIN, TER, assets in bn USD); aliases = other listings of the same fund (same ISIN).
   cov = what it covers: world (developed + emerging), dev, em; fam = the index family (in a pair better keep one) */
export const ETF_AT='2026-11-14';
export const ETFS=[
  {t:'VWCE',ex:'DE',al:['VWRA'],n:'Vanguard FTSE All-World (Acc)',isin:'IE00BK5BQT80',idx:'FTSE All-World',fam:'FTSE',cov:'world',cls:'s_world',ter:0.14,cur:'EUR',aum:64.45},
  {t:'FWIA',ex:'DE',al:[],n:'Invesco FTSE All-World (Acc)',isin:'IE000716YHJ7',idx:'FTSE All-World',fam:'FTSE',cov:'world',cls:'s_world',ter:0.15,cur:'EUR',aum:4.82},
  {t:'ISAC',ex:'UK',al:[],n:'iShares MSCI ACWI (Acc)',isin:'IE00B6R52259',idx:'MSCI ACWI',fam:'MSCI',cov:'world',cls:'s_world',ter:0.20,cur:'USD',aum:35.33},
  {t:'SWDA',ex:'UK',al:['IWDA','EUNL'],n:'iShares Core MSCI World (Acc)',isin:'IE00B4L5Y983',idx:'MSCI World',fam:'MSCI',cov:'dev',cls:'s_dev',ter:0.20,cur:'GBP',aum:146.00},
  {t:'VHVE',ex:'UK',al:[],n:'Vanguard FTSE Developed World (Acc)',isin:'IE00BK5BQV03',idx:'FTSE Developed',fam:'FTSE',cov:'dev',cls:'s_dev',ter:0.12,cur:'USD',aum:6.89},
  {t:'EMIM',ex:'UK',al:['EIMI','IS3N'],n:'iShares Core MSCI EM IMI (Acc)',isin:'IE00BKM4GZ66',idx:'MSCI EM IMI',fam:'MSCI',cov:'em',cls:'s_em',ter:0.18,cur:'GBP',aum:41.49},
  {t:'VFEA',ex:'DE',al:[],n:'Vanguard FTSE Emerging Markets (Acc)',isin:'IE00BK5BR733',idx:'FTSE Emerging',fam:'FTSE',cov:'em',cls:'s_em',ter:0.17,cur:'EUR',aum:2.46}];
export const COV={world:'cały świat',dev:'kraje rozwinięte',em:'rynki wschodzące'};
export const symOf=t=>String(t||'').trim().toUpperCase().split(/[.:\s]/)[0];
/* the list entry of an instrument: by ISIN, or by the symbol before the dot (VWCE.DE, vwce, VWRA.UK…) */
export function etfOf(it){if(!it)return null;const isin=String(it.isin||'').trim().toUpperCase(),s=symOf(it.ticker);
  return ETFS.find(e=>isin&&e.isin==isin)||(s?ETFS.find(e=>e.t==s||e.al.includes(s)):null)||null}
export const etfSym=e=>e.t+'.'+e.ex;

/* a guess from the name of a fund that is not on the list (kotki ask, the guess is only a hint) */
const GUESS=[[/2x|3x|lever|ultra|short|inverse|daily/i,'s_theme'],[/bitcoin|btc|ether|crypto|krypto/i,'x_crypto'],[/gold|złot|zlot/i,'g_etc'],[/silver|srebr|platin|metal/i,'g_metal'],
  [/commodit|surowc/i,'g_comm'],[/reit|real estate|property|nieruch/i,'r_reit'],[/bond|obligac|treasury|govt|aggregate|tbsp/i,'b_mkt'],[/dividend|dywid|high yield eq|income/i,'s_div'],
  [/clean|energy|tech|robot|\bai\b|semicon|water|cyber|defen|uran|lithium|battery|health|biotech|bank|fintech|space|gaming/i,'s_theme'],
  [/emerging|\bem\b|\bem imi\b|wschodz/i,'s_em'],[/all.?world|acwi|all country|world all/i,'s_world'],[/developed|\bworld\b|świat/i,'s_dev'],
  [/s&p|sp ?500|nasdaq|\busa?\b|america|russell|dow/i,'s_us'],[/europ|stoxx|\beuro\b|dax|ftse 100|\buk\b/i,'s_eu'],[/wig|poland|polsk|mwig|swig/i,'s_pl'],
  [/japan|china|chin|india|indi|korea|asia|pacific|brazil|latin|africa|taiwan/i,'s_reg']];
export const guessCls=(name,ticker='')=>{const s=name+' '+ticker;for(const[re,c]of GUESS)if(re.test(s))return c;return null};

/* the class of an instrument: typed by hand → the list → its kind; an ETF / fund not on the list = „do przypisania” */
export function clsOf(it,custom={}){const all=clsAll(custom);if(it?.cls&&all[it.cls])return it.cls;
  switch(it?.kind){case'etf':return etfOf(it)?.cls||'todo';case'tfi':return'todo';case'akcje':return's_single';
    case'obl':return BONDS[it.bond?.type]?.idx=='infl'?'b_idx':'b_fix';case'zloto':return it.ticker?'g_etc':'g_phys';case'krypto':return'x_crypto';case'lokata':return'deposit'}
  return'todo'}
/* an account's own money (what is not in instruments): konta i gotówka unless set by hand */
export const accClsOf=(a,custom={})=>a?.cls&&clsAll(custom)[a.cls]?a.cls:'cash';

/* 🥧 „z czego składa się majątek”: savings and investment accounts (no PPK, no archived, owner = filter or all), every instrument at today's value
   and the cash left on an investment account (balance + not yet booked valuation − instruments), other currencies at the NBP mid rate.
   result {rows[{key,kind:'h'|'a',id,acc,accName,owner,name,cls,grp,v}],groups[{g,v,cls[{c,v,rows}]}],total,skipped[{name,cur}],neg[accName]} */
export function allocP(cfg,tx,hold,today,macro={},mkt=null,{owner=null,custom={},assets={},debts={}}={}){
  const all=clsAll(custom),tom=addDays(today,1),fx=c=>!c||c=='PLN'?1:(mkt?.fx?.[c]||null),rows=[],skipped=[],neg=[];
  for(const a of cfg.accs){if(a.archived||(a.grp!='sav'&&a.grp!='inv')||wrapOf(a)=='ppk')continue;if(owner&&ownerOf(a)!=owner)continue;
    const r=fx(a.cur);const bal=balance(cfg,tx,a.id,tom),items=Object.entries(hold||{}).filter(([,x])=>x&&x.acc==a.id&&!x.deleted).map(([id,x])=>({id,...x}));
    if(!r){if(bal||items.length)skipped.push({name:a.name,cur:a.cur});continue}
    let inst=0;for(const it of items){const v=instValue(it,a,today,macro,mkt).value;if(!v)continue;inst+=v;const c=clsOf(it,custom);
      rows.push({key:'h:'+it.id,kind:'h',id:it.id,acc:a.id,accName:a.name,owner:ownerOf(a),name:it.name||'Instrument',ticker:it.ticker||'',cls:c,grp:all[c].g,v:Math.round(v*r)})}
    const diff=items.length?(instDiffP(a,items,tx,today,macro,mkt)||0):0,cash=bal+diff-inst;
    if(cash<0&&items.length)neg.push(a.name);
    if(cash>0){const c=accClsOf(a,custom);rows.push({key:'a:'+a.id,kind:'a',id:a.id,acc:a.id,accName:a.name,owner:ownerOf(a),name:items.length?a.name+' – gotówka':a.name,cls:c,grp:all[c].g,v:Math.round(cash*r)})}}
  /* other assets (not real estate) from assetM – the owner's share */
  for(const x of assetsP(assets,debts,tx,today,{owner,custom}))if(!x.real)rows.push({key:'x:'+x.id,kind:'x',id:x.id,acc:'',accName:'',owner:x.owner,name:x.name,cls:x.cls,grp:all[x.cls].g,v:x.net,old:x.old});
  const G={};for(const x of rows){const g=G[x.grp]||(G[x.grp]={g:x.grp,v:0,cls:{}});g.v+=x.v;const k=g.cls[x.cls]||(g.cls[x.cls]={c:x.cls,v:0,rows:[]});k.v+=x.v;k.rows.push(x)}
  const groups=AGRP_ORDER.filter(g=>G[g]).map(g=>({...G[g],cls:Object.values(G[g].cls).sort((a,b)=>b.v-a.v).map(k=>({...k,rows:k.rows.sort((a,b)=>b.v-a.v)}))}));
  return{rows,groups,total:rows.reduce((s,x)=>s+x.v,0),skipped,neg}}

/* 🔎 the analysis of one held ETF / fund: criteria from the reading (UCITS from Ireland, accumulating, cheap, big, broad index) and flags */
export function etfCheck(it){const e=etfOf(it),name=(it?.name||'')+' '+(it?.ticker||'');
  if(e)return{e,known:true,checks:[[true,'UCITS z Irlandii (ISIN '+e.isin+')'],[true,'akumulujący – zyski zostają w funduszu (podatek dopiero przy sprzedaży)'],
    [e.ter<=0.25,'koszt roczny '+String(e.ter).replace('.',',')+'%'+(e.ter<=0.25?' – tani':' – drożej niż ok. 0,25%')],
    [e.aum>=1,'wielkość '+String(e.aum).replace('.',',')+' mld USD'+(e.aum>=1?' – duży':' – mały (ryzyko zamknięcia)')],
    [true,'szeroki indeks: '+e.idx+' ('+COV[e.cov]+')']],flags:[]};
  const flags=[];if(/2x|3x|lever|ultra|short|inverse|daily/i.test(name))flags.push('dźwignia albo gra na spadki – nie do długiego trzymania');
  if(/dist|dividend|dywid|\bdy\b|income/i.test(name))flags.push('może wypłacać dywidendy – poza IKE/IKZE podatek co roku');
  if(guessCls(name)=='s_theme')flags.push('fundusz tematyczny / sektorowy – według lektury tylko do „piaskownicy”');
  return{e:null,known:false,checks:[],flags}}
/* doubled coverage among the held list ETFs: several „whole worlds”, a world fund plus a developed/emerging one, two of the same kind, a pair from two index families */
export function etfDup(held){const E=[...new Map(held.map(it=>etfOf(it)).filter(Boolean).map(e=>[e.isin,e])).values()],by=c=>E.filter(e=>e.cov==c),out=[];
  const w=by('world'),d=by('dev'),m=by('em'),nm=L=>L.map(e=>e.t).join(', ');
  if(w.length>1)out.push(`Macie ${w.length} fundusze „cały świat” (${nm(w)}) – to to samo w kilku opakowaniach: bez szkody, ale bez korzyści, a trudniej pilnować proporcji. Wystarczy jeden.`);
  if(w.length&&(d.length||m.length))out.push(`Fundusz świata (${nm(w)}) już zawiera kraje rozwinięte i rynki wschodzące – dodatkowy ${nm([...d,...m])} zwiększa ich udział ponad indeks. To świadomy wybór albo dublowanie.`);
  if(d.length>1)out.push(`Dwa fundusze krajów rozwiniętych (${nm(d)}) – wystarczy jeden.`);
  if(m.length>1)out.push(`Dwa fundusze rynków wschodzących (${nm(m)}) – wystarczy jeden.`);
  if(!w.length&&d.length&&m.length&&new Set([...d,...m].map(e=>e.fam)).size>1)out.push(`Para z dwóch rodzin indeksów (${nm(d)} + ${nm(m)}): MSCI i FTSE inaczej dzielą kraje (np. Korea Płd.) – w parze lepiej trzymać się jednej rodziny.`);
  return out}

/* 🏠 real estate and other assets typed by hand (assetM{id:{name,cls,owner,mp,value,valAt,every,note,o,deleted,real?{use,rent,months,debt,buy,buyY,m2}}}).
   mp = Mati's % of a Wspólne asset (default 50 – as in the deed); the debt shares the value's proportion (decision 18).
   owner filter: null = everything in full; 'Wspólne' = joint ones in full; 'Mati'/'Wercia' = own ones + their share of the joint ones (widok „Ja”) */
export const REAL_USE={my:'🏡 mieszkamy',rent:'🔑 wynajmujemy',empty:'🚪 stoi puste',other:'inne'};
export function assetShare(x,owner){const o=x.owner||'Wspólne';if(!owner)return 1;if(owner=='Wspólne')return o=='Wspólne'?1:0;if(o==owner)return 1;
  if(o!='Wspólne')return 0;const mp=Math.min(100,Math.max(0,+(x.mp??50)));return(owner=='Mati'?mp:100-mp)/100}
export function assetsP(assets,debts,tx,today,{owner=null,custom={},exact=false}={}){const all=clsAll(custom),out=[];
  for(const[id,x]of Object.entries(assets||{}).sort((a,b)=>(a[1].o??0)-(b[1].o??0))){if(!x||x.deleted)continue;
    const sh=exact?((x.owner||'Wspólne')==owner||!owner?1:0):assetShare(x,owner);if(!sh)continue;
    const cls=all[x.cls]?x.cls:'todo',d=x.real?.debt&&debts?.[x.real.debt]&&!debts[x.real.debt].deleted?debtStateP({id:x.real.debt,...debts[x.real.debt]},tx,today).left:0;
    const value=Math.round((+x.value||0)*sh),debt=Math.round(d*sh),every=+x.every||(all[cls].g=='real'?24:12),age=x.valAt?Math.floor((Date.parse(today)-Date.parse(x.valAt))/(30.44*864e5)):null;
    out.push({id,name:x.name||'Aktywo',cls,grp:all[cls].g,real:all[cls].g=='real',home:x.real?.use?x.real.use=='my':cls=='r_home',use:x.real?.use||'',rent:Math.round((+x.real?.rent||0)*sh),owner:x.owner||'Wspólne',
      share:sh,value,debt,net:value-debt,valAt:x.valAt||'',age,old:age!=null&&age>=every,every})}
  return out}
/* 🏠 / 📈 the main wheel: working real estate (net) vs market assets; the home we live in apart – in the wealth, never in the proportions (decision 25) */
export function realP(assets,debts,tx,today,opt={}){const L=assetsP(assets,debts,tx,today,opt).filter(x=>x.real),sum=F=>L.filter(F).reduce((a,x)=>({value:a.value+x.value,debt:a.debt+x.debt,net:a.net+x.net}),{value:0,debt:0,net:0});
  return{list:L,home:sum(x=>x.home),work:sum(x=>!x.home)}}
/* asset valuations to renew (🔔 Na dziś, quietly): older than „every” months */
export const assetOldP=(assets,today)=>Object.entries(assets||{}).filter(([,x])=>x&&!x.deleted&&x.valAt).map(([id,x])=>({id,...x})).filter(x=>{const ev=+x.every||(String(x.cls||'').startsWith('r_')?24:12);
  return(Date.parse(today)-Date.parse(x.valAt))/(30.44*864e5)>=ev});

/* ======================= D2: ankieta, plan z widełkami, diagnoza ======================= */
/* 📝 the survey (plan point 4.1, 64 questions minus PPK and nr 31 – decision 25). Answers: advM[who].ank (own) and advW.ank (w:1 – joint, the other person sees them).
   type: one (buttons), multi, num (unit), text, goals; gate questions answer 'yes'|'maybe'|'no'|'?' (decision 20 – „no” = never proposed).
   if(A,ctx) = shown only when it makes sense; every 'one' gets „Nie wiem” ('?') unless nq. hint(ctx) = what the app already knows ([A]). */
const YN=[['yes','Tak'],['no','Nie']],GATE=(y,m,n)=>[['yes',y],['maybe',m],['no',n]];
export const ANK_SEC={A:'Ty i Twoje dochody',B:'Majątek i nawyki',C:'Bezpieczeństwo',D:'Cele',E:'Nieruchomości',F:'Konta i instytucje',G:'Ryzyko',H:'Świat i waluty',I:'Co ma być w portfelu',J:'Trzymanie kursu'};
const yes=v=>v=='yes'||v=='maybe';
export const ANK=[
  {id:'q1',s:'A',type:'num',unit:'rok',t:'W którym roku się urodziłeś/urodziłaś?',why:'Wiek mówi, ile lat zostało do emerytury i jak długo pieniądze mogą pracować.',if:(A,c)=>!c.birth},
  {id:'q2',s:'A',type:'multi',t:'Z czego masz dochód?',why:'Od formy dochodu zależy podatek, a więc to, czy opłaca się IKZE.',o:[['uop','umowa o pracę'],['zlec','zlecenie'],['dzielo','dzieło'],['b2b','działalność (JDG)'],['none','teraz bez dochodu']],def:c=>c.kinds},
  {id:'q3',s:'A',type:'one',t:'Jaki masz próg podatkowy w tym roku?',why:'IKZE zwraca podatek według progu: przy 32% to prawie trzecia część wpłaty, przy 0% – nic.',o:[['0','0% (ulga dla młodych / mały dochód)'],['12','12%'],['32','32%'],['19','liniowy 19%'],['r','ryczałt']],hint:c=>c.taxHint?`Z pasków wychodzi mi: ${c.taxHint=='0'?'0% (ulga dla młodych)':c.taxHint+'%'} – zgadza się?`:''},
  {id:'q3r',s:'A',type:'num',unit:'%',t:'Jaka stawka ryczałtu?',why:'Przy niskim ryczałcie IKZE daje mało.',if:A=>A.q3=='r'},
  {id:'q4',s:'A',type:'one',t:'Czy w ciągu 3–5 lat spodziewasz się zmiany progu albo formy pracy?',why:'Wtedy inna decyzja w tym roku, a inna w kolejnych.',o:[['none','nie'],['up','wejście w 32%'],['jdg','przejście na działalność'],['break','przerwa / urlop rodzicielski'],['abroad','wyjazd za granicę']]},
  {id:'q4y',s:'A',type:'num',unit:'rok',t:'W którym roku mniej więcej?',if:A=>A.q4&&A.q4!='none'&&A.q4!='?'},
  {id:'q5',s:'A',type:'one',t:'Czy rozliczasz się wspólnie z małżonkiem?',o:YN,why:'Wspólne rozliczenie zmienia, jaki próg naprawdę Was dotyczy.'},
  {id:'q6',s:'A',type:'one',t:'Jak stabilny jest Twój dochód?',why:'Od tego zależy wielkość poduszki.',o:[['perm','etat na czas nieokreślony'],['temp','umowa na czas określony'],['jdg','działalność'],['irr','nieregularny']]},
  {id:'q7',s:'A',type:'one',t:'Czy spodziewasz się wyraźnego wzrostu zarobków w kilka lat (specjalizacja, awans)?',why:'„Najważniejsze aktywo to Ty” – czasem inwestycja w siebie daje więcej niż giełda.',o:[['big','tak, dużego'],['some','trochę'],['no','raczej nie']]},
  {id:'q8',s:'A',type:'one',t:'Co robisz z podwyżkami i premiami?',why:'Chroni przed „inflacją stylu życia”.',o:[['life','wszystko idzie na życie'],['half','pół na pół'],['save','większość odkładam']]},
  {id:'q9',s:'A',w:1,type:'one',t:'Dzieci: macie albo planujecie?',why:'Dzieci zmieniają poduszkę, cele i dają obligacje rodzinne (800+).',o:GATE('mamy','planujemy','nie planujemy')},
  {id:'q9n',s:'A',w:1,type:'num',unit:'',t:'Ile osób jest na Waszym utrzymaniu (poza Wami)?',if:A=>A.q9=='yes'},
  {id:'q9y',s:'A',w:1,type:'num',unit:'rok',t:'W którym roku mniej więcej planujecie dziecko?',if:A=>A.q9=='maybe'},
  {id:'q10',s:'A',w:1,type:'one',t:'Chcecie odkładać na edukację / start dziecka?',o:YN,if:A=>yes(A.q9)},
  {id:'q10a',s:'A',w:1,type:'num',unit:'zł',t:'Ile chcecie mieć na ten cel (w dzisiejszych złotych)?',if:A=>A.q10=='yes'},
  {id:'q11',s:'B',type:'one',nq:1,t:'Twój majątek netto (konta, instrumenty, nieruchomości minus długi):',hint:c=>`Aplikacja liczy: ${c.wealthTxt}.`,why:'Punkt startu – od niego liczę ryzyko w złotych.',o:[['ok','✓ Zgadza się'],['no','Coś się nie zgadza – poprawię dane']]},
  {id:'q12',s:'B',type:'one',nq:1,t:'Średnia miesięczna nadwyżka (przychody − wydatki z 6 miesięcy):',hint:c=>`Wychodzi: ${c.surplusTxt}.`,why:'Z nadwyżki pochodzą pieniądze na inwestycje.',o:[['ok','✓ Zgadza się'],['no','Nie zgadza się']]},
  {id:'q13',s:'B',type:'num',unit:'zł',t:'Ile chcesz odkładać miesięcznie na inwestycje?',why:'„Zapłać najpierw sobie” – potem zaproponuję stały przelew w dniu wypłaty.',ph:c=>c.surplus>0?String(Math.round(c.surplus/2/10000)*100):''},
  {id:'q14',s:'B',type:'one',t:'Jak często będziesz dopłacać?',o:[['m','co miesiąc'],['q','co kwartał'],['irr','nieregularnie (premie, zwrot podatku)']]},
  {id:'q15',s:'C',type:'num',unit:'zł',t:'Ile wynoszą niezbędne wydatki miesięcznie (minimum przy utracie pracy)?',hint:c=>`Średnio wydajecie ${c.expTxt} miesięcznie.`,why:'Poduszka ma wystarczyć na to, co niezbędne.'},
  {id:'q17',s:'C',w:1,type:'one',t:'Na ile miesięcy chcecie poduszkę bezpieczeństwa?',hint:c=>`Teraz starcza na ok. ${c.podMTxt}.`,why:'Typowo 6; 3–4 przy bardzo stabilnym etacie; 9–12 przy działalności, jednym żywicielu, kredycie i dzieciach.',o:[['3','3'],['4','4'],['6','6'],['9','9'],['12','12']]},
  {id:'q18',s:'C',type:'one',nq:1,t:'Poduszka jest na „awarie”: niezbędne i nieprzewidziane (utrata pracy, choroba, zepsuta pralka). To, co przewidywalne (OC, wakacje), idzie do kopert rocznych.',o:[['ok','✓ Rozumiem']]},
  {id:'q19',s:'C',type:'one',t:'Długi inne niż hipoteka (karta, raty, pożyczki, „kup teraz, zapłać później”)?',hint:c=>c.debtsTxt?`W aplikacji: ${c.debtsTxt}.`:'W aplikacji nie widzę takich długów.',why:'Najpierw spłata drogich długów – to pewny „zysk”.',o:GATE('mam','nie mam, ale biorę pod uwagę','nie mam i nie chcę')},
  {id:'q19r',s:'C',type:'num',unit:'%',t:'Najwyższe oprocentowanie tych długów?',if:A=>A.q19=='yes'},
  {id:'q20',s:'C',w:1,type:'one',t:'Kredyt hipoteczny?',hint:c=>c.mortTxt?`W aplikacji: ${c.mortTxt}.`:'',why:'Od kredytu zależy, czy nadpłacać, czy inwestować.',o:GATE('mamy','nie mamy, ale bierzemy pod uwagę','nie mamy i nie chcemy')},
  {id:'q20a',s:'C',w:1,type:'one',t:'Oprocentowanie kredytu:',o:[['fix','stałe'],['var','zmienne']],if:A=>A.q20=='yes'},
  {id:'q20b',s:'C',w:1,type:'num',unit:'rok',t:'Do którego roku stała stopa?',if:A=>A.q20a=='fix'},
  {id:'q20c',s:'C',w:1,type:'one',t:'Czy bank pobiera prowizję za nadpłatę?',o:YN,if:A=>A.q20=='yes'},
  {id:'q21',s:'C',type:'multi',t:'Jakie masz ubezpieczenia?',why:'Tylko przypomnienie – niczego nie polecam.',o:[['life','na życie'],['income','od utraty dochodu'],['flat','mieszkania (do wartości rynkowej)'],['none','żadnych']]},
  {id:'q22',s:'C',type:'one',t:'Jaka część Waszych pieniędzy jest w jednym banku?',why:'Gwarancja BFG to 100 tys. euro na bank i osobę – powyżej warto rozdzielić.',o:[['lo','mniej niż połowa'],['mid','połowa–90%'],['hi','prawie wszystko']]},
  {id:'q23',s:'D',type:'multi',t:'Na co odkładasz?',why:'Każdy cel ma swój horyzont, a więc inne miejsce na pieniądze.',o:[['ret','emerytura'],['home','mieszkanie dla siebie'],['rent','nieruchomość na wynajem'],['kid','dziecko'],['car','auto'],['reno','remont'],['trip','podróż'],['other','inny cel']]},
  {id:'q24',s:'D',type:'num',unit:'lat',t:'W jakim wieku chcesz przestać pracować (albo pracować mniej)?',if:A=>(A.q23||[]).includes('ret')},
  {id:'q24b',s:'D',type:'num',unit:'zł',t:'Ile chcesz mieć „na rękę” miesięcznie na emeryturze (w dzisiejszych złotych)?',if:A=>(A.q23||[]).includes('ret')},
  {id:'q25',s:'D',type:'num',unit:'zł',t:'Prognoza emerytury z ZUS (brutto, z PUE/eZUS → kalkulator emerytalny):',why:'„Nie wiem” = ostrożny szacunek.',if:A=>(A.q23||[]).includes('ret')},
  {id:'q26',s:'D',type:'one',t:'Do ilu lat liczyć pieniądze na emeryturę?',why:'Ryzykiem jest długie życie, nie krótkie.',o:[['85','85'],['90','90'],['95','95'],['100','100']],if:A=>(A.q23||[]).includes('ret')},
  {id:'q27',s:'D',type:'goals',t:'Kwota i rok dla każdego celu (sztywny termin – np. studia; elastyczny – np. auto):',if:A=>(A.q23||[]).some(g=>!['ret','home','rent'].includes(g))},
  {id:'q28',s:'D',w:1,type:'one',t:'Czy w ciągu 5 lat planujecie inny duży wydatek?',o:YN},
  {id:'q28a',s:'D',w:1,type:'text',t:'Jaki, ile i kiedy?',if:A=>A.q28=='yes'},
  {id:'q29',s:'E',w:1,type:'one',t:'Nieruchomości: macie albo bierzecie pod uwagę?',hint:c=>c.realTxt?`W aplikacji: ${c.realTxt}.`:'Możesz je dodać w karcie „🥧 Z czego składa się majątek”.',why:'Nieruchomości mogą być częścią majątku – albo nie. Oba wybory są dobre.',o:GATE('mamy','bierzemy pod uwagę','nie i nie chcemy')},
  {id:'q30',s:'E',w:1,type:'num',unit:'%',min:0,max:70,t:'Jaki udział nieruchomości (bez Waszego domu) w majątku, który pracuje, ma być docelowo?',why:'Wielu długoterminowych inwestorów ma ok. połowę; 0% też jest dobrą odpowiedzią.',if:A=>yes(A.q29)},
  {id:'q32',s:'E',w:1,type:'one',t:'Mieszkanie dla siebie – planujecie kupić?',o:GATE('tak','może','nie'),if:(A,c)=>!c.hasHome},
  {id:'q32a',s:'E',w:1,type:'num',unit:'lat',t:'Za ile lat mniej więcej?',if:(A,c)=>!c.hasHome&&yes(A.q32)},
  {id:'q32b',s:'E',w:1,type:'one',t:'Ile lat chcecie w nim mieszkać?',why:'Zakup ma sens ekonomiczny przy co najmniej 5–10 latach.',o:[['lt5','mniej niż 5'],['5-10','5–10'],['gt10','ponad 10']],if:(A,c)=>!c.hasHome&&yes(A.q32)},
  {id:'q32c',s:'E',w:1,type:'one',t:'Czy to będzie Wasze pierwsze mieszkanie?',why:'Pierwsze mieszkanie z rynku wtórnego – bez podatku PCC 2%.',o:YN,if:(A,c)=>!c.hasHome&&yes(A.q32)},
  {id:'q33',s:'E',w:1,type:'num',unit:'zł',t:'Szacowana cena mieszkania?',if:(A,c)=>!c.hasHome&&yes(A.q32)},
  {id:'q33b',s:'E',w:1,type:'one',t:'Jaki wkład własny?',o:[['10','10%'],['20','20%']],if:(A,c)=>!c.hasHome&&yes(A.q32)},
  {id:'q33c',s:'E',w:1,type:'num',unit:'zł',t:'Ile już macie odłożone na wkład?',if:(A,c)=>!c.hasHome&&yes(A.q32)},
  {id:'q34',s:'E',w:1,type:'one',t:'Mieszkanie na wynajem – bierzecie pod uwagę?',o:GATE('tak','może','nie'),if:A=>yes(A.q29)},
  {id:'q34a',s:'E',w:1,type:'one',t:'Czy jesteście gotowi być wynajmującym (najemcy, naprawy, remont co 5–7 lat, 1–2 miesiące pustostanu w roku)?',o:[['yes','tak'],['rather','raczej tak'],['no','raczej nie']],if:A=>yes(A.q34)},
  {id:'q34c',s:'E',w:1,type:'one',t:'Za gotówkę czy dopuszczacie kredyt?',why:'Dźwignia działa w obie strony.',o:[['cash','tylko gotówka'],['loan','kredyt też']],if:A=>yes(A.q34)},
  {id:'q35',s:'E',w:1,type:'num',unit:'zł',t:'Koszty mieszkania na wynajem miesięcznie (administracja, fundusz remontowy, podatki, ubezpieczenie):',if:(A,c)=>c.hasRent},
  {id:'q36',s:'F',type:'one',t:'Twoje IKE:',hint:c=>c.ikeTxt||'',o:[['xtb','maklerskie (XTB)'],['bond','IKE-Obligacje'],['fund','w funduszach / ubezpieczeniu'],['other','inne maklerskie'],['none','nie mam']]},
  {id:'q37',s:'F',type:'one',t:'Twoje IKZE:',hint:c=>c.ikzeTxt||'',o:[['xtb','maklerskie (XTB)'],['bond','IKZE-Obligacje'],['fund','w funduszach / ubezpieczeniu'],['other','inne maklerskie'],['none','nie mam']]},
  {id:'q38',s:'F',type:'num',unit:'%',t:'Ile kosztuje rocznie IKE/IKZE w funduszach (z dokumentu KID)?',why:'Powyżej ok. 1% rocznie warto przenieść (wypłata transferowa – bez utraty ulg).',if:A=>A.q36=='fund'||A.q37=='fund'},
  {id:'q40',s:'F',type:'one',t:'OKI (od 1.01.2027) – chcesz korzystać?',why:'Konto bez podatku do 100 tys. zł: dobre na poduszkę, wkład własny i polskie aktywa.',o:GATE('tak','może','nie')},
  {id:'q41',s:'F',w:1,type:'one',t:'Dostajecie 800+?',o:YN,if:A=>A.q9=='yes'},
  {id:'q41a',s:'F',w:1,type:'num',unit:'zł',t:'Ile z 800+ wykorzystaliście już na obligacje rodzinne?',if:A=>A.q41=='yes'},
  {id:'q42',s:'G',type:'one',t:'Za ile lat NAJWCZEŚNIEJ możesz potrzebować pieniędzy z części długoterminowej?',why:'Pieniądze potrzebne wcześniej niż za ok. 5 lat nie powinny być w akcjach.',o:[['lt3','mniej niż 3'],['3-5','3–5'],['5-10','5–10'],['10-20','10–20'],['gt20','ponad 20']]},
  {id:'q43',s:'G',type:'one',t:'Masz w akcjach 100 000 zł, po roku jest 70 000 zł. Co robisz?',why:'Liczy się to, co zrobisz naprawdę, nie co myślisz dziś.',o:[['buy','dokupuję'],['none','nic'],['part','sprzedaję część'],['all','sprzedaję wszystko']]},
  {id:'q44',s:'G',type:'one',t:'Jaki największy przejściowy spadek CAŁEGO portfela zniesiesz bez sprzedawania?',why:'Akcje świata potrafiły spaść o połowę – to dlatego pytam w złotych.',o:c=>[[0.1,'10%'],[0.15,'15%'],[0.25,'25%'],[0.4,'40%']].map(([d,l])=>[String(d),c.wealth>0?`do ${c.zl(Math.round(c.base*d))} (${l})`:l])},
  {id:'q45',s:'G',type:'one',t:'Jak długo zniesiesz, że portfel jest „pod kreską”?',why:'Akcje bywały pod kreską ponad 12 lat.',o:[['1','rok'],['3','3 lata'],['5','5 lat'],['10','10 lat']]},
  {id:'q46',s:'G',type:'one',t:'Czy przeżyłeś/przeżyłaś duży spadek swoich inwestycji?',o:[['held','tak – trzymałem/am'],['sold','tak – sprzedałem/am'],['no','nie']]},
  {id:'q47',s:'G',type:'one',t:'Ile wiesz o inwestowaniu?',why:'Od tego zależy, ile wyjaśnień pokażą kotki.',o:[['beg','początkujący'],['basic','znam podstawy'],['pro','swobodnie']]},
  {id:'q48',s:'G',type:'one',t:'Co ważniejsze?',o:[['max','jak największy zysk za 20 lat'],['mid','coś pomiędzy'],['sleep','spokojny sen']]},
  {id:'q49',s:'G',type:'one',t:'Jakiego zysku spodziewasz się rocznie ponad inflację?',why:'Realnie 2–4 punkty ponad inflację to dobry wynik dla spokojnego portfela.',o:[['0-2','0–2 pkt'],['2-4','2–4 pkt'],['4-6','4–6 pkt'],['6+','więcej']]},
  {id:'q50',s:'G',type:'one',t:'Ile czasu chcesz poświęcać inwestycjom?',o:[['15q','kwadrans na kwartał'],['1hm','godzina w miesiącu'],['love','lubię się tym zajmować']]},
  {id:'q51',s:'G',type:'one',t:'Wolisz kupować co miesiąc czy zbierać i kupować raz na kwartał?',why:'W XTB nie ma prowizji, ale każda wymiana waluty kosztuje 0,5%.',o:[['m','co miesiąc'],['q','raz na kwartał']]},
  {id:'q52',s:'H',type:'multi',t:'Czego najbardziej się boisz?',why:'To nie zmienia planu „na ślepo” – pokazuje, czy portfel jest na to przygotowany.',o:[['infl','wysokiej inflacji'],['crash','krachu na giełdzie'],['pln','słabego złotego'],['job','utraty pracy'],['war','wojny']]},
  {id:'q53',s:'H',type:'one',t:'Czy część majątku ma być poza złotym?',o:[['none','wszystko w złotych'],['some','trochę'],['much','sporo']]},
  {id:'q54',s:'I',type:'one',t:'Złoto w portfelu?',why:'Złoto to „polisa” na kryzys i słabego złotego, nie na zwykłą inflację.',o:[['0','nie'],['5','do 5%'],['10','do 10%'],['15','do 15%']]},
  {id:'q54b',s:'I',type:'one',t:'Złoto fizyczne czy „papierowe” (ETC w IKE/IKZE)?',o:[['phys','fizyczne'],['etc','ETC'],['both','oba']],if:A=>A.q54&&!['0','?'].includes(A.q54)},
  {id:'q55',s:'I',type:'one',t:'Akcje – jak?',why:'Najprościej: cały świat jednym funduszem.',o:[['world','cały świat jednym funduszem'],['devem','rozwinięte + wschodzące osobno'],['pl','więcej Polski'],['own','sam dobieram regiony']]},
  {id:'q56',s:'I',type:'multi',t:'Inne aktywa, które chcesz mieć?',why:'Kotki uczciwie powiedzą, co dla rdzenia portfela jest „raczej nie” – wtedy trafia do piaskownicy.',o:[['b_mkt','obligacje rynkowe'],['g_comm','surowce'],['x_crypto','kryptowaluty'],['r_reit','fundusze nieruchomości'],['x_coll','kolekcje'],['none','żadnych']]},
  {id:'q57',s:'I',type:'one',t:'Pojedyncze spółki i „tematy” (piaskownica)?',o:GATE('tak','może','nie')},
  {id:'q57a',s:'I',type:'num',unit:'%',min:0,max:10,t:'Ile najwyżej (procent części długoterminowej)?',ph:()=> '10',if:A=>yes(A.q57)},
  {id:'q58',s:'I',type:'one',t:'„Suchy proch” – gotówka na okazje w czasie przeceny?',o:[['0','nie'],['5','5%'],['10','10%'],['20','20%']]},
  {id:'q59',s:'I',w:1,type:'num',unit:'%',min:0,max:100,t:'Nadwyżki: ile procent na nadpłatę kredytu (reszta – inwestycje)?',why:'Ważne też: czy dobrze się czujecie z nadpłaconym kredytem i małymi oszczędnościami.',if:A=>A.q20=='yes'},
  {id:'q60',s:'J',type:'text',t:'„List do siebie” na spadki – 2–3 zdania własnymi słowami.',why:'Kotki pokażą go, gdy rynek mocno spadnie.',ph:()=>'np. Spokojnie. Spadki się zdarzają, plan jest na 20 lat. Nie sprzedaję.'},
  {id:'q61',s:'J',type:'one',t:'Twoja reguła na duży spadek (zapisana teraz, w spokoju):',o:[['r25','gdy akcje spadną o 25%, dokupię akcji ze złota / obligacji'],['none','bez reguły – trzymam plan'],['own','własna']]},
  {id:'q61t',s:'J',type:'text',t:'Twoja reguła:',if:A=>A.q61=='own'},
  {id:'q62',s:'J',type:'one',t:'Kiedy wolno zmienić plan?',why:'Kotki przypomną tę odpowiedź, gdy zechcesz coś zmienić w nerwach.',o:[['life','tylko przy zmianie w życiu'],['year','raz w roku'],['cycle','po pełnym cyklu 7–10 lat']]},
  {id:'q63',s:'J',w:1,type:'one',t:'Czy druga osoba umiałaby poprowadzić plan sama?',o:[['yes','tak'],['part','częściowo'],['no','nie']]},
  {id:'q64',s:'J',w:1,type:'one',t:'Gdy Wasze odpowiedzi o ryzyku się różnią:',o:[['cautious','wspólny portfel według ostrożniejszej osoby'],['sep','osobne części']]}];
/* questions to show now (answers A = own + joint) */
export const ankList=(A,ctx)=>ANK.filter(q=>!q.if||q.if(A,ctx));
export const ankDone=(A,ctx)=>{const L=ankList(A,ctx);return{n:L.filter(q=>A[q.id]!==undefined&&A[q.id]!=='').length,of:L.length}};

/* 📄 the plan from the answers (plan points 5 step 2 and 4.1): stocks = the lowest cap from horizon, loss tolerance and the reaction to a drop;
   gold, dry powder (cash), the rest indexed bonds; bands ±5 pts (±2,5 for small parts). „?” = the more cautious assumption. */
const r5=v=>Math.round(v/5)*5;
export const PLAN_G=['cash','bond','stock','gold'];
export function planP(A){const why=[];
  const h={lt3:0,'3-5':0,'5-10':40,'10-20':100,gt20:100}[A.q42],eqH=h??40;why.push(h==null?'horyzont nieznany – ostrożnie do 40% akcji':`horyzont ${A.q42.replace('lt','<').replace('gt','>')} lat → akcje do ${eqH}%`);
  const d=+A.q44,eqT=d>0?Math.min(100,r5(2*d*100)):30;why.push(d>0?`spadek do ${Math.round(d*100)}% → akcje do ${eqT}% (akcje potrafią spaść o połowę)`:'tolerancja straty nieznana – ostrożnie 30%');
  const eqR={all:20,part:40,'?':40}[A.q43]??100;if(eqR<100)why.push(`reakcja na spadek → akcje do ${eqR}%`);
  const stock=Math.min(eqH,eqT,eqR),gold=Math.min(15,+(A.q54=='?'||A.q54==null?5:A.q54)||0),cash=+(A.q58=='?'||A.q58==null?0:A.q58)||0;
  let g={stock,gold,cash,bond:100-stock-gold-cash};if(g.bond<0){g.cash=Math.max(0,g.cash+g.bond);g.bond=0}
  const split={world:{s_world:100},devem:{s_dev:88,s_em:12},pl:{s_world:90,s_pl:10},own:{s_world:100}}[A.q55]||{s_world:100};
  return{g,split,real:yes(A.q29)&&A.q30!=null&&A.q30!==''?+A.q30:null,pod:+(A.q17||6)||6,save:+A.q13||0,sand:yes(A.q57)?Math.min(10,+(A.q57a||10)):0,why}}
export const bandOf=t=>{const b=t>=20?5:2.5;return[Math.max(0,t-b),Math.min(100,t+b)]};
/* joint plan = the more cautious person's (decision: the joint portfolio fits the more careful one); q64 'sep' – separate parts */
export const jointPlan=(pM,pW)=>!pM?pW||null:!pW?pM:(pW.g.stock<pM.g.stock?pW:pM);
/* ⚡ the crisis 2007–2009 in złoty, cautious variant (DORADCA-notatki u07: stocks ≈ −33…−44% in PLN; gold +76% → half): stocks −35%, gold +38%, the rest 0 */
export const crisisP=(g,base)=>{const r=(g.stock*-0.35+g.gold*0.38)/100;return{pct:Math.round(r*1000)/10,zl:Math.round(base*r)}};

/* 🎯 now vs the plan on the koło: base = market assets without the cushion account (it is the safety net, not the long-term portfolio) */
export const isPodName=n=>/poduszk/i.test(n||'');
export function devP(A,plan){const rows=A.rows.filter(r=>!(r.kind=='a'&&isPodName(r.accName))),base=rows.reduce((s,r)=>s+r.v,0),by={};
  for(const r of rows)by[r.grp]=(by[r.grp]||0)+r.v;
  const G=PLAN_G.map(g=>{const t=plan.g[g],[lo,hi]=bandOf(t),now=base?by[g]/base*100||0:0;return{g,t,lo,hi,now,st:now<lo-1e-9?'low':now>hi+1e-9?'high':'ok',gap:Math.round(base*t/100-(by[g]||0))}});
  const other=base?Object.entries(by).filter(([g])=>!PLAN_G.includes(g)).reduce((s,[,v])=>s+v,0)/base*100:0;
  const low=G.filter(x=>x.st=='low').sort((a,b)=>(a.now-a.lo)-(b.now-b.lo)),high=G.filter(x=>x.st=='high').sort((a,b)=>(b.now-b.hi)-(a.now-a.hi));
  return{base,G,other,low,high,ok:!low.length&&!high.length}}

/* 🩺 diagnosis tiles: cushion months, debts to pay first, IKE/IKZE limits left this year (OKI from 2027) */
export function diagP({cushion,exp,podTarget=6,debts=[],accs=[],tx=[],limits={},today,owner}){const y=today.slice(0,4),m=exp>0?cushion/exp:null;
  const cons=debts.filter(d=>d.kind!='hip'),wr=accs.filter(a=>!a.archived&&['ike','ikze'].includes(wrapOf(a))&&(!owner||(a.owner||'Wspólne')==owner));
  return{pod:{m,target:podTarget,st:m==null?'?':m>=podTarget?'ok':m>=3?'mid':'low'},debts:{n:cons.length,sum:cons.reduce((s,d)=>s+(d.left||0),0)},
    lim:wr.map(a=>({name:a.name,w:wrapOf(a),left:Math.max(0,limitOf(a,y,limits)-paidInYear(tx,a.id,y))})),days:Math.round((Date.parse(y+'-12-31')-Date.parse(today))/864e5)}}

/* ======================= D3: „Gdzie” – kwota → bramki → pokrowce ======================= */
/* tax threshold from the survey: '0'|'12'|'32'|'19' or a flat rate (ryczałt) number; '?' = unknown */
export const taxOf=A=>A.q3=='r'?(+A.q3r>0?+A.q3r:'?'):(A.q3||'?');
const tNum=t=>t=='?'?0:+t;
/* IKZE order: 32% and 19% (linear) – IKZE first; 12% and a flat rate ≥ 12% – IKE first, IKZE after; 0% or a low flat rate – IKZE never (plan step 4) */
export const ikzeRank=t=>t=='?'?'after':t=='32'||t=='19'?'first':tNum(t)>=12?'after':'no';
/* 💰 IKE / IKZE / regular account after N years for amount W (grosze) at r a year: IKE without tax; IKZE pays 10% at 65 and its tax return (t%) is reinvested
   on a regular account (Belka 19% on the gain); regular – Belka on the gain (notes C: Iwuć's calculator) */
export function wrapCompare(W,years,t,r=0.05){const f=Math.pow(1+r,years),ike=Math.round(W*f),reg=Math.round(W+(W*f-W)*0.81),rate=tNum(t)/100,back=W*rate;
  const ikze=Math.round(W*f*0.9+back+(back*f-back)*0.81);return{years,ike,ikze,reg,back:Math.round(back)}}
/* 🚦 the gates and the places for one amount (plan point 5 steps 0–4). P = people [{who,t,ike:{left},ikze:{left},age}], in: {amt,src,goal,need3},
   ctx: {debt:{sum,rate,name}, podGap (grosze to the cushion target), podHave, mort:{rate,fee}, overpay (% of the long-term part, q59), today, okiOk}
   → {rows[{a,where,why,who,kind}],no[{t,why}],noStocks,rest} – amounts in grosze, the sum of rows = amt */
export function whereP(inp,P,ctx){let rest=Math.max(0,Math.round(inp.amt||0));const rows=[],no=[],add=(a,where,why,who='',kind='')=>{a=Math.min(rest,Math.round(a));if(a>0){rows.push({a,where,why,who,kind});rest-=a}};
  let noStocks=false;const mo=+ctx.today.slice(5,7);
  if(inp.src=='pod'){add(rest,'🛟 Zostaje w poduszce','Poduszki nie inwestujemy – to pieniądze na awarie. Do inwestowania bierzemy nadwyżkę, premię albo zwrot podatku.','','pod');no.push({t:'📈 Giełda z poduszki',why:'Gdy przyjdzie awaria w czasie spadku, trzeba by sprzedać ze stratą.'});return{rows,no,noStocks:true,rest}}
  if(ctx.debt?.sum>0)add(ctx.debt.sum,`🔻 Spłata: ${ctx.debt.name||'długi'}`,`Najpierw dług${ctx.debt.rate?` (${String(ctx.debt.rate).replace('.',',')}% rocznie)`:''}: jego spłata to pewny „zysk”, którego nie da żadna bezpieczna inwestycja.`,'','debt');
  if(ctx.podGap>0){noStocks=true;add(ctx.podGap,'🛟 Poduszka: ok. ¼ konto oszczędnościowe, reszta obligacje skarbowe (EDO / COI)',`Do celu poduszki brakuje ${zlS(ctx.podGap)}. Poduszka przed giełdą – akcje nie teraz.`,'','pod');
    if(rest>0&&mo==12&&P.some(p=>p.ike?.left>0))no.push({t:'💡 Wyjątek grudniowy',why:'Limit IKE przepada 31 grudnia – możesz wpłacić na IKE i trzymać tam gotówkę albo obligacje (bezpiecznie), a akcje kupić po dokończeniu poduszki.'})}
  if(inp.goal=='pod')add(rest,'🛟 Poduszka','Wybrałeś cel „poduszka” – konto oszczędnościowe i obligacje skarbowe.','','pod');
  if(inp.need3||inp.goal=='home'&&inp.homeSoon){noStocks=true;add(rest,`🔒 Bezpiecznie: konto oszczędnościowe / lokata, obligacje 3-letnie TOS${ctx.okiOk?' – najlepiej na OKI (bez podatku)':''}`,'Pieniądze potrzebne w ciągu 3 lat nie mogą zależeć od giełdy.','','safe');
    no.push({t:'📈 Akcje',why:'Termin krótszy niż ok. 5 lat – akcje potrafią spaść o połowę i odrabiać latami.'})}
  if(inp.goal=='sand')add(Math.min(rest,ctx.sandLeft??rest),'🧪 Piaskownica – zwykły rachunek maklerski (XTB)','Pojedyncze spółki i „tematy” tylko w piaskownicy z limitem z planu. Szczegóły w etapie piaskownicy.','','sand');
  if(rest>0&&ctx.mort&&ctx.overpay>0){const a=Math.round(rest*ctx.overpay/100),be=Math.round(ctx.mort.rate/0.81*100)/100;
    add(a,'🏠 Nadpłata kredytu hipotecznego',`Tak ustaliliście w ankiecie (${ctx.overpay}% nadwyżek). Kredyt ${String(ctx.mort.rate).replace('.',',')}% – żeby się opłacało inwestować poza IKE, trzeba by zarabiać ponad ${String(be).replace('.',',')}% rocznie.${ctx.mort.fee?' Sprawdźcie prowizję za nadpłatę.':''} Najlepiej dzień po racie.`,'Wspólne','overpay')}
  /* long-term: wrappers by threshold, people in order (the higher threshold first for IKZE), then regular account */
  const order=[];for(const p of [...P].sort((a,b)=>tNum(b.t)-tNum(a.t)))if(ikzeRank(p.t)=='first')order.push([p,'ikze']);
  for(const p of P)order.push([p,'ike']);for(const p of P)if(ikzeRank(p.t)=='after')order.push([p,'ikze']);
  for(const[p,w]of order){if(rest<=0)break;const left=p[w]?.left||0;if(left<=0)continue;const a=Math.min(rest,left);
    if(w=='ikze')add(a,`🛡️ IKZE ${p.who}${p.ikze?.has?'':' (do założenia, np. w XTB)'}`,`Próg ${p.t=='19'?'liniowy 19%':p.t+'%'}: w PIT wróci ok. ${zlS(Math.round(a*tNum(p.t)/100))} – ten zwrot też zainwestuj. Wypłata po 65. roku życia z 10% podatku.${ikzeRank(p.t)=='after'?' Dopiero po IKE i tylko gdy pieniądze doczekają 65 lat.':''} Zostało limitu: ${zlS(left)}.`,p.who,'ikze');
    else add(a,`🛡️ IKE ${p.who}${p.ike?.has?'':' (do założenia, np. w XTB)'}`,`Bez podatku Belki od zysków przy wypłacie po 60. roku życia. Zostało limitu: ${zlS(left)}.`,p.who,'ike')}
  if(rest>0)add(rest,`📂 Zwykły rachunek maklerski${ctx.okiOk?' / OKI (polskie aktywa, obligacje)':''}`,'Limity IKE/IKZE na ten rok są wykorzystane. Na zwykłym rachunku: ETF akumulujący (podatek dopiero przy sprzedaży) albo obligacje 10-letnie EDO.','','reg');
  for(const p of P)if(ikzeRank(p.t)=='no'&&p.t!='?')no.push({t:`🛡️ IKZE ${p.who}`,why:`Przy progu ${p.t}% ulga jest zerowa albo bardzo mała, a przy wypłacie zapłacisz 10% – zostań przy IKE.`});
  no.push({t:'💸 Fundusze z kosztem ponad ok. 1% rocznie, polisy inwestycyjne, IKE w ubezpieczeniu',why:'Koszty to pewnik, zysk nie: +1 pkt opłat zjada przez 30 lat kilkadziesiąt tysięcy.'},
    {t:'🎢 ETF-y z dźwignią, tematyczne, CFD',why:'Dźwignia działa w obie strony, „tematy” powstają po modzie. CFD w XTB to nie akcje.'},
    {t:'🏦 Lokata na pieniądze na 10+ lat',why:'Po podatku i inflacji zwykle realnie traci.'},{t:'💳 Inwestowanie za pożyczone',why:'Kredyt na giełdę zwielokrotnia skutki błędów.'});
  if(!ctx.okiOk&&ctx.today<'2027-01-01')no.push({t:'📦 OKI',why:'Ruszy 1 stycznia 2027 – wtedy dobre na poduszkę, wkład własny i polskie aktywa.'});
  return{rows,no,noStocks,rest}}
const zlS=g=>zl0(g);
