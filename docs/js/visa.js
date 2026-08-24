/**
 * ReloCompass — Visa checklist generator page logic.
 * Loads destinations/visa types from the API, renders a phased checklist
 * with local progress tracking (localStorage per destination+visa).
 */
(function () {
  'use strict';

  const form = document.getElementById('visa-form');
  const destSel = document.getElementById('visa-destination');
  const typeSel = document.getElementById('visa-type');
  const sitSel = document.getElementById('visa-situation');
  const resultEl = document.getElementById('visa-result');
  const phasesEl = document.getElementById('visa-phases');
  const msgEl = document.getElementById('visa-msg');
  const printBtn = document.getElementById('visa-print');
  const progressLabel = document.getElementById('visa-progress-label');
  const progressBar = document.getElementById('visa-progress-bar');

  let destinations = [];
  let current = null;

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function storeKey() {
    return 'relo_visa_' + destSel.value + '_' + typeSel.value;
  }

  function loadDone() {
    try { return JSON.parse(localStorage.getItem(storeKey()) || '{}'); } catch (e) { return {}; }
  }

  function saveDone(done) {
    try { localStorage.setItem(storeKey(), JSON.stringify(done)); } catch (e) {}
  }

  function note(text, ok) {
    msgEl.style.display = 'block';
    msgEl.textContent = text;
    msgEl.style.background = ok ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)';
    msgEl.style.color = ok ? '#059669' : '#dc2626';
  }

  function populateDestinations() {
    destSel.innerHTML = destinations.map(function (d) {
      return '<option value="' + d.id + '">' + esc(d.label) + '</option>';
    }).join('');
    if (destinations.length) fillVisaTypes(destinations[0].id);
  }

  function fillVisaTypes(destId) {
    const dest = destinations.find(function (d) { return d.id === destId; });
    if (!dest) return;
    typeSel.innerHTML = dest.visa_types.map(function (v) {
      return '<option value="' + v.id + '">' + esc(v.label) + '</option>';
    }).join('');
  }

  destSel.addEventListener('change', function () { fillVisaTypes(destSel.value); });

  function renderChecklist(data) {
    const done = loadDone();
    document.getElementById('visa-result-title').textContent =
      data.destination + ' — ' + data.visa_type;
    document.getElementById('visa-result-sub').textContent =
      data.total_items + ' documents · situation: ' + data.situation.replace('_', ' ');
    document.getElementById('visa-official').href = (data.official_sources || [])[0] || '#';
    document.getElementById('visa-disclaimer').textContent = '⚠️ ' + data.disclaimer;

    phasesEl.innerHTML = '';
    data.checklist.forEach(function (phase) {
      const section = document.createElement('div');
      section.className = 'card';
      section.style.padding = '1.25rem';
      section.style.marginBottom = '1rem';

      const head = document.createElement('h3');
      head.style.cssText = 'font-size:1rem;font-weight:800;margin-bottom:0.75rem';
      head.textContent = phase.label;
      section.appendChild(head);

      phase.items.forEach(function (item) {
        const row = document.createElement('label');
        row.className = 'visa-item' + (done[item.id] ? ' done' : '');
        row.style.cssText = 'display:flex;gap:0.65rem;align-items:flex-start;padding:0.55rem 0;border-bottom:1px solid rgba(15,23,42,0.06);cursor:pointer';

        const box = document.createElement('input');
        box.type = 'checkbox';
        box.checked = !!done[item.id];
        box.style.marginTop = '0.2rem';

        const textWrap = document.createElement('div');
        const label = document.createElement('div');
        label.style.cssText = 'font-size:0.9rem;font-weight:600;color:var(--midnight)';
        label.textContent = item.label;
        if (done[item.id]) label.style.textDecoration = 'line-through';
        const noteText = document.createElement('div');
        noteText.style.cssText = 'font-size:0.78rem;color:var(--text-muted)';
        noteText.textContent = item.note || '';

        textWrap.appendChild(label);
        if (item.note) textWrap.appendChild(noteText);

        box.addEventListener('change', function () {
          const d = loadDone();
          d[item.id] = box.checked;
          saveDone(d);
          row.classList.toggle('done', box.checked);
          label.style.textDecoration = box.checked ? 'line-through' : 'none';
          updateProgress();
        });

        row.appendChild(box);
        row.appendChild(textWrap);
        section.appendChild(row);
      });
      phasesEl.appendChild(section);
    });

    resultEl.hidden = false;
    printBtn.hidden = false;
    updateProgress();
  }

  function updateProgress() {
    if (!current) return;
    const boxes = phasesEl.querySelectorAll('input[type="checkbox"]');
    const total = boxes.length;
    const done = phasesEl.querySelectorAll('input[type="checkbox"]:checked').length;
    progressLabel.textContent = done + ' of ' + total + ' ready';
    progressBar.style.width = total ? Math.round((done / total) * 100) + '%' : '0%';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msgEl.style.display = 'none';
    const params = new URLSearchParams({
      destination: destSel.value,
      visa_type: typeSel.value,
    });
    if (sitSel.value) params.set('situation', sitSel.value);

    fetch(API_CONFIG.API_URL + '/visa/checklist?' + params)
      .then(function (r) {
        if (!r.ok) return r.json().then(function (d) { throw new Error(d.detail || 'Could not generate checklist'); });
        return r.json();
      })
      .then(function (data) {
        current = data;
        renderChecklist(data);
      })
      .catch(function (err) {
        note(err.message || 'Network error — please try again.', false);
      });
  });

  printBtn.addEventListener('click', function () { window.print(); });

  // init
  fetch(API_CONFIG.API_URL + '/visa/destinations')
    .then(function (r) { return r.json(); })
    .then(function (d) {
      destinations = d.destinations || [];
      populateDestinations();
    })
    .catch(function () {
      note('Could not load destinations — check your connection.', false);
    });
})();
