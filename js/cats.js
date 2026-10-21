/* Bailey & Ivo – the app's guides, drawn from building blocks: pose + face + accessories.
   Bailey (she): white ragdoll with a cream back, dark brown ears, a brown patch over one half of the face and forehead, deep blue eyes, big dark brown tail.
   Ivo (he): almost white, apricot ears, cream shading on the forehead, pale blue eyes, white tail with a cream tip, slightly smaller, famous grumpy look.
   Every cat is drawn in a 200×200 box (ground at y≈192) and placed in a scene with x / y / scale. */
const INK='#3b2a22',W='#ffffff',SHADE='#ede5dc',NOSE='#f2a1b3',BLUSH='#f7b7c4';
const LOOK={
  bailey:{ear:'#5f4334',inner:'#c98f9c',eye:'#3f7fe0',mask:'#6b4c3b',back:'#efdcc4',tail:'#5a4033',tailHi:'#7c5b48',tip:null},
  ivo:{ear:'#f4b49c',inner:'#f8cfc6',eye:'#8db7ea',mask:null,back:'#f7e6d4',tail:'#ffffff',tailHi:'#ffffff',tip:'#f0cfa8'}};
const sw=(w=3)=>`stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

/* ---------- face ---------- */
function eyes(L,face){
  const open=(x)=>`<ellipse cx="${x}" cy="80" rx="9" ry="10.5" fill="${L.eye}" ${sw(2.5)}/><ellipse cx="${x}" cy="81" rx="3.4" ry="7" fill="#14213d"/><circle cx="${x+3}" cy="75.5" r="2.6" fill="#fff"/>`;
  switch(face){
    case 'happy':return`<path d="M71 83 Q80 72 89 83 M111 83 Q120 72 129 83" fill="none" ${sw(3.2)}/>`;
    case 'sleepy':return`<path d="M71 80 Q80 87 89 80 M111 80 Q120 87 129 80" fill="none" ${sw(3)}/>`;
    case 'wink':return open(80)+`<path d="M111 83 Q120 72 129 83" fill="none" ${sw(3.2)}/>`;
    case 'surprised':return`<circle cx="80" cy="80" r="11" fill="${L.eye}" ${sw(2.5)}/><circle cx="80" cy="81" r="5" fill="#14213d"/><circle cx="83.5" cy="76" r="2.8" fill="#fff"/><circle cx="120" cy="80" r="11" fill="${L.eye}" ${sw(2.5)}/><circle cx="120" cy="81" r="5" fill="#14213d"/><circle cx="123.5" cy="76" r="2.8" fill="#fff"/>`;
    case 'grumpy':{const lid=(x,d)=>`<path d="M${x-11} ${76+d} L${x+11} ${76-d} L${x+11} 66 L${x-11} 66 Z" fill="var(--lid)"/><path d="M${x-10.5} ${76+d} L${x+10.5} ${76-d}" ${sw(2.8)}/>`;
      return open(80)+open(120)+`<g style="--lid:${W}">${lid(80,-1.5)}${lid(120,1.5)}</g>`}
    default:return open(80)+open(120)}}
function mouth(face){
  if(face=='grumpy')return`<path d="M92 104 Q100 100.5 108 104" fill="none" ${sw(2.6)}/>`;
  if(face=='surprised')return`<ellipse cx="100" cy="105" rx="4" ry="5" fill="#9b4a5a" ${sw(2.2)}/>`;
  if(face=='happy'||face=='wink')return`<path d="M100 98 Q95 107 88 103 M100 98 Q105 107 112 103" fill="none" ${sw(2.6)}/><path d="M95 104 Q100 112 105 104 Z" fill="#e88a9c"/>`;
  return`<path d="M100 98 Q95 105 89 102 M100 98 Q105 105 111 102" fill="none" ${sw(2.6)}/>`}
function head(who,face){const L=LOOK[who];
  const ears=`<path d="M58 66 L56 18 L92 44 Z" fill="${L.ear}" ${sw()}/><path d="M142 66 L144 18 L108 44 Z" fill="${L.ear}" ${sw()}/><path d="M63 56 L62 30 L83 46 Z" fill="${L.inner}"/><path d="M137 56 L138 30 L117 46 Z" fill="${L.inner}"/>`;
  const skull=`<ellipse cx="100" cy="78" rx="52" ry="45" fill="${W}" ${sw()}/>`;
  /* Bailey: brown patch over the left half of the face and forehead, muzzle stays white */
  const mask=L.mask?`<path d="M100 35 C72 34 50 50 49.5 76 C49 92 54 102 60 108 C70 104 80 100 88 98 C94 92 97 84 99 74 C100 60 101 46 100 35 Z" fill="${L.mask}"/><path d="M100 35 C72 34 50 50 49.5 76 C49 92 54 102 60 108" fill="none" ${sw()}/>`
    :`<ellipse cx="100" cy="52" rx="24" ry="11" fill="#f6dcc2" opacity=".75"/><ellipse cx="73" cy="70" rx="12" ry="6" fill="#f6dcc2" opacity=".55"/><ellipse cx="127" cy="70" rx="12" ry="6" fill="#f6dcc2" opacity=".55"/>`;
  const cheeks=face=='happy'||face=='wink'||face=='surprised'?`<ellipse cx="66" cy="99" rx="8" ry="5" fill="${BLUSH}" opacity=".7"/><ellipse cx="134" cy="99" rx="8" ry="5" fill="${BLUSH}" opacity=".7"/>`:'';
  const whisk=`<g stroke="#cfc6bd" stroke-width="2" stroke-linecap="round"><path d="M74 100 L44 95 M74 105 L46 108 M126 100 L156 95 M126 105 L154 108"/></g>`;
  return ears+skull+mask+cheeks+eyes(L,face)+`<path d="M95 93 L105 93 L100 99 Z" fill="${NOSE}" ${sw(2)}/>`+mouth(face)+whisk}

/* ---------- bodies ---------- */
function tailSit(L){const c=`M138 186 C176 184 186 150 168 124`;
  return`<path d="${c}" fill="none" stroke="${INK}" stroke-width="27" stroke-linecap="round"/><path d="${c}" fill="none" stroke="${L.tail}" stroke-width="21" stroke-linecap="round"/>`+
    (L.tip?`<path d="M174 140 C176 134 173 128 168 124" fill="none" stroke="${L.tip}" stroke-width="21" stroke-linecap="round"/>`:`<path d="M150 182 C172 176 178 156 170 136" fill="none" stroke="${L.tailHi}" stroke-width="6" stroke-linecap="round" opacity=".7"/>`)}
function bodySit(L){return`<path d="M66 116 C46 138 44 180 60 193 L140 193 C156 180 154 138 134 116 Z" fill="${W}" ${sw()}/>`+
  `<ellipse cx="64" cy="166" rx="8" ry="20" fill="${L.back}" opacity=".85"/><ellipse cx="136" cy="166" rx="8" ry="20" fill="${L.back}" opacity=".85"/>`+
  `<path d="M78 122 q6 12 0 22 q10 2 12 12 q6 -9 10 -1 q4 -8 10 1 q2 -10 12 -12 q-6 -10 0 -22" fill="none" stroke="${SHADE}" stroke-width="3" stroke-linecap="round"/>`+
  `<ellipse cx="84" cy="190" rx="14" ry="8.5" fill="${W}" ${sw()}/><ellipse cx="116" cy="190" rx="14" ry="8.5" fill="${W}" ${sw()}/>`}
/* lying "bread loaf" with paws tucked in, head on the left */
function bodyLoaf(L){const t=`M178 176 C200 178 204 196 170 197 L86 197`;
  return`<path d="${t}" fill="none" stroke="${INK}" stroke-width="23" stroke-linecap="round"/><path d="${t}" fill="none" stroke="${L.tail}" stroke-width="17" stroke-linecap="round"/>`+(L.tip?`<path d="M110 197 L86 197" fill="none" stroke="${L.tip}" stroke-width="17" stroke-linecap="round"/>`:'')+
    `<path d="M58 196 C40 196 40 140 92 128 C130 118 186 128 190 162 C192 186 176 196 160 196 Z" fill="${W}" ${sw()}/>`+
    `<path d="M110 132 C140 126 176 136 184 158" fill="none" stroke="${L.back}" stroke-width="12" stroke-linecap="round"/>`+
    `<ellipse cx="74" cy="194" rx="15" ry="7" fill="${W}" ${sw()}/><ellipse cx="104" cy="195" rx="15" ry="7" fill="${W}" ${sw()}/>`}
/* seen from behind, looking out of a window; the tail hangs over the edge */
function backView(who){const L=LOOK[who],t=`M120 186 C134 200 132 226 140 244`;
  return`<path d="${t}" fill="none" stroke="${INK}" stroke-width="27" stroke-linecap="round"/><path d="${t}" fill="none" stroke="${L.tail}" stroke-width="21" stroke-linecap="round"/>`+(L.tip?`<path d="M136 230 C138 236 139 240 140 244" fill="none" stroke="${L.tip}" stroke-width="21" stroke-linecap="round"/>`:'')+
    `<path d="M64 118 C42 140 42 182 58 193 L142 193 C158 182 158 140 136 118 Z" fill="${W}" ${sw()}/><path d="M76 126 C70 150 74 176 84 190 L116 190 C126 176 130 150 124 126 Z" fill="${L.back}" opacity=".9"/>`+
    `<path d="M58 66 L56 18 L92 44 Z" fill="${L.ear}" ${sw()}/><path d="M142 66 L144 18 L108 44 Z" fill="${L.ear}" ${sw()}/><ellipse cx="100" cy="78" rx="52" ry="45" fill="${W}" ${sw()}/>`+
    (L.mask?`<path d="M58 46 C70 36 86 33 100 34 C96 50 84 58 66 62 C60 58 57 52 58 46 Z" fill="${L.mask}"/>`:`<ellipse cx="100" cy="50" rx="26" ry="11" fill="#f6dcc2" opacity=".7"/>`)}
/* asleep: lying, eyes closed, a pink blanket over the back */
function sleeping(who){const L=LOOK[who];
  return bodyLoaf(L)+`<path d="M96 140 C120 116 170 118 194 146 C200 160 198 182 192 198 L104 198 C96 180 92 158 96 140 Z" fill="#fbcfe8" ${sw()}/><path d="M104 160 C130 142 170 142 192 160 M106 180 C134 164 170 164 194 180" fill="none" stroke="#f9a8d4" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>`+
    `<g transform="translate(-26 34)">${head(who,'sleepy')}</g>`+
    `<text x="96" y="40" font-family="Nunito,sans-serif" font-weight="900" font-size="24" fill="#a5b4fc">z</text><text x="116" y="20" font-family="Nunito,sans-serif" font-weight="900" font-size="17" fill="#c7d2fe">z</text>`}

/* ---------- accessories (drawn in the same 200×200 box) ---------- */
const ACC={
  hat:`<g transform="rotate(-14 100 30)"><path d="M82 34 L100 -8 L118 34 Z" fill="#fbcfe8" ${sw()}/><circle cx="94" cy="20" r="3" fill="#fde68a"/><circle cx="104" cy="10" r="2.6" fill="#a7f3d0"/><circle cx="106" cy="26" r="3" fill="#c7d2fe"/><circle cx="100" cy="-9" r="5" fill="#fde68a" ${sw(2.2)}/></g>`,
  bell:`<g><line x1="150" y1="176" x2="150" y2="168" ${sw(2)}/><circle cx="156" cy="186" r="13" fill="#f9a8d4" ${sw()}/><path d="M146 182 Q156 178 166 182" fill="none" stroke="#fbcfe8" stroke-width="2.5"/><circle cx="150" cy="166" r="6" fill="#fcd34d" ${sw(2.2)}/><line x1="147" y1="168" x2="153" y2="168" stroke="${INK}" stroke-width="1.6"/></g>`,
  coin:`<g><circle cx="152" cy="176" r="16" fill="#fcd34d" ${sw()}/><circle cx="152" cy="176" r="11" fill="none" stroke="#f59e0b" stroke-width="2"/><text x="152" y="182" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="15" fill="#b45309">zł</text></g>`,
  churu:`<g transform="rotate(18 46 170)"><rect x="36" y="138" width="20" height="58" rx="6" fill="#fde68a" ${sw()}/><rect x="36" y="138" width="20" height="14" rx="6" fill="#f9a8d4"/><text x="46" y="176" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="9" fill="#b45309">churu</text></g>`,
  heather:(()=>{let back='',front='';const tuft=(x,y,ang,col,len=58)=>{let t=`<path d="M${x} ${y} l${Math.sin(ang)*len} ${-Math.cos(ang)*len}" stroke="#7fb58d" stroke-width="3" stroke-linecap="round"/>`;
      for(let k=1;k<=Math.round(len/6.5);k++){const d=k*6.2;t+=`<ellipse cx="${x+Math.sin(ang)*d+(k%2?3:-3)}" cy="${y-Math.cos(ang)*d}" rx="3.2" ry="4.2" fill="${col}"/>`}return t};
    [[-.9,'#f9a8d4',26],[-.6,'#e9d5ff',34],[-.35,'#f472b6',44],[.35,'#fbcfe8',160],[.6,'#d8b4fe',170],[.9,'#f9a8d4',178]].forEach(([a,c,x])=>{back+=tuft(x,182,a,c,70)});
    [[-.5,'#fbcfe8',40],[-.15,'#f9a8d4',62],[.1,'#e9d5ff',128],[.4,'#f472b6',150],[.75,'#d8b4fe',168],[-.75,'#f9a8d4',30]].forEach(([a,c,x])=>{front+=tuft(x,184,a,c,30)});
    return`<g>${back}</g>`+`<g>${front}</g><path d="M16 180 H190 L180 212 H26 Z" fill="#ffffff" ${sw()}/><path d="M36 188 V206 M66 188 V206 M96 188 V206 M126 188 V206 M156 188 V206" stroke="#e2e8f0" stroke-width="3"/>`})(),
  papers:`<g><rect x="36" y="186" width="150" height="16" rx="3" fill="#fff" ${sw()}/><rect x="30" y="196" width="160" height="14" rx="3" fill="#f8fafc" ${sw()}/><path d="M48 192 H120 M48 203 H150" stroke="#cbd5e1" stroke-width="2"/></g>`,
};

/* one cat in its 200×200 box, placed at x / y with scale s; acc = accessory names (drawn in front) */
export function cat(who,{pose='sit',face=who=='ivo'?'grumpy':'calm',x=0,y=0,s=1,flip=false,acc=[]}={}){const L=LOOK[who];
  let g=pose=='back'?backView(who):pose=='sleep'?sleeping(who):pose=='loaf'?bodyLoaf(L)+`<g transform="translate(-26 34)">${head(who,face)}</g>`:tailSit(L)+bodySit(L)+head(who,face);
  g+=acc.map(a=>ACC[a]||'').join('');
  return`<g transform="translate(${x} ${y}) scale(${s})${flip?' translate(200 0) scale(-1 1)':''}">${g}</g>`}

/* golden "1" balloon on a string */
const balloon=(x,y,n='1')=>`<g transform="translate(${x} ${y})"><path d="M30 120 C24 140 36 156 28 178" fill="none" stroke="#b45309" stroke-width="2"/><text x="30" y="118" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="120" fill="#fcd34d" stroke="#d97706" stroke-width="4" paint-order="stroke">${n}</text></g>`;
const box=(x,y,w=300)=>`<g transform="translate(${x} ${y})"><path d="M0 40 L${w} 40 L${w-12} 140 L12 140 Z" fill="#e8c9a0" ${sw()}/><path d="M0 40 L-26 6 L${w*0.45} 6 L${w*0.5} 40 M${w} 40 L${w+26} 6 L${w*0.55} 6 L${w*0.5} 40" fill="#f3dcbc" ${sw()}/><path d="M${w*0.36} 70 h${w*0.28}" stroke="#c89f6e" stroke-width="5" stroke-linecap="round"/></g>`;
const sill=(y,w)=>`<rect x="0" y="${y}" width="${w}" height="16" rx="6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="3"/>`;
const windowFrame=w=>`<rect x="20" y="0" width="${w-40}" height="196" rx="10" fill="#e0f2fe" stroke="#cbd5e1" stroke-width="5"/><path d="M${w/2} 0 V196" stroke="#cbd5e1" stroke-width="5"/><ellipse cx="${w*0.3}" cy="60" rx="46" ry="16" fill="#fff" opacity=".9"/><ellipse cx="${w*0.72}" cy="44" rx="36" ry="12" fill="#fff" opacity=".9"/><path d="M20 160 C80 140 140 150 ${w/2} 140 C${w*0.7} 132 ${w*0.85} 146 ${w-20} 140 V196 H20 Z" fill="#bbf7d0"/>`;

