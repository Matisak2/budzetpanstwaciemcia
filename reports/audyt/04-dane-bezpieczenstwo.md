# Etap 4 – Dane, bezpieczeństwo i niezawodność

Źródła:
- przeglądy R3 (zapis, dwa telefony, XSS) i R8 (automaty, zasady Firestore, repo), R4/R5 (kopia, import);
- moje sprawdzenia: prawdziwe SDK Firebase 10.14.1 w Node (bez łączenia z Firebase), service worker w Chromium, demo.

Surowe raporty: `research_notes/audyt-robocze/R3`, `R8` (poza git).

## Podsumowanie
| Obszar | Ocena |
|---|---|
| Utrata danych przy zwykłym używaniu | **Niskie ryzyko.** Usuwanie jest miękkie (`deleted:true` + 🗑️ 60 dni), a zapisy idą po id, jednym polem mapy. Cache offline Firestore działa, „Cofnij” jest prawie wszędzie |
| Kopia zapasowa | Mail z kopią co miesiąc + automatyczne sprawdzenie, że się wczytuje – **bardzo dobre**. Ale **„Wczytaj kopię” był zepsuty od 22.11** (🔴 K1, naprawione ✅5) – wykrył to dopiero ten audyt |
| Dwa telefony naraz | Dobrze po poprawkach z 21.11 (`posOf`, `mergeFields`). Zostały wąskie okna wyścigu (pasek offline na 2 telefonach, przeniesienie wpisu między miesiącami) – patrz niżej |
| Zasady Firestore | Poprawne: tylko dwa adresy w `households/main/**`, `secret/` niedostępny dla telefonów (kopia w `firebase/`). Czy w konsoli jest już wersja z ochroną `secret/` – **do potwierdzenia** (otwarty punkt w PLAN.md) |
| Sekrety w repo | **Brak** w treści i całej historii git. `apiKey` Firebase w kliencie jest publiczny z założenia. Adres Gmail Matiego jest w polu autora 23 commitów (metadane git) |
| XSS | **Nie znaleziono** (test z `<img onerror>` we wszystkich nazwach i notatkach na ~100 ekranach) |
| Service worker | Telefon **nie utknie** na pomieszanej wersji: nowa wersja pobiera komplet albo zostaje stara; stare cache są usuwane, a przeładowanie następuje tylko przy bezczynności (wyjątek: W17 w 02-kod.md) |
| Automaty | Idempotentne (`av`+RRRRMM, `maillog`, `pushlog`), zmiana czasu policzona dobrze, `keepPrev` trzyma ostatnią cenę. Błąd `market/eom` – naprawione ✅4 |

## 🔴 R8-1 Podsumowania mailowe mogą trafić do obcej osoby – PILNE, decyzja/1 kliknięcie Matiego
- **Miejsce:** `scripts/mail.mjs:25–26`. Odbiorcy podsumowania miesiąca i roku = **każde konto Firebase Authentication** (`getAuth().listUsers(20)`) + adresy z `users/{uid}`.
- **Ryzyko:** klucz `apiKey` jest publiczny (to normalne). Jeśli w Firebase jest włączona rejestracja e-mail/hasło (**domyślnie jest**), obcy może założyć konto na swój adres przez REST API Firebase. Do danych w aplikacji się nie dostanie, bo blokują go zasady Firestore. Ale **1. dnia miesiąca automat wyśle mu pełne podsumowanie finansów**: kwoty, sklepy, majątek, pożyczki. Automat działa kontem usługi, więc zasady go nie ograniczają.
- **Pewność:** kod potwierdzony. Czy rejestracja jest otwarta – nie mogę sprawdzić (konsola Firebase).
- **Co zrobić:**
  1. **Mati, 2 minuty:** Firebase Console → Authentication → Settings → User actions → odznaczyć **„Enable create (sign-up)”**. Wasze dwa konta działają dalej. Zostawiłem to Tobie, bo to ustawienie konta, a nie kod.
  2. **Kod (S):** wysyłać tylko na adresy z `users/{uid}` (zapisują je Wasze telefony, a obcy nie może tam pisać – zasady Firestore) i usunąć `listUsers`. Nie zrobiłem tego sam, bo wysyłka do wszystkich kont była zamierzona (komentarz w kodzie). Gdyby któreś z Was nie miało dokumentu `users`, przestałoby dostawać maile – trzeba to najpierw sprawdzić.
  3. Opcjonalnie w zasadach Firestore: `request.auth.token.email_verified == true`.

