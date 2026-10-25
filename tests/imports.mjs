/* 🤖 Robot: czy każda nazwa importowana z innego pliku aplikacji (./x.js) jest tam naprawdę wystawiona (export).
   Brak = aplikacja w ogóle się nie uruchamia. Uruchomienie: node tests/imports.mjs */
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const acorn=await import('acorn').catch(()=>import('/opt/node-tools/node_modules/acorn/dist/acorn.mjs'));
const R=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','js');const exp={},imp=[];let bad=0;
for(const f of fs.readdirSync(R).filter(f=>f.endsWith('.js'))){const a=acorn.parse(fs.readFileSync(path.join(R,f),'utf8'),{ecmaVersion:'latest',sourceType:'module'});exp[f]=new Set();
  for(const n of a.body){if(n.type=='ExportNamedDeclaration'){const d=n.declaration;if(d?.id)exp[f].add(d.id.name);else d?.declarations?.forEach(x=>exp[f].add(x.id.name));n.specifiers.forEach(s=>exp[f].add(s.exported.name))}
    if(n.type=='ImportDeclaration'&&n.source.value.startsWith('./'))imp.push([f,n.source.value.slice(2),n.specifiers.map(s=>s.imported?.name).filter(Boolean)])}}
for(const[f,t,ns]of imp){if(!exp[t]){console.log(`❌ ${f}: importuje z ${t}, a takiego pliku nie ma`);bad++;continue}for(const x of ns)if(!exp[t].has(x)){console.log(`❌ ${f}: importuje „${x}” z ${t}, a ${t} go nie wystawia (brak export)`);bad++}}
console.log(bad?`\n❌ Powiązania między plikami: ${bad} problem(ów).`:`✅ Powiązania między plikami w porządku (${imp.length} importów).`);process.exit(bad?1:0);
