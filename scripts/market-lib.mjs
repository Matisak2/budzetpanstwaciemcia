// Parsers for the daily market update (no network, no Firebase here – easy to test).
export const CRYPTO_IDS={BTC:'bitcoin',ETH:'ethereum',SOL:'solana',XRP:'ripple',ADA:'cardano',DOT:'polkadot',DOGE:'dogecoin',LTC:'litecoin',BNB:'binancecoin',USDT:'tether',USDC:'usd-coin',AVAX:'avalanche-2',LINK:'chainlink',MATIC:'matic-network',TRX:'tron'};
export const OZ=31.1034768;
// NBP table A: [{effectiveDate, rates:[{code, mid}]}] -> {date, fx:{USD:3.9,...}}
export function parseNbpTable(j){const t=Array.isArray(j)?j[0]:j,fx={};for(const r of t?.rates||[])if(r.code&&r.mid>0)fx[r.code]=r.mid;return{date:t?.effectiveDate||null,fx}}
// NBP interest rates XML: the reference rate ("ref" / "Stopa referencyjna"), attributes in any order
export function parseNbpRef(xml){const tags=String(xml).match(/<pozycja\b[^>]*>/gi)||[];
  for(const t of tags){if(/\bid="ref"/i.test(t)||/referencyjna/i.test(t)){const m=t.match(/oprocentowanie="([\d.,]+)"/i);if(m)return+m[1].replace(',','.')}}
  const m=String(xml).match(/referencyjna[\s\S]{0,200}?(\d+[.,]\d+)/i);return m?+m[1].replace(',','.'):null}
// stooq quote CSV with a header: Symbol,Date,Time,Open,High,Low,Close,Volume
export function parseStooq(csv){const L=String(csv).trim().split(/\r?\n/);if(L.length<2)return null;const H=L[0].split(',').map(s=>s.trim().toLowerCase()),R=L[1].split(',');
  const c=+R[H.indexOf('close')],d=R[H.indexOf('date')];return c>0&&/^\d{4}-\d\d-\d\d$/.test(d||'')?{p:c,d}:null}
// Yahoo chart API; GBp (pence) is converted to GBP
export function parseYahoo(j){const m=j?.chart?.result?.[0]?.meta;if(!m||!(m.regularMarketPrice>0))return null;let p=m.regularMarketPrice,cur=m.currency||'';
  if(cur=='GBp'||cur=='GBX'){p=p/100;cur='GBP'}const d=m.regularMarketTime?new Date(m.regularMarketTime*1000).toISOString().slice(0,10):null;return{p,cur,d}}
// stooq symbol (IWDA.UK, CDR, AAPL.US, VWCE.DE) -> Yahoo symbol (IWDA.L, CDR.WA, AAPL, VWCE.DE)
export function yahooSym(t){const[s,x]=String(t).toUpperCase().split('.');return!x?s+'.WA':x=='US'?s:x=='UK'?s+'.L':x=='PL'?s+'.WA':x=='JP'?s+'.T':s+'.'+x}
// limits of IKE / IKZE in an article: the first plausible amounts near the names
export function parseLimits(html){const t=String(html).replace(/<[^>]+>/g,' ').replace(/&nbsp;| /g,' ').replace(/\s+/g,' ');
  const num=s=>+s.replace(/\s/g,'').replace(',','.');const amt='(\\d{1,2}\\s?\\d{3}(?:,\\d{1,2})?)\\s*zł';
  const ike=[...t.matchAll(new RegExp('\\bIKE\\b[\\s\\S]{0,120}?'+amt,'g'))].map(m=>num(m[1])).find(v=>v>=20000&&v<=80000);
  const ikz=[...t.matchAll(new RegExp('\\bIKZE\\b[\\s\\S]{0,160}?'+amt,'g'))].map(m=>num(m[1])).filter(v=>v>=7000&&v<=40000);
  if(!ike||!ikz.length)return null;const ikze=Math.min(...ikz),ikzeB=ikz.find(v=>Math.abs(v/ikze-1.5)<0.03)||Math.round(ikze*150)/100;
  return{ike:Math.round(ike*100),ikze:Math.round(ikze*100),ikzeB:Math.round(ikzeB*100)}}
// GUS page with monthly CPI: the link to the CSV (its name changes, e.g. …od1982roku_9.csv)
export function gusCsvLink(html){const m=String(html).match(/href="([^"]*miesi[^"]*\.csv)"/i);return m?new URL(m[1],'https://stat.gov.pl').href:null}
// GUS CSV (;): Nazwa;Jednostka;Sposób prezentacji;Rok;Miesiąc;Wartość – rows "Analogiczny miesiąc poprzedniego roku = 100" -> {'2026-09': 2.9} (% y/y)
export function parseGusCpi(csv,from=2010){const L=String(csv).split(/\r?\n/),H=(L[0]||'').split(';').map(s=>s.trim().toLowerCase()),col=(re,d)=>{const i=H.findIndex(h=>re.test(h));return i<0?d:i};
  const cy=col(/^rok$/,3),cm=col(/^miesi/,4),cv=col(/^warto/,5),out={};
  for(const l of L){if(!/analogiczny miesi/i.test(l))continue;const c=l.split(';'),y=+c[cy],m=+c[cm],v=+String(c[cv]||'').replace(',','.');
    if(y>=from&&m>=1&&m<=12&&v>50&&v<200)out[`${y}-${String(m).padStart(2,'0')}`]=Math.round((v-100)*100)/100}
  return out}
