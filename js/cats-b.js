/* prototype v2: softer, more realistic ragdolls – no outlines, gradients, fluffy edges (turbulence) and many fur strands */
let N=0;
const rnd=seed=>()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
const LOOK={
  bailey:{ear:'#4a3328',earIn:'#b98a86',mask:'#5a3f32',maskHi:'#7c5a49',maskFur:['#6e5040','#4c3429','#8a6753','#5e4335'],eye1:'#8cc0ff',eye2:'#2459c4',eyeRim:'#1b2a55',back:'#e3cdb0',tail1:'#3b2920',tail2:'#6e4f3e',tailFur:['#7a5a48','#3a271f','#5a4033','#8c6a55'],tip:null},
  ivo:{ear:'#eeab8a',earIn:'#f6c4bb',mask:null,eye1:'#d6e8ff',eye2:'#76a3dc',eyeRim:'#33496e',back:'#f3e2cc',tail1:'#f1d8bb',tail2:'#ffffff',tailFur:['#ffffff','#f6e9da','#efd9bf'],tip:'#efcfa8'}};
const f1=v=>v.toFixed(1);
export function realCat(who,face='calm'){const L=LOOK[who],id='rc'+(++N),R=rnd(who=='bailey'?7:13);
  const U='filterUnits="userSpaceOnUse" x="-30" y="-30" width="280" height="320"';
  const defs=`<defs>
  <filter id="${id}f" ${U}><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="${who=='bailey'?3:8}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter>
  <filter id="${id}b" ${U}><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="${id}s" ${U}><feGaussianBlur stdDeviation="2.4"/></filter>
  <filter id="${id}d" ${U}><feDropShadow dx="0" dy="1.5" stdDeviation="1.8" flood-color="#9c8b7c" flood-opacity=".5"/></filter>
  <radialGradient id="${id}w" cx="45%" cy="30%" r="80%"><stop offset="0" stop-color="#ffffff"/><stop offset=".65" stop-color="#f8f4ef"/><stop offset="1" stop-color="#e2d8cc"/></radialGradient>
  <radialGradient id="${id}h" cx="50%" cy="38%" r="62%"><stop offset="0" stop-color="#ffffff"/><stop offset=".78" stop-color="#f7f2ec"/><stop offset="1" stop-color="#e3dad0"/></radialGradient>
  <radialGradient id="${id}bk" cx="50%" cy="0%" r="100%"><stop offset="0" stop-color="${L.back}" stop-opacity="1"/><stop offset=".55" stop-color="${L.back}" stop-opacity=".55"/><stop offset="1" stop-color="${L.back}" stop-opacity="0"/></radialGradient>
  <linearGradient id="${id}t" x1="0" y1="1" x2=".4" y2="0"><stop offset="0" stop-color="${L.tail1}"/><stop offset=".6" stop-color="${L.tail2}"/><stop offset="1" stop-color="${L.tip||L.tail2}"/></linearGradient>
  <radialGradient id="${id}e" cx="50%" cy="42%" r="58%"><stop offset="0" stop-color="${L.eye1}"/><stop offset=".7" stop-color="${L.eye2}"/><stop offset="1" stop-color="${L.eyeRim}"/></radialGradient>
  <radialGradient id="${id}m" cx="38%" cy="38%" r="75%"><stop offset="0" stop-color="${L.maskHi||'#000'}"/><stop offset="1" stop-color="${L.mask||'#000'}"/></radialGradient>
  <linearGradient id="${id}ch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9cdc0" stop-opacity=".0"/><stop offset="1" stop-color="#d9cdc0" stop-opacity=".55"/></linearGradient>
  </defs>`;
  /* strands inside an ellipse, flowing down and outward */
  const fur=(n,cx,cy,rx,ry,cols,len=9,w=1.3,op=.8)=>{let g='';for(let i=0;i<n;i++){const a=R()*Math.PI*2,r=Math.sqrt(R()),x=cx+Math.cos(a)*rx*r,y=cy+Math.sin(a)*ry*r,ang=Math.PI/2+(x-cx)/rx*0.9+(R()-.5)*.5,l=len*(.6+R()*.8);
    g+=`<path d="M${f1(x)} ${f1(y)} q${f1(Math.cos(ang)*l*.5+R()*2-1)} ${f1(Math.sin(ang)*l*.5)} ${f1(Math.cos(ang)*l)} ${f1(Math.sin(ang)*l)}" stroke="${cols[i%cols.length]}" stroke-width="${w}" fill="none" stroke-linecap="round" opacity="${op}"/>`}return g};
  /* strands sticking out of an ellipse edge between two angles (cheek fluff, ruff edge) */
  const rim=(n,cx,cy,rx,ry,a0,a1,cols,len=10,w=1.4)=>{let g='';for(let i=0;i<n;i++){const a=a0+(a1-a0)*R(),x=cx+Math.cos(a)*rx,y=cy+Math.sin(a)*ry,l=len*(.6+R()*.7),o=a+(R()-.5)*.6+.25*Math.sign(Math.cos(a));
    g+=`<path d="M${f1(x-Math.cos(a)*4)} ${f1(y-Math.sin(a)*4)} q${f1(Math.cos(o)*l*.6)} ${f1(Math.sin(o)*l*.4)} ${f1(Math.cos(o)*l)} ${f1(Math.sin(o)*l+2)}" stroke="${cols[i%cols.length]}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`}return g};
  /* strands along a cubic curve (the tail) */
  const along=(n,p,cols,spread=14,len=12,w=1.6)=>{let g='';const B=(t,a,b,c,d)=>(1-t)**3*a+3*(1-t)**2*t*b+3*(1-t)*t*t*c+t**3*d;
    for(let i=0;i<n;i++){const t=R(),x=B(t,p[0],p[2],p[4],p[6]),y=B(t,p[1],p[3],p[5],p[7]),x2=B(Math.min(1,t+.02),p[0],p[2],p[4],p[6]),y2=B(Math.min(1,t+.02),p[1],p[3],p[5],p[7]);
      const dx=x2-x,dy=y2-y,dl=Math.hypot(dx,dy)||1,nx=-dy/dl,ny=dx/dl,off=(R()-.5)*2*spread,l=len*(.6+R()*.8);
      g+=`<path d="M${f1(x+nx*off)} ${f1(y+ny*off)} l${f1(dx/dl*l+nx*off*.25)} ${f1(dy/dl*l+ny*off*.25)}" stroke="${cols[i%cols.length]}" stroke-width="${w}" stroke-linecap="round" opacity=".85"/>`}return g};
  const T=[150,238,198,238,210,198,190,162];
  let s=defs+`<ellipse cx="110" cy="248" rx="88" ry="10" fill="#d4c8bb" opacity=".6" filter="url(#${id}b)"/>`;
  /* tail */
  s+=`<g filter="url(#${id}f)"><path d="M${T[0]} ${T[1]} C${T[2]} ${T[3]} ${T[4]} ${T[5]} ${T[6]} ${T[7]}" fill="none" stroke="url(#${id}t)" stroke-width="38" stroke-linecap="round"/></g>`+along(120,T,L.tailFur,11,10,1.3);
  /* haunches with the cream/fawn back fading towards the front */
  s+=`<g filter="url(#${id}f)"><ellipse cx="110" cy="200" rx="82" ry="52" fill="url(#${id}w)"/><ellipse cx="110" cy="176" rx="84" ry="36" fill="url(#${id}bk)"/></g>`;
  s+=fur(50,110,206,70,32,['#ffffff','#f3ede6'],10,1,.5);
  /* front legs, chest ruff in layers */
  s+=`<g filter="url(#${id}f)"><path d="M80 158 C76 190 78 222 80 240 L104 240 C106 220 106 190 104 158 Z" fill="url(#${id}w)"/><path d="M116 158 C114 190 114 220 116 240 L140 240 C142 222 144 190 140 158 Z" fill="url(#${id}w)"/></g>`;
  s+=`<path d="M108 170 C107 200 108 224 109 238 M112 170 C113 200 112 224 111 238" stroke="#ddd3c8" stroke-width="2.4" fill="none" opacity=".6" filter="url(#${id}s)"/>`;
  s+=fur(30,92,205,11,30,['#ffffff','#f3eee8'],8,1,.55)+fur(30,128,205,11,30,['#ffffff','#f3eee8'],8,1,.55);
  s+=`<g filter="url(#${id}f)"><path d="M60 118 C52 156 70 194 110 206 C150 194 168 156 160 118 Z" fill="url(#${id}w)"/></g>`;
  s+=`<path d="M70 180 C84 200 136 200 150 180 C140 196 80 196 70 180 Z" fill="url(#${id}ch)" filter="url(#${id}s)"/>`;
  for(const [cy,rx] of [[140,44],[160,40],[180,32]])s+=rim(40,110,cy-14,rx,16,.35,Math.PI-.35,['#ffffff','#f5f0ea','#ece5dd'],11,1.1);
  s+=fur(70,110,158,40,38,['#ffffff','#f2ece5'],10,1,.55);
  /* paws with toe lines */
  s+=`<g filter="url(#${id}d)"><ellipse cx="92" cy="243" rx="17" ry="9.5" fill="#fdfbf8"/><ellipse cx="128" cy="243" rx="17" ry="9.5" fill="#fdfbf8"/></g><path d="M86 245 q1 4 0 6 M92 246 q1 4 0 6 M98 245 q1 4 0 6 M122 245 q1 4 0 6 M128 246 q1 4 0 6 M134 245 q1 4 0 6" stroke="#ddd2c6" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  /* ears with fur tufts */
  const ear=(m)=>{const x=v=>f1(110+m*v);let e=`<path d="M${x(-50)} 76 C${x(-56)} 52 ${x(-54)} 30 ${x(-47)} 16 C${x(-34)} 24 ${x(-20)} 40 ${x(-11)} 52 Z" fill="${L.ear}"/><path d="M${x(-44)} 68 C${x(-47)} 50 ${x(-46)} 36 ${x(-43)} 27 C${x(-35)} 35 ${x(-26)} 46 ${x(-20)} 55 Z" fill="${L.earIn}" filter="url(#${id}s)"/>`;
    for(let i=0;i<9;i++){const bx=110+m*(-40+R()*16),by=64-R()*12;e+=`<path d="M${f1(bx)} ${f1(by)} q${f1(m*(-2-R()*3))} ${f1(-8-R()*6)} ${f1(m*(-3-R()*4))} ${f1(-14-R()*8)}" stroke="#ffffff" stroke-width="1.1" fill="none" opacity=".85" stroke-linecap="round"/>`}return e};
  s+=`<g filter="url(#${id}f)">${ear(1)}${ear(-1)}</g>`;
  /* head with fluffy cheeks */
  s+=`<g filter="url(#${id}f)"><path d="M54 94 C50 58 80 38 110 38 C140 38 170 58 166 94 C170 116 152 136 110 140 C68 136 50 116 54 94 Z" fill="url(#${id}h)"/></g>`;
  s+=rim(50,110,100,55,36,Math.PI*.15,Math.PI*.85,['#ffffff','#f5f0ea','#ece4db'],10,1.1);
  if(L.mask){
    s+=`<g filter="url(#${id}f)"><path d="M110 39 C82 38 56 54 54 88 C53 106 58 118 68 126 C80 120 92 115 101 110 C105 100 107 88 108 76 C110 62 111 50 110 39 Z" fill="url(#${id}m)"/></g>`;
    s+=fur(55,82,80,24,32,L.maskFur,6,1,.6);
    /* soft edge: dark strands into the white half and white strands into the patch */
    for(let i=0;i<22;i++){const y=44+R()*66,x=108-(y-44)*.12+R()*2,d=R()<.6?1:-1,l=2.5+R()*3.5;s+=`<path d="M${f1(x)} ${f1(y)} l${f1(d*l)} ${f1(1.5+R()*2)}" stroke="${d>0?L.maskFur[i%4]:'#f6f1ec'}" stroke-width="1" stroke-linecap="round" opacity=".55"/>`}
    s+=`<path d="M110 40 C108 60 106 90 100 110" stroke="${L.mask}" stroke-width="3" fill="none" opacity=".35" filter="url(#${id}s)"/>`;
  }else s+=`<ellipse cx="110" cy="58" rx="26" ry="12" fill="#f2d4b4" opacity=".7" filter="url(#${id}s)"/><ellipse cx="90" cy="76" rx="13" ry="6" fill="#eca26a" opacity=".42" transform="rotate(-12 90 76)" filter="url(#${id}s)"/><ellipse cx="130" cy="76" rx="13" ry="6" fill="#eca26a" opacity=".42" transform="rotate(12 130 76)" filter="url(#${id}s)"/>`+fur(30,110,62,26,14,['#efcfae','#f7e4cf','#ffffff'],6,1,.7);
  s+=fur(40,110,118,32,12,['#ffffff','#f1ebe4'],7,1.1,.8);
  /* eyes: dark rim, gradient iris with streaks, round pupil, two highlights */
  const eye=(cx,m)=>{const lid=face=='sleepy'?0.1:face=='grumpy'?0.5:face=='happy'?0.2:1;
    if(lid<0.3)return`<path d="M${cx-12} 89 Q${cx} 96 ${cx+12} 89" stroke="#3b2a22" stroke-width="2.6" fill="none" stroke-linecap="round"/>${L.mask&&cx<110?'':`<path d="M${cx-10} 91 Q${cx} 97 ${cx+10} 91" stroke="#e7ddd2" stroke-width="2" fill="none" opacity=".8"/>`}`;
    const ry=10.5;let e=`<ellipse cx="${cx}" cy="89" rx="13.5" ry="11.5" fill="#2a1d17" opacity=".9"/><ellipse cx="${cx}" cy="89" rx="12.3" ry="${ry}" fill="url(#${id}e)"/>`;
    for(let k=0;k<14;k++){const a=k/14*Math.PI*2;e+=`<path d="M${f1(cx+Math.cos(a)*5)} ${f1(90+Math.sin(a)*6.5)} L${f1(cx+Math.cos(a)*11)} ${f1(89+Math.sin(a)*9.5)}" stroke="${L.eye1}" stroke-width=".8" opacity=".55"/>`}
    e+=`<ellipse cx="${cx}" cy="90" rx="4.8" ry="7.6" fill="#0b1020"/><ellipse cx="${cx+4}" cy="84.5" rx="3.3" ry="2.7" fill="#fff"/><circle cx="${cx-4.5}" cy="94.5" r="1.3" fill="#fff" opacity=".8"/>`;
    if(lid<1)e+=`<path d="M${cx-15} 78 L${cx+15} 78 L${cx+15} ${89-ry*lid+m*2} Q${cx} ${88-ry*lid} ${cx-15} ${89-ry*lid-m*2} Z" fill="${L.mask&&cx<110?L.mask:'#fbf8f4'}"/><path d="M${cx-13} ${89-ry*lid-m*2} Q${cx} ${87-ry*lid} ${cx+13} ${89-ry*lid+m*2}" stroke="#2a1d17" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    return e};
  s+=eye(89,1)+eye(131,-1);
  /* muzzle: whisker pads with dots, nose with nostrils, mouth */
  s+=`<ellipse cx="100" cy="117" rx="11" ry="7" fill="#ffffff" opacity=".9" filter="url(#${id}s)"/><ellipse cx="120" cy="117" rx="11" ry="7" fill="#ffffff" opacity=".9" filter="url(#${id}s)"/>`;
  s+=`<g fill="#cdbfb2">${[[96,115],[93,118],[99,119],[124,115],[127,118],[121,119]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".9"/>`).join('')}</g>`;
  s+=`<path d="M103 106 C103 101.5 117 101.5 117 106 C117 109.5 112.5 111.5 110 114 C107.5 111.5 103 109.5 103 106 Z" fill="#e897a6"/><path d="M106 107.5 q1.5 1 3 .2 M114 107.5 q-1.5 1 -3 .2" stroke="#c76f82" stroke-width="1.1" fill="none" stroke-linecap="round"/><ellipse cx="108" cy="104.5" rx="2.6" ry="1.2" fill="#f6c3cc"/>`;
  s+=`<path d="M110 114 v4 M110 118 q-5 5 -10 2 M110 118 q5 5 10 2" stroke="#9c6f6f" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  s+=`<g stroke="#e4dcd3" stroke-width="1" stroke-linecap="round" fill="none"><path d="M93 114 Q70 107 44 106 M93 118 Q70 117 46 123 M94 121 Q74 124 52 134 M127 114 Q150 107 176 106 M127 118 Q150 117 174 123 M126 121 Q146 124 168 134"/></g><g stroke="#b9ab9e" stroke-width=".7" fill="none" opacity=".6"><path d="M93 115 Q70 108 44 107 M127 115 Q150 108 176 107"/></g>`;
  return`<svg viewBox="0 0 230 262" xmlns="http://www.w3.org/2000/svg"><g filter="url(#${id}d)">${s}</g></svg>`}
