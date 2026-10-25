import {esc,zl} from './util.js';
export const PAL=['#7fb0ec','#f4a582','#6fd0a8','#f2c45f','#f0a3c3'],P_OTHER='#cbd5e1',C_INC='#6fd0a8',C_EXP='#f4a582',C_SAV='#7fb0ec';
export const niceMax=v=>{if(v<=0)return 1;const p=Math.pow(10,Math.floor(Math.log10(v))),n=v/p;return(n<=1?1:n<=2?2:n<=2.5?2.5:n<=5?5:10)*p};
export const kfmt=g=>{const z=g/100,a=Math.abs(z);return a>=1e6?(z/1e6).toFixed(1).replace('.0','').replace('.',',')+' mln':a>=1e3?(z/1e3).toFixed(a>=1e4?0:1).replace('.0','').replace('.',',')+' tys.':Math.round(z)+''};
export const pctS=(a,b)=>b?(a/b*100).toFixed(1).replace('.',',')+'%':'—';
export function deltaH(cur,prev,goodUp){if(!prev)return'';const d=(cur-prev)/Math.abs(prev)*100;if(Math.abs(d)<0.5)return`<span class="dl flat">= jak poprzednio</span>`;
  const up=d>0,good=up===goodUp;return`<span class="dl ${good?'good':'bad'}">${up?'▲':'▼'} ${Math.abs(d).toFixed(0)}%</span>`}
export const rTop=(x,y,w,h,r)=>{r=Math.max(0,Math.min(r,w/2,h));const b=y+h;return`M${x},${b}V${y+r}Q${x},${y} ${x+r},${y}H${x+w-r}Q${x+w},${y} ${x+w},${y+r}V${b}Z`};
export function donutSvg(segs,c1,c2){const R=78,C=2*Math.PI*R,tot=segs.reduce((a,s)=>a+s.v,0)||1;let off=0;
  const arcs=segs.map(s=>{const len=s.v/tot*C,g=segs.length>1?Math.min(2.5,len/2):0,L=Math.max(0.01,len-g);
    const el=`<circle cx="100" cy="100" r="${R}" fill="none" stroke="${s.c}" stroke-width="30" stroke-dasharray="${L.toFixed(2)} ${(C-L).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 100 100)" data-tip="${esc(s.l)}: ${zl(s.v)} (${pctS(s.v,tot)})" class="mk"/>`;off+=len;return el}).join('');
  return`<svg viewBox="0 0 200 200" class="donut" role="img" aria-label="${esc(c1+' '+c2)}">${arcs}<text x="100" y="97" text-anchor="middle" class="dc1">${esc(c1)}</text><text x="100" y="117" text-anchor="middle" class="dc2">${esc(c2)}</text></svg>`}
/* vertical bars: series = [{name,color,values[]}], labels[] ; tips[] per index */
export function barsSvg(labels,series,{h=170,every=1,tipLabel=i=>labels[i]}={}){
  const W=340,PL=40,PR=4,PT=10,PB=22,ch=h-PT-PB,n=labels.length,k=series.length;
  const max=niceMax(Math.max(1,...series.flatMap(s=>s.values)));
  const gw=(W-PL-PR)/n,inner=Math.max(2,gw-(n>20?2:6)),bw=Math.max(1.5,(inner-(k-1)*2)/k);
  let g='';for(let i=0;i<=4;i++){const v=max*i/4,y=PT+ch-ch*i/4;g+=`<line x1="${PL}" x2="${W-PR}" y1="${y}" y2="${y}" class="gl${i?'':' base'}"/>`+(i%2==0?`<text x="${PL-5}" y="${y+3.5}" text-anchor="end" class="ax">${kfmt(v)}</text>`:'')}
  let b='',hit='';labels.forEach((lb,i)=>{const x0=PL+i*gw+(gw-inner)/2;
    series.forEach((s,j)=>{const v=s.values[i]||0;if(v<=0)return;const bh=Math.max(1.5,v/max*ch),x=x0+j*(bw+2);b+=`<path d="${rTop(x,PT+ch-bh,bw,bh,n>20?2:4)}" fill="${s.color}"/>`});
    const tip=tipLabel(i)+': '+series.map(s=>(k>1?s.name+' ':'')+zl(s.values[i]||0)).join(' · ');
    hit+=`<rect x="${PL+i*gw}" y="${PT}" width="${gw}" height="${ch+PB}" fill="transparent" class="hit" data-tip="${esc(tip)}"/>`;
    if(i%every==0)b+=`<text x="${PL+i*gw+gw/2}" y="${h-6}" text-anchor="middle" class="ax">${esc(lb)}</text>`});
  return`<svg viewBox="0 0 ${W} ${h}" class="bars" role="img">${g}${b}${hit}</svg>`}