/* ready-made scenes used in the app (viewBox sized to the scene) */
const SCENES={
  duo:{vb:'0 0 400 210',draw:()=>cat('bailey',{x:10,y:6})+cat('ivo',{x:200,y:16,s:.95,face:'grumpy'})},
  happy:{vb:'0 0 400 210',draw:()=>cat('bailey',{x:10,y:6,face:'happy'})+cat('ivo',{x:200,y:16,s:.95,face:'happy'})},
  window:{vb:'0 0 400 260',draw:()=>windowFrame(400)+sill(196,400)+cat('bailey',{pose:'back',x:40,y:4,s:.96})+cat('ivo',{pose:'back',x:200,y:12,s:.9})},
  birthday:{vb:'0 0 300 230',draw:()=>balloon(4,0)+cat('bailey',{x:80,y:24,face:'happy',acc:['hat']})},
  heather:{vb:'0 0 230 230',draw:()=>cat('ivo',{pose:'loaf',x:14,y:-6,face:'grumpy'})+`<g transform="translate(8 14)">${ACC.heather}</g>`},
  sleep:{vb:'0 0 230 220',draw:()=>cat('bailey',{pose:'sleep',x:14,y:10})},
  bell:{vb:'0 0 230 210',draw:()=>cat('ivo',{x:4,y:4,face:'surprised',acc:['bell']})},
  papers:{vb:'0 0 230 230',draw:()=>cat('ivo',{pose:'loaf',x:16,y:6,face:'grumpy',acc:['papers']})},
  box:{vb:'0 0 400 250',draw:()=>cat('bailey',{x:40,y:0,face:'calm'})+cat('ivo',{x:196,y:10,s:.92,face:'wink'})+box(48,104)},
  churu:{vb:'0 0 230 210',draw:()=>cat('bailey',{x:4,y:4,face:'happy',acc:['churu']})},
  coin:{vb:'0 0 230 210',draw:()=>cat('ivo',{x:4,y:4,face:'happy',acc:['coin']})},
};
export const SCENE_NAMES=Object.keys(SCENES);
export function scene(name,cls='kot'){const sc=SCENES[name]||SCENES.duo;return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${sc.vb}" class="${cls}" role="img" aria-label="Bailey i Ivo">${sc.draw()}</svg>`}
