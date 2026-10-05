---
type: Analysis
title: "Marketing site implementation analysis — apps/website"
description: "Raw audit of the Italian Tailwind export and the implementation decisions taken when converting it into a React + MUI workspace."
resource: "https://github.com/AlexDevsTheWeb/myfinance/issues/193"
tags: [website, marketing, analysis, design-tokens, pricing, a11y]
created: 2026-10-05
updated: 2026-10-05
status: complete
sources: ["raw/website/starting-prompt.md", "raw/website/layout-example.html"]
related: ["wiki/features/marketing-website/marketing-website", "wiki/decisions/website-as-separate-hosting-target", "wiki/architecture/monorepo-layout", "wiki/plans/monorepo-migration"]
---

# Marketing site implementation analysis — `apps/website`

Raw working notes for Issue #193. Immutable once ingested; corrections belong
in the compiled pages, not here.

Sources in this folder:

| File | What it is |
|---|---|
| `starting-prompt.md` | The brief: structure, copy, design constraints, component list. Italian. |
| `layout-example.html` | A ~1,130-line single-file Tailwind export of the finished page. Italian copy, CDN-loaded Tailwind + Material Symbols webfont, vanilla JS. |

---

## 1. What the export actually is

- Tailwind via CDN with an inline `tailwind.config`, extending the Material 3
  palette (`primary #b8c4ff`, `primaryContainer #1e40af`, `secondary #4cd7d3`,
  surface ramp `#0f131c` / `#181c24` / `#1c2028` / `#262a33` / `#31353e`).
- `darkMode: "class"` is configured — **and there is no `.light` or `.dark`
  rule anywhere in the file.** See §2.
- Sections, in document order: sticky header → hero → cockpit mockup → three
  product pillars → mobile ecosystem cards → pricing → security manifesto →
  FAQ → footer → modal. All of them survive into the implementation.
- The cockpit mockup is a *static* illustration with two buttons that only
  rewrite three hardcoded numbers inside it. No data model behind it.
- One `#setBillingCycle` handler mutates three separate DOM nodes.

## 2. Gaps in the source, resolved rather than inherited

| # | Gap in the export | Resolution |
|---|---|---|
| 1 | **Dark-only, but a toggle is wired.** `darkMode: "class"` is set and a toggle button exists, yet no light palette is defined anywhere in the file. Toggling would have had nothing to switch to. | Light palette **derived** from the same Material 3 tonal relationships, inverted: light surfaces, dark ink, `#2b4ec4` as primary (the dark-mode `#b8c4ff` fails contrast on near-white). Recorded as constructed, not sampled — it is the one thing on this page most worth a designer's eye. |
| 2 | **The prompt says no gradients; the export has three** — hero headline text gradient, a 1000×450 blurred ambient gradient behind the hero, and chart fills. | The prompt is the instruction. Text gradient kept (it carries brand colour on the accent phrase); the ambient blur and chart fills dropped. |
| 3 | **Pricing is internally inconsistent.** `€ 9,99` monthly, `€ 6,58` monthly billed annually at `€ 79`, `€ 199` lifetime — and a stray `€ 19,99` that matches no plan. `setBillingCycle` writes amount, period and small print as three separate strings, which is how they could drift. | One typed model, `PRO_PRICES: Record<BillingCycle, PlanPrice>` in `src/content/site.ts`, rendered from one lookup. A test asserts the annual note is consistent with its own per-month figure (`79 / 12 = 6.58`), so editing the price without the note now fails CI. |
| 4 | **Radius everywhere is 16px / 24px** (`rounded-2xl`, `rounded-3xl`) against a brief asking for "sobrio ed esecutivo" with radius capped at 4/8px. | `shape.borderRadius: 4`, dialogs and cards at 8. Only small circular affordances (status dots, the modal close target) go fully round. |
| 5 | **Copy is stale.** "Q2 2025" public store release, "Roadmap 2025" footer link, "© 2025 Balancr Technologies Inc." | No invented dates. Store availability is phrased as "in final internal testing" with no date, the roadmap footer link renders as inert text, copyright year dropped to a bare name. |
| 6 | **Icon webfont.** Material Symbols is loaded from a Google CDN, and every icon is a `<span class="material-symbols-outlined">` whose codepoint is invisible to assistive tech unless each span also carries `aria-hidden`. | `@mui/icons-material` imported one module per icon (already a workspace dependency, tree-shakable, no third-party request on the critical path, `aria-hidden` by default). 21 hand-rolled SVGs were tried first and rejected: they tripped `react-refresh/only-export-components`, and MUI's glyphs are the ones the rest of the product already uses. |
| 7 | **Footer renders every column entry as link-styled text** with no destination. | Items that map to a section are links; the rest render as muted inert text. Text that looks like navigation but is not is worse than no navigation. |

