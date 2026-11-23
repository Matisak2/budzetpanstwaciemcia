# Etap 4 – Dane, bezpieczeństwo, niezawodność (24.11.2026)

Poprzedni audyt (22.11) przeszedł ten obszar w całości (`00-poprzedni.md`). Od tego czasu zrobione: maile tylko do `users/{uid}` + `try/catch` (R8-1, R8-5), rejestracja w Firebase wyłączona (Mati), `--ignore-scripts` i zapis do repo tylko w zadaniu „znak życia” (R8-7), zasady Firestore z ochroną `secret/` **opublikowane 23.11** (39/39 prób – `PLAN.md`), `fixedDupStop`, import bez wskrzeszania, `reassignAcc` po „Usuń”, przeniesienie wpisu jednym `writeBatch` (`putTxs`), strażnik `twin:`/`slip2:`, kontrola skoku ceny (`dropJumps`), przeładowanie nie przy otwartym pasku/wyrównaniu/zamknięciu, atrapa Firestore = SDK (`tests/sdk.mjs`), głęboki `restore.mjs`, `navigator.storage.persist()`.

## Podsumowanie
| Obszar | Ocena 24.11 |
|---|---|
| Utrata danych przy zwykłym używaniu | **Niskie ryzyko** – miękkie usuwanie + 🗑️ 60 dni (także cele), zapis po id, „Cofnij” prawie wszędzie; trwała pamięć telefonu prosi iOS, żeby nie czyścił niewysłanych wpisów |
| Kopia zapasowa | **Bardzo dobrze**: mail co miesiąc + automatyczne wczytanie do czystego demo i porównanie pole po polu; „Wczytaj kopię” działa na prawdziwym SDK (test robota) |
| Dwa telefony naraz | Dobrze. Zostały świadomie: pasek na 2 telefonach offline (strażnik `slip2:`), `putTx` zawsze `true` |
| Zasady Firestore | ✅ tylko dwa adresy, `secret/` niedostępny dla telefonów – **w konsoli od 23.11** (kopia: `firebase/firestore.rules`) |
| Sekrety w repo | **Brak** w commitach od 22.11 (sprawdzone: klucze prywatne, adresy e-mail). `apiKey` Firebase w kliencie jest publiczny z założenia. Nowe commity mają autora `noreply@anthropic.com` |
| XSS | Nowe miejsca z tekstem użytkownika (`pbudH` – nazwy pozycji w szczegółach „Czy starczy?”) używają `esc()`; poprzedni test `<img onerror>` na ~100 ekranach bez wyników |
| Service worker | Bez zmian w logice od 22.11 (tylko numer `CACHE`) – telefon nie utknie na pomieszanej wersji |
| Automaty | Idempotentne; `dropJumps` chroni wycenę końca miesiąca przed ceną w złej skali; `keepPrev` trzyma ostatnią znaną wartość |

## Zgłoszenia
| # | Miejsce | Problem | Waga · pewność | Pochodzenie | Propozycja |
|---|---|---|---|---|---|
| B1 | `.github/workflows/mail.yml:52` | Krok „Sprawdzenie, czy kopia się wczytuje” instaluje `playwright@1.49.1` **bez `--ignore-scripts`**, gdy na dysku maszyny leży już pełna kopia Waszych finansów (`BACKUP_FILE`). Sekretów w tym kroku nie ma, a wersja jest przypięta, więc ryzyko jest małe – ale to jedyne miejsce, gdzie automat z Waszymi danymi uruchamia skrypty instalacyjne pakietu (wszystkie inne `npm install` w automatach mają `--ignore-scripts`). | 🟡 · potwierdzone (kod) | 🆕 | `--ignore-scripts` (Playwright ich nie potrzebuje – przeglądarkę instaluje osobny `npx playwright install`); S |
| B2 | `mail.yml:53–54` | Przy **czerwonym** sprawdzeniu `rm -f "$BACKUP_FILE"` się nie wykona (powłoka GitHuba działa z `set -e`, więc kończy na błędzie `node`). Maszyna GitHuba i tak jest kasowana po zadaniu, a plik nie trafia do artefaktów – realnego wycieku nie ma; komentarz w pliku obiecuje jednak „od razu usuwany”. | 🟡 · potwierdzone (kod) | 🆕 | `node … || s=$?` albo `trap 'rm -f …' EXIT`; S |
| R8-10a | `scripts/notify.mjs:37` | `pushlog` zapisywany dopiero po pętli wysyłki – po awarii w połowie możliwe podwójne powiadomienie | 🟡 · prawdopodobne | 🔁 | zapis przed pętlą (raz dziennie i tak); S |
| R8-10b | `scripts/market.mjs:69` | `market/rates` zapisywany `set` bez merge – ręczne „Run workflow” po 18:00 kasuje `sched`, więc zaplanowane uruchomienie tego dnia pobierze dane drugi raz | 🟡 · potwierdzone (kod) | 🔁 | zachować `prev.sched`; S (tylko zbędna praca automatu) |
| R8-10c | `scripts/mail.mjs:26` | kopia do „Matiego” = adres z dokumentu `users` z `who:'Mati'`; gdy oba telefony przypisano kiedyś do Matiego, kopia może pójść na adres Werci | 🟡 · prawdopodobne (dziś `lock` przypisuje na stałe) | 🔁 | wybierać `who=='Mati'&&lock`; S |
| – | `js/core.js` `w()`/`putTx` | zawsze `true` | 🟡 | 🔁 zostawione świadomie | – |
| – | `salary.js` `saveSlip` | pasek na 2 telefonach offline | 🟡 | 🔁 zostawione świadomie (strażnik `slip2:`) | – |

Nowe znaleziska podagentów z `scripts/` i zapisu (etap 2) – w `02-kod.md`.
