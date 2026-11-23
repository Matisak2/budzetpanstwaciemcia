# Etap 0 – Rozliczenie poprzedniego audytu (`reports/audyt/`, 22–23.11.2026)

Źródła: `PLAN.md` (część 9, etapy A–E), `reports/audyt/NAPRAWIONE.md`, „Stan po Etapie B” w `02-kod.md` i `07-testy.md`, `git log 0936f93..3c59207`. Każdą sprawę ⏳ sprawdziłem w obecnym kodzie (miejsce podane).

Legenda: ✅ zrobione · ❌ odrzucone (decyzja Matiego) · ⏳ otwarte (nadal aktualne) · 💤 nieaktualne / odłożone bez terminu.

## Poprawki w trakcie audytu (NAPRAWIONE 1–14)
| # | Sprawa | Status |
|---|---|---|
| 1–14 | „Nie starczy” bez potrąceń, „Wiem” po 1., km, `market/eom`, „Wczytaj kopię”, „Aktualizuj wartości”, 29.02, „Nie wiem” = NaN, `/demo`, marża, starszy zakup, klawiatura, tytuł kaskady, HELP | ✅ commity `8e9c4ff`…`4c5ea44` (22.11), CACHE v99–v102 |

## 🔴 / 🟠 z raportu (p. 3)
| # | Sprawa | Status |
|---|---|---|
| R8-1 | maile do każdego konta Firebase | ✅ Etap A (Mati: rejestracja była wyłączona; `mail.mjs` – tylko `users/{uid}`) |
| W8 | „co 2 lata” bez `last` | ✅ Etap A (`yearLastFor`, strażnik `ref:yl:`) |
| W9 | przepinanie konta przed „Usuń” | ✅ Etap A (`reassignAcc` zwraca funkcję) |
| W10 | „Przywróć”/„Cofnij” dubluje opłatę | ✅ Etap A (`fixedDupStop`) |
| W11 | import wskrzesza usunięte | ✅ Etap A |
| W12 | termometr w zł nigdy się nie włączy | ⏳ **decyzja Matiego** – `advisor.js:410` nadal wymaga historii kursów ≥ 80% historii cen, a `scripts/market.mjs:108` dopisuje tylko dzisiejszy kurs; brak dociągnięcia historii EUR z NBP |
| W13 | `advTodo` połyka błędy | ✅ Etap C |
| W14 | doradca liczony przy każdym przerysowaniu | ✅ Etap C |
| W15 | q1 (rok urodzenia) nieużywane | ✅ Etap C |
| W16 | transze przy pustym portfelu | ⏳ **decyzja Matiego** – `advisor.js:346` `tranchesP`: `!(base>0)` → brak transz |
| W17 | przeładowanie gubi pasek / wyrównanie / zamknięcie | ✅ Etap A |
| D3 | kontrola skoku ceny | ✅ Etap A (`dropJumps`) |
| Z3 | stałe 2026 działają w 2027 | ⏳ **termin: styczeń 2027** – `pay.js:5` `ZUS_LIMIT`, `TAX_THR` bez roku; `JDG` bez linijki 2027 |

