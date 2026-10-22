// 🔔 Notifications for Budżet M&W (GitHub Actions, several times a day; sends at most one morning and one evening message per day).
// Morning ~7:30: „Na dziś” (only if something waits; the tidiness guard on Mondays). Evening ~20:00: only when nothing was entered today.
// Shared matters go to both phones, personal ones (payslip, IKZE, JDG…) only to their owner. Logs contain only counts.
import webpush from 'web-push';
import {db,ensureVapid,household,warsaw} from './common.mjs';
import {todayItems} from '../js/today.js';
const H=db().doc('households/main'),{today,hour,weekday}=warsaw(),mode=process.env.MODE||'auto';
const keys=await ensureVapid(H);
webpush.setVapidDetails('https://matisak2.github.io/budzetpanstwaciemcia/',keys.pub,keys.priv);
const subs=(await H.collection('push').get()).docs.filter(d=>d.data().on!==false&&d.data().sub?.endpoint);
if(!subs.length){console.log('– brak telefonów z włączonymi powiadomieniami');process.exit(0)}
const logRef=H.collection('market').doc('pushlog'),log=(await logRef.get()).data()||{};
const slot=mode=='test'?'test':hour>=7&&hour<11?'m':hour>=20&&hour<23?'e':null;
if(!slot){console.log('– to nie pora na powiadomienia');process.exit(0)}
if(slot!='test'&&log[slot]==today){console.log('– dziś już wysłane');process.exit(0)}
const D=await household(H);
const msgFor=who=>{
  if(slot=='test')return{title:'🔔 Próba powiadomień',body:'Działa! Bailey i Ivo będą przypominać rano i wieczorem. 🐾',url:'./#go=today',tag:'test'};
  if(slot=='e'){const any=D.tx.some(t=>t.date==today&&!t.fixedId&&!t.ppk&&!t.roundOf&&!(t.type=='adj'&&t.val));
    return any?null:{title:'✍️ Wpiszcie dzisiejsze wydatki',body:'Dziś nic jeszcze nie ma w budżecie. Wystarczy minuta 🐾',url:'./#go=add',tag:'evening'}}
  const L=todayItems(D,{today,hour:8,checks:weekday=='Mon'}).filter(x=>x.go?.a!='add'&&(!x.who||x.who==who));if(!L.length)return null;
  const bad=L.filter(x=>x.k=='bad'),first=[...bad,...L.filter(x=>x.k!='bad')].slice(0,3);
  return{title:`🔔 Na dziś${L.length>1?` (${L.length})`:''}${bad.length?' – coś po terminie':''}`,body:first.map(x=>x.icon+' '+x.text).join('\n')+(L.length>3?`\n+${L.length-3} więcej`:''),url:'./#go=today',tag:'today'}};
let sent=0,gone=0;
for(const d of subs){const s=d.data(),msg=msgFor(s.who);if(!msg)continue;
  try{await webpush.sendNotification(s.sub,JSON.stringify(msg),{TTL:6*3600,urgency:'normal'});sent++}
  catch(e){if(e.statusCode==404||e.statusCode==410){await d.ref.delete();gone++}else console.log('– nie udało się wysłać ('+(e.statusCode||e.message)+')')}}
if(slot!='test')await logRef.set({[slot]:today},{merge:true});
console.log(`✓ wysłane: ${sent} z ${subs.length}${gone?` · usunięte nieaktywne: ${gone}`:''}`);process.exit(0);
