/**
 * ReloCompass Frontend Configuration
 * API base URL resolution.
 *
 * Resolution order:
 * 1. localStorage 'relo_backend_url' — explicit override (set by the user
 *    or an ops script); highest priority.
 * 2. localhost/127.0.0.1 pages → http://localhost:8000 (local dev server).
 * 3. drytis.dev preview hosts → same-origin (API served by the same host).
 * 4. GitHub Pages (and any other static host) → the deployed Python backend.
 */
const PROD_API_URL = 'https://relocompass-tpfpaa.drytis.dev';

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

    // drytis preview/self-hosted deployments — API on the same origin
    if (host.endsWith('.drytis.dev')) {
      return '';
    }

    // GitHub Pages and any other static host — call the deployed backend.
    return PROD_API_URL;
  },

  API_PREFIX: '/api',
  get API_URL() { return this.BASE_URL + this.API_PREFIX; }
};