## 3. Component mapping

| Component | Notes |
|---|---|
| `Navbar` | Sticky, translucent. Desktop links ≥1200px, `Drawer` below. The drawer closes itself on a resize back to desktop — otherwise it survives as an invisible overlay swallowing clicks. |
| `HeroSection` | Status pill, headline, subhead, two CTAs, trust bar, cockpit preview. Primary CTA opens the waitlist; secondary jumps to `#cockpit`. |
| `CockpitPreview` | Overview/Transactions tabs are **real** state — the demo should behave like the thing it advertises. All figures are labelled sample data; `figcaption` says so explicitly. |
| `EcosystemSection` | Web/iOS/Android. Only the shipped platform gets a live URL; the two betas open the waitlist instead of pointing at store pages that do not exist. |
| `PillarsSection` | Three pillars, each with a static illustrative panel (migrations are static by design — a fake chart library would be worse than no chart). |
| `PricingTable` | Cycle toggle, three tiers, plan CTAs report the plan to the parent rather than navigating. |
| `SecuritySection` | Manifesto, three cards, four vault specs. |
| `FaqAccordion` | Four Q&As, first open. **MUI v9 does not wire `aria-controls`/region ids** — both had to be set through slot props, or a screen reader announces a bare "collapsed, button". |
| `Footer` | Brand blurb, three columns, legal row. |
| `BetaWaitlistDialog` | Email + device select. See §4. |

## 4. The waitlist form does not pretend to have a backend

There is no endpoint (explicitly out of scope in the issue). The export showed a
success toast implying a stored address. The implementation instead:

- validates the address client-side (`/[^\s@]+@[^\s@.]+(\.[^\s@.]+)+/` — loose
  on shape, because a waitlist that rejects valid signups is worse than one that
  asks a server to send a confirmation mail);
- shows an inline notice *before* submitting that the form is not connected;
- on submit, says plainly that the address was validated but **not stored**.

Tests assert the absence of "check your inbox" and "reserved your spot" copy, so
the misleading wording cannot come back quietly.

## 5. Environment and hosting

- `vite.config.ts` sets `envDir` from `fileURLToPath(new URL('../..', import.meta.url))`
  — the cwd-independent form from the #192 fix, applied from the start rather
  than after the same class of bug. No `VITE_*` vars are needed to build today;
  it is there so adding analytics cannot regress silently.
- `APP_LINKS` resolve to the **absolute** app origin. Site and app are separate
  hosting targets, so a bare `/` would just reload the landing page. Default is
  `https://myfinancetracker-b257e.web.app` (confirmed against
  `firebase hosting:sites:list`, not guessed), overridable with `VITE_APP_ORIGIN`.

## 6. Bundle

Entry chunk 455 kB / **142 kB gzip**; the waitlist dialog (Dialog + Menu +
Select + Alert + form) is a lazy chunk at 73 kB / 22 kB gzip, loaded on first
intent only. All MUI imports are per-module (`@mui/material/Box`, not the
barrel): switching to deep imports cut the module graph from 911 to 588.
`chunkSizeWarningLimit` is 500 kB, roughly 10% of headroom.

142 kB gzip is on the heavy side for a landing page. It is MUI v9 plus ~15
components plus React, and it is the honest floor for this stack — chasing it
further means dropping MUI, which is a decision for later, not a detail.

## 7. What is deliberately missing

- `og:image` and `apple-touch-icon`. The export ships neither asset, and a
  reference to a missing file produces a broken link preview — worse than none.
  Real artwork is a follow-up; a generated placeholder is not.
- Analytics. No cookies means no consent banner, and adding a tracker means
  both the banner and an env-injected ID.
- A waitlist endpoint.
- Public store links, roadmap page, support page, privacy notice, terms.

---

## Related

- [[wiki/features/marketing-website/marketing-website]] — compiled feature page
- [[wiki/decisions/website-as-separate-hosting-target]] — workspace isolation and deploy targets
- [[wiki/architecture/monorepo-layout]] — where `apps/website` sits
- [[wiki/plans/monorepo-migration]] — Phase 5, pulled forward