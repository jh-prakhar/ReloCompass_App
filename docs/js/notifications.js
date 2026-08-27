/**
 * ReloCompass — Notifications bell + dropdown.
 * Injected into the navbar by auth.js updateNav() (both desktop .nav-actions
 * and mobile #mobile-menu). Survives nav rewrites because updateNav re-mounts
 * it via Notif.mount() on every 'relo:navupdated' event.
 */
const Notif = (function () {
  const BELL_ID = 'notif-bell';
  let unread = 0;
  let open = false;

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function timeAgo(iso) {
    if (!iso) return '';
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    return Math.floor(s / 86400) + 'd ago';
  }

  function renderBadge() {
    document.querySelectorAll('.notif-bell').forEach((bell) => {
      const badge = bell.querySelector('.notif-badge');
      if (badge) {
        badge.style.display = unread > 0 ? 'flex' : 'none';
        badge.textContent = unread > 9 ? '9+' : String(unread);
      }
    });
  }

  async function refreshUnread() {
    if (!(window.Auth && Auth.isLoggedIn())) { unread = 0; renderBadge(); return; }
    try {
      const res = await Auth.apiRequest('/notifications/unread-count');
      if (res.ok) { unread = (await res.json()).count; }
    } catch { /* offline */ }
    renderBadge();
  }

  async function renderList() {
    const panel = document.getElementById('notif-panel');
    if (!panel) return;
    panel.innerHTML = '<div class="notif-loading">Loading…</div>';
    try {
      const res = await Auth.apiRequest('/notifications/?limit=20');
      const items = res.ok ? await res.json() : null;
      if (!items) throw new Error();
      if (!items.length) {
        panel.innerHTML = '<div class="notif-empty">No notifications yet.</div>';
        return;
      }
      panel.innerHTML = items.map(n => `
        <div class="notif-item ${n.is_read ? '' : 'unread'}" data-id="${n.id}">
          <div class="notif-item-title">${esc(n.title)}</div>
          ${n.body ? `<div class="notif-item-body">${esc(n.body)}</div>` : ''}
          <div class="notif-item-time">${timeAgo(n.created_at)}</div>
        </div>`).join('');
      panel.querySelectorAll('.notif-item').forEach(el => {
        el.addEventListener('click', async () => {
          if (el.classList.contains('unread')) {
            try { await Auth.apiRequest('/notifications/' + el.dataset.id + '/read', { method: 'POST' }); } catch { }
            el.classList.remove('unread');
            unread = Math.max(0, unread - 1);
            renderBadge();
          }
        });
      });
      const markAll = document.createElement('button');
      markAll.className = 'notif-markall';
      markAll.textContent = 'Mark all read';
      markAll.addEventListener('click', async () => {
        try {
          await Auth.apiRequest('/notifications/read-all', { method: 'POST' });
          unread = 0; renderBadge(); renderList();
        } catch { }
      });
      panel.appendChild(markAll);
    } catch {
      panel.innerHTML = '<div class="notif-empty">Could not load notifications.</div>';
    }
  }

  function injectStyles() {
    if (document.getElementById('notif-styles')) return;
    const st = document.createElement('style');
    st.id = 'notif-styles';
    st.textContent = `
      .notif-bell { position:relative; display:inline-flex; align-items:center; justify-content:center;
        width:38px; height:38px; border-radius:10px; border:1px solid var(--border, #E2E8F0);
        background:transparent; cursor:pointer; color:inherit; }
      .notif-bell:hover { border-color:#3B82F6; color:#3B82F6; }
      .notif-badge { position:absolute; top:-6px; right:-6px; min-width:17px; height:17px; padding:0 4px;
        background:#E11D48; color:#fff; font-size:0.62rem; font-weight:700; border-radius:99px;
        display:none; align-items:center; justify-content:center; }
      .notif-wrap { position:relative; }
      .notif-panel { position:absolute; top:calc(100% + 10px); right:0; width:320px; max-width:88vw;
        background:var(--surface, #fff); border:1px solid var(--border, #E2E8F0); border-radius:14px;
        box-shadow:0 12px 40px rgba(15,23,42,.18); padding:0.5rem; z-index:1200; display:none; max-height:380px; overflow:auto; }
      .notif-panel.open { display:block; }
      .notif-item { padding:0.65rem 0.75rem; border-radius:10px; cursor:pointer; }
      .notif-item:hover { background:rgba(59,130,246,.06); }
      .notif-item.unread { background:rgba(59,130,246,.09); }
      .notif-item-title { font-size:0.82rem; font-weight:600; }
      .notif-item-body { font-size:0.76rem; color:var(--text-muted,#64748B); margin-top:2px; }
      .notif-item-time { font-size:0.68rem; color:var(--text-muted,#94A3B8); margin-top:3px; }
      .notif-empty, .notif-loading { padding:1.25rem; text-align:center; font-size:0.82rem; color:var(--text-muted,#64748B); }
      .notif-markall { display:block; width:100%; margin-top:0.35rem; background:none; border:none;
        border-top:1px solid var(--border,#E2E8F0); padding:0.6rem; font-size:0.76rem; font-weight:600;
        color:#3B82F6; cursor:pointer; }
    `;
    document.head.appendChild(st);
  }

  function buildBell() {
    injectStyles();
    const wrap = document.createElement('div');
    wrap.className = 'notif-wrap';
    const btn = document.createElement('button');
    btn.className = 'notif-bell';
    btn.setAttribute('aria-label', 'Notifications');
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      <span class="notif-badge"></span>`;
    const panel = document.createElement('div');
    panel.id = 'notif-panel';
    panel.className = 'notif-panel';
    wrap.appendChild(btn); wrap.appendChild(panel);

    btn.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      open = !open;
      panel.classList.toggle('open', open);
      if (open) renderList();
    });
    document.addEventListener('click', (e) => {
      if (open && !wrap.contains(e.target)) { open = false; panel.classList.remove('open'); }
    });
    return wrap;
  }

  function mount() {
    if (!(window.Auth && Auth.isLoggedIn())) return;
    // desktop
    const actions = document.querySelector('.nav-actions');
    if (actions && !actions.querySelector('.notif-bell')) {
      actions.insertBefore(buildBell(), actions.firstChild);
    }
    // mobile menu
    const mobile = document.querySelector('#mobile-menu');
    if (mobile && !mobile.querySelector('.notif-bell')) {
      const holder = document.createElement('div');
      holder.style.cssText = 'padding:0.75rem 1.25rem;border-top:1px solid var(--border,#E2E8F0)';
      holder.appendChild(buildBell());
      const mActions = mobile.querySelector('.mobile-actions');
      if (mActions) mobile.insertBefore(holder, mActions);
      else mobile.appendChild(holder);
    }
    refreshUnread();
  }

  // refresh badge every 2 min
  setInterval(refreshUnread, 120000);

  // Re-mount whenever auth.js rewrites the nav (it dispatches 'relo:navupdated'),
  // and on first load.
  document.addEventListener('relo:navupdated', () => mount());
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  return { mount, refreshUnread };
})();
window.Notif = Notif;
