// 🤖 Daily market update for Budżet M&W (GitHub Actions). Writes households/main/market/rates (and a limits proposal once a month),
// the list of PPK funds once a month and the month-end valuation of accounts with instruments.
// Needs the secret FIREBASE_SA (service account JSON). Logs only counts – never amounts, names or symbols (the repository is public).
import {db as fdb,ensureVapid,household,warsaw} from './common.mjs';
import {CRYPTO_IDS,OZ,bondLinks,fundLinks,gusCsvLink,parseBondPage,parseEurostatAll,parseFundPage,parseGusCpi,parseLimits,parseNbpRef,parseNbpTable,parseStooq,parseYahoo,yahooSym} from './market-lib.mjs';
import {holdAt,instDiffP,macroP} from '../js/inv.js';
import {ownerOf} from '../js/today.js';
import {daysIn} from '../js/util.js';

const H=fdb().doc('households/main'),M=H.collection('market');
const {today}=warsaw();
const get=async(u,type='json')=>{const r=await fetch(u,{headers:{'User-Agent':'Mozilla/5.0 (budzet-mw automat)','Accept':type=='json'?'application/json':'*/*'}});
  if(!r.ok)throw new Error('HTTP '+r.status);return type=='json'?r.json():r.text()};
const tryIt=async(name,fn)=>{try{return await fn()}catch(e){console.log(`– ${name}: nie udało się (${e.message})`);return null}};

const prev=(await M.doc('rates').get()).data()||{};
const out={date:today,ts:Date.now(),fx:{},prices:{},src:{},inflH:{...(prev.inflH||{})},funds:{...(prev.funds||{})},...(prev.bonds?{bonds:prev.bonds}:{})};
// 1. exchange rates (NBP, table A)
const nbp=await tryIt('kursy NBP',async()=>parseNbpTable(await get('https://api.nbp.pl/api/exchangerates/tables/A?format=json')));
if(nbp&&Object.keys(nbp.fx).length){out.fx=nbp.fx;out.fxDate=nbp.date;out.src.fx='NBP';console.log(`✓ kursy NBP: ${Object.keys(nbp.fx).length} walut`)}
// 2. NBP reference rate
const ref=await tryIt('stopa NBP',async()=>parseNbpRef(await get('https://static.nbp.pl/dane/stopy/stopy_procentowe.xml','text')));
if(ref!=null){out.nbp=ref;console.log('✓ stopa referencyjna NBP')}
// 3. inflation month by month (bonds use the GUS CPI y/y): GUS CSV, Eurostat HICP only for months GUS does not have
const gus=await tryIt('inflacja GUS',async()=>{const page=await get('https://stat.gov.pl/obszary-tematyczne/ceny-handel/wskazniki-cen/wskazniki-cen-towarow-i-uslug-konsumpcyjnych-pot-inflacja-/miesieczne-wskazniki-cen-towarow-i-uslug-konsumpcyjnych-od-1982-roku/','text').catch(()=>'');
  const u=gusCsvLink(page)||'https://stat.gov.pl/download/gfx/portalinformacyjny/pl/defaultstronaopisowa/4741/1/1/miesieczne_wskazniki_cen_towarow_i_uslug_konsumpcyjnych_od_1982_roku.csv';
  const h=parseGusCpi(await get(u,'text'));return Object.keys(h).length>12?h:null});
const eu=gus?null:await tryIt('inflacja (zapasowo Eurostat)',async()=>parseEurostatAll(await get('https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hicp_manr?format=JSON&geo=PL&coicop=CP00&sinceTimePeriod=2010-01')));
if(eu)for(const[k,v]of Object.entries(eu))if(!(k in out.inflH))out.inflH[k]=v;
if(gus)Object.assign(out.inflH,gus);
const last=Object.keys(out.inflH).sort().pop();
if(last){out.infl=out.inflH[last];out.inflPer=last;out.src.infl=gus?'GUS':eu?'Eurostat HICP':prev.src?.infl||'';console.log(`✓ inflacja: ${Object.keys(out.inflH).length} miesięcy (${out.src.infl})`)}
// 3a. treasury bonds on sale this month: series, 1st-year rate, margin (a hint for new purchases)
const bonds=await tryIt('obligacje',async()=>{const links=bondLinks(await get('https://www.obligacjeskarbowe.pl/oferta-obligacji/','text')),r={};
  for(const u of links){const b=await tryIt('obligacja',async()=>parseBondPage(await get(u,'text')));if(b)r[b.type]=b}return Object.keys(r).length?r:null});
