// Shared by the automat scripts: Firebase admin, the Warsaw clock, VAPID keys, reading the household like the app does.
import {initializeApp,cert} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {createECDH} from 'node:crypto';
export function db(){const sa=(()=>{try{return JSON.parse(process.env.FIREBASE_SA||'')}catch{return null}})();
  if(!sa?.project_id){console.error('Brak sekretu FIREBASE_SA (klucz konta usługi Firebase).');process.exit(1)}
  initializeApp({credential:cert(sa)});return getFirestore()}
/* date and hour in Poland (GitHub runs in UTC) */
export function warsaw(d=new Date()){const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Warsaw',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hour12:false,weekday:'short'}).formatToParts(d).map(x=>[x.type,x.value]));
  return{today:`${p.year}-${p.month}-${p.day}`,hour:+p.hour%24,weekday:p.weekday}}
/* keys for Web Push (P-256), made once and kept in Firestore: the public one for the app, the private one only for the automat */
export async function ensureVapid(H){const sec=H.collection('secret').doc('vapid'),cur=(await sec.get()).data();if(cur?.pub&&cur?.priv){await H.collection('market').doc('vapid').set({pub:cur.pub},{merge:true});return cur}
  const e=createECDH('prime256v1');e.generateKeys();let priv=e.getPrivateKey();if(priv.length<32)priv=Buffer.concat([Buffer.alloc(32-priv.length),priv]);
  const k={pub:e.getPublicKey().toString('base64url'),priv:priv.toString('base64url'),ts:Date.now()};await sec.set(k);await H.collection('market').doc('vapid').set({pub:k.pub});console.log('✓ utworzono klucze powiadomień');return k}
const toArr=m=>Object.entries(m||{}).map(([id,v])=>({...v,id})).sort((a,b)=>(a.o??0)-(b.o??0)||String(a.id).localeCompare(String(b.id)));
const strip=({o,...x})=>x;
/* the same shape as fromDoc() in app.js */
export function cfgOf(d){return{accs:toArr(d.accsM).map(strip),cats:toArr(d.catsM).map(({o,subsM,...c})=>({...c,subs:toArr(subsM).map(strip)})),fixed:toArr(d.fixedM).map(strip),
  round:toArr(d.roundM).map(strip),incs:toArr(d.incM).map(strip),years:toArr(d.yearM).map(strip),projs:toArr(d.projM).map(strip),rems:toArr(d.remM).map(strip)}}
export async function household(H){const col=async n=>Object.fromEntries((await H.collection(n).get()).docs.map(d=>[d.id,d.data()]));
  const [main,months,slips,hold,debts,market,meta,plans,goals,inv,users]=await Promise.all([H.get(),col('months'),col('slips'),col('hold'),col('debts'),col('market'),col('meta'),col('plans'),col('goals'),col('inv'),col('users')]);
  const hraw=main.data()||{},tx=[],txAll=[];for(const m of Object.values(months))for(const[id,t]of Object.entries(m.tx||{})){txAll.push({id,...t});if(!t.deleted&&/^\d{4}-\d\d-\d\d$/.test(t.date||''))tx.push({id,...t})}
  const sl={};for(const[k,v]of Object.entries(slips))sl[k]=v.s||{};
  return{hraw,cfg:cfgOf(hraw),tx,txAll,slips:sl,hold,debts,market,backup:meta.backup||null,plans,goals,inv,users}}
