/* 🧭 Doradca – pure calculations (no UI, no saving; tested in tests/calc.mjs). Amounts in grosze (PLN).
   D1a: asset groups and classes (built-in + own `assetCls`), the list of known ETFs (checked in XTB), the class of every instrument and account,
   „what the wealth is made of” (allocP) and the analysis of held ETFs (criteria, doubled „whole worlds”, flags). PPK is left out everywhere (decision 5). */
import {addDays} from './util.js';
import {balance,ownerOf} from './logic.js';
import {BONDS,instValue,instDiffP,wrapOf} from './inv.js';

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
export function allocP(cfg,tx,hold,today,macro={},mkt=null,{owner=null,custom={}}={}){
  const all=clsAll(custom),tom=addDays(today,1),fx=c=>!c||c=='PLN'?1:(mkt?.fx?.[c]||null),rows=[],skipped=[],neg=[];
  for(const a of cfg.accs){if(a.archived||(a.grp!='sav'&&a.grp!='inv')||wrapOf(a)=='ppk')continue;if(owner&&ownerOf(a)!=owner)continue;
    const r=fx(a.cur);const bal=balance(cfg,tx,a.id,tom),items=Object.entries(hold||{}).filter(([,x])=>x&&x.acc==a.id&&!x.deleted).map(([id,x])=>({id,...x}));
    if(!r){if(bal||items.length)skipped.push({name:a.name,cur:a.cur});continue}
    let inst=0;for(const it of items){const v=instValue(it,a,today,macro,mkt).value;if(!v)continue;inst+=v;const c=clsOf(it,custom);
      rows.push({key:'h:'+it.id,kind:'h',id:it.id,acc:a.id,accName:a.name,owner:ownerOf(a),name:it.name||'Instrument',ticker:it.ticker||'',cls:c,grp:all[c].g,v:Math.round(v*r)})}
    const diff=items.length?(instDiffP(a,items,tx,today,macro,mkt)||0):0,cash=bal+diff-inst;
    if(cash<0&&items.length)neg.push(a.name);
    if(cash>0){const c=accClsOf(a,custom);rows.push({key:'a:'+a.id,kind:'a',id:a.id,acc:a.id,accName:a.name,owner:ownerOf(a),name:items.length?a.name+' – gotówka':a.name,cls:c,grp:all[c].g,v:Math.round(cash*r)})}}
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
