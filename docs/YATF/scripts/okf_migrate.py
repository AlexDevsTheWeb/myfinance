#!/usr/bin/env python3
"""
OKF Migration Script — docs/YATF/
Adds `type` and `description` fields to every wiki page frontmatter
to make the Knowledge Bundle compliant with Open Knowledge Format v0.1.
https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md

Run from project root:
    python3 docs/YATF/scripts/okf_migrate.py
"""
import os
import re
import datetime

WIKI_ROOT = os.path.join(os.path.dirname(__file__), "..", "wiki")
WIKI_ROOT = os.path.normpath(WIKI_ROOT)

# ---------------------------------------------------------------------------
# TYPE mapping: directory → OKF type value
# ---------------------------------------------------------------------------
TYPE_MAP = {
    "features":     "Feature",
    "bugs":         "Bug",
    "decisions":    "Decision",
    "plans":        "Plan",
    "architecture": "Architecture",
    "conventions":  "Convention",
    "queries":      "Query",
    "references":   "Reference",
}

# ---------------------------------------------------------------------------
# DESCRIPTION map: wiki-relative path (no .md) → one-line description
# Sourced from index.md summary column. Extended with additional context.
# ---------------------------------------------------------------------------
DESCRIPTIONS = {
    # features
    "features/car-management-redesign/car-management-redesign":
        "Car page bento grid redesign with monthly cost averages and improved UX.",
    "features/transaction-layout-improvement/transaction-layout-improvement":
        "Two-column transaction layout with filter panel and chart on the left side.",
    "features/investment-tracking/investment-tracking":
        "ETF portfolio tracking, broker integration, PAC strategy, and asset-vs-expense separation.",
    "features/financial-projections/financial-projections":
        "Compound interest simulator with parametric sliders and real-time interactive chart.",
    "features/investment-tracking-guide/investment-tracking-guide":
        "User guide and code analysis covering the Investment & Projections feature set (EN).",
    "features/guida-investimenti/guida-investimenti":
        "Guida utente in italiano — Investimenti, Proiezioni e Budget.",
    "features/pac-automation/pac-automation":
        "Automated recurring PAC transactions with user confirmation UI.",
    "features/crud-etf-transactions/crud-etf-transactions":
        "Edit and delete ETF transactions with safe cascade recalculation.",
    "features/multi-broker-architecture/multi-broker-architecture":
        "Multi-broker and multi-asset schema refactor with BrokerSelect component.",
    "features/historical-snapshots/historical-snapshots":
        "Persistent portfolio history stored in Firestore subcollection.",
    "features/tax-inflation-modeling/tax-inflation-modeling":
        "Inflation-adjusted financial projections with real vs nominal toggle.",
    "features/ticker-validation/ticker-validation":
        "Yahoo Finance ticker validation triggered at broker config save.",
    "features/investment-tracking-v3/investment-tracking-v3":
        "V3 investment tracking: dividend ledger, capital gains tax, cash adjustments, and performance prefill.",
    "features/budget-savings-engine/budget-savings-engine":
        "V4 budget targets, savings rate engine, progress tracking, and investment bridge.",
    "features/dashboard-redesign/dashboard-redesign":
        "Dashboard split view, account detail dialog, additional charts, and overview stat cards.",
    "features/sidebar-redesign/sidebar-redesign":
        "Vertical left sidebar with grouped navigation, collapsible mode, and user avatar.",
    "features/investment-professional-enhancements/investment-professional-enhancements":
        "Draft: per-ticker pricing, stamp duty, capital losses tracking, fees, and privacy mode.",
    "features/sidebar-routing-refactor/sidebar-routing-refactor":
        "Sidebar flat links, /finance + /investments tabbed pages, removed duplicate title.",
    "features/user-configurable-rates/user-configurable-rates":
        "User-configurable inflation and tax rates in ConfigPage > Projections tab.",
    "features/error-boundary/error-boundary":
        "React error boundary wrapping the app to catch and display render crashes gracefully.",
    "features/mui-dialogs/mui-dialogs":
        "Native alert()/confirm() replaced with MUI Dialog and Snackbar components.",
    "features/loading-states/loading-states":
        "Loading indicators on Dashboard, Transactions, and Investments pages during data sync.",
    "features/balancr-branding/balancr-branding":
        "Complete rebrand from YAFT to Balancr: Linked Hexagons logo and new color palette.",
    "features/budget-savings-architecture/budget-savings-architecture":
        "Architecture reference for the Budget & Savings Rate module: data flow, Firestore schema, and component tree.",

    # bugs
    "bugs/car-statistics-year":
        "Car page 'Statistics {year}' heading shows literal '{year}' placeholder — fixed.",
    "bugs/ticker-persistence":
        "BrokerAccount ticker field not persisted; PAC creates transactions with wrong ticker — fixed.",
    "bugs/recurring-transaction-monthofyear":
        "Yearly recurring transactions ignore monthOfYear and generate in wrong month — fixed.",
    "bugs/recurring-transaction-duplicates-same-period":
        "checkRecurring generates duplicate transactions alongside manual ones on every page load — fixed.",

    # decisions
    "decisions/typescript-7-upgrade":
        "TypeScript 7.0 Go-rewrite adoption with ESLint linting workaround via @typescript/typescript6.",
    "decisions/chart-migration-mui":
        "Migration of 16 chart components from Recharts to MUI X Charts for theme-awareness.",
    "decisions/saas-readiness":
        "Hard blockers vs ship-as-is analysis: fix 6 critical items, launch, iterate with real users.",
    "decisions/pwa-strategy":
        "PWA-first mobile strategy before Flutter — mobile support without a full rewrite.",
    "decisions/balancr-identity-system":
        "Balancr visual identity: Linked Hexagons logo, dark palette, and gradient system.",

    # plans
    "plans/roadmap":
        "Project roadmap with phases, status, and priorities across all milestone areas.",
    "plans/car-redesign-implementation":
        "Step-by-step implementation plan for the car management page redesign.",
    "plans/transaction-layout-implementation":
        "Implementation plan for restructuring the transaction page layout.",
    "plans/investment-tracking-implementation":
        "Six-plan GSD implementation for ETF tracking, broker integration, and PAC strategy.",
    "plans/financial-projections-implementation":
        "Three-plan implementation for the simulation engine, UI shell, and routing + i18n.",
    "plans/investment-tracking-v2-enhancements":
        "Phase 12 complete — six GSD plans: multi-broker, CRUD, PAC, snapshots, inflation, ticker.",
    "plans/investment-tracking-v3-implementation":
        "V3 implementation plan: dividend tracking, capital gains tax, cash adjustments, performance prefill.",
    "plans/budget-savings-engine-implementation":
        "V4 Budget & Savings Rate implementation: six waves, eleven new files, ten modified.",
    "plans/manual-review-99-implementation":
        "Five-wave plan: bug fixes, padding, account dialog, dashboard charts, and sidebar.",
    "plans/backup-restore-data-coverage":
        "Plan to add missing budget and investment data to the backup/restore feature.",
    "plans/user-configurable-rates-implementation":
        "Six-step implementation plan for user-configurable inflation and tax rates — completed.",
    "plans/italian-tax-enhancements":
        "Stamp duty (0.20%) and capital losses tracking — five-wave task breakdown.",
    "plans/go-to-market":
        "MAX PRIORITY: six-phase SaaS launch plan from quick wins through beta to monetization.",
    "plans/beta-launch-playbook":
        "Phase 2 execution details: disclaimer banner, backup/restore verification, tester invitation.",

    # architecture
    "architecture/project-state":
        "Current project state, active focus areas, and next prioritized steps.",
    "architecture/tech-stack":
        "Full technology stack with library versions and dependency overview.",
    "architecture/codebase-structure":
        "Directory layout, file naming conventions, and source organization.",
    "architecture/system-architecture":
        "System overview, component responsibilities, and end-to-end data flow.",
    "architecture/external-integrations":
        "Firebase configuration, environment variables, and CI/CD integration status.",
    "architecture/versioning":
        "Versioning scheme using conventional commits and the standard-version release pipeline.",
    "architecture/testing-status":
        "Current testing infrastructure status — no test suite exists.",
    "architecture/concerns-and-tech-debt":
        "Known tech debt, open bugs, security gaps, and performance concerns.",
    "architecture/investment-tracking-architecture":
        "Investment data flow, V1+V2 Firestore schema, store architecture, and component tree.",
    "architecture/financial-projections-architecture":
        "Simulation data flow, component tree, design decisions, and integration points.",
    "architecture/budget-savings-architecture":
        "Budget data flow, Firestore schema, store architecture, component tree, and charting.",
    "architecture/user-settings-data-flow":
        "User settings architecture: Firestore field, Zustand store, and component tree.",

    # conventions
    "conventions/branch-strategy":
        "Git branch naming rules, PR workflow, and merge conventions.",
    "conventions/coding-conventions":
        "Naming conventions, import order, error handling patterns, and code style.",

    # queries
    "queries/app-review":
        "Comprehensive app audit: strengths, weaknesses, architecture anti-patterns, and improvement suggestions.",
    "queries/new-user-auth-flow":
        "New user registration flow analysis via Google Auth — data isolation, concerns, and false alarms.",

    # references
    "references/llm-wiki-pattern":
        "Karpathy's LLM Wiki pattern — original article and rationale behind this wiki's design.",
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def extract_frontmatter(content):
    """Returns (frontmatter_str, body_str) or ('', content) if no frontmatter."""
    m = re.match(r'^---\n(.*?)\n---\n(.*)', content, re.DOTALL)
    if m:
        return m.group(1), m.group(2)
    return '', content


def set_field_in_frontmatter(fm_str, key, value):
    """
    Insert or replace a key in a YAML frontmatter string.
    Inserts `type` as the very first field; `description` as the second field.
    """
    pattern = rf'^{re.escape(key)}:.*$'
    new_line = f'{key}: "{value}"' if key == 'description' else f'{key}: {value}'

    if re.search(pattern, fm_str, re.MULTILINE):
        # Replace existing
        return re.sub(pattern, new_line, fm_str, flags=re.MULTILINE)
    else:
        # Insert: type → line 1, description → line 2 (after type)
        lines = fm_str.split('\n')
        if key == 'type':
            lines.insert(0, new_line)
        elif key == 'description':
            # Insert after type line if present, else line 1
            insert_pos = 1
            for i, line in enumerate(lines):
                if line.startswith('type:'):
                    insert_pos = i + 1
                    break
            lines.insert(insert_pos, new_line)
        else:
            lines.append(new_line)
        return '\n'.join(lines)


def migrate_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()

    fm_str, body = extract_frontmatter(original)
    if not fm_str and not original.startswith('---'):
        print(f"  [SKIP — no frontmatter] {filepath}")
        return False

    # Determine category and concept ID
    rel = os.path.relpath(filepath, WIKI_ROOT)
    category = rel.split(os.sep)[0]
    concept_id = rel.replace(os.sep, '/').removesuffix('.md')

    okf_type = TYPE_MAP.get(category, 'Concept')
    description = DESCRIPTIONS.get(concept_id, '')

    # Apply changes
    new_fm = fm_str
    if 'type:' not in new_fm:
        new_fm = set_field_in_frontmatter(new_fm, 'type', okf_type)
    if 'description:' not in new_fm and description:
        new_fm = set_field_in_frontmatter(new_fm, 'description', description)

    if new_fm == fm_str:
        print(f"  [no-op] {rel}")
        return False

    new_content = f"---\n{new_fm}\n---\n{body}"
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"  [updated] {rel}")
    return True


