export const $=id=>document.getElementById(id);
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const MNG=['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
export const MN=["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];
export const zl=n=>(n/100).toLocaleString('pl-PL',{minimumFractionDigits:2,maximumFractionDigits:2})+' zł';
export const zl0=n=>Math.round(n/100).toLocaleString('pl-PL')+' zł';
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
export const ls={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
export const addDays=(iso,n)=>{const d=new Date(iso+'T12:00:00');d.setDate(d.getDate()+n);return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())};
export const addMonths=(ym,n)=>{let[y,m]=ym.split('-').map(Number);m+=n;while(m<1){m+=12;y--}while(m>12){m-=12;y++}return y+'-'+p2(m)};
