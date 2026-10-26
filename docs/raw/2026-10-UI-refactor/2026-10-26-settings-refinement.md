# OpenCode Prompt: Settings Page Refinement & Stitch Pixel-Fidelity Alignment

## Context & Gap Analysis
The current implementation of the Settings page (`SettingsPage.tsx`) deviates significantly from the approved Stitch prototype (`Screenshot 2026-10-26 alle 16.48.26.png`) and the exported Stitch HTML file. 

While functional, the current build uses plain vertical MUI lists and generic dark cards instead of the rich, high-density **Swiss-Tech / Executive Dark** layout.

You must refactor `src/pages/SettingsPage.tsx` and its sub-components to achieve **95%+ visual and structural fidelity** to the Stitch HTML export and screenshot.

---

## Key Discrepancies & Required Fixes

### 1. Global Shell & TopBar Integration
- **FIX**: Do NOT use standalone breadcrumbs ("Dashboard > Settings"). Keep the page strictly inside the standard `Layout` shell with the full **TopBar** (Search Bar, Currency Picker `EUR (€)`, Notification Bell, Green `+ Nuova Operazione` Button, and User Profile).

### 2. Page Header & Primary Action Bar
- **Header**: Title `"IMPOSTAZIONI GENERALI & INFRASTRUTTURA"` with sub-category label `"IMPOSTAZIONI / GENERALI"`.
- **Action Buttons**: Top-right header actions:
  - `Reimposta Predefiniti` (Outlined Button, Slate border `#334155`, text `#94A3B8`).
  - `Salva Modifiche` (Contained Primary Button, Cyan `#0EA5E9` with checkmark icon).

### 3. "PREFERENZE REGIONALI & VALUTA" Card
- **Layout**: 2x2 grid containing:
  - Header with title and `ISO 4217 / EU COMPLIANT` badge tag.
  - `LINGUA INTERFACCIA`: Select dropdown (Italiano IT, English US, etc.).
  - `VALUTA PRINCIPALE`: Select dropdown (EUR €, USD $, GBP £).
  - `FORMATO DATA & CIFRE`: Select dropdown + live preview tag (`1.234,56 €`).
  - `DATA INIZIO CALCOLI BILANCIO`: DatePicker (`01/01/2026`) + explanatory text.

### 4. "MODULI APPLICAZIONE ATTIVI" Section (2x2 Grid)
- **Layout**: Render as a **2x2 Grid of Rich Feature Cards** (NOT a vertical list).
- **Card Structure**:
  - Dark Surface `#131B2E` with 1px border `#1E293B` and rounded corners (`12px`).
  - **Left**: Icon container with dark cyan background (`#0F2942`) and vibrant icon (Car, Utility Bolt, Investment Chart, Budget Pie).
  - **Middle**: Title (bold) + detailed description (e.g. *"Tracciamento chilometri, consumi carburante (L/100km)..."*).
  - **Right**: MUI Cyan `Switch` for toggle active state.

### 5. "CONTI & CARTE DI REGOLAMENTO" Section (2x2 Grid)
- **Layout**: Render as a **2x2 Grid of Account/Card Tiles**:
  - **Accounts**: Icon container + Name ("Conto Arancio ING") + Masked IBAN (`IT28 •••• •••• 9012`) + Badge (`PRIMARY CC` / `SECONDARY`) + Large JetBrains Mono Balance (`€ 24.120,00`).
  - **Cards**: Icon container + Name ("Carta di Credito Gold #4412") + Reset day info (`1° del mese`) + Monospaced Limit/Plafond (`€ 2.000,00 / mese`).
  - Top-right action button: `+ Nuovo Conto / Carta` (Cyan text/outlined button).

### 6. Sub-Sidebar Navigation ("PARAMETRI SISTEMA")
- Keep the `220px` left sub-sidebar with the 7 items:
  - `Generali & Moduli`
  - `Conti & Carte` (Badge: `4 Attivi`)
  - `Categorie Spese` (Badge: `12`)
  - `Categorie Entrate` (Badge: `4`)
  - `Spese Ricorrenti` (Badge: `8`)
  - `Proiezioni & Tassi`
  - `Backup & Dati`
- Ensure active menu item uses dark slate pill with cyan border and active text glow, matching the main application sidebar.

---

## Execution Workflow for OpenCode

1. **Read & Compare**:
   - Open the exported Stitch HTML file in `docs/raw/` or `raw/`.
   - Compare the DOM tree of the HTML file with your current React components under `src/components/settings/` or `src/pages/SettingsPage.tsx`.

2. **Refactor Components**:
   - Replace generic MUI `List` / `ListItem` controls with MUI `Grid` (`spacing={2.5}`) and custom styled `Card` / `Paper` components matching the exact HTML/Tailwind classes.
   - Apply `fontFamily: 'JetBrains Mono, monospace'` to all monetary figures, dates, and preview badges.

3. **Report & PR**:
   - Write an Implementation Report in `docs/reports/PR-[NUMBER]-settings-fidelity-fix.md`.
   - Update OKF wiki pages under `docs/wiki/`.
   - Commit, push to `fix/settings-ui-fidelity`, and open a Pull Request.
