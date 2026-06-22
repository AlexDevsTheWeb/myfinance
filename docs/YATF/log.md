# Wiki Log

## [2026-06-22] ingest | Bulk | Initial wiki population (12 sources)
- Created [[features/car-management-redesign]] from `raw/SPEC.md`
- Created [[plans/roadmap]] from `raw/ROADMAP.md`
- Created [[architecture/project-state]] from `raw/STATE.md`
- Created [[plans/car-redesign-implementation]] from `raw/PLANS.md`
- Created [[architecture/tech-stack]] from `raw/codebase/STACK.md`
- Created [[architecture/codebase-structure]] from `raw/codebase/STRUCTURE.md`
- Created [[architecture/system-architecture]] from `raw/codebase/ARCHITECTURE.md`
- Created [[conventions/coding-conventions]] from `raw/codebase/CONVENTIONS.md`
- Created [[architecture/external-integrations]] from `raw/codebase/INTEGRATIONS.md`
- Created [[architecture/testing-status]] from `raw/codebase/TESTING.md`
- Created [[architecture/concerns-and-tech-debt]] from `raw/codebase/CONCERNS.md`
- Created [[references/llm-wiki-pattern]] from `raw/original LLM Wiki.md`
- Created index.md and log.md

## [2026-06-22] docs | Conventions | Created branch-strategy page
- Created [[conventions/branch-strategy]] with new branch rules
- Updated AGENTS.md to reference the wiki page as source of truth
- Updated [[conventions/coding-conventions]] to point to the dedicated page
- Updated CLAUDE.md branch strategy section to reference the wiki

## [2026-06-22] docs | CI/CD + Versioning | Audit and documentation
- Fixed `firebase-hosting-pull-request.yml` — restricted to PRs targeting `main` only (was triggering on all PRs including to `development`)
- Updated [[architecture/external-integrations]] with deployment rules table
- Created [[architecture/versioning]] with version scheme, .versionrc mapping, and release pipeline
- Updated index.md

## [2026-06-22] spec | Feature | Transaction Layout Improvement
- Created [[features/transaction-layout-improvement]] from [#80](https://github.com/AlexDevsTheWeb/myfinance/issues/80)
- Created [[plans/transaction-layout-implementation]] with step-by-step tasks
- Updated index.md

## [2026-06-22] re-map | Codebase | Full mapping via gsd-map-codebase (4 parallel agents)
- Re-mapped codebase with tech, arch, quality, and concerns focus agents
- Updated raw files from `.planning/codebase/*.md` → `raw/codebase/*.md`
- Re-ingested [[architecture/tech-stack]] — React ^19.2.6, MUI ^9.0.1, Vite ^8.0.13, version 2026.2.1, standard-version
- Re-ingested [[architecture/external-integrations]] — GitHub Actions CI/CD, i18n details, env vars, Google Fonts
- Re-ingested [[architecture/system-architecture]] — 7-layer architecture, analytics layer, startup flow, recurring check flow
- Re-ingested [[architecture/codebase-structure]] — analytics/ directory, barrel files, .nvmrc, where-to-add-guide
- Re-ingested [[conventions/coding-conventions]] — import patterns, ESLint config, component structure, barrel exports
- Re-ingested [[architecture/testing-status]] — comprehensive test candidate tables, recommended Vitest setup
- Re-ingested [[architecture/concerns-and-tech-debt]] — 15+ issues, 3 new bugs, dnd-kit version mismatch, pro license risk
