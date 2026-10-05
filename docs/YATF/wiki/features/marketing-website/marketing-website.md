---
type: Feature
title: "Marketing Website — apps/workspace landing page"
description: "Conversion- and SEO-ready Balancr landing page as a standalone apps/website React + MUI workspace with its own hosting target."
resource: "https://github.com/AlexDevsTheWeb/myfinance/issues/193"
tags: [feature, website, marketing, frontend, react, mui, seo]
created: 2026-10-05
updated: 2026-10-05
status: implemented
sources: ["raw/website/website.md", "raw/website/starting-prompt.md", "raw/website/layout-example.html"]
related: ["wiki/decisions/website-as-separate-hosting-target", "wiki/architecture/monorepo-layout", "wiki/architecture/release-pipeline", "wiki/architecture/testing-status", "wiki/plans/monorepo-migration"]
---

# Feature: Marketing Website (`apps/website`)

Status: implemented (draft PR, Issue #193)
Priority: high

## Description

The Balancr marketing landing page, built as the third npm workspace alongside
`apps/web`. Converted from an exported Tailwind mockup
([`raw/website/layout-example.html`](../../raw/website/layout-example.html))
whose brief is [`raw/website/starting-prompt.md`](../../raw/website/starting-prompt.md).
English copy throughout; the source is Italian.

Phase 5 of the monorepo migration, pulled forward — see
[[wiki/plans/monorepo-migration]]. The workspace isolation and hosting split are
recorded in [[wiki/decisions/website-as-separate-hosting-target]].

## Requirements

- Nine components, one per section of the export: `Navbar`, `HeroSection`,
  `CockpitPreview`, `EcosystemSection`, `PillarsSection`, `PricingTable`,
  `SecuritySection`, `FaqAccordion`, `Footer`, plus `BetaWaitlistDialog`.
- Solid dark surfaces `#0f131c` / `#181c24`, no decorative glow.
- Border radius capped at 4px / 8px; 1px borders.
- Working dark/light toggle that persists across reload.
- Pricing driven by a single billing-cycle model.
- Responsive at 375 / 768 / 1280.
- SEO: unique title and meta description, OG/Twitter tags, canonical URL,
  semantic landmarks, exactly one `h1`.
- Accessibility: keyboard-navigable accordion and dialog, visible focus,
  labelled controls.
- Zero new lint findings against the recorded 7E/3W baseline.

## Implementation Notes

### Layout

```
apps/website/
├── index.html                 SEO, canonical, font preconnect, favicon
├── vite.config.ts             port 5174, repo-root envDir, 500 kB chunk budget
├── vitest.config.ts           jsdom + jest-dom
├── tsconfig{,.app,.node}.json
└── src/
    ├── App.tsx                section order, billing-cycle state, waitlist state
    ├── main.tsx               mount; throws loudly if #root is missing
    ├── content/site.ts        ALL copy + the pricing model
    ├── theme/theme.ts         dark + derived-light palettes, tokens, typography
    ├── theme/ColorModeProvider.tsx
    ├── theme/colorModeContext.ts
    ├── components/*.tsx       one file per section
    ├── components/Icon.tsx    content-named icon lookup
    ├── components/iconMap.ts  the lookup table
    └── test/setup.ts
```

`src/content/site.ts` holds every string as typed data, so copy edits never
touch JSX and pricing cannot be half-updated.

### Decisions worth remembering

| Decision | Why |
|---|---|
| Derived light palette | The export configured `darkMode: "class"` but defined no light palette. Constructed from the same Material 3 tonal relationships, inverted. `#b8c4ff` fails contrast on near-white, so light primary is `#2b4ec4`. Flagged in code as the thing most worth a designer's review. |
| Headline gradient kept, ambient blur dropped | The brief says no gradients; the export uses three. Text gradient carries brand colour on the accent phrase. The 1000×450 blurred backdrop is decoration. |
| One pricing model | The export wrote amount, period and note as three separate strings inside `setBillingCycle`, and carried a `€ 19,99` matching no plan. A test now asserts `79 / 12 ≈ 6.58` so editing a price without its note fails CI. |
| Per-module MUI imports | `@mui/material/Box`, never the barrel. Cut the module graph 911 → 588. |
| Waitlist dialog lazy-loaded | Dialog + Menu + Select + Alert is 22 kB gzip for a form most visitors never open. Entry chunk 455 kB / 142 kB gzip. |
| Icons from `@mui/icons-material`, one module each | The export used a Google-hosted Material Symbols webfont: a render-blocking third-party request, and codepoints invisible to screen readers without `aria-hidden` on every span. |
| All MUI icons through `Icon.tsx` | Content data names icons as plain strings (`car`, `chart`). A test asserts every name in `site.ts` resolves, so a typo fails CI instead of silently rendering the fallback glyph. |
| Accordion ARIA wired by hand | MUI v9 sets neither `aria-controls` on the summary nor an id on the region. Both come through slot props. |
| App links are absolute | Site and app are separate hosting targets; `/` would reload the landing page. |
| No `og:image` | A reference to a missing asset yields a broken link preview, which is worse than none. Real artwork is a follow-up. |

### Honest gaps

- The waitlist form validates but does not submit — there is no endpoint, and
  the UI says so both before and after submit rather than implying a stored
  address.
- The light palette is constructed, not designed.
- The cockpit preview and pillar figures are hardcoded sample data, labelled as
  such in a `figcaption`.
- Store links, roadmap, support, privacy notice and terms do not exist, so
  those footer entries render as inert text instead of dead links.

## Verification

| Check | Result |
|---|---|
| `npm run build --workspace apps/website` | passes — 455 kB entry + 73 kB lazy dialog chunk |
| `npm run test --workspace apps/website` | 59 passed / 6 files |
| `npm run lint` (root, covers all workspaces) | 7E/3W — identical to the pre-existing baseline, `apps/website` contributes zero |
| `npm run build` (root → `apps/web`) | unchanged, `apps/web/dist` emitted |
| `npm test` (root → `apps/web`) | 198 passed / 12 files, unchanged |
| `firebase deploy --only hosting:website --dry-run` | resolves to `balancr-website.web.app` |

Not verified: the deployed preview channel, and real-device rendering at 375 /
768 / 1280. Responsive behaviour is implemented through MUI breakpoints and
verified by reading the DOM, not by screenshot.

## Related

- [[wiki/decisions/website-as-separate-hosting-target]]
- [[wiki/architecture/monorepo-layout]]
- [[wiki/architecture/release-pipeline]]
- [[wiki/architecture/testing-status]]
- [[wiki/plans/monorepo-migration]]
- Source: [raw/website/website.md](../../raw/website/website.md)