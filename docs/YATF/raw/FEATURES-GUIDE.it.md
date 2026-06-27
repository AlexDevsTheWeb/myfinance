# Guida alle Funzionalità — Monitoraggio Investimenti & Proiezioni Finanziarie

## 1. Monitoraggio Investimenti (`/invest`)

Gestisci un portafoglio mono-ETF con liquidità del broker, transazioni di acquisto/vendita e aggiornamento dei prezzi di mercato.

### Per Iniziare

1. **Attiva il modulo**: Vai su **Impostazioni** (`/config`) → *Moduli Attivi* → attiva **Gestione Investimenti**.
2. **Configura il broker**: Nella pagina Investimenti, clicca **Impostazioni** e compila:
   - **Nome Broker** — es. *Trade Republic*, *Degiro*
   - **Capitale Iniziale (€)** — la somma totale depositata inizialmente presso il broker
   - **PAC Mensile (€)** — l'importo del tuo Piano di Accumulo Capitale ricorrente (solo di riferimento, non ancora automatizzato)
   - **Ticker ETF** — il ticker del tuo ETF in formato Yahoo Finance, es. `SWDA.MI` (Milano), `VWCE.DE` (Xetra)
   - **Tasso d'Interesse (%)** — l'interesse annuale che il tuo broker paga sulla liquidità non investita (es. 2.0 per il 2% APY)

### Aggiungere Transazioni

Passa alla scheda **Capitale Investito** e clicca **Aggiungi Transazione**:

| Campo | Note |
|-------|------|
| **Ticker** | Precompilato dalla configurazione broker, modificabile |
| **Tipo** | `Acquisto` (hai comprato quote) o `Vendita` (hai venduto quote) |
| **Quote** | Supporta frazioni (es. `0.523`) |
| **Prezzo (€)** | Prezzo per quota al momento della transazione |
| **Totale (€)** | Calcolato automaticamente come `quote × prezzo`. Puoi modificarlo manualmente se necessario |
| **Data** | Preimpostata a oggi |
| **Conto** | Il conto finanziario a cui è collegata la transazione |
| **Descrizione** | Testo libero, es. *"Acquisto mensile Gen 2026"* |
| **Note** | Note opzionali più lunghe |

Dopo il salvataggio, la vista del portafoglio si aggiorna istantaneamente.

### Leggere la Dashboard

**Scheda 1 — "Liquidità"** (icona AccountBalance):
- **Carta Liquidità e Interessi**: Mostra il nome del broker, il saldo di liquidità (capitale iniziale meno totale investito), gli interessi mensili maturati e il tasso APY.
- **Grafico Valore Portafoglio**: Grafico ad area che mostra il valore del portafoglio rispetto al totale investito nel tempo. Usa i pulsanti `1M` / `6M` / `1A` / `TUTTO` per cambiare l'intervallo temporale.

**Scheda 2 — "Capitale Investito"** (icona TrendingUp):
- **Carte riepilogo**: Totale Investito, Valore Attuale (evidenziato), Rendimento Totale (€ e %).
- **Tabella Posizioni**: Ticker, Quote, PMC, Prezzo Corrente, Valore, Rendimento %. Rendimenti colorati in verde/rosso.
- **Grafico a Ciambella**: Ripartizione visiva per ticker.
- **Grafico Portafoglio**: Grafico a linea a larghezza piena nella parte inferiore.

### Aggiornare i Prezzi

Clicca **Aggiorna Prezzi** nell'intestazione della pagina per ottenere l'ultimo prezzo di mercato tramite Yahoo Finance. Il pulsante mostra *"Aggiornamento…"* durante il caricamento. Nota: i prezzi sono ritardati fino a 15 minuti (limite standard di Yahoo Finance).

### Note e Limitazioni

- Progettato per una configurazione **singolo broker / singolo ETF**
- Non è ancora presente un'interfaccia per modificare o eliminare transazioni (richiede la console Firestore per la rimozione)
- L'importo del **PAC (Piano di Accumulo Capitale)** è memorizzato come riferimento ma non automatizza alcun processo — devi registrare manualmente ogni transazione di acquisto
- Saldo di liquidità = capitale iniziale − totale investito in tutte le transazioni di acquisto
- I prezzi storici non vengono memorizzati; il grafico utilizza il valore registrato al momento di ogni snapshot

---