export function lineSvg(labels,values,color,{h=170}={}){
  const W=340,PL=46,PR=10,PT=14,PB=22,ch=h-PT-PB,n=labels.length,pts=values.map((v,i)=>v===null?null:[PL+(n==1?0.5:i/(n-1))*(W-PL-PR),v]);
  const vs=values.filter(v=>v!==null);if(!vs.length)return'';
  let lo=Math.min(0,...vs),hi=niceMax(Math.max(...vs,1));if(lo<0)lo=-niceMax(-lo);
  const Y=v=>PT+ch-(v-lo)/(hi-lo)*ch;
  let g='';for(let i=0;i<=4;i++){const v=lo+(hi-lo)*i/4,y=Y(v);g+=`<line x1="${PL}" x2="${W-PR}" y1="${y}" y2="${y}" class="gl${Math.abs(v)<1e-9?' base':''}"/>`+(i%2==0?`<text x="${PL-5}" y="${y+3.5}" text-anchor="end" class="ax">${kfmt(v)}</text>`:'')}
  const P=pts.filter(Boolean).map(([x,v])=>[x,Y(v)]);
  const line=P.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join('');
  const area=P.length>1?`<path d="${line}L${P.at(-1)[0].toFixed(1)},${Y(Math.max(lo,0))}L${P[0][0].toFixed(1)},${Y(Math.max(lo,0))}Z" fill="${color}" opacity=".12"/>`:'';
  let m='',hit='',lb='';const cw=(W-PL-PR)/Math.max(1,n-1);
  pts.forEach((p,i)=>{if(i%2==0||n<=6)lb+=`<text x="${PL+(n==1?0.5:i/(n-1))*(W-PL-PR)}" y="${h-6}" text-anchor="middle" class="ax">${esc(labels[i])}</text>`;
    if(!p)return;const y=Y(p[1]);m+=`<circle cx="${p[0].toFixed(1)}" cy="${y.toFixed(1)}" r="${i==P.length-1?4.5:3}" fill="${color}" stroke="#fff" stroke-width="2"/>`;
    hit+=`<rect x="${(p[0]-cw/2).toFixed(1)}" y="${PT}" width="${cw.toFixed(1)}" height="${ch}" fill="transparent" class="hit" data-tip="${esc(labels[i]+': '+zl(p[1]))}"/>`});
  return`<svg viewBox="0 0 ${W} ${h}" class="bars" role="img">${g}${area}<path d="${line}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round"/>${m}${lb}${hit}</svg>`}
export const chartBox=(title,sub,body,legend='')=>`<section class="chart"><div class="ct"><b>${esc(title)}</b>${sub?`<span class="mini">${sub}</span>`:''}</div>${legend}${body}<div class="tip mini">Dotknij wykresu, żeby zobaczyć kwotę.</div></section>`;
export const legendH=items=>`<div class="lg">${items.map(i=>`<span><i style="background:${i.c}"></i>${esc(i.l)}</span>`).join('')}</div>`;
export function hbarsH(rows,total){const mx=Math.max(1,...rows.map(r=>r.v));
  return`<div class="hbl">${rows.map(r=>`<div class="hr" data-tip="${esc(r.l)}: ${zl(r.v)}${total?' ('+pctS(r.v,total)+')':''}"><div class="r1"><span class="hl">${r.dot?`<i style="background:${r.dot}"></i>`:''}${esc(r.l)}</span><span class="num">${zl(r.v)}${total?`<em> ${pctS(r.v,total)}</em>`:''}</span></div><div class="hbar"><i style="width:${(r.v/mx*100).toFixed(1)}%;background:${r.c||'#334155'}"></i></div>${r.note?`<div class="mini">${r.note}</div>`:''}</div>`).join('')}</div>`}
