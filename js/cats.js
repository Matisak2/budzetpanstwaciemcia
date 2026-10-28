/* Bailey & Ivo – the app's guides, softly painted ragdolls (no outlines: gradients, fluffy edges, fur strands).
   Bailey (she, b. 13.10.2025): white with a fawn back, dark brown ears, a brown patch over one half of the face and forehead, deep blue eyes, big dark brown tail.
   Ivo (he, b. 16.03.2026): almost white, apricot ears, cream forehead with a little ginger above both eyes, pale blue eyes, white tail with a cream tip;
   calm face by default – grumpy only when something annoys him.
   A cat = pose + face + accessories, drawn in a 230×262 box (paws at y≈243). Scenes place one or two cats with props. */
const f1=v=>v.toFixed(1);
const rnd=seed=>()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
const LOOK={
  bailey:{seed:7,ear:'#4a3328',earIn:'#b98a86',mask:'#5a3f32',maskHi:'#7c5a49',maskFur:['#6e5040','#4c3429','#8a6753','#5e4335'],eye1:'#8cc0ff',eye2:'#2459c4',eyeRim:'#1b2a55',back:'#e3cdb0',tail1:'#3b2920',tail2:'#6e4f3e',tailFur:['#7a5a48','#3a271f','#5a4033','#8c6a55'],tip:null},
  ivo:{seed:13,ear:'#eeab8a',earIn:'#f6c4bb',mask:null,eye1:'#d6e8ff',eye2:'#76a3dc',eyeRim:'#33496e',back:'#f3e2cc',tail1:'#f1d8bb',tail2:'#ffffff',tailFur:['#ffffff','#f6e9da','#efd9bf'],tip:'#efcfa8'}};
let N=0;

/* per-cat drawing kit: unique ids for gradients/filters + seeded random strands */
function kit(who){const L=LOOK[who],id='§'+(++N),R=rnd(L.seed);
  const U='filterUnits="userSpaceOnUse" x="-60" y="-60" width="360" height="400"';
  const defs=`<defs>
  <filter id="${id}f" ${U}><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="${L.seed%5}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter>
  <filter id="${id}b" ${U}><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="${id}s" ${U}><feGaussianBlur stdDeviation="2.4"/></filter>
  <filter id="${id}d" ${U}><feDropShadow dx="0" dy="1.5" stdDeviation="1.8" flood-color="#9c8b7c" flood-opacity=".5"/></filter>
  <radialGradient id="${id}w" cx="45%" cy="30%" r="80%"><stop offset="0" stop-color="#ffffff"/><stop offset=".65" stop-color="#f8f4ef"/><stop offset="1" stop-color="#e2d8cc"/></radialGradient>
  <radialGradient id="${id}h" cx="50%" cy="38%" r="62%"><stop offset="0" stop-color="#ffffff"/><stop offset=".78" stop-color="#f7f2ec"/><stop offset="1" stop-color="#e3dad0"/></radialGradient>
  <radialGradient id="${id}bk" cx="50%" cy="0%" r="100%"><stop offset="0" stop-color="${L.back}"/><stop offset=".55" stop-color="${L.back}" stop-opacity=".55"/><stop offset="1" stop-color="${L.back}" stop-opacity="0"/></radialGradient>
  <linearGradient id="${id}t" x1="0" y1="1" x2=".4" y2="0"><stop offset="0" stop-color="${L.tail1}"/><stop offset=".6" stop-color="${L.tail2}"/><stop offset="1" stop-color="${L.tip||L.tail2}"/></linearGradient>
  <radialGradient id="${id}e" cx="50%" cy="42%" r="58%"><stop offset="0" stop-color="${L.eye1}"/><stop offset=".7" stop-color="${L.eye2}"/><stop offset="1" stop-color="${L.eyeRim}"/></radialGradient>
  <radialGradient id="${id}m" cx="38%" cy="38%" r="75%"><stop offset="0" stop-color="${L.maskHi||'#000'}"/><stop offset="1" stop-color="${L.mask||'#000'}"/></radialGradient>
  <linearGradient id="${id}ch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9cdc0" stop-opacity="0"/><stop offset="1" stop-color="#d9cdc0" stop-opacity=".55"/></linearGradient></defs>`;
  const F=`filter="url(#${id}f)"`,S=`filter="url(#${id}s)"`,B=`filter="url(#${id}b)"`,D=`filter="url(#${id}d)"`;
  /* strands inside an ellipse, flowing down and outward */
  const fur=(n,cx,cy,rx,ry,cols,len=9,w=1,op=.6)=>{let g='';for(let i=0;i<n;i++){const a=R()*Math.PI*2,r=Math.sqrt(R()),x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r,ang=Math.PI/2+(x-cx)/rx*0.9+(R()-.5)*.5,l=len*(.6+R()*.8);
    g+=`<path d="M${f1(x)} ${f1(y)} q${f1(Math.cos(ang)*l*.5+R()*2-1)} ${f1(Math.sin(ang)*l*.5)} ${f1(Math.cos(ang)*l)} ${f1(Math.sin(ang)*l)}" stroke="${cols[i%cols.length]}" stroke-width="${w}" fill="none" stroke-linecap="round" opacity="${op}"/>`}return g};
  /* strands sticking out of an ellipse edge between two angles */
  const rim=(n,cx,cy,rx,ry,a0,a1,cols,len=10,w=1.1)=>{let g='';for(let i=0;i<n;i++){const a=a0+(a1-a0)*R(),x=cx+Math.cos(a)*rx,y=cy+Math.sin(a)*ry,l=len*(.6+R()*.7),o=a+(R()-.5)*.6+.25*Math.sign(Math.cos(a));
    g+=`<path d="M${f1(x-Math.cos(a)*4)} ${f1(y-Math.sin(a)*4)} q${f1(Math.cos(o)*l*.6)} ${f1(Math.sin(o)*l*.4)} ${f1(Math.cos(o)*l)} ${f1(Math.sin(o)*l+2)}" stroke="${cols[i%cols.length]}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`}return g};
  /* fluffy tail along a cubic curve p=[x0,y0,c1x,c1y,c2x,c2y,x1,y1] */
  const tail=(p,width=38)=>{const Bz=(t,a,b,c,d)=>(1-t)**3*a+3*(1-t)**2*t*b+3*(1-t)*t*t*c+t**3*d;let g=`<g ${F}><path d="M${p[0]} ${p[1]} C${p[2]} ${p[3]} ${p[4]} ${p[5]} ${p[6]} ${p[7]}" fill="none" stroke="url(#${id}t)" stroke-width="${width}" stroke-linecap="round"/></g>`;
    for(let i=0;i<120;i++){const t=R(),x=Bz(t,p[0],p[2],p[4],p[6]),y=Bz(t,p[1],p[3],p[5],p[7]),t2=Math.min(1,t+.02),dx=Bz(t2,p[0],p[2],p[4],p[6])-x,dy=Bz(t2,p[1],p[3],p[5],p[7])-y,dl=Math.hypot(dx,dy)||1,nx=-dy/dl,ny=dx/dl,off=(R()-.5)*width*.58,l=10*(.6+R()*.8);
      g+=`<path d="M${f1(x+nx*off)} ${f1(y+ny*off)} l${f1(dx/dl*l+nx*off*.25)} ${f1(dy/dl*l+ny*off*.25)}" stroke="${L.tailFur[i%L.tailFur.length]}" stroke-width="1.3" stroke-linecap="round" opacity=".85"/>`}
    return g};
  return{L,id,R,defs,F,S,B,D,fur,rim,tail}}

