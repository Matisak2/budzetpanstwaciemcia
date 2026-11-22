// 🔐 Zasady Firestore z automatu (ręcznie: .github/workflows/rules.yml). Bierze OBECNE zasady z Firebase (z Waszymi dwoma adresami e-mail –
// nigdy nie trafiają do repozytorium ani do dziennika), wstawia je do kopii firebase/firestore.rules i najpierw SPRAWDZA na próbach
// (oboje: odczyt i zapis danych – dozwolone; secret/, obcy adres, brak logowania – zabronione). Tryby: sprawdz (nic nie zmienia),
// publikuj (tylko gdy wszystkie próby przeszły; poprzednie zasady zapisane do cofnięcia), cofnij (wraca do poprzednich). Dziennik – tylko liczby i wyniki.
import {readFileSync} from 'node:fs';
import {initializeApp,cert} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
const sa=(()=>{try{return JSON.parse(process.env.FIREBASE_SA||'')}catch{return null}})();
if(!sa?.project_id){console.error('Brak sekretu FIREBASE_SA.');process.exit(1)}
const mode=process.env.MODE||'sprawdz',pid=sa.project_id,API='https://firebaserules.googleapis.com/v1/',REL=`projects/${pid}/releases/cloud.firestore`;
const cred=cert(sa);initializeApp({credential:cred});const M=getFirestore().doc('households/main').collection('market').doc('rules');
const tok=(await cred.getAccessToken()).access_token;
const call=async(path,method='GET',body)=>{const r=await fetch(API+path,{method,headers:{Authorization:'Bearer '+tok,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});
  const j=await r.json().catch(()=>({}));if(!r.ok){console.error(`❌ Firebase odpowiedział ${r.status} (${j?.error?.status||'błąd'}) przy ${method} ${path.split('/').slice(-2).join('/')}`);
    if(r.status==403)console.error('   Konto usługi nie ma uprawnień do zasad (rola „Firebase Rules Admin”) – zasady trzeba wkleić ręcznie w konsoli.');process.exit(1)}return j};

const rel=await call(REL);
if(mode=='cofnij'){const prev=(await M.get()).data()?.prev;if(!prev){console.error('❌ Nie ma zapisanych poprzednich zasad.');process.exit(1)}
  await call(REL,'PATCH',{release:{name:REL,rulesetName:prev}});await M.set({prev:rel.rulesetName,now:prev,at:Date.now(),mode:'cofnij'},{merge:true});console.log('✅ Przywrócono poprzednie zasady.');process.exit(0)}

const cur=await call(rel.rulesetName),src=(cur.source?.files||[]).map(f=>f.content).join('\n');
const list=(src.match(/request\.auth\.token\.email\s+in\s+\[([^\]]+)\]/)||[])[1]||'',emails=[...list.matchAll(/'([^']+@[^']+)'|"([^"]+@[^"]+)"/g)].map(m=>m[1]||m[2]);
console.log(`Obecne zasady: ${emails.length} adresy na liście właścicieli.`);
if(emails.length!=2){console.error('❌ Nie umiem bezpiecznie odczytać dwóch adresów z obecnych zasad – nic nie zmieniam (zrób to w konsoli).');process.exit(1)}
if(/coll\s*!=\s*'secret'/.test(src)){console.log('✅ Zasady już mają ochronę secret/ – nic do zrobienia.');process.exit(0)}
const tpl=readFileSync(new URL('../firebase/firestore.rules',import.meta.url),'utf8');
if(!tpl.includes("['ADRES_MATIEGO', 'ADRES_WERCI']")){console.error('❌ Kopia zasad w repozytorium ma nieoczekiwany format – nic nie zmieniam.');process.exit(1)}
const next=tpl.replace("['ADRES_MATIEGO', 'ADRES_WERCI']",'['+emails.map(e=>`'${e}'`).join(', ')+']');
const source={files:[{name:'firestore.rules',content:next}]};

/* 🧪 the tests – the new rules must let both of you in everywhere you work, and keep out everything else */
const D='/databases/(default)/documents/households/main',as=e=>e?{uid:'u_'+e.length,token:{email:e,email_verified:true}}:null;
const T=[];for(const e of emails){for(const p of ['','/months/2026-11','/plans/2026-11','/hold/h1','/market/rates','/users/u1','/push/p1','/usage/2026-11'])for(const m of ['get','update'])T.push({x:'ALLOW',e,p,m})
  T.push({x:'DENY',e,p:'/secret/vapid',m:'get'},{x:'DENY',e,p:'/secret/vapid',m:'update'})}
T.push({x:'DENY',e:'ktos.obcy@example.com',p:'/months/2026-11',m:'get'},{x:'DENY',e:null,p:'',m:'get'},{x:'DENY',e:null,p:'/months/2026-11',m:'update'});
const res=await call(`projects/${pid}:test`,'POST',{source,testSuite:{testCases:T.map(t=>({expectation:t.x,request:{...(t.e?{auth:as(t.e)}:{}),method:t.m,path:D+t.p}}))}});
if(res.issues?.length){console.error(`❌ Nowe zasady mają ${res.issues.length} błąd(ów) składni – nic nie zmieniam.`);process.exit(1)}
const R=res.testResults||[],ok=R.filter(r=>r.state=='SUCCESS').length;
R.forEach((r,i)=>{if(r.state!='SUCCESS'){const t=T[i];console.log(`  ✗ próba ${i+1}: ${t.x=='ALLOW'?'powinno być dozwolone':'powinno być zabronione'} – ${t.m} ${t.p||'(dokument główny)'} ${t.e?(emails.includes(t.e)?'(właściciel '+(emails.indexOf(t.e)+1)+')':'(obcy adres)'):'(bez logowania)'}`)}});
console.log(`Próby: ${ok} z ${T.length} zgodne.`);
if(ok!=T.length||R.length!=T.length){console.error('❌ Nie wszystkie próby przeszły – nic nie zmieniam.');process.exit(1)}
if(mode!='publikuj'){console.log('✅ Wszystko się zgadza. Tryb „sprawdz” – zasady NIE zostały zmienione. Uruchom tryb „publikuj”.');process.exit(0)}
const made=await call(`projects/${pid}/rulesets`,'POST',{source});
await M.set({prev:rel.rulesetName,now:made.name,at:Date.now(),mode:'publikuj'},{merge:true});
await call(REL,'PATCH',{release:{name:REL,rulesetName:made.name}});
console.log('✅ Nowe zasady opublikowane (poprzednie zapisane – tryb „cofnij” je przywraca).');
