// Demo stand-in for firebase-auth: always signed in as the demo visitor, once the sample data is ready.
const D=window.MW_DEMO,user={uid:'demo',email:'demo@budzet-mw.pl'};
export const getAuth=()=>({currentUser:user});
export const onAuthStateChanged=(a,cb)=>{D.ready.then(()=>cb(user));return()=>{}};
export const setPersistence=async()=>{};export const browserLocalPersistence={};
export const signInWithEmailAndPassword=async()=>{};export const signOut=async()=>{};
