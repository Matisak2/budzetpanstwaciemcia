# Budżet M&W

Wspólna aplikacja budżetu domowego Matiego i Werci – PWA bez frameworków (HTML, CSS, moduły ES w `js/`), dane w Firebase (Firestore).

- Aplikacja: https://matisak2.github.io/budzetpanstwaciemcia/ · wersja demo: https://matisak2.github.io/budzetpanstwaciemcia/demo/
- Opis architektury, modelu danych i zasad pracy: `CLAUDE.md`; plan rozwoju: `PLAN.md` (historia w `PLAN-archiwum.md`); doradca inwestycyjny: `DORADCA-*.md`.
- Automaty (GitHub Actions): kursy i ceny (`market.yml`), powiadomienia (`notify.yml`), maile z kopią i podsumowaniem (`mail.yml`), testy przed publikacją (`test.yml`).
- Testy lokalnie: `npx eslint -c tests/eslint.config.mjs js/ demo/ sw.js`, `node tests/calc.mjs`, `node tests/imports.mjs`, `node tests/cache.mjs HEAD~1`, `node tests/screens.mjs`.
