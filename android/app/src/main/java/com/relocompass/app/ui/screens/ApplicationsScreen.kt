package com.relocompass.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.relocompass.app.api.ApiClient
import com.relocompass.app.api.Job
import com.relocompass.app.api.Application
import com.relocompass.app.data.SessionViewModel
import com.relocompass.app.api.apiCall
import com.relocompass.app.ui.components.AppScaffold
import com.relocompass.app.ui.components.StatusPill
import com.relocompass.app.ui.theme.Slate400
import com.relocompass.app.ui.theme.Slate600
import kotlinx.coroutines.launch

@Composable
fun ApplicationsScreen(session: SessionViewModel, navigate: (String) -> Unit = { }) {
    val user = session.state.collectAsState().value.user
    val scope = rememberCoroutineScope()
    var apps by remember { mutableStateOf<List<Application>?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    // Cache job titles: fetch the board once so each application can show its title.
    var titles by remember { mutableStateOf<Map<Int, String>>(emptyMap()) }

    LaunchedEffect(Unit) {
        scope.launch {
            val result = apiCall { ApiClient.api.myApplications() }
            apps = result.getOrNull()
            error = if (apps == null) result.exceptionOrNull()?.message else null
        }
        scope.launch {
            apiCall { ApiClient.api.jobs(limit = 100) }.getOrNull()?.forEach { titles = titles + (it.id to it.title) }
        }
    }

    AppScaffold(
        title = "My Applications",
        currentRoute = "applications",
        isEmployer = user?.role == "employer",
        onSelect = navigate,
    ) { padding ->
        when {
            error != null -> Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text(error ?: "", color = MaterialTheme.colorScheme.error)
            }
            apps == null -> Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
            apps!!.isEmpty() -> Column(
                Modifier.fillMaxSize().padding(padding).padding(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                Text("📄", fontSize = 40.sp)
                Text("No applications yet", fontWeight = FontWeight.SemiBold)
                Text("Find jobs under the Jobs tab and apply with one tap.", color = Slate600, fontSize = 13.sp)
            }
            else -> LazyColumn(
                Modifier.padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                items(apps!!, key = { it.id }) { app ->
                    Surface(shape = RoundedCornerShape(16.dp)) {
                        Column(Modifier.padding(16.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    titles[app.jobId] ?: "Job #${app.jobId}",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp,
                                    modifier = Modifier.weight(1f),
                                )
                                StatusPill(app.status)
                            }
                            Text(
                                "Applied ${app.createdAt?.take(10) ?: ""}",
                                color = Slate400,
                                fontSize = 12.sp,
                            )
                            app.coverLetter?.let {
                                Spacer(Modifier.height(8.dp))
                                Text(it, fontSize = 12.sp, color = Slate600, maxLines = 3)
                            }
                        }
                    }
                }
            }
        }
    }
}
