// Temporary: checks the shape of public data pages (no Firebase, no household data).
const get=async u=>{const r=await fetch(u,{headers:{'User-Agent':'Mozilla/5.0 (budzet-mw automat)'},redirect:'follow'});return{s:r.status,u:r.url,h:await r.text()}};
const ids=h=>[...new Set([...h.matchAll(/\/fundusze-ppk\/([A-Z]{2,6}\d+)\/([a-z0-9-]+)/g)].map(m=>m[1]+'/'+m[2]))];
const B='https://www.analizy.pl/fundusze-ppk/notowania';const l=await get(B);
const tfi=[...l.h.matchAll(/value="(TFI[A-Z0-9]+|PTE[A-Z0-9]+)"[\s\S]{0,700}?checkboxLabel">([^<]+)</g)].map(m=>[m[1],m[2].trim()]);console.log('tfi',tfi.length,tfi.map(x=>x.join('=')).join(' ; '));
const grp=[...new Set([...l.h.matchAll(/grupa%5B%5D=(PPK_\d+)/g)].map(m=>m[1]))];console.log('grupy',grp.join(' '));
const k=l.h.search(/FilterPopupFundCheck/);console.log('filtr html',l.h.slice(Math.max(0,k-1500),k-200).replace(/\s+/g,' '));
for(const q of ['tfi%5B%5D=TFIPCS','tfi=TFIPCS','towarzystwo%5B%5D=TFIPCS','fundCompany%5B%5D=TFIPCS','firma%5B%5D=TFIPCS','tfi%5B%5D=PCS','grupa%5B%5D=PPK_60','grupa%5B%5D=PPK_60&page=2','page=2','p=2','strona=2&grupa%5B%5D=PPK_60'])
  {const r=await get(B+'?'+q);const L=ids(r.h);console.log(q,r.s,L.length,L.join(' '))}
const js=[...l.h.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1]).filter(s=>!/google|facebook|gtm/.test(s));console.log('js',js.join(' '));
