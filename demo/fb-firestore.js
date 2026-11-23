// Demo stand-in for Firestore: documents live in window.MW_DEMO.store (saved in this browser's localStorage), same API subset the app uses.
const D=window.MW_DEMO,subs=[];
/* like the real SDK (tests/sdk.mjs compares both): a field set to undefined, a function, a nested array, an empty or __x__ field name, deleteField()
   in an array (or in set() without merge) rejects the whole write – JSON.stringify would silently drop or keep it and the robot would not notice */
const bad=(m,fn='setDoc')=>{const e=new Error('Function '+fn+'() called with invalid data. '+m);e.code='invalid-argument';return e};
const noUndef=(x,p='',o={})=>{const fn=o.fn||'setDoc',at=' (found in field '+p+')';
  if(x===undefined)throw bad('Unsupported field value: undefined'+at,fn);if(typeof x=='function')throw bad('Unsupported field value: a function'+at,fn);
  if(x&&x.__del){if(o.arr)throw bad('deleteField() is not currently supported inside arrays'+at,fn);if(o.noDel)throw bad('deleteField() cannot be used with set() unless you pass {merge:true}'+at,fn);
    if(o.top===false)throw bad('deleteField() can only appear at the top level of your update data'+at,fn);return}
  if(x&&x.__inc!=null)return;
  if(Array.isArray(x)){if(o.arr)throw bad('Nested arrays are not supported'+at,fn);x.forEach((v,i)=>noUndef(v,p+'['+i+']',{...o,arr:true}));return}
  if(x&&typeof x=='object')for(const[k,v]of Object.entries(x)){if(!k)throw bad('Document fields must not be empty'+at,fn);
    if(/^__.*__$/.test(k))throw bad('Document fields cannot begin and end with "__"'+at,fn);noUndef(v,p?p+'.'+k:k,{...o,top:o.top===undefined?undefined:false})}};
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
/* mergeFields (as in the SDK): only the listed top-level fields are replaced (deleteField() removes one), the rest stays; a listed field missing
   from the data throws at once, like the SDK („Field 'x' is specified in your field mask but missing from your input data”) */
export const setDoc=(ref,body,opt)=>{noUndef(body,'',{noDel:!(opt&&(opt.merge||opt.mergeFields))});if(opt&&opt.mergeFields){for(const f of opt.mergeFields)if(!(f in body)){const e=new Error(`Field '${f}' is specified in your field mask but missing from your input data.`);e.code='invalid-argument';throw e}
  const t=D.store[ref.p]||{},b=copy(body);for(const f of opt.mergeFields){if(b[f]&&b[f].__del)delete t[f];else if(b[f]&&b[f].__inc!=null)t[f]=(+t[f]||0)+b[f].__inc;else t[f]=b[f]&&typeof b[f]=='object'&&!Array.isArray(b[f])?deep({},b[f]):b[f]}D.store[ref.p]=t;fire();return Promise.resolve()}
  return setDocM(ref,body,opt)};
const setDocM=async(ref,body,opt)=>{
  D.store[ref.p]=opt&&opt.merge?deep(D.store[ref.p]||{},copy(body)):deep({},copy(body));fire()};
/* updateDoc: dotted paths (no empty segments), deleteField() only at the top of the update, increment(); a missing document is not created –
   the SDK keeps nothing locally and the server answers not-found */
export const updateDoc=async(ref,body)=>{for(const[k,v]of Object.entries(body)){if(k.split('.').some(x=>!x))throw bad('Invalid field path ('+k+'). Paths must not be empty, begin with \'.\', end with \'.\', or contain \'..\'','updateDoc');
    noUndef(v,k,{fn:'updateDoc',top:true})}
  const d=D.store[ref.p];if(!d){const e=new Error('No document to update: '+ref.p);e.code='not-found';throw e}
  for(const[k,v]of Object.entries(body)){const ks=k.split('.');let t=d;for(const x of ks.slice(0,-1))t=t[x]=t[x]&&typeof t[x]=='object'&&!Array.isArray(t[x])?t[x]:{};const l=ks.at(-1);
    if(v&&v.__del)delete t[l];else if(v&&v.__inc!=null)t[l]=(+t[l]||0)+v.__inc;else t[l]=v&&typeof v=='object'&&!Array.isArray(v)?deep({},copy(v)):copy(v)}fire()};
export const deleteDoc=async(ref)=>{delete D.store[ref.p];fire()};
export const getDoc=async(ref)=>{await D.ready;const d=D.store[ref.p];return{exists:()=>!!d,data:()=>copy(d),id:ref.p.split('/').pop()}};
export const getDocs=async(ref)=>{await D.ready;const pre=ref.p+'/';return{docs:Object.keys(D.store).filter(k=>k.startsWith(pre)&&!k.slice(pre.length).includes('/')).map(k=>({id:k.slice(pre.length),data:()=>copy(D.store[k])}))}};
export const waitForPendingWrites=async()=>{};
/* writeBatch: every write checked first (one bad write = nothing saved, like the SDK), then all applied at once */
export const writeBatch=()=>{const ops=[];return{set(ref,body,opt){noUndef(body,'',{noDel:!(opt&&(opt.merge||opt.mergeFields))});ops.push(()=>setDoc(ref,body,opt));return this},
  update(ref,body){ops.push(()=>updateDoc(ref,body));return this},delete(ref){ops.push(()=>deleteDoc(ref));return this},async commit(){for(const f of ops)await f()}}};
