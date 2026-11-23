# Etap 5 – Szybkość (24.11.2026)

**Jak mierzone:** wersja demo w Chromium (Playwright), 390 px, procesor spowolniony 4× (CDP `setCPUThrottlingRate` – ok. iPhone średniej klasy), mediana 9 wywołań `render()` z wymuszonym układem strony. Duże dane: wpisy demo skopiowane 5× do każdego z 36 wcześniejszych miesięcy → **20 681 wpisów** (ok. 3× więcej niż 3 lata Waszego realnego używania; poprzedni audyt mierzył 6 364). Profil CPU: `Profiler` w CDP, 10 przerysowań. Skrypty: `perf.mjs`, `prof.mjs` w katalogu roboczym (poza repo).

## Wyniki
| Zakładka (`render()` + układ, CPU 4×) | demo (161 wpisów) | 20 681 wpisów | 22.11 (6 364 wpisy, przed etapem C) |
|---|---:|---:|---:|
| Budżet | 32 ms | 41 ms | 119 ms (kolejny `render`) |
| Rejestr | 33 ms | 41 ms | 178 ms* |
| Stałe | 21 ms | 22 ms | 87 ms* |
| Oszczędności | 47 ms | **85 ms** | 145 ms* |
| Konta | 20 ms | 19 ms | 99 ms* |
| Analiza (miesiąc) | 38 ms | 48 ms | 260 ms* |
| 🔔 Na dziś (otwarcie) | 6 ms | 5 ms | 169 ms* |
| Start (przeładowanie z cache, do kafelków) | 0,44 s | 1,76 s | 1,7–2,3 s (pierwsze wejście, bez cache) |
\* 22.11 mierzono całe przełączenie zakładki (z animacją i kotkami), więc liczby nie są w 100% porównywalne; kierunek jest jednoznaczny – po etapie C przerysowanie jest kilka razy szybsze.

**Pobierane pliki (SHELL):** 1,28 MB bez kompresji, własne JS + CSS + HTML **382 kB po gzip** (było ok. 370 kB). Największe po gzip: `guide.js` 46 kB, `actions.js` 33 kB, `app.js` 30 kB, `advisorui.js` 30 kB, `advisor.js` 28 kB. Ikony PNG 184 kB (tylko instalacja).
**Firestore przy starcie:** 10 subskrypcji (dokument domu, wszystkie miesiące, plany, 2× meta, 7 dokumentów `market` po kolei, zobowiązania, instrumenty, paski, cele) + `market/thermo` jednym `getDoc`. Zdjęcia i licznik użycia tylko na żądanie. Bez zmian od etapu C – dobrze.

## Gdzie idzie czas (profil, 20 681 wpisów, 10 przerysowań)
| Ekran | Razem | Najwięcej |
|---|---:|---|
| Oszczędności | 140 ms / przerysowanie | `fitNums` 29 ms (to w praktyce **układ strony**, wymuszony jednym odczytem – nieunikniony), parsowanie HTML 27 ms, **`agg` 16 ms**, `render` 12 ms, **`instDiffP` 11 ms**, reszta < 3 ms |
| Budżet | 68 ms / przerysowanie | `fitNums` (układ) 25 ms, parsowanie 18 ms, `render` 10 ms, reszta < 2 ms |

## Wnioski i propozycje
| # | Propozycja | Waga | Wysiłek | Zysk | Pochodzenie |
|---|---|---|---|---|---|
| 1 | 🆕 Oszczędności: zapamiętać `agg(…)` dla całego okresu i `instDiffP` dla tej samej listy wpisów (jak `liveOf`/`inPeriod`) | 💡 | S | −20% przerysowania Oszczędności przy dużych danych (dziś ok. 85 ms przy CPU 4×, przy realnych danych ok. 50 ms – niezauważalne) | 🆕 |
| 2 | HELP/NEWS (`guide.js` 46 kB gzip) i doradca (58 kB gzip) ładowane dopiero na żądanie | 💡 | S–M / M | −100 kB pobierania przy pierwszej instalacji i nowej wersji, ok. 10–25 ms startu na iPhonie | 🔁 (05 z 22.11, nr 3–4) |
| 3 | `market/maillog` i `market/autoval` subskrybowane na stałe, a potrzebne tylko w ⚙️ → 🤖 Automaty (napis „ostatni mail”, „wycena za …”) | 💡 | S | mniej przerysowań po pracy automatu (raz na dzień/miesiąc – znikomo) | 🆕 |

**Ocena:** po etapie C szybkość jest **dobra i nie wymaga pracy** – najwolniejszy ekran przy 3-krotności realnych danych to ok. 85 ms na spowolnionym procesorze. Pierwsze otwarcie przy dużej historii (1,8 s przy 20 tys. wpisów, demo czyta je z `localStorage`) w prawdziwej aplikacji zależy od cache Firestore – przy Waszych danych (setki wpisów miesięcznie) to nie problem. Nie zmieniałbym architektury (bez build stepu wystarcza).
