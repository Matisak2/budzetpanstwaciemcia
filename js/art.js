import {cleanCat} from './logic.js';
import {scene} from './cats.js';
import {kotki} from './guide.js';
/* empty screens show Bailey and Ivo (unless switched off in ⚙️) */
export const catsEmpty=(t,small,sc='box')=>`<div class="empty">${kotki.mode=='off'?'':`<div class="ecats${small?' sm':''}">${scene(sc)}</div>`}${t}</div>`;
export const CAT_ICONS=[['ZAROB','💰'],['WPŁYW','💰'],['PRZYCH','💰'],['KREDYT','🏦'],['POŻYCZ','🏦'],['JEDZ','🛒'],['GASTRO','🛒'],['ZDROW','💊'],['UBRAN','👗'],['OBUW','👗'],['MIESZK','🏠'],['DOM','🏠'],['SUBSKR','📱'],['TELEKOM','📱'],['AUTO','🚗'],['TRANSP','🚗'],['DBANIE','💅'],['SPORT','💅'],['PRACA','🎓'],['ROZWÓJ','🎓'],['ROZRYW','🎉'],['HOBBY','🎉'],['WAKAC','🏖️'],['ZWIERZ','🐱'],['KOT','🐱'],['PREZENT','🎁'],['OKAZJ','🎁'],['UBEZPIECZ','🛡️'],['INNE','📦'],['DZIEC','🧸'],['EDUK','📚'],['OSZCZ','🐷']];
export const catIcon=c=>c.icon||(CAT_ICONS.find(([k])=>cleanCat(c.name).toUpperCase().includes(k))||[,'💠'])[1];
