#!/usr/bin/env python3
"""
OKF bundle validator — docs/

Dependency-free linter for the MyFinance knowledge bundle. Verifies that every
wiki page is a valid Open Knowledge Format (OKF v0.1) concept and that the
bundle stays navigable.

Checks
------
  frontmatter   YAML block present, `type` valid for the page's category,
                `description` present
  sources       every path in `sources:` resolves on disk        (warning)
  links         every relative markdown link resolves
  wikilinks     every [[wiki/...]] target exists
  index         page listed in docs/index.md and wiki/<cat>/index.md
  orphans       page has no inbound/outbound wiki links          (warning)

Usage
-----
    python3 docs/scripts/okf_validate.py            # full check
    python3 docs/scripts/okf_validate.py --fix      # add missing `type` fields
    python3 docs/scripts/okf_validate.py --quiet    # only failures

Exit code is 0 when there are no errors, 1 otherwise. Warnings do not fail.
"""
from __future__ import annotations

import argparse
import os
import re
import sys

DOCS_ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
REPO_ROOT = os.path.dirname(DOCS_ROOT)
WIKI_ROOT = os.path.join(DOCS_ROOT, "wiki")

TYPE_MAP = {
    "features": "Feature",
    "bugs": "Bug",
    "decisions": "Decision",
    "plans": "Plan",
    "architecture": "Architecture",
    "conventions": "Convention",
    "queries": "Query",
    "references": "Reference",
}

REQUIRED_FIELDS = ("type", "description")

# Implementation reports: report-YYYY-MM-DD.md or <slug>-report-YYYY-MM-DD.md
REPORT_RE = re.compile(r"(?:^|-)report-\d{4}-\d{2}-\d{2}\.md$")
REPORT_TYPE = "Report"
# Core sections every report must carry; the honesty sections are load-bearing.
REPORT_SECTIONS = ("Context", "Changes", "Decisions", "Deviation", "Verification", "Not verified")

FRONTMATTER_RE = re.compile(r"\A---\r?\n(.*?)\r?\n---\r?\n", re.DOTALL)
MD_LINK_RE = re.compile(r"(?<!!)\[[^\]]*\]\(([^)]+)\)")


class Report:
    def __init__(self, quiet: bool = False) -> None:
        self.quiet = quiet
        self.errors: list[tuple[str, str]] = []
        self.warnings: list[tuple[str, str]] = []

    def error(self, path: str, message: str) -> None:
        self.errors.append((path, message))

    def warn(self, path: str, message: str) -> None:
        self.warnings.append((path, message))

    def ok(self, message: str) -> None:
        if not self.quiet:
            print(f"  ✅ {message}")

    def dump(self) -> int:
        if self.warnings:
            print(f"\n⚠️  {len(self.warnings)} warning(s):")
            for path, message in self.warnings:
                print(f"   {path}: {message}")
        if self.errors:
            print(f"\n❌ {len(self.errors)} error(s):")
            for path, message in self.errors:
                print(f"   {path}: {message}")
            print("\nFix the errors above, then re-run the validator.")
            return 1
        print(f"\n✅ OKF validation passed ({len(self.warnings)} warning(s)).")
        return 0


def rel(path: str) -> str:
    return os.path.relpath(path, DOCS_ROOT)


def parse_frontmatter(text: str) -> dict[str, str]:
    """Minimal frontmatter parser — flat `key: value` pairs only (no PyYAML needed)."""
    match = FRONTMATTER_RE.match(text)
    if not match:
        return {}
    fields: dict[str, str] = {}
    for line in match.group(1).splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        key, sep, value = line.partition(":")
        if not sep:
            continue
        fields[key.strip()] = value.strip().strip("\"'")
    return fields


def collect_pages() -> list[str]:
    pages: list[str] = []
    for root, dirs, files in os.walk(WIKI_ROOT):
        dirs.sort()
        for name in sorted(files):
            if name.endswith(".md") and name != "index.md":
                pages.append(os.path.join(root, name))
    return pages


def is_report(path: str) -> bool:
    """True for implementation report files (distinguished by filename)."""
    return bool(REPORT_RE.search(os.path.basename(path)))


def category_of(path: str) -> str:
    return os.path.relpath(path, WIKI_ROOT).split(os.sep)[0]


def concept_id(path: str) -> str:
    """wiki-relative concept id, e.g. features/foo/foo"""
    return os.path.relpath(path, DOCS_ROOT).removesuffix(".md").replace(os.sep, "/")


def strip_code(text: str) -> str:
    """Remove fenced code blocks and inline code so snippets are not parsed as links."""
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
    return re.sub(r"`[^`\n]*`", "", text)


def check_frontmatter(path: str, text: str, report: Report, fix: bool) -> None:
    fields = parse_frontmatter(text)
    if not fields:
        report.error(rel(path), "missing YAML frontmatter")
        return

    expected = REPORT_TYPE if is_report(path) else TYPE_MAP.get(category_of(path))

    missing = [field for field in REQUIRED_FIELDS if not fields.get(field)]
    if fix and "type" in missing:
        if expected:
            body = text.replace("---\n", f'---\ntype: {expected}\n', 1)
            with open(path, "w", encoding="utf-8") as handle:
                handle.write(body)
            print(f"  🔧 {rel(path)}: added type: {expected}")
            missing.remove("type")
            fields["type"] = expected

    for field in missing:
        report.error(rel(path), f"missing `{field}`")

    actual = fields.get("type")
    if expected and actual and actual != expected:
        if is_report(path):
            report.error(rel(path), f"report must have type `{REPORT_TYPE}`, found `{actual}`")
        else:
            report.warn(rel(path), f"type `{actual}` does not match directory (expected `{expected}`)")

    if is_report(path) and not fields.get("resource"):
        report.error(rel(path), "report is missing `resource` (PR or branch URL)")


