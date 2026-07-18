# Balancr - Identity System & SVG Source Code

Questo documento contiene le specifiche di design e il codice sorgente vettoriale completo per l'identità visiva di **Balancr**, basata sul concetto **Linked Hexagons**.

---

## 🎨 Tavolozza Colori (Color Palette)

La palette è progettata per interfacce scure (Dark Mode) ad alto contrasto, combinando toni profondi per lo sfondo con gradienti neon vibranti che richiamano la stabilità finanziaria e l'innovazione tecnologica.

### 1. Sfondi e Base
*   **Deep Background (Main):** `#0b0f19` (Un blu notte quasi nero per massimizzare il contrasto dell'interfaccia)
*   **Surface / Grid:** `#111827` (Grigio-blu scuro per card, menu o linee di griglia sottili)
*   **Muted Text / Technical:** `#4b5563` / `#374151` (Tonalità neutre per label secondarie)

### 2. Gradienti Elementi Primari
*   **Left Hexagon (Stabilità / Liquidità):** 
    *   `#0052d4` (Deep Blue) ➔ `#4364f7` (Electric Blue) ➔ `#6fb1fc` (Light Cyan)
*   **Right Hexagon (Crescita / Asset):**
    *   `#00c9ff` (Bright Cyan) ➔ `#92fe9d` (Teal Mint)

---

## 🛠️ Codice Sorgente SVG

Puoi copiare il codice sottostante e salvarlo in un file chiamato `balancr-logo.svg`, oppure usarlo direttamente inline all'interno del tuo frontend (es. in un componente React/TypeScript).

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b0f19" />
      <stop offset="50%" stop-color="#111827" />
      <stop offset="100%" stop-color="#070a10" />
    </linearGradient>

    <!-- Hexagon 1 (Left - Deep Blue/Cyan) -->
    <linearGradient id="hexLeftGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0052d4" />
      <stop offset="50%" stop-color="#4364f7" />
      <stop offset="100%" stop-color="#6fb1fc" />
    </linearGradient>

    <!-- Hexagon 2 (Right - Bright Cyan/Teal) -->
    <linearGradient id="hexRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00c9ff" />
      <stop offset="100%" stop-color="#92fe9d" />
    </linearGradient>

    <!-- Glow Filters -->
    <filter id="glowLeft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    
    <filter id="glowRight" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Dark Tech Background -->
  <rect width="800" height="600" fill="url(#bgGrad)" />

  <!-- Dynamic Geometric Grid (Subtle) -->
  <g stroke="#1f2937" stroke-width="1" opacity="0.3">
    <path d="M 0,100 L 800,100 M 0,200 L 800,200 M 0,300 L 800,300 M 0,400 L 800,400 M 0,500 L 800,500" />
    <path d="M 100,0 L 100,600 M 200,0 L 200,600 M 300,0 L 300,600 M 400,0 L 400,600 M 500,0 L 500,600 M 600,0 L 600,600 M 700,0 L 700,600" />
  </g>

  <!-- Typography: App Name & Subtitle -->
  <text x="400" y="90" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="36" letter-spacing="6" fill="#ffffff">BALANCR</text>
  <text x="400" y="125" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="400" font-size="14" letter-spacing="2" fill="#4b5563">LINKED HEXAGONS • IDENTITY SYSTEM</text>

  <!-- MAIN LOGO MARK: LINKED HEXAGONS -->
  <g transform="translate(0, 10)">
    <!-- Outer Ambient Glows (Behind the shapes) -->
    <polygon points="370,225 440,265 440,345 370,385 300,345 300,265" fill="none" stroke="#4364f7" stroke-width="24" opacity="0.15" filter="url(#glowLeft)"/>
    <polygon points="500,225 570,265 570,345 500,385 430,345 430,265" fill="none" stroke="#00c9ff" stroke-width="24" opacity="0.15" filter="url(#glowRight)"/>

    <!-- LEFT HEXAGON (Base Level) -->
    <polygon points="370,225 440,265 440,345 370,385 300,345 300,265" 
             fill="none" 
             stroke="url(#hexLeftGrad)" 
             stroke-width="16" 
             stroke-linejoin="round"
             stroke-linecap="round" />

    <!-- RIGHT HEXAGON (Interlocking Level) -->
    <polygon points="500,225 570,265 570,345 500,385 430,345 430,265" 
             fill="none" 
             stroke="url(#hexRightGrad)" 
             stroke-width="16" 
             stroke-linejoin="round"
             stroke-linecap="round" />
             
    <!-- OVERLAP COUPLING SEGMENT (Ensures 3D interlacing) -->
    <path d="M 430,265 L 500,225 L 570,265" 
          fill="none" 
          stroke="url(#hexRightGrad)" 
          stroke-width="16" 
          stroke-linejoin="round"
          stroke-linecap="round" />
          
    <path d="M 440,345 L 370,385 L 300,345" 
          fill="none" 
          stroke="url(#hexLeftGrad)" 
          stroke-width="16" 
          stroke-linejoin="round"
          stroke-linecap="round" />
  </g>

  <!-- Tech Spec Elements / UI Accents -->
  <g font-family="monospace" font-size="10" fill="#374151" letter-spacing="1">
    <text x="50" y="550">SYS.STATUS: ACTIVE</text>
    <text x="50" y="565">NODE: FIRESTORE.V3</text>
    <text x="750" y="550" text-anchor="end">SCALE: 1:1</text>
    <text x="750" y="565" text-anchor="end">PROP: GEOMETRIC_PRECISION</text>
  </g>
</svg>
```

---

## 💡 Suggerimenti per l'implementazione Frontend

Se usi **React** e **Tailwind CSS**, puoi facilmente isolare il nodo centrale del logo escludendo i testi decorativi di sfondo, mappando i gradienti nel file di configurazione o usando direttamente variabili CSS per i colori dell'applicazione.
