---
title: "Monitoraggio Investimenti e Proiezioni Finanziarie — Guida Utente"
tags: [feature, investment, projections, guide, italiano]
created: 2026-06-27
updated: 2026-06-27
status: active
sources: ["raw/FEATURES-GUIDE.it.md"]
related: ["features/investment-tracking-guide", "features/investment-tracking", "features/financial-projections", "features/multi-broker-architecture", "features/crud-etf-transactions", "features/pac-automation", "features/historical-snapshots", "features/tax-inflation-modeling", "features/ticker-validation"]
---

# Guida Utente: Monitoraggio Investimenti e Proiezioni Finanziarie

## 1. Monitoraggio Investimenti (`/invest`)

Gestisci un portafoglio **multi-broker** di ETF con liquidità, transazioni di acquisto/vendita, **PAC automatizzato** e aggiornamento dei prezzi di mercato.

### Per Iniziare

1. **Attiva il modulo**: Vai su **Impostazioni** (`/config`) → *Moduli Attivi* → attiva **Gestione Investimenti**.
2. **Configura i broker**: Nella pagina Investimenti, clicca **Impostazioni** per aggiungere uno o più conti broker. Per ogni broker compila:
   - **Nome Broker** — es. *Trade Republic*, *Degiro*, *Fineco*
   - **Capitale Iniziale (€)** — somma totale depositata inizialmente presso il broker
   - **PAC Mensile (€)** — importo del tuo Piano di Accumulo Capitale ricorrente (il sistema ti chiederà di eseguirlo ogni mese)
   - **Ticker ETF** — ticker in formato Yahoo Finance, es. `SWDA.MI` (Milano), `VWCE.DE` (Xetra). Il sistema convalida il formato al salvataggio.
   - **Tasso d'Interesse (%)** — interesse annuale sulla liquidità non investita (es. 2.0 per 2% APY)

Puoi aggiungere, modificare o eliminare conti broker in qualsiasi momento tramite la stessa finestra Impostazioni.

### Filtrare per Broker

Usa il menu **Seleziona Broker** nell'intestazione della pagina:
- **Tutti i Broker (Aggregato)** — patrimonio netto totale su tutti i conti
- **Broker specifico** — liquidità, posizioni e rendimenti per singolo broker

### Aggiungere Transazioni

Passa alla scheda **Capitale Investito** e clicca **Aggiungi Transazione**:

| Campo | Note |
|-------|------|
| **Conto Broker** | Seleziona a quale broker appartiene la transazione |
| **Ticker** | Precompilato dalla configurazione broker, modificabile |
| **Tipo** | `Acquisto` o `Vendita` |
| **Quote** | Supporta frazioni (es. `0.523`) |
| **Prezzo (€)** | Prezzo per quota al momento della transazione |
| **Totale (€)** | Calcolato come `quote × prezzo`, modificabile manualmente |
| **Data** | Preimpostata a oggi |
| **Conto** | Conto finanziario collegato |
| **Descrizione** | Testo libero, es. *"Acquisto mensile Gen 2026"* |
| **Note** | Note opzionali |

### Modificare ed Eliminare Transazioni

- **Modifica**: Clicca l'icona ✏️ nella Tabella Posizioni per modificare una transazione esistente. La finestra si apre con i dati precompilati.
- **Elimina**: Clicca l'icona 🗑️ per rimuovere una transazione. Il sistema ricalcola automaticamente il portafoglio (ripristina quote, ricalcola PMC, aggiorna liquidità, registra nuovo snapshot).

### Automazione PAC

Quando configuri un **PAC Mensile (€)** su un conto broker, il sistema rileva automaticamente l'inizio del mese e se il giorno PAC (predefinito: 1°) è passato:

1. Un badge **PAC in Sospeso** appare nell'intestazione della pagina
2. Cliccalo per aprire il **Dialogo di Conferma PAC** (nome broker, importo, data)
3. Scegli **Conferma & Esegui** (recupera prezzo, crea `Acquisto Generato dal Sistema`) o **Ignora** (salta mese)

Il sistema controlla una volta al mese per broker — nessun duplicato.

### Leggere la Dashboard

**Scheda 1 — "Liquidità"**: Carta liquidità e interessi (nome/i broker, saldo liquidità, interessi mensili, APY) + grafico valore portafoglio con pulsanti `1M` / `6M` / `1A` / `TUTTO`.

