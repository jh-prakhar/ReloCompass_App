/**
 * ReloCompass Frontend Configuration
 * API base URL — change this when deploying the backend to a different host.
 */
const API_CONFIG = {
  /**
   * Backend API URL.
   * - GitHub Pages (jh-prakhar.github.io): set BACKEND_URL below to your deployed backend
   * - Local development (localhost): defaults to http://localhost:8000
   * - Other environments: set BACKEND_URL to your backend's public URL
   *
   * IMPORTANT: Update this value when you deploy the backend to a new host.
   */
  BACKEND_URL: '', // ← Set your backend URL here for production (e.g. 'https://api.yourdomain.com')

  // Auto-detect environment when BACKEND_URL is not set
  get BASE_URL() {
    if (this.BACKEND_URL) return this.BACKEND_URL;

    const host = window.location.hostname;

    // Local development — API on separate port
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8000';
    }

    // If served from same origin as backend (preview/staging),
    // relative URLs work — no BASE_URL needed.
    // GitHub Pages users: set BACKEND_URL to your backend's public URL above.
    return '';
  },

  API_PREFIX: '/api',
  get API_URL() { return this.BASE_URL + this.API_PREFIX; }
};
