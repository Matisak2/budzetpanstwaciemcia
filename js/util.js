export const $=id=>document.getElementById(id);
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const MNG=['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
export const MN=["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];
/* numbers in Polish style, always grouped – also 4-digit ones („5 449,18”, like „14 109,18”; the browser alone writes „5449,18”) */
export const fmtN=(x,d=2)=>{const s=(+x||0).toLocaleString('pl-PL',{minimumFractionDigits:d,maximumFractionDigits:d,useGrouping:false}),[i,f]=s.split(',');
  return i.replace(/\B(?=(\d{3})+(?!\d))/g,'\u00a0')+(f!=null?','+f:'')};
export const zl=n=>fmtN(n/100)+' zł';
/* other currencies: amounts in the smallest unit (cents), shown with their symbol; PLN stays „zł” */
const SYM={PLN:'zł',EUR:'€',USD:'$',GBP:'£'};
export const curSym=c=>SYM[c||'PLN']||c;
export const money=(n,c)=>!c||c=='PLN'?zl(n):fmtN(n/100)+' '+curSym(c);
/* {EUR:4500,USD:-1000} → "45,00 € − 10,00 $"; fxPlus adds them after a złoty sum: " + 45,00 € − 10,00 $" */
const fxList=m=>Object.entries(m||{}).filter(([,v])=>v).sort((a,b)=>a[0].localeCompare(b[0]));
export const fxPlus=m=>fxList(m).map(([c,v])=>(v<0?' − ':' + ')+money(Math.abs(v),c)).join('');
export const fxTxt=m=>fxPlus(m).replace(/^ \+ /,'').replace(/^ − /,'−');
export const zl0=n=>fmtN(Math.round(n/100),0)+' zł';
/* amounts as typed or pasted: "1 234,56", "1.234,56", "1,234.56", "12,5"; for money a single separator followed by exactly 3 digits ("1.234") means thousands */
export const pnum=(s,money)=>{s=String(s??'').replace(/\s/g,'').replace(/zł|pln|eur|usd|gbp|chf|€|\$/gi,'');
  const neg=/^[-−]/.test(s);s=s.replace(/^[-−]/,'');
  const nd=(s.match(/\./g)||[]).length,nc=(s.match(/,/g)||[]).length;
  if(nd&&nc){const dec=s.lastIndexOf('.')>s.lastIndexOf(',')?'.':',';s=s.split(dec=='.'?',':'.').join('').replace(',','.')}
  else if(nd+nc>1)s=s.replace(/[.,]/g,'');
  else if(nd+nc==1){const[a,b]=s.split(nd?'.':',');s=money&&b.length==3&&/^[1-9]\d{0,2}$/.test(a)?a+b:a+'.'+b}
  const v=parseFloat(s);return isNaN(v)?0:neg?-v:v};
export const pg=s=>Math.round(pnum(s,true)*100);
export const fmtIn=n=>n?(n/100).toFixed(2).replace(/\.00$/,'').replace('.',','):'';
export const f2=n=>(n/100).toFixed(2).replace('.',',');
export const p2=n=>String(n).padStart(2,'0');
export const td=()=>{const d=new Date();return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())};
export const daysIn=ym=>new Date(+ym.slice(0,4),+ym.slice(5,7),0).getDate();
export const rid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
export const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export const clone=o=>JSON.parse(JSON.stringify(o));
export const isDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||'');
/* phone settings; the demo (/demo/) keeps its own copy so it never touches the real app's settings */
const LSP=globalThis.MW_DEMO?'demo_':'';
export const ls={get(k){try{return localStorage.getItem(LSP+k)}catch(e){return null}},set(k,v){try{localStorage.setItem(LSP+k,v)}catch(e){}}};
export const addDays=(iso,n)=>{const d=new Date(iso+'T12:00:00');d.setDate(d.getDate()+n);return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())};
export const addMonths=(ym,n)=>{let[y,m]=ym.split('-').map(Number);m+=n;while(m<1){m+=12;y--}while(m>12){m-=12;y++}return y+'-'+p2(m)};
