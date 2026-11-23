import {cleanCat} from './logic.js';
import {scene} from './cats.js';
import {esc} from './util.js';
import {kotki} from './guide.js';
/* ⚡ cats on every screen: catSlot() puts an empty slot in the HTML, mountCats() after render puts the drawing there – built once per scene
   (~150 KB of SVG with filters: parsing it again cost Analiza a third of each render) and the same element put back every time;
   a second copy on the same screen gets its own drawing (own gradient ids) */
const CATS=new Map();
export function catSlot(name,cls='kot',arg='1'){if(kotki.mode=='off')return'';const k=name+'|'+cls+'|'+arg;const c=CATS.get(k);CATS.delete(k);CATS.set(k,c||{mk:()=>scene(name,cls,arg)});
  while(CATS.size>20)CATS.delete(CATS.keys().next().value);return`<div class="gslot" data-k="${esc(k)}"></div>`}
export function mountCats(root=document){for(const slot of root.querySelectorAll('.gslot')){const c=CATS.get(slot.dataset.k);if(!c){slot.remove();continue}
  let el=c.el&&!c.el.isConnected?c.el:null;if(!el){const t=document.createElement('template');t.innerHTML=c.mk();el=t.content.firstElementChild;if(!c.el||!c.el.isConnected)c.el=el}
  slot.replaceWith(el)}}
/* empty screens show Bailey and Ivo (unless switched off in ⚙️) */
export const catsEmpty=(t,small,sc='box')=>`<div class="empty">${kotki.mode=='off'?'':`<div class="ecats${small?' sm':''}">${catSlot(sc)}</div>`}${t}</div>`;
const CAT_ICONS=[['ZAROB','💰'],['WPŁYW','💰'],['PRZYCH','💰'],['KREDYT','🏦'],['POŻYCZ','🏦'],['JEDZ','🛒'],['GASTRO','🛒'],['ZDROW','💊'],['UBRAN','👗'],['OBUW','👗'],['MIESZK','🏠'],['DOM','🏠'],['SUBSKR','📱'],['TELEKOM','📱'],['AUTO','🚗'],['TRANSP','🚗'],['DBANIE','💅'],['SPORT','💅'],['PRACA','🎓'],['ROZWÓJ','🎓'],['ROZRYW','🎉'],['HOBBY','🎉'],['WAKAC','🏖️'],['ZWIERZ','🐱'],['KOT','🐱'],['PREZENT','🎁'],['OKAZJ','🎁'],['UBEZPIECZ','🛡️'],['INNE','📦'],['DZIEC','🧸'],['EDUK','📚'],['OSZCZ','🐷']];
export const catIcon=c=>c.icon||(CAT_ICONS.find(([k])=>cleanCat(c.name).toUpperCase().includes(k))||[,'💠'])[1];
