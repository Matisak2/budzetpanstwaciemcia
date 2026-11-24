/* 🤖 Robot: czy wersja demo zapisuje dane tak samo, jak prawdziwy Firebase (audyt 23.11, błąd „Wczytaj kopię”: atrapa wybaczała to, czego SDK nie wybacza).
   Te same zapisy idą do prawdziwego pakietu firebase@10.14.1 (w Node, bez sieci – disableNetwork, nic nie wychodzi do Google) i do atrapy demo/fb-firestore.js.
   Dla każdego przypadku: oba przyjmują albo oba odrzucają zapis, a dokument po zapisie jest taki sam.
   Robot instaluje pakiet (test.yml); lokalnie: npm install --no-save firebase@10.14.1 (w katalogu repozytorium, node_modules jest w .gitignore). */
let fb,fs_;
try{fb=await import('firebase/app');fs_=await import('firebase/firestore')}
catch(e){console.log('❌ Brak pakietu firebase@10.14.1 – npm install --no-save firebase@10.14.1');process.exit(1)}
const {initializeFirestore,memoryLocalCache,disableNetwork,getDocFromCache}=fs_;
const app=fb.initializeApp({projectId:'demo-robot',apiKey:'robot',appId:'robot'});
const db=initializeFirestore(app,{localCache:memoryLocalCache()});
await disableNetwork(db);

/* the demo stand-in reads window.MW_DEMO */
globalThis.window={MW_DEMO:{store:{},ready:Promise.resolve(),save(){}}};
const D=window.MW_DEMO;
const A=await import('../demo/fb-firestore.js');
const flush=()=>new Promise(r=>setTimeout(r,5));

