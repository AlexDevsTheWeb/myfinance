#!/usr/bin/env bash
# .git/hooks/pre-commit — OKF compliance gate
#
# Blocks commits that add new wiki pages missing `type` or `description`.
# Runs the check-only mode of the OKF migration script.
#
# Install:
#   chmod +x .git/hooks/pre-commit
#   (already installed if you ran the setup script)

set -euo pipefail

# Only run if there are staged changes in the wiki
WIKI_STAGED=$(git diff --cached --name-only | grep "^docs/YATF/wiki/" | grep "\.md$" | grep -v "/index\.md$" || true)

if [ -z "$WIKI_STAGED" ]; then
  exit 0  # No wiki pages staged, nothing to check
fi

echo "🔍 OKF pre-commit check: scanning staged wiki pages..."

# Run check-only mode — exits 1 if any page is non-compliant
if ! python3 docs/YATF/scripts/okf_migrate.py --check; then
  echo ""
  echo "❌ Commit blocked: wiki pages are missing OKF-required frontmatter fields."
  echo "   Add 'type' and 'description' to the pages listed above, then re-commit."
  echo "   Or run: python3 docs/YATF/scripts/okf_migrate.py   (to auto-fix all pages)"
  echo ""
  exit 1
fi

echo "✅ OKF check passed."
exit 0
