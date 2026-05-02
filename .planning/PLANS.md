# SemVer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement semantic versioning triggered on PR merge to main, with version displayed in a footer on all pages.

**Architecture:** 
- Use standard-version with GitHub Actions to auto-bump version on PR merge
- Generate version file at build time via Vite prebuild script
- Display version in fixed footer component

**Tech Stack:** Node.js, GitHub Actions, standard-version, Vite

---

### Task 1: Create GitHub Actions workflow

**Files:**
- Create: `.github/workflows/version-bump.yml`

- [ ] **Step 1: Create workflow directory and file**

```bash
mkdir -p .github/workflows
```

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
      
      - name: Install standard-version
        run: npm install --save-dev standard-version
      
      - name: Bump version
        run: npx standard-version
      
      - name: Push changes
        run: git push && git push --tags
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/version-bump.yml
git commit -m "ci: add version bump workflow on PR merge"
```

---

### Task 2: Create .versionrc configuration

**Files:**
- Create: `.versionrc`

- [ ] **Step 1: Write .versionrc file**

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

- [ ] **Step 2: Commit**

```bash
git add .versionrc
git commit -m "config: add standard-version configuration"
```

---

### Task 3: Create version generation script

**Files:**
- Create: `scripts/generate-version.js`

- [ ] **Step 1: Create scripts directory**

```bash
mkdir -p scripts
```

- [ ] **Step 2: Write generate-version.js**

```javascript
import { writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

const version = packageJson.version;
const date = new Date().toISOString();
const commit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();

const content = `// Auto-generated - do not edit
export const version = '${version}';
export const buildDate = '${date}';
export const commit = '${commit}';
`;

const versionPath = join(__dirname, '..', 'src', 'version.ts');
writeFileSync(versionPath, content);

console.log(`Generated version: ${version} (${commit})`);
```

Note: Add `import { readFileSync } from 'fs';` at the top.

- [ ] **Step 3: Commit**

```bash
git add scripts/generate-version.js
git commit -m "build: add version generation script"
```

---

### Task 4: Update package.json with prebuild script

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add prebuild script**

Add to scripts:
```json
"prebuild": "node scripts/generate-version.js"
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "build: add prebuild script for version generation"
```

---

### Task 5: Create VersionFooter component

**Files:**
- Create: `src/components/common/VersionFooter.tsx`

- [ ] **Step 1: Create common components directory**

```bash
mkdir -p src/components/common
```

- [ ] **Step 2: Write VersionFooter component**

```tsx
import { Box, Typography } from '@mui/material';
import { version, commit } from '../../version';
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
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="caption" color="text.secondary">
        v{version}
        {import.meta.env.DEV && ` • ${commit}`}
      </Typography>
    </Box>
  );
};
```

Add `import React from 'react';` at the top.

- [ ] **Step 3: Commit**

```bash
git add src/components/common/VersionFooter.tsx
git commit -m "feat: add VersionFooter component"
```

---

### Task 6: Add footer to Layout

**Files:**
- Modify: `src/components/layout/Layout.tsx`

- [ ] **Step 1: Import VersionFooter**

Add import:
```tsx
import { VersionFooter } from '../common/VersionFooter';
```

- [ ] **Step 2: Add footer before closing Box**

Find the closing `</Box>` at the end of the component and add before it:
```tsx
          <VersionFooter />
        </Box>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Layout.tsx
git commit -m "feat: add version footer to all pages"
```

---

### Task 7: Test the build

**Files:**
- None (verification)

- [ ] **Step 1: Run build**

```bash
npm run build
```

- [ ] **Step 2: Verify version.ts generated**

Check that `src/version.ts` contains the version.

- [ ] **Step 3: Commit all remaining changes**

```bash
git add .
git commit -m "feat: complete semver implementation"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | GitHub Actions workflow |
| 2 | .versionrc config |
| 3 | Version generation script |
| 4 | package.json prebuild |
| 5 | VersionFooter component |
| 6 | Add footer to Layout |
| 7 | Test build |

**Plan complete.**