## 🟠 Ważne
| # | Miejsce | Problem | Stan / propozycja |
|---|---|---|---|
| D1 | `js/core.js:180` | „Wczytaj kopię” nie działał (błąd SDK przy `mergeFields`) | ✅5. **Wniosek:** atrapa Firestore w demo była łagodniejsza niż SDK – teraz rzuca ten sam błąd. **Propozycja (S):** do robota dodać mały test na prawdziwym pakiecie `firebase@10.14.1` w Node (jak skrypt R3: emulator na nieistniejącym porcie, błędy walidacji przychodzą od razu) dla `saveCfg`, `merge` z `deleteField` |
| D2 | `scripts/market.mjs:70` | `market/eom` nigdy się nie zapisywał | ✅4 (+ eslint dla `scripts/`) |
| D3 | `scripts/market.mjs:55–100` | **Brak kontroli „dziwnej” ceny** przed zapisem jednorazowej wyceny końca miesiąca (`av`) i historii. Parsery odrzucają HTML, „N/D” i zero, ale nie łapią ceny w złej skali (np. pensy zamiast funtów) ani skoku | p. S: pomijać cenę różną od poprzedniej o > 40% w ciągu doby (zostaje poprzednia, w dzienniku liczba odrzuconych) |
| D4 | `actions.js:428, 458` | ponowne wczytanie **listy wpisów** albo starej wersji wskrzesza usunięte wpisy | p. S (W11 w 02-kod.md) |
| D5 | `salary.js:117`, `actions.js:226` | „Przywróć”/„Cofnij” opłaty stałej może ją zdublować | p. S (W10) |

## 🟡 Drobne
- **R8-5** `scripts/mail.mjs:31,38,42`: `sendMail` bez `try/catch` – przy błędzie SMTP wyjątek z adresami odbiorców (np. Werci) może trafić do **publicznego** dziennika GitHub Actions (p). S: złapać i wypisać tylko kod błędu.
- **R8-7** Automaty z sekretami (`FIREBASE_SA`, hasło Gmail) instalują `firebase-admin`, `nodemailer`, `web-push` przez `npm install` z wersją, ale **bez lockfile i bez `--ignore-scripts`**; `market.yml` ma `contents: write` na całe zadanie. Ryzyko łańcucha dostaw jest małe, ale łatwe do zmniejszenia (S): `npm ci` z zatwierdzonym `package-lock.json` albo `--ignore-scripts`, `contents: write` tylko w kroku znaku życia.
- **R8-4** Adres Gmail Matiego w metadanych 23 commitów. Przyszłe commity: GitHub → Settings → Emails → „Keep my email addresses private” (adres `@users.noreply.github.com`). Historii nie warto przepisywać.
- **R8-10** `pushlog` zapisywany dopiero po pętli wysyłki – po awarii w połowie możliwe podwójne powiadomienie; `market/rates` zapisywany `set` bez merge kasuje pole `sched`; kopia mailem do Matiego wybiera adres po `who=='Mati'` – gdy oba telefony przypisano do Matiego, kopia może pójść na adres Werci.
- **Dwa telefony – wąskie okna** (p/?): przeniesienie wpisu na inny miesiąc to 2 zapisy bez `writeBatch` (`sheet.js:259/263`); `saveSlip` offline na 2 telefonach może dać 2 żywe wpływy z paska. Propozycja: strażnik porządku szuka „dwóch żywych wpisów z tym samym id” i „dwóch wpływów z paska tego samego źródła w miesiącu” (S).
- **R3** `w()`/`putTx` zawsze zwracają `true` – kod nie wie, że zapis się nie udał (Firestore offline i tak go dośle; problem tylko przy błędach walidacji/uprawnień).
- **R7** czcionka Nunito offline – arkusz Google Fonts bez `crossorigin` nie trafia do cache (p).
- **R8-9** `tests/restore.mjs` dla planów, pasków, zobowiązań, instrumentów porównuje **liczby**, nie treść; nie porównuje `roundM`, `incM`, `yearM`, `projM`, `remM` (one są w kopii, ale test by nie zauważył ich zgubienia). S: porównywać głęboko.

## Zdjęcia paragonów
W porządku:
- zmniejszane w telefonie do ≤ 180 kB;
- czytane `getDoc` dopiero po otwarciu wpisu;
- usunięty wpis zachowuje zdjęcia;
- kopia `.json` i mail są bez zdjęć (zgodnie z założeniem); jest „📷 Pobierz kopię ze zdjęciami”.

Ryzyko: dokument Firestore ma limit 1 MiB, a zdjęcie ≤ 180 kB w base64 to ~240 kB, więc jest bezpiecznie. Kopii zdjęć nie ma nigdzie poza Firebase i ręcznym pobraniem. **Propozycja:** raz na kwartał przypomnienie „📷 Pobierz kopię ze zdjęciami” (S) albo NAS (już w „Później”).

## Gdy źródło danych automatu padnie
- **NBP, stooq, Yahoo, GUS, analizy.pl, obligacjeskarbowe.pl:**
  - `keepPrev` zostawia ostatnią znaną wartość ze starą datą;
  - `automatStale` po kilku dniach pokazuje „Automat nie pobiera danych”;
  - parsery odrzucają HTML i „N/D”.
- **Słabe miejsce:** cena w złej skali – zob. D3.
- **Limity IKE/IKZE:** automat tylko proponuje, a aplikacja pyta przed zmianą (dobrze).