## 🟡 z `02-kod.md`, `03-przepisy.md`, `04-dane-bezpieczenstwo.md`
| Sprawa | Status |
|---|---|
| `payPatternP` 30. dnia, `typedToday` po `ts`, PIT-28 na osobę, `ref:i:`, `twin:`/`slip2:` | ✅ Etap A |
| `payDateP` – święta nie przesuwają wypłaty | ⏳ **decyzja Matiego** (pytanie 8) – `today.js:168` tylko `isWknd` |
| `paidInYear` – przeniesienie IKE→IKE liczy się do limitu | ⏳ zostawione świadomie (Etap B) – `inv.js:112` nadal liczy każdy `tr` na konto; rzadkie |
| `instDiffP`, partia z przyszłą datą, Limity z `sav`, `cascSurplus` 1., `fmtN` −0, `calcAmt` | ✅ Etap B |
| `w()`/`putTx` zawsze `true` | ⏳ zostawione świadomie (Etap B) |
| przeniesienie wpisu bez `writeBatch` | ✅ Etap B (`putTxs`) |
| `saveSlip` na 2 telefonach offline | ⏳ zostawione świadomie – pilnuje strażnik `slip2:` |
| `posOf` w projektach/przypomnieniach, „Cofnij” zobowiązania, „Ta pensja już jest?”, `mergeSub` + `pay`, `reassignAcc` 2 reguły, `delSlip` tekst | ✅ Etap B |
| `editAcc` – konto używane tylko przez wpisy w 🗑️ | ⏳ zostawione świadomie – strażnik `acc:` |
| Analiza: przyszły miesiąc, Wrapped (waluty, projekty), Mati↔Wercia, „Majątek – teraz”, dwie średnie, `hbarsH` < 0, CSV | ✅ Etap B |
| Doradca R6: `whereP` mutuje, q43, `retireP`, `thermoP` pusty, „(do założenia)”, piaskownica pełna | ✅ Etap B |
| Google Fonts `crossorigin`, `USAGE_CAT` braki | ✅ Etap B |
| Kotki rysowane od nowa poza Budżetem | ✅ Etap C (`mountCats`) |
| HELP „+ Przychód” | ✅ (NAPRAWIONE 14) |
| 6 nadpisanych reguł CSS, ~50/150 `export`, `ZWROT_PIT`, `curMap`, `outProj`, `tNumUI` | ✅ Etap B |
| atrapa `setDoc` bez merge z `deleteField` | ✅ Etap B (`tests/sdk.mjs`) |
| Z1 dzieło bez PIT-2 | ⏳ **pytanie 9** (czy ktoś ma dzieło) – `pay.js:76` nadal bez `pit2` |
| Z2 próg 100 000 zł najmu osobno dla każdego mieszkania | ⏳ tylko gdy dotyczy – `today.js:295` liczy `before`/`got` po jednym `f.id` |
| OKI powyżej 100 tys. zł / lokaty ponad 25 tys. zł – `taxFree` | ⏳ 💡 (dziś bez znaczenia; OKI rusza 1.01.2027) – `inv.js:20` |
| Brak testów: KUP 300, zlecenie 50%, najem 12,5%, IKZE-JDG, wykup COI/TOS/ROR, dzieło PIT-2 | ⏳ sprawdzę w etapie 7 |
| R8-5 `sendMail` bez try/catch | ✅ Etap A |
| R8-7 `--ignore-scripts`, `contents: write` | ✅ Etap A |
| R8-4 adres Gmail w metadanych commitów | 💤 przyszłe commity robi Claude (`noreply@anthropic.com` – sprawdzone w 40 ostatnich); historii nie przepisujemy |
| R8-9 `restore.mjs` głęboko | ✅ Etap B |
| R8-10 `pushlog` zapisywany po pętli wysyłki | ⏳ `scripts/notify.mjs:37` – nadal po pętli (podwójne powiadomienie tylko po awarii w połowie) |
| R8-10 `market/rates` `set` bez merge kasuje `sched` | ⏳ `market.mjs:69` – ręczne uruchomienie wieczorem usuwa `sched`, więc zaplanowane tego dnia pobierze drugi raz (tylko zbędna praca) |
| R8-10 kopia mailem do „Mati” wg `who` | ⏳ `mail.mjs:26` – gdy oba dokumenty `users` mają `who:'Mati'`, kopia może pójść na drugi adres (dziś `lock` przypisuje na stałe, więc mało prawdopodobne) |