/* ---------- head (centre ≈ 110,90; ear tips ≈ y 16) ---------- */
function ears(k,inner=true){const{L,R,F,S}=k;const one=m=>{const x=v=>f1(110+m*v);let e=`<path d="M${x(-50)} 76 C${x(-56)} 52 ${x(-54)} 30 ${x(-47)} 16 C${x(-34)} 24 ${x(-20)} 40 ${x(-11)} 52 Z" fill="${L.ear}"/>`;
    if(inner){e+=`<path d="M${x(-44)} 68 C${x(-47)} 50 ${x(-46)} 36 ${x(-43)} 27 C${x(-35)} 35 ${x(-26)} 46 ${x(-20)} 55 Z" fill="${L.earIn}" ${S}/>`;
      for(let i=0;i<9;i++){const bx=110+m*(-40+R()*16),by=64-R()*12;e+=`<path d="M${f1(bx)} ${f1(by)} q${f1(m*(-2-R()*3))} ${f1(-8-R()*6)} ${f1(m*(-3-R()*4))} ${f1(-14-R()*8)}" stroke="#ffffff" stroke-width="1.1" fill="none" opacity=".85" stroke-linecap="round"/>`}}
    return e};return`<g ${F}>${one(1)}${one(-1)}</g>`}
function head(k,face){const{L,id,R,F,S,fur,rim}=k;
  let s=ears(k)+`<g ${F}><path d="M54 94 C50 58 80 38 110 38 C140 38 170 58 166 94 C170 116 152 136 110 140 C68 136 50 116 54 94 Z" fill="url(#${id}h)"/></g>`;
  s+=rim(50,110,100,55,36,Math.PI*.15,Math.PI*.85,['#ffffff','#f5f0ea','#ece4db'],10,1.1);
  if(L.mask){
    s+=`<g ${F}><path d="M110 39 C82 38 56 54 54 88 C53 106 58 118 68 126 C80 120 92 115 101 110 C105 100 107 88 108 76 C110 62 111 50 110 39 Z" fill="url(#${id}m)"/></g>`+fur(55,82,80,24,32,L.maskFur,6,1,.6);
    for(let i=0;i<22;i++){const y=44+R()*66,x=108-(y-44)*.12+R()*2,d=R()<.6?1:-1,l=2.5+R()*3.5;s+=`<path d="M${f1(x)} ${f1(y)} l${f1(d*l)} ${f1(1.5+R()*2)}" stroke="${d>0?L.maskFur[i%4]:'#f6f1ec'}" stroke-width="1" stroke-linecap="round" opacity=".55"/>`}
    s+=`<path d="M110 40 C108 60 106 90 100 110" stroke="${L.mask}" stroke-width="3" fill="none" opacity=".35" ${S}/>`;
  }else s+=`<ellipse cx="110" cy="58" rx="26" ry="12" fill="#f2d4b4" opacity=".7" ${S}/><ellipse cx="90" cy="76" rx="13" ry="6" fill="#eca26a" opacity=".42" transform="rotate(-12 90 76)" ${S}/><ellipse cx="130" cy="76" rx="13" ry="6" fill="#eca26a" opacity=".42" transform="rotate(12 130 76)" ${S}/>`+fur(30,110,62,26,14,['#efcfae','#f7e4cf','#ffffff'],6,1,.7);
  s+=fur(40,110,118,32,12,['#ffffff','#f1ebe4'],7,1.1,.8);
  /* eyes */
  const happy=face=='happy',lidOf=x=>face=='sleepy'?0.1:face=='grumpy'?0.5:happy||(face=='wink'&&x>110)?0.2:1;
  const eye=(cx,m)=>{const lid=lidOf(cx),onMask=L.mask&&cx<110,big=face=='surprised';
    /* a closed eye on Bailey's dark patch gets a light rim under the line – otherwise dark on dark is invisible */
    if(lid<0.3){const up=happy||face=='wink',d=up?`M${cx-12} 92 Q${cx} 81 ${cx+12} 92`:`M${cx-12} 89 Q${cx} 96 ${cx+12} 89`;
      return(onMask?`<path d="${d}" stroke="#f1e2d2" stroke-width="5.6" fill="none" stroke-linecap="round" opacity=".9"/>`:'')+`<path d="${d}" stroke="${onMask?'#2a1a12':'#3b2a22'}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`+(onMask?'':`<path d="M${cx-10} ${up?94:91} Q${cx} ${up?86:97} ${cx+10} ${up?94:91}" stroke="#e7ddd2" stroke-width="2" fill="none" opacity=".7"/>`)}
    const rx=big?14:12.3,ry=big?13:10.5;let e=`<ellipse cx="${cx}" cy="89" rx="${rx+1.2}" ry="${ry+1}" fill="#2a1d17" opacity=".9"/><ellipse cx="${cx}" cy="89" rx="${rx}" ry="${ry}" fill="url(#${id}e)"/>`;
    for(let j=0;j<14;j++){const a=j/14*Math.PI*2;e+=`<path d="M${f1(cx+Math.cos(a)*5)} ${f1(90+Math.sin(a)*6.5)} L${f1(cx+Math.cos(a)*(rx-1.3))} ${f1(89+Math.sin(a)*(ry-1))}" stroke="${L.eye1}" stroke-width=".8" opacity=".55"/>`}
    e+=`<ellipse cx="${cx}" cy="90" rx="${big?6:4.8}" ry="${big?6.5:7.6}" fill="#0b1020"/><ellipse cx="${cx+4}" cy="84.5" rx="3.3" ry="2.7" fill="#fff"/><circle cx="${cx-4.5}" cy="94.5" r="1.3" fill="#fff" opacity=".8"/>`;
    if(lid<1)e+=`<path d="M${cx-15} 77 L${cx+15} 77 L${cx+15} ${89-ry*lid+m*2} Q${cx} ${88-ry*lid} ${cx-15} ${89-ry*lid-m*2} Z" fill="${onMask?L.mask:'#fbf8f4'}"/><path d="M${cx-13} ${89-ry*lid-m*2} Q${cx} ${87-ry*lid} ${cx+13} ${89-ry*lid+m*2}" stroke="#2a1d17" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    return e};
  s+=eye(89,1)+eye(131,-1);
  /* muzzle */
  s+=`<ellipse cx="100" cy="117" rx="11" ry="7" fill="#ffffff" opacity=".9" ${S}/><ellipse cx="120" cy="117" rx="11" ry="7" fill="#ffffff" opacity=".9" ${S}/>`;
  if(happy||face=='wink')s+=`<ellipse cx="78" cy="110" rx="9" ry="5" fill="#f7b7c4" opacity=".45" ${S}/><ellipse cx="142" cy="110" rx="9" ry="5" fill="#f7b7c4" opacity=".45" ${S}/>`;
  s+=`<g fill="#cdbfb2">${[[96,115],[93,118],[99,119],[124,115],[127,118],[121,119]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".9"/>`).join('')}</g>`;
  s+=`<path d="M103 106 C103 101.5 117 101.5 117 106 C117 109.5 112.5 111.5 110 114 C107.5 111.5 103 109.5 103 106 Z" fill="#e897a6"/><path d="M106 107.5 q1.5 1 3 .2 M114 107.5 q-1.5 1 -3 .2" stroke="#c76f82" stroke-width="1.1" fill="none" stroke-linecap="round"/><ellipse cx="108" cy="104.5" rx="2.6" ry="1.2" fill="#f6c3cc"/>`;
  s+=face=='surprised'?`<path d="M110 114 v3" stroke="#9c6f6f" stroke-width="1.5"/><ellipse cx="110" cy="122" rx="3.6" ry="4.4" fill="#b8697b"/>`
    :face=='grumpy'?`<path d="M110 114 v4 M110 118 q-5 2 -10 4 M110 118 q5 2 10 4" stroke="#9c6f6f" stroke-width="1.5" fill="none" stroke-linecap="round"/>`
    :`<path d="M110 114 v4 M110 118 q-5 5 -10 2 M110 118 q5 5 10 2" stroke="#9c6f6f" stroke-width="1.5" fill="none" stroke-linecap="round"/>`+(happy?`<path d="M106 121 q4 5 8 0 z" fill="#ea8fa0"/>`:'');
  s+=`<g stroke="#e4dcd3" stroke-width="1" stroke-linecap="round" fill="none"><path d="M93 114 Q70 107 44 106 M93 118 Q70 117 46 123 M94 121 Q74 124 52 134 M127 114 Q150 107 176 106 M127 118 Q150 117 174 123 M126 121 Q146 124 168 134"/></g><g stroke="#b9ab9e" stroke-width=".7" fill="none" opacity=".6"><path d="M93 115 Q70 108 44 107 M127 115 Q150 108 176 107"/></g>`;
  return s}

/* ---------- bodies ---------- */
function sitBody(k){const{id,F,S,B,D,fur,rim,tail}=k;
  let s=`<ellipse cx="110" cy="248" rx="88" ry="10" fill="#d4c8bb" opacity=".6" ${B}/>`+tail([150,238,198,238,210,198,190,162]);
  s+=`<g ${F}><ellipse cx="110" cy="200" rx="82" ry="52" fill="url(#${id}w)"/><ellipse cx="110" cy="176" rx="84" ry="36" fill="url(#${id}bk)"/></g>`+fur(50,110,206,70,32,['#ffffff','#f3ede6'],10,1,.5);
  s+=`<g ${F}><path d="M80 158 C76 190 78 222 80 240 L104 240 C106 220 106 190 104 158 Z" fill="url(#${id}w)"/><path d="M116 158 C114 190 114 220 116 240 L140 240 C142 222 144 190 140 158 Z" fill="url(#${id}w)"/></g>`;
  s+=`<path d="M108 170 C107 200 108 224 109 238 M112 170 C113 200 112 224 111 238" stroke="#ddd3c8" stroke-width="2.4" fill="none" opacity=".6" ${S}/>`+fur(30,92,205,11,30,['#ffffff','#f3eee8'],8,1,.55)+fur(30,128,205,11,30,['#ffffff','#f3eee8'],8,1,.55);
  s+=`<g ${F}><path d="M60 118 C52 156 70 194 110 206 C150 194 168 156 160 118 Z" fill="url(#${id}w)"/></g><path d="M70 180 C84 200 136 200 150 180 C140 196 80 196 70 180 Z" fill="url(#${id}ch)" ${S}/>`;
  for(const [cy,rx] of [[140,44],[160,40],[180,32]])s+=rim(40,110,cy-14,rx,16,.35,Math.PI-.35,['#ffffff','#f5f0ea','#ece5dd'],11,1.1);
  s+=fur(70,110,158,40,38,['#ffffff','#f2ece5'],10,1,.55);
  s+=`<g ${D}><ellipse cx="92" cy="243" rx="17" ry="9.5" fill="#fdfbf8"/><ellipse cx="128" cy="243" rx="17" ry="9.5" fill="#fdfbf8"/></g><path d="M86 245 q1 4 0 6 M92 246 q1 4 0 6 M98 245 q1 4 0 6 M122 245 q1 4 0 6 M128 246 q1 4 0 6 M134 245 q1 4 0 6" stroke="#ddd2c6" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  return s}
/* lying "loaf": body to the right, paws tucked in front, tail along the front; the head uses LOAF_HEAD */
const LOAF_HEAD='translate(-28 52) scale(.9)';
function loafBody(k){const{L,id,F,B,D,fur,rim,tail}=k;
  let s=`<ellipse cx="128" cy="250" rx="104" ry="9" fill="#d4c8bb" opacity=".6" ${B}/>`;
  s+=`<g ${F}><path d="M34 246 C22 200 52 152 114 148 C174 144 222 170 226 214 C228 238 216 248 196 248 Z" fill="url(#${id}w)"/><path d="M100 152 C150 142 210 160 224 204 C196 182 150 172 104 178 Z" fill="url(#${id}bk)"/></g>`;
  s+=rim(70,132,204,92,54,-Math.PI*.95,-Math.PI*.05,['#ffffff','#f3ede6',L.back],11,1.1)+fur(80,140,210,74,32,['#ffffff','#f2ece5'],10,1,.5);
  s+=tail([210,244,170,252,110,254,64,248],28);
  s+=`<g ${D}><ellipse cx="62" cy="244" rx="16" ry="8" fill="#fdfbf8"/><ellipse cx="94" cy="246" rx="16" ry="8" fill="#fdfbf8"/></g>`;
  return s}
/* seen from behind (looking out of a window); the tail hangs down over the edge */
function backView(k){const{L,id,F,S,fur,rim,tail}=k;
  let s=tail([128,232,150,256,146,290,156,318],30);
  s+=`<g ${F}><ellipse cx="110" cy="196" rx="80" ry="54" fill="url(#${id}w)"/><path d="M54 170 C66 140 90 126 110 126 C130 126 154 140 166 170 C170 196 160 226 142 240 L78 240 C60 226 50 196 54 170 Z" fill="url(#${id}bk)"/></g>`;
  s+=fur(90,110,190,58,48,[L.back,'#ffffff','#efe2d0'],11,1,.55);
  s+=ears(k,false)+`<g ${F}><ellipse cx="110" cy="88" rx="56" ry="50" fill="url(#${id}h)"/></g>`+rim(40,110,92,56,46,Math.PI*.15,Math.PI*.85,['#ffffff','#f5f0ea'],10,1.1);
  s+=L.mask?`<g ${F}><path d="M62 70 C70 50 90 40 110 39 C112 58 104 74 86 84 C74 86 64 80 62 70 Z" fill="url(#${id}m)"/></g>`+fur(30,86,62,18,16,L.maskFur,6,1,.6)
    :`<ellipse cx="110" cy="58" rx="28" ry="13" fill="#f2d4b4" opacity=".7" ${S}/>`;
  return s}
/* only two paws over an edge (peeking out of a box); the head is drawn above them */
const peekPaws=k=>`<g ${k.D}><ellipse cx="84" cy="150" rx="17" ry="9" fill="#fdfbf8"/><ellipse cx="136" cy="150" rx="17" ry="9" fill="#fdfbf8"/></g>`;

/* ---------- accessories ---------- */
const INK='#5b463b';
const HEAD_ACC={
  hat:`<g transform="rotate(-14 110 40)"><path d="M90 44 L110 -6 L130 44 Z" fill="#fbcfe8"/><path d="M96 30 L124 30 M100 18 L120 18" stroke="#f9a8d4" stroke-width="3"/><circle cx="104" cy="36" r="3" fill="#fde68a"/><circle cx="116" cy="24" r="2.6" fill="#a7f3d0"/><circle cx="110" cy="-8" r="6" fill="#fde68a"/></g>`,
  santa:`<g transform="rotate(-10 110 40)"><path d="M72 48 C74 16 100 0 128 4 C150 8 166 24 170 44 C150 40 98 38 72 48 Z" fill="#f4a3a3"/><path d="M128 4 C146 6 168 18 176 44" fill="none" stroke="#f4a3a3" stroke-width="10" stroke-linecap="round"/><circle cx="178" cy="48" r="9" fill="#ffffff"/><path d="M68 50 C96 38 146 38 172 46" stroke="#ffffff" stroke-width="11" stroke-linecap="round" fill="none"/></g>`,
  crown:(()=>{let g='';[[62,62,'#f9a8d4'],[76,50,'#fde68a'],[92,43,'#c4b5fd'],[110,40,'#f9a8d4'],[128,43,'#a7f3d0'],[144,50,'#fde68a'],[158,62,'#c4b5fd']].forEach(([x,y,c])=>{g+=`<g transform="translate(${x} ${y})">${[0,72,144,216,288].map(a=>`<ellipse cx="0" cy="-4.5" rx="3.2" ry="4.6" fill="${c}" transform="rotate(${a})"/>`).join('')}<circle r="2.4" fill="#fff7d6"/></g>`});return`<path d="M58 66 C80 44 140 44 162 66" stroke="#86c29a" stroke-width="3" fill="none"/>${g}`})(),
  glasses:`<g><path d="M70 82 C70 76 104 76 104 82 C104 96 96 100 86 100 C76 100 70 94 70 82 Z M116 82 C116 76 150 76 150 82 C150 94 144 100 134 100 C124 100 116 96 116 82 Z" fill="#c4b5fd" opacity=".85"/><path d="M104 84 Q110 80 116 84 M70 82 L56 78 M150 82 L164 78" stroke="#7c6aa8" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M76 84 L84 82" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/></g>`,
  scarf:`<g><path d="M62 128 C80 146 140 146 158 128 L162 140 C140 160 80 160 58 140 Z" fill="#a5d8f3"/><path d="M128 146 L140 186 L124 188 L116 148 Z" fill="#93c5fd"/><path d="M66 134 C84 150 136 150 154 134" stroke="#ffffff" stroke-width="3" stroke-dasharray="3 6" fill="none" opacity=".8"/></g>`,
};
const BODY_ACC={
  bell:`<g><path d="M188 222 v-10" stroke="${INK}" stroke-width="1.6"/><circle cx="194" cy="236" r="14" fill="#f9a8d4"/><path d="M183 232 Q194 228 205 232" fill="none" stroke="#fbcfe8" stroke-width="2.5"/><circle cx="188" cy="210" r="6.5" fill="#fcd34d"/><path d="M184 212 h8" stroke="#b45309" stroke-width="1.4"/></g>`,
  coin:`<g><circle cx="192" cy="226" r="17" fill="#fcd34d"/><circle cx="192" cy="226" r="12" fill="none" stroke="#f59e0b" stroke-width="2"/><text x="192" y="232" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="15" fill="#b45309">zł</text><path d="M182 216 a14 14 0 0 1 8 -5" stroke="#fff7d6" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>`,
  churu:`<g transform="rotate(18 44 200)"><rect x="34" y="166" width="22" height="64" rx="7" fill="#fde68a"/><rect x="34" y="166" width="22" height="15" rx="7" fill="#f9a8d4"/><text x="45" y="210" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="9" fill="#b45309">churu</text></g>`,
  lupa:`<g><path d="M44 170 L20 210" stroke="#a78b6d" stroke-width="9" stroke-linecap="round"/><circle cx="56" cy="148" r="26" fill="#e0f2fe" opacity=".55"/><circle cx="56" cy="148" r="26" fill="none" stroke="#f2c45f" stroke-width="6"/><path d="M42 136 a18 18 0 0 1 12 -8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></g>`,
  envelope:`<g transform="rotate(-8 50 214)"><rect x="18" y="194" width="62" height="42" rx="6" fill="#fbcfe8"/><path d="M18 198 L49 220 L80 198" fill="none" stroke="#f472b6" stroke-width="2.5"/><circle cx="49" cy="222" r="5" fill="#fde68a"/></g>`,
  pumpkin:`<g><ellipse cx="40" cy="228" rx="26" ry="20" fill="#fdba74"/><path d="M28 212 C24 224 24 236 30 246 M52 212 C56 224 56 236 50 246 M40 208 V248" stroke="#f59e0b" stroke-width="2" fill="none" opacity=".7"/><path d="M40 210 q2 -10 8 -12" stroke="#86c29a" stroke-width="4" fill="none" stroke-linecap="round"/></g>`,
  calc:`<g transform="rotate(10 46 210)"><rect x="22" y="180" width="48" height="62" rx="8" fill="#c7d2fe"/><rect x="28" y="186" width="36" height="14" rx="3" fill="#eef2ff"/>${[0,1,2].map(r=>[0,1,2].map(c=>`<rect x="${29+c*12}" y="${205+r*11}" width="9" height="8" rx="2" fill="#ffffff"/>`).join('')).join('')}</g>`,
};

/* one cat: pose sit | loaf | back | sleep | peek, face calm | happy | wink | sleepy | surprised | grumpy, acc = accessory names */
export function cat(who,{pose='sit',face='calm',x=0,y=0,s=1,flip=false,acc=[]}={}){const k=kit(who);
  const hAcc=acc.filter(a=>HEAD_ACC[a]).map(a=>HEAD_ACC[a]).join(''),bAcc=acc.filter(a=>BODY_ACC[a]).map(a=>BODY_ACC[a]).join('');
  let g;
  if(pose=='back')g=backView(k);
  else if(pose=='loaf'||pose=='sleep')g=loafBody(k)+(pose=='sleep'?`<path d="M110 178 C136 142 204 146 226 192 C232 214 230 238 222 249 L118 249 C108 230 104 200 110 178 Z" fill="#fbcfe8"/><path d="M116 200 C146 178 202 180 226 202 M118 224 C148 204 202 206 228 224" fill="none" stroke="#f9a8d4" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>`:'')+`<g transform="${LOAF_HEAD}">${head(k,pose=='sleep'?'sleepy':face)}${hAcc}</g>`+(pose=='sleep'?`<text x="124" y="56" font-family="Nunito,sans-serif" font-weight="900" font-size="26" fill="#a5b4fc">z</text><text x="146" y="34" font-family="Nunito,sans-serif" font-weight="900" font-size="18" fill="#c7d2fe">z</text>`:'');
  else if(pose=='peek')g=`<g transform="translate(0 20)">${head(k,face)}${hAcc}</g>`+peekPaws(k);
  else g=sitBody(k)+head(k,face)+hAcc;
  return`<g transform="translate(${x} ${y}) scale(${s})${flip?' translate(230 0) scale(-1 1)':''}">${k.defs}<g ${k.D}>${g}${bAcc}</g></g>`}

/* ---------- props for scenes ---------- */
const balloon=(x,y,n)=>`<g transform="translate(${x} ${y})"><path d="M34 132 C26 152 40 170 30 196" fill="none" stroke="#b45309" stroke-width="2"/><text x="34" y="130" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="132" fill="#fcd34d" stroke="#f2c45f" stroke-width="5" paint-order="stroke">${n}</text><path d="M18 30 q6 -10 16 -12" stroke="#fff7d6" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/></g>`;
const box=(x,y,w=330)=>`<g transform="translate(${x} ${y})"><path d="M0 40 L${w} 40 L${w-14} 150 L14 150 Z" fill="#e8c9a0"/><path d="M0 40 L-28 4 L${w*.46} 4 L${w*.5} 40 Z M${w} 40 L${w+28} 4 L${w*.54} 4 L${w*.5} 40 Z" fill="#f3dcbc"/><path d="M0 40 L${w} 40" stroke="#d4b08a" stroke-width="3"/><path d="M${w*.36} 78 h${w*.28}" stroke="#c89f6e" stroke-width="6" stroke-linecap="round"/></g>`;
const windowFrame=(w,h)=>`<rect x="18" y="0" width="${w-36}" height="${h}" rx="12" fill="#e0f2fe"/><ellipse cx="${w*.3}" cy="64" rx="54" ry="18" fill="#fff" opacity=".9"/><ellipse cx="${w*.72}" cy="44" rx="40" ry="13" fill="#fff" opacity=".9"/><path d="M18 ${h-50} C90 ${h-74} 160 ${h-60} ${w/2} ${h-70} C${w*.7} ${h-80} ${w*.85} ${h-62} ${w-18} ${h-70} V${h} H18 Z" fill="#bbf7d0"/><rect x="18" y="0" width="${w-36}" height="${h}" rx="12" fill="none" stroke="#e2e8f0" stroke-width="8"/><path d="M${w/2} 0 V${h}" stroke="#e2e8f0" stroke-width="8"/>`;
const sill=(y,w)=>`<rect x="0" y="${y}" width="${w}" height="18" rx="7" fill="#f8fafc"/><rect x="0" y="${y+14}" width="${w}" height="6" rx="3" fill="#e2e8f0"/>`;
const heather=(x,y)=>{const R=rnd(5);let back='',front='';const tuft=(tx,ty,ang,col,len)=>{let t=`<path d="M${tx} ${ty} l${f1(Math.sin(ang)*len)} ${f1(-Math.cos(ang)*len)}" stroke="#7fb58d" stroke-width="3" stroke-linecap="round"/>`;
    for(let j=1;j<=Math.round(len/6.5);j++){const d=j*6.2;t+=`<ellipse cx="${f1(tx+Math.sin(ang)*d+(j%2?3:-3))}" cy="${f1(ty-Math.cos(ang)*d)}" rx="3.4" ry="4.4" fill="${col}" opacity="${f1(.75+R()*.25)}"/>`}return t};
  [[-.9,'#f9a8d4',28],[-.6,'#e9d5ff',38],[-.35,'#f472b6',50],[.35,'#fbcfe8',196],[.6,'#d8b4fe',208],[.9,'#f9a8d4',218]].forEach(([a,c,tx])=>{back+=tuft(tx,214,a,c,76)});
  [[-.5,'#fbcfe8',44],[-.15,'#f9a8d4',70],[.1,'#e9d5ff',150],[.4,'#f472b6',176],[.75,'#d8b4fe',198],[-.75,'#f9a8d4',32],[.05,'#f472b6',112]].forEach(([a,c,tx])=>{front+=tuft(tx,218,a,c,32)});
  return{back:`<g transform="translate(${x} ${y})">${back}</g>`,front:`<g transform="translate(${x} ${y})">${front}<path d="M14 212 H232 L220 248 H26 Z" fill="#ffffff"/><path d="M14 212 H232" stroke="#e2e8f0" stroke-width="3"/><path d="M50 222 V240 M88 222 V240 M126 222 V240 M164 222 V240 M202 222 V240" stroke="#edf2f7" stroke-width="4"/></g>`}};
const papers=(x,y)=>`<g transform="translate(${x} ${y})"><rect x="10" y="10" width="236" height="16" rx="3" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/><rect x="4" y="24" width="248" height="16" rx="3" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/><path d="M30 17 H140 M30 32 H200" stroke="#cbd5e1" stroke-width="2.5"/></g>`;
const sprinkle=(w,h,kind,seed=3)=>{const R=rnd(seed);let g='';for(let i=0;i<16;i++){const x=f1(R()*w),y=f1(R()*h*.75),r=R();
  g+=kind=='snow'?`<circle cx="${x}" cy="${y}" r="${f1(2+r*3)}" fill="#ffffff" opacity=".95"/>`
    :kind=='hearts'?`<path d="M${x} ${y} c-4 -6 -12 -2 -8 5 l8 8 l8 -8 c4 -7 -4 -11 -8 -5 z" fill="${['#f9a8d4','#fbcfe8','#f472b6'][i%3]}" opacity=".85" transform="rotate(${f1(r*40-20)} ${x} ${y})"/>`
    :kind=='leaves'?`<ellipse cx="${x}" cy="${y}" rx="7" ry="3.6" fill="${['#fdba74','#fcd34d','#f59e0b','#fca5a5'][i%4]}" opacity=".9" transform="rotate(${f1(r*180)} ${x} ${y})"/>`
    :`<rect x="${x}" y="${y}" width="6" height="10" rx="2" fill="${['#fbcfe8','#bbf0d6','#dfe5ff','#fde68a','#e9d5ff'][i%5]}" transform="rotate(${f1(r*180)} ${x} ${y})"/>`}return g};

/* ---------- scenes (viewBox sized to each scene) ---------- */
const duo=(b,i)=>cat('bailey',{x:0,y:0,...b})+cat('ivo',{x:200,y:10,s:.95,...i});
const SCENES={
  duo:{vb:'0 0 430 262',draw:()=>duo({},{})},
  happy:{vb:'0 0 430 262',draw:()=>duo({face:'happy'},{face:'happy'})},
  celebrate:{vb:'0 0 430 262',draw:()=>sprinkle(430,262,'confetti',9)+duo({face:'happy',acc:['hat']},{face:'happy',acc:['hat']})},
  wink:{vb:'0 0 430 262',draw:()=>duo({face:'calm'},{face:'wink'})},
  bailey:{vb:'0 0 230 262',draw:()=>cat('bailey')},
  ivo:{vb:'0 0 230 262',draw:()=>cat('ivo')},
  grumpy:{vb:'0 0 230 262',draw:()=>cat('ivo',{face:'grumpy'})},
  baileyHappy:{vb:'0 0 230 262',draw:()=>cat('bailey',{face:'happy'})},
  ivoHappy:{vb:'0 0 230 262',draw:()=>cat('ivo',{face:'happy'})},
  bell:{vb:'0 0 230 262',draw:()=>cat('ivo',{face:'surprised',acc:['bell']})},
  coin:{vb:'0 0 230 262',draw:()=>cat('ivo',{face:'happy',acc:['coin']})},
  churu:{vb:'0 0 230 262',draw:()=>cat('bailey',{face:'happy',acc:['churu']})},
  lupa:{vb:'0 0 230 262',draw:()=>cat('bailey',{face:'calm',acc:['lupa']})},
  envelope:{vb:'0 0 230 262',draw:()=>cat('bailey',{face:'happy',acc:['envelope']})},
  calc:{vb:'0 0 230 262',draw:()=>cat('ivo',{face:'calm',acc:['calc']})},
  birthdayB:{vb:'0 0 330 262',draw:a=>balloon(6,30,a)+sprinkle(330,262,'confetti',4)+cat('bailey',{x:96,face:'happy',acc:['hat']})},
  birthdayI:{vb:'0 0 330 262',draw:a=>balloon(6,30,a)+sprinkle(330,262,'confetti',6)+cat('ivo',{x:96,face:'happy',acc:['hat']})},
  window:{vb:'0 0 430 330',draw:()=>windowFrame(430,262)+sill(262,430)+cat('bailey',{pose:'back',x:20,y:20,s:.98})+cat('ivo',{pose:'back',x:200,y:30,s:.92})},
  heather:{vb:'0 0 250 262',draw:()=>{const h=heather(0,14);return h.back+cat('ivo',{pose:'loaf',x:8,y:-4})+h.front}},
  sleep:{vb:'0 0 250 262',draw:()=>cat('bailey',{pose:'sleep',x:4})},
  sleepIvo:{vb:'0 0 250 262',draw:()=>cat('ivo',{pose:'sleep',x:4})},
  loaf:{vb:'0 0 250 262',draw:()=>cat('bailey',{pose:'loaf',x:4})},
  papers:{vb:'0 0 260 262',draw:()=>cat('ivo',{pose:'loaf',x:8,y:-26})+papers(2,222)},
  box:{vb:'-14 6 380 256',draw:()=>cat('bailey',{pose:'peek',x:16,y:-10})+cat('ivo',{pose:'peek',x:170,y:-4,s:.95,face:'wink'})+box(16,112,300)},
  winter:{vb:'0 0 430 262',draw:()=>sprinkle(430,262,'snow',2)+duo({acc:['scarf']},{face:'happy',acc:['scarf']})},
  christmas:{vb:'0 0 430 262',draw:()=>sprinkle(430,262,'snow',5)+duo({face:'happy',acc:['santa']},{face:'happy',acc:['santa']})},
  spring:{vb:'0 0 430 262',draw:()=>duo({face:'happy',acc:['crown']},{acc:['crown']})},
  summer:{vb:'0 0 430 262',draw:()=>duo({acc:['glasses']},{face:'happy',acc:['glasses']})},
  autumn:{vb:'0 0 430 262',draw:()=>sprinkle(430,262,'leaves',7)+duo({},{face:'calm'})},
  halloween:{vb:'0 0 430 262',draw:()=>duo({face:'wink',acc:['pumpkin']},{face:'surprised'})},
  valentine:{vb:'0 0 430 262',draw:()=>sprinkle(430,262,'hearts',8)+duo({face:'happy'},{face:'happy'})},
};
/* scenes are drawn once and cached (they are big); every copy put on the page gets its own gradient/filter ids (§ = id placeholder),
   otherwise a copy on a hidden screen (e.g. the login page) would "own" the ids and the visible copy would not paint */
const CACHE=new Map();let U=0;
export function scene(name,cls='kot',arg='1'){const key=name+'|'+arg;let svg=CACHE.get(key);
  if(!svg){const sc=SCENES[name]||SCENES.duo;svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${sc.vb}" class="@cls" role="img" aria-label="Bailey i Ivo">${sc.draw(arg)}</svg>`;CACHE.set(key,svg)}
  const u='k'+(++U)+'_';return svg.replace('@cls',cls).replace(/§/g,u)}
