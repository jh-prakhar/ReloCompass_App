/**
 * ReloCompass Frontend Authentication Module
 * Handles JWT-based auth: register, login, logout, token storage, and auth state.
 * Works on both GitHub Pages and local development.
 */

const Auth = (function () {
  const TOKEN_KEY = 'relocompass_token';
  const USER_KEY = 'relocompass_user';

  /**
   * Get the stored JWT token.
   * @returns {string|null}
   */
  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Get the stored user object.
   * @returns {object|null}
   */
  function getUser() {
    const raw = localStorage.getItem(USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if the user is logged in.
   * @returns {boolean}
   */
  function isLoggedIn() {
    return !!getToken();
  }

  /**
   * Make an authenticated API request.
   * @param {string} path — API path (e.g. '/auth/me')
   * @param {object} options — fetch options
   * @returns {Promise<Response>}
   */
  async function apiRequest(path, options = {}) {
    const url = API_CONFIG.API_URL + path;
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }
    const response = await fetch(url, { ...options, headers });
    return response;
  }

  /**
   * Register a new user.
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @param {string} role — 'student' | 'job_seeker' | 'employer'
   * @returns {Promise<{success: boolean, error?: string, user?: object}>}
   */
  async function register(name, email, password, role) {
    try {
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || 'Registration failed' };
      }
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: 'Network error. Is the backend running?' };
    }
  }

  /**
   * Login with email and password.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{success: boolean, error?: string, user?: object}>}
   */
  async function login(email, password) {
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || 'Login failed' };
      }
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: 'Network error. Is the backend running?' };
    }
  }

  /**
   * Logout — discard token and redirect to home.
   */
  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = getPagePath('index.html');
  }

  /**
   * Get the relative path to a page, accounting for whether we're on GitHub Pages
   * (in /ReloCompass_App/ subpath) or a custom domain.
   */
  function getPagePath(page) {
    // GitHub Pages: the site is at /ReloCompass_App/
    const path = window.location.pathname;
    if (path.includes('/ReloCompass_App/')) {
      return '/ReloCompass_App/' + page;
    }
    return page;
  }

  /**
   * Update navigation UI based on auth state.
   * Call on every page load.
   */
  function updateNav() {
    const loggedIn = isLoggedIn();
    const user = getUser();

    // Desktop nav actions
    const navActions = document.querySelectorAll('.nav-actions');
    const mobileActions = document.querySelectorAll('.mobile-actions');

    const authHTML = loggedIn
      ? `<span style="font-size:0.8rem;color:var(--text-muted);margin-right:0.5rem">Hi, ${user?.name?.split(' ')[0] || 'User'}</span>
         <a href="#" onclick="Auth.logout();return false;" class="btn btn-outline btn-sm">Logout</a>
         <a href="${getPagePath('dashboard.html')}" class="btn btn-primary btn-sm">Dashboard</a>`
      : `<a href="${getPagePath('login.html')}" class="btn btn-ghost btn-sm">Login</a>
         <a href="${getPagePath('register.html')}" class="btn btn-primary btn-sm">Sign Up Free</a>`;

    const mobileAuthHTML = loggedIn
      ? `<a href="${getPagePath('dashboard.html')}" class="btn btn-primary btn-sm" style="width:100%">Dashboard</a>
         <a href="#" onclick="Auth.logout();return false;" class="btn btn-outline btn-sm" style="width:100%">Logout</a>`
      : `<a href="${getPagePath('login.html')}" class="btn btn-outline btn-sm" style="width:100%">Login</a>
         <a href="${getPagePath('register.html')}" class="btn btn-primary btn-sm" style="width:100%">Sign Up Free</a>`;

    navActions.forEach(el => el.innerHTML = authHTML);
    mobileActions.forEach(el => el.innerHTML = mobileAuthHTML);
  }

  /**
   * Verify the stored token is still valid.
   * If invalid, clear it.
   */
  async function verifyToken() {
    if (!isLoggedIn()) return false;
    try {
      const res = await apiRequest('/auth/verify');
      if (!res.ok) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  // Auto-update nav on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateNav);
  } else {
    updateNav();
  }

  return {
    getToken,
    getUser,
    isLoggedIn,
    apiRequest,
    register,
    login,
    logout,
    updateNav,
    verifyToken,
    getPagePath,
  };
})();

// Make available globally
window.Auth = Auth;