## Propozycje i plan A–F
| Sprawa | Status |
|---|---|
| A: wszystkie punkty | ✅ (PLAN.md część 9, Etap A) |
| B: testy, poduszka, mail = aplikacja, obligacje, drobne, porządki | ✅ |
| C: `fitNums`, kotki, doradca pamiętany, termometr bez subskrypcji | ✅ |
| C: HELP/NEWS i doradca ładowane na żądanie | ⏳ niski priorytet – `guide.js` (127 kB) wciąż importowany przy starcie przez `core.js` i `app.js` |
| D: fokus kwoty po ＋, konto z podpowiedzi notatki | ❌ Mati 23.11 „nie robimy” |
| D: „Czy starczy?” zwinięte, Projekty | ✅ / ❌ (Projekty zostają na Budżecie – Mati 23.11) |
| D: zamknięcie „Pomiń resztę” | ❌ Mati 23.11 |
| D: „💡 Podpowiedzi” w Na dziś, cele dotyku 44 px | ✅ |
| D: VoiceOver / `aria-label` | ❌ Mati 23.11 |
| D: Doradca D5–D7 schować; Wrapped + Podsumowanie roku | ⏳ odłożone **po danych z „Czego używamy”** |
| UX: kaskada tylko w kroku 3 zamknięcia (dziś też karta w Oszczędnościach) | ⏳ `app.js:236` nadal `cascadeH(o)` w Oszczędnościach osoby |
| UX: kalkulator obligacji i zapisane porady zwinięte pod „Więcej” na stronie „Gdzie” | ⏳ (bez decyzji) |
| UX: JDG/zlecenie/dzieło za „Inny rodzaj umowy” | ⏳ pytanie 9 bez odpowiedzi |
| UX: kontrast zielonych procentów w pigułkach | ⏳ do sprawdzenia w etapie 6 |
| E: liczba na ikonie | ❌ Mati 23.11 „na razie nie” |
| E: `navigator.storage.persist()`, instrukcja widżetu Skrótów | ✅ (`1b76051`) |
| E: kwartalne przypomnienie o kopii ze zdjęciami | ⏳ nie wybrane (Mati wybrał 2 i 3) |
| Reguły kategoryzacji ustawiane samemu | 💤 „nie teraz” (bez importu z banku) |
| Import z banku / Enable Banking | ❌ „Rezygnujemy” (PLAN.md), potwierdzone w poprzednim audycie |
| F: AI – komentarz kotków w mailu | ⏳ „może później” |
| AI: lupa 🔍 z sumą znalezionych wpisów, lepsza reguła `noteSub` | ⏳ 💡 (S) |
| Zasada „krótsze linie w nowym kodzie” | ⏳ zasada – nie wpisana do `CLAUDE.md`; nowy kod z etapów A–E nadal ma długie linie |
| Testy: komentarz o zależnych ekranach w `screens.mjs`, ekrany o innej porze dnia | ⏳ (etap 7) |
| Styczeń 2027 – przepisy (lista w `03-przepisy.md`) | ⏳ **termin: styczeń 2027** (przeniesiona do `03-przepisy.md` tego audytu; IKE/IKZE 2027 już są) |
| Badanie: polskie aplikacje banków, Kontomierz, Revolut, Enable Banking – polskie banki | ⏳ niesprawdzone (etap 8) |

## Pytania do Matiego z poprzedniego raportu
| # | Pytanie | Status |
|---|---|---|
| 1 | Rejestracja w Firebase, dokumenty `users` | ✅ (Etap A: rejestracja wyłączona; maile tylko do `users`) |
| 2 | Zrzut „📊 Czego używamy” za 2–3 tygodnie | ⏳ (licznik działa od 31.10; poproszę ponownie) |
| 3 | Termometr w zł czy euro | ⏳ |
| 4 | Doradca D5–D7 schować | ⏳ „może później, po danych” (Etap D) |
| 5 | Zamknięcie „Pomiń resztę” | ❌ |
| 6 | „Co 2 lata” – pierwszy termin | ✅ (najbliższy taki miesiąc) |
| 7 | Transze przy pierwszej dużej wpłacie | ⏳ |
| 8 | Wypłata w święto | ⏳ |
| 9 | JDG / zlecenie / dzieło | ⏳ |
| 10 | Kotki: kod czy gotowe obrazki | 💤 Etap C rozwiązał koszt rysowania (`mountCats`) – pytanie straciło powód |
| 11 | Nowe funkcje z porównania | ✅ wybrane 2 i 3 (Etap E); 1 – ❌ |

**Do dalszej pracy (⏳):** W12, W16, Z1, Z2, Z3 + lista na styczeń, święta w `payDateP`, IKE→IKE, `putTx` zawsze `true`, pasek offline, `editAcc`, OKI powyżej 100 tys., R8-10 (3 sprawy), HELP/NEWS na żądanie, D5–D7 i Wrapped (po danych), kaskada w 2 miejscach, kalkulator obligacji zwinięty, JDG ukryte, kontrast pigułek, kopia ze zdjęciami, AI w mailu, lupa z sumą, krótsze linie, testy (lista z etapu 7), badanie (niesprawdzone), pytania 2, 3, 4, 7, 8, 9.
