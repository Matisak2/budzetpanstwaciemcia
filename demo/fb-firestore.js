// Demo stand-in for Firestore: documents live in window.MW_DEMO.store (saved in this browser's localStorage), same API subset the app uses.
const D=window.MW_DEMO,subs=[];
/* like the real SDK: a field set to undefined rejects the whole write (JSON.stringify would silently drop it – the robot would not notice) */
const noUndef=(x,p='')=>{if(x===undefined)throw new Error('Function setDoc() called with invalid data. Unsupported field value: undefined (found in field '+p+')');
  if(x&&typeof x=='object'&&!Array.isArray(x)&&!x.__del&&x.__inc==null)for(const[k,v]of Object.entries(x))noUndef(v,p?p+'.'+k:k);else if(Array.isArray(x))x.forEach((v,i)=>noUndef(v,p+'['+i+']'))};
const copy=x=>x==null?x:JSON.parse(JSON.stringify(x));
export const initializeFirestore=()=>({});export const persistentLocalCache=()=>({});export const persistentMultipleTabManager=()=>({});
export const doc=(base,...segs)=>({p:[base.p,...segs].filter(Boolean).join('/'),doc:true});
export const collection=(base,name)=>({p:[base.p,name].filter(Boolean).join('/'),col:true});
export const deleteField=()=>({__del:true});
export const increment=n=>({__inc:n});
function deep(t,s){for(const[k,v]of Object.entries(s)){if(v&&v.__del){delete t[k];continue}if(v&&v.__inc!=null){t[k]=(+t[k]||0)+v.__inc;continue}if(v&&typeof v=='object'&&!Array.isArray(v)){t[k]=t[k]&&typeof t[k]=='object'&&!Array.isArray(t[k])?t[k]:{};deep(t[k],v)}else t[k]=v}return t}
const meta={hasPendingWrites:false,fromCache:false};
function emit(s){const st=D.store;
  if(s.ref.doc){const d=st[s.ref.p];s.cb({exists:()=>!!d,data:()=>copy(d),id:s.ref.p.split('/').pop(),metadata:meta})}
  else{const pre=s.ref.p+'/';s.cb({docs:Object.keys(st).filter(k=>k.startsWith(pre)&&!k.slice(pre.length).includes('/')).map(k=>({id:k.slice(pre.length),data:()=>copy(st[k])})),metadata:meta})}}
let pend=false;const fire=()=>{if(pend)return;pend=true;setTimeout(()=>{pend=false;subs.forEach(emit);D.save()},1)};
D.touch=fire;
export const onSnapshot=(ref,a,b)=>{const cb=typeof a=='function'?a:b,s={ref,cb};subs.push(s);D.ready.then(()=>setTimeout(()=>emit(s),5));return()=>{const i=subs.indexOf(s);if(i>=0)subs.splice(i,1)}};
/* mergeFields (as in the SDK): only the listed top-level fields are replaced, a listed field missing from the data is removed, the rest stays */
export const setDoc=async(ref,body,opt)=>{noUndef(body);if(opt&&opt.mergeFields){const t=D.store[ref.p]||{},b=copy(body);for(const f of opt.mergeFields){if(f in b)t[f]=b[f];else delete t[f]}D.store[ref.p]=t}
  else D.store[ref.p]=opt&&opt.merge?deep(D.store[ref.p]||{},copy(body)):deep({},copy(body));fire()};
export const updateDoc=async(ref,body)=>{noUndef(body);const d=D.store[ref.p]||{};for(const[k,v]of Object.entries(body)){const ks=k.split('.');let t=d;for(const x of ks.slice(0,-1))t=t[x]=t[x]&&typeof t[x]=='object'?t[x]:{};if(v&&v.__del)delete t[ks.at(-1)];else t[ks.at(-1)]=copy(v)}D.store[ref.p]=d;fire()};
export const deleteDoc=async(ref)=>{delete D.store[ref.p];fire()};
export const getDoc=async(ref)=>{await D.ready;const d=D.store[ref.p];return{exists:()=>!!d,data:()=>copy(d),id:ref.p.split('/').pop()}};
export const getDocs=async(ref)=>{await D.ready;const pre=ref.p+'/';return{docs:Object.keys(D.store).filter(k=>k.startsWith(pre)&&!k.slice(pre.length).includes('/')).map(k=>({id:k.slice(pre.length),data:()=>copy(D.store[k])}))}};
export const waitForPendingWrites=async()=>{};
