// 📧 E-mails of Budżet M&W (GitHub Actions): the backup on the first Sunday of a month (~21:00, only to Mati)
// and the summary of the previous month on the 1st (~9:00, to both); on 1 January also the summary of the whole previous year. Sender: Mati's Gmail with an app password (secrets GMAIL_USER, GMAIL_APP_PASSWORD).
// Recipients are the e-mails people log in with (households/main/users). Logs contain only counts.
import nodemailer from 'nodemailer';
import {gzipSync} from 'node:zlib';
import {writeFileSync} from 'node:fs';
import {getAuth} from 'firebase-admin/auth';
import {addMonths} from '../js/util.js';
import {db,household,warsaw} from './common.mjs';
import {APP,backupDoc,monthStats,summaryHtml,summaryText} from './mail-lib.mjs';
import {mailPlan} from './when-lib.mjs';
import {yearHtml,yearStats,yearText} from '../js/report.js';
const H=db().doc('households/main'),{today,hour,weekday}=warsaw(),mode=process.env.MODE||'auto',ym=today.slice(0,7);
const user=process.env.GMAIL_USER,pass=(process.env.GMAIL_APP_PASSWORD||'').replace(/\s/g,'');
if(!user||!pass){console.error('Brak sekretów GMAIL_USER / GMAIL_APP_PASSWORD.');process.exit(1)}
const logRef=H.collection('market').doc('maillog'),log=(await logRef.get()).data()||{};
const {backup:doBackup,year:doYear,sum:doSum}=mailPlan({today,hour,weekday,mode,log});
if(!doBackup&&!doSum&&!doYear){console.log('– to nie pora na maile');process.exit(0)}
const D=await household(H);
/* recipients: only the addresses the phones wrote to households/main/users after logging in (the Firestore rules let only the two owners write there).
   NOT every Firebase account – with sign-up open a stranger could create one and get the summary. Accounts without a users document are only counted in the log. The backup only to Mati */
const people=Object.values(D.users||{}).filter(u=>u.email);
const known=new Set(Object.keys(D.users||{}));
const other=await getAuth().listUsers(20).then(r=>r.users.filter(u=>!known.has(u.uid)).length).catch(()=>0);
if(other)console.log(`⚠️ kont logowania bez dokumentu users (nie dostają maili): ${other}`);
const mati=people.find(u=>u.who=='Mati')?.email||user,all=[...new Set(people.map(u=>u.email))];if(!all.length)all.push(user);
const tr=nodemailer.createTransport({host:'smtp.gmail.com',port:465,secure:true,auth:{user,pass}});
const from={name:'Budżet M&W 🐾',address:user};
/* an SMTP error contains the recipients' addresses – the GitHub log is public, so only the error code goes there */
async function send(m){try{await tr.sendMail(m)}catch(e){console.error('✗ wysyłka nie wyszła: '+(e.code||'błąd')+(e.responseCode?' '+e.responseCode:''));process.exit(1)}}
if(doBackup){const json=JSON.stringify(backupDoc(D)),gz=gzipSync(Buffer.from(json));
  if(process.env.BACKUP_FILE)writeFileSync(process.env.BACKUP_FILE,json); // next step of mail.yml checks that this backup loads (tests/restore.mjs), then deletes the file
  await send({from,to:mati,subject:`💾 Kopia budżetu – ${today}`,
    text:`Comiesięczna kopia Waszego budżetu (${D.txAll.length} wpisów).\n\nJak wczytać: zapisz załącznik w Plikach, potem w aplikacji ⚙️ → „Wczytaj kopię (.json)” i wybierz ten plik.\nZachowaj ten mail – to Wasze zabezpieczenie.\n\nBudżet M&W`,
    attachments:[{filename:`budzet-kopia-${today}.json.gz`,content:gz,contentType:'application/gzip'}]});
  await H.collection('meta').doc('backup').set({at:Date.now(),who:'automat',auto:true});
  if(mode=='auto')await logRef.set({backup:ym,backupAt:today},{merge:true});
  console.log(`✓ kopia wysłana (${Math.round(gz.length/1024)} KB)`)}
if(doSum){const st=monthStats(D,addMonths(ym,-1),today);
  await send({from,to:all,subject:`📊 Budżet M&W – podsumowanie miesiąca`,text:summaryText(st),html:summaryHtml(st)});
  if(mode=='auto')await logRef.set({sum:ym,sumAt:today},{merge:true});
  console.log(`✓ podsumowanie wysłane do ${all.length} ${all.length==1?'osoby':'osób'}`)}
if(doYear){const y=mode=='test-rok'?today.slice(0,4):String(+today.slice(0,4)-1),st=yearStats(D,y,today);
  await send({from,to:all,subject:`🎉 Budżet M&W – podsumowanie roku ${y}`,text:yearText(st),html:yearHtml(st,APP)});
  if(mode=='auto')await logRef.set({year:today.slice(0,4),yearAt:today},{merge:true});
  console.log(`✓ podsumowanie roku wysłane do ${all.length} ${all.length==1?'osoby':'osób'}`)}
process.exit(0);
