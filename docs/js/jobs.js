/**
 * ReloCompass — Jobs page logic.
 * Loads live jobs from /api/jobs, filters, detail modal, apply flow,
 * and My Applications for students/job seekers.
 */
(function () {
  'use strict';

  const grid = document.getElementById('jobs-grid');
  const statusEl = document.getElementById('jobs-status');
  const emptyEl = document.getElementById('jobs-empty');
  const myAppsSection = document.getElementById('my-applications-section');
  const myAppsList = document.getElementById('my-applications-list');
  const myAppsCount = document.getElementById('my-applications-count');

  const user = Auth.getUser();
  const isSeeker = user && (user.role === 'student' || user.role === 'job_seeker');

  let jobs = [];
  let appliedJobIds = new Set();
  let debounceTimer = null;

  // ── For You (match) section ──
  const forYouRow = document.getElementById('for-you-row');
  const forYouStatus = document.getElementById('for-you-status');

  async function loadForYou() {
    if (!isSeeker || !forYouRow) return;
    try {
      const res = await Auth.apiRequest('/jobs/match?limit=4');
      if (!res.ok) return; // silently skip for employers / server errors
      const data = await res.json();
      if (!data.matches || !data.matches.length) return;
      forYouRow.innerHTML = data.matches.map(function (m) {
        const job = m.job;
        const pct = Math.max(0, Math.min(100, m.score));
        const ring = 'hsl(' + Math.round(140 * pct / 100) + ' 70% 42%)';
        const reasons = (m.reasons || []).slice(0, 2).map(function (r) {
          return '<div class="match-reason">' + esc(r) + '</div>';
        }).join('');
        return (
          '<article class="job-card for-you-card" data-job-id="' + job.id + '">' +
          '<div class="for-you-top"><span class="for-you-badge">✨ For You</span>' +
          '<span class="match-score" style="color:' + ring + ';font-weight:700">' + pct + '% match</span></div>' +
          '<h3 class="job-card-title">' + esc(job.title) + '</h3>' +
          '<p class="job-card-company">' + esc(job.company) + '</p>' +
          '<p class="job-card-meta">' + esc(job.location || '—') + (job.visa_sponsorship ? ' · 🛂 Visa' : '') + '</p>' +
          reasons +
          '</article>'
        );
      }).join('');
      forYouRow.querySelectorAll('.for-you-card').forEach(function (card) {
        card.addEventListener('click', function () {
          openJobModal(parseInt(card.dataset.jobId, 10));
        });
      });
      const section = document.getElementById('for-you-section');
      if (section) section.style.display = 'block';
    } catch (e) {
      // Offline or auth issue — hide section quietly
      const section = document.getElementById('for-you-section');
      if (section) section.style.display = 'none';
    }
  }

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    // Entity-encode quotes too, so the result is safe in attribute contexts as well
    return d.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function timeAgo(iso) {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days <= 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return days + ' days ago';
    return new Date(iso).toLocaleDateString();
  }

  // ── Fetch + render jobs ──
  async function loadJobs() {
    const params = new URLSearchParams();
    const q = document.getElementById('filter-q').value.trim();
    const loc = document.getElementById('filter-location').value.trim();
    const type = document.getElementById('filter-type').value;
    const visa = document.getElementById('filter-visa').checked;
    if (q) params.set('q', q);
    if (loc) params.set('location', loc);
    if (type) params.set('job_type', type);
    if (visa) params.set('visa_only', 'true');

    statusEl.textContent = 'Loading jobs…';
    statusEl.style.display = 'block';
    emptyEl.style.display = 'none';
    grid.innerHTML = '';

    try {
      const res = await Auth.apiRequest('/jobs/?' + params.toString());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      jobs = await res.json();
    } catch {
      statusEl.textContent = 'Could not load jobs. Please try again shortly.';
      return;
    }

    statusEl.style.display = 'none';
    if (!jobs.length) {
      emptyEl.style.display = 'block';
      return;
    }
    renderJobs();
  }

  function renderJobs() {
    grid.innerHTML = jobs.map((job) => {
      const applied = appliedJobIds.has(job.id);
      return `
        <article class="job-card" data-id="${job.id}">
          <div class="job-card-top">
            <div>
              <h3 class="job-card-title">${esc(job.title)}${job.is_sample ? ' <span class="badge badge-sample" style="font-size:0.6rem;vertical-align:middle">SAMPLE</span>' : ''}</h3>
              <p class="job-company">${esc(job.company)}</p>
            </div>
            ${job.visa_sponsorship ? '<span class="job-visa-badge">Visa Sponsorship</span>' : ''}
          </div>
          <div class="job-meta-row">
            ${job.job_type ? `<span class="job-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>${esc(job.job_type)}</span>` : ''}
            ${job.location ? `<span class="job-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${esc(job.location)}</span>` : ''}
            <span class="job-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${timeAgo(job.created_at)}</span>
          </div>
          ${job.experience_years ? `<span class="badge badge-warning" style="align-self:flex-start;font-size:0.7rem">${esc(job.experience_years)}</span>` : ''}
          ${applied ? '<span class="badge badge-success" style="align-self:flex-start;font-size:0.7rem">✓ Applied</span>' : ''}
        </article>`;
    }).join('');

    grid.querySelectorAll('.job-card').forEach((card) => {
      card.addEventListener('click', () => openJobModal(Number(card.dataset.id)));
    });
  }

  // ── Modal ──
  function closeModal() {
    const m = document.getElementById('job-modal');
    if (m) m.remove();
    document.body.style.overflow = '';
  }

  function openJobModal(jobId) {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    closeModal();

    const applied = appliedJobIds.has(job.id);
    let actionHtml = '';
    if (isSeeker) {
      actionHtml = applied
        ? '<span class="badge badge-success">✓ You applied to this job</span>'
        : `
          <div class="form-group" style="margin-top:1.25rem">
            <label for="apply-cover-letter">Cover letter (optional)</label>
            <textarea id="apply-cover-letter" class="form-input" rows="4" placeholder="Briefly tell the employer why you're a great fit…"></textarea>
          </div>
          <button class="btn btn-primary" id="apply-btn" style="margin-top:0.75rem">Apply Now</button>
          <span id="apply-msg" style="margin-left:0.75rem;font-size:0.85rem"></span>`;
    } else if (user && user.role === 'employer') {
      actionHtml = '<p style="margin-top:1rem;font-size:0.85rem;color:var(--text-muted)">You are browsing as an employer — applications are for student and job seeker accounts.</p>';
    } else {
      actionHtml = `<div style="margin-top:1.25rem;padding:1rem;background:rgba(59,130,246,0.07);border-radius:var(--radius-sm);font-size:0.9rem"><strong>Want to apply?</strong> <a href="login.html" style="color:var(--electric);font-weight:600">Log in</a> or <a href="register.html" style="color:var(--electric);font-weight:600">create a free account</a> as a student or job seeker.</div>`;
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'job-modal';
    overlay.innerHTML = `
      <div class="modal-card" role="dialog" aria-modal="true" aria-label="${esc(job.title)}">
        <button class="modal-close" aria-label="Close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        <h2 style="font-size:1.4rem;color:var(--midnight)">${esc(job.title)}</h2>
        <p style="color:var(--text-secondary);font-weight:500;margin-top:0.25rem">${esc(job.company)}</p>
        <div class="job-meta-row" style="margin-top:0.75rem">
          ${job.job_type ? `<span class="job-meta-item">📋 ${esc(job.job_type)}</span>` : ''}
          ${job.location ? `<span class="job-meta-item">📍 ${esc(job.location)}</span>` : ''}
          ${job.visa_sponsorship ? '<span class="job-visa-badge">Visa Sponsorship</span>' : ''}
          ${job.experience_years ? `<span class="job-meta-item">💼 ${esc(job.experience_years)}</span>` : ''}
        </div>
        <p class="modal-section-label">About the role</p>
        <p style="font-size:0.925rem;color:var(--text-primary);white-space:pre-line">${esc(job.description || 'No description provided.')}</p>
        <p class="modal-section-label">Posted</p>
        <p style="font-size:0.85rem;color:var(--text-muted)">${timeAgo(job.created_at)}</p>
        ${actionHtml}
      </div>`;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    overlay.querySelector('.modal-close').addEventListener('click', closeModal);
    document.addEventListener('keydown', function onEsc(e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', onEsc);
      }
    });

    const applyBtn = document.getElementById('apply-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', async () => {
        const msg = document.getElementById('apply-msg');
        applyBtn.disabled = true;
        applyBtn.textContent = 'Submitting…';
        try {
          const res = await Auth.apiRequest(`/jobs/${job.id}/apply`, {
            method: 'POST',
            body: JSON.stringify({
              cover_letter: document.getElementById('apply-cover-letter').value.trim() || null,
            }),
          });
          if (res.status === 202 || (res.headers && res.headers.get('X-Relocompass-Queued'))) {
            // Queued by the service worker — will auto-send when back online
            appliedJobIds.add(job.id);
            applyBtn.textContent = 'Queued — will send on reconnect ⏳';
            msg.textContent = "You're offline. The application was saved and will be sent automatically when you reconnect.";
            renderJobs();
          } else if (res.status === 201) {
            appliedJobIds.add(job.id);
            applyBtn.textContent = 'Application Sent ✓';
            applyBtn.classList.add('btn-primary');
            msg.textContent = '';
            loadMyApplications();
            renderJobs();
          } else if (res.status === 409) {
            appliedJobIds.add(job.id);
            applyBtn.textContent = 'Already Applied';
            msg.textContent = 'You already applied to this job.';
            renderJobs();
          } else if (res.status === 401) {
            window.location.href = 'login.html';
            return;
          } else {
            const data = await res.json().catch(() => ({}));
            applyBtn.disabled = false;
            applyBtn.textContent = 'Apply Now';
            msg.textContent = data.detail || 'Something went wrong — please try again.';
          }
        } catch {
          applyBtn.disabled = false;
          applyBtn.textContent = 'Apply Now';
          msg.textContent = 'Network error — please try again.';
        }
      });
    }
  }

  // ── My Applications ──
  async function loadMyApplications() {
    if (!isSeeker) return;
    try {
      const res = await Auth.apiRequest('/jobs/applications/me');
      if (!res.ok) return;
      const apps = await res.json();
      appliedJobIds = new Set(apps.map((a) => a.job_id));
      if (apps.length) {
        myAppsSection.style.display = 'block';
        myAppsCount.style.display = 'inline-block';
        myAppsCount.textContent = apps.length + (apps.length === 1 ? ' application' : ' applications');
        renderMyApplications(apps);
      }
    } catch { /* non-fatal */ }
  }

  // Also refresh the "✓ Applied" badges on cards once application ids are known
  function refreshAppliedBadges() {
    if (jobs.length) renderJobs();
  }

  function renderMyApplications(apps) {
    myAppsList.innerHTML = apps.map((a) => {
      // Jobs may have been deactivated (hidden from board) — fall back
      // gracefully, and fetch missing titles lazily.
      const job = jobs.find((j) => j.id === a.job_id);
      const title = job ? job.title : '';
      const company = job ? job.company : '';
      const titleHtml = title
        ? esc(title)
        : `<span class="js-app-title" data-job="${a.job_id}">Job #${a.job_id}</span>`;
      return `
        <div class="app-item">
          <div class="app-item-info">
            <span class="app-item-title">${titleHtml}</span>
            <span class="app-item-sub">${esc(company)} · applied ${timeAgo(a.created_at)}</span>
          </div>
          <span class="status-badge status-${esc(a.status)}">${esc(a.status)}</span>
        </div>`;
    }).join('');

    // Backfill titles for jobs not on the current board (e.g. filtered out
    // or deactivated)
    myAppsList.querySelectorAll('.js-app-title').forEach(async (el) => {
      try {
        const r = await Auth.apiRequest('/jobs/' + el.dataset.job);
        if (r.ok) {
          const j = await r.json();
          if (j.title) el.textContent = j.title;
        }
      } catch { /* keep fallback label */ }
    });
  }

  // ── Wire up filters ──
  document.getElementById('filter-apply-btn').addEventListener('click', loadJobs);
  ['filter-q', 'filter-location'].forEach((id) => {
    document.getElementById(id).addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(loadJobs, 350);
    });
  });
  document.getElementById('filter-type').addEventListener('change', loadJobs);
  document.getElementById('filter-visa').addEventListener('change', loadJobs);

  // ── Init: board first (so titles resolve), then applications + badges ──
  (async function init() {
    await loadJobs();
    loadForYou();
    await loadMyApplications();
    refreshAppliedBadges();
  })();
})();