**Scheda 2 — "Capitale Investito"**: Carte riepilogo, Tabella Posizioni (con azioni Modifica/Elimina), Grafico a Ciambella, Grafico Portafoglio.

### Aggiornare i Prezzi

Clicca **Aggiorna Prezzi** per ottenere gli ultimi prezzi per tutti i ticker posseduti. Prezzi ritardati fino a 15 minuti.

### Note

- Supporta **molteplici conti broker**
- Transazioni **modificabili ed eliminabili** con ricalcolo automatico
- **Automazione PAC** per acquisti ricorrenti mensili
- Snapshot del portafoglio salvati su Firestore per **grafici multi-dispositivo**
- Prezzi storici non memorizzati

---

## 2. Proiezioni Finanziarie (`/projections`)

Simula la crescita degli investimenti a lungo termine (1–50 anni) con interesse composto. Completamente lato client.

### Parametri di Input

| Parametro | Intervallo | Predefinito | Descrizione |
|-----------|------------|-------------|-------------|
| **Orizzonte Investimento** | 1–50 anni | 20 | Per quanti anni simulare |
| **Rendimento Annuo ETF** | 0–20% | 7% | Rendimento annuale atteso |
| **Tasso Interesse Liquidità** | 0–10% | 2% | Interesse sulla liquidità |
| **Capitale Iniziale (€)** | ≥ 0 | 0 | Investimento iniziale una tantum |
| **PAC Mensile (€)** | ≥ 0 | 200 | Importo investito ogni mese |
| **Flusso Annuale (€)** | ≥ 0 | 0 | Deposito annuale dal 2° anno |

### Adeguamento all'Inflazione

Attiva **"Adequa all'inflazione (2%)"** per vedere il potere d'acquisto reale:

- **SPENTO** (default): Proiezioni nominali (valore facciale)
- **ACCESO**: Linea `Patrimonio Netto` mostra valore reale. Linea tratteggiata rossa **Valore Nominale** come sovrapposizione. Carta **Capitale Finale Reale** nel riepilogo.

Tasso 2% annuale con capitalizzazione mensile. Stime fiscali sui guadagni nominali.

### Simulazione

Ciclo mensile per l'intero orizzonte:
1. Flusso annuale aggiunto alla liquidità (dal 2° anno)
2. Liquidità matura interessi (capitalizzazione mensile)
3. PAC trasferito da liquidità a ETF
4. ETF cresce al tasso configurato (capitalizzazione mensile)
5. Se inflazione attiva, valori divisi per fattore cumulativo
6. Valori arrotondati a numeri interi

### Grafico

- **Area indaco** — Patrimonio Netto: reale con inflazione, nominale senza
- **Linea verde tratteggiata** — Totale Investito
- **Linea rossa tratteggiata** (con inflazione) — Sovrapposizione Valore Nominale

### Carte di Riepilogo

| Carta | Cosa Mostra |
|-------|-------------|
| **Capitale Finale** | Patrimonio netto a fine orizzonte |
| **Interessi Totali Maturati** | Profitto (patrimonio − investito) |
| **Tasse Stimate (26%)** | 26% imposta sulle plusvalenze |
| **Capitale Finale Reale** | Capitale corretto per inflazione (solo con toggle attivo) |

### Precompilazione Intelligente

Se il broker è configurato in Investimenti, la pagina Proiezioni carica automaticamente PAC, capitale iniziale e tasso d'interesse. Con più broker, utilizza valori aggregati.

### Note

- Calcoli lato client (nessun salvataggio Firestore)
- Deterministiche — stessi input, stesso output
- Tassa 26% fissa su plusvalenze (regime italiano)
- Inflazione disattivata per default; attivala per potere d'acquisto reale

---

**English version:** [[features/investment-tracking-guide]]

## Correlate

- [[features/investment-tracking]]
- [[features/financial-projections]]
- [[features/multi-broker-architecture]]
- [[features/crud-etf-transactions]]
- [[features/pac-automation]]
- [[features/historical-snapshots]]
- [[features/tax-inflation-modeling]]
- [[features/ticker-validation]]
- Fonte: [raw/FEATURES-GUIDE.it.md](raw/FEATURES-GUIDE.it.md)