export function whoH(who,total){const names=['Mati','Wercia','—'],cols={Mati:'#7fb0ec',Wercia:'#f0a3c3','—':P_OTHER};
  const rows=names.filter(n=>who[n]).map(n=>({n,v:who[n]}));if(!rows.length)return'<div class="mini">Brak wydatków.</div>';
  return`<div class="stack">${rows.map(r=>`<i style="width:${(r.v/total*100).toFixed(2)}%;background:${cols[r.n]}" data-tip="${r.n=='—'?'Nieprzypisane':r.n}: ${zl(r.v)} (${pctS(r.v,total)})"></i>`).join('')}</div>
    <div class="lg" style="margin-top:8px">${rows.map(r=>`<span><i style="background:${cols[r.n]}"></i>${r.n=='—'?'Nieprzypisane':r.n}: <b class="num">${zl(r.v)}</b> (${pctS(r.v,total)})</span>`).join('')}</div>`}
/* "paid in vs value": paid as steps, value as a line, the gap green (gain) or pink (loss); pts=[{d,paid,value}] sorted by date */
export function gainSvg(pts,{h=190,money=zl}={}){if(!pts.length)return'';
  const W=340,PL=46,PR=10,PT=12,PB=22,ch=h-PT-PB,t=d=>new Date(d+'T12:00:00').getTime();
  const t0=t(pts[0].d),t1=Math.max(t0+864e5,t(pts.at(-1).d)),X=d=>PL+(t(d)-t0)/(t1-t0)*(W-PL-PR);
  const vs=pts.flatMap(p=>[p.paid,p.value]);let lo=Math.min(0,...vs),hi=niceMax(Math.max(1,...vs));if(lo<0)lo=-niceMax(-lo);
  const Y=v=>PT+ch-(v-lo)/(hi-lo)*ch;
  let g='';for(let i=0;i<=4;i++){const v=lo+(hi-lo)*i/4,y=Y(v);g+=`<line x1="${PL}" x2="${W-PR}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" class="gl${Math.abs(v)<1e-9?' base':''}"/>`+(i%2==0?`<text x="${PL-5}" y="${(y+3.5).toFixed(1)}" text-anchor="end" class="ax">${kfmt(v)}</text>`:'')}
  let fill='',pl='',vl='',hit='';
  pts.forEach((p,i)=>{const x=X(p.d),nx=i<pts.length-1?X(pts[i+1].d):x;
    if(nx>x)fill+=`<path d="M${x.toFixed(1)},${Y(p.paid).toFixed(1)}H${nx.toFixed(1)}L${nx.toFixed(1)},${Y(p.value).toFixed(1)}H${x.toFixed(1)}Z" fill="${p.value>=p.paid?'#86efac':'#fda4af'}" opacity=".45"/>`;
    pl+=(i?'H'+x.toFixed(1)+'V':'M'+x.toFixed(1)+',')+Y(p.paid).toFixed(1);vl+=(i?'H'+x.toFixed(1)+'V':'M'+x.toFixed(1)+',')+Y(p.value).toFixed(1);
    const gn=p.value-p.paid,pc=p.paid>0?' ('+(gn>=0?'+':'')+(gn/p.paid*100).toFixed(1).replace('.',',')+'%)':'';
    hit+=`<rect x="${(x-4).toFixed(1)}" y="${PT}" width="${Math.max(8,nx-x).toFixed(1)}" height="${ch}" fill="transparent" class="hit" data-tip="${esc(p.d.split('-').reverse().join('.')+': wpłacono '+money(p.paid)+' · wartość '+money(p.value)+' · '+(gn>=0?'+':'')+money(gn)+pc)}"/>`});
  const last=pts.at(-1),xl=W-PR;pl+='H'+xl;vl+='H'+xl;
  const lb=[pts[0].d,last.d].map((d,i)=>`<text x="${i?W-PR:PL}" y="${h-6}" text-anchor="${i?'end':'start'}" class="ax">${d.split('-').reverse().join('.')}</text>`).join('');
  return`<svg viewBox="0 0 ${W} ${h}" class="bars" role="img" aria-label="Wpłacone a wartość">${g}${fill}<path d="${pl}" fill="none" stroke="#7fb0ec" stroke-width="2" stroke-dasharray="5 3"/><path d="${vl}" fill="none" stroke="#a78bfa" stroke-width="2.4"/>${lb}${hit}</svg>`}
