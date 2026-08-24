/**
 * ReloCompass — AI Assistant chat page logic.
 * Talks to POST /api/chat (RAG-backed), keeps a session_id in localStorage,
 * restores history on reload, shows sources + role-aware suggestions.
 */
(function () {
  'use strict';

  const SESSION_KEY = 'relocompass_chat_session';
  const messagesEl = document.getElementById('chat-messages');
  const suggestionsEl = document.getElementById('chat-suggestions');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');
  const clearBtn = document.getElementById('clear-chat-btn');
  const statusEl = document.getElementById('chat-status');

  const user = Auth.getUser();
  const role = user ? user.role : 'guest';

  const SUGGESTIONS = {
    student: [
      "What documents do I need for a Canadian study permit?",
      "How do I find affordable student housing in Toronto?",
      "What's a realistic monthly budget in Melbourne?",
      "Can I work part-time on a student visa in the UK?",
    ],
    job_seeker: [
      "Which countries sponsor work visas for software engineers?",
      "How do I write a CV that works for German employers?",
      "What is the salary range for nurses in Australia?",
      "How long does a skilled worker visa usually take?",
    ],
    employer: [
      "How can I hire skilled workers from India or Nepal?",
      "What should I know about visa sponsorship obligations?",
      "How do I write a job posting that attracts international talent?",
    ],
    guest: [
      "What documents do I need to study in Canada?",
      "How do I find a job abroad with visa sponsorship?",
      "What's the cheapest way to rent as a new arrival?",
      "How much should I budget for my first month abroad?",
    ],
  };

  let session_id = localStorage.getItem(SESSION_KEY) || null;
  let busy = false;

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    // Entity-encode quotes too, so the result is safe in attribute contexts as well
    return d.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addMessage(roleName, content, sources) {
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg-row chat-msg-row-' + roleName;

    const bubble = document.createElement('div');
    bubble.className = 'chat-msg chat-msg-' + roleName;

    const body = document.createElement('div');
    body.className = 'chat-msg-body';
    // AI replies arrive as plain text — render with line breaks preserved
    body.innerHTML = esc(content).replace(/\n/g, '<br>');
    bubble.appendChild(body);

    if (sources && sources.length) {
      // Deduplicate by source filename and show a readable label
      const seen = new Set();
      const chips = [];
      sources.forEach((s) => {
        const name = s.title || s.source || s.filename || s.name;
        if (name && !seen.has(name)) {
          seen.add(name);
          chips.push(name);
        }
      });
      const src = document.createElement('div');
      src.className = 'chat-sources';
      src.innerHTML =
        '<span class="chat-sources-label">Sources:</span> ' +
        chips.slice(0, 5)
          .map((name) => `<span class="chat-source-chip">${esc(name)}</span>`)
          .join('');
      bubble.appendChild(src);
    }

    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    scrollToBottom();
    return wrap;
  }

  function showTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg-row chat-msg-assistant';
    wrap.id = 'typing-row';
    wrap.innerHTML =
      '<div class="chat-msg chat-msg-assistant"><div class="chat-typing">' +
      '<span></span><span></span><span></span></div></div>';
    messagesEl.appendChild(wrap);
    scrollToBottom();
  }

  function removeTyping() {
    const t = document.getElementById('typing-row');
    if (t) t.remove();
  }

  function renderSuggestions() {
    const list = SUGGESTIONS[role] || SUGGESTIONS.guest;
    suggestionsEl.innerHTML = list
      .map(q => `<button type="button" class="chat-suggestion-chip">${esc(q)}</button>`)
      .join('');
    suggestionsEl.style.display = 'flex';
    suggestionsEl.querySelectorAll('.chat-suggestion-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        input.value = chip.textContent;
        form.dispatchEvent(new Event('submit'));
      });
    });
  }

  function hideSuggestions() {
    suggestionsEl.style.display = 'none';
  }

  function setBusy(on) {
    busy = on;
    sendBtn.disabled = on;
    input.disabled = on;
    statusEl.textContent = on ? 'Thinking…' : 'Online';
  }

  async function loadHistory() {
    if (!session_id) return;
    try {
      const res = await Auth.apiRequest('/chat/history/' + encodeURIComponent(session_id));
      if (!res.ok) {
        session_id = null;
        localStorage.removeItem(SESSION_KEY);
        return;
      }
      const data = await res.json();
      if (data.messages && data.messages.length) {
        data.messages.forEach((m) => addMessage(m.role === 'user' ? 'user' : 'assistant', m.content));
        hideSuggestions();
        clearBtn.style.display = 'inline-flex';
      }
    } catch {
      /* offline — keep suggestions visible */
    }
  }

  async function send() {
    const message = input.value.trim();
    if (!message || busy) return;

    addMessage('user', message);
    input.value = '';
    hideSuggestions();
    setBusy(true);

    const userContext = user
      ? `I am ${user.name}, a ${user.role.replace('_', ' ')}${user.city ? ' interested in ' + user.city : ''}${user.country ? ', ' + user.country : ''}.`
      : null;

    // --- Streaming (SSE) path, with non-streaming fallback ---
    let streamed = false;
    try {
      const token = localStorage.getItem('relocompass_token');
      const res = await fetch(API_CONFIG.API_URL + '/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        },
        body: JSON.stringify({ message, session_id, user_context: userContext }),
      });
      if (res.ok && res.body) {
        showTyping();
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';
        let text = '';
        let gotError = false;
        let assistantRow = null;
        let metaSources = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let sep;
          while ((sep = buf.indexOf('\n\n')) !== -1) {
            const block = buf.slice(0, sep);
            buf = buf.slice(sep + 2);
            let evt = 'message', data = '';
            for (const line of block.split('\n')) {
              if (line.startsWith('event: ')) evt = line.slice(7).trim();
              else if (line.startsWith('data: ')) data += line.slice(6);
            }
            if (!data) continue;
            let parsed;
            try { parsed = JSON.parse(data); } catch { continue; }

            if (evt === 'meta') {
              if (parsed.session_id) {
                session_id = parsed.session_id;
                localStorage.setItem(SESSION_KEY, session_id);
              }
              if (Array.isArray(parsed.sources) && parsed.sources.length) {
                // Keep the RAG source names so we can render chips under the
                // streamed reply once the text completes (same as /chat/ path).
                metaSources = parsed.sources;
              }
            } else if (evt === 'delta') {
              if (assistantRow === null) {
                removeTyping();
                assistantRow = addMessage('assistant', '');
              }
              text += parsed.text || '';
              const bodyEl = assistantRow.querySelector('.chat-msg-body');
              bodyEl.innerHTML = esc(text).replace(/\n/g, '<br>');
              scrollToBottom();
            } else if (evt === 'error') {
              gotError = true;
            }
          }
        }

        if (text) {
          streamed = true;
          // Sources arrive in meta before the text — attach chips under the
          // streamed reply's bubble (same visual as the non-streaming path).
          if (metaSources.length && assistantRow) {
            const bubble = assistantRow.querySelector('.chat-msg');
            if (bubble && !bubble.querySelector('.chat-sources')) {
              const chipsWrap = document.createElement('div');
              chipsWrap.className = 'chat-sources';
              const seen = new Set();
              const names = [];
              metaSources.forEach((s) => {
                const name = s.title || s.source || s.filename || s.name;
                if (name && !seen.has(name)) { seen.add(name); names.push(name); }
              });
              chipsWrap.innerHTML =
                '<span class="chat-sources-label">Sources:</span> ' +
                names.slice(0, 5)
                  .map((name) => `<span class="chat-source-chip">${esc(name)}</span>`)
                  .join('');
              bubble.appendChild(chipsWrap);
            }
          }
          clearBtn.style.display = 'inline-flex';
        } else if (!gotError) {
          removeTyping();
        } else {
          removeTyping(); // fall through to non-streaming
        }
        if (gotError && !text) streamed = false;
      }
    } catch {
      removeTyping();
    }

    if (streamed) {
      setBusy(false);
      input.focus();
      return;
    }

    // --- Non-streaming fallback ---
    showTyping();
    try {
      const res = await Auth.apiRequest('/chat/', {
        method: 'POST',
        body: JSON.stringify({ message, session_id, user_context: userContext }),
      });
      removeTyping();

      if (res.status === 503) {
        addMessage('assistant', "The AI service is being configured right now — please try again in a little while.");
        setBusy(false);
        return;
      }
      if (res.status === 401) {
        addMessage('assistant', "Your session expired. Please log in again.");
        setBusy(false);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        addMessage('assistant', 'Sorry, something went wrong. ' + esc(data.detail || 'Please try again.'));
        setBusy(false);
        return;
      }

      session_id = data.session_id;
      localStorage.setItem(SESSION_KEY, session_id);
      addMessage('assistant', data.reply, data.sources);
      clearBtn.style.display = 'inline-flex';
    } catch {
      removeTyping();
      addMessage('assistant', 'Network error — could not reach the assistant. Please try again.');
    }
    setBusy(false);
    input.focus();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    send();
  });

  clearBtn.addEventListener('click', async () => {
    if (session_id) {
      try {
        await Auth.apiRequest('/chat/history/' + encodeURIComponent(session_id), { method: 'DELETE' });
      } catch { /* ignore */ }
    }
    session_id = null;
    localStorage.removeItem(SESSION_KEY);
    messagesEl.innerHTML = '';
    clearBtn.style.display = 'none';
    renderSuggestions();
    input.focus();
  });

  // Init
  if (!session_id) {
    renderSuggestions();
  }
  loadHistory();
})();