# ---------------------------------------------------------------------------
# Subdirectory index.md generation
# ---------------------------------------------------------------------------

SUBDIR_DESCRIPTIONS = {
    "features":     "Feature pages describing all implemented, planned, and deprecated features.",
    "bugs":         "Bug analysis pages: symptoms, root cause, reproduction steps, and fixes.",
    "decisions":    "Architecture Decision Records (ADRs) and trade-off analyses.",
    "plans":        "Implementation plans, step-by-step breakdowns, and roadmap items.",
    "architecture": "System architecture, component diagrams, data flow, and tech stack.",
    "conventions":  "Branch strategy, coding style, naming conventions, and workflow rules.",
    "queries":      "Answered queries and analysis reports filed for future reference.",
    "references":   "External references, links, and foundational resources.",
}

def make_subdir_index(category, files):
    """Generate an OKF-compliant index.md for a wiki subdirectory."""
    desc = SUBDIR_DESCRIPTIONS.get(category, f"Knowledge pages in the {category} category.")
    title = category.replace('-', ' ').title()
    today = datetime.date.today().isoformat()

    rows = []
    for f in sorted(files):
        concept_id = f.replace(os.sep, '/').removesuffix('.md')
        desc_text = DESCRIPTIONS.get(concept_id, '')
        # Make an Obsidian-style wiki link
        name = concept_id.split('/')[-1]
        link = f"[[{concept_id}|{name}]]"
        rows.append(f"| {link} | {desc_text} |")

    table_header = "| Concept | Description |\n|---------|-------------|"
    table = table_header + "\n" + "\n".join(rows) if rows else "_No pages yet._"

    return f"""---
type: Index
title: "{title} — Index"
description: "{desc}"
timestamp: {today}
---

# {title}

{desc}

## Pages

{table}
"""


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    updated = 0
    skipped = 0

    print("\n=== Migrating wiki pages ===")
    for root, dirs, files in os.walk(WIKI_ROOT):
        dirs.sort()
        for fn in sorted(files):
            if fn.endswith('.md') and fn != 'index.md':
                path = os.path.join(root, fn)
                if migrate_file(path):
                    updated += 1
                else:
                    skipped += 1

    print(f"\n=== Creating subdirectory index.md files ===")
    for category in sorted(TYPE_MAP.keys()):
        cat_dir = os.path.join(WIKI_ROOT, category)
        if not os.path.isdir(cat_dir):
            continue
        # Collect all md files relative to cat_dir
        rel_files = []
        for root, dirs, files in os.walk(cat_dir):
            for fn in files:
                if fn.endswith('.md') and fn != 'index.md':
                    rel = os.path.relpath(os.path.join(root, fn), WIKI_ROOT)
                    rel_files.append(rel)
        index_path = os.path.join(cat_dir, 'index.md')
        content = make_subdir_index(category, rel_files)
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  [created] wiki/{category}/index.md  ({len(rel_files)} pages)")

    print(f"\n=== Done ===")
    print(f"  Pages updated : {updated}")
    print(f"  Pages skipped : {skipped}")
    print(f"  Subdir indexes: {len(TYPE_MAP)}")


if __name__ == '__main__':
    main()
