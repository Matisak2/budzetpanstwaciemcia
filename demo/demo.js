/* 🧪 Budżet M&W – demo. Runs before the app: sample data in this browser (localStorage), the visitor's name instead of „Mati” / „Wercia”.
   Inside the data the two people stay 'Mati' and 'Wercia' (the app's keys); only what is shown on screen gets the demo names. */
(function(){
  const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}},
    del:k=>{try{localStorage.removeItem(k)}catch(e){}},keys:()=>{try{return Object.keys(localStorage)}catch(e){return[]}}};
  const D=window.MW_DEMO={store:{}};let ready;D.ready=new Promise(r=>{ready=r});
  let saveT=0;D.save=()=>{clearTimeout(saveT);saveT=setTimeout(()=>LS.set('demo_db',JSON.stringify(D.store)),300)};
  D.reset=()=>{if(!window.confirm('Zacząć od nowa? Wszystko, co wpisano w wersji demonstracyjnej, zniknie.'))return;LS.keys().filter(k=>k.startsWith('demo_')).forEach(LS.del);location.reload()};

  /* names: the visitor chooses „dodał” or „dodała” – that decides which of the app's two people they are; the partner gets a random name */
  const F=['Ola','Kasia','Zosia','Ania','Magda','Ewa','Julia','Basia','Natalia','Hania'],M=['Kuba','Tomek','Bartek','Adam','Michał','Kamil','Szymon','Piotr','Janek','Filip'];
  const gen=n=>/ek$/.test(n)?n.slice(0,-2)+'ka':/(ia|la|ja|ka|ga)$/.test(n)?n.slice(0,-1)+'i':/a$/.test(n)?n.slice(0,-1)+'y':/[iy]$/.test(n)?n+'ego':n+'a';
  const people=()=>{try{return JSON.parse(LS.get('demo_people')||'null')}catch(e){return null}};
  const names=p=>p.role=='Wercia'?{Mati:p.partner,Wercia:p.me}:{Mati:p.me,Wercia:p.partner};
  let MAP=null;const setMap=p=>{const n=names(p);MAP={Mati:n.Mati,Matiego:gen(n.Mati),Wercia:n.Wercia,Werci:gen(n.Wercia),Weronika:n.Wercia}};
  const RE=/(^|[^\p{L}\d])(Matiego|Mati|Wercia|Werci|Weronika)(?=$|[^\p{L}\d])/gu,sub=s=>s.replace(RE,(m,a,w)=>a+MAP[w]);
  function fix(root){if(!MAP)return;const w=document.createTreeWalker(root,window.NodeFilter.SHOW_TEXT|window.NodeFilter.SHOW_ELEMENT);let n=root;
    do{if(n.nodeType==3){if(RE.test(n.data)){RE.lastIndex=0;const p=n.parentNode;if(p&&p.nodeName!='TEXTAREA'&&p.nodeName!='SCRIPT'&&p.nodeName!='STYLE')n.data=sub(n.data)}RE.lastIndex=0}
      else if(n.nodeType==1)for(const a of ['placeholder','aria-label','title']){const v=n.getAttribute&&n.getAttribute(a);if(v&&RE.test(v)){RE.lastIndex=0;n.setAttribute(a,sub(v))}RE.lastIndex=0}}
    while((n=w.nextNode()))}
  const obs=new window.MutationObserver(L=>{for(const m of L){if(m.type=='characterData')fix(m.target);else m.addedNodes.forEach(x=>{if(x.nodeType==1||x.nodeType==3)fix(x)});if(m.type=='attributes')fix(m.target)}});
  const watch=()=>{fix(document.body);obs.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','title']})};

  /* sample data – a young couple, four months, nothing from the real app */
  const pad=n=>String(n).padStart(2,'0'),iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const addMonths=(ym,k)=>{const[y,m]=ym.split('-').map(Number),d=new Date(y,m-1+k,1);return`${d.getFullYear()}-${pad(d.getMonth()+1)}`};
  const daysIn=ym=>new Date(+ym.slice(0,4),+ym.slice(5),0).getDate();
  function marketFor(today){const ym=today.slice(0,7),inflH={},v=[4.9,4.9,4.9,4.3,4.0,4.1,3.1,2.9,2.9,2.8,2.6,2.4,2.5,2.6,2.7,2.9,3.0,2.9,2.8,2.9,3.0,2.9,2.8,2.9];
    v.forEach((x,i)=>{inflH[addMonths(ym,i-v.length)]=x});const ser=t=>t+pad(+ym.slice(5))+String(+ym.slice(2,4)+({EDO:10,COI:4,ROS:6,ROD:12}[t]||0)).padStart(2,'0');
    return{date:today,ts:Date.now(),fxDate:today,fx:{EUR:4.27,USD:3.98,GBP:5.06,CHF:4.55,CZK:0.171},nbp:4,infl:2.9,inflPer:addMonths(ym,-1),inflH,src:{fx:'demo'},
      prices:{'IWDA.UK':{p:104.2,d:today,src:'demo',cur:'USD'}},gold:452.1,goldDate:today,funds:{PZU56:{p:109.75,d:today,cur:'PLN'}},
      bonds:{date:today,EDO:{type:'EDO',series:ser('EDO'),first:5.35,margin:2},COI:{type:'COI',series:ser('COI'),first:4.75,margin:1.5},ROS:{type:'ROS',series:ser('ROS'),first:5.6,margin:2},TOS:{type:'TOS',series:ser('TOS'),first:4.4}}}}
  function build(p){const n=names(p),A=n.Mati,B=n.Wercia,today=iso(new Date()),ym0=today.slice(0,7);
    let seed=20261022;const R=()=>{seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296},r=(a,b)=>Math.round(a+(b-a)*R()),pick=L=>L[Math.floor(R()*L.length)];
    const HUES=[150,205,28,340,265,48,185,12,295,95,228,320,62,168,245,0];
    const CATS=[['ZAROBKI I WPŁYWY','inc','💰',[`Pensja ${A}`,`Pensja ${B}`,'Premie i dodatki','Zwroty i inne']],['JEDZENIE','exp','🛒',['Zakupy spożywcze','Restauracje','Kawa i przekąski','Jedzenie z dowozem']],
      ['DOM','exp','🏠',['Czynsz','Prąd','Internet i telefon','Środki czystości','Wyposażenie']],['TRANSPORT','exp','🚗',['Paliwo','Komunikacja miejska','Serwis auta']],
      ['ZDROWIE I URODA','exp','💊',['Lekarz','Leki','Fryzjer i kosmetyki']],['UBRANIA','exp','👕',[`Ubrania ${A}`,`Ubrania ${B}`]],['ROZRYWKA','exp','🎉',['Kino i koncerty','Hobby','Wyjazdy']],
      ['SUBSKRYPCJE','exp','📱',['Spotify','Netflix','Chmura i aplikacje']],['ZWIERZAKI','exp','🐱',['Karma','Weterynarz']],['PREZENTY','exp','🎁',['Prezenty','Święta i okazje']],['INNE','exp','📦',['Opłaty bankowe','Inne wydatki']]];
    const catsM={},sid={};CATS.forEach(([name,type,icon,subs],i)=>{const subsM={};subs.forEach((s,j)=>{subsM[`c${i}s${j}`]={name:s,o:j};sid[s]=`c${i}s${j}`});catsM['c'+i]={name,type,icon,hue:HUES[i],o:i,subsM}});
    const ACC=[['aM',`Konto ${A}`,'cur','Mati',420000],['aW',`Konto ${B}`,'cur','Wercia',380000],['aJ','Konto wspólne','cur','Wspólne',150000],['aG','Gotówka','cur','Wspólne',30000],
      ['aS','Oszczędności wspólne','sav','Wspólne',1200000],['aP','Poduszka bezpieczeństwa','sav','Wspólne',1800000],['aI',`IKE ${A}`,'inv','Mati',450300,'ike'],['aK',`PPK ${B}`,'inv','Wercia',622380,'ppk'],['aO','Obligacje','inv','Wspólne',1000000]];
    const accsM={};ACC.forEach(([id,name,grp,owner,open,wrap],o)=>{accsM[id]={name,grp,owner,open,o,...(wrap?{wrap}:{})}});const own=Object.fromEntries(ACC.map(a=>[a[0],a[3]]));
    const FIX=[['f1','Czynsz',185000,10,'Czynsz','aJ','exp'],['f2','Prąd',18000,15,'Prąd','aJ','exp'],['f3','Internet i telefon',8999,5,'Internet i telefon','aJ','exp'],['f4','Spotify',2999,12,'Spotify','aM','exp'],
      ['f5','Netflix',4300,20,'Netflix','aW','exp'],['f6',`Pensja ${A}`,720000,10,`Pensja ${A}`,'aM','inc'],['f7',`Pensja ${B}`,680000,10,`Pensja ${B}`,'aW','inc']];
    const fixedM={};FIX.forEach(([id,name,amount,day,s,acc,kind],o)=>{fixedM[id]={name,amount,day,sub:sid[s],acc,kind,o}});fixedM.f8={name:'Na oszczędności',amount:100000,day:11,sub:'',acc:'aJ',to:'aS',kind:'tr',o:8};
    const st={'households/main':{v:2,accsM,catsM,fixedM,roundM:{},incM:{},yearM:{},projM:{},remM:{},invAcc:true,ikeAcc:true,wspAcc:true,ppkAcc:true,zwrotyRen:true,subAcc:true,savTarget:150000,demo:true}};
    const PLAN={'Zakupy spożywcze':140000,'Restauracje':40000,'Kawa i przekąski':15000,'Jedzenie z dowozem':12000,'Czynsz':185000,'Prąd':20000,'Internet i telefon':9000,'Środki czystości':8000,'Paliwo':50000,
      'Komunikacja miejska':11000,'Lekarz':10000,'Leki':6000,'Fryzjer i kosmetyki':10000,[`Ubrania ${A}`]:20000,[`Ubrania ${B}`]:25000,'Kino i koncerty':10000,'Hobby':10000,'Spotify':3000,'Netflix':4300,
      'Chmura i aplikacje':1200,'Karma':25000,'Prezenty':15000,[`Pensja ${A}`]:720000,[`Pensja ${B}`]:680000};
    let k=0;for(let mi=-3;mi<=0;mi++){const ym=addMonths(ym0,mi),last=mi==0?+today.slice(8):daysIn(ym),tx={};
      const add=(day,o)=>{if(day>last)return;const date=`${ym}-${pad(day)}`,who=o.who||(own[o.acc]=='Wercia'?'Wercia':own[o.acc]=='Mati'?'Mati':pick(['Mati','Wercia']));
        tx['d'+(++k)]={type:'exp',to:'',note:'',...o,date,who,by:who,deleted:false,ts:new Date(date+'T12:00:00').getTime()+k}};
      FIX.forEach(([id,name,amount,day,s,acc,kind])=>add(day,{type:kind,amount:kind=='inc'?amount+r(-15000,25000):amount,sub:sid[s],acc,fixedId:id,note:name}));
      add(11,{type:'tr',amount:100000,sub:'',acc:'aJ',to:'aS',fixedId:'f8',note:'Na oszczędności'});
      add(11,{type:'tr',amount:300000,sub:'',acc:'aM',to:'aJ',note:'Na wspólne'});add(11,{type:'tr',amount:300000,sub:'',acc:'aW',to:'aJ',note:'Na wspólne'});
      for(let i=0;i<9;i++)add(r(1,28),{amount:r(4000,26000),sub:sid['Zakupy spożywcze'],acc:'aJ',note:pick(['Biedronka','Lidl','Żabka','Auchan','Warzywniak'])});
      for(let i=0;i<3;i++)add(r(1,28),{amount:r(6000,22000),sub:sid['Restauracje'],acc:pick(['aM','aW']),note:pick(['Pizzeria','Sushi','Bistro','Pierogarnia'])});
      for(let i=0;i<6;i++)add(r(1,28),{amount:r(1200,2800),sub:sid['Kawa i przekąski'],acc:pick(['aM','aW']),note:'Kawiarnia'});
      for(let i=0;i<2;i++)add(r(1,28),{amount:r(5000,9000),sub:sid['Jedzenie z dowozem'],acc:pick(['aM','aW']),note:pick(['Pyszne','Glovo'])});
      for(let i=0;i<2;i++)add(r(1,28),{amount:r(18000,30000),sub:sid['Paliwo'],acc:'aM',note:pick(['Orlen','BP','Shell'])});
      add(2,{amount:11000,sub:sid['Komunikacja miejska'],acc:'aW',note:'Bilet miesięczny'});add(3,{amount:1199,sub:sid['Chmura i aplikacje'],acc:'aM',note:'Chmura 200 GB'});
      for(let i=0;i<2;i++)add(r(1,28),{amount:r(9000,16000),sub:sid['Karma'],acc:'aJ',note:'Sklep zoologiczny'});
      add(r(5,25),{amount:r(3000,8000),sub:sid['Środki czystości'],acc:'aJ',note:'Drogeria'});
      const extra=[['Kino i koncerty',6000,9000,'Kino'],['Hobby',5000,15000,'Sklep z modelami'],['Fryzjer i kosmetyki',7000,12000,'Fryzjer'],['Leki',2500,6000,'Apteka'],['Prezenty',8000,20000,'Prezent urodzinowy'],
        [`Ubrania ${A}`,12000,30000,'Sklep odzieżowy'],[`Ubrania ${B}`,12000,35000,'Sklep odzieżowy'],['Lekarz',15000,25000,'Wizyta prywatna'],['Opłaty bankowe',500,1500,'Opłata za kartę']];
      for(let i=0;i<4;i++){const[s,a,b,note]=pick(extra);add(r(1,28),{amount:r(a,b),sub:sid[s],acc:s.includes(B)?'aW':s.includes(A)?'aM':pick(['aM','aW','aJ']),note})}
      if(mi==-2)add(14,{amount:180000,sub:sid['Wyjazdy'],acc:'aJ',note:'Weekend w górach'});
      st['households/main/months/'+ym]={tx};const pl={};for(const[s,v]of Object.entries(PLAN))pl[sid[s]]=v;st['households/main/plans/'+ym]=pl}
    const m3=addMonths(ym0,-3)+'-05',m14=addMonths(ym0,-14)+'-10';
    st['households/main/hold/h1']={acc:'aI',kind:'etf',name:'MSCI World',ticker:'IWDA.UK',cur:'USD',price:95,fxNow:3.95,priceDate:m3,lots:{l1:{date:m3,kind:'buy',qty:12,price:95,fx:3.95,fee:0}},deleted:false};
    st['households/main/hold/h2']={acc:'aK',kind:'tfi',name:'PPK inPZU 2040',fund:{id:'PZU56',path:'fundusze-ppk/PZU56/ppk-inpzu-2040',name:'PPK inPZU 2040'},cur:'PLN',price:101.2,priceDate:m3,lots:{l1:{date:m3,kind:'buy',qty:61.5,price:101.2,fx:1,fee:0}},deleted:false};
    st['households/main/hold/h3']={acc:'aO',kind:'obl',name:'EDO 10-letnie',cur:'PLN',bond:{type:'EDO',first:5.6,margin:2},lots:{l1:{date:m14,kind:'buy',qty:100,price:100}},deleted:false};
    st['households/main/goals/g1']={name:'Wakacje',target:800000,alloc:250000,deadline:addMonths(ym0,8)+'-01',owner:'Wspólne'};
    st['households/main/market/rates']=marketFor(today);
    st['households/main/market/funds']={checked:ym0,date:today,list:{PZU56:'ppk-inpzu-2040',PCS81:'pko-emerytura-2060',PIO78:'pekao-ppk-2060',KAH29:'esaliens-2050',ALL87:'allianz-plan-emerytalny-2050'}};
    st['households/main/meta/backup']={at:Date.now()};
    return st}

  function start(p){setMap(p);let st=null;try{st=JSON.parse(LS.get('demo_db')||'null')}catch(e){}
    if(!st||!st['households/main'])st=build(p);
    const today=iso(new Date());st['households/main/market/rates']={...(st['households/main/market/rates']||{}),...marketFor(today)};st['households/main/meta/backup']={at:Date.now()};
    D.store=st;LS.set('demo_db',JSON.stringify(st));LS.set('demo_mw_who',p.role);if(!LS.get('demo_mw_news'))LS.set('demo_mw_news','9999');
    if(document.body)watch();else document.addEventListener('DOMContentLoaded',watch);
    ready();const t=window.setInterval(()=>{if(window.setWho&&window.S?.cfg){window.clearInterval(t);if(window.S.who!=p.role)window.setWho(p.role)}},100)}

  /* the partner's name can be changed later (⚙️ → Wersja demonstracyjna); names inside the sample data change with it */
  D.rename=()=>{const p=people();if(!p)return;const v=(window.prompt('Imię drugiej osoby:',p.partner)||'').trim().slice(0,20);if(!v||v==p.partner)return;
    const re=new RegExp('(^|[^\\p{L}])'+p.partner.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=$|[^\\p{L}])','gu');
    D.store=JSON.parse(JSON.stringify(D.store).replace(re,(m,a)=>a+v));p.partner=v;LS.set('demo_people',JSON.stringify(p));LS.set('demo_db',JSON.stringify(D.store));location.reload()};

  function ask(){const roleF=Math.random()<.5;let role=null;
    const box=document.createElement('div');box.className='ov demo-ov';
    box.innerHTML=`<div class="dlg demo-hi"><img src="../icon-192.png?v=5" alt="" width="72" height="72" style="align-self:center;border-radius:18px"><h2 style="text-align:center">Budżet M&amp;W – wersja demonstracyjna</h2>
      <p class="dtext">Zobacz, jak działa nasz domowy budżet. Dane są przykładowe i zostają tylko w tej przeglądarce – możesz wszystko klikać i zmieniać.</p>
      <label class="fld"><span>Jak masz na imię?</span><input id="dmName" maxlength="20" autocomplete="given-name" placeholder="np. Ania"></label>
      <div class="fld"><span>Jak pisać o Twoich wpisach?</span><div class="seg"><button type="button" data-r="Mati" aria-pressed="false">„dodał”</button><button type="button" data-r="Wercia" aria-pressed="false">„dodała”</button></div></div>
      <label class="fld"><span>Imię drugiej osoby w budżecie (możesz zmienić)</span><input id="dmPart" maxlength="20"></label>
      <button class="btn primary" id="dmGo">Zaczynamy 🐾</button></div>`;
    document.body.appendChild(box);const nm=box.querySelector('#dmName'),pt=box.querySelector('#dmPart');
    const setR=r=>{role=r;box.querySelectorAll('[data-r]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.r==r)));if(!pt.dataset.t)pt.value=r=='Wercia'?M[Math.floor(Math.random()*M.length)]:F[Math.floor(Math.random()*F.length)]};
    pt.value=(roleF?M:F)[Math.floor(Math.random()*10)];pt.oninput=()=>{pt.dataset.t='1'};
    box.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>setR(b.dataset.r));
    box.querySelector('#dmGo').onclick=()=>{const me=nm.value.trim().slice(0,20),partner=pt.value.trim().slice(0,20);
      if(!me){nm.focus();nm.placeholder='Wpisz swoje imię 🙂';return}if(!role){box.querySelector('.seg').animate([{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'none'}],{duration:240});return}
      const p={me,role,partner:partner||(role=='Wercia'?'Kuba':'Ola')};LS.set('demo_people',JSON.stringify(p));box.remove();start(p)};
    setTimeout(()=>nm.focus(),100)}

  const p=people();if(p)start(p);else if(document.body)ask();else document.addEventListener('DOMContentLoaded',ask);
})();