// Eurostat JSON-stat with many months -> {'2025-12': 3.1}
export function parseEurostatAll(j){const idx=j?.dimension?.time?.category?.index||{},out={};for(const[per,i]of Object.entries(idx)){const v=j.value?.[String(i)];if(v!=null)out[per]=+v}return out}
// obligacjeskarbowe.pl: links to the pages of each kind of bond on the offer page
const BOND_PAGES=['obligacje-3-miesieczne-ots','obligacje-roczne-ror','obligacje-2-letnie-dor','obligacje-3-letnie-tos','obligacje-4-letnie-coi','obligacje-6-letnie-ros','obligacje-10-letnie-edo','obligacje-12-letnie-rod'];
export function bondLinks(html){const found=[...String(html).matchAll(/href="(?:https:\/\/www\.obligacjeskarbowe\.pl)?\/oferta-obligacji\/(obligacje-[a-z0-9-]+)\//gi)].map(m=>m[1].toLowerCase()).filter(x=>!/premiowe/.test(x));
  return[...new Set([...found,...BOND_PAGES])].map(x=>`https://www.obligacjeskarbowe.pl/oferta-obligacji/${x}/`)}
// a bond page: "Seria: EDO1036 … Oprocentowanie: 5,35% w pierwszym … marża 2,00%" -> {type,series,first,margin}
export function parseBondPage(html){const t=String(html).replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/\s+/g,' ');
  const s=t.match(/Seria:\s*([A-Z]{3})(\d{4})/),f=t.match(/Oprocentowanie:\s*([\d,]+)\s*%/);if(!s||!f)return null;
  const m=t.slice(f.index,f.index+400).match(/marża\s*([\d,]+)\s*%/i);return{type:s[1],series:s[1]+s[2],first:+f[1].replace(',','.'),...(m?{margin:+m[1].replace(',','.')}:{})}}
// analizy.pl fund page: "109,75 PLN Aktualna wartość J.U. 21.10.2026" -> {p, cur, d}
export function parseFundPage(html){const t=String(html).replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/\s+/g,' ');
  const m=t.match(/(\d{1,3}(?:[  ]\d{3})*,\d{2,4})\s*([A-Z]{3})\s*Aktualna wartość J\.?\s?U\.?\s*(\d{2})\.(\d{2})\.(\d{4})/i);
  if(!m)return null;const p=+m[1].replace(/[  ]/g,'').replace(',','.');return p>0?{p,cur:m[2],d:`${m[5]}-${m[4]}-${m[3]}`}:null}
// fund pages link to other PPK funds (competitors, the same family): [id, slug]
export const fundLinks=html=>[...String(html).matchAll(/\/fundusze-ppk\/([A-Z]{2,6}\d+)\/([a-z0-9-]+)/g)].map(m=>[m[1],m[2]]);
/* a source that did not answer today keeps its last known value (with its old date – an older price never wins over one typed later):
   prices of instruments still held, gold, NBP exchange rates and the NBP rate. ok = the last day the NBP rates came (automatStale counts from it) */
export function keepPrev(out,prev,want=[],gold=false){const p=prev||{},fxToday=Object.keys(out.fx||{}).length>0;let kept=0;
  out.ok=fxToday?out.date:(p.ok||p.date||out.date);
  for(const t of want)if(!out.prices[t]&&p.prices?.[t]){out.prices[t]=p.prices[t];kept++}
  if(gold&&!out.gold&&p.gold){out.gold=p.gold;out.goldDate=p.goldDate||p.date;kept++}
  if(!fxToday&&p.fx&&Object.keys(p.fx).length){out.fx=p.fx;out.fxDate=p.fxDate||p.date;if(p.src?.fx)out.src.fx=p.src.fx;kept++}
  if(out.nbp==null&&p.nbp!=null){out.nbp=p.nbp;kept++}
  return kept}
/* 🌡️ the thermometer history: stooq daily CSV (Date,Open,High,Low,Close,Volume) or Yahoo chart (timestamps + closes) → {YYYY-MM-DD: close} */
export function parseStooqHist(csv){const L=String(csv||'').trim().split(/\r?\n/);if(L.length<2)return null;const H=L[0].split(',').map(s=>s.trim().toLowerCase()),di=H.indexOf('date'),ci=H.indexOf('close');if(di<0||ci<0)return null;
  const o={};for(const l of L.slice(1)){const r=l.split(','),d=r[di],c=+r[ci];if(/^\d{4}-\d\d-\d\d$/.test(d||'')&&c>0)o[d]=c}return Object.keys(o).length?o:null}
export function parseYahooHist(j){const R=j?.chart?.result?.[0],t=R?.timestamp,c=R?.indicators?.quote?.[0]?.close;if(!Array.isArray(t)||!Array.isArray(c))return null;
  const o={};t.forEach((s,i)=>{if(c[i]>0)o[new Date(s*1000).toISOString().slice(0,10)]=Math.round(c[i]*10000)/10000});return Object.keys(o).length?o:null}
