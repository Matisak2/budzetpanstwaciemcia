/* 🤖 Robot: a change of the app's files must come with a new CACHE number in sw.js – telephones keep the complete set of one version
   and take a new one only when the number changes (sw.js). Compares HEAD with the commit before the push.
   node tests/cache.mjs <commit before>   (CI: github.event.before; locally e.g. origin/main). No such commit → nothing to compare. */
import {execFileSync} from 'node:child_process';
const git=(...a)=>execFileSync('git',a,{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
const base=process.argv[2]||'';
let ok=true;try{if(!/^[0-9a-f]{7,40}$|^origin\//.test(base)||/^0+$/.test(base))throw 0;git('cat-file','-e',base+'^{commit}')}catch(e){ok=false}
if(!ok){console.log('⏭️  Brak poprzedniej wersji do porównania – pomijam sprawdzenie numeru CACHE.');process.exit(0)}
const cacheOf=src=>(/const CACHE = '([^']+)'/.exec(src)||[])[1];
const sw=git('show','HEAD:sw.js'),shell=[...sw.matchAll(/'\.\/([^']*)'/g)].map(m=>m[1]||'index.html');
const changed=git('diff','--name-only',base,'HEAD').split('\n').filter(f=>shell.includes(f));
const before=cacheOf(git('show',base+':sw.js')),now=cacheOf(sw);
if(changed.length&&before===now){console.log(`❌ Zmieniły się pliki aplikacji (${changed.join(', ')}), a numer CACHE w sw.js został ten sam (${now}). Podbij go – inaczej telefony nie dostaną nowej wersji.`);process.exit(1)}
console.log(changed.length?`✅ Nowa wersja aplikacji: ${before} → ${now}.`:'✅ Pliki aplikacji bez zmian.');
