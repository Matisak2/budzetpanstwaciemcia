// Temporary: checks the shape of public data pages (no Firebase, no household data).
const get=async u=>{const r=await fetch(u,{headers:{'User-Agent':'Mozilla/5.0 (budzet-mw automat)'},redirect:'follow'});return{s:r.status,u:r.url,h:await r.text()}};
const ids=h=>[...h.matchAll(/\/fundusze-ppk\/([A-Z]{2,6}\d+)\/([a-z0-9-]+)/g)].map(m=>[m[1],m[2]]);
const t0=Date.now(),seen=new Map(),q=[],done=new Set();
const l=await get('https://www.analizy.pl/fundusze-ppk/notowania');for(const[i,s]of ids(l.h)){if(!seen.has(i)){seen.set(i,s);q.push(i)}}
let pages=0;while(q.length&&pages<80){const id=q.shift();if(done.has(id))continue;done.add(id);pages++;
  try{const r=await get(`https://www.analizy.pl/fundusze-ppk/${id}/x`);for(const[i,s]of ids(r.h))if(!seen.has(i)){seen.set(i,s);q.push(i)}
    if(pages==1){const t=(r.h.match(/<title>([^<]*)<\/title>/)||[])[1];const h1=(r.h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)||[])[1];console.log('title',t,'| h1',(h1||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' '))}}catch(e){console.log('ERR',e.message)}}
console.log('pages',pages,'found',seen.size,'queue',q.length,'s',Math.round((Date.now()-t0)/1000));
const pre={};for(const[i,s]of seen){const p=i.replace(/\d+$/,'');(pre[p]=pre[p]||[]).push(s.replace(/-\d{4}$/,''))}
for(const[p,L]of Object.entries(pre))console.log(p,L.length,[...new Set(L)].join(','));
const years=[...seen.values()].map(s=>(s.match(/(\d{4})$/)||[])[1]).filter(Boolean);console.log('years',[...new Set(years)].sort().join(','));