/* Sankey: money in (left) → where it went (right); each left node is split in proportion to the right nodes */
export function sankeySvg(left,right,{h=260}={}){const W=340,NW=10,GAP=6,tot=Math.max(1,left.reduce((a,x)=>a+x.v,0)),totR=Math.max(1,right.reduce((a,x)=>a+x.v,0));
  const lay=(L,T)=>{const usable=h-GAP*(L.length-1);let y=0;return L.map(n=>{const hh=Math.max(2,n.v/T*usable),o={...n,y,h:hh};y+=hh+GAP;return o})};
  const Ls=lay(left,tot),Rs=lay(right,totR),x0=NW+96,x1=W-NW-96;let flows='',nodes='';
  const lOff=Ls.map(n=>n.y),rOff=Rs.map(n=>n.y);
  Ls.forEach((l,i)=>Rs.forEach((r,j)=>{const f=l.v*r.v/totR;if(f<=0)return;const hl=f/l.v*l.h,hr=f/r.v*r.h,ya=lOff[i],yb=rOff[j];lOff[i]+=hl;rOff[j]+=hr;
    flows+=`<path d="M${x0},${ya.toFixed(1)}C${(x0+x1)/2},${ya.toFixed(1)} ${(x0+x1)/2},${yb.toFixed(1)} ${x1},${yb.toFixed(1)}L${x1},${(yb+hr).toFixed(1)}C${(x0+x1)/2},${(yb+hr).toFixed(1)} ${(x0+x1)/2},${(ya+hl).toFixed(1)} ${x0},${(ya+hl).toFixed(1)}Z" fill="${r.c}" opacity=".38" class="hit" data-tip="${esc(l.l+' → '+r.l+': '+zl(Math.round(f)))}"/>`}));
  /* labels of small neighbouring nodes are spread apart (at least 12 px), so they never overlap */
  const spread=N=>{const y=N.map(n=>n.y+n.h/2+4);for(let i=1;i<y.length;i++)y[i]=Math.max(y[i],y[i-1]+12);
    const n=y.length-1;if(n>=0&&y[n]>h-2){y[n]=h-2;for(let i=n-1;i>=0;i--)y[i]=Math.min(y[i],y[i+1]-12)}return y};
  const lab=(n,x,y,anchor)=>`<text x="${x}" y="${y.toFixed(1)}" text-anchor="${anchor}" class="ax" style="font-size:10.5px">${esc(n.l.length>14?n.l.slice(0,13)+'…':n.l)}</text>`;
  const yl=spread(Ls),yr=spread(Rs);
  Ls.forEach((n,i)=>{nodes+=`<rect x="${x0-NW}" y="${n.y.toFixed(1)}" width="${NW}" height="${n.h.toFixed(1)}" rx="3" fill="${n.c}" data-tip="${esc(n.l+': '+zl(n.v))}" class="hit"/>`+lab(n,x0-NW-4,yl[i],'end')});
  Rs.forEach((n,i)=>{nodes+=`<rect x="${x1}" y="${n.y.toFixed(1)}" width="${NW}" height="${n.h.toFixed(1)}" rx="3" fill="${n.c}" data-tip="${esc(n.l+': '+zl(n.v))}" class="hit"/>`+lab(n,x1+NW+4,yr[i],'start')});
  return`<svg viewBox="0 0 ${W} ${h}" class="bars" role="img" aria-label="Przepływ pieniędzy">${flows}${nodes}</svg>`}
