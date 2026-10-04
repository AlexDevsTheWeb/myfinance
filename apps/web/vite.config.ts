import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

// The .env files live at the REPOSITORY root, not in apps/web. They are
// gitignored, so the monorepo move (PR #191) never carried them along, and
// Vite's default envDir is the project root -- which is now apps/web. The
// result was a silent regression: Vite found 0 env vars, every getEnvVar()
// call inlined `undefined`, and firebase.ts threw at import time in the
// browser while the build reported success and CI stayed green.
//
// Resolved from this file's own URL rather than written as '../..' on
// purpose. A relative envDir is resolved against Vite's `root`, which
// defaults to process.cwd() -- so the correct value silently changes
// depending on where the command was invoked. Verified with resolveConfig():
//   envDir '..'      -> <repo>/apps  -> 0 vars
//   envDir '../..'   -> <repo>        -> 8 vars  (breaks if cwd != apps/web)
//   this expression  -> <repo>        -> 8 vars  (cwd-independent)
const repoRoot = fileURLToPath(new URL('../..', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  envDir: repoRoot,
  server: {
		port: 5173,
		open: true,
	},
  plugins: [react()],
})