if(bonds){out.bonds={date:today,...bonds};console.log(`✓ obligacje w sprzedaży: ${Object.keys(bonds).length}`)}
// 4. prices of the instruments people hold
const [hold,main]=await Promise.all([H.collection('hold').get(),H.get()]);
const accs=main.data()?.accsM||{},want=new Map(),fundsWant=new Map();let gold=false;
hold.forEach(d=>{const x=d.data();if(x.deleted||x.kind=='obl'||x.kind=='lokata')return;
  if(x.kind=='tfi'){if(x.fund?.id)fundsWant.set(x.fund.id,x.fund.path||`fundusze-ppk/${x.fund.id}/x`);return}
  if(x.kind=='zloto'&&!x.ticker){gold=true;return}if(x.ticker)want.set(x.ticker.trim().toUpperCase(),{kind:x.kind,cur:x.cur||'PLN'})});
const cryptos=[...want].filter(([,v])=>v.kind=='krypto');
if(cryptos.length){const ids=[...new Set(cryptos.map(([t])=>CRYPTO_IDS[t]||t.toLowerCase()))].join(',');
  const cg=await tryIt('krypto',()=>get(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=pln,usd,eur,gbp,chf`));
  if(cg)for(const[t,v]of cryptos){const q=cg[CRYPTO_IDS[t]||t.toLowerCase()],p=q?.[v.cur.toLowerCase()];if(p>0)out.prices[t]={p,d:today,src:'coingecko'}}}
for(const[t,v]of want){if(v.kind=='krypto')continue;
  const s=await tryIt('cena',async()=>parseStooq(await get(`https://stooq.pl/q/l/?s=${encodeURIComponent(t.toLowerCase())}&f=sd2t2ohlcv&h&e=csv`,'text')));
  if(s){out.prices[t]={...s,src:'stooq'};continue}
  const y=await tryIt('cena (zapasowo)',async()=>parseYahoo(await get(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSym(t))}?range=5d&interval=1d`)));
  if(y)out.prices[t]={p:y.p,d:y.d||today,cur:y.cur,src:'yahoo'}}
if(gold){const g=await tryIt('złoto',async()=>parseStooq(await get('https://stooq.pl/q/l/?s=xaupln&f=sd2t2ohlcv&h&e=csv','text')));if(g){out.gold=Math.round(g.p/OZ*100)/100;out.goldDate=g.d}}
console.log(`✓ ceny: ${Object.keys(out.prices).length} z ${want.size}${gold?(out.gold?' + złoto':' (złoto: brak)'):''}`);
// 4a. unit values of TFI / PPK funds (analizy.pl; a page address with any name redirects to the fund)
let nf=0;for(const[id,path]of fundsWant){const f=await tryIt('fundusz',async()=>parseFundPage(await get('https://www.analizy.pl/'+path,'text')));if(f){out.funds[id]={...f,src:'analizy'};nf++}}
for(const id of Object.keys(out.funds))if(!fundsWant.has(id))delete out.funds[id];
if(fundsWant.size)console.log(`✓ fundusze: ${nf} z ${fundsWant.size}`);
await M.doc('rates').set(out);
// 5. price history of each instrument (makes the "paid in vs value" chart denser)
let nh=0;const fxOf=c=>!c||c=='PLN'?1:out.fx[c];
for(const d of hold.docs){const x=d.data();if(x.deleted)continue;const q=x.kind=='tfi'?out.funds[x.fund?.id]:x.ticker&&out.prices[x.ticker.trim().toUpperCase()];if(!q)continue;
  const ac=accs[x.acc]?.cur||'PLN',ic=x.cur||ac,fx=ic==ac?1:(fxOf(ic)&&fxOf(ac)?Math.round(fxOf(ic)/fxOf(ac)*1e6)/1e6:null);
  await d.ref.set({hist:{[q.d||today]:{p:q.p,...(fx?{fx}:{}),auto:true}}},{merge:true});nh++}
console.log(`✓ historia cen: ${nh}`);
// 6. once a month (first week): look for the IKE / IKZE limits of the next (Nov–Dec) or current (Jan) year – only a proposal, the app asks first
const ym=today.slice(0,7),mon=+today.slice(5,7),lim=(await M.doc('limits').get()).data()||{};
if(+today.slice(8)<=7&&lim.checked!=ym){const year=mon>=11?+today.slice(0,4)+1:+today.slice(0,4);let found=null;
  for(const u of [`https://strefainwestorow.pl/emerytura/limit-ike-ikze-${year}`,`https://www.bankier.pl/smart/limity-ike-ikze-${year}`,`https://analizy.pl/oszczedzanie-na-emeryture/limity-wplat-na-ike-ikze-${year}`]){
    const r=await tryIt('limity',async()=>{const h=await get(u,'text');return h.includes(String(year))?parseLimits(h):null});if(r){found={...r,src:new URL(u).hostname};break}}
  await M.doc('limits').set({checked:ym,...(found?{year,...found,found:today}:{})},{merge:true});
  console.log(found?`✓ limity ${year}: znalezione (aplikacja zapyta przed zmianą)`:`– limity ${year}: jeszcze nie znalezione`)}
// 7. once a month: the list of all PPK funds to choose from in the app (analizy.pl, 10 per page)
const fl=(await M.doc('funds').get()).data()||{};
if(fl.checked!=ym){const list={};for(let p=1;p<=40;p++){const L=await tryIt('lista funduszy',async()=>fundLinks(await get(`https://www.analizy.pl/fundusze-ppk/notowania?page=${p}`,'text')));
    if(!L)break;let n=0;for(const[id,slug]of L)if(!list[id]){list[id]=slug;n++}if(!n)break}
  const n=Object.keys(list).length;await M.doc('funds').set({checked:ym,...(n>20?{list,date:today}:{})},{merge:true});console.log(n>20?`✓ lista funduszy PPK: ${n}`:'– lista funduszy PPK: nie udało się')}
// 8. month-end valuation of accounts with instruments: on the last day of the month (a working day) or the first working days of the next one,
//    dated the last day of the month, written once (deleting it in the app is final)
const lastDay=m=>`${m}-${String(daysIn(m)).padStart(2,'0')}`,pm=(()=>{const[y,m]=ym.split('-').map(Number);return m==1?`${y-1}-12`:`${y}-${String(m-1).padStart(2,'0')}`})();
const target=today==lastDay(ym)?ym:+today.slice(8)<=7?pm:null,av=(await M.doc('autoval').get()).data()||{};
if(target&&(av.last||'')<target){const D=await household(H),date=lastDay(target),mc=macroP(D.hraw,out),mref=M.doc('autoval');let n=0;
  const txIds=new Set(D.txAll.map(t=>t.id));
  for(const a of D.cfg.accs.filter(a=>a.grp=='inv'&&!a.archived)){const items=Object.entries(D.hold).filter(([,x])=>x.acc==a.id&&!x.deleted).map(([id,x])=>holdAt({id,...x},date));
    if(!items.some(it=>Object.keys(it.lots||{}).length))continue;
    const d=instDiffP(a,items,D.tx.filter(t=>t.date<=date),date,mc,out),id='av'+target.replace('-','')+a.id;if(!d||txIds.has(id))continue;
    const w=ownerOf(a);await H.collection('months').doc(target).set({tx:{[id]:{type:'adj',val:true,amount:d,date,sub:'',acc:a.id,to:'',who:w=='Wercia'?'Wercia':'Mati',note:'Wycena instrumentów (automat)',by:'automat',auto:true,deleted:false,ts:Date.now()}}},{merge:true});n++}
  await mref.set({last:target,at:today,n},{merge:true});console.log(`✓ wycena na koniec miesiąca: ${n} ${n==1?'konto':'kont'}`)}
await ensureVapid(H);
console.log('Gotowe.');process.exit(0);
