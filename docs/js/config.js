/**
 * ReloCompass Frontend Configuration
 * API base URL — change this when deploying the backend to a different host.
 */
const API_CONFIG = {
  /**
   * Backend API URL.
   * - GitHub Pages (jh-prakhar.github.io): keep the hosted backend URL below
   * - Local development (localhost): defaults to http://localhost:8000
   * - Other environments: set BACKEND_URL to your backend's public URL
   *
   * IMPORTANT: Update this value when you deploy the backend to a new host.
   */
  BACKEND_URL: 'https://relocompass-tpfpaa.drytis.dev', // ← Hosted FastAPI backend (workspace deployment)

  // Auto-detect environment when BACKEND_URL is not set
  get BASE_URL() {
    const host = window.location.hostname;

    // Local development — API on separate port (local backend wins over
    // the hosted URL so devs can run their own instance)
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8000';
    }

    // Explicitly configured backend host (e.g. GitHub Pages → hosted API)
    if (this.BACKEND_URL) return this.BACKEND_URL;

    // Same-origin as backend (preview/staging) — relative URLs.
    return '';
  },

  API_PREFIX: '/api',
  get API_URL() { return this.BASE_URL + this.API_PREFIX; }
};