def check_report_sections(path: str, text: str, report: Report) -> None:
    if not is_report(path):
        return
    headings = re.findall(r"^#{2,3}\s+(.+)$", text, re.MULTILINE)
    lowered = [heading.lower() for heading in headings]
    for section in REPORT_SECTIONS:
        if not any(heading.startswith(section.lower()) for heading in lowered):
            report.error(rel(path), f"report is missing the `## {section}` section")


def check_sources(path: str, fields: dict[str, str], report: Report) -> None:
    raw = fields.get("sources", "")
    if not raw:
        return
    for source in re.findall(r"[\"']([^\"']+)[\"']", raw) or [raw]:
        source = source.strip()
        if not source or source.startswith(("http://", "https://")):
            continue
        # sources are written relative to docs/, but repo-root paths are accepted too
        candidates = (
            os.path.normpath(os.path.join(DOCS_ROOT, source)),
            os.path.normpath(os.path.join(REPO_ROOT, source)),
        )
        if not any(os.path.exists(candidate) for candidate in candidates):
            report.warn(rel(path), f"source not found: {source}")


def check_links(path: str, text: str, report: Report) -> None:
    body = strip_code(text)
    base = os.path.dirname(path)
    for target in MD_LINK_RE.findall(body):
        target = target.strip().split("#", 1)[0].strip()
        if not target or target.startswith(("http://", "https://", "mailto:", "tel:")):
            continue
        if target.startswith("<") or target.startswith("{{"):
            continue
        candidate = os.path.normpath(os.path.join(base, target))
        if os.path.exists(candidate):
            continue
        # tolerate docs-relative paths (`raw/...`, `wiki/...`)
        fallback = os.path.normpath(os.path.join(DOCS_ROOT, target))
        if os.path.exists(fallback):
            continue
        report.error(rel(path), f"broken link: {target}")


def check_wikilinks(path: str, text: str, known: set[str], report: Report) -> list[str]:
    body = strip_code(text)
    found: list[str] = []
    for match in re.findall(r"\[\[([^\]|#]+)", body):
        target = match.strip()
        if not target.startswith("wiki/"):
            report.warn(rel(path), f"non-standard wikilink: [[{target}]]")
            continue
        found.append(target)
        if target not in known:
            report.error(rel(path), f"broken wikilink: [[{target}]]")
    return found


def check_index_coverage(pages: list[str], contents: dict[str, str], report: Report) -> None:
    root_index_path = os.path.join(DOCS_ROOT, "index.md")
    root_index = contents.get(root_index_path, "")
    for path in pages:
        if is_report(path):
            continue  # reports are linked from their parent, never listed in an index
        cid = concept_id(path)
        if f"[[{cid}" not in root_index:
            report.error(rel(path), "not listed in docs/index.md")
        category = category_of(path)
        category_index = contents.get(os.path.join(WIKI_ROOT, category, "index.md"), "")
        if f"[[{cid}" not in category_index:
            report.error(rel(path), f"not listed in wiki/{category}/index.md")


def check_report_links(pages: list[str], outbound: dict[str, list[str]], report: Report) -> None:
    """Every report must be linked from a non-report page in its own category."""
    concept_pages = [path for path in pages if not is_report(path)]
    for path in pages:
        if not is_report(path):
            continue
        target = concept_id(path)
        category = category_of(path)
        inbound = [
            source
            for source in concept_pages
            if target in outbound.get(source, []) and category_of(source) == category
        ]
        if not inbound:
            report.error(
                rel(path),
                "report is not linked from any concept page in its category "
                "(add it to the parent page's `## Related`)",
            )


def check_orphans(pages: list[str], outbound: dict[str, list[str]], report: Report) -> None:
    inbound: dict[str, set[str]] = {concept_id(p): set() for p in pages}
    for path, targets in outbound.items():
        for target in targets:
            if target in inbound and target != concept_id(path):
                inbound[target].add(concept_id(path))
    for path in pages:
        cid = concept_id(path)
        if not inbound[cid]:
            report.warn(rel(path), "orphan: no inbound wikilinks (add it to a related page)")


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate the docs/ OKF knowledge bundle.")
    parser.add_argument("--fix", action="store_true", help="add missing `type` fields in place")
    parser.add_argument("--quiet", action="store_true", help="suppress success output")
    parser.add_argument("--orphans", action="store_true", help="report pages with no inbound links from other pages")
    args = parser.parse_args()

    report = Report(quiet=args.quiet)
    pages = collect_pages()
    contents: dict[str, str] = {}

    index_files = [os.path.join(DOCS_ROOT, "index.md")]
    for category in TYPE_MAP:
        candidate = os.path.join(WIKI_ROOT, category, "index.md")
        if os.path.exists(candidate):
            index_files.append(candidate)

    for path in index_files + pages:
        with open(path, encoding="utf-8") as handle:
            contents[path] = handle.read()

    known = {concept_id(path) for path in pages}

    if not args.quiet:
        print(f"=== OKF validation — {len(pages)} wiki pages ===")

    outbound: dict[str, list[str]] = {}
    for path in pages:
        text = contents[path]
        fields = parse_frontmatter(text)
        check_frontmatter(path, text, report, fix=args.fix)
        check_report_sections(path, text, report)
        check_sources(path, fields, report)
        check_links(path, text, report)
        outbound[path] = check_wikilinks(path, text, known, report)

    check_index_coverage(pages, contents, report)
    check_report_links(pages, outbound, report)
    if args.orphans:
        check_orphans(pages, outbound, report)

    if not report.errors and not report.warnings:
        report.ok(f"{len(pages)} pages valid, indexes complete")

    return report.dump()


if __name__ == "__main__":
    sys.exit(main())
