---
type: Decision
description: "PWA-first mobile strategy before Flutter — mobile support without a full rewrite."
title: "PWA Strategy — Mobile senza riscrittura"
tags: [decision, strategy, pwa, mobile, go-to-market]
created: 2026-07-11
updated: 2026-07-11
status: accepted
sources: ["raw/go-to-market/go-to-market.md"]
related: ["wiki/plans/go-to-market", "wiki/decisions/saas-readiness", "wiki/architecture/tech-stack"]
---

# Decision: PWA Strategy — Mobile senza riscrittura

Status: `accepted`

## Contesto

Servire utenti mobile senza riscrivere l'app in Flutter o React Native. L'obiettivo è andare sul mercato velocemente e testare la risposta del pubblico.

## Opzioni Considerate

1. **Riscrivere in Flutter** — 3-6 mesi di sviluppo, nessun feedback utente nel frattempo
2. **Rendere la webapp responsive + PWA** — 1-2 settimane, si può fare subito in parallelo al Phase 0

## Decisione

**Opzione 2 — PWA prima, Flutter come fase di scaling futuro.**

## Piano d'Attacco in 2 Step

### Step 1: Trasformare la webapp in PWA (Week 2)

Aggiungere alla webapp React esistente:

- **`manifest.json`** — nome, icona, tema colore, display `standalone`
- **Service Worker** — caching delle risorse statiche e dei dati Firestore in cache locale
- **Meta tag iOS** — `apple-touch-icon`, `apple-mobile-web-app-capable`
- **Meta tag Android** — `theme-color`, `mobile-web-app-capable`

Cosa si ottiene:
- Utenti italiani possono aggiungere l'app alla schermata Home da iPhone o Android
- Si apre a tutto schermo senza barra del browser
- Icona nel menu del telefono
- Dati in cache locale per funzionamento offline parziale
- **Sforzo: 1-2 giorni. Zero riscritture.**

### Step 2: Flutter come "Fase 2" di Scaling

Usare la webapp PWA per raccogliere i primi 50-100 utenti paganti.
Solo dopo validazione del mercato e flussi di cassa ricorrenti:

- Riscrivere in Flutter come **nuovo argomento di marketing** per scalare
- Giustificare un eventuale aumento di prezzo
- Portare l'esperienza nativa a chi la richiede

## Conseguenze

- Time-to-market immediato per mobile (PWA in giorni, non mesi)
- Feedback utente reale guida le decisioni su Flutter
- La PWA è un "cavallo di Troia" per conquistare smartphone italiani senza Dart
- Se la validazione fallisce, non si sono spesi mesi in una riscrittura inutile

## Priorità Immediate

1. Primo: blindare Firestore con la migrazione a sub-collection (Phase 1 del [[wiki/plans/go-to-market]])
2. Secondo: rendere la UI responsive per mobile
3. Terzo: aggiungere manifest.json + Service Worker

## Related

- Plan: [[wiki/plans/go-to-market]]
- Decision: [[wiki/decisions/saas-readiness]]
- Source: [raw/go-to-market/go-to-market.md](raw/go-to-market/go-to-market.md)
