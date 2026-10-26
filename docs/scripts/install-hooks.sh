#!/usr/bin/env bash
# Installs the repository git hooks (currently: the OKF pre-commit gate).
#
# Usage: npm run hooks:install   (or bash docs/scripts/install-hooks.sh)
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

git config core.hooksPath .githooks
chmod +x .githooks/*

echo "✅ Git hooks enabled (core.hooksPath = .githooks)"
echo "   Pre-commit will validate docs/ before every commit that touches the wiki."
