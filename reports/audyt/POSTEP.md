# Postęp audytu (start 22.11.2026)

Wznawiając pracę: przeczytaj ten plik, potem ostatni raport etapu. Nie zaczynaj od nowa.

## Etapy
- [x] 0 – Przygotowanie → `00-przygotowanie.md`
- [ ] 1 – Spis funkcji → `01-funkcje.md` (zaczęte: HELP ma 92 pozycje w 7 sekcjach, NEWS do v68; zrzuty robota w `tests/out/`)
- [ ] 2 – Przegląd kodu → `02-kod.md`
- [ ] 3 – Pieniądze i przepisy 2026 → `03-przepisy.md`
- [ ] 4 – Dane, bezpieczeństwo, niezawodność → `04-dane-bezpieczenstwo.md`
- [x] 5 – Szybkość → `05-szybkosc.md` (pomiary zrobione; wąskie gardło `fitNums`)
- [ ] 6 – Sens funkcji i UX → `06-ux.md`
- [x] 7 – Testy → `07-testy.md`
- [ ] 8 – Porównanie z innymi aplikacjami → `08-porownanie.md` (zaczęte: katalog `research_notes/Porównanie aplikacji budżetowych 2026/` – badacze przerwani limitem, nic nie zapisali)
- [x] 9 – Sztuczna inteligencja → `09-ai.md`
- [ ] 10 – Raport końcowy → `00-RAPORT.md`

Naprawy w trakcie: `NAPRAWIONE.md`.

## Przejrzane pliki (etap 2)
- [ ] `js/util.js`
- [ ] `js/data.js`
- [ ] `js/pay.js`
- [ ] `js/inv.js`
- [ ] `js/logic.js`
- [ ] `js/today.js`
- [ ] `js/close.js`
- [ ] `js/core.js`
- [ ] `js/sheet.js`
- [ ] `js/actions.js`
- [ ] `js/app.js`
- [ ] `js/salary.js`
- [ ] `js/savings.js`
- [ ] `js/debts.js`
- [ ] `js/analysis.js`
- [ ] `js/todayui.js`
- [ ] `js/usage.js`
- [ ] `js/report.js`
- [ ] `js/advisor.js`
- [ ] `js/advisorui.js`
- [ ] `js/guide.js`
- [ ] `js/facts.js`
- [ ] `js/cats.js`
- [ ] `js/art.js`
- [ ] `js/charts.js`
- [ ] `style.css`
- [ ] `index.html`
- [ ] `demo/`
- [ ] `sw.js`
- [ ] `manifest.json`
- [ ] `scripts/`
- [ ] `.github/workflows/`
- [ ] `firebase/`
- [ ] `tests/`

## Notatki
- Etap 0: wszystkie testy zielone (punkt odniesienia w `00-przygotowanie.md`).

## Jak wznowić (stan 23.11.2026 00:00, przerwa: limit użycia)
- Robocze pliki (poza git, ale na dysku sesji): `research_notes/audyt-robocze/` – `COMMON.md` = wspólne zasady dla podagentów przeglądu, `perf/` = skrypty pomiarów szybkości, katalogi R1–R8, L3, E1 = częściowe skrypty przerwanych podagentów.
- Uwaga: w skryptach ESM Playwright importuj z `/opt/node-tools/node_modules/playwright/index.mjs` (NODE_PATH nie działa dla `import`).
- Podagenci uruchomieni 22.11 i przerwani limitem (nic nie oddali): R1 util/data/logic · R2 today/close/todayui · R3 core/sheet/app + XSS + index vs demo · R4 actions/salary/debts · R5 savings/analysis/usage/report/charts/inv · R6 advisor/advisorui · R7 guide/facts/cats/art/style.css/sw/manifest/demo · R8 scripts/workflows/firebase/bezpieczeństwo · L3 przepisy 2026 (etap 3) · E1 spis funkcji w demo (etap 1). Wznowić przez SendMessage albo uruchomić od nowa z tymi samymi zakresami (ścieżkę COMMON.md podać z `research_notes/audyt-robocze/`).
- Etap 8: badacze (funkcje aplikacji; polskie banki i PSD2; iOS PWA) – do ponownego uruchomienia przez skill deep-research, tytuł „Porównanie aplikacji budżetowych 2026”.
- Każde zgłoszenie podagenta sprawdzić samemu przed wpisaniem do raportu.
- 23.11 00:05: wznowieni R1, R2, R3, R4, L3 (SendMessage). Do wznowienia potem: R5, R6, R7, R8, E1 + badacze etapu 8.
