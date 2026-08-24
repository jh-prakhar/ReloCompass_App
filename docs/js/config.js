/**
 * ReloCompass Frontend Configuration
 * API base URL resolution — no hardcoded hosts.
 *
 * Resolution order:
 * 1. localStorage 'relo_backend_url' — explicit override (set by the user
 *    or an ops script); highest priority.
 * 2. window.location.origin — same-origin (preview/staging/self-hosted),
 *    i.e. API served by the same host as these pages.
 * 3. localhost/127.0.0.1 pages → http://localhost:8000 (local dev server).
 *
 * For a GitHub Pages-style static deployment, set the override once:
 *   localStorage.setItem('relo_backend_url', 'https://your-backend.example')
 */
const API_CONFIG = {
  get BASE_URL() {
    // Explicit override (survives reloads, travels with the browser)
    let override = null;
    try { override = localStorage.getItem('relo_backend_url'); } catch (e) { /* private mode */ }
    if (override) return override.replace(/\/$/, '');

    const host = window.location.hostname;

    // Local development — API on the standard local port
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8000';
    }

    // Same-origin as backend (preview/staging/prod) — relative URLs.
    return '';
  },

  API_PREFIX: '/api',
  get API_URL() { return this.BASE_URL + this.API_PREFIX; }
};