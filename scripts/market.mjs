// 🤖 Daily market update for Budżet M&W (GitHub Actions). Writes households/main/market/rates (and a limits proposal once a month).
// Needs the secret FIREBASE_SA (service account JSON). Logs only counts – never amounts, names or symbols (the repository is public).
import {initializeApp,cert} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {CRYPTO_IDS,OZ,parseEurostat,parseLimits,parseNbpRef,parseNbpTable,parseStooq,parseYahoo,yahooSym} from './market-lib.mjs';

const sa=(()=>{try{return JSON.parse(process.env.FIREBASE_SA||'')}catch{return null}})();
if(!sa?.project_id){console.error('Brak sekretu FIREBASE_SA (klucz konta usługi Firebase).');process.exit(1)}
initializeApp({credential:cert(sa)});
const db=getFirestore(),H=db.doc('households/main'),M=H.collection('market');
const today=new Date().toLocaleDateString('sv-SE',{timeZone:'Europe/Warsaw'});
const get=async(u,type='json')=>{const r=await fetch(u,{headers:{'User-Agent':'Mozilla/5.0 (budzet-mw automat)','Accept':type=='json'?'application/json':'*/*'}});
  if(!r.ok)throw new Error('HTTP '+r.status);return type=='json'?r.json():r.text()};
const tryIt=async(name,fn)=>{try{return await fn()}catch(e){console.log(`– ${name}: nie udało się (${e.message})`);return null}};

const out={date:today,ts:Date.now(),fx:{},prices:{},src:{}};
// 1. exchange rates (NBP, table A)
const nbp=await tryIt('kursy NBP',async()=>parseNbpTable(await get('https://api.nbp.pl/api/exchangerates/tables/A?format=json')));
if(nbp&&Object.keys(nbp.fx).length){out.fx=nbp.fx;out.fxDate=nbp.date;out.src.fx='NBP';console.log(`✓ kursy NBP: ${Object.keys(nbp.fx).length} walut`)}
// 2. NBP reference rate
const ref=await tryIt('stopa NBP',async()=>parseNbpRef(await get('https://static.nbp.pl/dane/stopy/stopy_procentowe.xml','text')));
if(ref!=null){out.nbp=ref;console.log('✓ stopa referencyjna NBP')}
// 3. inflation: HICP for Poland (Eurostat), close to the GUS CPI
const inf=await tryIt('inflacja',async()=>parseEurostat(await get('https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hicp_manr?format=JSON&geo=PL&coicop=CP00&lastTimePeriod=1')));
if(inf){out.infl=inf.infl;out.inflPer=inf.per;out.src.infl='Eurostat HICP';console.log('✓ inflacja')}
// 4. prices of the instruments people hold
const [hold,main]=await Promise.all([H.collection('hold').get(),H.get()]);
const accs=main.data()?.accsM||{},want=new Map();let gold=false;
hold.forEach(d=>{const x=d.data();if(x.deleted||x.kind=='obl'||x.kind=='lokata')return;
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
await M.doc('rates').set(out);
// 5. price history of each instrument (makes the "paid in vs value" chart denser)
let nh=0;const fxOf=c=>!c||c=='PLN'?1:out.fx[c];
for(const d of hold.docs){const x=d.data();if(x.deleted||!x.ticker)continue;const q=out.prices[x.ticker.trim().toUpperCase()];if(!q)continue;
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
console.log('Gotowe.');process.exit(0);
