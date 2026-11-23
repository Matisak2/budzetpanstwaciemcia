// ⏰ When the automats send (pure functions, tested in tests/calc.mjs): notify.mjs – at most one morning and one evening message a day,
// mail.mjs – the backup on the first Sunday of a month (~21:00, second chance on Monday), the summary on the 1st–2nd (9–13), the year on 1–2 January.
/* the notification slot now: 'm' (7–10), 'e' (20–22), 'test'; null = not the time; 'sent' = already sent today (market/pushlog) */
export function pushSlot({hour,today,mode='auto',log={}}){if(mode=='test')return'test';const s=hour>=7&&hour<11?'m':hour>=20&&hour<23?'e':null;
  return !s?null:log[s]==today?'sent':s}
/* which e-mails go now (market/maillog keeps the month / year already sent) */
export function mailPlan({today,hour,weekday,mode='auto',log={}}){const ym=today.slice(0,7),dom=+today.slice(8),auto=mode=='auto';
  /* a second chance the next day (GitHub sometimes skips a scheduled start, Gmail can fail): Monday after the first Sunday, the 2nd of the month */
  const firstSun=(weekday=='Sun'&&dom<=7)||(weekday=='Mon'&&dom>=2&&dom<=8);
  return{backup:mode=='test-kopia'||(auto&&firstSun&&hour>=21&&log.backup!=ym),
    year:mode=='test-rok'||(auto&&today.slice(5,7)=='01'&&dom<=2&&hour>=9&&hour<14&&log.year!=today.slice(0,4)),
    sum:mode=='test-podsumowanie'||(auto&&dom<=2&&hour>=9&&hour<14&&log.sum!=ym)}}
