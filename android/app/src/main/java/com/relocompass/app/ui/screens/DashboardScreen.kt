package com.relocompass.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.relocompass.app.data.SessionViewModel
import com.relocompass.app.ui.components.AppScaffold
import com.relocompass.app.ui.theme.*

@Composable
fun DashboardScreen(session: SessionViewModel, navigate: (String) -> Unit) {
    val user = session.state.collectAsState().value.user
    val firstName = user?.name?.split(" ")?.firstOrNull() ?: "there"

    AppScaffold(
        title = "ReloCompass",
        currentRoute = "dashboard",
        isEmployer = user?.role == "employer",
        onSelect = navigate,
        actions = {
            IconButton(onClick = { session.logout() }) {
                Icon(Icons.Filled.Logout, contentDescription = "Log out")
            }
        },
    ) { padding ->
        Column(
            Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(20.dp),
        ) {
            // Greeting hero
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color.Transparent,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Box(
                    Modifier
                        .background(Brush.linearGradient(listOf(Navy, Color(0xFF1D4ED8), Cyan)))
                        .padding(24.dp),
                ) {
                    Column {
                        Text(
                            "Hello, $firstName 👋",
                            color = Cream,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                        )
                        Spacer(Modifier.height(6.dp))
                        Text(
                            if (user?.role == "employer")
                                "Post jobs, review applicants, and hire international talent."
                            else
                                "Visas, housing, and jobs abroad — with an AI assistant that cites its sources.",
                            color = Cream.copy(alpha = 0.85f),
                            fontSize = 14.sp,
                        )
                    }
                }
            }

            Spacer(Modifier.height(24.dp))

            Text("Quick actions", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            Spacer(Modifier.height(12.dp))

            val cards = buildList {
                add(Action("🤖", "AI Assistant", "Ask anything about relocating — answers cite sources") { navigate("assistant") })
                add(Action("💼", "Find Jobs", "Visa-sponsorship filter, one-tap apply") { navigate("jobs") })
                add(Action("📄", "My Applications", "Track status from pending to accepted") { navigate("applications") })
                if (user?.role == "employer") {
                    add(Action("🏢", "Employer Portal", "Post jobs and manage applicants") { navigate("employer") })
                }
                add(Action("👤", "My Profile", "Update your details and relocation context") { navigate("profile") })
            }

            cards.forEach { action ->
                ActionCard(action.emoji, action.title, action.subtitle, action.onClick)
                Spacer(Modifier.height(12.dp))
            }
        }
    }
}

private data class Action(
    val emoji: String,
    val title: String,
    val subtitle: String,
    val onClick: () -> Unit,
)

@Composable
private fun ActionCard(emoji: String, title: String, subtitle: String, onClick: () -> Unit) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface,
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
    ) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(emoji, fontSize = 26.sp)
            Spacer(Modifier.width(14.dp))
            Column(Modifier.weight(1f)) {
                Text(title, fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                Text(subtitle, fontSize = 12.sp, color = Slate600)
            }
            Text("›", fontSize = 22.sp, color = Slate600)
        }
    }
}
