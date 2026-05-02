# SemVer + Version Display Specification

**Date:** 2026-05-02

## Overview

- Implement semantic versioning triggered on PR merge to main
- Display version in footer on all pages

## Part 1: CI/CD Version Bump

### Trigger

- GitHub Actions workflow runs on: `pull_request` target `main` with `types: [closed]` AND `mergeable: true`
- Alternatively: run on `push to main` and check if it's a merge commit

### Tool

Use [standard-version](https://github.com/conventional-changelog/standard-version):
- Analyzes conventional commits since last release
- Auto-increments based on commit types:
  - `fix:` → patch (e.g., 1.0.0 → 1.0.1)
  - `feat:` → minor (e.g., 1.0.0 → 1.1.0)
  - `feat!:` or `BREAKING CHANGE:` → major

### Workflow Steps

1. Checkout code
2. Install Node.js
3. Install dependencies (`npm ci`)
4. Run `npx standard-version` (pre-release mode)
5. If version changed:
   - Commit version bump
   - Create git tag (`v{major.minor.patch}`)
   - Push commit + tag
6. (Optional) Create GitHub Release

### Configuration

`.versionrc`:
```json
{
  "types": [
    { "type": "feat", "release": "minor" },
    { "type": "fix", "release": "patch" },
    { "type": "perf", "release": "patch" },
    { "type": "refactor", "release": "patch" },
    { "type": "docs", "release": "patch" },
    { "type": "style", "release": "patch" },
    { "type": "test", "release": "patch" },
    { "type": "build", "release": "patch" }
  ]
}
```

### GitHub Actions File

`.github/workflows/version-bump.yml`:
```yaml
name: Version Bump

on:
  pull_request:
    types: [closed]
    branches: [main]

jobs:
  version-bump:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Bump version
        run: npx standard-version
      
      - name: Push changes
        run: git push && git push --tags
```

---

## Part 2: Version Display in Footer

### Approach

Generate version at build-time using Vite's `define` plugin.

### Implementation

1. Add script to `package.json` to generate version file before build:
   ```json
   {
     "scripts": {
       "prebuild": "node scripts/generate-version.js",
       "build": "tsc -b && vite build"
     }
   }
   }
   ```

2. Create `scripts/generate-version.js`:
   ```javascript
   import { writeFileSync } from 'fs';
   import { execSync } from 'child_process';
   
   const version = require('./package.json').version;
   const date = new Date().toISOString();
   const commit = execSync('git rev-parse --short HEAD').toString().trim();
   
   const content = `export const version = '${version}';\nexport const buildDate = '${date}';\nexport const commit = '${commit}';\n`;
   
   writeFileSync('src/version.ts', content);
   ```

3. Create footer component `src/components/common/VersionFooter.tsx`:
   ```tsx
   import { version, buildDate, commit } from '../../version';
   import { useTranslation } from 'react-i18next';
   
   export const VersionFooter: React.FC = () => {
     const { t } = useTranslation();
     
     return (
       <Box
         component="footer"
         sx={{
           py: 1,
           px: 2,
           textAlign: 'center',
           fontSize: '0.75rem',
           color: 'text.secondary',
           borderTop: '1px solid',
           borderColor: 'divider',
         }}
       >
         v{version}
         {import.meta.env.DEV && ` • ${commit}`}
       </Box>
     );
   };
   ```

4. Add to Layout component on all pages:
   - Import `VersionFooter` component
   - Add before closing `Box` or after `children`

---

## Acceptance Criteria

- [ ] GitHub Actions workflow created in `.github/workflows/`
- [ ] Version bumps automatically on PR merge to main
- [ ] Version increment follows conventional commits
- [ ] Git tag created with version
- [ ] Footer component created
- [ ] Footer visible on all pages showing version number
- [ ] Development build shows commit hash

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `.github/workflows/version-bump.yml` | Create |
| `.versionrc` | Create |
| `scripts/generate-version.js` | Create |
| `src/components/common/VersionFooter.tsx` | Create |
| `src/components/layout/Layout.tsx` | Modify (add footer) |
| `package.json` | Modify (add prebuild script) |