/* both libraries get the same calls; o = the library's own functions */
const lib=(o,ref)=>({set:(b,opt)=>opt?o.setDoc(ref,b,opt):o.setDoc(ref,b),upd:b=>o.updateDoc(ref,b),del:()=>o.deleteField(),inc:n=>o.increment(n)});
const START={a:1,m:{x:1,y:2,z:{q:1}},arr:[1,2],tx:{t1:{amount:100,note:'a'},t2:{amount:200}},n:5};
const CASES=[
  ['merge – zagnieżdżona mapa (putTx)',L=>L.set({tx:{t3:{amount:300,type:'exp'}}},{merge:true})],
  ['merge – zmiana pola wpisu',L=>L.set({tx:{t1:{deleted:true,dAt:1}}},{merge:true})],
  ['merge – deleteField w mapie',L=>L.set({m:{y:L.del()},b:2},{merge:true})],
  ['merge – deleteField na górze',L=>L.set({a:L.del()},{merge:true})],
  ['merge – increment (licznik zdjęć, użycia)',L=>L.set({n:L.inc(2),c:{d:L.inc(3)}},{merge:true})],
  ['merge – tablica zastępuje tablicę',L=>L.set({arr:[3]},{merge:true})],
  ['set bez merge zastępuje dokument',L=>L.set({b:1,m:{k:2}})],
  ['mergeFields – zastępuje tylko pola z listy',L=>L.set({a:9,m:{k:1},zz:5},{mergeFields:['a','m']})],
  ['mergeFields – deleteField pola z listy',L=>L.set({a:L.del(),m:{k:1}},{mergeFields:['a','m']})],
  ['mergeFields – brak pola z listy (błąd SDK)',L=>L.set({a:1},{mergeFields:['a','accs']})],
  ['undefined w polu',L=>L.set({a:undefined},{merge:true})],
  ['undefined w tablicy',L=>L.set({arr:[1,undefined]},{merge:true})],
  ['tablica w tablicy',L=>L.set({arr:[[1]]},{merge:true})],
  ['funkcja w polu',L=>L.set({a:()=>1},{merge:true})],
  ['pusta nazwa pola',L=>L.set({'':1},{merge:true})],
  ['nazwa pola __x__',L=>L.set({__x__:1},{merge:true})],
  ['deleteField w set bez merge',L=>L.set({a:L.del()})],
  ['deleteField w tablicy',L=>L.set({arr:[L.del()]},{merge:true})],
  ['updateDoc – ścieżka z kropką',L=>L.upd({'m.z.q':7,'tx.t9':{amount:1}})],
  ['updateDoc – deleteField (usuwanie pozycji)',L=>L.upd({'tx.t1':L.del(),'m.x':L.del()})],
  ['updateDoc – mapa zastępuje mapę',L=>L.upd({m:{w:1}})],
  ['updateDoc – increment',L=>L.upd({n:L.inc(-1)})],
  ['updateDoc – zła ścieżka',L=>L.upd({'m..x':1})],
  ['updateDoc – undefined',L=>L.upd({a:undefined})],
  ['updateDoc – deleteField w środku mapy',L=>L.upd({m:{x:L.del()}})],
];
const norm=x=>JSON.parse(JSON.stringify(x??null,(k,v)=>v&&typeof v=='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a<b?-1:1)):v));
let bad=0,n=0;
for(const[i,[name,op]]of CASES.entries()){n++;
  const path=`c/${i}`;
  /* real SDK */
  const ref=fs_.doc(db,path);fs_.setDoc(ref,structuredClone(START)).catch(()=>{});
  let eS=null,eA=null;
  try{const p=op(lib(fs_,ref));p&&p.catch&&p.catch(()=>{})}catch(e){eS=e.code||e.message}
  await flush();const snap=await getDocFromCache(ref).catch(()=>null);const docS=snap&&snap.exists()?snap.data():null;
  /* demo stand-in */
  D.store[path]=structuredClone(START);const aref=A.doc({p:''},path);
  try{const p=op(lib(A,aref));if(p&&p.catch)await p.catch(e=>{eA=e.code||e.message||'async'})}catch(e){eA=e.code||e.message||'błąd'}
  await flush();const docA=D.store[path]??null;
  const okErr=!!eS==!!eA,okDoc=JSON.stringify(norm(docS))==JSON.stringify(norm(docA));
  if(okErr&&okDoc)continue;bad++;
  console.log(`❌ ${name}: SDK ${eS?'odrzuca ('+eS+')':'przyjmuje'}, demo ${eA?'odrzuca ('+eA+')':'przyjmuje'}`+(okDoc?'':`\n   SDK:  ${JSON.stringify(norm(docS))}\n   demo: ${JSON.stringify(norm(docA))}`))}

/* writeBatch (an entry moved to another month): both documents written; one bad write = nothing written, in both */
for(const wrong of [false,true,'mf']){n++;const m=`b/${wrong=='mf'?'mf':wrong?'bad':'ok'}`;let eS=null,eA=null;
  /* 'mf' (audyt 2): the second write lists a field in mergeFields that the body does not have – the SDK refuses the whole batch */
  const run=async(o,ref1,ref2)=>{const b=o.writeBatch(o===A?undefined:db);b.set(ref1,{tx:{x:{amount:1,deleted:false}}},{merge:true});if(wrong=='mf')b.set(ref2,{a:1},{mergeFields:['a','zz']});else b.set(ref2,{tx:{x:{deleted:true,moved:true,...(wrong?{u:undefined}:{})}}},{merge:true});return b.commit()};
  run(fs_,fs_.doc(db,m+'1'),fs_.doc(db,m+'2')).catch(e=>{eS=e.code||'błąd'});await flush(); // offline the SDK's commit never resolves – only a rejection comes
  const s1=await getDocFromCache(fs_.doc(db,m+'1')).catch(()=>null),s2=await getDocFromCache(fs_.doc(db,m+'2')).catch(()=>null);
  try{await run(A,A.doc({p:''},m+'1'),A.doc({p:''},m+'2'))}catch(e){eA=e.code||'błąd'}await flush();
  const gotS=[!!(s1&&s1.exists()),!!(s2&&s2.exists())],gotA=[!!D.store[m+'1'],!!D.store[m+'2']];
  if(!!eS!=!!eA||String(gotS)!=String(gotA)){bad++;console.log(`❌ writeBatch${wrong?' ze złym zapisem':''}: SDK ${eS||'przyjmuje'} ${gotS}, demo ${eA||'przyjmuje'} ${gotA}`)}}

/* updateDoc on a missing document: SDK keeps nothing locally (the server answers not-found) – demo must not create it either */
n++;{const ref=fs_.doc(db,'brak/x');let eA=null;fs_.updateDoc(ref,{a:1}).catch(()=>{});await flush();
  const s=await getDocFromCache(ref).catch(()=>null);const aref=A.doc({p:''},'brak/x');await A.updateDoc(aref,{a:1}).catch(e=>{eA=e.code||'błąd'});
  if((s&&s.exists())||D.store['brak/x']||!eA){bad++;console.log(`❌ updateDoc na nieistniejącym dokumencie: SDK ${s&&s.exists()?'tworzy':'nie tworzy'}, demo ${D.store['brak/x']?'tworzy':'nie tworzy'}${eA?'':' i nie zgłasza błędu'}`)}}

console.log(bad?`❌ Atrapa Firestore różni się od SDK: ${bad} z ${n}`:`✅ Atrapa Firestore = SDK 10.14.1 (${n} przypadków)`);
process.exit(bad?1:0);
