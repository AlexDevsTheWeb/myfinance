# Balancr — Beta Deployment Checklist & Playbook

## 1. User Trust & Safety Disclaimer
Dato che l'applicazione gira sotto il tuo dominio personale (`home.alessandrotorri.it`), è fondamentale impostare un banner chiaro che delimiti le responsabilità e ricordi ai tester che si tratta di un ambiente sandbox.

### Componente React/MUI (Italiano)
Piazza questo snippet (usando un componente `<Alert>` di MUI) in cima alla tua Dashboard principale o subito dopo il Login:

```typescript
<Alert severity="warning" variant="outlined" sx={{ mb: 3 }}>
  <AlertTitle sx={{ fontWeight: 'bold' }}>Benvenuto nella Soft Beta di Balancr!</AlertTitle>
  L'applicazione è attualmente in fase di test sperimentale. Sebbene le trasmissioni dati siano 
  crittografate e protette su un database Firestore isolato, si prega di <strong>non inserire credenziali 
  bancarie reali o dati sensibili di conti privati</strong>. Questa piattaforma funge unicamente da 
  registro di tracciamento simulato e autonomo, e non ha alcun collegamento diretto con istituti di credito.
</Alert>
```

### Componente React/MUI (English i18n)
Se l'utente ha la lingua impostata su inglese, mappa la traduzione in questo modo:

```typescript
<Alert severity="warning" variant="outlined" sx={{ mb: 3 }}>
  <AlertTitle sx={{ fontWeight: 'bold' }}>Welcome to the Balancr Soft Beta!</AlertTitle>
  This application is currently in an experimental testing phase. While all data transmissions 
  are encrypted and isolated inside a dedicated Firestore database, please <strong>do not input 
  real banking credentials or highly sensitive financial passwords</strong>. This platform operates purely 
  as a self-contained tracking sandbox and has no integrations with external banking institutions.
</Alert>
```

---

## 2. Protocollo di Verifica del Motore di Backup/Restore (Post Migrazione)
Avendo appena implementato la prima parte della **Issue #138** (migrazione verso le sub-collection di Firestore), il vecchio esportatore JSON potrebbe rompersi se tenta ancora di leggere l'intero array da un unico documento. Prima di invitare i 10-15 tester, esegui questo controllo di integrità:

### QA Checklist per lo Sviluppatore:
1. **Deep Fetching su Esportazione:** Verifica che la funzione di export non legga solo il documento utente base `users/{uid}`, ma effettui una query asincrona per estrarre tutti i record presenti nella nuova sub-collection `users/{uid}/transactions/*` prima di comporre il file JSON scaricabile.
2. **Aggiornamento dello Schema di Validazione:** Aggiorna il parser di importazione affinché riconosca la struttura a oggetti differenziata e non si aspetti un array piatto all'interno del vecchio schema.
3. **Idempotenza dell'Import:** Assicurati che importare due volte lo stesso file JSON sovrascriva i dati corretti o ripulisca la sub-collection prima dell'inserimento, evitando duplicati causati dai vecchi ID.

### Test Case Manuale da eseguire in Staging:
1. Crea un broker finto (`Trade Republic`) con un PAC attivo e inserisci 5 transazioni di acquisto.
2. Scarica il file JSON di Backup dalle impostazioni (`/config`).
3. Vai sulla console di Firebase e **cancella manualmente l'intera sub-collection delle transazioni dell'utente** (simulando una corruzione dei dati).
4. Torna nell'app (che ora sarà vuota), carica il file JSON e verifica che la dashboard, i grafici di allocazione e lo storico del PAC si ripopolino all'istante senza crash del client (assenza di White Screen).

---

## 3. Template di Invito per i tuoi Tester
Ecco una traccia per l'email o il messaggio da inviare ai tuoi 10-15 contatti selezionati:

> "Ciao [Nome], finalmente la primissima versione alfa/beta di Balancr è online! Se ti va di provarla e darmi i tuoi feedback, la trovi su: **https://home.alessandrotorri.it**
> 
> Due note veloci prima di entrare:
> 1. Vedrai un disclaimer all'ingresso: l'app è sicura e isolata, ma trattandosi di una beta ti chiedo di non inserire dati reali troppo sensibili (es. non usare cifre o nomi reali se non ti va).
> 2. Il focus di questo test è vedere se i calcoli sul PAC automatico e i grafici degli ETF si aggiornano correttamente nei primi giorni. Se vedi qualcosa che si rompe o schermate bianche, fammelo sapere subito! Grazie mille per l'aiuto."
