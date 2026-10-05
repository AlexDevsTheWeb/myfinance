### Ruolo & Obiettivo
Sei un esperto sviluppatore frontend React. Converti l'HTML/CSS fornito delle landing page di Balancr in componenti React modulari, puliti e responsive.

### Stack Tecnologico
- **Opzione Primaria**: React + Material UI (MUI v5/v6) con `sx` prop o `styled`.
- **Alternativa Ammessa**: React + Tailwind CSS (se ritenuto più efficiente per sezioni marketing statiche).
- **TypeScript**: Obbligatorio (interfacce per props e configurazioni).

### Linee Guida di Implementazione
1. **Filtri e Superfici**:
   - Zero gradienti superflui o bagliori decorativi non necessari.
   - Sfondi solidi scuri (`#0f131c` / `#181c24`) o chiari in base alla modalità.
   - `border-radius` ridotto e rigoroso (massimo 4px/8px, look sobrio ed esecutivo).
   - Bordi sottili a 1px (`rgba(255,255,255,0.08)` per dark mode).

2. **Tematizzazione (Dark/Light)**:
   - Implementa il toggle Dark/Light sfruttando `ThemeProvider` (se MUI) o classe `dark` su root (se Tailwind).

3. **Scomposizione Componenti**:
   - `Navbar`: branding, link di navigazione e CTA.
   - `HeroSection`: headline, indicatori di fiducia e mockup del cockpit.
   - `EcosystemSection`: card Web, iOS e Android + form waitlist.
   - `PillarsSection`: schede tracciamento spese, cash flow e flotta.
   - `PricingTable`: switch Mensile/Annuale e card Starter, Pro, Lifetime.
   - `FaqAccordion`: FAQ con logica di espansione/chiusura.
   - `Footer`: note legali e link secondari.

4. **Input di Partenza**:
   - Fai riferimento all'HTML/CSS esportato per riprodurre fedelmente testi, gerarchia e spaziature. Il file di riferimento è layout-example.html

5. **NOTE IMPORTANTI**:
   - questo sarà il sito "vetrina" dell'applicaizone, che dovrà attrarre visitatori, e indurre all'acquisto o sottoscrizione. Deve essere accattivante ed essere già pronto per la SEO e la conversione.
   - attualmente la struttura del repository prevede di avere il sito web sotto la cartella apps/website e da qui voglio vedere essere eseguito
   - inizia dall'architettura, in un futuro ci sarà anche la parte mobile native per le app ios/android (in react native) e un'altra cartella per il backend vero e proprio
   - usa sempre e solo l'inglese, anche se questo file iniziale è stato scritto in italiano.
   