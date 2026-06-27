# Guida alle Funzionalità — Monitoraggio Investimenti & Proiezioni Finanziarie

## 1. Monitoraggio Investimenti (`/invest`)

Gestisci un portafoglio multi-broker di ETF con liquidità, transazioni di acquisto/vendita, PAC automatizzato e aggiornamento dei prezzi di mercato.

### Per Iniziare

1. **Attiva il modulo**: Vai su **Impostazioni** (`/config`) → *Moduli Attivi* → attiva **Gestione Investimenti**.
2. **Configura i broker**: Nella pagina Investimenti, clicca **Impostazioni** per aggiungere uno o più conti broker. Per ogni broker compila:
   - **Nome Broker** — es. *Trade Republic*, *Degiro*, *Fineco*
   - **Capitale Iniziale (€)** — la somma totale depositata inizialmente presso il broker
   - **PAC Mensile (€)** — l'importo del tuo Piano di Accumulo Capitale ricorrente (il sistema ti chiederà di eseguirlo ogni mese)
   - **Ticker ETF** — il ticker del tuo ETF in formato Yahoo Finance, es. `SWDA.MI` (Milano), `VWCE.DE` (Xetra). Il sistema convalida il formato del ticker al salvataggio.
   - **Tasso d'Interesse (%)** — l'interesse annuale che il tuo broker paga sulla liquidità non investita (es. 2.0 per il 2% APY)

Puoi aggiungere, modificare o eliminare conti broker in qualsiasi momento tramite la stessa finestra delle Impostazioni.

### Filtrare per Broker

Usa il menu a tendina **Seleziona Broker** nell'intestazione della pagina per filtrare la dashboard:
- **Tutti i Broker (Aggregato)** — visualizza il patrimonio netto totale su tutti i conti
- **Broker specifico** — visualizza liquidità, posizioni e rendimenti per singolo broker

### Aggiungere Transazioni

Passa alla scheda **Capitale Investito** e clicca **Aggiungi Transazione**:

| Campo | Note |
|-------|------|
| **Conto Broker** | Seleziona a quale broker appartiene questa transazione |
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

### Modificare ed Eliminare Transazioni

- **Modifica**: Clicca l'icona ✏️ nella Tabella Posizioni per modificare una transazione esistente. La finestra si apre con i dati già compilati. Cambia qualsiasi campo e salva.
- **Elimina**: Clicca l'icona 🗑️ per rimuovere una transazione. Dopo la conferma, il sistema ricalcola automaticamente il portafoglio (ripristina quote, ricalcola il PMC, aggiorna la liquidità e registra un nuovo snapshot).

### Automazione PAC

Quando configuri un **PAC Mensile (€)** su un conto broker, il sistema rileva automaticamente l'inizio di un nuovo mese e se il giorno PAC configurato (predefinito: 1° del mese) è passato:

1. Un badge **PAC in Sospeso** appare nell'intestazione della pagina Investimenti con un indicatore di avviso
2. Clicca il badge per aprire il **Dialogo di Conferma PAC**
3. Verifica i dettagli (nome broker, importo, data)
4. Scegli:
   - **Conferma & Esegui** — il sistema recupera il prezzo di mercato corrente e crea una transazione `Acquisto Generato dal Sistema`
   - **Ignora** — salta il PAC per questo mese (il badge scompare, il prossimo mese verrà riproposto)

Il sistema controlla una volta al mese per broker e non genera mai duplicati.

### Leggere la Dashboard

**Scheda 1 — "Liquidità"** (icona AccountBalance):
- **Carta Liquidità e Interessi**: Mostra il nome del broker, il saldo di liquidità (capitale iniziale meno totale investito), gli interessi mensili maturati e il tasso APY. Quando è selezionato un broker specifico, mostra i dati per singolo broker.
- **Grafico Valore Portafoglio**: Grafico ad area che mostra il valore del portafoglio rispetto al totale investito nel tempo. Usa i pulsanti `1M` / `6M` / `1A` / `TUTTO` per cambiare l'intervallo temporale.

**Scheda 2 — "Capitale Investito"** (icona TrendingUp):
- **Carte riepilogo**: Totale Investito, Valore Attuale (evidenziato), Rendimento Totale (€ e %).
- **Tabella Posizioni**: Ticker, Quote, PMC, Prezzo Corrente, Valore, Rendimento % e Azioni (modifica/elimina).
- **Grafico a Ciambella**: Ripartizione visiva per ticker.
- **Grafico Portafoglio**: Grafico a linea a larghezza piena nella parte inferiore.

### Aggiornare i Prezzi

Clicca **Aggiorna Prezzi** nell'intestazione della pagina per ottenere gli ultimi prezzi di mercato per tutti i ticker posseduti tramite Yahoo Finance. Il pulsante mostra *"Aggiornamento…"* durante il caricamento. Nota: i prezzi sono ritardati fino a 15 minuti (limite standard di Yahoo Finance).

### Note

