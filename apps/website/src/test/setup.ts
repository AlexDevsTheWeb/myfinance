import '@testing-library/jest-dom/vitest';

// The website is English-only by decision (#193), so there is no i18n layer to
// initialize here -- unlike apps/web, which loads i18next in its own setup.

// jsdom starts with an empty <head>, so `App`'s SEO effect has nothing to
// update. Seed the same tags `index.html` ships, which also lets the tests
// assert that the client-side values overwrite the static ones.
document.head.innerHTML =
  '<title>placeholder</title><meta name="description" content="placeholder" />';
