// Temporary: checks the shape of public data pages (no Firebase, no household data).
const get=async u=>{const r=await fetch(u,{headers:{'User-Agent':'Mozilla/5.0 (budzet-mw automat)'},redirect:'follow'});return{s:r.status,u:r.url,h:await r.text()}};
const r=await get('https://www.analizy.pl/fundusze-ppk/notowania'),h=r.h;
for(const k of ['inPZU','PZU5','PCS','Pekao PPK','PKO','Goldman','"id"','__NEXT_DATA__','window.__','data-url','fetch(','/api/','ajax','.json']){const i=h.indexOf(k);console.log(k,'x'+h.split(k).length-1,i<0?'':h.slice(Math.max(0,i-150),i+250).replace(/\s+/g,' '))}
const codes=[...new Set([...h.matchAll(/\b([A-Z]{2,5}\d{2,3})\b/g)].map(m=>m[1]))];console.log('codes',codes.length,codes.slice(0,40).join(' '));
const sel=[...h.matchAll(/<select[^>]*>([\s\S]*?)<\/select>/g)].map(m=>m[0].slice(0,600).replace(/\s+/g,' '));console.log('selects',sel.length);sel.slice(0,4).forEach(s=>console.log(s));
const forms=[...h.matchAll(/<form[^>]*>/g)].map(m=>m[0]);console.log('forms',forms.join(' | '));
const i=h.indexOf('KAH31');console.log('ctx',h.slice(Math.max(0,i-2500),i-700).replace(/\s+/g,' '));