## 2. Proiezioni Finanziarie (`/projections`)

Simula la crescita degli investimenti a lungo termine (1–50 anni) con un modello a interesse composto. Completamente lato client — nessun dato viene salvato o inviato.

### Come Usarle

Vai su **Proiezioni** dalla barra di navigazione superiore (o `/projections`). Modifica qualsiasi parametro e il grafico si aggiorna in tempo reale.

### Parametri di Input

| Parametro | Tipo | Intervallo | Predefinito | Descrizione |
|-----------|------|------------|-------------|-------------|
| **Orizzonte Investimento** | Slider | 1–50 anni | 20 | Per quanti anni simulare |
| **Rendimento Annuo ETF** | Slider | 0–20% | 7% | Rendimento annuale atteso del tuo ETF |
| **Tasso Interesse Liquidità** | Slider | 0–10% | 2% | Interesse sulla liquidità non investita |
| **Capitale Iniziale (€)** | Testo | ≥ 0 | 0 | Investimento iniziale una tantum |
| **PAC Mensile (€)** | Testo | ≥ 0 | 200 | Importo investito ogni mese |
| **Flusso Annuale (€)** | Testo | ≥ 0 | 0 | Deposito aggiuntivo annuale (dal 2° anno) |

### Comprendere la Simulazione

Il motore esegue un **ciclo mensile** per l'intero orizzonte:

1. All'inizio di ogni anno (dal 2° anno in poi), il flusso annuale viene aggiunto alla liquidità
2. La liquidità matura interessi al tasso configurato (capitalizzazione mensile)
3. L'importo del PAC viene trasferito dalla liquidità all'ETF (limitato alla liquidità disponibile)
4. La posizione ETF cresce al tasso di rendimento configurato (capitalizzazione mensile)
5. Tutti i valori sono arrotondati a numeri interi

### Leggere il Grafico

- **Area indaco** (linea continua) — Patrimonio Netto Proiettato (liquidità + valore ETF)
- **Area verde** (linea tratteggiata) — Totale Investito (capitale accumulato versato da te)
- Passa il mouse sul grafico per vedere i valori esatti in qualsiasi anno
- L'asse Y mostra € con suffissi k/M (es. €50k, €1,2M)

### Carte di Riepilogo

Le tre carte sotto il grafico mostrano i metriche dell'**ultimo anno**:

| Carta | Colore | Cosa Mostra |
|------|--------|-------------|
| **Capitale Finale** | Indaco | Patrimonio netto totale alla fine dell'orizzonte |
| **Interessi Totali Maturati** | Verde | Patrimonio netto meno totale investito = profitto |
| **Tasse Stimate (26%)** | Rosso | 26% di imposta italiana sulle plusvalenze sul profitto |

### Precompilazione Intelligente

Se hai configurato le impostazioni del broker nella pagina Investimenti, la pagina Proiezioni carica automaticamente l'importo del PAC, il capitale iniziale e il tasso di interesse come valori predefiniti. Puoi modificarli in qualsiasi momento — la precompilazione imposta solo i valori iniziali.

### Scenari di Esempio

**Conservativo:** 10 anni, 4% rendimento ETF, €10k capitale iniziale, €200/mese PAC
**Moderato:** 20 anni, 7% rendimento ETF, €10k capitale iniziale, €500/mese PAC, €5k/anno flusso annuale
**Aggressivo:** 30 anni, 10% rendimento ETF, €50k capitale iniziale, €1000/mese PAC

### Note

- Tutti i calcoli avvengono nel tuo browser — nessun dato viene salvato su Firestore o server
- Le proiezioni sono deterministiche (stessi input producono sempre lo stesso output)
- La stima fiscale è un 26% fisso sulle plusvalenze (regime italiano). Detrazioni o esenzioni non sono modellate
- L'inflazione non è considerata — i rendimenti sono nominali

---

## Flusso di Dati tra le Funzionalità

Le due funzionalità si integrano in un punto:

```
Impostazioni Broker  ──precompila──►  Pagina Proiezioni
(capitale iniziale,                    (valori predefiniti iniziali)
 PAC, tasso interesse)
```

Configurare il broker nella sezione Investimenti significa che non devi reinserire i numeri quando testi le proiezioni. La precompilazione è in sola lettura — modificare i valori nella pagina Proiezioni non altera le impostazioni del broker.
