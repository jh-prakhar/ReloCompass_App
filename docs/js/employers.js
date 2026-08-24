/**
 * ReloCompass — Employer portal logic.
 * Post jobs, list own jobs, view applicants, update application status, delete jobs.
 */
(function () {
  'use strict';

  const portal = document.getElementById('employer-portal');
  const nonEmployer = document.getElementById('non-employer-view');
  const form = document.getElementById('post-job-form');
  const postBtn = document.getElementById('post-job-btn');
  const postMsg = document.getElementById('post-job-msg');
  const myJobsList = document.getElementById('my-jobs-list');
  const myJobsEmpty = document.getElementById('my-jobs-empty');

  const user = Auth.getUser();

  // Portal guard: employers only. No redirect — non-employers (incl.
  // logged-out) fall through to the public marketing view below.
  if (!Auth.requireRole(['employer'], { redirect: false })) return;

  portal.style.display = 'block';
  nonEmployer.style.display = 'none';

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

  function msg(text, ok) {
    postMsg.textContent = text;
    postMsg.style.color = ok ? 'var(--emerald)' : '#B91C1C';
  }

  // ── Load own jobs + applicants ──
  let myJobs = [];

  async function loadMyJobs() {
    try {
      const res = await Auth.apiRequest('/jobs/mine');
      if (!res.ok) throw new Error();
      myJobs = await res.json();
    } catch {
      myJobs = [];
    }
    renderMyJobs();

    // Fetch applicant counts + statuses per job (in parallel)
    const results = await Promise.all(
      myJobs.map(async (job) => {
        try {
          const r = await Auth.apiRequest(`/jobs/${job.id}/applications`);
          if (!r.ok) return { job, apps: [] };
          return { job, apps: await r.json() };
        } catch {
          return { job, apps: [] };
        }
      })
    );

    const allApps = results.flatMap((r) => r.apps);
    document.getElementById('stat-jobs').textContent = myJobs.length;
    document.getElementById('stat-applicants').textContent = allApps.length;
    document.getElementById('stat-shortlisted').textContent =
      allApps.filter((a) => a.status === 'shortlisted' || a.status === 'accepted').length;

    renderMyJobs(results);
  }

  function renderMyJobs(applicantData) {
    const dataMap = {};
    (applicantData || []).forEach((r) => { dataMap[r.job.id] = r.apps; });

    if (!myJobs.length) {
      myJobsList.innerHTML = '';
      myJobsEmpty.style.display = 'block';
      return;
    }
    myJobsEmpty.style.display = 'none';

    myJobsList.innerHTML = myJobs.map((job) => {
      const apps = dataMap[job.id] || [];
      const pending = apps.filter((a) => a.status === 'pending').length;
      const applicantsHtml = apps.length
        ? apps.map((a) => `
            <div class="app-item" style="margin-top:0.75rem">
              <div class="app-item-info">
                <span class="app-item-title">${esc(a.applicant.name)}</span>
                <span class="app-item-sub">${esc(a.applicant.email)}${a.applicant.country ? ' · ' + esc(a.applicant.country) : ''} · applied ${timeAgo(a.created_at)}</span>
                ${a.cover_letter ? `<span class="app-item-sub" style="color:var(--text-secondary);font-style:italic;margin-top:0.25rem">“${esc(a.cover_letter).slice(0, 220)}${a.cover_letter.length > 220 ? '…' : ''}”</span>` : ''}
              </div>
              <select class="status-select" data-app="${a.id}" data-job="${job.id}">
                ${['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'].map((s) =>
                  `<option value="${s}" ${a.status === s ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`
                ).join('')}
              </select>
            </div>`).join('')
        : '<p class="app-item-sub" style="padding:0.75rem 0">No applicants yet.</p>';

      return `
        <div class="job-card" style="cursor:default" data-job="${job.id}">
          <div class="job-card-top">
            <div>
              <h3 class="job-card-title">${esc(job.title)}</h3>
              <p class="job-company">${esc(job.company)} · ${timeAgo(job.created_at)}</p>
            </div>
            ${job.visa_sponsorship ? '<span class="job-visa-badge">Visa Sponsorship</span>' : ''}
          </div>
          <div class="job-meta-row">
            ${job.location ? `<span class="job-meta-item">📍 ${esc(job.location)}</span>` : ''}
            ${job.job_type ? `<span class="job-meta-item">📋 ${esc(job.job_type)}</span>` : ''}
            <span class="job-meta-item">👥 ${apps.length} applicant${apps.length === 1 ? '' : 's'}${pending ? ' · ' + pending + ' new' : ''}</span>
          </div>
          ${job.is_active === false ? '<span class="badge badge-sample">Closed</span>' : ''}
          <details>
            <summary style="cursor:pointer;font-size:0.85rem;color:var(--electric);font-weight:600">View applicants</summary>
            <div style="margin-top:0.5rem">${applicantsHtml}</div>
          </details>
          <div style="display:flex;gap:0.5rem;margin-top:0.5rem">
            <button class="btn btn-outline btn-sm delete-job-btn" data-id="${job.id}">Delete Job</button>
          </div>
        </div>`;
    }).join('');

    // Status selects
    myJobsList.querySelectorAll('.status-select').forEach((sel) => {
      sel.addEventListener('change', async () => {
        const appId = Number(sel.dataset.app);
        sel.disabled = true;
        try {
          const res = await Auth.apiRequest(`/jobs/applications/${appId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: sel.value }),
          });
          if (res.ok) {
            loadMyJobs();
            return;
          }
          if (res.status === 401) {
            window.location.href = 'login.html';
            return;
          }
          sel.disabled = false;
        } catch {
          sel.disabled = false;
        }
      });
    });

    // Delete buttons
    myJobsList.querySelectorAll('.delete-job-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('Delete this job posting? It will be removed from the public board.')) return;
        btn.disabled = true;
        try {
          const res = await Auth.apiRequest(`/jobs/${btn.dataset.id}`, { method: 'DELETE' });
          if (res.ok) {
            loadMyJobs();
            return;
          }
          if (res.status === 401) {
            window.location.href = 'login.html';
            return;
          }
        } catch { /* fallthrough */ }
        btn.disabled = false;
      });
    });
  }

  // ── Post a job ──
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('job-title').value.trim();
    const company = document.getElementById('job-company').value.trim();

    if (title.length < 3) { msg('Job title must be at least 3 characters.', false); return; }
    if (company.length < 2) { msg('Company name must be at least 2 characters.', false); return; }

    const payload = {
      title,
      company,
      description: document.getElementById('job-description').value.trim() || null,
      location: document.getElementById('job-location').value.trim() || null,
      job_type: document.getElementById('job-type').value,
      experience_years: document.getElementById('job-experience').value,
      visa_sponsorship: document.getElementById('job-visa').checked,
    };

    postBtn.disabled = true;
    postBtn.textContent = 'Publishing…';
    try {
      const res = await Auth.apiRequest('/jobs/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.status === 201) {
        msg('Job published ✓ — visible on the public board.', true);
        form.reset();
        loadMyJobs();
      } else if (res.status === 401) {
        window.location.href = 'login.html';
        return;
      } else {
        const data = await res.json().catch(() => ({}));
        msg(data.detail || 'Could not publish job — please try again.', false);
      }
    } catch {
      msg('Network error — is the backend running?', false);
    }
    postBtn.disabled = false;
    postBtn.textContent = 'Publish Job';
  });

  loadMyJobs();
})();
