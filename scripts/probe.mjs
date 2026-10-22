// Temporary: checks the shape of public data pages (no Firebase, no household data).
const get=async u=>{const r=await fetch(u,{headers:{'User-Agent':'Mozilla/5.0 (budzet-mw automat)'},redirect:'follow'});return{s:r.status,u:r.url,h:await r.text()}};
const ids=h=>[...new Set([...h.matchAll(/\/fundusze-ppk\/([A-Z]{2,5}\d+)\/([a-z0-9-]+)/g)].map(m=>m[1]+'/'+m[2]))];
const run=async(name,fn)=>{try{console.log('== '+name);await fn()}catch(e){console.log('ERR',e.message)}};
await run('lista',async()=>{const r=await get('https://www.analizy.pl/fundusze-ppk/notowania');const h=r.h;
  const i=h.search(/\/fundusze-ppk\/KAH31/);console.log(h.slice(Math.max(0,i-700),i+500).replace(/\s+/g,' '));
  console.log('pag',[...new Set([...h.matchAll(/(?:href|data-[a-z-]+)="([^"]*(?:page|strona|offset|limit)[^"]*)"/gi)].map(m=>m[1]))].slice(0,10));
  console.log('api',[...new Set([...h.matchAll(/["'](\/?api\/[^"']{3,120})["']/gi)].map(m=>m[1]))].slice(0,15));
  console.log('json',[...new Set([...h.matchAll(/["'](https?:\/\/[^"']*\.json[^"']*)["']/gi)].map(m=>m[1]))].slice(0,8));
  const j=h.search(/pagination|paginat|następna|Następna/i);console.log('paghtml',j<0?'-':h.slice(j-200,j+600).replace(/\s+/g,' '))});
for(const u of ['https://www.analizy.pl/fundusze-ppk/notowania?page=2','https://www.analizy.pl/fundusze-ppk/notowania/2','https://www.analizy.pl/fundusze-ppk/notowania?strona=2','https://www.analizy.pl/fundusze-ppk/notowania?limit=500','https://www.analizy.pl/fundusze-ppk/notowania?pageSize=500','https://www.analizy.pl/fundusze-ppk'])
  await run(u,async()=>{const r=await get(u);const L=ids(r.h);console.log(r.s,r.u,L.length,L.slice(0,4).join(' '))});
await run('FIO lista',async()=>{const r=await get('https://www.analizy.pl/fundusze-inwestycyjne-otwarte/notowania');console.log(r.s,[...new Set([...r.h.matchAll(/\/fundusze-inwestycyjne-otwarte\/([A-Z]{2,5}\d+)\/([a-z0-9-]+)/g)].map(m=>m[1]+'/'+m[2]))].length)});
await run('szukaj',async()=>{for(const u of ['https://www.analizy.pl/szukaj?q=PZU56','https://www.analizy.pl/api/search?q=inpzu%202040','https://www.analizy.pl/fundusze-ppk/PZU56/x']){const r=await get(u);console.log(u,r.s,r.u,r.h.length,ids(r.h).slice(0,3).join(' '))}});
await run('ROD',async()=>{const r=await get('https://www.obligacjeskarbowe.pl/oferta-obligacji/');const t=r.h.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');console.log([...t.matchAll(/\(symbol: ([A-Z]{3})\)\s*([\d,]+)\s*%/g)].map(m=>m[1]+'='+m[2]).join(' '));
  const k=t.search(/marż/i);console.log(k<0?'brak marży':t.slice(k-200,k+200))});
await run('obl EDO strona',async()=>{const r=await get('https://www.obligacjeskarbowe.pl/oferta-obligacji/obligacje-10-letnie-edo/');const t=r.h.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');console.log(r.s,r.u);const k=t.search(/marż/i);console.log(k<0?'-':t.slice(k-300,k+300))});
