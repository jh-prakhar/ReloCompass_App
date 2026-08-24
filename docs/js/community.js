/**
 * ReloCompass — Community chat page logic.
 * WebSocket live chat with room switching; REST history fallback when
 * logged out (read-only) or when the socket can't connect.
 */
(function () {
  'use strict';

  const roomsEl = document.getElementById('community-rooms');
  const titleEl = document.getElementById('room-title');
  const presenceEl = document.getElementById('presence-pill');
  const connEl = document.getElementById('conn-status');
  const messagesEl = document.getElementById('community-messages');
  const form = document.getElementById('community-form');
  const input = document.getElementById('community-input');
  const sendBtn = document.getElementById('community-send');
  const noteEl = document.getElementById('community-note');

  const user = Auth.getUser();
  const token = localStorage.getItem('relocompass_token');

  let rooms = [];
  let activeRoom = 'global';
  let socket = null;
  let reconnectTimer = null;
  let reconnectAttempts = 0;
  let connectionGen = 0;

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function wsUrl(room) {
    // Absolute WS URL: same-origin deployments (empty BASE_URL) resolve via
    // location.origin; localhost dev -> ws://localhost:8000. The WebSocket
    // constructor rejects relative URLs, so always build an absolute one.
    const base = (API_CONFIG.BASE_URL || location.origin).replace(/^http/, 'ws');
    return base + '/api/community/ws?token=' + encodeURIComponent(token) + '&room=' + room;
  }

  function setConn(state, label) {
    connEl.dataset.state = state;
    connEl.textContent = label;
  }

  function renderRooms() {
    roomsEl.innerHTML = rooms.map(function (r) {
      const active = r.id === activeRoom;
      return (
        '<button type="button" class="room-btn' + (active ? ' active' : '') + '" data-room="' + r.id + '">' +
        '<span class="room-name">' + esc(r.name) + '</span>' +
        '<span class="room-desc">' + esc(r.description) + '</span>' +
        '</button>'
      );
    }).join('');
    roomsEl.querySelectorAll('.room-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { switchRoom(btn.dataset.room); });
    });
  }

  function fmtTime(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return ''; }
  }

  function addMessage(m, historical) {
    const mine = user && m.user_id === user.id;
    const row = document.createElement('div');
    row.className = 'community-msg' + (mine ? ' mine' : '') + (historical ? ' historical' : '');
    row.innerHTML =
      '<div class="community-msg-head">' +
      '<span class="community-msg-author">' + esc(m.user_name || 'Member') + '</span>' +
      '<span class="community-msg-time">' + esc(fmtTime(m.created_at)) + '</span>' +
      '</div>' +
      '<div class="community-msg-body">' + esc(m.content) + '</div>';
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function clearMessages() {
    messagesEl.innerHTML = '';
  }

  function connect(room) {
    // Generation guard: every connect() call invalidates all previous sockets.
    // A stale socket's onclose/onmessage (e.g. after a room switch) must never
    // clear state, null the current socket, or schedule a reconnect to the OLD room.
    const gen = ++connectionGen;
    if (socket) { try { socket.close(); } catch (e) {} socket = null; }
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    if (!token) {
      setConn('readonly', 'Read-only');
      noteEl.hidden = false;
      // REST fallback: load history so lurkers still see the room
      fetch(API_CONFIG.API_URL + '/community/history/' + room)
        .then(function (r) { return r.ok ? r.json() : { messages: [] }; })
        .then(function (d) {
          if (gen !== connectionGen) return;
          clearMessages();
          (d.messages || []).forEach(function (m) { addMessage(m, true); });
        })
        .catch(function () {});
      return;
    }

    setConn('connecting', 'Connecting…');
    socket = new WebSocket(wsUrl(room));

    socket.onopen = function () {
      if (gen !== connectionGen) return;
      reconnectAttempts = 0;
      setConn('online', 'Live');
      input.disabled = false;
      sendBtn.disabled = false;
    };

    socket.onmessage = function (ev) {
      if (gen !== connectionGen) return;
      let data;
      try { data = JSON.parse(ev.data); } catch (e) { return; }
      if (data.type === 'history') {
        clearMessages();
        (data.messages || []).forEach(function (m) { addMessage(m, true); });
      } else if (data.type === 'presence') {
        presenceEl.textContent = data.count + (data.count === 1 ? ' online' : ' online');
      } else if (data.type === 'message') {
        addMessage(data);
      } else if (data.type === 'error') {
        flashError(data.detail || 'Message rejected');
      }
    };

    socket.onclose = function (ev) {
      if (gen !== connectionGen) return; // stale socket closed by a room switch — ignore
      socket = null;
      input.disabled = true;
      sendBtn.disabled = true;
      if (ev.code === 4401) {
        setConn('auth', 'Session expired');
        noteEl.textContent = 'Your session expired — log in again to chat.';
        noteEl.hidden = false;
        return;
      }
      setConn('offline', 'Reconnecting…');
      const delay = Math.min(5000, 800 * Math.pow(2, reconnectAttempts++));
      reconnectTimer = setTimeout(function () {
        if (gen !== connectionGen) return;
        connect(activeRoom);
      }, delay);
    };

    socket.onerror = function () { /* onclose follows */ };
  }

  function flashError(text) {
    const el = document.createElement('div');
    el.className = 'community-error';
    el.textContent = text;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    setTimeout(function () { el.remove(); }, 4000);
  }

  function switchRoom(room) {
    activeRoom = room;
    const meta = rooms.find(function (r) { return r.id === room; });
    titleEl.textContent = meta ? meta.name : room;
    presenceEl.textContent = '—';
    clearMessages();
    renderRooms();
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    connect(room);
    try { localStorage.setItem('relo_room', room); } catch (e) {}
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || !socket || socket.readyState !== 1) return;
    socket.send(JSON.stringify({ type: 'message', room: activeRoom, content: text }));
    input.value = '';
    input.focus();
  });

  // ── init ──
  fetch(API_CONFIG.API_URL + '/community/rooms')
    .then(function (r) { return r.json(); })
    .then(function (d) {
      rooms = d.rooms || [];
      let saved = null;
      try { saved = localStorage.getItem('relo_room'); } catch (e) {}
      if (saved && rooms.some(function (r) { return r.id === saved; })) activeRoom = saved;
      const meta = rooms.find(function (r) { return r.id === activeRoom; });
      titleEl.textContent = meta ? meta.name : activeRoom;
      renderRooms();
      connect(activeRoom);
    })
    .catch(function () {
      setConn('offline', 'Offline');
      flashError('Could not load rooms — check your connection.');
    });
})();
