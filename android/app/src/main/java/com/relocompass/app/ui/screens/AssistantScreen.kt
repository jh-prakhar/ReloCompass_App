package com.relocompass.app.ui.screens

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
import com.relocompass.app.api.User
import com.relocompass.app.api.ChatRequest
import com.relocompass.app.api.apiCall
import com.relocompass.app.data.SessionViewModel
import com.relocompass.app.data.TokenStore
import com.relocompass.app.ui.components.AppScaffold
import com.relocompass.app.ui.theme.Blue
import com.relocompass.app.ui.theme.Cream
import com.relocompass.app.ui.theme.Navy
import com.relocompass.app.ui.theme.Slate400
import kotlinx.coroutines.launch

data class UiTurn(val role: String, val content: String, val sources: List<Map<String, String>> = emptyList())

@Composable
fun AssistantScreen(session: SessionViewModel, store: TokenStore? = null, navigate: (String) -> Unit = { }) {
    val user = session.state.collectAsState().value.user
    val scope = rememberCoroutineScope()
    var turns by remember { mutableStateOf(listOf(UiTurn("assistant", "Hi! I'm your relocation assistant. Ask me about visas, housing, banking, or jobs abroad — I'll cite my sources."))) }
    var input by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var sessionId by remember { mutableStateOf<String?>(null) }
    var historyLoaded by remember { mutableStateOf(false) }
    val listState = rememberLazyListState()

    // Restore prior conversation on first show (if a stored session exists).
    LaunchedEffect(Unit) {
        val tokenStore = store ?: return@LaunchedEffect
        val stored = tokenStore.chatSessionId()
        if (stored != null) {
            val result = apiCall { ApiClient.chat.history(stored) }
            val history = result.getOrNull()
            if (history != null && history.messages.isNotEmpty()) {
                sessionId = stored
                turns = history.messages.map { UiTurn(it.role, it.content) }
            }
        }
        historyLoaded = true
    }

    fun newConversation() {
        scope.launch {
            sessionId?.let { id ->
                apiCall { ApiClient.chat.clearHistory(id) }
                store?.clearChatSessionId()
            }
        }
        sessionId = null
        turns = listOf(UiTurn("assistant", "Hi! I'm your relocation assistant. Ask me about visas, housing, banking, or jobs abroad — I'll cite my sources."))
        error = null
    }

    fun send() {
        val text = input.trim()
        if (text.isEmpty() || busy) return
        input = ""
        turns = turns + UiTurn("user", text)
        busy = true
        error = null
        scope.launch {
            val context = buildString {
                user?.let {
                    if (!it.city.isNullOrBlank() || !it.country.isNullOrBlank()) {
                        append("User is ")
                        append(listOfNotNull(it.city?.let { c -> "in $c" }, it.country).joinToString(", "))
                    }
                    append(". Role: ${it.role}.")
                }
                if (!user?.bio.isNullOrBlank()) append(" Bio: ${user?.bio}")
            }.ifBlank { null }

            val result = apiCall {
                ApiClient.chat.chat(
                    ChatRequest(
                        message = text,
                        sessionId = sessionId,
                        userContext = context,
                    )
                )
            }
            val body = result.getOrNull()
            if (body != null) {
                sessionId = body.sessionId
                store?.saveChatSessionId(body.sessionId)
                turns = turns + UiTurn("assistant", body.reply, body.sources)
            } else {
                error = result.exceptionOrNull()?.message
            }
            busy = false
        }
    }

    AppScaffold(
        title = "AI Assistant",
        currentRoute = "assistant",
        isEmployer = user?.role == "employer",
        onSelect = navigate,
        actions = {
            TextButton(onClick = { newConversation() }) { Text("New chat") }
        },
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            // Messages
            Box(Modifier.weight(1f)) {
                LazyColumn(
                    state = listState,
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    items(turns) { turn ->
                        MessageBubble(turn)
                    }
                    if (busy) item {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            CircularProgressIndicator(Modifier.size(16.dp), strokeWidth = 2.dp)
                            Spacer(Modifier.width(8.dp))
                            Text("Thinking…", color = Slate400, fontSize = 13.sp)
                        }
                    }
                    error?.let { e ->
                        item { Text(e, color = MaterialTheme.colorScheme.error, fontSize = 13.sp) }
                    }
                }
                LaunchedEffect(turns.size, busy) {
                    if (turns.isNotEmpty()) listState.animateScrollToItem(turns.size - 1)
                }
            }

            // Suggestions (only before the first user message)
            if (turns.none { it.role == "user" }) {
                Row(Modifier.padding(horizontal = 16.dp)) {
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf(
                            "What visa do I need for Canada as a student?",
                            "How do I open a bank account abroad?",
                            "Tips for finding housing in Toronto?",
                        ).forEach { s ->
                            AssistChip(onClick = { input = s }, label = { Text(s, fontSize = 12.sp) })
                        }
                    }
                }
            }

            // Composer
            Surface(tonalElevation = 2.dp) {
                Column {
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        OutlinedTextField(
                            value = input,
                            onValueChange = { input = it },
                            placeholder = { Text("Ask about visas, housing, jobs…") },
                            modifier = Modifier.weight(1f),
                            maxLines = 4,
                            shape = RoundedCornerShape(24.dp),
                        )
                        Spacer(Modifier.width(8.dp))
                        FilledIconButton(
                            onClick = { send() },
                            enabled = input.isNotBlank() && !busy,
                        ) { Text("➤") }
                    }
                    Text(
                        "AI answers cite knowledge-base sources. Verify important details with official channels.",
                        Modifier.padding(start = 16.dp, bottom = 8.dp),
                        fontSize = 10.sp,
                        color = Slate400,
                    )
                }
            }
        }
    }
}

@Composable
private fun MessageBubble(turn: UiTurn) {
    val isUser = turn.role == "user"
    Row(
        Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start,
    ) {
        Surface(
            color = if (isUser) Blue else MaterialTheme.colorScheme.surface,
            contentColor = if (isUser) androidx.compose.ui.graphics.Color.White else Navy,
            shape = RoundedCornerShape(
                topStart = 16.dp, topEnd = 16.dp,
                bottomStart = if (isUser) 16.dp else 4.dp,
                bottomEnd = if (isUser) 4.dp else 16.dp,
            ),
            modifier = Modifier.widthIn(max = 320.dp),
        ) {
            Column(Modifier.padding(12.dp)) {
                Text(turn.content, fontSize = 14.sp)
                if (turn.sources.isNotEmpty()) {
                    Spacer(Modifier.height(8.dp))
                    val names = turn.sources.mapNotNull { it["name"] ?: it["file"] }.distinct()
                    Text(
                        "Sources: " + names.joinToString(", "),
                        fontSize = 11.sp,
                        color = Slate400,
                    )
                }
            }
        }
    }
}
