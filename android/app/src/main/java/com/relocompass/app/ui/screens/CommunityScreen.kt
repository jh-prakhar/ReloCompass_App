package com.relocompass.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.relocompass.app.api.ApiClient
import com.relocompass.app.api.CommunityRoom
import com.relocompass.app.api.WsEvent
import com.relocompass.app.api.WsSend
import com.relocompass.app.api.apiCall
import com.relocompass.app.data.SessionViewModel
import com.relocompass.app.data.TokenStore
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.delay
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicInteger

/** One rendered chat bubble. */
private data class ChatEntry(
    val id: Long,
    val userId: Int,
    val userName: String,
    val content: String,
    val createdAt: String?,
)

/**
 * Community chat: room switcher + live WebSocket connection.
 * Mirrors the web client's contract: /api/community/ws?token=&room=, inbound
 * frames {history|presence|message|error}, outbound {type:message, room, content}.
 *
 * Stale-socket safety mirrors the web client exactly: ONE shared generation
 * counter (remembered, not per-effect). Every (re)connect takes the next
 * generation; all listener callbacks compare against the shared counter, so a
 * socket from an older generation can never mutate state after a room switch.
 */
@Composable
fun CommunityScreen(session: SessionViewModel, store: TokenStore) {
    val state = session.state.collectAsState().value
    val myId = state.user?.id

    var rooms by remember { mutableStateOf<List<CommunityRoom>>(emptyList()) }
    var activeRoom by remember { mutableStateOf("global") }

    var messages by remember { mutableStateOf<List<ChatEntry>>(emptyList()) }
    var presence by remember { mutableStateOf(0) }
    var status by remember { mutableStateOf("Connecting…") }
    var connected by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var input by remember { mutableStateOf("") }
    val listState = rememberLazyListState()

    // ── shared connection state (survives effect restarts — the whole point) ──
    val generation = remember { AtomicInteger(0) }
    val currentSocket = remember { mutableStateOf<Pair<WebSocket, Int>?>(null) }
    val client = remember {
        OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .pingInterval(30, TimeUnit.SECONDS)
            .build()
    }

    fun isStale(gen: Int) = gen != generation.get()

    fun send() {
        val text = input.trim()
        if (text.isEmpty() || !connected) return
        val socket = currentSocket.value?.first ?: return
        if (socket.send(wsGson.toJson(WsSend("message", activeRoom, text)))) input = ""
    }

    // ── socket lifecycle, restarted on every room switch ─────────────────────
    LaunchedEffect(activeRoom) {
        val gen = generation.incrementAndGet() // invalidates every older socket
        val token = store.peekToken() ?: return@LaunchedEffect
        var attempts = 0

        fun wsUrl(room: String): String {
            val base = ApiClient.webSocketBase.replaceFirst("http", "ws")
            return "$base/api/community/ws?token=$token&room=$room"
        }

        try {
            while (!isStale(gen)) {
                val closed = CompletableDeferred<Unit>()
                val socket = client.newWebSocket(
                    Request.Builder().url(wsUrl(activeRoom)).build(),
                    object : WebSocketListener() {
                        override fun onOpen(webSocket: WebSocket, response: Response) {
                            if (isStale(gen)) { webSocket.close(1000, null); return }
                            connected = true; attempts = 0
                            status = "Live"
                        }

                        override fun onMessage(webSocket: WebSocket, text: String) {
                            if (isStale(gen)) return
                            val frame = runCatching {
                                wsGson.fromJson(text, WsEvent::class.java)
                            }.getOrNull() ?: return
                            when (frame.type) {
                                "history" -> messages = frame.messages.orEmpty().map {
                                    ChatEntry(it.id, it.userId, it.userName, it.content, it.createdAt)
                                }
                                "presence" -> presence = frame.count ?: 0
                                "message" -> {
                                    val id = frame.id ?: 0L
                                    val content = frame.content ?: return
                                    val name = frame.userName ?: "?"
                                    messages = messages.filterNot { it.id == id && id != 0L } +
                                        ChatEntry(id, frame.userId ?: 0, name, content, frame.createdAt)
                                }
                                "error" -> error = frame.detail
                            }
                        }

                        override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                            if (isStale(gen)) { closed.complete(Unit); return }
                            connected = false
                            status = "Reconnecting…"
                            closed.complete(Unit)
                        }

                        override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                            if (isStale(gen)) { closed.complete(Unit); return }
                            connected = false
                            status = if (code == 4401) "Session expired" else "Reconnecting…"
                            closed.complete(Unit)
                        }
                    },
                )
                // retire any socket from an older generation, then publish ours
                currentSocket.value?.let { (old, oldGen) -> if (oldGen != gen) old.close(1000, null) }
                currentSocket.value = socket to gen

                closed.await()
                if (isStale(gen)) break
                delay((800L shl attempts.coerceAtMost(3)).coerceAtMost(6400L))
                attempts++
            }
        } finally {
            // Runs on normal exit AND cancellation (room switch / leaving screen):
            // close our socket if it is still the published one.
            currentSocket.value?.let { (s, publishedGen) ->
                if (publishedGen == gen) { s.close(1000, null); currentSocket.value = null }
            }
            if (!isStale(gen)) connected = false
        }
    }

    // rooms catalogue (REST)
    LaunchedEffect(Unit) {
        apiCall { ApiClient.api.communityRooms() }.onSuccess { rooms = it.rooms }
    }

    // autoscroll
    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) listState.animateScrollToItem(messages.lastIndex)
    }

    Column(Modifier.fillMaxSize()) {
        Row(
            Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(Modifier.weight(1f)) {
                Text("Community", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                Text(
                    "$status · $presence online",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }

        // room switcher chips
        Row(
            Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            rooms.forEach { room ->
                FilterChip(
                    selected = room.id == activeRoom,
                    onClick = {
                        if (room.id != activeRoom) {
                            activeRoom = room.id
                            messages = emptyList(); presence = 0
                        }
                    },
                    label = { Text(room.name) },
                )
            }
        }

        error?.let {
            Text(
                it,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
            )
        }

        LazyColumn(
            state = listState,
            modifier = Modifier.weight(1f).fillMaxWidth().padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            contentPadding = PaddingValues(vertical = 12.dp),
        ) {
            items(
                messages,
                key = { "${it.id}-${it.createdAt.orEmpty()}-${it.content.hashCode()}" },
            ) { msg ->
                val mine = myId != null && msg.userId == myId
                Row(
                    Modifier.fillMaxWidth(),
                    horizontalArrangement = if (mine) Arrangement.End else Arrangement.Start,
                ) {
                    Column(
                        horizontalAlignment = if (mine) Alignment.End else Alignment.Start,
                        modifier = Modifier
                            .background(
                                if (mine) MaterialTheme.colorScheme.primaryContainer
                                else MaterialTheme.colorScheme.surfaceVariant,
                                RoundedCornerShape(12.dp),
                            )
                            .padding(horizontal = 12.dp, vertical = 8.dp)
                            .widthIn(max = 280.dp),
                    ) {
                        if (!mine) {
                            Text(
                                msg.userName,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.primary,
                            )
                        }
                        Text(msg.content, fontSize = 15.sp)
                    }
                }
            }
        }

        if (store.peekToken() == null) {
            Text(
                "Log in to join the conversation",
                modifier = Modifier.padding(16.dp),
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        } else {
            Row(
                Modifier.fillMaxWidth().padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                OutlinedTextField(
                    value = input,
                    onValueChange = { input = it; error = null },
                    modifier = Modifier.weight(1f),
                    placeholder = {
                        Text("Message ${rooms.firstOrNull { it.id == activeRoom }?.name ?: activeRoom}")
                    },
                    enabled = connected,
                    maxLines = 4,
                )
                FilledIconButton(onClick = { send() }, enabled = connected && input.isNotBlank()) {
                    Text("➤")
                }
            }
        }
    }
}

/** Local Gson — plain (de)serialization of WS frames. */
private val wsGson = com.google.gson.Gson()
