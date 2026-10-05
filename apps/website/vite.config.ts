import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

// The .env files live at the REPOSITORY root and are gitignored, so they are
// not inside this workspace. Vite's default envDir is the project root, which
// here is apps/website -- so it would find nothing and every import.meta.env
// lookup would silently inline `undefined`. That is exactly the bug fixed in
// apps/web by #192, so the same treatment applies from the start.
//
// No secrets are needed to build the marketing site today; this is here so
// that adding analytics or a public site URL later cannot regress silently.
const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

export default defineConfig({
  envDir: repoRoot,
  plugins: [react()],
  server: {
    port: 5174,
  },
  build: {
    // Marketing site is content, not application code. The entry chunk is
    // ~455 kB (142 kB gzip) with the waitlist dialog split into its own lazy
    // chunk, so this budget leaves roughly 10% of headroom: enough to absorb a
    // new section, tight enough to surface an accidental barrel import or a
    // forgotten code split instead of shipping it quietly.
    chunkSizeWarningLimit: 500,
  },
})