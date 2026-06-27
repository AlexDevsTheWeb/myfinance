---
title: "Monitoraggio Investimenti e Proiezioni Finanziarie — Guida Utente"
tags: [feature, investment, projections, guide, italiano]
created: 2026-06-27
updated: 2026-06-27
status: active
sources: ["raw/FEATURES-GUIDE.it.md"]
related: ["features/investment-tracking-guide", "features/investment-tracking", "features/financial-projections"]
---

# Guida Utente: Monitoraggio Investimenti e Proiezioni Finanziarie

## 1. Monitoraggio Investimenti (`/invest`)

Gestisci un portafoglio mono-ETF con liquidità del broker, transazioni di acquisto/vendita e aggiornamento dei prezzi di mercato.

### Per Iniziare

1. **Attiva il modulo**: Vai su **Impostazioni** (`/config`) → *Moduli Attivi* → attiva **Gestione Investimenti**.
2. **Configura il broker**: Nella pagina Investimenti, clicca **Impostazioni** e compila:
   - **Nome Broker** — es. *Trade Republic*, *Degiro*
   - **Capitale Iniziale (€)** — somma totale depositata inizialmente presso il broker
   - **PAC Mensile (€)** — importo del tuo Piano di Accumulo Capitale ricorrente
   - **Ticker ETF** — ticker in formato Yahoo Finance, es. `SWDA.MI`, `VWCE.DE`
   - **Tasso d'Interesse (%)** — interesse annuale sulla liquidità non investita

### Aggiungere Transazioni

Passa alla scheda **Capitale Investito** e clicca **Aggiungi Transazione**:

| Campo | Note |
|-------|------|
| **Ticker** | Precompilato dalla configurazione broker, modificabile |
| **Tipo** | `Acquisto` o `Vendita` |
| **Quote** | Supporta frazioni (es. `0.523`) |
| **Prezzo (€)** | Prezzo per quota al momento della transazione |
| **Totale (€)** | Calcolato automaticamente come `quote × prezzo`, modificabile manualmente |
| **Data** | Preimpostata a oggi |
| **Conto** | Conto finanziario collegato |
| **Descrizione** | Testo libero, es. *"Acquisto mensile Gen 2026"* |
| **Note** | Note opzionali |

### Leggere la Dashboard

**Scheda 1 — "Liquidità"**: Carta liquidità e interessi (nome broker, saldo liquidità, interessi mensili, APY) + grafico valore portafoglio con pulsanti `1M` / `6M` / `1A` / `TUTTO`.

**Scheda 2 — "Capitale Investito"**: Carte riepilogo (Totale Investito, Valore Attuale, Rendimento), Tabella Posizioni (ticker, quote, PMC, prezzo corrente, valore, rendimento %), Grafico a Ciambella, Grafico Portafoglio.

### Aggiornare i Prezzi

Clicca **Aggiorna Prezzi** nell'intestazione della pagina. I prezzi sono ritardati fino a 15 minuti.

### Note e Limitazioni

- Progettato per **singolo broker / singolo ETF**
- Nessuna interfaccia modifica/elimina transazioni (richiede console Firestore)
- Importo PAC solo di riferimento — nessuna automazione
- Saldo liquidità = capitale iniziale − totale investito
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

### Simulazione

Ciclo mensile per l'intero orizzonte:
1. Flusso annuale aggiunto alla liquidità (dal 2° anno)
2. Liquidità matura interessi (capitalizzazione mensile)
3. PAC trasferito da liquidità a ETF
4. ETF cresce al tasso configurato (capitalizzazione mensile)
5. Valori arrotondati a numeri interi

### Grafico

- **Area indaco** — Patrimonio Netto Proiettato
- **Linea verde tratteggiata** — Totale Investito

### Carte di Riepilogo

| Carta | Cosa Mostra |
|-------|-------------|
| **Capitale Finale** | Patrimonio netto a fine orizzonte |
| **Interessi Totali Maturati** | Profitto (patrimonio − investito) |
| **Tasse Stimate (26%)** | 26% imposta sulle plusvalenze |

### Precompilazione Intelligente

Se il broker è configurato in Investimenti, la pagina Proiezioni carica automaticamente PAC, capitale iniziale e tasso d'interesse. Modificabile in qualsiasi momento.

---

**English version:** [[features/investment-tracking-guide]]

## Correlate

- [[features/investment-tracking]]
- [[features/financial-projections]]
- Fonte: [raw/FEATURES-GUIDE.it.md](raw/FEATURES-GUIDE.it.md)