- Supporta **molteplici conti broker** — aggiungine quanti ne vuoi
- Le transazioni possono essere **modificate ed eliminate** in qualsiasi momento con ricalcolo automatico del portafoglio
- L'**automazione PAC** gestisce gli acquisti ricorrenti mensili — non è necessario registrare manualmente ogni transazione
- Saldo di liquidità = capitale iniziale − totale investito in tutte le transazioni di acquisto (per broker o aggregato)
- Gli snapshot del portafoglio sono salvati su Firestore per la visualizzazione dei grafici su più dispositivi
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

### Adeguamento all'Inflazione

Attiva l'interruttore **"Adequa all'inflazione (2%)"** per vedere come l'inflazione influisce sul potere d'acquisto nel tempo:

- **Quando SPENTO** (predefinito): Il grafico mostra le proiezioni nominali (valore facciale)
- **Quando ACCESO**: La linea principale `Patrimonio Netto` mostra il valore reale (corretto per l'inflazione). Una linea tratteggiata rossa **Valore Nominale** appare come sovrapposizione per il confronto. Una carta **Capitale Finale Reale** appare nel riepilogo mostrando l'importo finale corretto per l'inflazione.

L'adeguamento all'inflazione utilizza un tasso annuale del 2% con capitalizzazione mensile per precisione. Le stime fiscali rimangono sui guadagni nominali (l'imposta italiana del 26% si applica ai profitti nominali, non a quelli corretti per l'inflazione).

### Comprendere la Simulazione

Il motore esegue un **ciclo mensile** per l'intero orizzonte:

1. All'inizio di ogni anno (dal 2° anno in poi), il flusso annuale viene aggiunto alla liquidità
2. La liquidità matura interessi al tasso configurato (capitalizzazione mensile)
3. L'importo del PAC viene trasferito dalla liquidità all'ETF (limitato alla liquidità disponibile)
4. La posizione ETF cresce al tasso di rendimento configurato (capitalizzazione mensile)
5. Se l'adeguamento all'inflazione è attivo, i valori di ogni mese vengono divisi per il fattore di inflazione cumulativo
6. Tutti i valori sono arrotondati a numeri interi

### Leggere il Grafico

- **Area indaco** (linea continua) — Patrimonio Netto: valore reale quando l'inflazione è attiva, nominale quando spenta
- **Area verde** (linea tratteggiata) — Totale Investito (capitale accumulato versato da te)
- **Linea rossa tratteggiata** (solo con inflazione attiva) — Sovrapposizione Valore Nominale che mostra la stessa proiezione senza inflazione
- Passa il mouse sul grafico per vedere i valori esatti in qualsiasi anno
- L'asse Y mostra € con suffissi k/M (es. €50k, €1,2M)

### Carte di Riepilogo

Le carte sotto il grafico mostrano i metriche dell'**ultimo anno**:

| Carta | Colore | Cosa Mostra |
|-------|--------|-------------|
| **Capitale Finale** | Indaco | Patrimonio netto totale alla fine dell'orizzonte |
| **Interessi Totali Maturati** | Verde | Patrimonio netto meno totale investito = profitto |
| **Tasse Stimate (26%)** | Rosso | 26% di imposta italiana sulle plusvalenze sul profitto |
| **Capitale Finale Reale** | Rosso (se attivo) | Capitale finale corretto per l'inflazione, mostrato solo quando l'interruttore inflazione è attivo |

### Precompilazione Intelligente

Se hai configurato le impostazioni del broker nella pagina Investimenti, la pagina Proiezioni carica automaticamente l'importo del PAC, il capitale iniziale e il tasso di interesse come valori predefiniti. Puoi modificarli in qualsiasi momento — la precompilazione imposta solo i valori iniziali.

Con più conti broker, la precompilazione utilizza i valori aggregati.

### Scenari di Esempio

**Conservativo:** 10 anni, 4% rendimento ETF, €10k capitale iniziale, €200/mese PAC
**Moderato:** 20 anni, 7% rendimento ETF, €10k capitale iniziale, €500/mese PAC, €5k/anno flusso annuale
**Aggressivo:** 30 anni, 10% rendimento ETF, €50k capitale iniziale, €1000/mese PAC

### Note

- Tutti i calcoli avvengono nel tuo browser — nessun dato viene salvato su Firestore o server
- Le proiezioni sono deterministiche (stessi input producono sempre lo stesso output)
- La stima fiscale è un 26% fisso sulle plusvalenze (regime italiano). Detrazioni o esenzioni non sono modellate
- L'adeguamento all'inflazione è disattivato per impostazione predefinita; attivalo per vedere il potere d'acquisto reale

---

## Flusso di Dati tra le Funzionalità

Le due funzionalità si integrano in due punti:

```
Impostazioni Broker  ──precompila──►  Pagina Proiezioni
(capitale iniziale,                    (valori predefiniti iniziali)
 PAC, tasso interesse)

Transazioni ETF    ──snapshot──►  Sottocollezione Firestore
(acquisti/vendite)                  (cronologia portafoglio persistente)
```

Configurare il broker nella sezione Investimenti significa che non devi reinserire i numeri quando testi le proiezioni. La precompilazione è in sola lettura — modificare i valori nella pagina Proiezioni non altera le impostazioni del broker. Gli snapshot del portafoglio dalle tue transazioni vengono automaticamente salvati per la visualizzazione dei grafici su più dispositivi.
